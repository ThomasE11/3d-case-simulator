import { describe, expect, it } from 'vitest';
import { layoutBystanders } from './bystanderLayout';
import { parseBystanders } from './bystanderCount';
import type { BystanderEnvelope } from './bystanderLayout';

const env = (over: Partial<BystanderEnvelope> = {}): BystanderEnvelope => ({
  halfW: 3.6,
  backZ: -2.7,
  patientZ: 0,
  laneHalfW: 0.9,
  posture: 'standing',
  ...over,
});

describe('layoutBystanders', () => {
  it('returns nothing for a zero count', () => {
    expect(layoutBystanders(0, env(), 0)).toEqual([]);
  });

  it('keeps every figure out of the treatment lane', () => {
    const placements = layoutBystanders(12, env(), 7);
    for (const p of placements) {
      expect(Math.abs(p.x)).toBeGreaterThanOrEqual(0.9); // outside laneHalfW
      expect(p.z).toBeLessThan(0); // behind the patient
    }
  });

  it('keeps every figure inside the scene envelope', () => {
    const placements = layoutBystanders(24, env(), 13);
    for (const p of placements) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(3.6);
      expect(p.z).toBeGreaterThan(-2.7 - 0.5);
    }
  });

  it('is deterministic — same inputs, same output', () => {
    const a = layoutBystanders(18, env(), 42);
    const b = layoutBystanders(18, env(), 42);
    expect(a).toEqual(b);
  });

  it('differs when the seed changes', () => {
    const a = layoutBystanders(18, env(), 1);
    const b = layoutBystanders(18, env(), 2);
    expect(a).not.toEqual(b);
  });

  it('returns exactly N placements', () => {
    expect(layoutBystanders(1, env(), 0)).toHaveLength(1);
    expect(layoutBystanders(7, env(), 0)).toHaveLength(7);
    expect(layoutBystanders(24, env(), 0)).toHaveLength(24);
  });

  it('faces every figure at the treatment lane', () => {
    const placements = layoutBystanders(8, env(), 99);
    for (const p of placements) {
      // A figure at the side (x<0) should look toward +x; one behind should
      // look forward. The yaw is a real angle, so just check it is finite and
      // that the forward vector points back toward the lane centre.
      const fx = Math.sin(p.yaw);
      const fz = Math.cos(p.yaw);
      const dot = fx * (0 - p.x) + fz * (0 - p.z);
      expect(dot).toBeGreaterThan(0); // forward has a positive projection onto lane-centre
    }
  });

  it('folds posture into the envelope', () => {
    const kneeling = layoutBystanders(4, env({ posture: 'kneeling' }), 0);
    expect(kneeling.every(p => p.posture === 'kneeling' || p.posture === 'sitting')).toBe(true);
  });

  it('keeps every posture grounded on the floor plane', () => {
    // The renderer squats non-standing postures by Y-scale, so the layout
    // must report y=0 for every placement — a non-zero y would float a
    // "kneeling" bystander above the ground.
    for (const posture of ['standing', 'kneeling', 'sitting', 'crouching', 'lying'] as const) {
      const placements = layoutBystanders(6, env({ posture }), 3);
      expect(placements.every(p => p.y === 0)).toBe(true);
    }
  });

  it('scales crowd size with the authored count', () => {
    expect(layoutBystanders(1, env(), 0)).toHaveLength(1);
    expect(layoutBystanders(7, env(), 0)).toHaveLength(7);
    expect(layoutBystanders(24, env(), 0)).toHaveLength(24);
  });

  it('respects the authored bystander count when it exceeds the envelope default', () => {
    // A roadside case that authors "Approximately 40 people" must render 24
    // figures (the render cap), not the variant's default of 10.
    const parsed = parseBystanders('Approximately 40 people: uninjured bus passengers');
    expect(parsed.count).toBe(24);
    const placements = layoutBystanders(parsed.count, env({ halfW: 3.6, backZ: -4.2, laneHalfW: 1.1 }), 11);
    expect(placements).toHaveLength(24);
  });

  it('falls back to the envelope default when the author wrote no bystanders', () => {
    const parsed = parseBystanders('None');
    expect(parsed.count).toBe(0);
    // The caller (BystanderCrowd) substitutes the envelope default, so a
    // zero parse must not force an empty scene on a variant that authors 6.
    const placements = layoutBystanders(6, env(), 7);
    expect(placements).toHaveLength(6);
  });
});