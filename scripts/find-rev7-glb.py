#!/usr/bin/env python3
from pathlib import Path

needles = (
    'resp-001-villa-dressing-rev7.glb',
    'resp-001-villa-dressing.glb',
)
roots = [
    Path('/workspace'),
    Path('/tmp'),
    Path('/Users/eliastlcthomas/.hermes'),
    Path('/Users/eliastlcthomas/Projects'),
    Path('/Users/eliastlcthomas/Downloads'),
    Path('/Users/eliastlcthomas/Desktop'),
    Path('/Users/eliastlcthomas/Documents'),
]
seen = set()
for root in roots:
    if not root.exists():
        print(f'missing {root}')
        continue
    for path in root.rglob('*.glb'):
        try:
            st = path.stat()
        except OSError:
            continue
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        name = path.name.lower()
        if any(n in name for n in ('villa', 'resp-001', 'rev7', 'jutsu')) or st.st_size in (642720, 643 * 1024, 2907752):
            print(f'{st.st_size:10d} {path}')
