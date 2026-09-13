import type { CaseScenario } from '@/types';

/**
 * Where the treatment-bay patient is staged: on the ambulance stretcher
 * (default) or where the scene actually found them — the floor/ground.
 *
 * This drives the 3D presentation only. It never changes clinical state.
 */
export type PatientStage = 'stretcher' | 'floor';
export type PatientMobility = 'recumbent' | 'seated' | 'standing' | 'pacing';
export type PatientSkeletalAction = 'idle' | 'walk' | null;
export type PatientPosture = 'seated' | 'legs-elevated' | 'tripod' | 'supine' | 'recovery' | null;
export type PatientSupportSurface = 'stretcher' | 'floor' | 'bed' | 'sofa' | 'seat' | 'none';

export interface PatientPacingTransform {
  x: number;
  z: number;
  yaw: number;
}

export interface PatientPositioningOverride {
  mobility: PatientMobility;
  posture: PatientPosture;
  treatmentId: string;
}

export interface PatientPostureContext {
  mobility: PatientMobility;
  isInArrest?: boolean;
  unconscious?: boolean;
  positioningOverride?: PatientPositioningOverride | null;
  respiration?: number | null;
}

export interface PatientLivePositionContext {
  stage: PatientStage;
  mobility: PatientMobility;
  posture: PatientPosture;
  supportSurface?: PatientSupportSurface;
}

export type PatientLivePositionKey =
  | 'pacing'
  | 'standing'
  | 'tripod'
  | 'seated'
  | 'legsElevated'
  | 'seatedBed'
  | 'seatedSofa'
  | 'semiRecumbent'
  | 'semiRecumbentBed'
  | 'recoveryFloor'
  | 'recoveryStretcher'
  | 'recoveryBed'
  | 'recoverySofa'
  | 'supineFloor'
  | 'supineStretcher'
  | 'supineBed'
  | 'supineSofa'
  | 'caregiverTransfer';

export interface PatientLivePositionPresentation {
  key: PatientLivePositionKey;
  fallback: string;
}

const TREATMENT_POSITIONING: Record<string, Omit<PatientPositioningOverride, 'treatmentId'>> = {
  supine_position: { mobility: 'recumbent', posture: 'supine' },
  recovery_position: { mobility: 'recumbent', posture: 'recovery' },
  fowlers_position: { mobility: 'seated', posture: 'tripod' },
  left_lateral_tilt: { mobility: 'recumbent', posture: 'recovery' },
  leg_elevation: { mobility: 'recumbent', posture: 'supine' },
  assisted_ambulation: { mobility: 'pacing', posture: null },
  assist_delivery: { mobility: 'seated', posture: 'seated' },
  main_stretcher: { mobility: 'recumbent', posture: 'supine' },
  scoop_stretcher: { mobility: 'recumbent', posture: 'supine' },
  spinal_board: { mobility: 'recumbent', posture: 'supine' },
  vacuum_mattress: { mobility: 'recumbent', posture: 'supine' },
};

/** Devices that physically load the patient onto a trolley or transfer board. */
export const STRETCHER_LOAD_TREATMENT_IDS = [
  'main_stretcher',
  'scoop_stretcher',
  'spinal_board',
  'vacuum_mattress',
] as const;

export function patientLoadedOnStretcher(appliedTreatmentIds: readonly string[]): boolean {
  return appliedTreatmentIds.some(id =>
    (STRETCHER_LOAD_TREATMENT_IDS as readonly string[]).includes(id),
  );
}

// ponytail: keyword staging over authored per-case data — explicit ground
// words only, so an ambiguous scene stays on the stretcher (clinically fine:
// the crew moved them). Upgrade path: an authored `sceneStage` field per case.
const FLOOR_PATTERN = new RegExp(
  [
    'on the floor',
    'on the ground',
    '\\bfloor\\b',
    '\\bground\\b',
    '\\bcollapsed\\b',
    'found down',
    '\\broadside\\b',
    '\\bstreet\\b',
    '\\bpavement\\b',
    '\\bsidewalk\\b',
    '\\bkerb\\b',
    '\\bcurb\\b',
    'car park',
    'parking lot',
    '\\bpitch\\b',
    '\\bfield\\b',
    '\\bbeach\\b',
    '\\bpoolside\\b',
    '\\bpool deck\\b',
    '\\bat (?:the )?base of (?:the )?steps\\b',
  ].join('|'),
);

/**
 * Derive the presentation stage from the scene's own words — where the
 * patient was found is part of the clinical story ("treat them where they
 * lie"), so a collapsed/roadside patient renders on the ground instead of
 * magically pre-loaded onto the stretcher.
 */
export function deriveScenePatientStage(caseData: CaseScenario): PatientStage {
  const text = [
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.dispatchInfo?.callReason,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return FLOOR_PATTERN.test(text) ? 'floor' : 'stretcher';
}

/**
 * Translate authored free-text positions into a small, renderable movement
 * contract.  This deliberately uses the initial-presentation position only:
 * a location containing words such as "street" must not make a supine trauma
 * patient walk, and a differential mentioning agitation must not override the
 * pose the crew actually finds.
 */
export function derivePatientMobility(
  caseData: CaseScenario,
  unconscious = false,
): PatientMobility {
  if (unconscious) return 'recumbent';
  const position = (caseData.initialPresentation?.position ?? '').toLowerCase();

  if (/\bpacing\b|\bwalking\b|\bwandering\b|\bambulatory\b/.test(position)) {
    return 'pacing';
  }
  if (/\bstanding\b|\bstood\b|\bon (?:their|his|her) feet\b/.test(position)) {
    return 'standing';
  }
  // Sitting with legs elevated is a seated pose — patient remains upright despite hypotension
  if (/\bsitting with legs elevated\b/.test(position)) {
    return 'seated';
  }
  if (
    /\bsitting\b|\bseated\b|\bsemi[- ]recumbent\b|\bsemi[- ]reclined\b|\bchair\b|\bdriver(?:'s)? seat\b|\blap\b|\bbeing held\b|\btripod\b|\bbleaning against\b/.test(
      position,
    )
  ) {
    return 'seated';
  }
  return 'recumbent';
}

/** Derive a clinically plausible authored posture without conflating all seats. */
export function derivePatientPosture(
  caseData: CaseScenario,
  context: PatientPostureContext,
): PatientPosture {
  const {
    mobility,
    isInArrest = false,
    unconscious = false,
    positioningOverride = null,
    respiration = null,
  } = context;
  if (isInArrest) return 'supine';
  if (positioningOverride) return positioningOverride.posture;
  if (unconscious) return 'supine';

  const authoredPosition = caseData.initialPresentation?.position?.toLowerCase() ?? '';
  if (/recovery position|curled on (?:their |his |her )?side|lying on (?:their |his |her )?side|lying on (?:the )?(?:left|right) lateral side/.test(authoredPosition)) {
    return 'recovery';
  }

  const breathingContext = `${caseData.category ?? ''} ${caseData.subcategory ?? ''} ${caseData.title ?? ''} ${caseData.dispatchInfo?.callReason ?? ''}`;
  const tachypnoeaWithoutTripod = /panic|anxiety|hyperventilat|labour|labor|kussmaul|metabolic/i.test(breathingContext);
  // A fast rate alone does not establish respiratory bracing: pain, bleeding
  // and heat illness can all raise RR while the authored patient stays seated.
  // This is a pose-selection cue, not a diagnostic or treatment threshold.
  const respiratoryDistress = !tachypnoeaWithoutTripod
    && /asthma|copd|respiratory failure|shortness of breath|wheez|dyspn|breathless|pulmonary (?:oedema|edema)/i.test(breathingContext)
    && (respiration == null || respiration >= 24);

  if (mobility === 'recumbent') return 'supine';
  if (mobility === 'seated') {
    if (/\bsemi[- ]recumbent\b|\bsemi[- ]reclined\b/.test(authoredPosition)) return 'seated';
    if (/sitting with legs elevated|legs elevated|feet elevated/.test(authoredPosition)) {
      return 'legs-elevated';
    }
    const explicitTripod = /\btripod\b/.test(authoredPosition)
      || (!tachypnoeaWithoutTripod && /leaning forward/.test(authoredPosition));
    return explicitTripod || respiratoryDistress
      ? 'tripod'
      : 'seated';
  }
  if (mobility === 'standing' || mobility === 'pacing') return null;
  return respiratoryDistress ? 'tripod' : 'supine';
}

/**
 * Describe the patient's CURRENT rendered position, not merely the arrival
 * prose.  This keeps the cockpit truthful after a transfer, a recovery roll,
 * Fowler positioning or an assisted walk.  Caregiver-held infants are moved
 * onto the trolley for an immediate hands-on assessment; call that transition
 * out explicitly so the live model does not appear to contradict dispatch.
 */
export function patientLivePositionPresentation(
  caseData: CaseScenario,
  context: PatientLivePositionContext,
): PatientLivePositionPresentation {
  const { stage, mobility, posture } = context;
  const supportSurface = context.supportSurface ?? (stage === 'floor' ? 'floor' : 'stretcher');
  if (mobility === 'pacing') return { key: 'pacing', fallback: 'Walking / pacing in scene' };
  if (mobility === 'standing') return { key: 'standing', fallback: 'Standing at scene' };
  if (mobility === 'seated') {
    const arrivalPosition = caseData.initialPresentation?.position?.toLowerCase() ?? '';
    if (/\bsemi[- ]recumbent\b|\bsemi[- ]reclined\b/.test(arrivalPosition)) {
      if (supportSurface === 'bed') return { key: 'semiRecumbentBed', fallback: 'Supported semi-recumbent on scene bed' };
      return { key: 'semiRecumbent', fallback: 'Supported semi-recumbent position' };
    }
    if (supportSurface === 'bed') return { key: 'seatedBed', fallback: 'Seated on scene bed' };
    if (supportSurface === 'sofa') return { key: 'seatedSofa', fallback: 'Seated on scene sofa' };
    if (posture === 'legs-elevated') {
      return { key: 'legsElevated', fallback: 'Sitting with legs elevated' };
    }
    return posture === 'tripod'
      ? { key: 'tripod', fallback: 'Seated in tripod position' }
      : { key: 'seated', fallback: 'Seated with support' };
  }

  if (posture === 'recovery') {
    if (supportSurface === 'floor') return { key: 'recoveryFloor', fallback: 'Recovery position on scene floor' };
    if (supportSurface === 'bed') return { key: 'recoveryBed', fallback: 'Recovery position on scene bed' };
    if (supportSurface === 'sofa') return { key: 'recoverySofa', fallback: 'Recovery position on scene sofa' };
    return { key: 'recoveryStretcher', fallback: 'Recovery position on ambulance stretcher' };
  }
  const position = supportSurface === 'floor'
    ? { key: 'supineFloor' as const, label: 'Supine on scene floor' }
    : supportSurface === 'bed'
      ? { key: 'supineBed' as const, label: 'Supine on scene bed' }
      : supportSurface === 'sofa'
        ? { key: 'supineSofa' as const, label: 'Supine on scene sofa' }
        : { key: 'supineStretcher' as const, label: 'Supine on ambulance stretcher' };
  const arrivalPosition = caseData.initialPresentation?.position?.toLowerCase() ?? '';
  return supportSurface === 'stretcher' && /\bheld by\b|\bbeing held\b|\bon .+ lap\b/.test(arrivalPosition)
    ? { key: 'caregiverTransfer', fallback: `${position.label} — transferred from caregiver for assessment` }
    : { key: position.key, fallback: position.label };
}

export function patientLivePositionLabel(
  caseData: CaseScenario,
  context: PatientLivePositionContext,
): string {
  return patientLivePositionPresentation(caseData, context).fallback;
}

/** Only ambulatory patients receive whole-skeleton locomotion. */
export function patientSkeletalAction(
  mobility: PatientMobility,
  unconscious = false,
): PatientSkeletalAction {
  if (unconscious) return null;
  // Walk is the only donor clip that earns its keep. Mixamo idle fights the
  // fitted rest pose and reads as high-frequency jitter on standing patients;
  // procedural limb drift already supplies the "alive" cue.
  if (mobility === 'pacing') return 'walk';
  return null;
}

/** Scene support furniture must match the patient's rendered mobility. */
export function shouldShowPatientSeat(
  mobility: PatientMobility,
  loadedOnStretcher = false,
): boolean {
  // Once loaded, the trolley is the seat — do not keep a scene chair under them.
  if (loadedOnStretcher) return false;
  return mobility === 'seated';
}

/** A stretcher should never intersect a patient who is upright or on scene ground. */
export function shouldHideTreatmentStretcher(
  stage: PatientStage,
  mobility: PatientMobility,
  loadedOnStretcher = false,
): boolean {
  if (mobility === 'standing' || mobility === 'pacing') return true;
  if (loadedOnStretcher) return false;
  return stage === 'floor' || mobility !== 'recumbent';
}

/**
 * Applying a stretcher / scoop / board moves the patient off the floor they
 * were found on. Scene staging still decides the arrival pose.
 */
export function deriveAppliedPatientStage(
  sceneStage: PatientStage,
  appliedTreatmentIds: readonly string[] = [],
): PatientStage {
  return patientLoadedOnStretcher(appliedTreatmentIds) ? 'stretcher' : sceneStage;
}

/**
 * The support under the patient must match the authored scene until the crew
 * deliberately transfers them. `stretcher` remains the safe fallback for
 * ambiguous recumbent cases, while explicit beds and sofas stay visible.
 */
export function derivePatientSupportSurface(
  caseData: CaseScenario,
  context: {
    stage: PatientStage;
    mobility: PatientMobility;
    loadedOnStretcher?: boolean;
  },
): PatientSupportSurface {
  const { stage, mobility, loadedOnStretcher = false } = context;
  if (loadedOnStretcher) return 'stretcher';
  if (stage === 'floor') return 'floor';
  if (mobility === 'standing' || mobility === 'pacing') return 'none';

  const authoredSupport = caseData.sceneInfo?.patientSupportSurface;
  if (authoredSupport) return authoredSupport;

  const position = caseData.initialPresentation?.position?.toLowerCase() ?? '';
  if (/\b(?:bed|examination couch|bunk|mattress|cot|camp bed)\b/.test(position)) return 'bed';
  if (/\b(?:sofa|couch|settee)\b/.test(position)) return 'sofa';
  if (mobility === 'seated') return 'seat';
  return 'stretcher';
}

/**
 * Seat furniture kind, derived from dispatch text. A patient "sitting in an
 * armchair" must rest in an upholstered chair rather than the scene's default
 * wooden dining / office chair, and an office chair stays a desk chair even
 * inside a home scene. Returns null when the variant default is right, so
 * generic "chair / seat / bench" positions keep the current look.
 */
export type PatientSeatKind = 'cushion' | 'desk' | null;

export function derivePatientSeatKind(caseData: CaseScenario): PatientSeatKind {
  const position = caseData.initialPresentation?.position?.toLowerCase() ?? '';
  if (/\b(?:armchair|arm chair|lounge chair|club chair|recliner|wingback|upholstered)\b/.test(position)) {
    return 'cushion';
  }
  if (/\b(?:office chair|desk chair|task chair|computer chair)\b/.test(position)) {
    return 'desk';
  }
  return null;
}

/**
 * Which body region the patient is guarding / clutching / self-splinting, or
 * null when they present with a neutral arm pose. Authored cases describe
 * these presentations explicitly ("holding back of neck", "clutching chest",
 * "guarding lower abdomen", "universal choking sign") and the render must
 * match — a cardiac patient clutching their chest cannot present with both
 * hands resting in their lap, and a choking patient needs the universal sign.
 *
 * The general impression, appearance and position prose are joined so a guard
 * cue hidden in any one field is still caught. Ordering is deliberate:
 * unambiguous, high-specificity presentations (choking, neck) are matched
 * before the looser torso regions.
 */
export type HandGuardRegion = 'neck' | 'head' | 'chest' | 'abdomen' | 'choking' | null;

export function deriveHandGuardRegion(caseData: CaseScenario): HandGuardRegion {
  const haystack = [
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.position,
  ].filter((s): s is string => typeof s === 'string').join(' ').toLowerCase();

  // "Clutching throat / universal choking sign" — the two-handed front-of-neck
  // gesture. Match before the generic neck guard so "choking" never degrades.
  if (/clutching (?:the |their |his |her )?(?:throat|neck|airway)|universal choking sign|choking sign/.test(haystack)) {
    return 'choking';
  }

  // Neck guard / c-spine self-splint ("holding back of neck", "supporting
  // cervical spine"). Distinct from "holding head" below.
  if (/\bholding (?:back of |posterior |the |their |his |her )?(?:neck|c[- ]?spine|cervical spine)\b|self[- ]?splint(?:ing)? (?:the |their |his |her )?(?:neck|c[- ]?spine)|supporting (?:the |their |his |her )?(?:neck|c[- ]?spine)|cradling (?:the |their |his |her )?(?:neck|c[- ]?spine)/.test(haystack)) {
    return 'neck';
  }

  // Holding/cradling the head (e.g. headache) — distinct from the c-spine.
  if (/\bholding (?:the |their |his |her )?head\b|clutching (?:the |their |his |her )?head\b|cradling (?:the |their |his |her )?head\b/.test(haystack)) {
    return 'head';
  }

  // Abdominal guarding ("clutching/guarding/gripping abdomen", "holding the
  // right lower quadrant"). Before chest so a quadrant read maps correctly.
  if (/clutching (?:the |their |his |her )?abdomen|guarding (?:the |their |his |her )?(?:abdomen|lower abdomen|stomach)|gripping (?:the |their |his |her )?(?:abdomen|stomach)|holding (?:the |their |his |her )?(?:right|left) (?:lower|upper) quadrant/.test(haystack)) {
    return 'abdomen';
  }

  // Chest clutching ("clutching chest", "holding chest", "hand on chest").
  if (/clutching (?:the |their |his |her )?chest|holding (?:the |their |his |her )?(?:chest|right side of (?:the )?chest|left side of (?:the )?chest)|hand on chest/.test(haystack)) {
    return 'chest';
  }

  return null;
}

/** Local upper-arm rotation that turns the donor clip's A-pose into rest. */
export function patientArmRestRadians(
  mobility: PatientMobility,
  unconscious = false,
  ageYears?: number,
): number {
  const paediatricScale = typeof ageYears === 'number' && ageYears < 2
    ? 0.49
    : typeof ageYears === 'number' && ageYears < 6
      ? 0.63
      : typeof ageYears === 'number' && ageYears < 12
        ? 0.78
        : 1;
  // The source walk keeps useful opposing arm swing, but its shoulders retain
  // too much of the capture A-pose. This smaller additive offset brings the
  // hands into a natural gait envelope without flattening the authored swing.
  if (mobility === 'pacing') return 0.42 * paediatricScale;
  if (mobility === 'seated') return 0.72 * paediatricScale;
  // A recumbent patient needs almost the same shoulder adduction as a seated
  // patient. The old 0.28 offset only removed part of the donor A-pose, so a
  // supine patient appeared to hold both arms tensely above the floor instead
  // of letting their upper arms settle beside the torso. Keep a little more
  // clearance than the seated pose for radial-pulse access and attached kit.
  if (mobility === 'recumbent') return 0.58 * paediatricScale;
  return !unconscious ? 0.65 : 0;
}

/** Local forearm correction that lets a recumbent patient's hands settle. */
export function patientForearmRestRadians(
  mobility: PatientMobility,
  ageYears?: number,
): number {
  if (mobility !== 'recumbent') return 0;
  // The fitted Mixamo bind pose bends both forearms forward by roughly 20 cm.
  // Once the patient is rotated supine that depth becomes vertical height,
  // leaving both hands suspended above the floor. Rotate the forearms back to
  // the upper-arm support plane. Use a slightly softer angle for very small
  // children to preserve clearance around the proportionally larger torso.
  if (typeof ageYears === 'number' && ageYears < 2) return -1.1;
  if (typeof ageYears === 'number' && ageYears < 6) return -1.2;
  if (typeof ageYears === 'number' && ageYears < 12) return -1.3;
  return -1.4;
}

/** Mirrored in-plane sweep that brings recumbent hands down beside the hips. */
export function patientForearmSweepRadians(
  mobility: PatientMobility,
  side: 'left' | 'right',
  ageYears?: number,
): number {
  if (mobility !== 'recumbent') return 0;
  const ageScale = typeof ageYears === 'number' && ageYears < 2
    ? 0.7
    : typeof ageYears === 'number' && ageYears < 6
      ? 0.8
      : typeof ageYears === 'number' && ageYears < 12
        ? 0.9
        : 1;
  return (side === 'left' ? -1 : 1) * ageScale;
}

/** Per-spine-bone flexion for the respiratory tripod silhouette. */
export function patientSpineLeanRadians(posture: PatientPosture, ageYears?: number): number {
  // Split roughly 15° across Spine + Spine1. Applying this through the fitted
  // rig keeps the abdomen, chest and shoulder sockets continuous; the former
  // vertex-space torso morph tore at both axillae when the arms were lowered.
  if (posture !== 'tripod') return 0;
  if (typeof ageYears === 'number' && ageYears < 2) return 0.08;
  if (typeof ageYears === 'number' && ageYears < 6) return 0.1;
  return 0.13;
}

/**
 * Compact out-and-back path for an observed walk in the treatment bay.
 *
 * A Mixamo walk clip is intentionally in-place; without a matching root path
 * the feet move but the patient remains fixed like a treadmill mannequin.
 * This path adds real displacement, a gentle turn into the direction of
 * travel and a few centimetres of depth variation while keeping the patient
 * inside the examination zone. The trigonometric loop is continuous at the
 * turnaround points, so there is no root snap for students to notice.
 */
export function patientPacingTransform(timeSeconds: number): PatientPacingTransform {
  const safeTime = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0;
  const phase = safeTime * ((Math.PI * 2) / 3.2);
  const direction = Math.cos(phase);

  return {
    x: Math.sin(phase) * 0.32,
    z: (1 - Math.cos(phase * 2)) * 0.025,
    // Face partly into the path rather than sliding sideways. atan keeps the
    // turn smooth as direction reverses at each end of the short walk.
    yaw: Math.atan(direction * 2.4) * 0.3,
  };
}

/**
 * The last positioning intervention is the patient's current position. This
 * closes the treatment-to-visual loop: applying recovery/Fowler's/supine or
 * assisted ambulation must move the rendered patient, not only change vitals.
 */
export function deriveTreatmentPositioningOverride(
  appliedTreatmentIds: readonly string[],
): PatientPositioningOverride | null {
  for (let index = appliedTreatmentIds.length - 1; index >= 0; index -= 1) {
    const treatmentId = appliedTreatmentIds[index];
    const positioning = TREATMENT_POSITIONING[treatmentId];
    if (positioning) return { ...positioning, treatmentId };
  }
  return null;
}
