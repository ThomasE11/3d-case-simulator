"""
blender-garment-bake.py — author clothing GLBs FROM the patient body mesh,
headless via Blender, with the body's morph targets baked into the garment.

    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/blender-garment-bake.py -- \
        public/models/patient-male.glb public/models/ [variant]

Why author from the body (not model garments standalone):
  The runtime patient GLBs carry a skeleton plus clinical and posture morphs.
  A standalone garment has different topology, so this script duplicates the
  current body mesh before masking it to garment regions. Every garment vertex
  therefore keeps the body's shape-key deltas verbatim. Runtime code syncs
  morphs by name and remaps the preserved bone weights by bone name, letting
  these clean authored pieces follow skeletal animation and morph deformation.

Output:
    public/models/garment-shirt.glb
    public/models/garment-trousers.glb

Passing `female` as the optional variant writes garment-shirt-female.glb and
garment-trousers-female.glb so sex-matched body topology is never mixed with
the male garment shell at runtime.

Notes / deliberate simplifications:
  - Cloth SIMULATION is not run. Headless cloth sim on a masked body-derived
    shell is slow and non-deterministic across Blender builds, and needs a
    collision body + baked cache to look right. Shrinkwrap-clearance (offset
    along normals) + manual solidify (a back shell) gives stable, repeatable
    fabric thickness with the body's silhouette. Upgrade path: add a cloth
    modifier + collision on the body and bake a cache if drape/folds matter.
  - Modifiers can't be applied to a mesh that has shape keys, so the cloth
    clearance and thickness are done by direct vertex math (same technique as
    add-clinical-morphs.py), which preserves the shape keys.
"""
import bpy, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
SRC = argv[0] if argv else "public/models/patient.glb"
OUT_DIR = argv[1] if len(argv) > 1 else "public/models/"
VARIANT = argv[2].strip("-") if len(argv) > 2 else ""

# Cloth clearance off the skin (metres) and fabric thickness (metres).
# Clearance lifts the outer face just off the skin so it never z-fights;
# the shirt rides a touch prouder than trousers so a tucked waistband layers.
SHIRT_CLEARANCE = 0.010
TROUSER_CLEARANCE = 0.010
FABRIC_THICKNESS = 0.004

# Garment regions as FRACTIONS of mesh height (Blender Z-up: feet=0, head=1),
# matching ClothingLayer.tsx's anthropometric cut lines. Arms are excluded
# LATERALLY (this model holds a wide A-pose), everything else by height band.
#   shirt:    hem  -> shoulder cap, short sleeves bounded by |x|
#   trousers: cuff -> waistband
# The resp-001 tripod profile uses a deliberately higher, clean hem. The
# generic 0.522 cut includes pelvic bridge triangles from the source skin;
# once the patient flexes at the hips those triangles form the false V-shaped
# shirt flap reported in visual QA. A 0.530 cut gives the seated profile a
# genuine garment overlap with the waistband (rather than a runtime stretch)
# while stopping short of the generic 0.522 pelvic bridge.
SHIRT_HEM = 0.530 if VARIANT == "resp001" else 0.522
# The cap must sit above the full shoulder girdle. Cutting it at 0.844 ran
# through the deltoid/trapezius triangles; once the arms came down from the
# authored A-pose, the open boundary looked like a torn, saw-toothed shirt.
# A shallow crew neck then removes only the throat opening while leaving an
# unbroken shoulder shell, as a real T-shirt would.
SHIRT_CAP = 0.902
SHIRT_SCOOP_BOTTOM = 0.835     # deepest point of the curved crew-neck opening
SHIRT_SCOOP_HALF_W = 0.180     # scaled by height/1.8 below
TORSO_HALF_W = 0.215           # torso shell before the shoulder axis starts
SHOULDER_X = 0.19              # upper-arm origin in normalised body metres
SHOULDER_Z = 0.82              # body-height fraction
SLEEVE_LENGTH = 0.21           # distance projected down the upper-arm axis
TROUSER_CUFF = 0.10
TROUSER_WAISTBAND = 0.539


def find_body(SKIN_MESH=None):
    junk = bpy.data.objects.get("Icosphere")
    if junk:
        bpy.data.objects.remove(junk, do_unlink=True)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    if SKIN_MESH:
        return bpy.data.objects.get(SKIN_MESH)
    # Body = mesh with the most vertices (eyes/iris are tiny).
    return max(meshes, key=lambda o: len(o.data.vertices)) if meshes else None


def measure(mesh):
    zs = [v.co.z for v in mesh.vertices]
    z_min, z_max = min(zs), max(zs)
    return z_min, z_max, (z_max - z_min)


def keep_shirt(co, z_min, H, half_scale, scoop_half_local):
    zf = (co.z - z_min) / H
    if not SHIRT_HEM <= zf <= SHIRT_CAP:
        return False
    # Curved scoop follows the clavicles. The old fixed-height rectangular cut
    # left a visibly stepped, torn-looking collar in the exam close-up.
    normalised_x = abs(co.x) / scoop_half_local
    if normalised_x < 1.0:
        neckline = SHIRT_SCOOP_BOTTOM + (SHIRT_CAP - SHIRT_SCOOP_BOTTOM) * normalised_x ** 2
        if zf > neckline:
            return False
    torso_half = TORSO_HALF_W * half_scale
    if abs(co.x) <= torso_half:
        return True
    # Cut the cuff perpendicular to the A-pose upper-arm axis. The old
    # vertical x-plane became a pointed/torn-looking sleeve after the arms
    # morphed into the tripod brace.
    shoulder_x = SHOULDER_X * half_scale
    shoulder_z = z_min + SHOULDER_Z * H
    along_arm = (abs(co.x) - shoulder_x) * 0.62 + (shoulder_z - co.z) * 0.78
    return zf >= 0.66 and along_arm <= SLEEVE_LENGTH * half_scale


def keep_trouser(co, z_min, H):
    zf = (co.z - z_min) / H
    return TROUSER_CUFF <= zf <= TROUSER_WAISTBAND


def mask_and_offset(body, name, keep_fn, clearance, out_path):
    """Extract a garment by original body index, preserve keys and skinning,
    offset every morph for cloth clearance, then export the rigged GLB."""
    source_mesh = body.data
    z_min, z_max, H = measure(source_mesh)
    scale = body.matrix_world.to_scale().x or 1.0
    half_scale = H / 1.8
    scoop_half_local = SHIRT_SCOOP_HALF_W * half_scale

    # Which verts to KEEP (garment region).
    keep = [keep_fn(v.co) for v in source_mesh.vertices]
    n_keep = sum(keep)
    print(f"[{name}] verts={len(source_mesh.vertices)} keep={n_keep} scale={scale:.4f} H={H:.3f}")
    if n_keep < 50:
        print(f"[{name}] ERROR: too few garment verts ({n_keep})")
        return False

    # Build the garment explicitly from original body indices. Deleting verts
    # from a shape-key mesh through bmesh can silently remap key-block rows,
    # which made pose_seated pull random trouser triangles across the legs.
    # Explicit old-index -> new-index copying preserves every morph exactly.
    candidate_faces = [
        tuple(poly.vertices)
        for poly in source_mesh.polygons
        if all(keep[index] for index in poly.vertices)
    ]
    parent = list(range(len(source_mesh.vertices)))

    def find(index):
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    active = set()
    for face in candidate_faces:
        active.update(face)
        for index in face[1:]:
            union(face[0], index)
    # Draco/UV seams duplicate vertices at the same physical position. Weld
    # those duplicates for component detection only; otherwise a narrow front
    # trouser strip can be mistaken for a separate island and deleted, leaving
    # a skin-coloured line down the shin even though the cloth fits correctly.
    coincident = {}
    for index in active:
        coordinate = source_mesh.vertices[index].co
        key = (
            round(coordinate.x, 5),
            round(coordinate.y, 5),
            round(coordinate.z, 5),
        )
        first = coincident.get(key)
        if first is None:
            coincident[key] = index
        else:
            union(first, index)
    sizes = {}
    for index in active:
        root = find(index)
        sizes[root] = sizes.get(root, 0) + 1
    if not sizes:
        print(f"[{name}] ERROR: no garment faces after cut")
        return False
    best_root = max(sizes, key=sizes.get)
    source_indices = sorted(index for index in active if find(index) == best_root)
    source_index_set = set(source_indices)
    source_faces = [face for face in candidate_faces if all(index in source_index_set for index in face)]
    if len(source_indices) < 30 or len(source_faces) < 10:
        print(f"[{name}] ERROR: empty after component filter")
        return False

    # Snap only the open crew-neck boundary to the authored parabola. Triangle
    # masking necessarily picks the last complete row *below* the mathematical
    # cut; without this correction that row stair-steps around the throat at
    # exam distance. The same small basis delta is copied into every shape key
    # below, preserving breathing/posture deformation while giving the shirt a
    # clean, intentional neckline.
    edge_counts = {}
    for face in source_faces:
        for corner in range(len(face)):
            edge = tuple(sorted((face[corner], face[(corner + 1) % len(face)])))
            edge_counts[edge] = edge_counts.get(edge, 0) + 1
    boundary_sources = {
        index
        for edge, count in edge_counts.items()
        if count == 1
        for index in edge
    }
    basis_adjustment_z = {}
    if name == "garment-shirt":
        for source_index in boundary_sources:
            co = source_mesh.vertices[source_index].co
            normalised_x = abs(co.x) / scoop_half_local
            zf = (co.z - z_min) / H
            # The final complete triangle row is naturally jagged because the
            # skin mesh is triangulated at the pelvis. Project only the lower
            # torso boundary onto the authored hem plane, then copy that same
            # delta into every shape key. This leaves sleeves and the collar
            # untouched while preventing a saw-tooth (or a pointed flap) as
            # the patient leans into the resp-001 tripod pose.
            torso_half = TORSO_HALF_W * half_scale
            if zf <= SHIRT_HEM + 0.04 and abs(co.x) <= torso_half * 1.12:
                hem_z = z_min + SHIRT_HEM * H
                adjustment = hem_z - co.z
                if -0.04 * H <= adjustment <= 0.006 * H:
                    basis_adjustment_z[source_index] = adjustment
                continue
            # The front of this imported body faces Blender -Y. Do not project
            # the posterior collar: UV seams there also look like boundaries
            # topologically and stretching them produces shoulder spikes.
            if co.y >= -0.015 or normalised_x > 1.0 or zf < SHIRT_SCOOP_BOTTOM - 0.035:
                continue
            neckline_zf = SHIRT_SCOOP_BOTTOM + (SHIRT_CAP - SHIRT_SCOOP_BOTTOM) * normalised_x ** 2
            adjustment = z_min + neckline_zf * H - co.z
            if -0.005 * H <= adjustment <= 0.035 * H:
                basis_adjustment_z[source_index] = adjustment

    remap = {source_index: new_index for new_index, source_index in enumerate(source_indices)}
    basis_coords = []
    for source_index in source_indices:
        co = source_mesh.vertices[source_index].co.copy()
        co.z += basis_adjustment_z.get(source_index, 0.0)
        basis_coords.append(co)
    mesh = bpy.data.meshes.new(f"{name}-mesh")
    mesh.from_pydata(
        basis_coords,
        [],
        [[remap[index] for index in face] for face in source_faces],
    )
    # from_pydata defaults every polygon to flat shading. The exporter then
    # duplicates vertices per triangle; offsetting those split vertices along
    # face normals opens visible wire-like cracks. Clothing is a continuous
    # surface, so preserve shared smooth normals across each garment piece.
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.update()
    g = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(g)
    g.parent = body.parent
    g.matrix_world = body.matrix_world.copy()

    # Preserve exact Blender vertex-group weights. Exporting the armature with
    # the garment keeps JOINTS_0/WEIGHTS_0 so runtime only remaps bone names.
    group_map = {group.index: g.vertex_groups.new(name=group.name) for group in body.vertex_groups}
    for new_index, source_index in enumerate(source_indices):
        for membership in source_mesh.vertices[source_index].groups:
            group = group_map.get(membership.group)
            if group:
                group.add([new_index], membership.weight, 'REPLACE')
    for source_modifier in body.modifiers:
        if source_modifier.type != 'ARMATURE':
            continue
        modifier = g.modifiers.new(name=source_modifier.name, type='ARMATURE')
        modifier.object = source_modifier.object
        modifier.use_deform_preserve_volume = source_modifier.use_deform_preserve_volume

    # Rebuild every shape key by the same source index. This includes posture,
    # breathing, findings, viseme and condition-motion channels.
    if source_mesh.shape_keys:
        for source_key in source_mesh.shape_keys.key_blocks:
            target_key = g.shape_key_add(name=source_key.name, from_mix=False)
            target_key.slider_min = source_key.slider_min
            target_key.slider_max = source_key.slider_max
            for new_index, source_index in enumerate(source_indices):
                co = source_key.data[source_index].co.copy()
                co.z += basis_adjustment_z.get(source_index, 0.0)
                target_key.data[new_index].co = co

    # Offset every key along THAT DEFORMED SURFACE'S smooth normals. Reusing
    # standing normals for pose_seated points the knee clearance sideways and
    # lets skin cut through the trousers. Per-key normals keep the garment
    # outside the patient through seated, supine, recovery and motion morphs.
    clearance_local = clearance / scale

    def smooth_normals(coords):
        normals = [Vector((0.0, 0.0, 0.0)) for _ in coords]
        for polygon in mesh.polygons:
            vertices = list(polygon.vertices)
            for corner in range(1, len(vertices) - 1):
                ia, ib, ic = vertices[0], vertices[corner], vertices[corner + 1]
                face_normal = (coords[ib] - coords[ia]).cross(coords[ic] - coords[ia])
                normals[ia] += face_normal
                normals[ib] += face_normal
                normals[ic] += face_normal
        for index, normal in enumerate(normals):
            if normal.length_squared > 1e-12:
                normals[index] = normal.normalized()
        return normals

    if mesh.shape_keys:
        for kb in mesh.shape_keys.key_blocks:
            coords = [point.co.copy() for point in kb.data]
            normals = smooth_normals(coords)
            for i in range(len(kb.data)):
                kb.data[i].co = coords[i] + normals[i] * clearance_local
    else:
        coords = [vertex.co.copy() for vertex in mesh.vertices]
        normals = smooth_normals(coords)
        for i, v in enumerate(mesh.vertices):
            v.co = coords[i] + normals[i] * clearance_local

    # Fabric thickness: a back shell. Solidify modifier is blocked with shape
    # keys, so extrude the boundary + build an inner offset shell manually is
    # overkill — instead we render the outer face + a BackSide inner face in
    # the app (ClothingLayer already does this). Here we only need a single
    # surface with correct clearance; thickness is a runtime material trick.
    # ponytail: single-surface garment, app draws the dark inner face. Add a
    # real solidified shell here only if the open edges need geometric depth.

    # Split by loose parts? No — each garment file is ONE named piece already.
    # Export just this object.
    export_single(g, out_path)
    print(f"[{name}] EXPORTED {out_path} verts={len(mesh.vertices)}")
    bpy.data.objects.remove(g, do_unlink=True)
    return True


def export_single(obj, out_path):
    # Drop the inherited skin material + its 2048² atlas — a garment is a flat
    # fabric coloured in the app (like the procedural layer). Keeping it makes
    # a ~2k-vert mesh a 4.8MB file. Also clear UVs so no texture is referenced.
    obj.data.materials.clear()
    while obj.data.uv_layers:
        obj.data.uv_layers.remove(obj.data.uv_layers[0])
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    # Keep the armature in the garment GLB so JOINTS_0 / WEIGHTS_0 survive the
    # export. The app remaps this source skeleton by bone name onto the active
    # patient skeleton, then discards the garment's duplicate rig.
    armature = obj.find_armature()
    if armature:
        armature.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_morph=True,
        export_morph_normal=False,
        export_skins=True,
        export_animations=False,
        export_yup=True,
        export_materials='NONE',
    )


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    body = find_body()
    if not body:
        print("ERROR: body mesh not found")
        sys.exit(1)
    mesh = body.data
    names = [kb.name for kb in mesh.shape_keys.key_blocks] if mesh.shape_keys else []
    print(f"body='{body.name}' verts={len(mesh.vertices)} shape_keys={names}")

    z_min, z_max, H = measure(mesh)
    half_scale = H / 1.8
    scoop_half_local = SHIRT_SCOOP_HALF_W * half_scale

    os.makedirs(OUT_DIR, exist_ok=True)
    suffix = f"-{VARIANT}" if VARIANT else ""
    shirt_path = os.path.join(OUT_DIR, f"garment-shirt{suffix}.glb")
    trouser_path = os.path.join(OUT_DIR, f"garment-trousers{suffix}.glb")

    ok_shirt = mask_and_offset(
        body, "garment-shirt",
        lambda co: keep_shirt(co, z_min, H, half_scale, scoop_half_local),
        SHIRT_CLEARANCE, shirt_path,
    )
    # The resp-001 profile owns only a corrected shirt. Its trousers have a
    # separate medial-thigh calibration and must not be overwritten by this
    # generic body-shell bake.
    ok_trouser = True if VARIANT == "resp001" else mask_and_offset(
        body, "garment-trousers",
        lambda co: keep_trouser(co, z_min, H),
        TROUSER_CLEARANCE, trouser_path,
    )

    if not (ok_shirt and ok_trouser):
        print("ERROR: one or more garments failed to export")
        sys.exit(1)
    print(f"DONE: garment-shirt{suffix}.glb + garment-trousers{suffix}.glb")


main()
