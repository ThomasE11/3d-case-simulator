#!/usr/bin/env python3
import json, struct
from pathlib import Path

def glb_info(path):
    data = Path(path).read_bytes()
    magic, version, length = struct.unpack_from('<4sII', data, 0)
    assert magic == b'glTF'
    off = 12
    json_chunk = None
    while off < length:
        chunk_len, chunk_type = struct.unpack_from('<I4s', data, off)
        off += 8
        chunk = data[off:off + chunk_len]
        off += chunk_len
        if chunk_type == b'JSON':
            json_chunk = json.loads(chunk.decode('utf-8'))
            break
    names = [n.get('name', '<unnamed>') for n in json_chunk.get('nodes', [])]
    meshes = [m.get('name', '<unnamed>') for m in json_chunk.get('meshes', [])]
    print(f'\n=== {path} ({len(data)} bytes) ===')
    print('nodes:', names)
    print('meshes:', meshes)
    extras = json_chunk.get('extras')
    if extras:
        print('extras:', extras)

for p in [
    'public/models/scenes/y2-007-od-bedroom.glb',
    'public/models/scenes/trauma-008-roadside-mvc.glb',
    'public/models/scenes/bathroom-fall.glb',
    'public/models/scenes/resp-001-villa-dressing.glb',
]:
    glb_info(p)
