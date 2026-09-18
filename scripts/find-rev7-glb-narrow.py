#!/usr/bin/env python3
from pathlib import Path

roots = [
    Path('/workspace/jutsu-villa'),
    Path('/workspace'),
    Path('/tmp'),
    Path('/Users/eliastlcthomas/Projects/app/public/models/scenes'),
    Path('/Users/eliastlcthomas/Projects/app/public/models'),
    Path('/Users/eliastlcthomas/.hermes/profiles/coding-agent'),
    Path('/Users/eliastlcthomas/Downloads'),
    Path('/Users/eliastlcthomas/Desktop'),
]
patterns = ('villa', 'resp-001', 'rev7', 'jutsu', 'dressing')
for root in roots:
    print(f'--- {root} exists={root.exists()} ---')
    if not root.exists():
        continue
    try:
        for path in root.iterdir() if root.is_dir() else []:
            name = path.name.lower()
            if path.suffix.lower() == '.glb' or any(p in name for p in patterns):
                try:
                    size = path.stat().st_size if path.is_file() else -1
                except OSError:
                    size = -2
                print(f'  {size:10d} {path}')
    except OSError as exc:
        print(f'  err {exc}')
    # one extra level for models/scenes-like folders
    if root.is_dir():
        for child in root.iterdir():
            if not child.is_dir():
                continue
            if child.name.startswith('.'):
                continue
            try:
                for path in child.glob('*.glb'):
                    print(f'  {path.stat().st_size:10d} {path}')
            except OSError:
                pass
