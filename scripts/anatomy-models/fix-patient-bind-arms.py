"""Tuck patient bind-pose arms so they hang beside the body (not A-pose / backwards).

The Mixamo/Mpfb bind pose leaves upper arms abducted and forearms slightly
forward. Runtime rest corrections have to fight that every frame, and the
paediatric meshes under-corrected. Bake a relaxed hang into the BIND pose of
each shipped patient GLB so every age band starts correct.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/fix-patient-bind-arms.py -- \
        public/models/patient-male.glb /tmp/patient-male-fixed.glb
"""
from __future__ import annotations

import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1:]
if len(argv) != 2:
    raise SystemExit('usage: fix-patient-bind-arms.py <in.glb> <out.glb>')

SRC = os.path.abspath(argv[0])
OUT = os.path.abspath(argv[1])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)


def find_armature():
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            return obj
    for obj in bpy.context.scene.objects:
        for mod in obj.modifiers:
            if mod.type == 'ARMATURE' and mod.object:
                return mod.object
    return None


arm = find_armature()
if arm is None:
    raise RuntimeError(f'{SRC} has no armature')

# Reset any leftover action to rest.
if arm.animation_data:
    arm.animation_data.action = None


def bone(*names):
    for n in names:
        pb = arm.pose.bones.get(n)
        if pb:
            return pb
    return None


left_up = bone('mixamorig:LeftArm', 'LeftArm', 'upper_arm.L', 'Arm.L')
left_fore = bone('mixamorig:LeftForeArm', 'LeftForeArm', 'forearm.L', 'ForeArm.L')
left_hand = bone('mixamorig:LeftHand', 'LeftHand', 'hand.L', 'Hand.L')
right_up = bone('mixamorig:RightArm', 'RightArm', 'upper_arm.R', 'Arm.R')
right_fore = bone('mixamorig:RightForeArm', 'RightForeArm', 'forearm.R', 'ForeArm.R')
right_hand = bone('mixamorig:RightHand', 'RightHand', 'hand.R', 'Hand.R')
if not (left_up and right_up and left_fore and right_fore):
    names = [b.name for b in arm.pose.bones]
    raise RuntimeError(f'arm bones missing; have {names[:40]}')

for pb in arm.pose.bones:
    pb.rotation_mode = 'XYZ'
    pb.matrix_basis.identity()

# Mixamo arms: local Z adducts toward the ribs; local X drops them from the
# A-pose reach. Runtime uses the same two knobs (patientUprightArmAdduction /
# patientArmRestRadians) — bake the adult standing values so bind starts clean.
UP_ADDUCT = 0.55        # close the A-pose
UP_FLEX = 0.42          # slight forward hang (not reach, not hyperextend back)
ELBOW = 0.38            # soft elbow so the forearm is not a plank
WRIST = 0.1

left_up.rotation_euler = (UP_FLEX, 0.0, -UP_ADDUCT)
right_up.rotation_euler = (UP_FLEX, 0.0, UP_ADDUCT)
left_fore.rotation_euler = (ELBOW, 0.1, 0.0)
right_fore.rotation_euler = (ELBOW, -0.1, 0.0)
if left_hand:
    left_hand.rotation_euler = (WRIST, 0, 0.08)
if right_hand:
    right_hand.rotation_euler = (WRIST, 0, -0.08)

bpy.context.view_layer.update()

# Bake pose into the rest pose (armature) so every consumer starts from hang.
# Headless poll() fails unless the armature is the active object in Pose mode.
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
try:
    bpy.ops.pose.armature_apply(selected=False)
    print('[bind-arms] pose baked into rest')
except Exception as exc:  # noqa: BLE001
    print('[bind-arms] pose.armature_apply failed:', exc)
    # Manual rest-pose bake: copy pose-bone matrices into edit bones.
    bpy.ops.object.mode_set(mode='EDIT')
    for pb in arm.pose.bones:
        eb = arm.data.edit_bones.get(pb.name)
        if not eb:
            continue
        # Rest head/tail from the posed matrix so the hang becomes the bind.
        mat = arm.matrix_world @ pb.matrix
        # Keep bone length; just reorient using pose matrix.
        length = (eb.tail - eb.head).length
        head = mat.translation.copy()
        # Prefer the bone's local Y as the bone axis (Mixamo).
        axis = mat.to_3x3() @ __import__('mathutils').Vector((0, 1, 0))
        if axis.length < 1e-6:
            axis = __import__('mathutils').Vector((0, 0, 1))
        axis.normalize()
        eb.head = head
        eb.tail = head + axis * length
    bpy.ops.object.mode_set(mode='OBJECT')
    print('[bind-arms] manual rest bake done')
else:
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.update()

# Keep RUNTIME_CLIPS — walk/idle/gesture are load-bearing for ambulatory
# patients. Only drop unused exploratory actions.
RUNTIME = {'idle', 'walk', 'agree', 'headShake', 'sad_pose'}
for action in list(bpy.data.actions):
    if action.name not in RUNTIME:
        bpy.data.actions.remove(action)

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format='GLB',
    export_yup=True,
    export_apply=True,
    use_selection=False,
    export_animations=True,
    export_image_format='AUTO',
)
print('EXPORTED', OUT, 'from', SRC)
print('actions', [a.name for a in bpy.data.actions])
