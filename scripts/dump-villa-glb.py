#!/usr/bin/env python3
from pathlib import Path
import struct
import json

out = Path('/tmp/villa-glb-inspect.txt')
p = Path('/Users/eliastlcthomas/Projects/app/public/models/scenes/resp-001-villa-dressing.glb')
lines = []
lines.append(f'exists {p.exists()} size {p.stat().st_size}')
data = p.read_bytes()
magic, version, length = struct.unpack_from('<4sII', data, 0)
lines.append(f'magic {magic} version {version} length {length}')
chunk_len, chunk_type = struct.unpack_from('<I4s', data, 12)
js = data[20:20 + chunk_len].rstrip(b'\x00').decode('utf-8')
gltf = json.loads(js)
nodes = gltf.get('nodes', [])
lines.append(f'node_count {len(nodes)}')
lines.append(f'mesh_count {len(gltf.get("meshes", []))}')
for i, n in enumerate(nodes):
    extras = n.get('extras')
    lines.append(
        f"{i:03d} name={n.get('name')} trans={n.get('translation')} "
        f"rot={n.get('rotation')} scale={n.get('scale')} extras={extras} "
        f"mesh={n.get('mesh')} children={n.get('children')}"
    )
lines.append(f'extras_top {gltf.get("extras")}')
lines.append(f'asset {gltf.get("asset")}')
lines.append(f'scenes {gltf.get("scenes")}')
for i, m in enumerate(gltf.get('meshes', [])):
    lines.append(f'mesh {i} {m.get("name")} prims {len(m.get("primitives", []))}')
out.write_text('\n'.join(lines) + '\n')
print(f'wrote {out} lines={len(lines)}')
