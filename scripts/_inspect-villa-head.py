#!/usr/bin/env python3
import json, struct
from pathlib import Path

def glb_info(path):
    data = Path(path).read_bytes()
    off = 12
    while off < len(data):
        chunk_len, chunk_type = struct.unpack_from('<I4s', data, off)
        off += 8
        chunk = data[off:off + chunk_len]
        off += chunk_len
        if chunk_type == b'JSON':
            j = json.loads(chunk.decode('utf-8'))
            names = [n.get('name', '<unnamed>') for n in j.get('nodes', [])]
            print(f'{path} ({len(data)} bytes)')
            print('nodes:', names)
            return

glb_info('public/models/scenes/resp-001-villa-dressing.glb')
