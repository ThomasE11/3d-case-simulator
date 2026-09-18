#!/usr/bin/env python3
import json
import subprocess

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

r = subprocess.run(
    ['higgsfield', 'generate', 'cost', 'gpt_image_2_5', '--prompt', PROMPT, '--aspect_ratio', '16:9', '--json'],
    capture_output=True,
    text=True,
)
print('COST_EXIT', r.returncode)
print(r.stdout)
print(r.stderr[:2000] if r.stderr else '')
