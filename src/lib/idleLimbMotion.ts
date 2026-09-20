/**
 * Idle limb motion — the baseline "this patient is alive" movement.
 *
 * LifeSigns used to sway the whole model root, but rotating the root pivots a
 * supine body through its support surface, so it was reduced to a no-op. That
 * left non-ambulatory patients (every seated, supine and recovery case — i.e.
 * most of them) with a chest morph and eye saccades as their ONLY movement:
 * the arms sat perfectly still, which reads as a mannequin, not a person.
 *
 * This module produces small LOCAL bone offsets instead, so the patient stays
 * planted on the floor/stretcher and attached equipment keeps its anchor:
 *
 *   • Shoulder lift  — coupled to the real breathing clock, and scaled by the
 *     respiratory rate. Applied to Mixamo *Shoulder* bones (the girdle), not
 *     the upper-arm bones: rotating LeftArm/RightArm levers the hands through
 *     a 30 mm arc and reads as jitter, especially on a tripod patient whose
 *     hands should stay planted on the knees.
 *   • Arm / forearm drift — two incommensurate sines per side so unbraced
 *     limbs settle and resettle instead of holding one frozen pose. Off while
 *     the patient is braced (tripod / hard accessory use): still arms plus a
 *     heaving chest is the finding, not a garnish sway.
 *
 * Amplitudes are radians and intentionally tiny — this should register as
 * "alive" in peripheral vision, never as a gesture.
 *
 * Pure + allocation-free (fills a caller-owned `out`), same discipline as
 * `computePatientMotionSignals`.
 */

export interface IdleLimbMotion {
  /** Applied to both shoulder bones — breathing-coupled, rate-scaled. */
  shoulderLift: number;
  leftArmDrift: number;
  rightArmDrift: number;
  leftForeArmDrift: number;
  rightForeArmDrift: number;
  /** Recumbent leg drift — a resting leg's knee never holds one angle. */
  leftKneeDrift: number;
  rightKneeDrift: number;
}

export interface IdleLimbMotionInput {
  /** Seconds since mount. */
  time: number;
  /** Eased consciousness gate 0..1. Unconscious stillness is a finding. */
  gate: number;
  /** Breath phase 0..1 from the shared breathing clock (0 = inhalation onset). */
  breathPhase01: number;
  /** Live respiratory rate (breaths/min). 0 = apnoea → no respiratory lift. */
  respiratoryRate: number;
  /**
   * Scenario-declared work of breathing, 0..1, from `PatientVisualState`.
   * The rate alone under-reads cases like severe asthma, where accessory
   * muscle use is obvious before the rate looks alarming — so the scenario
   * can raise the recruitment independently. Apnoea still overrides both.
   */
  breathingEffort?: number;
  /** Adaptive-quality low rung — keep the clinical signal, drop the garnish. */
  reduced?: boolean;
  /**
   * Hands are load-bearing (tripod, frank accessory recruitment). Keep the
   * shoulder shrug but freeze arm/forearm garnish so the planted hands do
   * not wander off the knees.
   */
  braced?: boolean;
}

/** Barely-there shoulder movement at a normal, comfortable respiratory rate. */
const SHOULDER_LIFT_QUIET = 0.003;
/**
 * Full accessory-muscle shrug once the patient is frankly tachypnoeic.
 * Kept small on purpose: this is applied at the shoulder girdle, and even a
 * 3° rotation still travels the hands. 0.018 rad (~1°) is a readable heave
 * without waving the forearms.
 */
const SHOULDER_LIFT_LABOURED = 0.018;
/** Rate at which shoulder involvement starts to become visible. */
const ACCESSORY_ONSET_RPM = 18;
/** Rate at which it is fully recruited. */
const ACCESSORY_FULL_RPM = 34;

const ARM_DRIFT = 0.008;
const FOREARM_DRIFT = 0.006;
/** Resting knee drift — a supine or seated patient's knee joint relaxes by a
 *  fraction of a degree. Kept an order of magnitude below the forearm drift:
 * the knee is a long lever, and 0.006 rad still travels the foot ~40 mm.
 * This is a knee angle, not a foot swing — the foot stays planted. */
const KNEE_DRIFT = 0.0009;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * How much the shoulders should ride with each breath.
 *
 * Recruitment is the WORSE of what the rate implies and what the scenario
 * declares, so a severe asthmatic at a not-yet-alarming rate still visibly
 * works to breathe. Apnoea returns 0 regardless — still shoulders on a still
 * chest is itself the finding.
 */
export function accessoryLiftAmplitude(
  respiratoryRate: number,
  breathingEffort = 0,
): number {
  if (respiratoryRate <= 0) return 0;
  const fromRate = clamp01(
    (respiratoryRate - ACCESSORY_ONSET_RPM) / (ACCESSORY_FULL_RPM - ACCESSORY_ONSET_RPM),
  );
  const recruitment = Math.max(fromRate, clamp01(breathingEffort));
  return SHOULDER_LIFT_QUIET + (SHOULDER_LIFT_LABOURED - SHOULDER_LIFT_QUIET) * recruitment;
}

export function computeIdleLimbMotion(
  input: IdleLimbMotionInput,
  out: IdleLimbMotion,
): IdleLimbMotion {
  const {
    time,
    gate,
    breathPhase01,
    respiratoryRate,
    breathingEffort = 0,
    reduced = false,
    braced = false,
  } = input;

  if (gate <= 0) {
    out.shoulderLift = 0;
    out.leftArmDrift = 0;
    out.rightArmDrift = 0;
    out.leftForeArmDrift = 0;
    out.rightForeArmDrift = 0;
    out.leftKneeDrift = 0;
    out.rightKneeDrift = 0;
    return out;
  }

  // Rise with inhalation, fall with exhalation — same 0..1 curve shape the
  // chest morph uses, so shoulders and chest move as one breath.
  const breathRise = 0.5 - 0.5 * Math.cos(breathPhase01 * Math.PI * 2);
  const lift = accessoryLiftAmplitude(respiratoryRate, breathingEffort) * breathRise * gate;
  // Braced hands (tripod) still get a girdle shrug, but a smaller one so the
  // planted contact points do not skate.
  out.shoulderLift = braced ? lift * 0.55 : lift;

  // A resting leg's knee never holds one angle. This is the lowest-cost
  // "alive" cue in the module — a single sine per side, applied to the knee
  // joint only, so the foot stays on the floor/stretcher and nothing above it
  // is disturbed. Measured on resp-001: a supine patient's legs had a 0 mm
  // world-space span across 60 samples and read as a mannequin, while the
  // arms drifted 1.3–4.3 mm. Gated on the reduced rung (iPad tier drops the
  // garnish) but NOT on braced: a tripod patient's planted hands are the
  // clinical finding, their relaxed knees are not.
  if (!reduced) {
    out.leftKneeDrift = (Math.sin(time * 0.34 + 0.7) * 0.6 + Math.sin(time * 0.19) * 0.4) * KNEE_DRIFT * gate;
    out.rightKneeDrift = (Math.sin(time * 0.29 + 3.1) * 0.6 + Math.sin(time * 0.16 + 1.4) * 0.4) * KNEE_DRIFT * gate;
  } else {
    out.leftKneeDrift = 0;
    out.rightKneeDrift = 0;
  }

  if (reduced || braced) {
    out.leftArmDrift = 0;
    out.rightArmDrift = 0;
    out.leftForeArmDrift = 0;
    out.rightForeArmDrift = 0;
    return out;
  }

  // Incommensurate periods (~14s / ~23s and ~17s / ~29s) so the two sides never
  // fall into step and the loop never visibly repeats.
  out.leftArmDrift = (
    Math.sin(time * 0.45) * 0.65 + Math.sin(time * 0.27) * 0.35
  ) * ARM_DRIFT * gate;
  out.rightArmDrift = (
    Math.sin(time * 0.37 + 1.9) * 0.65 + Math.sin(time * 0.21 + 0.6) * 0.35
  ) * ARM_DRIFT * gate;
  out.leftForeArmDrift = Math.sin(time * 0.31 + 2.4) * FOREARM_DRIFT * gate;
  out.rightForeArmDrift = Math.sin(time * 0.25 + 4.1) * FOREARM_DRIFT * gate;

  return out;
}

export function createIdleLimbMotion(): IdleLimbMotion {
  return {
    shoulderLift: 0,
    leftArmDrift: 0,
    rightArmDrift: 0,
    leftForeArmDrift: 0,
    rightForeArmDrift: 0,
    leftKneeDrift: 0,
    rightKneeDrift: 0,
  };
}
