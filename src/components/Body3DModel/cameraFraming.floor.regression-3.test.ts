import { describe, expect, it } from 'vitest';

import {
  floorOverviewFov,
  floorOverviewMaxDistance,
  floorOverviewMinPolarAngle,
  treatmentBayFloorOverviewOffset,
} from './cameraFraming';

// Regression: ISSUE-001 — floor patients opened from a low, oblique view and
// could not be inspected from a practical overhead care angle.
// Found by /qa on 2026-09-15
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-09-15.md
describe('floor-patient overview camera', () => {
  it('uses a steep, full-body observation angle in open incident scenes', () => {
    const [x, y, z] = treatmentBayFloorOverviewOffset('roadside');

    expect(y).toBeGreaterThan(z);
    expect(Math.atan2(Math.hypot(x, z), y)).toBeLessThan(0.6);
    expect(floorOverviewMinPolarAngle('roadside')).toBeLessThan(0.4);
  });

  it('keeps an indoor overhead view inside the authored ceiling envelope', () => {
    const [, y, z] = treatmentBayFloorOverviewOffset('home');

    expect(y).toBeLessThan(2.55);
    expect(z).toBeLessThan(2.1);
    expect(floorOverviewMinPolarAngle('home')).toBeGreaterThan(0.5);
    expect(floorOverviewMaxDistance('home')).toBe(3.05);
    expect(floorOverviewMaxDistance('roadside')).toBeNull();
    expect(floorOverviewFov('home')).toBe(40);
    expect(floorOverviewFov('roadside')).toBe(38);
  });
});
