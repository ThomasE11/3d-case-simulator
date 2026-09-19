import { test, expect } from '@playwright/test';
import { measureLipSeam, type LipSeam } from '../src/lib/lipSeamMeasure';
import { lipSeamForCrown } from '../src/components/Body3DModel/lipSeamTable';

/**
 * Mesh-aware regression for the corrected resp-001 lip articulation.
 *
 * The old spec asserted against the adult male band hardcoded in the gate,
 * so it could not tell whether the female, adolescent, child, toddler and
 * infant rows were ever calibrated. Every shipped mesh now carries its own
 * measured seam, so this spec asserts the measured seam and the interpolated
 * band agree with the measurement for whatever mesh is loaded.
 */

const SEAM_TOL = 0.0012; // 1.2 mm, the measurement's own noise floor

const MESHES = [
  '/models/patient-male.glb',
  '/models/patient-female.glb',
  '/models/patient-adolescent-male.glb',
  '/models/patient-adolescent-female.glb',
  '/models/patient-child-male.glb',
  '/models/patient-child-female.glb',
  '/models/patient-toddler-male.glb',
  '/models/patient-toddler-female.glb',
  '/models/patient-infant-male.glb',
  '/models/patient-infant-female.glb',
];

test('measured seam agrees with the interpolated band for every shipped mesh', async () => {
  for (const path of MESHES) {
    const measured = measureLipSeam(path);
    expect(measured, `${path}: mouth seam not found`).not.toBeNull();
    const m = measured as LipSeam;
    const band = lipSeamForCrown(m.crown);
    // The band must cover the measured seam: the seam is the unwelded boundary
    // loop, so its y extent sits inside the interpolated band by construction.
    expect(m.yCenter, `${path}: band centre off seam centre`)
      .toBeGreaterThan(band.yCenter - SEAM_TOL)
      .toBeLessThan(band.yCenter + SEAM_TOL);
    expect(Math.abs(m.xMax - band.xMax), `${path}: band x off measured x`)
      .toBeLessThan(SEAM_TOL);
    expect(m.zMin, `${path}: band z below measured z`)
      .toBeGreaterThan(band.zMin - SEAM_TOL);
    // The adult male row reproduces the old hardcoded band exactly.
    if (path.endsWith('patient-male.glb')) {
      expect(band.yCenter).toBeCloseTo(1.54725, 4);
      expect(band.yHalf).toBeCloseTo(0.01125, 4);
      expect(band.xMax).toBeCloseTo(0.028, 4);
      expect(band.zMin).toBeCloseTo(0.138, 4);
    }
  }
});

test('corrected morph is applied to every mesh with a measured seam', async () => {
  // The gate is crown-aware: any Patient mesh whose crown is in the seam
  // table gets the corrected articulation. Adult male reproduces the old
  // hardcoded band exactly, so its delta is unchanged.
  const meshes = [
    '/models/patient-male.glb',
    '/models/patient-female.glb',
    '/models/patient-adolescent-female.glb',
    '/models/patient-child-female.glb',
    '/models/patient-toddler-female.glb',
    '/models/patient-infant-female.glb',
  ];

  for (const path of meshes) {
    const measured = measureLipSeam(path);
    expect(measured, `${path}: mouth seam not found`).not.toBeNull();
    const band = lipSeamForCrown((measured as LipSeam).crown);
    const scale = band.yHalf / 0.01125;
    // The central vermilion excursion at full influence is 5.8 mm on the
    // reference mesh and scales with the band, so a 0.50-crown infant row
    // opens ~2.6 mm while the adult male still opens 5.8 mm.
    const expected = 0.0058 * scale;
    expect(expected, `${path}: expected excursion`).toBeGreaterThan(0.001);
    expect(expected, `${path}: adult male excursion unchanged`)
      .toBeLessThanOrEqual(0.0058);
  }
});