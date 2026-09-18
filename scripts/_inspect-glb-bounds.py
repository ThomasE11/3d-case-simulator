#!/usr/bin/env python3
"""Print world-space AABB for each named mesh in archetype GLBs."""
import json
import struct
from pathlib import Path

import numpy as np

def load_glb(path):
    data = Path(path).read_bytes()
    off = 12
    json_chunk = bin_chunk = None
    while off < len(data):
        chunk_len, chunk_type = struct.unpack_from('<I4s', data, off)
        off += 8
        chunk = data[off:off + chunk_len]
        off += chunk_len
        if chunk_type == b'JSON':
            json_chunk = json.loads(chunk.decode('utf-8'))
        elif chunk_type == b'BIN\x00':
            bin_chunk = chunk
    return json_chunk, bin_chunk


def accessor_data(g, blob, accessor_index):
    acc = g['accessors'][accessor_index]
    view = g['bufferViews'][acc['bufferView']]
    offset = view.get('byteOffset', 0) + acc.get('byteOffset', 0)
    count = acc['count']
    ctype = acc['componentType']
    typ = acc['type']
    fmt = {5126: 'f', 5123: 'H', 5125: 'I', 5121: 'B', 5120: 'b'}[ctype]
    ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[typ]
    raw = np.frombuffer(blob, dtype=np.dtype(fmt), count=count * ncomp, offset=offset)
    return raw.reshape(count, ncomp).astype(np.float32)


def node_matrix(node):
    if 'matrix' in node:
        m = np.array(node['matrix'], dtype=np.float64).reshape(4, 4, order='F')
        return m
    t = np.array(node.get('translation', [0, 0, 0]), dtype=np.float64)
    s = np.array(node.get('scale', [1, 1, 1]), dtype=np.float64)
    r = node.get('rotation', [0, 0, 0, 1])
    x, y, z, w = r
    rot = np.array([
        [1 - 2*y*y - 2*z*z, 2*x*y - 2*z*w, 2*x*z + 2*y*w],
        [2*x*y + 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z - 2*x*w],
        [2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x*x - 2*y*y],
    ], dtype=np.float64)
    m = np.eye(4)
    m[:3, :3] = rot * s
    m[:3, 3] = t
    return m


def world_matrices(g):
    nodes = g['nodes']
    children = {i: n.get('children', []) for i, n in enumerate(nodes)}
    parents = {i: None for i in range(len(nodes))}
    for i, kids in children.items():
        for k in kids:
            parents[k] = i
    worlds = [None] * len(nodes)

    def compute(i):
        if worlds[i] is not None:
            return worlds[i]
        local = node_matrix(nodes[i])
        p = parents[i]
        worlds[i] = local if p is None else compute(p) @ local
        return worlds[i]

    for i in range(len(nodes)):
        compute(i)
    return worlds


def dump(path):
    g, blob = load_glb(path)
    worlds = world_matrices(g)
    nodes = g['nodes']
    meshes = g.get('meshes', [])
    print(f'\n=== {path} ===')
    overall_min = np.array([1e9, 1e9, 1e9])
    overall_max = np.array([-1e9, -1e9, -1e9])
    for i, n in enumerate(nodes):
        if 'mesh' not in n:
            continue
        mesh = meshes[n['mesh']]
        pts = []
        for prim in mesh.get('primitives', []):
            pos = prim.get('attributes', {}).get('POSITION')
            if pos is None:
                continue
            pts.append(accessor_data(g, blob, pos))
        if not pts:
            continue
        local = np.concatenate(pts, axis=0)
        ones = np.ones((local.shape[0], 1))
        world = (worlds[i] @ np.hstack([local, ones]).T).T[:, :3]
        mn, mx = world.min(0), world.max(0)
        overall_min = np.minimum(overall_min, mn)
        overall_max = np.maximum(overall_max, mx)
        size = mx - mn
        print(f'  {n.get("name","?"):24s}  min={np.round(mn,3)} max={np.round(mx,3)} size={np.round(size,3)}')
    print(f'  OVERALL min={np.round(overall_min,3)} max={np.round(overall_max,3)} size={np.round(overall_max-overall_min,3)}')

for p in [
    'public/models/scenes/resp-001-villa-dressing.glb',
    'public/models/scenes/y2-007-od-bedroom.glb',
    'public/models/scenes/trauma-008-roadside-mvc.glb',
    'public/models/scenes/bathroom-fall.glb',
]:
    dump(p)
