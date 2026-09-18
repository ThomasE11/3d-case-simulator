#!/usr/bin/env python3
import json, struct
from pathlib import Path

def load_gltf(path):
    data = Path(path).read_bytes()
    off = 12
    while off < len(data):
        chunk_len, chunk_type = struct.unpack_from('<I4s', data, off)
        off += 8
        chunk = data[off:off + chunk_len]
        off += chunk_len
        if chunk_type == b'JSON':
            return json.loads(chunk.decode('utf-8'))
    raise SystemExit(f'no JSON chunk in {path}')

def dump(path):
    g = load_gltf(path)
    nodes = g.get('nodes', [])
    meshes = g.get('meshes', [])
    print(f'\n=== {path} ===')
    for i, n in enumerate(nodes):
        name = n.get('name', f'node_{i}')
        kids = n.get('children', [])
        mesh = n.get('mesh')
        mesh_name = meshes[mesh].get('name') if mesh is not None else None
        print(f'  [{i}] {name} mesh={mesh_name} children={kids}')

for p in [
    'public/models/scenes/trauma-008-roadside-mvc.glb',
    'public/models/scenes/y2-007-od-bedroom.glb',
    'public/models/scenes/bathroom-fall.glb',
]:
    dump(p)
