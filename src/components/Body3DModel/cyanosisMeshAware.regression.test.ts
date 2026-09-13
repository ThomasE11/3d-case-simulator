import { describe, expect, it } from 'vitest';
import {
  cyanosisLipBand,
  isCyanoticLipVertex,
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
});
