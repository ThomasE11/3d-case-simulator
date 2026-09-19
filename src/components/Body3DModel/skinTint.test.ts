import { describe, it, expect } from 'vitest';
import { deriveSkinTint, deriveCyanosisLocalStrength } from './skinTint';
import { isCyanoticLipVertex, isCyanoticNailVertex, isCyanoticNailPlateSample } from './MottlingLayer';

describe('skinTint functions', () => {
  describe('deriveSkinTint', () => {
    it('returns null when no jaundice, shock, or scenario pallor present', () => {
      const tint = deriveSkinTint({ vitals: { spo2: 94, pulse: 75, bp: '120/80' } });
      expect(tint).toBeNull();
    });

    it('returns pale tint when shock index > 0.8', () => {
      const tint = deriveSkinTint({ vitals: { pulse: 120, bp: '100/70' } });
      expect(tint).not.toBeNull();
    });

    it('renders fever as warm flushing rather than pallor', () => {
      const tint = deriveSkinTint({ initialVitals: { temperature: 38.5, pulse: 105, bp: '130/80' }, scenarioFlushing: 0.66 });
      expect(tint).not.toBeNull();
      expect(tint!.r).toBeGreaterThan(tint!.g);
      expect(tint!.g).toBeGreaterThan(tint!.b);
    });
  });

  describe('deriveCyanosisLocalStrength', () => {
    it('returns 0 when SpO2 >= 94', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 94 })).toBe(0);
      expect(deriveCyanosisLocalStrength({ spo2: 98 })).toBe(0);
    });

    it('deepens cyanosis progressively between SpO2 94 and 85', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 93 })).toBeCloseTo(0.078, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 88 })).toBeCloseTo(0.467, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 85 })).toBe(0.7);
    });

    it('progresses to a capped 0.9 strength below SpO2 85', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 83 })).toBeCloseTo(0.78, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 80 })).toBeCloseTo(0.9);
      expect(deriveCyanosisLocalStrength({ spo2: 70 })).toBe(0.9);
    });

    it('uses live SpO2 over scenario cyanosis', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 96 }, null, 0.8)).toBe(0);
    });
  });
});

describe('cyanosis vertex predicates', () => {
  describe('isCyanoticLipVertex', () => {
    it('matches lip band measured from patient-male.glb', () => {
      expect(isCyanoticLipVertex(0, 1.545, 0.15)).toBe(true);
      expect(isCyanoticLipVertex(0.05, 1.54, 0.14)).toBe(true);
      expect(isCyanoticLipVertex(0.06, 1.545, 0.15)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.53, 0.15)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.56, 0.15)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.545, 0.11)).toBe(false);
    });
  });

  describe('isCyanoticNailVertex', () => {
    it('matches distal fingertip / nailbed band on patient-male.glb', () => {
      // lateral pinky-side tips
      expect(isCyanoticNailVertex(0.55, 0.93, 0.31)).toBe(true);
      expect(isCyanoticNailVertex(-0.55, 0.94, 0.32)).toBe(true);
      // forward index/middle tips
      expect(isCyanoticNailVertex(0.50, 0.97, 0.36)).toBe(true);
      expect(isCyanoticNailVertex(-0.51, 0.97, 0.37)).toBe(true);
      // old groin-band coords must NOT match
      expect(isCyanoticNailVertex(0.12, 0.79, 0.20)).toBe(false);
      expect(isCyanoticNailVertex(0.21, 0.82, 0.20)).toBe(false);
      // mid-finger / too proximal
      expect(isCyanoticNailVertex(0.50, 0.93, 0.31)).toBe(false);
      expect(isCyanoticNailVertex(0.55, 0.90, 0.31)).toBe(false);
      expect(isCyanoticNailVertex(0.55, 0.93, 0.28)).toBe(false);
    });
  });

  describe('isCyanoticNailPlateSample', () => {
    it('keeps dorsal high-V nail plate and rejects pad-facing / mid-finger UV', () => {
      // dorsal nail plate (probe: V≳0.975, nz≳0.65)
      expect(isCyanoticNailPlateSample(0.98, 0.78)).toBe(true);
      expect(isCyanoticNailPlateSample(0.975, 0.65)).toBe(true);
      // pad-facing tip flesh shares high V but negative/near-zero nz
      expect(isCyanoticNailPlateSample(0.98, -0.4)).toBe(false);
      expect(isCyanoticNailPlateSample(0.98, 0.6)).toBe(false);
      // mid-finger / lower tip UV even with dorsal normal
      expect(isCyanoticNailPlateSample(0.97, 0.8)).toBe(false);
      expect(isCyanoticNailPlateSample(0.974, 0.8)).toBe(false);
    });
  });
});
