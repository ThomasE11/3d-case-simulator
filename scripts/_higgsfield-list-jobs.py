#!/usr/bin/env python3
import json
import subprocess

def run(args):
    result = subprocess.run(args, capture_output=True, text=True)
    print('CMD', ' '.join(args))
    print('EXIT', result.returncode)
    out = (result.stdout or '') + (result.stderr or '')
    print(out[:6000])
    return result.returncode, result.stdout

code, out = run(['higgsfield', 'generate', 'list', '--json'])
if code == 0 and out.strip():
    try:
        data = json.loads(out)
        jobs = data if isinstance(data, list) else data.get('jobs') or data.get('data') or [data]
        for job in jobs[:8]:
            if isinstance(job, dict):
                print('JOB', {k: job.get(k) for k in ['id', 'status', 'job_set_type', 'type', 'created_at', 'model'] if k in job})
                print('KEYS', list(job.keys())[:30])
    except json.JSONDecodeError:
        pass
