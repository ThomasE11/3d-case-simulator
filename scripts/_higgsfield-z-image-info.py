#!/usr/bin/env python3
import json
import subprocess
import sys

def run(args):
    result = subprocess.run(args, capture_output=True, text=True)
    print('CMD', ' '.join(args))
    print('EXIT', result.returncode)
    if result.stderr.strip():
        print('STDERR', result.stderr[:2000])
    out = result.stdout.strip()
    print('STDOUT', out[:4000])
    return result.returncode, out

run(['higgsfield', 'account', 'status'])
code, out = run(['higgsfield', 'model', 'get', 'z_image', '--json'])
if code == 0 and out:
    try:
        data = json.loads(out)
        print('KEYS', sorted(data.keys())[:40] if isinstance(data, dict) else type(data))
    except json.JSONDecodeError:
        pass
run(['higgsfield', 'generate', 'cost', 'z_image', '--prompt', 'test roadside photo'])
