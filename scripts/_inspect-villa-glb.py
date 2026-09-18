#!/usr/bin/env python3
"""Inspect resp-001 villa GLB nodes/meshes/extras (rev7 sofa room)."""
import json
import struct
from pathlib import Path

p = Path("public/models/scenes/resp-001-villa-dressing.glb")
data = p.read_bytes()
magic, version, length = struct.unpack_from("<4sII", data, 0)
assert magic == b"glTF", magic
off = 12
json_chunk = None
while off < length:
    chunk_len, chunk_type = struct.unpack_from("<I4s", data, off)
    off += 8
    chunk = data[off : off + chunk_len]
    off += chunk_len
    if chunk_type == b"JSON":
        json_chunk = json.loads(chunk)
        break
assert json_chunk
nodes = json_chunk.get("nodes", [])
meshes = json_chunk.get("meshes", [])
print("bytes", len(data), "nodes", len(nodes), "meshes", len(meshes))
print("--- NODES ---")
for i, n in enumerate(nodes):
    extras = n.get("extras") or {}
    print(
        f"{i:3d} name={n.get('name')!r} trans={n.get('translation')} "
        f"rot={n.get('rotation')} scale={n.get('scale')} mesh={n.get('mesh')} "
        f"extras={extras} children={n.get('children')}"
    )
print("--- MESHES ---")
for i, m in enumerate(meshes):
    extras = m.get("extras") or {}
    prim_extras = [(p.get("extras") or {}) for p in m.get("primitives", [])]
    print(f"{i:3d} name={m.get('name')!r} extras={extras} prim_extras={prim_extras}")
print("--- ASSET extras ---", json_chunk.get("asset", {}).get("extras"))
print("--- SCENE ---", json_chunk.get("scenes"))
print("--- MATERIALS ---", [m.get("name") for m in json_chunk.get("materials", [])])
