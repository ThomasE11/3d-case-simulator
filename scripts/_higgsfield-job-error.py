#!/usr/bin/env python3
import json
import subprocess

JOB = 'e9d396b1-45ac-4418-aaef-58013bb2ddb9'
r = subprocess.run(['higgsfield', 'generate', 'get', JOB, '--json'], capture_output=True, text=True)
print('EXIT', r.returncode)
print((r.stdout or '')[:8000])
print('STDERR', (r.stderr or '')[:2000])
if r.returncode == 0 and r.stdout.strip():
    try:
        data = json.loads(r.stdout)
        jobs = data if isinstance(data, list) else [data]
        for job in jobs:
            print('STATUS', job.get('status'))
            print('ERROR', job.get('error') or job.get('failure_reason') or job.get('message'))
            print('KEYS', list(job.keys()))
    except json.JSONDecodeError:
        pass
