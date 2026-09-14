import { describe, expect, it } from 'vitest';

import { armAmputationSides } from './amputationPresentation';

// Regression: ISSUE-002 — trauma-011 inferred a right-hand amputation but
// still rendered an intact hand on the skinned patient rig.
// Found by /qa on 2026-09-15
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-09-15.md
describe('arm amputation presentation', () => {
  it('keeps the clinically inferred laterality for a rig-local stump', () => {
    expect(armAmputationSides([
      { id: 'right', region: 'right-arm', kind: 'amputation', label: 'Amputation', detail: '', severity: 'critical', x: 0, y: 0 },
      { id: 'left', region: 'left-arm', kind: 'amputation', label: 'Amputation', detail: '', severity: 'critical', x: 0, y: 0 },
    ])).toEqual(['right', 'left']);
  });

  it('does not change an intact limb for bleeding alone', () => {
    expect(armAmputationSides([
      { id: 'bleed', region: 'right-arm', kind: 'bleeding', label: 'Bleeding', detail: '', severity: 'major', x: 0, y: 0 },
    ])).toEqual([]);
  });
});
