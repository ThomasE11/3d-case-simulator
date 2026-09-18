#!/usr/bin/env python3
"""World AABB for named nodes after applying parent TRS (no matrices)."""
from __future__ import annotations

import json
import math
import struct
from pathlib import Path

import numpy as np


def load_gltf(path: str):
    data = Path(path).read_bytes()
    off = 12
    json_chunk = None
    bin_chunk = None
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


def accessor_data(g, bin_chunk, acc_i):
    acc = g['accessors'][acc_i]
    bv = g['bufferViews'][acc['bufferView']]
    start = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    n = acc['count']
    # VEC3 float
    arr = np.frombuffer(bin_chunk, dtype=np.float32, count=n * 3, offset=start).reshape(n, 3)
    return arr


def quat_to_mat(q):
    x, y, z, w = q
    xx, yy, zz = x * x, y * y, z * z
    xy, xz, yz = x * y, x * z, y * z
    wx, wy, wz = w * x, w * y, w * z
    return np.array(
        [
            [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy), 0],
            [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx), 0],
            [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy), 0],
            [0, 0, 0, 1],
        ],
        dtype=np.float64,
    )


def node_local_matrix(node):
    if 'matrix' in node:
        m = np.array(node['matrix'], dtype=np.float64).reshape(4, 4, order='F')
        return m
    t = np.array(node.get('translation', [0, 0, 0]), dtype=np.float64)
    r = node.get('rotation', [0, 0, 0, 1])
    s = np.array(node.get('scale', [1, 1, 1]), dtype=np.float64)
    tm = np.eye(4)
    tm[:3, 3] = t
    rm = quat_to_mat(r)
    sm = np.diag([s[0], s[1], s[2], 1.0])
    return tm @ rm @ sm


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
        local = node_local_matrix(nodes[i])
        p = parents[i]
        worlds[i] = local if p is None else compute(p) @ local
        return worlds[i]

    for i in range(len(nodes)):
        compute(i)
    return worlds


def dump(path):
    g, bin_chunk = load_gltf(path)
    worlds = world_matrices(g)
    print(f'\n=== {path} ===')
    for i, node in enumerate(g['nodes']):
        name = node.get('name', f'node_{i}')
        mesh_i = node.get('mesh')
        if mesh_i is None:
            continue
        mesh = g['meshes'][mesh_i]
        pts = []
        for prim in mesh['primitives']:
            pos = prim['attributes']['POSITION']
            pts.append(accessor_data(g, bin_chunk, pos))
        verts = np.concatenate(pts, axis=0)
        ones = np.ones((len(verts), 1))
        world = (worlds[i] @ np.hstack([verts, ones]).T).T[:, :3]
        mn, mx = world.min(0), world.max(0)
        print(
            f'  {name:28s}  min=({mn[0]:6.2f},{mn[1]:6.2f},{mn[2]:6.2f})'
            f'  max=({mx[0]:6.2f},{mx[1]:6.2f},{mx[2]:6.2f})'
            f'  size=({mx[0]-mn[0]:5.2f},{mx[1]-mn[1]:5.2f},{mx[2]-mn[2]:5.2f})'
        )


dump('public/models/scenes/trauma-008-roadside-mvc.glb')
dump('public/models/scenes/y2-007-od-bedroom.glb')
dump('public/models/scenes/bathroom-fall.glb')
