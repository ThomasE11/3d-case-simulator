import { describe, expect, it } from 'vitest';
import {
  cyanosisLipBand,
  isCyanoticLipVertex,
  cyanosisNailBand,
  isCyanoticNailVertex,
  CYANOSIS_REFERENCE_CROWN,
} from './MottlingLayer';

/**
 * The local-cyanosis lip band was previously hardcoded to the adult male mesh
 * (patient-male.glb, crown 1.7261 m) and applied class-wide. On the adult
 * female mesh the mouth sits at Y≈1.40 (not 1.54), so the tint landed on the
 * nose/forehead; pediatric patients tinted nothing at all. The band now derives
 * from each mesh's own crown height, calibrated against the mouth seam measured
 * for every shipped GLB (scripts/_measure-mouth.mjs).
 */
describe('mesh-aware cyanosis lip band', () => {
  it('reproduces the adult-male lip band (no behaviour change)', () => {
    const band = cyanosisLipBand(CYANOSIS_REFERENCE_CROWN);
    expect(band.min).toBeCloseTo(1.535, 2);
    expect(band.max).toBeCloseTo(1.555, 2);
  });

  it('places the female lip band on the measured female mouth, not the male band', () => {
    // adult-female crown 1.5637 m, measured mouth seam centre 1.3996 m.
    const band = cyanosisLipBand(1.5637);
    expect(band.min).toBeCloseTo(1.3905, 2);
    expect(band.max).toBeCloseTo(1.4087, 2);
  });

  it('tints the female mouth and no longer tints the female nose/forehead', () => {
    const femaleBand = cyanosisLipBand(1.5637);
    // Female mouth seam vertex (Y≈1.3995) — must now tint.
    expect(isCyanoticLipVertex(0, 1.3995, 0.15, femaleBand)).toBe(true);
    // Y≈1.545 on the female mesh is the nose/philtrum — the old male band.
    expect(isCyanoticLipVertex(0, 1.545, 0.15, femaleBand)).toBe(false);
  });

  it('keeps the 3-arg default on the adult-male band (unchanged API)', () => {
    expect(isCyanoticLipVertex(0, 1.545, 0.15)).toBe(true);
    expect(isCyanoticLipVertex(0, 1.3995, 0.15)).toBe(false); // female mouth, male band
    expect(isCyanoticLipVertex(0, 1.57, 0.15)).toBe(false);
  });

  it('scales the lip band down for pediatric meshes (infant mouth, not adult)', () => {
    // infant-female crown 0.6554 m, measured mouth seam centre 0.5414 m.
    const infantBand = cyanosisLipBand(0.6554);
    expect(isCyanoticLipVertex(0, 0.5414, 0.10, infantBand)).toBe(true);
    expect(isCyanoticLipVertex(0, 1.545, 0.10, infantBand)).toBe(false);
  });

  it('leaves nail-bed cyanosis on the adult-male reference (unchanged)', () => {
    // Nails are still male-calibrated; this only guards against accidental
    // regression while the lip band became mesh-aware.
    expect(isCyanoticNailVertex(0.55, 0.93, 0.31)).toBe(true);
    expect(isCyanoticNailVertex(0.12, 0.79, 0.20)).toBe(false);
  });

  it('tints the female nailbed and no longer misses it (male band caught nothing)', () => {
    // Adult-female crown 1.5637 m, measured fingertip seam forward yCenter
    // 0.8714 / xMin 0.4379 / xMax 0.4379 / zTip 0.2951, lateral yCenter 0.8413
    // / xMin 0.4379 / xMax 0.4744 / zTip 0.2496. The old hardcoded male
    // thresholds (|x| 0.49–0.53 / 0.53–0.55, y 0.915–0.96 / 0.95–0.985,
    // z≥0.30 / 0.34) sat above and behind the female hand (measured tips at
    // y 0.84–0.87, z 0.25–0.30), so nail cyanosis never rendered on the
    // female patient at all.
    const femaleBand = cyanosisNailBand(1.5637);
    expect(femaleBand.min).toBeCloseTo(0.8524, 2);
    expect(femaleBand.max).toBeCloseTo(0.8904, 2);
    expect(femaleBand.xMin).toBeCloseTo(0.4379, 2);
    expect(femaleBand.xMax).toBeCloseTo(0.4379, 2);
    expect(femaleBand.zMin).toBeCloseTo(0.2669, 2);
    // A measured female fingertip — must now tint.
    expect(isCyanoticNailVertex(0.4379, 0.8714, 0.2951, femaleBand)).toBe(true);
    // The old male band at the same vertex — must NOT tint.
    expect(isCyanoticNailVertex(0.4379, 0.8714, 0.2951)).toBe(false);
  });

  it('scales the nail band down for pediatric meshes', () => {
    // Child-male crown 1.3353 m, measured fingertip seam forward yCenter
    // 0.7410 / xMin 0.3784 / xMax 0.3784 / zTip 0.2689, lateral yCenter
    // 0.7096 / xMin 0.4135 / xMax 0.4135 / zTip 0.2271.
    const childBand = cyanosisNailBand(1.3353);
    expect(isCyanoticNailVertex(0.3784, 0.7410, 0.2689, childBand)).toBe(true);
    // Adult-male band at the child's fingertip — misses it.
    expect(isCyanoticNailVertex(0.3784, 0.7410, 0.2689)).toBe(false);
  });

  it('keeps the 3-arg default on the adult-male band (unchanged API)', () => {
    expect(isCyanoticNailVertex(0.55, 0.93, 0.31)).toBe(true);
    expect(isCyanoticNailVertex(0.12, 0.79, 0.20)).toBe(false);
  });
});
