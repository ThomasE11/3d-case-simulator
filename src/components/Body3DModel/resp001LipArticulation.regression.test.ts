import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  classifyResp001LipSeamSides,
  resp001LipArticulationDelta,
  shouldApplyCorrectedLipArticulation,
  withResp001LipArticulationMorph,
} from './resp001LipArticulation';

describe('resp-001 amplitude-reactive lip articulation', () => {
  describe('shouldApplyCorrectedLipArticulation', () => {
    it('applies the corrected male articulation to every male case', () => {
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Patient')).toBe(true);
    });

    it('leaves female, legacy and non-Patient meshes on their shipped morph', () => {
      expect(shouldApplyCorrectedLipArticulation('/models/patient-female.glb', 'Patient')).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient.glb', 'Patient')).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', 'Eyes')).toBe(false);
      expect(shouldApplyCorrectedLipArticulation('/models/patient-male.glb', '')).toBe(false);
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
    const upper = resp001LipArticulationDelta(0, 1.546, 0.150);
    const chin = resp001LipArticulationDelta(0, 1.490, 0.145);
    const cheek = resp001LipArticulationDelta(0.040, 1.545, 0.150);

    expect(lower[1]).toBeLessThan(-0.004);
    expect(upper[1]).toBeGreaterThan(0.0015);
    expect(lower[2]).toBeLessThan(0);
    expect(upper[2]).toBeGreaterThan(0);
    expect(chin).toEqual([0, 0, 0]);
    expect(cheek).toEqual([0, 0, 0]);
  });

  it('softens the movement at the measured lip boundary', () => {
    const centre = resp001LipArticulationDelta(0, 1.540, 0.150);
    const corner = resp001LipArticulationDelta(0.025, 1.540, 0.150);
    const outside = resp001LipArticulationDelta(0.029, 1.540, 0.150);

    expect(Math.abs(corner[1])).toBeGreaterThan(0);
    expect(Math.abs(corner[1])).toBeLessThan(Math.abs(centre[1]));
    expect(outside).toEqual([0, 0, 0]);
  });

  it('uses an explicit GLTF dictionary index and preserves unnamed morph order', () => {
    const source = new THREE.BufferGeometry();
    source.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.560, 0.145,
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.530, 0.145,
      -0.010, 1.490, 0.145,
      0.010, 1.490, 0.145,
      0, 1.500, 0.145,
    ], 3));
    source.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(27), 3));
    source.setAttribute('uv', new THREE.Float32BufferAttribute([
      0, 0,
      0.5, 1,
      1, 0,
      0, 0,
      0.5, 1,
      1, 0,
      0, 0,
      0.5, 1,
      1, 0,
    ], 2));
    source.setIndex([0, 1, 2, 3, 5, 4, 6, 7, 8]);
    const existingViseme = new THREE.Float32BufferAttribute(new Float32Array(27), 3);
    const existingPosture = new THREE.Float32BufferAttribute(new Float32Array(27), 3);
    source.morphAttributes.position = [existingViseme, existingPosture];
    const oldVisemeNormal = new THREE.Float32BufferAttribute(new Float32Array(27).fill(0.5), 3);
    const existingPostureNormal = new THREE.Float32BufferAttribute(new Float32Array(27).fill(0.25), 3);
    source.morphAttributes.normal = [oldVisemeNormal, existingPostureNormal];
    source.morphTargetsRelative = true;

    const result = withResp001LipArticulationMorph(source, 0);
    const morphs = result.morphAttributes.position;
    expect(morphs).toBeDefined();
    if (!morphs) throw new Error('expected position morphs');
    const names = morphs.map(attribute => attribute.name);
    const lip = morphs[0];
    if (!lip) throw new Error('expected resp-001 lip morph');

    expect(result).not.toBe(source);
    const sourceMorphs = source.morphAttributes.position;
    expect(sourceMorphs).toBeDefined();
    if (!sourceMorphs) throw new Error('expected source position morphs');
    expect(sourceMorphs).toHaveLength(2);
    expect(names).toEqual(['', '']);
    expect(Array.from(morphs[1]?.array ?? [])).toEqual(Array.from(existingPosture.array));
    expect(result.getAttribute('position').count).toBe(9);
    expect(result.getAttribute('uv').count).toBe(9);
    expect(result.getIndex()?.count).toBe(9);
    expect(lip.getY(0)).toBeGreaterThan(0.0015);
    expect(lip.getY(1)).toBeGreaterThan(0.0015);
    expect(lip.getY(3)).toBeLessThan(-0.004);
    expect(lip.getY(4)).toBeLessThan(-0.004);
    expect(lip.getY(2)).toBe(0);
    expect(lip.getY(5)).toBeLessThan(0); // support follows the lower lip
    expect(lip.getY(5)).toBeGreaterThan(lip.getY(4));
    const normalMorphs = result.morphAttributes.normal;
    expect(normalMorphs).toBeDefined();
    if (!normalMorphs?.[0]) throw new Error('expected corrected viseme normal');
    for (const chinVertex of [6, 7, 8]) {
      expect(normalMorphs[0].getX(chinVertex)).toBeCloseTo(0, 7);
      expect(normalMorphs[0].getY(chinVertex)).toBeCloseTo(0, 7);
      expect(normalMorphs[0].getZ(chinVertex)).toBeCloseTo(0, 7);
    }
    expect(Array.from(normalMorphs[1]?.array ?? [])).toEqual(Array.from(existingPostureNormal.array));
  });

  it('uses topology to distinguish coincident upper and lower mouth seams', () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.560, 0.145,
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.530, 0.145,
    ], 3));
    geometry.setIndex([0, 1, 2, 3, 5, 4]);

    expect([...classifyResp001LipSeamSides(geometry)]).toEqual([1, 1, 0, -1, -1, 0]);
  });

  it('keeps a curled lower-lip interior on the lower side even above the seam height', () => {
    const points = [-.02, 1.545, .15, .02, 1.545, .15, 0, 1.560, .145];
    for (let row = 0; row < 3; row++) for (const [column, x] of [-.02, -.005, .005, .02].entries()) {
      const y = row === 0 ? 1.545 : row === 2 ? 1.530 : column === 1 ? 1.546 : 1.540;
      points.push(x, y, .15);
    }
    const indices = [0, 1, 2];
    for (let row = 0; row < 2; row++) for (let column = 0; column < 3; column++) {
      const a = 3 + row * 4 + column;
      indices.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setIndex(indices);
    const sides = classifyResp001LipSeamSides(geometry);
    expect(sides[8]).toBe(-1);
    expect(resp001LipArticulationDelta(-.005, 1.546, .15, sides[8] as -1)[1]).toBeLessThan(0);
  });

  it('rejects geometry whose existing morph identity cannot be preserved', () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.020, 1.545, 0.150,
      0.020, 1.545, 0.150,
      0, 1.560, 0.145,
    ], 3));
    geometry.setIndex([0, 1, 2]);
    geometry.morphTargetsRelative = true;

    expect(() => withResp001LipArticulationMorph(geometry)).toThrow(/viseme_open/);
    expect(() => withResp001LipArticulationMorph(geometry, 2)).toThrow(/viseme_open/);
  });
});
