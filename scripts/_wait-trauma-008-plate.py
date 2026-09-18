#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

JOB = 'e9d396b1-45ac-4418-aaef-58013bb2ddb9'
OUT = Path('/Users/eliastlcthomas/Projects/app/public/scene-assets/pedestrian-road-night-female-45.png')

print('waiting', JOB, flush=True)
wait = subprocess.run(
    ['higgsfield', 'generate', 'wait', JOB, '--json'],
    capture_output=True,
    text=True,
)
print('WAIT_EXIT', wait.returncode, flush=True)
print((wait.stdout or '')[:8000], flush=True)
print('STDERR', (wait.stderr or '')[:2000], flush=True)
if wait.returncode != 0:
    raise SystemExit(wait.returncode)

payload = json.loads(wait.stdout)
jobs = payload if isinstance(payload, list) else [payload]
url = None
for job in jobs:
    url = job.get('result_url') or job.get('min_result_url') or url
    results = job.get('results') or []
    if isinstance(results, dict):
        results = [results]
    for item in results:
        if isinstance(item, dict):
            url = item.get('url') or item.get('image_url') or url
        elif isinstance(item, str) and item.startswith('http'):
            url = item
    if url:
        break
if not url:
    print('NO_URL payload keys', list(jobs[0].keys()) if jobs and isinstance(jobs[0], dict) else jobs)
    raise SystemExit(2)
print('URL', url, flush=True)
dl = subprocess.run(['curl', '-fsSL', url, '-o', str(OUT)])
print('DL_EXIT', dl.returncode, 'BYTES', OUT.stat().st_size if OUT.exists() else 0)
raise SystemExit(dl.returncode)
