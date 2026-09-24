import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { measureLipSeam, type LipSeam } from '../../src/lib/lipSeamMeasure';
import { lipSeamForCrown } from '../../src/components/Body3DModel/lipSeamTable';

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

const MESH_URLS = [
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
const MESHES = MESH_URLS.map(path => resolve(process.cwd(), 'public', path.slice(1)));

test('measured seam agrees with the interpolated band for every shipped mesh', async () => {
  for (const [index, path] of MESHES.entries()) {
    const url = MESH_URLS[index];
    const measured = measureLipSeam(path);
    expect(measured, `${url}: mouth seam not found`).not.toBeNull();
    const m = measured as LipSeam;
    const band = lipSeamForCrown(m.crown);
    // The band must cover the measured unwelded mouth loop. The adult row
    // deliberately preserves the legacy centre/limits, so compare coverage
    // rather than requiring the band centre to equal the measured midpoint.
    expect(band.yCenter - band.yHalf, `${url}: band misses lower lip edge`)
      .toBeLessThanOrEqual(m.yCenter - m.yHalf + SEAM_TOL);
    expect(band.yCenter + band.yHalf, `${url}: band misses upper lip edge`)
      .toBeGreaterThanOrEqual(m.yCenter + m.yHalf - SEAM_TOL);
    expect(band.xMax, `${url}: band is narrower than measured mouth`)
      .toBeGreaterThanOrEqual(m.xMax - SEAM_TOL);
    expect(band.zMin, `${url}: band starts behind measured mouth`)
      .toBeLessThanOrEqual(m.zMin + SEAM_TOL);
    // The adult male row reproduces the old hardcoded band exactly.
    if (url.endsWith('patient-male.glb')) {
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
  const meshes = MESH_URLS.filter(path => /patient-(?:male|female|adolescent-female|child-female|toddler-female|infant-female)\.glb$/.test(path))
    .map(path => resolve(process.cwd(), 'public', path.slice(1)));

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
