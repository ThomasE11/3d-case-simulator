#!/usr/bin/env python3
"""Inspect named nodes in the villa dressing GLB without three.js."""
from __future__ import annotations

import json
import struct
from pathlib import Path

path = Path("/Users/eliastlcthomas/Projects/app/public/models/scenes/resp-001-villa-dressing.glb")
data = path.read_bytes()
print("size", len(data), "bytes", round(len(data) / 1024, 1), "KB")
magic, version, length = struct.unpack_from("<4sII", data, 0)
print("magic", magic, "version", version, "length", length)
offset = 12
chunk_len, chunk_type = struct.unpack_from("<I4s", data, offset)
json_bytes = data[offset + 8 : offset + 8 + chunk_len]
gltf = json.loads(json_bytes)
nodes = gltf.get("nodes", [])
print("nodes", len(nodes), "meshes", len(gltf.get("meshes", [])), "scenes", len(gltf.get("scenes", [])))
print("--- node names ---")
for i, node in enumerate(nodes):
    name = node.get("name", "")
    extras = node.get("extras") or {}
    trans = node.get("translation")
    print(f"{i:03d} {name!r} trans={trans} extras={extras}")
print("--- extras / extras.ps_role ---")
for i, node in enumerate(nodes):
    extras = node.get("extras") or {}
    if extras:
        print(i, node.get("name"), extras)
