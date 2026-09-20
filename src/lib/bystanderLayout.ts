/**
 * bystanderLayout.ts — deterministic placement of bystander figures.
 *
 * Pure math: given a scene envelope and a bystander count, produce a list of
 * world-space positions + yaw angles. Deterministic (no Math.random) so the
 * same case renders identically on every device and every frame — the crowd
 * is a fixed set piece, not a turbulence generator.
 *
 * The treatment lane stays clear: figures are pushed to the perimeter of the
 * envelope, behind the patient relative to the arrival camera, and never
 * inside the examination footprint.
 */

import type { BystanderPosture } from './bystanderCount';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export { type BystanderPosture } from './bystanderCount';

export type BystanderGender = 'male' | 'female';

export interface BystanderPlacement {
  x: number;
  y: number;
  z: number;
  yaw: number;
  posture: BystanderPosture;
  gender: BystanderGender;
  /** 0..1 — distance from the crowd centroid, for a soft depth fade. */
  depth01: number;
}

export interface BystanderEnvelope {
  /** Half-width of the scene floor, metres. */
  halfW: number;
  /** World Z of the back wall / scene edge. */
  backZ: number;
  /** World Z of the patient root — the crowd must sit behind this. */
  patientZ: number;
  /** Half-width of the clear treatment lane around the patient. */
  laneHalfW: number;
  /** Authored bystander gender mix. Mixed crowds default to male. */
  gender?: BystanderGender;
  /** Authored bystander posture; the crowd keeps it. */
  posture: BystanderPosture;
}

/**
 * Place N figures around the perimeter of the scene, behind the patient.
 * Figures are distributed on a jitter-free ring so a crowd of 1 reads as one
 * person and a crowd of 24 reads as a crowd — never as a line of clones.
 */
export function layoutBystanders(
  count: number,
  envelope: BystanderEnvelope,
  seed: number,
): BystanderPlacement[] {
  if (count <= 0) return [];

  const { halfW, backZ, patientZ, laneHalfW } = envelope;
  // The crowd lives behind the patient (toward the back wall) and off to the
  // sides, outside the examination lane. The front half of the scene is kept
  // clear so the arrival camera and the student's orbit never push a figure
  // between the clinician and the patient.
  //
  // backZ is the world Z of the back wall and is always behind the patient
  // (more negative than patientZ in scene space). The crowd band runs from the
  // wall outward to a keep-clear margin in front of the wall, stopping short
  // of the patient so no figure straddles the treatment lane.
  const wallMargin = 0.35;
  const wallSign = Math.sign(backZ - patientZ) || -1;
  const crowdFarZ = backZ + wallSign * wallMargin;
  const crowdNearZ = patientZ - wallSign * wallMargin;
  const zMin = Math.min(crowdFarZ, crowdNearZ);
  const zMax = Math.max(crowdFarZ, crowdNearZ);
  const depthSpan = Math.max(0.5, zMax - zMin);
  // Usable side width once the treatment lane is reserved out of the middle.
  const sideSpan = Math.max(0.5, halfW * 2 - laneHalfW * 2);

  const placements: BystanderPlacement[] = [];
  for (let i = 0; i < count; i++) {
    // Spiral distribution: deterministic, even coverage, no clustering.
    const t = i / count;
    const angle = t * Math.PI * 2 * 1.618 + seed; // golden-angle sweep
    const radiusScale = 0.35 + 0.65 * ((i * 2654435761) % 1000) / 1000; // 0.35..1.0
    let side = Math.sin(angle) * sideSpan * 0.5 * radiusScale;

    // Guarantee the lane: a raw spiral sample can land inside the treatment
    // corridor, so push every figure out to the lane edge or beyond. The
    // push is signed and preserves which side of the scene the figure is on.
    if (Math.abs(side) < laneHalfW) {
      side = Math.sign(side || (i % 2 ? 1 : -1)) * (laneHalfW + 0.05);
    }

    const z = zMin + depthSpan * (0.25 + 0.5 * ((i * 40503) % 1000) / 1000);

    // Every figure faces the treatment lane centre, so the crowd reads as
    // witnesses looking at the patient rather than a wall of blank backs.
    // yaw=0 faces +z; forward is (sin yaw, cos yaw).
    const yaw = Math.atan2(-side, -(z - patientZ));

    // Posture-specific ground height. Kneeling/crouching figures are shorter
    // and sit closer to the floor; a standing figure's head must clear the
    // horizon line the scene uses for its backdrop.
    const posture = pickPostureForIndex(envelope.posture, i, count);

    placements.push({
      x: Math.max(-halfW + 0.3, Math.min(halfW - 0.3, side)),
      y: 0,
      z,
      yaw,
      posture,
      gender: pickGenderForIndex(envelope.gender ?? 'male', i, count),
      depth01: Math.min(1, (z - zMin) / depthSpan),
    });
  }
  return placements;
}

/** A crowd of one keeps the authored posture; larger crowds mix a minority
 *  of secondary postures so the group doesn't read as cloned mannequins. */
function pickPostureForIndex(primary: BystanderPosture, index: number, count: number): BystanderPosture {
  if (count <= 2) return primary;
  const secondary: BystanderPosture = primary === 'standing' ? 'sitting' : primary;
  return ((index * 37 + 11) % 7) < 2 ? secondary : primary;
}

/**
 * A crowd is a mix of people, not a row of identical mannequins. A single
 * bystander keeps the authored gender; larger crowds mix a minority of the
 * other gender so the group reads as a real group rather than a clone line.
 */
function pickGenderForIndex(primary: BystanderGender, index: number, count: number): BystanderGender {
  if (count <= 2) return primary;
  return ((index * 53 + 17) % 9) < 2 ? (primary === 'male' ? 'female' : 'male') : primary;
}

// ---------------------------------------------------------------------------
// Scene envelopes
// ---------------------------------------------------------------------------

/**
 * Outdoor variants get a bigger, more dispersed crowd; indoor public scenes
 * keep it tight against the back wall so the storefront reads as populated
 * without blocking the exam lane. Home scenes keep the crowd outside the
 * front door — a living-room crowd would fight the sofa dressing.
 *
 * The envelope is derived from the variant alone so the layout stays pure and
 * testable; the sceneProfile is only consulted for the authored posture, which
 * the case catalog carries in its bystander sentence rather than here.
 */
export function getBystanderEnvelope(
  variant: EnvironmentVariant,
): BystanderEnvelope & { count: number; seed: number } {
  const isIndoorPublic = variant === 'public';
  const isHome = variant === 'home';
  const isRoadside = variant === 'roadside';
  const isOutdoor = !isHome && !isIndoorPublic;

  const halfW = isHome ? 3.25 : 3.6;
  const patientZ = 0;
  const laneHalfW = isHome ? 0.9 : 1.1;

  let backZ: number;
  let count: number;
  let seed: number;
  let posture: BystanderPosture = 'standing';
  const gender: BystanderGender = 'male';

  if (isHome) {
    backZ = -2.6;
    count = 0; // no crowd inside the villa — the dressing owns the room
    seed = 1;
  } else if (isIndoorPublic) {
    backZ = -2.7;
    count = 6;
    seed = 7;
    posture = 'standing';
  } else if (isRoadside) {
    backZ = -4.2;
    count = 10;
    seed = 11;
    posture = 'standing';
  } else if (isOutdoor) {
    backZ = -4.6;
    count = 14;
    seed = 19;
    posture = variant === 'agricultural' ? 'standing' : 'standing';
  } else {
    backZ = -3.0;
    count = 4;
    seed = 3;
  }

  return {
    halfW,
    backZ,
    patientZ,
    laneHalfW,
    count,
    seed,
    posture,
    gender,
  };
}