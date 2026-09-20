/**
 * Pacing circuit for an ambulatory patient, in metres.
 *
 * Two straight passes joined by half-circle turns, so the patient walks a lane
 * and comes back down it rather than orbiting. Heading is the tangent of the
 * path, so they never walk sideways or snap backwards.
 *
 * THE THING THAT MATTERS HERE IS THAT CADENCE IS DERIVED, NOT TUNED.
 *
 * The donor walk clip is an in-place Mixamo loop: the legs do a full stride per
 * cycle and the root is moved separately by this path. If the two disagree, the
 * planted foot slides along the floor and the patient moonwalks. Measured on
 * the old constants (clip at 0.58x, path at a flat 0.42 m/s) the stance foot
 * slipped a mean 0.428 m/s — it never planted at all.
 *
 * So the clip's playback rate is computed from the speed this path is currently
 * asking for (`speed / NATURAL_WALK_SPEED`), and the two cannot drift apart.
 * Change the speeds below freely; the legs follow.
 */

/** One full cycle of the donor `walk` clip — two steps. Read from the GLB. */
export const WALK_CLIP_SECONDS = 0.958;

/**
 * Ground distance that one clip cycle covers at playback rate 1.
 *
 * Derived, not guessed: with the clip at 0.58x and the root at 0.42 m/s the
 * stance foot slipped 0.428 m/s, so 0.58 * natural - 0.42 = 0.428, giving a
 * natural speed of 1.46 m/s and a 1.40 m stride. That is an ordinary adult
 * stride for a 1.73 m model, which is the cross-check that it is right.
 */
export const WALK_CLIP_STRIDE_METRES = 1.4;

/** Ground speed the clip implies at playback rate 1. */
export const NATURAL_WALK_SPEED = WALK_CLIP_STRIDE_METRES / WALK_CLIP_SECONDS;

/** Unhurried indoor walking pace. Purposeful walking is nearer 1.4 m/s. */
const CRUISE_SPEED = 0.82;
/**
 * People slow down to turn around. Holding cruise speed through a 0.26 m
 * radius spins the patient 180° in under a second, which reads as a pirouette.
 */
const TURN_SPEED = 0.3;

/** Length of each straight pass — roughly three strides before turning back. */
const LANE_LENGTH = 1.85;
const TURN_RADIUS = 0.26;
const TURN_ARC = Math.PI * TURN_RADIUS;

const LANE_SECONDS = LANE_LENGTH / CRUISE_SPEED;
const TURN_SECONDS = TURN_ARC / TURN_SPEED;
const CIRCUIT_SECONDS = 2 * (LANE_SECONDS + TURN_SECONDS);

export interface WalkingPathPoint {
  x: number;
  z: number;
  /** Heading in radians, always the tangent of the path. */
  yaw: number;
  /** Ground speed here, m/s. Drives the clip's playback rate. */
  speed: number;
}

/**
 * Position, heading and ground speed at `seconds` into the circuit.
 *
 * Speed is piecewise constant (cruise on the straights, slower through the
 * turns) so the time-to-distance mapping stays closed-form and the function
 * stays pure and testable.
 *
 * ponytail: piecewise-constant means cadence steps at the turn boundary rather
 * than easing. If that ever reads as a hitch, the upgrade is a trapezoidal
 * speed profile — still closed-form, just more arithmetic.
 */
export function patientWalkingPath(seconds: number): WalkingPathPoint {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const t = safe % CIRCUIT_SECONDS;

  // Outbound straight.
  if (t < LANE_SECONDS) {
    return { x: 0, z: t * CRUISE_SPEED, yaw: 0, speed: CRUISE_SPEED };
  }

  // First turn — half circle onto the return lane.
  if (t < LANE_SECONDS + TURN_SECONDS) {
    const angle = ((t - LANE_SECONDS) * TURN_SPEED) / TURN_RADIUS;
    return {
      x: TURN_RADIUS * (1 - Math.cos(angle)),
      z: LANE_LENGTH + TURN_RADIUS * Math.sin(angle),
      yaw: angle,
      speed: TURN_SPEED,
    };
  }

  // Return straight.
  if (t < 2 * LANE_SECONDS + TURN_SECONDS) {
    const travelled = (t - LANE_SECONDS - TURN_SECONDS) * CRUISE_SPEED;
    return {
      x: 2 * TURN_RADIUS,
      z: LANE_LENGTH - travelled,
      yaw: Math.PI,
      speed: CRUISE_SPEED,
    };
  }

  // Second turn — half circle back onto the outbound lane.
  const angle = ((t - 2 * LANE_SECONDS - TURN_SECONDS) * TURN_SPEED) / TURN_RADIUS;
  return {
    x: TURN_RADIUS * (1 + Math.cos(angle)),
    z: -TURN_RADIUS * Math.sin(angle),
    yaw: Math.PI + angle,
    speed: TURN_SPEED,
  };
}

/**
 * Playback rate for the walk clip so the legs cover exactly the ground the
 * body is covering. This is the whole anti-moonwalk contract.
 */
export function walkClipTimeScale(speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) return 0;
  return speed / NATURAL_WALK_SPEED;
}

/** Full circuit duration — exported so tests can assert the loop closes. */
export const WALK_CIRCUIT_SECONDS = CIRCUIT_SECONDS;
export const WALK_LANE_LENGTH = LANE_LENGTH;
export const WALK_TURN_RADIUS = TURN_RADIUS;
