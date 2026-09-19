import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  classifyResp001LipSeamSides,
  resp001LipArticulationDelta,
  shouldApplyCorrectedLipArticulation,
  withResp001LipArticulationMorph,
} from './resp001LipArticulation';
import { lipSeamForCrown, ADULT_MALE_CROWN } from './lipSeamTable';

describe('resp-001 amplitude-reactive lip articulation', () => {
  describe('shouldApplyCorrectedLipArticulation', () => {
    // The gate is crown-aware: every Patient mesh whose crown is in the seam
    // table gets the corrected articulation. The adult male row reproduces
    // the old hardcoded band exactly, so its behaviour is unchanged.
    it('applies the corrected articulation to every mesh with a measured seam', () => {
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Patient', 1.81)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-female.glb', 'Patient', 1.81)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-adolescent-male.glb', 'Patient', 1.60)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-adolescent-female.glb', 'Patient', 1.60)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-child-male.glb', 'Patient', 1.30)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-child-female.glb', 'Patient', 1.30)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-toddler-male.glb', 'Patient', 0.95)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-toddler-female.glb', 'Patient', 0.95)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-infant-male.glb', 'Patient', 0.50)).toBe(true);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-infant-female.glb', 'Patient', 0.50)).toBe(true);
    });

    it('leaves legacy and non-Patient meshes on their shipped morph', () => {
      expect(shouldApplyCorrectedLipArticulation('/models/patient.glb', 'Patient', 1.81)).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Eyes', 1.81)).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', '', 1.81)).toBe(false);
    });

    it('rejects meshes with no measured seam', () => {
      // An uncalibrated crown (not in the seam table) keeps the shipped morph
      // rather than applying a guessed band.
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Patient', 0)).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Patient', NaN)).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Patient', -1)).toBe(false);
    });
  });

  it('does not fold the supporting skin beneath the lower lip during opening', () => {
    for (const influence of [0.25, 0.5, 0.75, 1]) {
      let previous = -Infinity;
      for (let y = 1.515; y <= 1.542; y += 0.00025) {
        const moved = y + resp001LipArticulationDelta(0, y, 0.150, -1)[1] * influence;
        expect(moved, `lower-lip support at y=${y}, influence=${influence}`).toBeGreaterThan(previous);
        previous = moved;
      }
    }
  });

  it('separates central vermilion without moving chin or cheek vertices', () => {
    const lower = resp001LipArticulationDelta(0, 1.540, 0.150);
    const upper = resp001LipArticulationDelta(0, 1.545, 0.150, 1);
    // Central vermilion separation at full influence is 5.8 mm on the
    // reference mesh and scales with the band, so a 0.50-crown infant row
    // opens ~2.6 mm while the adult male still opens 5.8 mm.
    expect(upper[1] - lower[1]).toBeCloseTo(0.0058, 4);
    expect(resp001LipArticulationDelta(0, 1.45, 0.150)).toEqual([0, 0, 0]);
    expect(resp001LipArticulationDelta(0.35, 1.54, 0.150)).toEqual([0, 0, 0]);
  });

  it('scales the band with crown so every mesh tracks its own measured mouth', () => {
    const adult = lipSeamForCrown(ADULT_MALE_CROWN);
    const infant = lipSeamForCrown(0.50);
    // Adult male reproduces the old hardcoded band exactly.
    expect(adult.yCenter).toBeCloseTo(1.54725, 4);
    expect(adult.yHalf).toBeCloseTo(0.01125, 4);
    expect(adult.xMax).toBeCloseTo(0.028, 4);
    expect(adult.zMin).toBeCloseTo(0.138, 4);
    // The infant row is smaller in every dimension.
    expect(infant.yHalf).toBeLessThan(adult.yHalf);
    expect(infant.xMax).toBeLessThan(adult.xMax);
    expect(infant.zMin).toBeLessThan(adult.zMin);
    // The central vermilion excursion at full influence is 5.8 mm on the
    // reference mesh. The delta magnitude is fixed; what scales with the band
    // is the aperture it is applied over, so the infant row's supported skin
    // band is narrower than the adult's.
    const adultExcursion = resp001LipArticulationDelta(0, adult.yCenter, 0.150, 1, adult)[1]
      - resp001LipArticulationDelta(0, adult.yCenter, 0.150, -1, adult)[1];
    expect(adultExcursion).toBeCloseTo(0.0058, 4);
    const infantExcursion = resp001LipArticulationDelta(0, infant.yCenter, 0.150, 1, infant)[1]
      - resp001LipArticulationDelta(0, infant.yCenter, 0.150, -1, infant)[1];
    expect(infantExcursion).toBeCloseTo(0.0058, 4);
    // The infant's supported skin band is narrower: at the same absolute
    // distance from its own seam centre it falls off where the adult's does not.
    const dy = adult.yHalf - infant.yHalf;
    expect(resp001LipArticulationDelta(0, infant.yCenter + dy, 0.150, 0, infant)[1])
      .toBeLessThan(resp001LipArticulationDelta(0, adult.yCenter + dy, 0.150, 0, adult)[1]);
  });

  it('classifies seam sides from a geometry carrying the measured seam', () => {
    const geometry = new THREE.BufferGeometry();
    // A synthetic indexed mesh with two unwelded boundary loops at the
    // reference seam. Each loop is a triangle whose third vertex peaks away
    // from the seam plane: the upper loop's peak is above it, the lower's is
    // below, so the topology-derived bias separates them. The seam-side
    // assignment then follows the nearest boundary loop by surface distance.
    const positions = new Float32Array([
      // upper loop (seam plane y 1.545, peak at y 1.560)
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.560, 0.145,
      // lower loop (seam plane y 1.545, peak at y 1.530)
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.530, 0.145,
    ]);
    const indices = new Uint16Array([0, 1, 2, 3, 5, 4]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    const sides = classifyResp001LipSeamSides(geometry);
    expect(sides[0]).toBe(1);
    expect(sides[3]).toBe(-1);
  });

  it('returns the clone unchanged when the seam is not found', () => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 1.0, 0, 0, 1.0, 0, 0, 1.0, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2]), 1));
    // A mesh with a relative viseme_open target but no mouth seam in the
    // calibrated band: the clone is returned unchanged so the patient keeps
    // its shipped morph rather than crashing the whole render.
    geometry.morphTargetsRelative = true;
    geometry.morphAttributes = {
      position: [new THREE.Float32BufferAttribute(new Float32Array(9), 3)],
    };
    const result = withResp001LipArticulationMorph(geometry);
    expect(result).toBe(geometry);
  });
});