"""
generate-bystander.py — generate a small, low-poly bystander GLB for crowd scenes.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/generate-bystander.py -- \
        <sex: male|female> <out.glb>

Same MPFB pipeline as the patient but at a coarser macro detail setting, so the
exported mesh stays light enough to instance 12+ times on the iPad tier. No
clinical morphs are added — bystanders are static, non-interactive scenery.

Helper strip mirrors generate-mpfb-skinned.py exactly: MPFB ships joint /
clothes-fitting helper geometry alongside the body, and without the strip those
export as blocky artefacts in the crowd.
"""
import bpy, importlib, bmesh, math, os, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SEX = (argv[0] if argv else "male").lower()
OUT = argv[1] if len(argv) > 1 else f"public/models/bystander-{SEX}.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.preferences.addon_enable(module="bl_ext.blender_org.mpfb")
HumanService = importlib.import_module(
    "bl_ext.blender_org.mpfb.services.humanservice"
).HumanService
TargetService = importlib.import_module(
    "bl_ext.blender_org.mpfb.services.targetservice"
).TargetService

macro = TargetService.get_default_macro_info_dict()
macro["gender"] = 1.0 if SEX == "male" else 0.0
macro["age"] = 0.5
macro["height"] = 0.55 if SEX == "male" else 0.45
macro["muscle"] = 0.4
macro["weight"] = 0.45
macro["proportions"] = 0.5

human = HumanService.create_human(
    mask_helpers=True,
    detailed_helpers=False,
    extra_vertex_groups=True,
    feet_on_ground=True,
    scale=0.1,
    macro_detail_dict=macro,
)
print("human created:", human.name, "verts", len(human.data.vertices))

# --- Helper strip (mirrors generate-mpfb-skinned.py) ---------------------------
mask = next((m for m in human.modifiers if m.type == 'MASK'), None)
vg = human.vertex_groups.get(mask.vertex_group) if mask else None
keep = set()
if vg:
    gi = vg.index
    for v in human.data.vertices:
        if any(g.group == gi for g in v.groups):
            keep.add(v.index)
if mask:
    human.modifiers.remove(mask)
bpy.ops.object.select_all(action='DESELECT')
human.select_set(True)
bpy.context.view_layer.objects.active = human
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(human.data)
bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in keep], context='VERTS')
bmesh.update_edit_mesh(human.data)
bpy.ops.object.mode_set(mode='OBJECT')
print("verts after helper strip:", len(human.data.vertices))

# --- Normalise height ---------------------------------------------------------
# create_human's height macro lands the figure anywhere between ~1.3 m and
# ~2.4 m depending on the build, and the app's patient pipeline already owns
# scaling (BodyMesh computes patientScale = patientHeight / 1.8). A bystander
# GLB that ships at 2.4 m renders as a giant behind the stretcher, so bake a
# sane adult height into the export and let the crowd layout own spacing.
bpy.context.view_layer.update()
zs = [(human.matrix_world @ v.co).z for v in human.data.vertices]
height_now = max(zs) - min(zs)
TARGET_HEIGHT = 1.72
if height_now > 1e-6:
    factor = TARGET_HEIGHT / height_now
    human.scale = (human.scale[0] * factor, human.scale[1] * factor, human.scale[2] * factor)
    # Bake the scale into the mesh. Assigning .scale and calling
    # view_layer.update() is NOT enough: the glTF exporter reads the object's
    # own matrix, and without transform_apply the exported GLB kept the
    # pre-scale height (measured 2.465 m for a target of 1.72 m).
    bpy.ops.object.select_all(action='DESELECT')
    human.select_set(True)
    bpy.context.view_layer.objects.active = human
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.context.view_layer.update()
    zs2 = [(human.matrix_world @ v.co).z for v in human.data.vertices]
    print(f"height {height_now:.3f} m -> scaled x{factor:.4f}; verified {max(zs2)-min(zs2):.3f} m")

# --- Strip MPFB shape keys FIRST ---------------------------------------------
# Removing Basis while other keys exist re-seats the mesh onto another key and
# silently undoes any vertex edits. Bystanders are static scenery — no morphs.
if human.data.shape_keys:
    for key in list(human.data.shape_keys.key_blocks):
        human.shape_key_remove(key)
    print("stripped shape keys")

# --- Relaxed standing arms (kill the zombie reach) ---------------------------
# MPFB create_human() here is an unskinned mesh whose arms hang at hip height
# but thrust forward and outboard (hands at x≈±0.5, y≈-0.27) — the classic
# zombie scarecrow. Pull each arm into a natural standing hang beside the
# thighs: laterals compress toward the ribs, the forward reach collapses to
# y≈0, vertical hang is kept. Geometry-only — run BEFORE decimate.
import mathutils

def _pose_relaxed_arms(mesh_obj):
    me = mesh_obj.data
    coords = [v.co for v in me.vertices]
    if not coords:
        return False
    xs = [c.x for c in coords]
    zs = [c.z for c in coords]
    min_z, max_z = min(zs), max(zs)
    height = max_z - min_z
    if height < 1e-6:
        return False
    # Torso half-width at chest (z@0.80). Arms live outboard of this.
    chest_z = min_z + height * 0.80
    torso_band = [c.x for c in coords if abs(c.z - chest_z) < height * 0.03]
    torso_half = max((abs(x) for x in torso_band), default=0.18)
    shoulder_x = torso_half * 0.95
    # Hand extremes define the reach we are correcting.
    hand_x = max(abs(x) for x in xs)
    if hand_x <= shoulder_x + 0.05:
        print('WARN: arms already tucked — leaving pose as-is')
        return False
    # Lateral keep-factor and forward-kill. Hands end ~0.28 from midline.
    X_KEEP = 0.32
    Y_KEEP = 0.12
    posed = 0
    for v in me.vertices:
        ax = abs(v.co.x)
        if ax < shoulder_x:
            continue
        if v.co.z < min_z + height * 0.35 or v.co.z > min_z + height * 0.95:
            continue  # not an arm/hand band
        # Compress outboard distance relative to the shoulder, not the origin,
        # so the deltoid stays put and only the reach collapses.
        reach = ax - shoulder_x
        v.co.x = math.copysign(shoulder_x + reach * X_KEEP, v.co.x)
        # Kill the zombie forward thrust; keep a whisper of natural swing.
        v.co.y = v.co.y * Y_KEEP + 0.01
        posed += 1
    me.update()
    print(f'relaxed arms: posed={posed} shoulder_x={shoulder_x:.3f} '
          f'hand_x {hand_x:.3f} -> {shoulder_x + (hand_x - shoulder_x) * X_KEEP:.3f}')
    return True

_pose_relaxed_arms(human)

# --- Decimate to crowd density -----------------------------------------------
# A bystander is scenery: 12 instances at 1.5k verts each is ~18k verts, which
# the iPad tier can carry. The raw MPFB body is 13k verts — fine for one
# patient, wasteful for a dozen. Collapse to a fixed ratio and cap the result.
TARGET_VERTS = 1500
ratio = min(1.0, TARGET_VERTS / max(1, len(human.data.vertices)))
if ratio < 1.0:
    bpy.ops.object.modifier_add(type='DECIMATE')
    dec = human.modifiers[-1]
    dec.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=dec.name)
    print(f"decimated ratio={ratio:.3f} -> {len(human.data.vertices)} verts")

# --- Plain neutral material. Bystanders are scenery, not clinical surfaces. ---
mat = bpy.data.materials.new(f'bystander_{SEX}')
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.55, 0.52, 0.48, 1.0)
bsdf.inputs['Roughness'].default_value = 0.85
bsdf.inputs['Metallic'].default_value = 0.0
nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
human.data.materials.clear()
human.data.materials.append(mat)

human.name = "Bystander"
human.data.name = "Bystander"

# Sanity: local AABB must match the 1.72 m target and tucked hands.
loc = [v.co for v in human.data.vertices]
print(f"local AABB x=[{min(c.x for c in loc):.3f},{max(c.x for c in loc):.3f}] "
      f"y=[{min(c.y for c in loc):.3f},{max(c.y for c in loc):.3f}] "
      f"z=[{min(c.z for c in loc):.3f},{max(c.z for c in loc):.3f}]")

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True,
                          export_apply=True, use_selection=False,
                          export_image_format="AUTO")
print("EXPORTED", OUT)
print(f"bystander height={human.dimensions.z:.3f}m verts={len(human.data.vertices)}")