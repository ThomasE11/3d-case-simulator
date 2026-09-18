#!/usr/bin/env python3
from pathlib import Path
import struct
import json

p = Path('/Users/eliastlcthomas/Projects/app/public/models/scenes/resp-001-villa-dressing.glb')
print('exists', p.exists(), 'size', p.stat().st_size)
data = p.read_bytes()
magic, version, length = struct.unpack_from('<4sII', data, 0)
print('magic', magic, 'version', version, 'length', length)
chunk_len, chunk_type = struct.unpack_from('<I4s', data, 12)
print('chunk', chunk_len, chunk_type)
js = data[20:20 + chunk_len].rstrip(b'\x00').decode('utf-8')
gltf = json.loads(js)
nodes = gltf.get('nodes', [])
print('node_count', len(nodes))
print('mesh_count', len(gltf.get('meshes', [])))
print('--- nodes ---')
for i, n in enumerate(nodes):
    extras = n.get('extras')
    print(
        f"{i:03d} name={n.get('name')} trans={n.get('translation')} "
        f"rot={n.get('rotation')} scale={n.get('scale')} extras={extras} "
        f"mesh={n.get('mesh')} children={n.get('children')}"
    )
print('--- extras top ---')
print(gltf.get('extras'))
print('--- asset ---')
print(gltf.get('asset'))
print('--- scenes ---')
print(gltf.get('scenes'))
print('--- mesh names ---')
for i, m in enumerate(gltf.get('meshes', [])):
    print(i, m.get('name'), 'prims', len(m.get('primitives', [])))
