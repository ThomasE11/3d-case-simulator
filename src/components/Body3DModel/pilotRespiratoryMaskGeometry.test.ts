import { describe, expect, it } from 'vitest';
import { createPilotMaskShellGeometry, createPilotReservoirGeometry, pilotRespiratoryMaskGeometry } from './pilotRespiratoryMaskGeometry';
import { getFittedFaceEquipmentSpec } from './faceEquipment';

describe('resp-001 volumetric respiratory masks', () => {
  it.each(['nonrebreather', 'nebulizer'] as const)('starts the %s accessory on the actual shell surface', mode => {
    const spec = pilotRespiratoryMaskGeometry(mode, .16, .24, [.06, -.1, 0]);
    const geometry = createPilotMaskShellGeometry(spec);
    const positions = geometry.getAttribute('position');
    const [x, y, z] = spec.accessoryLink[0];
    let distance = Infinity;
    for (let i = 0; i < positions.count; i++) {
      distance = Math.min(distance, Math.hypot(positions.getX(i) - x, positions.getY(i) - y, positions.getZ(i) - z));
    }
    expect(distance).toBeLessThan(.0001);
    geometry.dispose();
  });
  it('fits both face pieces at the same anatomical height despite different image origins', () => {
    for (const mode of ['nonrebreather', 'nebulizer'] as const) {
      const fitted = getFittedFaceEquipmentSpec(mode)!;
      const geometry = pilotRespiratoryMaskGeometry(mode, fitted.width, fitted.height, [0, 0, 0]);
      expect(fitted.centre[1] + geometry.faceCentreY).toBeCloseTo(1.63, 5);
    }
  });
  it.each(['nonrebreather', 'nebulizer'] as const)('terminates the %s connector at the authored tube exit', mode => {
    const exit: [number, number, number] = [0.063, -0.12, 0.004];
    const spec = pilotRespiratoryMaskGeometry(mode, 0.16, 0.24, exit);
    expect(spec.connector.at(-1)).toEqual(exit);
    expect(spec.seal).toHaveLength(48);
    expect(spec.seal.at(0)).not.toEqual(spec.seal.at(-1));
    expect(spec.shellDepth).toBeGreaterThan(0.04);
    expect(spec.shellDepth).toBeLessThan(0.07);
  });

  it('gives the two clinical interfaces distinct hardware', () => {
    const exit: [number, number, number] = [0.06, -0.1, 0];
    expect(pilotRespiratoryMaskGeometry('nonrebreather', 0.16, 0.24, exit).accessory).toBe('reservoir');
    expect(pilotRespiratoryMaskGeometry('nebulizer', 0.15, 0.225, exit).accessory).toBe('medication-cup');
  });

  it('builds bounded shell volume without a planar stand-in', () => {
    const spec = pilotRespiratoryMaskGeometry('nonrebreather', 0.16, 0.24, [0.06, -0.1, 0]);
    const geometry = createPilotMaskShellGeometry(spec);
    const bounds = geometry.boundingBox!;
    expect(bounds.max.x - bounds.min.x).toBeGreaterThan(0.1);
    expect(bounds.max.y - bounds.min.y).toBeGreaterThan(0.08);
    expect(bounds.max.z - bounds.min.z).toBeGreaterThan(0.04);
    const positions = geometry.getAttribute('position');
    expect(positions.count).toBe(spec.seal.length * 3 + 1);
    spec.seal.forEach(([x, y, z], index) => {
      expect(positions.getX(index)).toBeCloseTo(x);
      expect(positions.getY(index)).toBeCloseTo(y);
      expect(positions.getZ(index)).toBeCloseTo(z);
    });
    const frontStart = spec.seal.length * 2;
    const sealMeanY = spec.seal.reduce((sum, point) => sum + point[1], 0) / spec.seal.length;
    const frontMeanY = spec.seal.reduce((sum, _, index) => sum + positions.getY(frontStart + index), 0) / spec.seal.length;
    expect(frontMeanY).toBeCloseTo(spec.faceCentreY + (sealMeanY - spec.faceCentreY) * 0.30, 6);
    geometry.dispose();
  });

  it('publishes harness anchors at the sampled lateral seal edges', () => {
    const spec = pilotRespiratoryMaskGeometry('nebulizer', 0.15, 0.225, [0.06, -0.1, 0]);
    expect(spec.strapAnchors[0][0]).toBeCloseTo(Math.min(...spec.seal.map(point => point[0])));
    expect(spec.strapAnchors[1][0]).toBeCloseTo(Math.max(...spec.seal.map(point => point[0])));
    expect(spec.strapAnchors[0][1]).toBeCloseTo(spec.strapAnchors[1][1]);
  });

  it('winds the front cap towards the camera and keeps the mask above the full-image centre', () => {
    const spec = pilotRespiratoryMaskGeometry('nonrebreather', 0.16, 0.24, [0.08, -0.04, 0]);
    const geometry = createPilotMaskShellGeometry(spec).toNonIndexed();
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    let frontNormalZ = 0;
    let frontVertices = 0;
    for (let i = 0; i < position.count; i++) {
      if (position.getZ(i) > spec.shellDepth) { frontNormalZ += normal.getZ(i); frontVertices++; }
    }
    expect(frontVertices).toBeGreaterThan(0);
    expect(frontNormalZ / frontVertices).toBeGreaterThan(0.75);
    expect(spec.faceCentreY).toBeGreaterThan(0);
    geometry.dispose();
  });

  it('routes each accessory through connected clinical hardware', () => {
    const exit: [number, number, number] = [0.06, -0.1, 0];
    const nrb = pilotRespiratoryMaskGeometry('nonrebreather', 0.16, 0.24, exit);
    const neb = pilotRespiratoryMaskGeometry('nebulizer', 0.15, 0.225, exit);
    expect(nrb.accessoryLink.at(-1)![1]).toBeCloseTo(0.24 * 0.07);
    expect(neb.accessoryLink.at(-1)![1]).toBeLessThan(neb.accessoryLink[0][1]);
    expect(neb.connector[0][1]).toBeLessThan(neb.accessoryLink.at(-1)![1]);
  });

  it('gives the pre-inflated NRB reservoir a visible flexible belly', () => {
    const geometry = createPilotReservoirGeometry(0.16, 0.24);
    const bounds = geometry.boundingBox!;
    const depth = bounds.max.z - bounds.min.z;
    expect(depth).toBeGreaterThanOrEqual(0.025);
    expect(depth).toBeLessThanOrEqual(0.035);
    expect(bounds.max.y - bounds.min.y).toBeGreaterThan(depth * 2);
    geometry.dispose();
  });
});
