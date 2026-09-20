import { describe, expect, it } from 'vitest';
import {
  patientWalkingPath,
  walkClipTimeScale,
  NATURAL_WALK_SPEED,
  WALK_CIRCUIT_SECONDS,
  WALK_LANE_LENGTH,
  WALK_TURN_RADIUS,
} from './patientWalkingPath';

const SAMPLE = 0.0005;

describe('walking scene path', () => {
  it('faces the direction of travel on both straight passes and both turns', () => {
    for (let time = 0.02; time < 3 * WALK_CIRCUIT_SECONDS; time += 0.03) {
      const here = patientWalkingPath(time);
      const next = patientWalkingPath(time + SAMPLE);
      const dx = next.x - here.x;
      const dz = next.z - here.z;
      const travelled = Math.hypot(dx, dz);
      if (travelled === 0) continue;
      // Heading is the tangent — never walking sideways or backwards.
      expect((dx * Math.sin(here.yaw) + dz * Math.cos(here.yaw)) / travelled).toBeGreaterThan(0.999);
    }
  });

  it('stays inside the pacing lane', () => {
    for (let time = 0; time < 3 * WALK_CIRCUIT_SECONDS; time += 0.02) {
      const here = patientWalkingPath(time);
      expect(here.x).toBeGreaterThanOrEqual(-1e-9);
      expect(here.x).toBeLessThanOrEqual(2 * WALK_TURN_RADIUS + 1e-9);
      expect(here.z).toBeGreaterThanOrEqual(-WALK_TURN_RADIUS - 1e-9);
      expect(here.z).toBeLessThanOrEqual(WALK_LANE_LENGTH + WALK_TURN_RADIUS + 1e-9);
    }
  });

  it('reports the speed it is actually travelling at', () => {
    for (let time = 0.02; time < 3 * WALK_CIRCUIT_SECONDS; time += 0.03) {
      const here = patientWalkingPath(time);
      const next = patientWalkingPath(time + SAMPLE);
      const measured = Math.hypot(next.x - here.x, next.z - here.z) / SAMPLE;
      // Skip the frame that straddles a segment boundary.
      if (Math.abs(measured - here.speed) > 0.05 && Math.abs(measured - next.speed) < 0.05) continue;
      expect(measured).toBeCloseTo(here.speed, 2);
    }
  });

  it('slows to turn instead of pirouetting at walking pace', () => {
    // Somewhere on a straight, and somewhere mid-turn.
    const straight = patientWalkingPath(0.5);
    const turn = patientWalkingPath(WALK_LANE_LENGTH / straight.speed + 0.4);
    expect(turn.speed).toBeLessThan(straight.speed);
  });

  it('closes the loop and handles invalid time without snapping', () => {
    expect(patientWalkingPath(Number.NaN)).toEqual(patientWalkingPath(0));
    expect(patientWalkingPath(-10)).toEqual(patientWalkingPath(0));
    const start = patientWalkingPath(0);
    const wrapped = patientWalkingPath(WALK_CIRCUIT_SECONDS);
    expect(wrapped.x).toBeCloseTo(start.x, 6);
    expect(wrapped.z).toBeCloseTo(start.z, 6);
  });
});

/**
 * The anti-moonwalk contract. The donor walk clip is an in-place loop, so the
 * legs only look planted if the clip's playback rate matches the ground speed
 * the path is asking for. Measured live, the old hand-picked pairing (clip at
 * 0.58x, path at a flat 0.42 m/s) slid the stance foot 0.428 m/s.
 */
describe('clip cadence is locked to ground speed', () => {
  it('plays the clip at exactly the rate the ground speed implies', () => {
    for (const speed of [0.2, 0.3, 0.82, 1.4]) {
      expect(walkClipTimeScale(speed) * NATURAL_WALK_SPEED).toBeCloseTo(speed, 9);
    }
  });

  it('holds across every point of the circuit, turns included', () => {
    for (let time = 0; time < 2 * WALK_CIRCUIT_SECONDS; time += 0.05) {
      const here = patientWalkingPath(time);
      expect(walkClipTimeScale(here.speed) * NATURAL_WALK_SPEED).toBeCloseTo(here.speed, 9);
    }
  });

  it('stops the legs rather than running them backwards on a bad speed', () => {
    expect(walkClipTimeScale(0)).toBe(0);
    expect(walkClipTimeScale(-1)).toBe(0);
    expect(walkClipTimeScale(Number.NaN)).toBe(0);
  });

  it('keeps the walk inside a believable human cadence', () => {
    for (let time = 0; time < WALK_CIRCUIT_SECONDS; time += 0.05) {
      const rate = walkClipTimeScale(patientWalkingPath(time).speed);
      // Slower than a real walk while turning, never faster than one.
      expect(rate).toBeGreaterThan(0.1);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });
});
