"""Build the resp-001-only, skinned eyelid attachment.

This does not alter the patient GLB.  The source patient has two true holes at
the palpebral openings: a texture swap cannot close them because there are no
faces across either boundary.  This script derives four thin panels (upper and
lower for each eye) from those real boundary rails.  The attachment is exported
without a material or image; the runtime deliberately assigns the active body
skin material/maps after remapping this file's skeleton by bone name.

Usage (the Blender bundle needs PYTHONHOME in this local installation):

  PYTHONHOME=/Applications/Blender.app/Contents/Resources/5.1/python \\
    /Applications/Blender.app/Contents/MacOS/Blender --background --python \\
    scripts/anatomy-models/build-resp001-eyelids.py

Output: public/models/resp001-eyelids.glb
"""

import json
import math
import os
import sys
from array import array
from collections import Counter

import bpy
from mathutils import Vector


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SOURCE = os.path.join(ROOT, 'public/models/patient-male.glb')
OUTPUT = os.path.join(ROOT, 'public/models/resp001-eyelids.glb')

PANEL_COLUMNS = 11
RIM_DEDUPE_EPSILON = 1e-5
PANEL_EDGE_CLEARANCE = 0.00045  # 0.45 mm proud of the local facial rim
# The authored palpebral rim is a physical aperture, not a perfectly planar
# rectangle. Give the closed panel a restrained 1.5 mm lateral overlap at each
# canthus so the outer iris sample remains covered while the open state still
# follows the real socket rather than becoming a cartoon visor.
PANEL_SIDE_OVERLAP = 0.0015
CORNEAL_CLEARANCE = 0.00045     # 0.45 mm in front of the sclera front pole
ATLAS_PIXELS = {}


def fail(message):
    raise RuntimeError(message)


def find_body():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    if not meshes:
        fail('source GLB contains no meshes')
    body = next((obj for obj in meshes if obj.name == 'Patient'), None)
    return body or max(meshes, key=lambda obj: len(obj.data.vertices))


def body_local_point(body, world_point):
    return body.matrix_world.inverted_safe() @ world_point


def body_local_eye_front(body, eye):
    """The most facial point of sclera, iris *or pupil* in body local space."""
    front = math.inf
    for object_ in [eye, *eye.children_recursive]:
        if object_.type != 'MESH':
            continue
        matrix = body.matrix_world.inverted_safe() @ object_.matrix_world
        front = min(front, *[(matrix @ vertex.co).y for vertex in object_.data.vertices])
    if not math.isfinite(front):
        fail(f'{eye.name}: no eye/iris/pupil mesh vertices')
    return front


def source_uv_by_vertex(mesh):
    """Pick one stable UV per source vertex (UV seams may duplicate it)."""
    if not mesh.uv_layers.active:
        fail('patient body has no active UV layer')
    uv = mesh.uv_layers.active.data
    selected = {}
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            selected.setdefault(vertex_index, uv[loop_index].uv.copy())
    return selected


def source_skin_image(body):
    """Return the imported source atlas solely for UV safety checks.

    It is never assigned to, or embedded in, the attachment export.
    """
    material = body.data.materials[0] if body.data.materials else None
    nodes = material.node_tree.nodes if material and material.use_nodes else []
    image_node = next((node for node in nodes if node.type == 'TEX_IMAGE' and node.image), None)
    if image_node is None:
        fail('patient skin atlas is unavailable for eyelid UV validation')
    return image_node.image


def atlas_colour(image, uv):
    width, height = image.size
    key = image.as_pointer()
    pixels = ATLAS_PIXELS.get(key)
    if pixels is None:
        pixels = array('f', [0.0]) * (width * height * 4)
        image.pixels.foreach_get(pixels)
        ATLAS_PIXELS[key] = pixels
    x = min(width - 1, max(0, round(uv.x * (width - 1))))
    y = min(height - 1, max(0, round(uv.y * (height - 1))))
    offset = (y * width + x) * 4
    return tuple(pixels[offset + channel] for channel in range(3))


def valid_facial_skin_sample(colour):
    """Reject the red socket convention and atlas voids, not normal warm skin."""
    red, green, blue = colour
    strong_socket_red = red > 0.55 and red > green * 1.55 and red > blue * 1.55
    nearly_black = max(colour) < 0.10
    return not strong_socket_red and not nearly_black


def uv_triangle_area(a, b, c):
    return abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) * 0.5


def choose_continuous_chart_patch(mesh, centre, upper, rim_indices, skin_image):
    """Find one exterior source-face chart for a whole upper/lower panel.

    An eyelid panel needs real 2D texture area. Selecting one UV for every
    vertical row collapsed all exported triangles to a line, while blending
    nearby source UVs could cross a seam.  A small affine rectangle centred
    inside one validated source triangle is continuous by construction. With
    PATCH_SCALE=.25, every patch corner remains inside that source triangle.
    """
    desired = 1 if upper else -1
    best = None
    for polygon in mesh.polygons:
        indices = list(polygon.vertices)
        if len(indices) != 3 or any(index in rim_indices for index in indices):
            continue
        if polygon.normal.y >= -0.10:
            continue
        point = sum((mesh.vertices[index].co for index in indices), Vector()) / 3
        vertical = (point.z - centre.z) * desired
        if vertical < 0.002 or abs(point.x - centre.x) > 0.018 or (point - centre).length > 0.035:
            continue
        uvs = [mesh.uv_layers.active.data[loop_index].uv.copy() for loop_index in polygon.loop_indices]
        if uv_triangle_area(*uvs) < 1e-6 or not all(valid_facial_skin_sample(atlas_colour(skin_image, uv)) for uv in uvs):
            continue
        uv_centre = sum(uvs, Vector((0.0, 0.0))) / 3
        vector_u = (uvs[0] - uv_centre) * 0.25
        vector_v = (uvs[1] - uv_centre) * 0.25
        # 3×3 representative interior samples complement the mathematical
        # in-triangle construction; this deliberately does not claim to sample
        # every texel the GPU will interpolate.
        interior = [
            uv_centre + (x - 0.5) * vector_u + (y - 0.5) * vector_v
            for x in (0.1, 0.5, 0.9) for y in (0.1, 0.5, 0.9)
        ]
        if not all(valid_facial_skin_sample(atlas_colour(skin_image, uv)) for uv in interior):
            continue
        score = abs(point.x - centre.x) + abs(vertical - 0.007)
        candidate = {
            'face': polygon.index,
            'centre': uv_centre,
            'u': vector_u,
            'v': vector_v,
            'sample_colours': [atlas_colour(skin_image, uv) for uv in interior],
            'score': score,
        }
        if best is None or candidate['score'] < best['score']:
            best = candidate
    if best is None:
        location = 'upper' if upper else 'lower'
        fail(f'no valid continuous {location} facial UV chart near aperture')
    return best


def patch_uv(chart, horizontal, vertical):
    return chart['centre'] + (horizontal - 0.5) * chart['u'] + (vertical - 0.5) * chart['v']


def boundary_edges(mesh):
    counts = Counter()
    for polygon in mesh.polygons:
        vertices = list(polygon.vertices)
        for index, a in enumerate(vertices):
            b = vertices[(index + 1) % len(vertices)]
            counts[tuple(sorted((a, b)))] += 1
    return [edge for edge, count in counts.items() if count == 1]


def deduped_eye_rim(body, mesh, eye, all_boundary_edges, uv_by_vertex):
    """Return one physical palpebral loop, not duplicated UV-seam vertices."""
    eye_centre = body_local_point(body, eye.matrix_world.translation)
    candidate_indices = set()
    for a, b in all_boundary_edges:
        for index in (a, b):
            point = mesh.vertices[index].co
            # The eye openings are compact; this excludes mouth, neck and mesh
            # seams while retaining both rails at the medial/lateral canthi.
            if (point - eye_centre).length < 0.034:
                candidate_indices.add(index)
    if len(candidate_indices) < 12:
        fail(f'{eye.name}: only {len(candidate_indices)} boundary vertices near eye')

    deduped = {}
    for index in candidate_indices:
        point = mesh.vertices[index].co
        key = tuple(round(component / RIM_DEDUPE_EPSILON) for component in point)
        # Preserve one original index so every derived panel vertex can inherit
        # an actual source weight and all clinical morph deltas.
        deduped.setdefault(key, index)
    ring = [
        {
            'index': index,
            'co': mesh.vertices[index].co.copy(),
            'uv': uv_by_vertex[index].copy(),
        }
        for index in deduped.values()
    ]
    if not 18 <= len(ring) <= 40:
        fail(f'{eye.name}: expected a compact 18–40 point rim, got {len(ring)}')
    # The eyeball is recessed and is not the aperture centre; classify rails
    # from the actual deduplicated palpebral loop, otherwise the lower rail can
    # be incorrectly discarded on source meshes with a slightly pitched eye.
    centre = sum((point['co'] for point in ring), Vector()) / len(ring)
    bounds = (
        min(point['co'].x for point in ring), max(point['co'].x for point in ring),
        min(point['co'].z for point in ring), max(point['co'].z for point in ring),
    )
    if not (bounds[0] < centre.x < bounds[1]):
        fail(f'{eye.name}: rim does not span both sides of centre {tuple(centre)} bounds={bounds}')
    if not (bounds[2] < centre.z < bounds[3]):
        fail(f'{eye.name}: rim does not span above/below centre {tuple(centre)} bounds={bounds}')
    return centre, ring, candidate_indices


def weighted_curve(samples, x):
    """A restrained local interpolation through the real rim samples."""
    nearest = sorted(samples, key=lambda sample: abs(sample['co'].x - x))[:4]
    total = sum(1.0 / max(1e-8, abs(sample['co'].x - x)) for sample in nearest)
    point = Vector((0.0, 0.0, 0.0))
    for sample in nearest:
        weight = (1.0 / max(1e-8, abs(sample['co'].x - x))) / total
        point += sample['co'] * weight
    return point


def make_panel_rows(body, mesh, eye, boundary, uv_by_vertex, skin_image):
    centre, rim, rim_indices = deduped_eye_rim(body, mesh, eye, boundary, uv_by_vertex)
    upper = [sample for sample in rim if sample['co'].z >= centre.z]
    lower = [sample for sample in rim if sample['co'].z < centre.z]
    if len(upper) < 5 or len(lower) < 5:
        fail(f'{eye.name}: insufficient upper/lower rim samples ({len(upper)}/{len(lower)})')
    upper_chart = choose_continuous_chart_patch(mesh, centre, True, rim_indices, skin_image)
    lower_chart = choose_continuous_chart_patch(mesh, centre, False, rim_indices, skin_image)

    lo_x = max(min(sample['co'].x for sample in upper), min(sample['co'].x for sample in lower)) - PANEL_SIDE_OVERLAP
    hi_x = min(max(sample['co'].x for sample in upper), max(sample['co'].x for sample in lower)) + PANEL_SIDE_OVERLAP
    if hi_x - lo_x < 0.012:
        fail(f'{eye.name}: aperture horizontal span {hi_x - lo_x:.4f}m is implausibly small')
    eye_front_y = body_local_eye_front(body, eye)

    upper_rows, lower_rows = [], []
    closure_overlap = []
    occluding_cap_y = []
    for column in range(PANEL_COLUMNS):
        ratio = column / (PANEL_COLUMNS - 1)
        x = lo_x + (hi_x - lo_x) * ratio
        top = weighted_curve(upper, x)
        bottom = weighted_curve(lower, x)
        if top.z <= bottom.z:
            fail(f'{eye.name}: rim curves cross at column {column}')
        rim_front_y = min(top.y, bottom.y) - PANEL_EDGE_CLEARANCE
        lid_front_y = min(rim_front_y, eye_front_y - CORNEAL_CLEARANCE)

        def blend(amount, front_factor):
            point = top.lerp(bottom, amount)
            point.y = rim_front_y * (1.0 - front_factor) + lid_front_y * front_factor
            return point

        # `blend(0)` is upper rim and `blend(1)` lower rim. Upper therefore
        # closes to .80; lower closes to .75 (25% up from its lower rim). The
        # 5% overlap leaves no lash-line crack while retaining an upper-led
        # blink rather than a symmetric pair of sliding shutters.
        upper_open = [blend(0.00, 0.0), blend(0.07, 0.55), blend(0.12, 1.0)]
        lower_open = [blend(1.00, 0.0), blend(0.93, 0.55), blend(0.88, 1.0)]
        upper_closed = [blend(0.00, 0.0), blend(0.45, 0.72), blend(0.80, 1.0)]
        lower_closed = [blend(1.00, 0.0), blend(0.875, 0.72), blend(0.75, 1.0)]
        closure_overlap.append(lower_closed[2].z - upper_closed[2].z)
        # These free rows are the faces spanning the original socket at full
        # closure. Both must be ahead of the pupil disc—not merely one panel.
        occluding_cap_y.extend((upper_closed[2].y, lower_closed[2].y))
        # Each generated vertex inherits from its genuinely nearest, deduped
        # rim vertex—not merely the nearest point on the sampled curve—so all
        # clinical/posture targets and four bone weights stay source-faithful.
        nearest_rim = lambda point: min(rim, key=lambda sample: (sample['co'] - point).length_squared)['index']
        upper_rows.append((
            upper_open,
            upper_closed,
            [patch_uv(upper_chart, ratio, row / 2) for row in range(3)],
            [nearest_rim(point) for point in upper_open],
        ))
        lower_rows.append((
            lower_open,
            lower_closed,
            [patch_uv(lower_chart, ratio, row / 2) for row in range(3)],
            [nearest_rim(point) for point in lower_open],
        ))

    report = {
        'eye': eye.name,
        'rim_unique_vertices': len(rim),
        'span_x_m': hi_x - lo_x,
        'span_z_m': max(sample['co'].z for sample in rim) - min(sample['co'].z for sample in rim),
        'eye_front_y_m': eye_front_y,
        'lid_front_y_m': min(
            point.y for rows in (upper_rows, lower_rows) for _open, closed, _uv, _source in rows for point in closed
        ),
        'occluding_cap_max_y_m': max(occluding_cap_y),
        'closed_overlap_min_m': min(closure_overlap),
        'closed_overlap_max_m': max(closure_overlap),
        'upper_chart_face': upper_chart['face'],
        'lower_chart_face': lower_chart['face'],
    }
    # At the canthi, where the physical aperture converges, a large absolute
    # overlap is impossible. A 5%-of-an-8mm aperture gives about 0.4mm at the
    # centre, so require a positive seal everywhere and >=0.2mm centrally.
    central_overlap = closure_overlap[3:-3]
    if report['closed_overlap_min_m'] <= 0 or min(central_overlap) < 0.0002:
        fail(
            f"{eye.name}: inadequate closed seal min={report['closed_overlap_min_m'] * 1000:.2f}mm "
            f"central={min(central_overlap) * 1000:.2f}mm"
        )
    if report['occluding_cap_max_y_m'] > eye_front_y - CORNEAL_CLEARANCE + 1e-6:
        fail(f'{eye.name}: closure cap fails pupil/iris/sclera clearance')
    return upper_rows, lower_rows, report


def copy_weights(source, target, source_index, target_index, groups):
    copied = 0
    for membership in source.data.vertices[source_index].groups:
        group = groups.get(membership.group)
        if group is None:
            continue
        group.add([target_index], membership.weight, 'REPLACE')
        copied += 1
    if copied == 0:
        fail(f'source rim vertex {source_index} has no skin weights')


def validate_panel_uvs(mesh, skin_image):
    """Gate UV area plus representative interpolated interior samples."""
    uv_layer = mesh.uv_layers.active.data
    minimum_area = math.inf
    checked_samples = 0
    for polygon in mesh.polygons:
        loops = list(polygon.loop_indices)
        if len(loops) != 4:
            fail('eyelid authoring requires quad panel strips')
        corners = [uv_layer[loop].uv.copy() for loop in loops]
        for a, b, c in ((corners[0], corners[1], corners[2]), (corners[0], corners[2], corners[3])):
            triangle_area = uv_triangle_area(a, b, c)
            minimum_area = min(minimum_area, triangle_area)
            if triangle_area < 1e-10:
                fail('degenerate eyelid UV triangle: no interior texture area')
            for wa, wb, wc in ((1/3, 1/3, 1/3), (0.6, 0.2, 0.2), (0.2, 0.6, 0.2), (0.2, 0.2, 0.6)):
                interior = a * wa + b * wb + c * wc
                if not valid_facial_skin_sample(atlas_colour(skin_image, interior)):
                    fail('eyelid UV triangle interior reaches socket-red or atlas void')
                checked_samples += 1
    return minimum_area, checked_samples


def build_attachment(body):
    source = body.data
    if not source.shape_keys:
        fail('source patient has no morph targets')
    armature = body.find_armature()
    if not armature:
        fail('source patient has no armature')
    uv_by_vertex = source_uv_by_vertex(source)
    skin_image = source_skin_image(body)
    boundary = boundary_edges(source)
    eyes = [bpy.data.objects.get('eyeL'), bpy.data.objects.get('eyeR')]
    if any(eye is None or eye.type != 'MESH' for eye in eyes):
        fail('source patient requires eyeL and eyeR mesh nodes')

    basis, closed, uvs, anchors, faces = [], [], [], [], []
    reports = []
    for eye in eyes:
        upper_rows, lower_rows, report = make_panel_rows(body, source, eye, boundary, uv_by_vertex, skin_image)
        reports.append(report)
        for is_upper, rows in ((True, upper_rows), (False, lower_rows)):
            start = len(basis)
            # Row-major vertices make two broad, smooth quad strips rather than
            # a fan triangulated to a visible central point.
            for column in range(PANEL_COLUMNS):
                open_rows, closed_rows, row_uvs, row_sources = rows[column]
                for row in range(3):
                    basis.append(open_rows[row])
                    closed.append(closed_rows[row])
                    uvs.append(row_uvs[row])
                    anchors.append(row_sources[row])
            for column in range(PANEL_COLUMNS - 1):
                a = start + column * 3
                b = a + 3
                if is_upper:
                    faces.extend([(a, b, b + 1, a + 1), (a + 1, b + 1, b + 2, a + 2)])
                else:
                    # Reverse lower-panel winding so both lid exteriors face
                    # forward (-Y in Blender) under the shared skin material.
                    faces.extend([(a, a + 1, b + 1, b), (a + 1, a + 2, b + 2, b + 1)])

    mesh = bpy.data.meshes.new('PilotEyelidsMesh')
    mesh.from_pydata(basis, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    uv_layer = mesh.uv_layers.new(name='UVMap')
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            uv_layer.data[loop_index].uv = uvs[mesh.loops[loop_index].vertex_index]
    uv_area_min, uv_interior_samples = validate_panel_uvs(mesh, skin_image)

    lids = bpy.data.objects.new('PilotEyelids', mesh)
    bpy.context.collection.objects.link(lids)
    lids.parent = armature
    lids.matrix_world = body.matrix_world.copy()
    lids['derivation_license'] = 'CC0-derived geometry from patient-male.glb'
    lids['source_asset'] = 'public/models/patient-male.glb'
    lids['source_mesh'] = body.name
    lids['purpose'] = 'resp-001 continuous eyelid closure attachment'

    groups = {group.index: lids.vertex_groups.new(name=group.name) for group in body.vertex_groups}
    for target_index, source_index in enumerate(anchors):
        copy_weights(body, lids, source_index, target_index, groups)
    modifier = lids.modifiers.new(name='PatientRig', type='ARMATURE')
    modifier.object = armature
    modifier.use_deform_preserve_volume = True

    # Copy all body targets by source-index correspondence.  The open lid shape
    # inherits the nearest real rim vertex's delta; closure remains an additive
    # final target, allowing live RR/posture/finding influences to combine.
    source_keys = source.shape_keys.key_blocks
    for source_key in source_keys:
        target = lids.shape_key_add(name=source_key.name, from_mix=False)
        target.slider_min = source_key.slider_min
        target.slider_max = source_key.slider_max
        for target_index, source_index in enumerate(anchors):
            delta = source_key.data[source_index].co - source_keys['Basis'].data[source_index].co
            target.data[target_index].co = basis[target_index] + delta
    closed_key = lids.shape_key_add(name='eyelids_closed', from_mix=False)
    closed_key.slider_min = 0.0
    closed_key.slider_max = 1.0
    for index, point in enumerate(closed):
        closed_key.data[index].co = point

    for report in reports:
        report['uv_area_min'] = uv_area_min
        report['uv_interior_samples'] = uv_interior_samples
    return lids, armature, reports, [key.name for key in lids.data.shape_keys.key_blocks]


def export_attachment(lids, armature):
    bpy.ops.object.select_all(action='DESELECT')
    lids.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = lids
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT,
        use_selection=True,
        export_format='GLB',
        export_yup=True,
        export_skins=True,
        export_morph=True,
        export_morph_normal=True,
        export_animations=False,
        export_materials='NONE',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_extras=True,
    )


def probe_export(expected_morphs):
    with open(OUTPUT, 'rb') as handle:
        header = handle.read(20)
        json_length = int.from_bytes(header[12:16], 'little')
        gltf = json.loads(handle.read(json_length).decode('utf-8').rstrip(' '))
    mesh = next((item for item in gltf.get('meshes', []) if item.get('name') == 'PilotEyelidsMesh'), None)
    if mesh is None or len(gltf.get('meshes', [])) != 1:
        fail('export must contain exactly one PilotEyelids mesh')
    targets = mesh.get('extras', {}).get('targetNames', [])
    if targets != expected_morphs:
        fail(f'morph contract changed: {targets}')
    primitive = mesh['primitives'][0]
    required = {'POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0'}
    missing = required - set(primitive.get('attributes', {}))
    if missing:
        fail(f'export missing required vertex channels: {sorted(missing)}')
    if len(primitive.get('targets', [])) != len(expected_morphs):
        fail('export lost one or more morph target payloads')
    if gltf.get('images') or gltf.get('textures') or gltf.get('materials'):
        fail('eyelid attachment must not embed images, textures, or materials')
    extras = next((node.get('extras') for node in gltf.get('nodes', []) if node.get('name') == 'PilotEyelids'), None)
    if not extras or extras.get('source_asset') != 'public/models/patient-male.glb':
        fail('source/CC0 metadata missing from PilotEyelids node')
    lid_node = next(node for node in gltf.get('nodes', []) if node.get('name') == 'PilotEyelids')
    if lid_node.get('translation', [0, 0, 0]) != [0, 0, 0] or lid_node.get('scale', [1, 1, 1]) != [1, 1, 1]:
        fail(f"PilotEyelids must be identity in Patient local metres: {lid_node}")
    rotation = lid_node.get('rotation', [0, 0, 0, 1])
    if any(abs(value - expected) > 1e-7 for value, expected in zip(rotation, [0, 0, 0, 1])):
        fail(f"PilotEyelids must have identity rotation: {rotation}")
    if len(gltf.get('skins', [])) != 1:
        fail('eyelid attachment must export one compatible skeleton')
    print(f"[probe] mesh vertices={gltf['accessors'][primitive['attributes']['POSITION']]['count']} targets={len(targets)} skins=1 images=0")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SOURCE)
    bpy.context.view_layer.update()
    body = find_body()
    lids, armature, reports, morphs = build_attachment(body)
    expected_shape_keys = [key.name for key in body.data.shape_keys.key_blocks] + ['eyelids_closed']
    if morphs != expected_shape_keys:
        fail(f'attachment morph names mismatch: {morphs}')
    export_attachment(lids, armature)
    probe_export(expected_shape_keys[1:])
    for report in reports:
        print(
            '[coverage] {eye}: rim={rim_unique_vertices} span={span_x_m:.4f}×{span_z_m:.4f}m '
            'eye-front-y={eye_front_y_m:.5f} cap-max-y={occluding_cap_max_y_m:.5f} '
            'closed-overlap={closed_overlap_min_m:.4f}..{closed_overlap_max_m:.4f}m '
            'charts={upper_chart_face}/{lower_chart_face} uv-area-min={uv_area_min:.2e} '
            'interior-samples={uv_interior_samples}'.format(**report)
        )
    print(f'[done] {OUTPUT}')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
