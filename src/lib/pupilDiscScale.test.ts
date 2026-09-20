import { expect, it } from 'vitest';
import { pupilDiscScale, pupilTextureRadiusFraction } from '@/lib/pupilDiscScale';

/**
 * The three pupil rendering paths used to clamp independently:
 *
 *   3D disc (BodyMesh, PupilLightExam)  Math.min(1.8, Math.max(0.4, mm/5))
 *   texture disc (EyesLayer)            Math.max(irisR*.32, Math.min(irisR*.9, irisR*mm/5))
 *   light-response (PupilLightExam)     mm/5, no clamp at all
 *
 * The 0.4 floor made a 1 mm pinpoint pupil (opioid OD, pontine haemorrhage,
 * organophosphate) and a 2 mm small-normal pupil render as the same disc. The
 * 0.9 iris cap made a 6 mm blown pupil agree with the 3D disc at the other end
 * too. The light-response path had no clamp, so during a penlight exam a pupil
 * could scale to 0.2x (1 mm response) while the static disc sat at 0.4x — the
 * two paths disagreed while the light was on.
 *
 * One function, one floor at the geometry limit, one ceiling at 1.8x the
 * authored disc. Everything above 1 mm scales linearly, so every clinical
 * diameter renders visibly distinct.
 */

it('renders every clinical pupil diameter visibly distinct', () => {
  const scales = [1, 2, 3, 4, 5, 6, 7].map(pupilDiscScale);
  for (let i = 1; i < scales.length; i++) {
    expect(scales[i]).toBeGreaterThan(scales[i - 1]);
  }
});

it('floors only where the disc becomes sub-millimetre, not at 0.4x', () => {
  expect(pupilDiscScale(1)).toBeCloseTo(0.2, 5);   // 1mm -> 0.2x, still visible
  expect(pupilDiscScale(2)).toBeCloseTo(0.4, 5);   // 2mm -> 0.4x, distinct from 1mm
  expect(pupilDiscScale(3)).toBeCloseTo(0.6, 5);   // 3mm -> 0.6x, normal
  expect(pupilDiscScale(5)).toBeCloseTo(1.0, 5);   // 5mm -> 1.0x, authored diameter
  expect(pupilDiscScale(6)).toBeCloseTo(1.2, 5);   // 6mm -> 1.2x, mid-dilated
  expect(pupilDiscScale(7)).toBeCloseTo(1.4, 5);   // 7mm -> 1.4x, dilated
});

it('caps a blown pupil at 1.8x so it never eats the iris', () => {
  expect(pupilDiscScale(20)).toBe(1.8);
  expect(pupilDiscScale(9)).toBe(1.8);
});

it('returns the floor for non-finite input instead of NaN', () => {
  expect(Number.isFinite(pupilDiscScale(NaN))).toBe(true);
  expect(Number.isFinite(pupilDiscScale(Infinity))).toBe(true);
  expect(pupilDiscScale(NaN)).toBe(0.2);
});

it('texture backing disc agrees with the 3D disc but never exceeds the iris', () => {
  // A pupil is a hole IN the iris, so the texture fraction caps at 1.0 even
  // though the 3D disc keeps scaling to 1.8. The two paths still agree on
  // everything up to and including a blown pupil filling the iris.
  expect(pupilTextureRadiusFraction(1)).toBe(pupilDiscScale(1));
  expect(pupilTextureRadiusFraction(3)).toBe(pupilDiscScale(3));
  expect(pupilTextureRadiusFraction(5)).toBe(1);
  expect(pupilTextureRadiusFraction(6)).toBe(1);
  expect(pupilTextureRadiusFraction(20)).toBe(1);
});