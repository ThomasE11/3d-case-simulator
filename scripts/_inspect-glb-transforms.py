#!/usr/bin/env python3
import json
import struct
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

def dump(path, interesting):
    g = load_gltf(path)
    print(f'\n=== {path} ===')
    for i, n in enumerate(g.get('nodes', [])):
        name = n.get('name', f'node_{i}')
        if interesting and not any(s.lower() in name.lower() for s in interesting):
            continue
        print(f'  [{i}] {name}')
        for key in ('translation', 'rotation', 'scale', 'matrix', 'children', 'mesh'):
            if key in n:
                print(f'      {key}={n[key]}')

dump('public/models/scenes/trauma-008-roadside-mvc.glb', ['car', 'sedan', 'bumper', 'road'])
dump('public/models/scenes/y2-007-od-bedroom.glb', ['bed', 'desk', 'night', 'plant'])
