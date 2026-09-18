#!/usr/bin/env python3
"""Generate trauma-008 scene plate via Higgsfield GPT Image 2.5 (1 credit)."""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.request
from pathlib import Path

PROMPT = (
    'Photoreal medical training still, 16:9, documentary night photography. '
    'A 45-year-old European tourist woman with long dark hair lies SUPINE in the '
    'kerbside lane of a four-lane Dubai coastal road at night (Mamzar Beach Road). '
    'She is pale, diaphoretic, grimacing, one hand on the lower abdomen. '
    'CRITICAL CLINICAL FINDING: her LEFT leg is shortened by several centimetres '
    'and EXTERNALLY ROTATED at the hip — the left foot is turned outward about 45 '
    'degrees, left knee slightly flexed; the RIGHT leg is straighter. This must be '
    'unmistakable from a wide scene camera. A silver sedan is stopped 15-20 metres '
    'up-traffic with hazard lights, driver standing nearby. Orange sodium streetlamp '
    'overhead, dry asphalt, palm trees, distant waterfront lights. Hi-vis vest on '
    'the road beside her. No blood spray, no gore, no on-image text, no watermark, '
    'no logos, no faces of bystanders in close-up. Photoreal, cinematic but clinical.'
)

OUT = Path('/Users/eliastlcthomas/Projects/app/public/scene-assets/pedestrian-road-night-female-45.png')


def main() -> int:
    cmd = [
        'higgsfield', 'generate', 'create', 'gpt_image_2_5',
        '--prompt', PROMPT,
        '--aspect_ratio', '16:9',
        '--wait',
        '--json',
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print('CREATE_EXIT', result.returncode)
    if result.stderr:
        print('STDERR', result.stderr[:4000])
    if result.returncode != 0:
        print(result.stdout[:4000])
        return result.returncode

    data = json.loads(result.stdout)
    jobs = data if isinstance(data, list) else [data]
    job = jobs[0]
    print('STATUS', job.get('status') or job.get('state'))
    print('ID', job.get('id'))
    url = None
    for key in ('url', 'image_url', 'result_url'):
        if isinstance(job.get(key), str) and job[key].startswith('http'):
            url = job[key]
            break
    if not url:
        results = job.get('results') or job.get('output') or job.get('images') or []
        if isinstance(results, list) and results:
            first = results[0]
            url = first if isinstance(first, str) else first.get('url')
        elif isinstance(results, dict):
            url = results.get('url')
    params = job.get('params') or {}
    if not url:
        url = params.get('url') or params.get('image_url')
    if not url:
        print('NO_URL keys=', sorted(job.keys()))
        print(json.dumps(job, indent=2)[:4000])
        return 2

    print('URL', url)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, OUT)
    print('WROTE', OUT, 'bytes', OUT.stat().st_size)
    return 0


if __name__ == '__main__':
    sys.exit(main())
