/**
 * Seat / stance style — why every patient used to sit the same.
 *
 * `pose_seated` is one Blender morph. Every seated case blended to that single
 * silhouette, so a slouching office worker and a guarded post-op patient
 * rendered as the same mannequin. This module picks a deterministic *style*
 * from the case id (plus a little clinical context) and returns small fitted-
 * rig bone offsets layered over the stable seated/standing rest pose.
 *
 * Deterministic on purpose: the same case must look the same on re-open so
 * students can recognise the patient, while different cases stop reading as
 * clones. Amplitudes stay inside ordinary passive joint range — a style is a
 * person's habit, not an injury finding.
 */

import type { PatientMobility, PatientPosture } from '@/lib/patientStaging';

export type SeatStyleId =
  | 'attentive'
  | 'slouch'
  | 'anxious_lean'
  | 'open_guarded'
  | 'closed_quiet'
  | 'twist_relaxed'
  | 'huddle_knees';

export interface SeatStyleBones {
  /** Extra spine flexion (+) or slight extension/slouch (−), radians per bone. */
  spine: number;
  /** Torso yaw — a person rarely sits square to the door. */
  spineYaw: number;
  /** Upper-arm flexion delta on top of patientArmRestRadians. */
  leftArm: readonly [number, number, number];
  rightArm: readonly [number, number, number];
  leftForeArm: readonly [number, number, number];
  rightForeArm: readonly [number, number, number];
  /** Hip / knee openness — sitting with knees apart vs together. */
  leftUpLeg: readonly [number, number, number];
  rightUpLeg: readonly [number, number, number];
  leftLeg: readonly [number, number, number];
  rightLeg: readonly [number, number, number];
}

const ZERO: readonly [number, number, number] = [0, 0, 0];

const STYLES: Record<SeatStyleId, SeatStyleBones> = {
  attentive: {
    spine: 0,
    spineYaw: 0,
    leftArm: ZERO,
    rightArm: ZERO,
    leftForeArm: ZERO,
    rightForeArm: ZERO,
    leftUpLeg: ZERO,
    rightUpLeg: ZERO,
    leftLeg: ZERO,
    rightLeg: ZERO,
  },
  // Shoulders back into the chair, one breath slower. Hands land a little
  // wider on the thighs.
  slouch: {
    spine: -0.06,
    spineYaw: 0.04,
    leftArm: [0.05, 0, -0.12],
    rightArm: [0.05, 0, 0.12],
    leftForeArm: [0.08, 0, 0],
    rightForeArm: [0.08, 0, 0],
    leftUpLeg: [0, 0, -0.04],
    rightUpLeg: [0, 0, 0.04],
    leftLeg: [0.03, 0, 0],
    rightLeg: [0.03, 0, 0],
  },
  // Non-tripod forward worry: torso pitches, hands draw toward the knees.
  anxious_lean: {
    spine: 0.1,
    spineYaw: 0,
    leftArm: [-0.08, 0, 0.06],
    rightArm: [-0.08, 0, -0.06],
    leftForeArm: [-0.12, 0, 0],
    rightForeArm: [-0.12, 0, 0],
    leftUpLeg: [0.02, 0, -0.03],
    rightUpLeg: [0.02, 0, 0.03],
    leftLeg: ZERO,
    rightLeg: ZERO,
  },
  // Knees apart, elbows tucked — protective but taking up space.
  open_guarded: {
    spine: 0.03,
    spineYaw: 0,
    leftArm: [0.02, 0, -0.18],
    rightArm: [0.02, 0, 0.18],
    leftForeArm: [0.15, 0.05, 0],
    rightForeArm: [0.15, -0.05, 0],
    leftUpLeg: [0, 0, -0.08],
    rightUpLeg: [0, 0, 0.08],
    leftLeg: [0.05, 0, 0],
    rightLeg: [0.05, 0, 0],
  },
  // Knees together, hands close on the lap — quiet / paediatric / post-op.
  closed_quiet: {
    spine: 0.02,
    spineYaw: 0,
    leftArm: [0.1, 0, 0.1],
    rightArm: [0.1, 0, -0.1],
    leftForeArm: [0.2, 0.15, 0],
    rightForeArm: [0.2, -0.15, 0],
    leftUpLeg: [0, 0, 0.08],
    rightUpLeg: [0, 0, -0.08],
    leftLeg: ZERO,
    rightLeg: ZERO,
  },
  // Weight off one hip, slight turn — the patient who was mid-conversation.
  twist_relaxed: {
    spine: -0.02,
    spineYaw: 0.14,
    leftArm: [0.04, 0, -0.05],
    rightArm: [0.12, 0, 0.08],
    leftForeArm: [0.05, 0, 0],
    rightForeArm: [0.22, -0.1, 0],
    leftUpLeg: [0, 0, -0.02],
    rightUpLeg: [0.04, 0, 0.05],
    leftLeg: [0.02, 0, 0],
    rightLeg: [0.06, 0, 0],
  },
  // Floor sit, knees drawn up, arms around shins — library panic patient.
  huddle_knees: {
    spine: 0.18,
    spineYaw: 0,
    leftArm: [0.55, 0.1, -0.15],
    rightArm: [0.55, -0.1, 0.15],
    leftForeArm: [1.0, 0.25, 0],
    rightForeArm: [1.0, -0.25, 0],
    leftUpLeg: [1.15, 0, -0.12],
    rightUpLeg: [1.15, 0, 0.12],
    leftLeg: [-1.35, 0, 0],
    rightLeg: [-1.35, 0, 0],
  },
};

export const SEAT_STYLE_IDS = Object.keys(STYLES) as SeatStyleId[];

/** Stable 32-bit hash so the same case always gets the same body language. */
export function seatStyleSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seatStyleForId(styleId: SeatStyleId): SeatStyleBones {
  return STYLES[styleId];
}

/**
 * Pick a seat/stance style.
 *
 * Clinical context trumps the hash: a post-op closed lap and a guarded open
 * sit are different people, not a dice roll. When nothing clinical overrides,
 * the case id spreads the library across the remaining styles.
 */
export function deriveSeatStyle(input: {
  caseId: string;
  mobility: PatientMobility;
  posture: PatientPosture;
  handGuardRegion?: string | null;
  ageYears?: number;
  /** Authored initialPresentation.position — wins over the case-id hash. */
  position?: string;
}): SeatStyleId {
  const { caseId, posture, handGuardRegion, ageYears, position = '' } = input;
  // Infants and young children held on a lap sit closed and quiet.
  // Position language wins over age — a 3-year-old 'supine on floor' is not
  // a closed-quiet chair sit.
  if (/knees (?:drawn |up|tucked|to (?:the )?chest)/i.test(position)) return 'huddle_knees';
  if (/supine|lying (?:on|down)|prone|recovery position/i.test(position)) return 'attentive';
  if (typeof ageYears === 'number' && ageYears < 6) return 'closed_quiet';
  // Explicit guards already own the arms — do not fight them with a style.
  if (handGuardRegion) return 'attentive';

  // Dispatch position is the pose the student is told to expect. Honour it
  // before the hash so "knees drawn up" never renders as a chair hang.
  if (/knees (?:drawn |up|tucked|to (?:the )?chest)|curl(?:ed|ing)? up|huddl|fetal|foetal/i.test(position)) {
    return 'huddle_knees';
  }
  if (/sitting on (?:the )?floor|against (?:the )?wall|on (?:the )?floor against/i.test(position) && !/supine|lying/i.test(position)) {
    return 'huddle_knees';
  }

  // Tripod has its own authored lean; only add quiet legs.
  if (posture === 'tripod') return 'attentive';
  if (posture === 'legs-elevated') return 'slouch';
  if (/leaning forward|leaning against|hands on knees/i.test(position)) {
    return 'anxious_lean';
  }

  const pool: SeatStyleId[] = [
    'attentive',
    'slouch',
    'anxious_lean',
    'open_guarded',
    'closed_quiet',
    'twist_relaxed',
  ];
  return pool[seatStyleSeed(caseId) % pool.length];
}

/**
 * Standing stance — one hip loaded, not a shop mannequin.
 * Same seed as the seat style so a case keeps one personality.
 */
export interface StandingStance {
  hipShift: number;
  spineYaw: number;
  headYaw: number;
  leftArm: readonly [number, number, number];
  rightArm: readonly [number, number, number];
}

export function deriveStandingStance(caseId: string): StandingStance {
  const h = seatStyleSeed(caseId);
  const variants: StandingStance[] = [
    { hipShift: 0.03, spineYaw: 0.05, headYaw: 0.08, leftArm: [0, 0, -0.04], rightArm: [0.02, 0, 0.03] },
    { hipShift: -0.035, spineYaw: -0.06, headYaw: -0.1, leftArm: [0.03, 0, -0.02], rightArm: [0, 0, 0.05] },
    { hipShift: 0.02, spineYaw: 0.1, headYaw: 0.02, leftArm: [0.05, 0, -0.06], rightArm: [0.05, 0, 0.06] },
    { hipShift: -0.02, spineYaw: 0, headYaw: 0.14, leftArm: [0, 0, 0], rightArm: [0.08, 0, 0] },
  ];
  return variants[h % variants.length];
}
