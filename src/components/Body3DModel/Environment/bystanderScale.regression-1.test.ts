import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BYSTANDER_HEIGHT_MALE,
  BYSTANDER_HEIGHT_FEMALE,
  BYSTANDER_MIN_OPACITY,
} from './SceneVariant';

/**
 * The shipped bystander GLBs are NOT human scale: measured from the files,
 * the male mesh is 2.39 m tall and the female 1.30 m. A crowd built straight
 * from the assets stood 2.5 m giants beside 1.3 m children, which is what
 * put looming figures behind a patient on the road.
 *
 * BystanderFigure therefore normalises every figure from its own measured
 * bounds instead of trusting the asset. These tests guard both halves: that
 * the assets really are mismatched (so the normalisation is still needed),
 * and that the targets it normalises to stay sane.
 */
const glbHeight = (file: string): number => {
  const buf = readFileSync(resolve(process.cwd(), 'public/models', file));
  const jsonLength = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf8'));
  // Clothed figures use separate skin/shirt/trouser/shoe/hair primitives. A
  // single primitive's bounds are no longer the whole person's height.
  const bounds = gltf.meshes.flatMap((mesh: { primitives: Array<{ attributes: { POSITION: number } }> }) =>
    mesh.primitives.map(primitive => gltf.accessors[primitive.attributes.POSITION]));
  return Math.max(...bounds.map((accessor: { max: number[] }) => accessor.max[1]))
    - Math.min(...bounds.map((accessor: { min: number[] }) => accessor.min[1]));
};

describe('bystander scale normalisation', () => {
  it('the raw assets are mismatched, which is why normalisation exists', () => {
    const male = glbHeight('bystander-male.glb');
    const female = glbHeight('bystander-female.glb');
    // If a future re-export fixes the assets this fails loudly — at which
    // point the normalisation can be simplified rather than silently fighting
    // a mesh that no longer needs it.
    expect(male).toBeGreaterThan(2);
    expect(female).toBeLessThan(1.5);
  });

  it('normalises both sexes to a single human range', () => {
    for (const height of [BYSTANDER_HEIGHT_MALE, BYSTANDER_HEIGHT_FEMALE]) {
      expect(height).toBeGreaterThan(1.2);
      expect(height).toBeLessThan(1.6);
    }
  });

  it('keeps a plausible male/female ratio rather than a caricature', () => {
    const ratio = BYSTANDER_HEIGHT_FEMALE / BYSTANDER_HEIGHT_MALE;
    // Adult female mean height is roughly 92-94% of male. Anything near the
    // assets' own 0.54 ratio is the bug this replaced.
    expect(ratio).toBeGreaterThan(0.88);
    expect(ratio).toBeLessThan(1);
  });
});

describe('bystander depth fade', () => {
  it('keeps distant figures solid enough to read as people', () => {
    // The fade bottomed out at 0.35, which dissolved a distant bystander's
    // legs into the dark roadway and left the torso hovering — a ghost at a
    // trauma scene. The depth cue is worth keeping; the transparency is not.
    expect(BYSTANDER_MIN_OPACITY).toBeGreaterThan(0.7);
    expect(BYSTANDER_MIN_OPACITY).toBeLessThan(1);
  });
});
