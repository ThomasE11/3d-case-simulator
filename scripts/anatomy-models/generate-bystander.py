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
import bpy, importlib, bmesh, os, sys

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
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.context.view_layer.update()
    zs2 = [(human.matrix_world @ v.co).z for v in human.data.vertices]
    print(f"height {height_now:.3f} m -> scaled x{factor:.4f}; verified {max(zs2)-min(zs2):.3f} m")

# --- Decimate to crowd density -----------------------------------------------
# A bystander is scenery: 12 instances at 1.5k verts each is ~18k verts, which
# the iPad tier can carry. The raw MPFB body is 13k verts — fine for one
# patient, wasteful for a dozen. Collapse to a fixed ratio and cap the result.
#
# MPFB ships shape keys on the basemesh; modifier_apply refuses them, so strip
# them first. Bystanders are static scenery — no morphs to preserve.
if human.data.shape_keys:
    for key in list(human.data.shape_keys.key_blocks):
        human.shape_key_remove(key)
    print("stripped shape keys")

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

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True,
                          export_apply=False, use_selection=False,
                          export_image_format="AUTO")
print("EXPORTED", OUT)
print(f"bystander height={human.dimensions.z:.3f}m verts={len(human.data.vertices)}")