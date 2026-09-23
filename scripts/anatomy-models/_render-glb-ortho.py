"""Render orthographic front + side of a GLB for silhouette QA.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/_render-glb-ortho.py -- \
        <in.glb> <out-prefix>
"""
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
src = os.path.abspath(argv[0])
out_prefix = os.path.abspath(argv[1])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

# World AABB
coords = []
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        mw = obj.matrix_world
        for v in obj.data.vertices:
            coords.append(mw @ v.co)
xs = [c.x for c in coords]; ys = [c.y for c in coords]; zs = [c.z for c in coords]
cx, cy, cz = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2
size = max(max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs)) * 1.25
print(f'AABB x=[{min(xs):.3f},{max(xs):.3f}] y=[{min(ys):.3f},{max(ys):.3f}] z=[{min(zs):.3f},{max(zs):.3f}]')

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.render.resolution_x = 512
scene.render.resolution_y = 640
scene.render.film_transparent = False
scene.world = bpy.data.worlds.new('W')
scene.world.color = (0.85, 0.85, 0.88)

cam_data = bpy.data.cameras.new('Cam')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = size
cam = bpy.data.objects.new('Cam', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

def shoot(name, loc, rot_euler):
    cam.location = loc
    cam.rotation_euler = rot_euler
    scene.render.filepath = f'{out_prefix}-{name}.png'
    bpy.ops.render.render(write_still=True)
    print('wrote', scene.render.filepath)

# Blender Z-up. Front looks along +Y (from -Y), side looks along +X.
shoot('front', (cx, min(ys) - size, cz), (math.radians(90), 0, 0))
shoot('side', (max(xs) + size, cy, cz), (math.radians(90), 0, math.radians(90)))
shoot('three', (cx + size*0.7, min(ys) - size*0.7, cz + size*0.15), (math.radians(78), 0, math.radians(35)))
