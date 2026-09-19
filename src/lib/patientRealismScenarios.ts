import type { CaseScenario, VitalSigns } from '@/types';
import { inferInjuries, type BodyRegion } from '@/lib/injuryMap';

export type ProblemFamily =
  | 'trauma'
  | 'respiratory'
  | 'cardiac'
  | 'toxicology'
  | 'metabolic'
  | 'neurology'
  | 'infection'
  | 'burns'
  | 'obstetric'
  | 'pediatric'
  | 'behavioural'
  | 'gastrointestinal'
  | 'environmental';

export type RealismVisualEffectKind =
  | 'cyanosis'
  | 'diaphoresis'
  | 'flushing'
  | 'pallor'
  | 'mottling'
  | 'rash'
  | 'facial_swelling'
  | 'pinpoint_pupils'
  | 'dilated_pupils'
  | 'facial_droop'
  | 'tremor'
  | 'seizure_activity'
  | 'burn_pattern'
  | 'soot'
  | 'active_bleeding'
  | 'blood_pool'
  | 'open_wound'
  | 'deformity'
  | 'asymmetric_chest_rise'
  | 'accessory_muscle_use'
  | 'reduced_chest_rise'
  | 'vomit_risk';

export type EquipmentAnchorRegion =
  | 'face'
  | 'mouth'
  | 'nose'
  | 'neck'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'left-leg'
  | 'right-leg'
  | 'abdomen'
  | 'pelvis'
  | 'posterior'
  | 'scene';

export interface RealismVisualEffect {
  id: string;
  kind: RealismVisualEffectKind;
  region: EquipmentAnchorRegion;
  intensity: 'subtle' | 'moderate' | 'severe';
  showWhen: 'immediate' | 'on-assessment' | 'after-treatment' | 'if-deteriorating';
  clearsWhen?: string[];
  detail: string;
}

export interface EquipmentAnchorSpec {
  treatmentIdFragments: string[];
  region: EquipmentAnchorRegion;
  appearance: string;
  fitRule: string;
  shouldNotBlock: string[];
  activeEffect?: string;
  reassess: string[];
}

export interface PatientBehaviorRule {
  id: string;
  when: string;
  responseType: 'cooperate' | 'refuse' | 'gag' | 'guard' | 'agitate' | 'improve' | 'deteriorate' | 'silent';
  quote?: string;
  debrief: string;
}

export interface TreatmentResponseRule {
  treatmentIdFragments: string[];
  expectedFit: 'matched' | 'partial' | 'mismatch' | 'harmful' | 'blocked';
  visualResult: string[];
  vitalTrajectory: string[];
  reassessment: string[];
  patientBehavior: string[];
  debriefSignal: string;
}

export interface RealismScenarioSpec {
  id: string;
  family: ProblemFamily;
  match: string[];
  priority: number;
  activeProblems: string[];
  immediateVisuals: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
}

export interface ScenarioRealismState {
  matchedScenarioIds: string[];
  families: ProblemFamily[];
  activeProblems: string[];
  /** Effects that are physically present on the patient at this live moment. */
  activeVisualEffects: RealismVisualEffect[];
  /** Full scenario visual context retained for coaching and debrief. */
  visualEffects: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
}

export interface ScenarioRealismInput {
  caseData: CaseScenario;
  vitals?: VitalSigns | null;
  appliedTreatmentIds?: string[];
}

const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

function list(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function collectCaseText(caseData: CaseScenario): string {
  return [
    caseData.id,
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.priority,
    caseData.complexity,
    caseData.dispatchInfo?.callReason,
    caseData.dispatchInfo?.location,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
    ...(caseData.sceneInfo?.hazards || []),
    ...(caseData.sceneInfo?.accessIssues || []),
    caseData.sceneInfo?.bystanders,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.consciousness,
    ...(caseData.initialPresentation?.sounds || []),
    ...(caseData.abcde?.airway?.findings || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
    ...(caseData.abcde?.breathing?.percussion || []),
    ...(caseData.abcde?.circulation?.findings || []),
    ...list(caseData.abcde?.disability?.pupils),
    ...(caseData.abcde?.disability?.findings || []),
    ...(caseData.abcde?.disability?.focalDeficits || []),
    caseData.abcde?.disability?.seizureActivity,
    ...(caseData.abcde?.exposure?.findings || []),
    ...(caseData.abcde?.exposure?.wounds || []),
    ...(caseData.abcde?.exposure?.rashes || []),
    ...(caseData.abcde?.exposure?.deformities || []),
    ...(caseData.secondarySurvey?.head || []),
    ...(caseData.secondarySurvey?.neck || []),
    ...(caseData.secondarySurvey?.chest || []),
    ...(caseData.secondarySurvey?.abdomen || []),
    ...(caseData.secondarySurvey?.pelvis || []),
    ...(caseData.secondarySurvey?.extremities || []),
    ...(caseData.secondarySurvey?.posterior || []),
    ...(caseData.secondarySurvey?.neurological || []),
    ...(caseData.expectedFindings?.keyObservations || []),
    // Red flags and differentials are teaching prompts, not active findings.
    // Matching them rendered complications that the current patient did not have.
    caseData.expectedFindings?.mostLikelyDiagnosis,
    caseData.history?.eventsLeading,
    ...(caseData.history?.medicalConditions || []),
  ]
    .filter(Boolean)
    .map(part => stripNegatedClauses(String(part)))
    .join(' ')
    .toLowerCase();
}

/**
 * Negative findings must not trigger scenarios: "No rashes", "No stridor or
 * gurgling", "No wheeze" are AUTHORED to rule conditions OUT, but substring
 * matching read them as rule-ins (a heart-block case was matching the
 * anaphylaxis scenario off its own pertinent negatives). Strip from the
 * negation word to the end of the clause.
 */
function stripNegatedClauses(part: string): string {
  return part.replace(/\b(?:no|denies|denying|without|nil)\b[^.;]*/gi, ' ');
}

const keywordPatternCache = new Map<string, RegExp>();

function matchesKeyword(text: string, keyword: string): boolean {
  const key = keyword.toLowerCase().trim();
  let pattern = keywordPatternCache.get(key);
  if (!pattern) {
    // Word-boundary match — plain includes() let 'stab' match "Stable" and
    // similar substrings inside unrelated words. Common inflections still
    // count ('rash' → "rashes", 'fall' → "falling").
    pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es|ed|ing)?\\b`);
    keywordPatternCache.set(key, pattern);
  }
  return pattern.test(text);
}

function hasTraumaOpenWoundContext(caseData: CaseScenario, text: string): boolean {
  const categoryText = [caseData.category, caseData.subcategory]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\btrauma\b|injur|burn|fracture|wound|bleed|haemorrhage|hemorrhage/.test(categoryText)) {
    return true;
  }

  return Boolean(
    /\b(mvc|mva|rtc|collision|crash|fall|fell|stab|stabbing|gunshot|penetrating|blunt|crush|blast)\b/.test(text)
      || /\b(open|sucking|penetrating)\s+(chest\s+)?wound\b/.test(text)
      || /\b(bleeding|haemorrhage|hemorrhage)\s+(from|out of|at)\b/.test(text)
      || /\b(external|uncontrolled|catastrophic)\s+(bleeding|haemorrhage|hemorrhage)\b/.test(text)
      || /\b(amputation|tourniquet|chest seal|occlusive dressing|blood pool|deformity|pelvic|flail|pneumothorax)\b/.test(text)
  );
}

function scenarioMatchesCase(scenario: RealismScenarioSpec, caseData: CaseScenario, text: string): boolean {
  if (!scenario.match.some(keyword => matchesKeyword(text, keyword))) return false;

  if (scenario.id === 'trauma-haemorrhage-open-chest') {
    return hasTraumaOpenWoundContext(caseData, text);
  }

  if (scenario.id === 'anaphylaxis-systemic') {
    // Rash, stridor and facial swelling are not specific to allergy. In
    // particular, "road rash" in an RTC used to outrank the trauma scenario
    // and label a shocked fracture patient as anaphylaxis. Require a current
    // allergic diagnosis, trigger or urticarial finding; remote history and
    // unrelated injury descriptions must not activate this systemic scenario.
    const currentAllergyText = [
      caseData.id,
      caseData.title,
      caseData.category,
      caseData.subcategory,
      caseData.dispatchInfo?.callReason,
      ...(caseData.dispatchInfo?.additionalInfo ?? []),
      caseData.initialPresentation?.generalImpression,
      caseData.initialPresentation?.appearance,
      ...(caseData.abcde?.airway?.findings ?? []),
      ...(caseData.abcde?.breathing?.findings ?? []),
      caseData.abcde?.circulation?.skin,
      ...(caseData.abcde?.circulation?.findings ?? []),
      ...(caseData.abcde?.exposure?.findings ?? []),
      ...(caseData.abcde?.exposure?.rashes ?? []),
      caseData.expectedFindings?.mostLikelyDiagnosis,
      caseData.history?.eventsLeading,
    ]
      .filter(Boolean)
      .map(value => stripNegatedClauses(String(value)))
      .join(' ')
      .toLowerCase();

    return /\b(anaphylaxis|anaphylactic|allerg\w*|urticaria|urticarial|hives|angioedema|bee sting|insect sting|shellfish|prawns?|peanuts?|nut[- ]containing)\b/.test(currentAllergyText);
  }

  if (scenario.id === 'toxicology-opioid-hypoventilation') {
    // Unconsciousness and slow breathing also occur in head injury and shock.
    // Require an actual opioid/overdose clue before adding pinpoint pupils,
    // naloxone behaviour and an opioid label to the patient.
    const currentToxicologyText = [
      caseData.id,
      caseData.title,
      caseData.category,
      caseData.subcategory,
      caseData.dispatchInfo?.callReason,
      ...(caseData.dispatchInfo?.additionalInfo ?? []),
      caseData.initialPresentation?.generalImpression,
      caseData.initialPresentation?.appearance,
      ...(caseData.abcde?.airway?.findings ?? []),
      ...(caseData.abcde?.breathing?.findings ?? []),
      ...list(caseData.abcde?.disability?.pupils),
      ...(caseData.abcde?.disability?.findings ?? []),
      ...(caseData.abcde?.exposure?.findings ?? []),
      caseData.expectedFindings?.mostLikelyDiagnosis,
      caseData.history?.eventsLeading,
    ]
      .filter(Boolean)
      .map(value => stripNegatedClauses(String(value)))
      .join(' ')
      .toLowerCase();

    return /\b(opioid|opiate|heroin|fentanyl|morphine|methadone|oxycodone|codeine|naloxone|narcan|pinpoint pupils?|miosis|needle tracks?|drug overdose)\b/.test(currentToxicologyText);
  }

  if (scenario.id === 'neurology-stroke-seizure') {
    // "FAST" is also ordinary prose (for example "breathing fast from
    // pain"). Require a genuine focal-neurology, seizure or pupil cue so a
    // painful fracture cannot acquire stroke eyes or facial asymmetry.
    return /\b(stroke|facial droop|facial asymmetr\w*|arm drift|slurred speech|gaze deviat\w*|unilateral weakness|hemip\w*|seizure|postictal|post-ictal|unequal pupils|anisocoria|blown pupil|fast positive|positive fast)\b/.test(text);
  }

  return true;
}

function hasTreatment(appliedTreatmentIds: string[], fragments: string[]): boolean {
  return appliedTreatmentIds.some(id =>
    fragments.some(fragment => id.toLowerCase().includes(fragment.toLowerCase())),
  );
}

function parseSystolic(bp: string | undefined): number | undefined {
  if (!bp) return undefined;
  const match = String(bp).match(/\d{2,3}/);
  return match ? Number(match[0]) : undefined;
}

function sourceVitals(caseData: CaseScenario, vitals?: VitalSigns | null): VitalSigns | undefined {
  return vitals ?? caseData.vitalSignsProgression?.initial;
}

function isPhysiologyDeteriorating(caseData: CaseScenario, vitals?: VitalSigns | null): boolean {
  const source = sourceVitals(caseData, vitals);
  const sbp = parseSystolic(source?.bp);
  return Boolean(
    (typeof source?.spo2 === 'number' && source.spo2 < 92)
      || (typeof source?.respiration === 'number' && (source.respiration < 10 || source.respiration > 30))
      || (typeof source?.pulse === 'number' && (source.pulse < 45 || source.pulse > 130))
      || (typeof source?.gcs === 'number' && source.gcs <= 8)
      || (typeof sbp === 'number' && sbp < 90),
  );
}

function shouldShowVisualEffect(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): boolean {
  // Check clearing conditions first — if met, visual is suppressed
  if (effect.clearsWhen && effect.clearsWhen.length > 0) {
    if (isVisualCleared(effect, appliedTreatmentIds, caseData, vitals)) return false;
  }

  switch (effect.showWhen) {
    case 'immediate':
    case 'on-assessment':
      return true;
    case 'if-deteriorating':
      return isPhysiologyDeteriorating(caseData, vitals);
    case 'after-treatment':
      return appliedTreatmentIds.length > 0;
    default:
      return true;
  }
}

function shouldIncludeVisualContext(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): boolean {
  switch (effect.showWhen) {
    case 'immediate':
    case 'on-assessment':
      return true;
    case 'if-deteriorating':
      return isPhysiologyDeteriorating(caseData, vitals);
    case 'after-treatment':
      return appliedTreatmentIds.length > 0;
    default:
      return true;
  }
}

/**
 * Check whether a visual effect's clearing conditions are met.
 *
 * clearsWhen rules use keywords that describe either:
 * - A treatment that has been applied (e.g. 'dressing or chest seal applied',
 *   'source control applied correctly', 'glucose corrected')
 * - A physiologic improvement that has occurred (e.g. 'oxygenation improves',
 *   'airway swelling improves')
 *
 * This implementation checks the applied treatments for a semantic match:
 * the clearing condition's key noun must appear in at least one applied treatment ID.
 * Physiologic improvement conditions (vitals-based) fall through as
 * "not yet cleared" — they'd need a vitals-trending-positive check added later.
 */
function isVisualCleared(
  effect: RealismVisualEffect,
  appliedTreatmentIds: string[],
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
): boolean {
  const clearsWhen = effect.clearsWhen ?? [];
  if (clearsWhen.length === 0) return false;

  // Known treatment-to-keyword mapping for clearing conditions
  const CLEAR_TREATMENT_MAP: Record<string, string[]> = {
    'dressing': ['dressing', 'bleeding_control', 'chest_seal', 'occlusive'],
    'chest seal': ['chest_seal', 'occlusive_dressing', 'dressing'],
    'source control': ['bleeding_control', 'tourniquet', 'dressing', 'chest_seal', 'txa'],
    'oxygen': ['oxygen', 'nonrebreather', 'nasal_cannula', 'simple_mask'],
    'oxygenation': ['oxygen', 'nonrebreather', 'bvm', 'ventilat'],
    'ventilation': ['bvm', 'ventilat'],
    'respiratory drive': ['naloxone', 'bvm', 'ventilat'],
    'glucose': ['glucose', 'dextrose', 'glucagon'],
    'bronchodilator': ['nebulizer', 'salbutamol', 'ipratropium'],
    'adrenaline': ['adrenaline', 'epinephrine'],
    'systemic reaction': ['adrenaline', 'epinephrine'],
    'airway swelling': ['adrenaline', 'epinephrine'],
    'naloxone': ['naloxone'],
    'burn dressing': ['dressing', 'burn_dressing', 'cooling'],
    'cooling': ['cooling', 'burn_dressing'],
  };

  const text = appliedTreatmentIds.join(' ').toLowerCase();

  const treatmentMatchesCondition = (lower: string): boolean => {
    if (appliedTreatmentIds.some(id => lower.includes(id.toLowerCase().replace(/_/g, ' ')))) {
      return true;
    }

    return Object.entries(CLEAR_TREATMENT_MAP).some(([keyword, treatments]) =>
      lower.includes(keyword) && treatments.some(t => text.includes(t)),
    );
  };

  const physiologyHasImproved = (lower: string): boolean => {
    const source = vitals ?? undefined;
    const initial = caseData.vitalSignsProgression?.initial;
    if (!source || !initial) return false;

    if (lower.includes('oxygenation')) {
      return typeof initial.spo2 === 'number'
        && initial.spo2 < 94
        && typeof source.spo2 === 'number'
        && source.spo2 >= 94;
    }
    if (lower.includes('respiratory drive') || lower.includes('ventilation')) {
      return (
        (
          (typeof initial.respiration === 'number' && (initial.respiration < 10 || initial.respiration > 24))
          || (typeof initial.spo2 === 'number' && initial.spo2 < 94)
        )
        &&
        typeof source.respiration === 'number'
        && source.respiration >= 10
        && source.respiration <= 24
        && typeof source.spo2 === 'number'
        && source.spo2 >= 94
      );
    }
    if (lower.includes('work of breathing')) {
      return (
        (
          (typeof initial.respiration === 'number' && initial.respiration > 24)
          || (typeof initial.spo2 === 'number' && initial.spo2 < 94)
        )
        &&
        typeof source.respiration === 'number'
        && source.respiration >= 10
        && source.respiration <= 24
        && typeof source.spo2 === 'number'
        && source.spo2 >= 94
      );
    }
    if (lower.includes('airway swelling') || lower.includes('systemic reaction')) {
      return true;
    }

    return false;
  };

  for (const condition of clearsWhen) {
    const lower = condition.toLowerCase();

    if (lower.includes('improves')) {
      const objectivelyMeasured = lower.includes('oxygenation')
        || lower.includes('respiratory drive')
        || lower.includes('ventilation')
        || lower.includes('work of breathing');
      if (physiologyHasImproved(lower) && (objectivelyMeasured || treatmentMatchesCondition(lower))) {
        return true;
      }
      continue;
    }

    if (treatmentMatchesCondition(lower)) {
      return true;
    }
  }

  return false;
}

const oxygenFaceAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['oxygen_mask', 'oxygen_venturi', 'oxygen_nonrebreather', 'nonrebreather', 'simple_mask'],
  region: 'face',
  appearance: 'Transparent oxygen mask sits over nose and mouth with tubing routed away from the eyes.',
  fitRule: 'Mask must seal around nose and mouth, leave eyes visible, and avoid covering neck landmarks.',
  shouldNotBlock: ['eye assessment', 'neck assessment', 'mouth opening assessment'],
  reassess: ['SpO2', 'respiratory rate', 'work of breathing', 'speech tolerance', 'mask tolerance'],
};

const nebulizerAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['nebulizer', 'salbutamol', 'ipratropium'],
  region: 'face',
  appearance: 'Nebulizer mask with medication chamber and visible mist over nose and mouth.',
  fitRule: 'Mask should sit snugly on the face without obscuring eye zoom or neck landmarks.',
  shouldNotBlock: ['eye assessment', 'neck assessment'],
  activeEffect: 'Visible mist while nebulization is running.',
  reassess: ['wheeze', 'air entry', 'SpO2', 'respiratory rate', 'work of breathing'],
};

const ivAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['iv', 'fluids', 'dextrose', 'txa'],
  region: 'right-arm',
  appearance: 'Cannula and transparent dressing on forearm or hand with line attached when fluids/drugs run.',
  fitRule: 'Tape and line must remain on the limb and not cover chest, face, or pulse landmarks.',
  shouldNotBlock: ['radial pulse', 'chest assessment', 'face assessment'],
  reassess: ['site patency', 'BP', 'pulse quality', 'capillary refill', 'lungs', 'mental status'],
};

export const REALISM_SCENARIOS: RealismScenarioSpec[] = [
  {
    id: 'respiratory-bronchospasm',
    family: 'respiratory',
    match: ['asthma', 'copd', 'wheeze', 'bronchospasm', 'respiratory distress', 'short of breath', 'accessory muscle', 'tripod', 'silent chest', 'hypoxia'],
    priority: 80,
    activeProblems: ['bronchospasm', 'increased work of breathing', 'oxygenation risk', 'fatigue risk'],
    immediateVisuals: [
      { id: 'resp-accessory-muscles', kind: 'accessory_muscle_use', region: 'chest', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['work of breathing improves'], detail: 'Neck/chest accessory muscle use should be visible before the student checks numbers.' },
      { id: 'resp-cyanosis-risk', kind: 'cyanosis', region: 'face', intensity: 'moderate', showWhen: 'if-deteriorating', clearsWhen: ['oxygenation improves'], detail: 'Dusky lips/skin appear when hypoxia persists.' },
      { id: 'resp-sweat-distress', kind: 'diaphoresis', region: 'face', intensity: 'subtle', showWhen: 'immediate', clearsWhen: ['work of breathing improves'], detail: 'Anxious respiratory distress can show sweat and restlessness.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, nebulizerAnchor, {
      treatmentIdFragments: ['cpap', 'niv'],
      region: 'face',
      appearance: 'Large sealed NIV mask with straps and pressure tubing.',
      fitRule: 'Mask must be tight but should not cover eyes; tolerance must be reassessed.',
      shouldNotBlock: ['eye assessment', 'neck assessment'],
      activeEffect: 'Pressure support reduces effort only if physiology and tolerance fit.',
      reassess: ['SpO2', 'BP', 'work of breathing', 'mask tolerance', 'mental status'],
    }, {
      treatmentIdFragments: ['bvm', 'ventilation'],
      region: 'face',
      appearance: 'BVM mask appears only during active assisted breaths, with visible chest rise.',
      fitRule: 'Awake ventilating patients resist; do not leave BVM sealed to face unless ventilation is indicated.',
      shouldNotBlock: ['eye assessment', 'neck assessment'],
      activeEffect: 'Assisted chest rise synchronized with selected ventilation rate.',
      reassess: ['chest rise', 'SpO2', 'EtCO2', 'gastric inflation risk'],
    }],
    patientBehavior: [
      { id: 'resp-bvm-awake-refusal', when: 'BVM attempted while awake and ventilating', responseType: 'refuse', quote: 'Stop, I can breathe. What are you doing?', debrief: 'BVM requires ventilatory failure or inability to ventilate, not simple dyspnoea.' },
      { id: 'resp-neb-improves', when: 'bronchodilator matched to bronchospasm', responseType: 'improve', quote: 'It is a bit easier to breathe.', debrief: 'Bronchodilator response should be gradual and reassessed.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'matched', visualResult: ['oxygen device visible on face'], vitalTrajectory: ['SpO2 may improve gradually'], reassessment: ['RR', 'SpO2', 'work of breathing', 'speech tolerance'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen started and reassessed' },
      { treatmentIdFragments: ['nebulizer', 'salbutamol', 'ipratropium'], expectedFit: 'matched', visualResult: ['nebulizer mist visible'], vitalTrajectory: ['wheeze and work of breathing may improve gradually'], reassessment: ['air entry', 'wheeze', 'SpO2'], patientBehavior: ['patient may report easier breathing'], debriefSignal: 'bronchodilator matched to bronchospasm' },
      { treatmentIdFragments: ['bvm'], expectedFit: 'harmful', visualResult: ['patient resists mask if awake'], vitalTrajectory: ['distress may worsen if not indicated'], reassessment: ['ventilatory drive', 'GCS', 'chest rise'], patientBehavior: ['refusal or panic'], debriefSignal: 'assisted ventilation attempted without clear indication' },
    ],
    reassessmentRequirements: ['RR', 'SpO2', 'speech tolerance', 'air entry', 'work of breathing', 'fatigue', 'mask tolerance'],
    debriefSignals: ['time to oxygen', 'time to bronchodilator', 'missed silent chest', 'inappropriate BVM or CPAP'],
  },
  {
    id: 'anaphylaxis-systemic',
    family: 'respiratory',
    match: ['anaphylaxis', 'allergic reaction', 'hives', 'urticaria', 'rash', 'facial swelling', 'lip swelling', 'tongue swelling', 'stridor', 'bee sting', 'peanuts', 'prawns'],
    priority: 95,
    activeProblems: ['anaphylaxis', 'airway swelling risk', 'bronchospasm or stridor', 'distributive shock risk'],
    immediateVisuals: [
      { id: 'ana-rash', kind: 'rash', region: 'chest', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['IM adrenaline improves systemic reaction'], detail: 'Urticaria/redness should be visible on skin surfaces.' },
      { id: 'ana-face-swelling', kind: 'facial_swelling', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['airway swelling improves'], detail: 'Lip/face swelling supports the airway-risk story.' },
      { id: 'ana-shock-look', kind: 'pallor', region: 'face', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Hypotension should look like poor perfusion, not just a number.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'ana-airway-panic', when: 'airway manipulation attempted while awake and swollen', responseType: 'refuse', quote: 'I cannot breathe... please tell me what you are doing.', debrief: 'Airway risk needs calm explanation and rapid definitive treatment.' },
      { id: 'ana-adrenaline-improves', when: 'IM adrenaline given for true anaphylaxis', responseType: 'improve', quote: 'My throat feels a little less tight.', debrief: 'IM adrenaline is the decisive first-line intervention.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['adrenaline', 'epinephrine'], expectedFit: 'matched', visualResult: ['rash/swelling begins to settle gradually'], vitalTrajectory: ['BP and wheeze improve over reassessment cycles'], reassessment: ['airway swelling', 'wheeze/stridor', 'BP', 'repeat adrenaline timing'], patientBehavior: ['breathing and anxiety may improve'], debriefSignal: 'time to IM adrenaline' },
      { treatmentIdFragments: ['antihistamine', 'hydrocortisone', 'steroid'], expectedFit: 'partial', visualResult: ['no immediate reversal of shock'], vitalTrajectory: ['shock persists without adrenaline'], reassessment: ['BP', 'airway', 'wheeze'], patientBehavior: ['patient remains distressed'], debriefSignal: 'adjunct used without definitive adrenaline' },
      { treatmentIdFragments: ['fluids', 'iv'], expectedFit: 'partial', visualResult: ['line visible on arm'], vitalTrajectory: ['supports perfusion but does not replace adrenaline'], reassessment: ['BP', 'pulse', 'lungs', 'skin'], patientBehavior: ['may flinch with IV'], debriefSignal: 'fluids support anaphylactic shock after adrenaline priority' },
    ],
    reassessmentRequirements: ['airway swelling', 'voice change', 'wheeze/stridor', 'BP', 'pulse', 'skin', 'repeat adrenaline timing'],
    debriefSignals: ['time to IM adrenaline', 'over-reliance on antihistamine/steroid', 'failure to reassess airway'],
  },
  {
    id: 'toxicology-opioid-hypoventilation',
    family: 'toxicology',
    match: ['opioid', 'overdose', 'naloxone', 'pinpoint', 'slow respiration', 'slow respiratory rate', 'slow breathing', 'bradypnea', 'hypoventilation', 'respiratory depression', 'unconscious'],
    priority: 90,
    activeProblems: ['opioid toxidrome', 'hypoventilation', 'airway protection risk', 'vomiting risk after reversal'],
    immediateVisuals: [
      { id: 'tox-pinpoint-pupils', kind: 'pinpoint_pupils', region: 'face', intensity: 'severe', showWhen: 'on-assessment', detail: 'Eye zoom should reveal toxidrome-appropriate pupils.' },
      { id: 'tox-slow-chest', kind: 'reduced_chest_rise', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['ventilation or naloxone improves respiratory drive'], detail: 'Chest rise should be small and slow until ventilation improves.' },
      { id: 'tox-vomit-risk', kind: 'vomit_risk', region: 'mouth', intensity: 'moderate', showWhen: 'after-treatment', detail: 'Reversal may create vomiting/aspiration risk.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, {
      treatmentIdFragments: ['bvm', 'ventilation'],
      region: 'face',
      appearance: 'BVM seal with assisted chest rise while ventilation is supported.',
      fitRule: 'Use when respiratory drive is inadequate; reassess mask seal and EtCO2.',
      shouldNotBlock: ['eye assessment'],
      activeEffect: 'Assisted breaths create visible chest rise.',
      reassess: ['RR', 'SpO2', 'EtCO2', 'vomiting', 'GCS'],
    }, ivAnchor],
    patientBehavior: [
      { id: 'tox-naloxone-agitation', when: 'naloxone reverses opioid physiology', responseType: 'agitate', quote: 'What happened... why do I feel sick?', debrief: 'Naloxone response can include agitation, vomiting, or refusal.' },
      { id: 'tox-low-gcs-silent', when: 'low GCS before reversal', responseType: 'silent', debrief: 'Reduced responsiveness should limit cooperation and voice responses.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['naloxone'], expectedFit: 'matched', visualResult: ['respiratory drive and consciousness improve gradually'], vitalTrajectory: ['RR and SpO2 improve if opioid physiology is present'], reassessment: ['RR', 'GCS', 'airway', 'vomiting', 'pupils'], patientBehavior: ['agitation or vomiting possible'], debriefSignal: 'time to naloxone and ventilation support' },
      { treatmentIdFragments: ['bvm', 'oxygen'], expectedFit: 'matched', visualResult: ['oxygen/BVM visible on face'], vitalTrajectory: ['oxygenation supported while antidote takes effect'], reassessment: ['chest rise', 'SpO2', 'EtCO2'], patientBehavior: ['low GCS patient may not cooperate'], debriefSignal: 'ventilation support before or with antidote' },
      { treatmentIdFragments: ['glucose'], expectedFit: 'partial', visualResult: ['no opioid-specific response'], vitalTrajectory: ['minimal change unless hypoglycaemia coexists'], reassessment: ['BGL', 'GCS', 'RR'], patientBehavior: ['no meaningful toxidrome reversal'], debriefSignal: 'glucose checked but opioid physiology still requires ventilation/naloxone' },
    ],
    reassessmentRequirements: ['RR', 'SpO2', 'EtCO2 if available', 'airway', 'vomiting', 'GCS', 'pupils', 'BGL'],
    debriefSignals: ['ventilation before/with antidote', 'time to naloxone', 'missed glucose check', 'airway protection'],
  },
  {
    id: 'metabolic-hypoglycaemia-seizure',
    family: 'metabolic',
    // 'confused' removed — far too generic (any syncope/sepsis/head-injury
    // case says "confused"); the specific keywords carry true hypo cases.
    match: ['hypoglycemia', 'hypoglycaemia', 'diabetic', 'insulin', 'low bgl', 'low glucose', 'blood glucose', 'seizure', 'post-ictal', 'postictal', 'missed meal', 'tremor'],
    priority: 70,
    activeProblems: ['glucose-driven altered mentation', 'airway route decision', 'seizure or post-ictal risk'],
    immediateVisuals: [
      { id: 'metab-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['glucose corrected'], detail: 'Clammy sweat supports hypoglycaemia.' },
      { id: 'metab-tremor', kind: 'tremor', region: 'left-arm', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['glucose corrected'], detail: 'Tremor/restlessness should improve as glucose normalizes.' },
      { id: 'metab-seizure', kind: 'seizure_activity', region: 'chest', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Seizure/post-ictal behavior appears when authored by the case.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'metab-confused', when: 'low glucose with altered mentation', responseType: 'agitate', quote: 'I do not know... I feel strange.', debrief: 'Hypoglycaemia changes cooperation until corrected.' },
      { id: 'metab-glucose-improves', when: 'glucose route matches airway safety', responseType: 'improve', quote: 'I feel a little clearer.', debrief: 'Mental status should improve gradually after correct glucose treatment.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['glucose', 'dextrose', 'glucagon'], expectedFit: 'matched', visualResult: ['diaphoresis/tremor gradually settle'], vitalTrajectory: ['GCS and behavior improve if glucose is the driver'], reassessment: ['repeat BGL', 'GCS/AVPU', 'airway', 'swallow safety'], patientBehavior: ['confusion improves'], debriefSignal: 'correct glucose route and reassessment' },
      { treatmentIdFragments: ['oral_glucose', 'glucose_10g'], expectedFit: 'blocked', visualResult: ['do not leave oral treatment applied if airway unsafe'], vitalTrajectory: ['aspiration risk if low GCS'], reassessment: ['GCS', 'airway safety', 'BGL'], patientBehavior: ['cannot cooperate if low GCS'], debriefSignal: 'unsafe oral glucose attempt' },
    ],
    reassessmentRequirements: ['repeat BGL', 'GCS/AVPU', 'airway', 'ability to swallow', 'seizure recurrence'],
    debriefSignals: ['time to glucose check', 'correct glucose route', 'avoided anchoring'],
  },
  {
    id: 'cardiac-acs-instability',
    family: 'cardiac',
    // 'diaphoresis' removed — sweating is a sign shared by hypoglycaemia,
    // anaphylaxis, heat illness, and ACS; it must not rule cardiac IN.
    match: ['chest pain', 'acs', 'stemi', 'nstemi', 'angina', 'myocardial', 'arrhythmia', 'bradycardia', 'heart block', 'syncope', 'palpitations', 'svt', ' vt', ' vf', 'cardiac arrest'],
    priority: 65,
    activeProblems: ['possible ACS or rhythm instability', 'perfusion risk', 'medication contraindication decision'],
    immediateVisuals: [
      { id: 'cardiac-guarding', kind: 'pallor', region: 'chest', intensity: 'moderate', showWhen: 'immediate', detail: 'Patient should look pale/uncomfortable and may guard the chest.' },
      { id: 'cardiac-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', detail: 'Diaphoresis supports sympathetic stress and poor perfusion.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['defib', 'pads', 'aed'],
      region: 'chest',
      appearance: 'Defib pads attach anterior-lateral or anterior-posterior with leads visible.',
      fitRule: 'Pads should not cover the entire chest exam surface or hide wounds.',
      shouldNotBlock: ['chest auscultation', 'wound assessment'],
      reassess: ['rhythm', 'pulse', 'skin', 'BP'],
    }],
    patientBehavior: [
      { id: 'cardiac-device-question', when: 'aggressive device-led treatment while awake and stable', responseType: 'refuse', quote: 'Are you sure I need that?', debrief: 'Device interventions must match rhythm, pulse, and stability.' },
      { id: 'cardiac-pain-improves', when: 'appropriate ACS treatment improves symptoms', responseType: 'improve', quote: 'The pain is easing a little.', debrief: 'Pain response must be reassessed with BP and ECG.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['aspirin'], expectedFit: 'matched', visualResult: ['no dramatic visual change; medication is documented'], vitalTrajectory: ['pain/perfusion reassessment drives next step'], reassessment: ['pain', 'BP', 'contraindications', 'ECG'], patientBehavior: ['may report pain change'], debriefSignal: 'aspirin given when ACS suspected' },
      { treatmentIdFragments: ['gtn', 'nitro'], expectedFit: 'partial', visualResult: ['medication administered only if BP permits'], vitalTrajectory: ['BP may fall if contraindicated'], reassessment: ['BP', 'pain', 'contraindications'], patientBehavior: ['may report dizziness if hypotensive'], debriefSignal: 'GTN requires BP and contraindication check' },
      { treatmentIdFragments: ['defib', 'shock', 'cardioversion'], expectedFit: 'matched', visualResult: ['pads visible on chest'], vitalTrajectory: ['rhythm/pulse response depends on shockable rhythm'], reassessment: ['rhythm', 'pulse', 'CPR quality'], patientBehavior: ['awake patient needs sedation/consent if synchronized cardioversion context'], debriefSignal: 'electrical therapy matched to rhythm and pulse state' },
    ],
    reassessmentRequirements: ['pain', 'BP', 'rhythm', 'perfusion', 'nausea', 'repeat ECG if changing'],
    debriefSignals: ['time to ECG', 'appropriate aspirin/GTN', 'contraindicated nitrate', 'shockable/non-shockable decision'],
  },
  {
    id: 'neurology-stroke-seizure',
    family: 'neurology',
    match: ['stroke', 'facial droop', 'arm drift', 'slurred speech', 'gaze', 'weakness', 'fast', 'seizure', 'postictal', 'post-ictal', 'unequal pupils'],
    priority: 60,
    activeProblems: ['neurologic deficit or mimic', 'time-critical destination decision', 'glucose mimic exclusion'],
    immediateVisuals: [
      { id: 'neuro-facial-droop', kind: 'facial_droop', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Face check should reveal side-specific deficit when authored.' },
      { id: 'neuro-gaze-pupil', kind: 'dilated_pupils', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Pupil/gaze findings appear in eye zoom when case supports them.' },
      { id: 'neuro-seizure-state', kind: 'seizure_activity', region: 'chest', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Seizure or post-ictal state should change voice/cooperation.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'neuro-slurred-speech', when: 'stroke speech deficit is present', responseType: 'cooperate', quote: 'My words... are not coming out right.', debrief: 'Speech change should be captured as a neurologic finding.' },
      { id: 'neuro-postictal-confusion', when: 'post-ictal case state', responseType: 'agitate', quote: 'Where am I?', debrief: 'Post-ictal confusion should recover gradually, not instantly.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'partial', visualResult: ['oxygen visible only if hypoxic or clinically indicated'], vitalTrajectory: ['no neurologic reversal unless hypoxia is present'], reassessment: ['SpO2', 'GCS', 'speech'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen titrated to need, not diagnosis label' },
      { treatmentIdFragments: ['glucose', 'dextrose'], expectedFit: 'matched', visualResult: ['mentation improves only if glucose mimic exists'], vitalTrajectory: ['BGL/mental status reassessment decides response'], reassessment: ['BGL', 'GCS', 'FAST'], patientBehavior: ['confusion may improve if hypoglycaemic'], debriefSignal: 'glucose mimic checked before stroke anchoring' },
    ],
    reassessmentRequirements: ['FAST changes', 'GCS', 'pupils', 'BGL', 'speech', 'limb strength', 'last known well'],
    debriefSignals: ['time to neuro screen', 'last known well obtained', 'missed glucose mimic', 'destination/pre-alert'],
  },
  {
    id: 'trauma-haemorrhage-open-chest',
    family: 'trauma',
    match: ['trauma', 'mvc', 'fall', 'stab', 'gunshot', 'open chest wound', 'sucking chest wound', 'bleeding', 'hemorrhage', 'haemorrhage', 'amputation', 'fracture', 'deformity', 'pelvic', 'flail', 'pneumothorax'],
    priority: 85,
    activeProblems: ['external bleeding or open wound', 'shock risk', 'pain and movement risk', 'source control priority'],
    immediateVisuals: [
      { id: 'trauma-open-wound', kind: 'open_wound', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['dressing or chest seal applied'], detail: 'Wound should be anatomically visible where the case describes it.' },
      { id: 'trauma-active-bleeding', kind: 'active_bleeding', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['source control applied correctly'], detail: 'External bleeding should slow only after matched source control.' },
      { id: 'trauma-blood-pool', kind: 'blood_pool', region: 'scene', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['bleeding controlled and packaged'], detail: 'Blood on clothes/scene reinforces mechanism and shock.' },
      { id: 'trauma-asym-chest', kind: 'asymmetric_chest_rise', region: 'chest', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Chest trauma should affect chest rise and breath-sound comparison when authored.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['tourniquet'],
      region: 'left-leg',
      appearance: 'Tourniquet placed proximal to limb wound, not over a joint, with time noted.',
      fitRule: 'Only stops limb arterial bleeding when placed on the correct limb and location.',
      shouldNotBlock: ['distal pulse assessment', 'wound reassessment'],
      activeEffect: 'Bleeding stops or slows markedly when location matches wound.',
      reassess: ['bleeding', 'distal pulse', 'pain', 'shock trend'],
    }, {
      treatmentIdFragments: ['dressing', 'bleeding_control', 'chest_seal'],
      region: 'chest',
      appearance: 'Dressing or occlusive chest seal covers the wound without hiding the entire chest.',
      fitRule: 'Dressing/seal must be centered over the wound and leave comparison auscultation possible.',
      shouldNotBlock: ['chest auscultation', 'respiratory effort assessment'],
      activeEffect: 'Sucking/bubbling cue reduces when seal matches open chest wound.',
      reassess: ['wound', 'breath sounds', 'chest rise', 'perfusion'],
    }],
    patientBehavior: [
      { id: 'trauma-pain-guard', when: 'movement or palpation near injury', responseType: 'guard', quote: 'Please stop, that really hurts.', debrief: 'Movement and splinting decisions should affect pain/cooperation.' },
      { id: 'trauma-source-control-needed', when: 'oxygen/IV applied without source control', responseType: 'deteriorate', debrief: 'Oxygen and IV support do not replace hemorrhage/source control.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['bleeding_control', 'dressing', 'chest_seal'], expectedFit: 'matched', visualResult: ['bleeding or sucking chest cue reduces when applied to correct wound'], vitalTrajectory: ['perfusion stabilizes only after source control'], reassessment: ['wound', 'distal pulse', 'shock trend', 'breath sounds'], patientBehavior: ['pain may remain but panic decreases'], debriefSignal: 'source control matched to wound' },
      { treatmentIdFragments: ['tourniquet'], expectedFit: 'matched', visualResult: ['limb bleeding stops if location is correct'], vitalTrajectory: ['distal pulse changes and shock trend stabilizes'], reassessment: ['bleeding', 'distal pulse', 'pain', 'time applied'], patientBehavior: ['pain/distress can rise'], debriefSignal: 'tourniquet indication and placement' },
      { treatmentIdFragments: ['fluids', 'txa', 'iv'], expectedFit: 'partial', visualResult: ['line visible on arm'], vitalTrajectory: ['supports shock but cannot fix uncontrolled bleeding'], reassessment: ['BP', 'pulse', 'lungs', 'source control'], patientBehavior: ['may remain pale if bleeding persists'], debriefSignal: 'supportive care does not replace hemorrhage control' },
    ],
    reassessmentRequirements: ['bleeding control', 'distal pulse', 'pain', 'shock trend', 'chest rise', 'breath sounds', 'BP/pulse', 'mental status'],
    debriefSignals: ['time to hemorrhage control', 'correct device matched to wound', 'missed posterior assessment', 'over-treatment without source control'],
  },
  {
    id: 'burns-inhalation-risk',
    family: 'burns',
    match: ['burn', 'thermal', 'chemical', 'electrical burn', 'electrocution', 'scald', 'soot', 'smoke inhalation', 'singed hair', 'facial burn', 'airway burn'],
    priority: 75,
    activeProblems: ['burn pattern', 'pain and exposure risk', 'inhalation airway risk', 'hypothermia risk after cooling'],
    immediateVisuals: [
      { id: 'burn-pattern', kind: 'burn_pattern', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['covered with burn dressing'], detail: 'Burn location/depth should be visible after exposure.' },
      { id: 'burn-soot', kind: 'soot', region: 'mouth', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Soot around mouth/nose supports inhalation-risk assessment.' },
      { id: 'burn-face-swelling', kind: 'facial_swelling', region: 'face', intensity: 'moderate', showWhen: 'if-deteriorating', detail: 'Facial swelling risk should keep airway reassessment active.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['cooling', 'burn_dressing', 'dressing'],
      region: 'chest',
      appearance: 'Cooling/dressing visibly covers burn region while preserving airway and perfusion checks.',
      fitRule: 'Cooling/dressing must be limited to the affected region and not prolong exposure.',
      shouldNotBlock: ['airway assessment', 'distal circulation assessment'],
      activeEffect: 'Burn surface looks covered/cooled; hypothermia risk increases if exposure persists.',
      reassess: ['pain', 'temperature', 'burn coverage', 'distal circulation'],
    }],
    patientBehavior: [
      { id: 'burn-pain-guarding', when: 'burn exposed or touched', responseType: 'guard', quote: 'It burns, please be careful.', debrief: 'Analgesia and gentle handling matter in burns care.' },
      { id: 'burn-airway-worry', when: 'inhalation signs present', responseType: 'deteriorate', debrief: 'Airway risk can worsen even while skin care is underway.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['cooling'], expectedFit: 'matched', visualResult: ['burn region appears cooled/covered'], vitalTrajectory: ['pain may ease; hypothermia risk rises if overdone'], reassessment: ['pain', 'temperature', 'coverage'], patientBehavior: ['pain improves with careful cooling'], debriefSignal: 'cooling and hypothermia prevention balanced' },
      { treatmentIdFragments: ['oxygen'], expectedFit: 'matched', visualResult: ['oxygen visible on face'], vitalTrajectory: ['oxygenation supported when inhalation risk exists'], reassessment: ['airway', 'SpO2', 'voice', 'soot/swelling'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen and airway vigilance for inhalation injury' },
      { treatmentIdFragments: ['warming_blanket'], expectedFit: 'matched', visualResult: ['blanket covers non-burned/exposed areas'], vitalTrajectory: ['temperature risk stabilizes after cooling/exposure'], reassessment: ['temperature', 'skin', 'perfusion'], patientBehavior: ['comfort improves'], debriefSignal: 'hypothermia prevention after burn care' },
    ],
    reassessmentRequirements: ['airway', 'pain', 'temperature', 'perfusion', 'burn coverage', 'distal circulation if circumferential'],
    debriefSignals: ['time to cooling and covering', 'airway reassessment', 'hypothermia prevention'],
  },
  {
    // Highest priority in the list: a blocked airway kills faster than anything
    // else here, and the wheeze/stridor keywords would otherwise let the
    // bronchospasm scenario claim a choking patient and teach salbutamol.
    id: 'airway-foreign-body-obstruction',
    family: 'respiratory',
    // 'cannot speak' is deliberately NOT a keyword: a stroke patient with
    // dysphasia and a severe asthmatic unable to finish a sentence both say
    // exactly that, and at priority 95 this scenario stole both of them.
    match: ['choking', 'foreign body', 'universal choking sign', 'clutching throat', 'heimlich', 'food bolus'],
    priority: 95,
    activeProblems: ['upper airway obstruction', 'imminent hypoxia', 'inability to speak or cough effectively'],
    immediateVisuals: [
      { id: 'fb-cyanosis', kind: 'cyanosis', region: 'face', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['obstruction relieved'], detail: 'Dusky lips and face appear fast in complete obstruction — this is the clock the student is racing.' },
      { id: 'fb-accessory', kind: 'accessory_muscle_use', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['obstruction relieved'], detail: 'Violent, ineffective respiratory effort against a closed airway.' },
      { id: 'fb-panic-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['obstruction relieved'], detail: 'Terror and effort together — the patient is drenched.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor],
    patientBehavior: [
      { id: 'fb-cannot-speak', when: 'history questions asked of a completely obstructed patient', responseType: 'silent', debrief: 'A patient who cannot speak cannot answer. Silence IS the assessment finding — act, do not interview.' },
      { id: 'fb-relief', when: 'back blows and abdominal thrusts delivered', responseType: 'improve', quote: 'cough... I think it moved...', debrief: 'Relief is sudden. Reassess airway, breathing and for thrust-related injury.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['back_blows', 'abdominal_thrust', 'chest_thrust', 'heimlich'], expectedFit: 'matched', visualResult: ['obstruction may clear'], vitalTrajectory: ['SpO2 recovers once air moves'], reassessment: ['air entry', 'voice', 'SpO2', 'thrust injury'], patientBehavior: ['coughing, distressed, then relieved'], debriefSignal: 'obstruction cleared by mechanical means' },
      { treatmentIdFragments: ['nebulizer', 'salbutamol', 'ipratropium'], expectedFit: 'mismatch', visualResult: ['no change — the drug cannot reach the obstruction'], vitalTrajectory: ['continues to deteriorate'], reassessment: ['air entry', 'ability to speak'], patientBehavior: ['no improvement'], debriefSignal: 'bronchodilator given for a mechanical obstruction' },
      { treatmentIdFragments: ['oxygen'], expectedFit: 'mismatch', visualResult: ['mask on a blocked airway'], vitalTrajectory: ['no improvement while obstructed'], reassessment: ['air entry', 'chest rise'], patientBehavior: ['still cannot breathe'], debriefSignal: 'oxygen delivered without first clearing the airway' },
    ],
    reassessmentRequirements: ['air entry', 'ability to speak or cough', 'SpO2', 'conscious level', 'injury from thrusts'],
    debriefSignals: ['time to first back blow', 'attempted to interview a patient who could not speak', 'drug given for a mechanical obstruction'],
  },
  {
    id: 'infection-sepsis',
    family: 'infection',
    // Meningism ('photophobia', 'neck stiffness') is deliberately NOT a
    // keyword: subarachnoid haemorrhage presents with both, and matching on
    // them labelled an SAH as sepsis. Require an infection signal instead.
    match: ['sepsis', 'septic', 'meningitis', 'infection', 'febrile', 'fever', 'pyrexia', 'wound infection'],
    priority: 70,
    activeProblems: ['systemic infection', 'perfusion failure', 'altered mental state', 'source identification'],
    immediateVisuals: [
      { id: 'sepsis-flush', kind: 'flushing', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['fever and perfusion improve'], detail: 'Fever produces warm facial and upper-body flushing; deteriorating perfusion can later turn the patient grey.' },
      { id: 'sepsis-mottling', kind: 'mottling', region: 'left-leg', intensity: 'moderate', showWhen: 'if-deteriorating', clearsWhen: ['perfusion improves'], detail: 'Mottled knees and peripheries are a late, ominous perfusion sign.' },
      { id: 'sepsis-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['fever and perfusion improve'], detail: 'Clammy and febrile together.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'sepsis-confused', when: 'history questions asked of a septic elderly patient', responseType: 'agitate', quote: 'I... what day is it? I just felt so tired.', debrief: 'New confusion IS a sepsis red flag, not a communication barrier to work around.' },
      { id: 'sepsis-fluids-improve', when: 'IV fluids given for septic hypoperfusion', responseType: 'improve', quote: 'I feel a bit less woozy.', debrief: 'Fluids support perfusion but do not treat the source — time-critical transport still applies.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['fluid', 'saline', 'crystalloid'], expectedFit: 'matched', visualResult: ['fluids running'], vitalTrajectory: ['BP and capillary refill may improve'], reassessment: ['BP', 'capillary refill', 'mental status', 'lungs'], patientBehavior: ['may become more lucid'], debriefSignal: 'fluid resuscitation for septic hypoperfusion' },
      { treatmentIdFragments: ['oxygen'], expectedFit: 'matched', visualResult: ['oxygen visible on face'], vitalTrajectory: ['SpO2 supported'], reassessment: ['SpO2', 'RR', 'work of breathing'], patientBehavior: ['tolerates'], debriefSignal: 'oxygen for septic hypoxia' },
    ],
    reassessmentRequirements: ['temperature', 'BP', 'capillary refill', 'mental status', 'RR', 'lactate if available', 'source of infection'],
    debriefSignals: ['sepsis recognised early', 'new confusion attributed to age rather than infection', 'time-critical transport decision'],
  },
  {
    id: 'behavioural-acute-agitation',
    family: 'behavioural',
    match: ['psychosis', 'psychotic', 'acute behavioural', 'agitated', 'aggressive', 'responding to internal stimuli', 'shouting incoherently', 'restraint'],
    priority: 65,
    activeProblems: ['acute behavioural disturbance', 'scene and crew safety', 'organic mimic exclusion', 'capacity assessment'],
    immediateVisuals: [
      { id: 'behav-agitation', kind: 'tremor', region: 'chest', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['patient de-escalates'], detail: 'Restless, unsettled movement — the patient will not stay still to be assessed.' },
      { id: 'behav-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['patient de-escalates'], detail: 'Sweating with agitation. Also a stimulant and hypoglycaemia clue — do not assume psychiatric.' },
      { id: 'behav-pupils', kind: 'dilated_pupils', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Dilated pupils point at a stimulant or organic cause rather than primary psychosis.' },
    ],
    equipmentAnchors: [],
    patientBehavior: [
      { id: 'behav-refuses-touch', when: 'hands-on assessment attempted before rapport', responseType: 'refuse', quote: 'Do not touch me. Get away from me.', debrief: 'De-escalation and consent come before hands. Rushing the physical exam escalates the scene.' },
      { id: 'behav-calms', when: 'calm explanation and space offered', responseType: 'cooperate', quote: 'Okay... okay. Just tell me what you are doing.', debrief: 'De-escalation is the intervention. Restraint is a last resort, not a shortcut.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['glucose', 'dextrose'], expectedFit: 'matched', visualResult: ['BGL checked before behaviour is labelled psychiatric'], vitalTrajectory: ['agitation resolves if hypoglycaemic'], reassessment: ['BGL', 'GCS', 'behaviour'], patientBehavior: ['may settle rapidly'], debriefSignal: 'organic mimic excluded before psychiatric attribution' },
      { treatmentIdFragments: ['restraint', 'sedation'], expectedFit: 'harmful', visualResult: ['escalation and struggle'], vitalTrajectory: ['risk of injury and positional compromise'], reassessment: ['airway', 'breathing', 'circulation while restrained', 'legal justification'], patientBehavior: ['fights harder'], debriefSignal: 'restraint used before de-escalation was attempted' },
    ],
    reassessmentRequirements: ['BGL', 'GCS', 'pupils', 'scene safety', 'capacity', 'airway and breathing if restrained'],
    debriefSignals: ['de-escalation attempted first', 'hypoglycaemia and hypoxia excluded', 'restraint justified and monitored'],
  },
  {
    // Deliberately LOW priority. Anxiety and hyperventilation are diagnoses of
    // exclusion: every organic scenario above must win when its keywords also
    // appear, or this teaches students to reassure a PE or a DKA.
    id: 'anxiety-hyperventilation',
    family: 'respiratory',
    match: ['panic attack', 'hyperventilation', 'hyperventilating', 'carpopedal', 'tingling in the fingers', 'anxiety attack'],
    priority: 25,
    activeProblems: ['hyperventilation', 'organic cause exclusion', 'reassurance and coaching'],
    immediateVisuals: [
      { id: 'anx-sweat', kind: 'diaphoresis', region: 'face', intensity: 'subtle', showWhen: 'immediate', clearsWhen: ['breathing pattern settles'], detail: 'Distress sweat without the work of true respiratory failure.' },
      { id: 'anx-tremor', kind: 'tremor', region: 'left-arm', intensity: 'subtle', showWhen: 'immediate', clearsWhen: ['breathing pattern settles'], detail: 'Trembling hands; carpopedal spasm if it has gone on long enough.' },
    ],
    equipmentAnchors: [],
    patientBehavior: [
      { id: 'anx-coaching-helps', when: 'calm breathing coaching given', responseType: 'improve', quote: 'I think... I can slow it down.', debrief: 'Coached breathing works only once organic causes are excluded.' },
      { id: 'anx-distress', when: 'told to calm down without explanation', responseType: 'refuse', quote: 'I cannot breathe, do not tell me to relax!', debrief: 'Dismissal escalates panic. Acknowledge the symptom, then coach.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'mismatch', visualResult: ['mask applied to a patient with normal SpO2'], vitalTrajectory: ['no change — they are not hypoxic'], reassessment: ['SpO2', 'RR', 'air entry'], patientBehavior: ['may feel more trapped by the mask'], debriefSignal: 'oxygen given without hypoxia' },
      { treatmentIdFragments: ['nebulizer', 'salbutamol'], expectedFit: 'mismatch', visualResult: ['no wheeze to treat'], vitalTrajectory: ['tachycardia may worsen'], reassessment: ['air entry', 'wheeze', 'pulse'], patientBehavior: ['feels more shaky'], debriefSignal: 'bronchodilator given without bronchospasm' },
    ],
    reassessmentRequirements: ['SpO2', 'RR', 'air entry', 'BGL', 'ECG', 'symmetry of chest signs'],
    debriefSignals: ['organic causes excluded before reassurance', 'PE/ACS/DKA considered', 'coaching rather than dismissal'],
  },
  {
    // Obstetric haemorrhage outranks the general trauma scenario: a postpartum
    // haemorrhage and a placenta praevia were both being matched as an OPEN
    // CHEST WOUND, which is the wrong compartment, the wrong source control
    // and the wrong destination.
    id: 'obstetric-haemorrhage',
    family: 'obstetric',
    match: ['postpartum haemorrhage', 'postpartum hemorrhage', 'placenta praevia', 'placenta previa', 'antepartum haemorrhage', 'vaginal bleeding', 'bleeding in pregnancy'],
    priority: 88,
    activeProblems: ['concealed and revealed blood loss', 'shock in a physiologically compensating patient', 'two patients', 'time-critical obstetric destination'],
    immediateVisuals: [
      { id: 'obh-blood', kind: 'blood_pool', region: 'pelvis', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['bleeding controlled'], detail: 'Revealed loss only — a pregnant patient can conceal a great deal more than you can see.' },
      { id: 'obh-pallor', kind: 'pallor', region: 'face', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['perfusion restored'], detail: 'Pregnancy compensates hard, so pallor and anxiety appear before the BP falls.' },
      { id: 'obh-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['perfusion restored'], detail: 'Clammy and frightened.' },
      { id: 'obh-mottling', kind: 'mottling', region: 'left-leg', intensity: 'moderate', showWhen: 'if-deteriorating', detail: 'Late decompensation — by this point the reserve is gone.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'obh-frightened', when: 'assessment performed without explanation', responseType: 'guard', quote: 'Is the baby okay? Please tell me what is happening.', debrief: 'There are two patients and the mother knows it. Communication is part of the resuscitation.' },
      { id: 'obh-fluids', when: 'IV fluids given for obstetric haemorrhage', responseType: 'improve', quote: 'I feel a little less faint.', debrief: 'Fluids buy time; definitive care is surgical. Do not let improvement delay transport.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['fluid', 'saline', 'crystalloid', 'blood'], expectedFit: 'matched', visualResult: ['fluids running'], vitalTrajectory: ['BP supported'], reassessment: ['BP', 'HR', 'blood loss', 'conscious level', 'fundal tone'], patientBehavior: ['less faint'], debriefSignal: 'volume replaced for obstetric haemorrhage' },
      { treatmentIdFragments: ['txa', 'tranexamic'], expectedFit: 'matched', visualResult: ['drug given'], vitalTrajectory: ['reduces ongoing loss'], reassessment: ['blood loss', 'BP'], patientBehavior: ['tolerates'], debriefSignal: 'TXA given for obstetric haemorrhage' },
      { treatmentIdFragments: ['left_lateral', 'positioning'], expectedFit: 'matched', visualResult: ['patient tilted left off the vena cava'], vitalTrajectory: ['venous return and BP improve'], reassessment: ['BP', 'symptoms'], patientBehavior: ['tolerates'], debriefSignal: 'left lateral tilt applied' },
    ],
    reassessmentRequirements: ['BP', 'HR', 'visible blood loss', 'fundal tone', 'conscious level', 'gestation', 'fetal considerations'],
    debriefSignals: ['recognised concealed loss', 'left lateral tilt', 'time-critical obstetric destination', 'did not delay transport for fluids'],
  },
  {
    // Deliberately below trauma-haemorrhage-open-chest. A genuine open chest
    // wound must still win; this exists so that the far more common isolated
    // limb injury and mechanical fall stop presenting as a blank patient.
    id: 'trauma-limb-injury',
    family: 'trauma',
    match: ['fracture', 'deformed', 'deformity', 'mechanical fall', 'fell', 'dislocation', 'long lie', 'twisted', 'wrist', 'ankle'],
    priority: 50,
    activeProblems: ['isolated limb injury', 'pain', 'distal neurovascular risk', 'occult injury in the elderly'],
    immediateVisuals: [
      { id: 'limb-pain-guard', kind: 'tremor', region: 'chest', intensity: 'subtle', showWhen: 'immediate', clearsWhen: ['analgesia effective'], detail: 'Guarding and reluctance to move — pain is visible before it is scored.' },
      { id: 'limb-pallor', kind: 'pallor', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['pain controlled'], detail: 'Pale and clammy with pain; in the elderly it may also be the first sign of occult blood loss.' },
      { id: 'limb-sweat', kind: 'diaphoresis', region: 'face', intensity: 'subtle', showWhen: 'immediate', clearsWhen: ['pain controlled'], detail: 'Sweating with severe pain.' },
      { id: 'limb-deformity', kind: 'deformity', region: 'left-leg', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Deformity, shortening or rotation appears where the case authors it.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'limb-move-refusal', when: 'limb moved before analgesia', responseType: 'refuse', quote: 'No — please do not move it.', debrief: 'Analgesia and splinting come before movement. Moving first loses trust and worsens the injury.' },
      { id: 'limb-analgesia-helps', when: 'analgesia given before splinting', responseType: 'improve', quote: 'That is better. I can let you look now.', debrief: 'Effective analgesia makes the rest of the assessment possible.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['analgesia', 'morphine', 'fentanyl', 'methoxyflurane', 'entonox'], expectedFit: 'matched', visualResult: ['patient visibly settles'], vitalTrajectory: ['HR and distress reduce'], reassessment: ['pain score', 'distal pulse', 'sensation', 'RR'], patientBehavior: ['allows assessment'], debriefSignal: 'analgesia before splinting and movement' },
      { treatmentIdFragments: ['splint', 'traction', 'vacuum', 'sam'], expectedFit: 'matched', visualResult: ['limb immobilised in position'], vitalTrajectory: ['pain reduces once immobilised'], reassessment: ['distal pulse', 'sensation', 'capillary refill', 'pain score'], patientBehavior: ['more comfortable'], debriefSignal: 'splinted with neurovascular checks before and after' },
      { treatmentIdFragments: ['tourniquet'], expectedFit: 'harmful', visualResult: ['tourniquet on a closed limb injury'], vitalTrajectory: ['ischaemia risk with no bleeding to control'], reassessment: ['distal pulse', 'bleeding'], patientBehavior: ['severe pain'], debriefSignal: 'tourniquet applied without catastrophic haemorrhage' },
    ],
    reassessmentRequirements: ['pain score', 'distal pulse', 'sensation', 'capillary refill', 'skin colour', 'mechanism and occult injury in the elderly'],
    debriefSignals: ['analgesia before movement', 'neurovascular checks before and after splinting', 'cause of the fall considered, not just the injury'],
  },
  {
    // Eclampsia was previously matched as HYPOGLYCAEMIA — the seizure keywords
    // collided and nothing obstetric existed to outrank them. A student would
    // have been taught to reach for glucose in a pregnant seizing patient.
    id: 'obstetric-eclampsia',
    family: 'obstetric',
    match: ['eclampsia', 'eclamptic', 'pre-eclampsia', 'preeclampsia', 'seizure in pregnancy', 'pregnant woman having a seizure'],
    priority: 85,
    activeProblems: ['seizure control', 'severe hypertension', 'two patients', 'delivery is the definitive treatment'],
    immediateVisuals: [
      { id: 'ecl-seizure', kind: 'seizure_activity', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['seizure terminated'], detail: 'Tonic-clonic activity in a pregnant patient — eclampsia until proven otherwise.' },
      { id: 'ecl-swelling', kind: 'facial_swelling', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Facial and peripheral oedema supports the pre-eclamptic picture.' },
      { id: 'ecl-cyanosis', kind: 'cyanosis', region: 'face', intensity: 'moderate', showWhen: 'if-deteriorating', clearsWhen: ['airway and ventilation supported'], detail: 'Hypoxia during a prolonged seizure threatens mother and fetus together.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'ecl-postictal', when: 'history questions asked during the post-ictal phase', responseType: 'silent', debrief: 'Post-ictal patients cannot give a history. Get it from bystanders and treat what you see.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['magnesium'], expectedFit: 'matched', visualResult: ['seizure activity settles'], vitalTrajectory: ['seizures controlled; watch for toxicity'], reassessment: ['seizure activity', 'reflexes', 'RR', 'urine output', 'BP'], patientBehavior: ['post-ictal, then rousable'], debriefSignal: 'magnesium given as first-line for eclampsia' },
      { treatmentIdFragments: ['glucose', 'dextrose'], expectedFit: 'mismatch', visualResult: ['no change'], vitalTrajectory: ['seizure continues if BGL is normal'], reassessment: ['BGL', 'seizure activity'], patientBehavior: ['still seizing'], debriefSignal: 'glucose given for a seizure that was never hypoglycaemic' },
      { treatmentIdFragments: ['left_lateral', 'positioning'], expectedFit: 'matched', visualResult: ['patient tilted left off the vena cava'], vitalTrajectory: ['maternal BP and placental flow improve'], reassessment: ['BP', 'fetal considerations'], patientBehavior: ['tolerates'], debriefSignal: 'left lateral tilt applied' },
    ],
    reassessmentRequirements: ['seizure activity', 'BP', 'BGL', 'SpO2', 'reflexes if magnesium given', 'gestation', 'fetal considerations'],
    debriefSignals: ['eclampsia recognised rather than treated as hypoglycaemia', 'magnesium as first-line', 'left lateral tilt', 'time-critical obstetric transport'],
  },
  {
    id: 'obstetric-imminent-delivery',
    family: 'obstetric',
    match: ['imminent delivery', 'crowning', 'in labour', 'active labour', 'contracting regularly', 'feels need to push'],
    priority: 75,
    activeProblems: ['imminent birth', 'two patients', 'postpartum haemorrhage risk', 'neonatal resuscitation readiness'],
    immediateVisuals: [
      { id: 'ob-effort-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['after delivery'], detail: 'Sweating with the work of labour — effort, not shock.' },
      { id: 'ob-pph-blood', kind: 'blood_pool', region: 'pelvis', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Postpartum haemorrhage is the thing that kills after the baby is out.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'ob-cannot-move', when: 'transport attempted during active pushing', responseType: 'refuse', quote: 'I cannot walk, it is coming NOW.', debrief: 'An imminent delivery is a stay-and-deliver decision, not a load-and-go.' },
      { id: 'ob-coaching', when: 'calm delivery coaching given', responseType: 'cooperate', quote: 'Okay... tell me when to push.', debrief: 'Coaching and positioning are the intervention; most deliveries need hands off, not hands on.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'partial', visualResult: ['oxygen on face'], vitalTrajectory: ['no change in a normally progressing labour'], reassessment: ['SpO2', 'RR'], patientBehavior: ['may find the mask intrusive'], debriefSignal: 'oxygen given without hypoxia' },
      { treatmentIdFragments: ['fluid', 'saline', 'crystalloid'], expectedFit: 'matched', visualResult: ['IV access established before delivery'], vitalTrajectory: ['supports BP if haemorrhage follows'], reassessment: ['BP', 'blood loss', 'fundal tone'], patientBehavior: ['tolerates'], debriefSignal: 'access obtained before postpartum haemorrhage risk' },
    ],
    reassessmentRequirements: ['contraction timing', 'crowning', 'blood loss after delivery', 'fundal tone', 'newborn breathing and tone', 'maternal BP'],
    debriefSignals: ['stay-and-deliver decision', 'prepared for two patients', 'postpartum haemorrhage anticipated'],
  },
  {
    id: 'pediatric-stridor-croup',
    family: 'pediatric',
    match: ['croup', 'barking cough', 'seal-like cough', 'inspiratory stridor at rest'],
    priority: 78,
    activeProblems: ['upper airway narrowing', 'distress-driven deterioration', 'parental anxiety'],
    immediateVisuals: [
      { id: 'croup-accessory', kind: 'accessory_muscle_use', region: 'chest', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['stridor settles'], detail: 'Tracheal tug and intercostal recession — in a small child this is the severity score.' },
      { id: 'croup-cyanosis', kind: 'cyanosis', region: 'face', intensity: 'severe', showWhen: 'if-deteriorating', clearsWhen: ['airway opens'], detail: 'A late and very bad sign in croup.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, nebulizerAnchor],
    patientBehavior: [
      { id: 'croup-distress-worsens', when: 'child separated from parent or examined forcefully', responseType: 'deteriorate', quote: 'crying, stridor louder', debrief: 'Distress worsens dynamic airway narrowing. Keep the child calm and on the parent — that IS treatment.' },
      { id: 'croup-settles', when: 'child left on parent and given blow-by', responseType: 'improve', quote: 'settles against the parent, stridor quieter', debrief: 'Minimal handling first. Calm is the intervention.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['nebulizer', 'adrenaline', 'epinephrine', 'budesonide', 'dexamethasone'], expectedFit: 'matched', visualResult: ['nebulised mist, child on parent'], vitalTrajectory: ['stridor and recession reduce'], reassessment: ['stridor at rest', 'recession', 'SpO2', 'conscious level'], patientBehavior: ['may resist mask; blow-by is acceptable'], debriefSignal: 'nebulised treatment delivered without distressing the child' },
      { treatmentIdFragments: ['airway_adjunct', 'opa', 'npa', 'suction'], expectedFit: 'harmful', visualResult: ['child fights the instrument'], vitalTrajectory: ['airway can close completely'], reassessment: ['airway', 'stridor', 'SpO2'], patientBehavior: ['screams, deteriorates'], debriefSignal: 'instrumented a distressed paediatric upper airway' },
    ],
    reassessmentRequirements: ['stridor at rest', 'recession', 'SpO2', 'conscious level', 'ability to feed or drink'],
    debriefSignals: ['kept the child calm and with the parent', 'avoided airway instrumentation', 'severity judged on work of breathing not noise'],
  },
  {
    id: 'environmental-heat-illness',
    family: 'environmental',
    match: ['heat exhaustion', 'heat stroke', 'heatstroke', 'hyperthermia', 'heat illness', 'core temperature'],
    priority: 60,
    activeProblems: ['thermal load', 'volume depletion', 'progression to heat stroke'],
    immediateVisuals: [
      { id: 'heat-sweat', kind: 'diaphoresis', region: 'face', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['cooled and rehydrated'], detail: 'Profuse sweating in heat EXHAUSTION. Sweating STOPPING is the ominous turn toward heat stroke.' },
      { id: 'heat-flush', kind: 'pallor', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['cooled and rehydrated'], detail: 'Flushed then grey as circulation is diverted to the skin and volume falls.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'heat-weak', when: 'asked to stand or walk to the ambulance', responseType: 'refuse', quote: 'I feel like I am going to pass out.', debrief: 'Standing a volume-depleted, vasodilated patient risks syncope. Move them supine and cooled.' },
      { id: 'heat-cooling-helps', when: 'active cooling and fluids given', responseType: 'improve', quote: 'That is better. I can think again.', debrief: 'Cooling is the treatment; improving mental state is the endpoint that matters.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['cooling', 'cold_pack', 'ice'], expectedFit: 'matched', visualResult: ['patient moved to shade, clothing loosened, cooling applied'], vitalTrajectory: ['temperature and heart rate fall'], reassessment: ['temperature', 'mental status', 'HR', 'skin'], patientBehavior: ['relief'], debriefSignal: 'active cooling started early' },
      { treatmentIdFragments: ['fluid', 'saline', 'crystalloid'], expectedFit: 'matched', visualResult: ['fluids running'], vitalTrajectory: ['BP and tachycardia improve'], reassessment: ['BP', 'HR', 'mental status'], patientBehavior: ['feels stronger'], debriefSignal: 'volume replaced alongside cooling' },
      { treatmentIdFragments: ['warming_blanket'], expectedFit: 'harmful', visualResult: ['patient covered and insulated'], vitalTrajectory: ['temperature climbs'], reassessment: ['temperature'], patientBehavior: ['distress increases'], debriefSignal: 'warming applied to a hyperthermic patient' },
    ],
    reassessmentRequirements: ['temperature', 'mental status', 'HR', 'BP', 'skin moisture', 'BGL'],
    debriefSignals: ['cooling before transport', 'recognised the shift from exhaustion to heat stroke', 'sweating that stops is a red flag'],
  },
  {
    id: 'cardiac-hypertensive-emergency',
    family: 'cardiac',
    match: ['hypertensive emergency', 'hypertensive crisis', 'malignant hypertension'],
    priority: 62,
    activeProblems: ['end-organ damage', 'stroke and dissection mimics', 'controlled rather than rapid BP reduction'],
    immediateVisuals: [
      { id: 'htn-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['pain and BP settle'], detail: 'Sweating with severe headache — do not anchor on migraine.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'htn-photophobia', when: 'bright light used during assessment', responseType: 'guard', quote: 'Please, the light.', debrief: 'Photophobia belongs to several dangerous causes — subarachnoid haemorrhage included. It is a finding, not an inconvenience.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['glyceryl', 'gtn', 'nitrate'], expectedFit: 'partial', visualResult: ['BP begins to fall'], vitalTrajectory: ['a rapid drop can cause cerebral hypoperfusion'], reassessment: ['BP', 'GCS', 'neurology', 'symptoms'], patientBehavior: ['headache may change'], debriefSignal: 'BP reduced without over-correcting' },
    ],
    reassessmentRequirements: ['BP in both arms', 'GCS', 'pupils', 'focal neurology', 'visual symptoms', 'chest and back pain'],
    debriefSignals: ['considered SAH and dissection', 'avoided rapid BP correction', 'neurological reassessment documented'],
  },
  {
    // Low priority: vomiting, diarrhoea and abdominal pain are the presentation
    // of a great many more dangerous things. This must never outrank an
    // organic scenario that also matches.
    id: 'gastro-dehydration',
    family: 'gastrointestinal',
    match: ['gastroenteritis', 'vomiting and diarrhoea', 'diarrhoea', 'abdominal pain'],
    priority: 30,
    activeProblems: ['volume depletion', 'electrolyte disturbance', 'exclusion of a surgical or ectopic cause'],
    immediateVisuals: [
      { id: 'gastro-pallor', kind: 'pallor', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['rehydrated'], detail: 'Dry, drawn and pale with volume loss.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'gastro-cramp', when: 'abdominal palpation attempted during a cramp', responseType: 'guard', quote: 'Wait — wait, not right now.', debrief: 'Palpate between cramps; guarding that does not settle is a different problem.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['fluid', 'saline', 'crystalloid'], expectedFit: 'matched', visualResult: ['fluids running'], vitalTrajectory: ['HR and BP improve with volume'], reassessment: ['HR', 'BP', 'capillary refill', 'mucous membranes'], patientBehavior: ['feels less lightheaded'], debriefSignal: 'volume replaced for dehydration' },
      { treatmentIdFragments: ['analgesia', 'morphine', 'fentanyl'], expectedFit: 'partial', visualResult: ['pain settles'], vitalTrajectory: ['no change in the underlying cause'], reassessment: ['pain score', 'abdominal findings', 'vital signs'], patientBehavior: ['more comfortable'], debriefSignal: 'analgesia given without masking a surgical abdomen' },
    ],
    reassessmentRequirements: ['HR', 'BP', 'capillary refill', 'BGL', 'abdominal findings', 'pregnancy status where relevant'],
    debriefSignals: ['dehydration assessed objectively', 'surgical and ectopic causes considered', 'analgesia did not mask reassessment'],
  },
];


/**
 * Derive active patient behavior rules that match the current treatment state.
 *
 * Patient behaviors are gated by the `when` field which describes a clinical
 * context (e.g. "BVM attempted while awake and ventilating", "naloxone
 * reverses opioid physiology"). This function matches the `when` description
 * against the currently applied treatments to determine which behaviors
 * are currently relevant.
 */
export function deriveActivePatientBehaviors(
  patientBehavior: PatientBehaviorRule[],
  appliedTreatmentIds: string[] = [],
): PatientBehaviorRule[] {
  if (patientBehavior.length === 0 || appliedTreatmentIds.length === 0) return [];

  const text = appliedTreatmentIds.join(' ').toLowerCase();

  return patientBehavior.filter(rule => {
    const when = rule.when.toLowerCase();
    const keywordMatchesWhen = (keyword: string): boolean => {
      if (keyword === 'iv') return /\biv\b|i\.v\.|intravenous/.test(when);
      return when.includes(keyword);
    };

    const treatmentKeywords = [
      { keyword: 'bvm', ids: ['bvm', 'ventilat'] },
      { keyword: 'bronchodilator', ids: ['nebulizer', 'salbutamol', 'ipratropium'] },
      { keyword: 'oxygen', ids: ['oxygen', 'nonrebreather', 'nasal', 'simple_mask'] },
      { keyword: 'adrenaline', ids: ['adrenaline', 'epinephrine'] },
      { keyword: 'naloxone', ids: ['naloxone'] },
      { keyword: 'glucose', ids: ['glucose', 'dextrose'] },
      { keyword: 'cpap', ids: ['cpap', 'niv'] },
      { keyword: 'iv', ids: ['iv_access', 'iv_cannula', 'io_access'] },
      { keyword: 'fluids', ids: ['fluids_', 'iv_access'] },
      { keyword: 'airway', ids: ['opa', 'npa', 'lma', 'ett', 'intubat'] },
      { keyword: 'chest seal', ids: ['chest_seal', 'occlusive'] },
      { keyword: 'tourniquet', ids: ['tourniquet'] },
      { keyword: 'splint', ids: ['splint'] },
      { keyword: 'collar', ids: ['collar', 'cervical'] },
      { keyword: 'cooling', ids: ['cooling', 'burn_dressing'] },
      { keyword: 'defib', ids: ['defib', 'pads', 'aed', 'shock'] },
    ];

    for (const { keyword, ids } of treatmentKeywords) {
      if (keywordMatchesWhen(keyword) && ids.some(id => text.includes(id))) {
        return true;
      }
    }

    if (
      (when.includes('movement') || when.includes('palpation') || when.includes('touched'))
      && ['splint', 'collar', 'binder', 'stretcher', 'board', 'traction'].some(id => text.includes(id))
    ) {
      return true;
    }

    // State-based triggers (no specific treatment keyword)
    if (when.includes('low gcs') || when.includes('unresponsive') || when.includes('silent')) {
      return true;
    }

    return false;
  });
}

/**
 * Build a compact voice-response prompt for the patient simulator from
 * active patient behavior rules. Returns null if no voice interaction is needed.
 */
export function derivePatientVoicePrompt(
  behaviors: PatientBehaviorRule[],
): { quote: string; responseType: string; debrief: string } | null {
  const priority: Record<string, number> = {
    refuse: 5, agitate: 4, guard: 3, deteriorate: 3,
    improve: 2, cooperate: 1, silent: 0,
  };

  const sorted = behaviors.filter(behavior => Boolean(behavior.quote)).sort((a, b) =>
    (priority[b.responseType] ?? 0) - (priority[a.responseType] ?? 0),
  );

  const best = sorted[0];
  if (!best || !best.quote) return null;

  return { quote: best.quote, responseType: best.responseType, debrief: best.debrief };
}

export function matchRealismScenarios(caseData: CaseScenario): RealismScenarioSpec[] {
  const text = collectCaseText(caseData);
  return REALISM_SCENARIOS
    .filter(scenario => scenarioMatchesCase(scenario, caseData, text))
    .sort((a, b) => b.priority - a.priority);
}

export function deriveScenarioTreatmentResponses(
  caseData: CaseScenario,
  appliedTreatmentIds: string[] = [],
): TreatmentResponseRule[] {
  const scenarios = matchRealismScenarios(caseData);
  return scenarios.flatMap(scenario =>
    scenario.treatmentResponses.filter(response =>
      hasTreatment(appliedTreatmentIds, response.treatmentIdFragments),
    ),
  );
}

function visualRegionForInjury(region: BodyRegion): EquipmentAnchorRegion {
  if (region === 'head') return 'face';
  if (region === 'back') return 'posterior';
  if (region === 'airway') return 'mouth';
  return region;
}

function exposedInjuryDetail(injury: ReturnType<typeof inferInjuries>[number]): string {
  const location = injury.region.replace('-', ' ');
  if (injury.kind === 'amputation') {
    return `The exposed traumatic amputation at the ${location} remains visible after source control; protect the stump and reassess the device.`;
  }
  if (injury.kind === 'bleeding') {
    return `The exposed wound at the ${location} remains visible; reassess the dressing or device, distal circulation and tissue protection.`;
  }
  return injury.detail;
}

/**
 * The trauma scenario describes a family of injuries, but its visuals must be
 * bound to this patient's authored anatomy. A hand amputation must not create
 * a chest wound or asymmetric chest rise simply because both are "trauma".
 */
function contextualizeScenarioVisual(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
): RealismVisualEffect | null {
  if (effect.id.startsWith('neuro-')) {
    const neuroText = [
      ...list(caseData.abcde?.disability?.pupils),
      ...(caseData.abcde?.disability?.findings ?? []),
      ...(caseData.abcde?.disability?.focalDeficits ?? []),
      caseData.abcde?.disability?.seizureActivity,
      ...(caseData.secondarySurvey?.neurological ?? []),
      caseData.initialPresentation?.consciousness,
    ]
      .filter(Boolean)
      .map(value => stripNegatedClauses(String(value)))
      .join(' ')
      .toLowerCase();
    if (effect.id === 'neuro-facial-droop') {
      return /\b(facial droop|facial asymmetr\w*|face droop)\b/.test(neuroText) ? effect : null;
    }
    if (effect.id === 'neuro-gaze-pupil') {
      return /\b(dilat\w*|blown pupil|unequal pupils|anisocoria|fixed pupil|gaze deviat\w*)\b/.test(neuroText) ? effect : null;
    }
    if (effect.id === 'neuro-seizure-state') {
      return /\b(seizure|seizing|postictal|post-ictal|tonic.?clonic)\b/.test(neuroText) ? effect : null;
    }
  }
  if (!effect.id.startsWith('trauma-')) return effect;

  const injuries = inferInjuries(caseData);
  const bleeding = injuries.find(injury => injury.kind === 'bleeding' || injury.kind === 'amputation');
  const openInjury = injuries.find(injury => injury.kind === 'wound' || injury.kind === 'amputation')
    ?? injuries.find(injury => injury.kind === 'bleeding');

  if (effect.id === 'trauma-open-wound') {
    return openInjury ? { ...effect, region: visualRegionForInjury(openInjury.region), detail: exposedInjuryDetail(openInjury) } : null;
  }
  if (effect.id === 'trauma-active-bleeding') {
    return bleeding ? { ...effect, region: visualRegionForInjury(bleeding.region), detail: bleeding.detail } : null;
  }
  if (effect.id === 'trauma-blood-pool') {
    return bleeding ? effect : null;
  }
  if (effect.id === 'trauma-asym-chest') {
    const chestInjury = injuries.some(injury => injury.region === 'chest' && ['wound', 'flail', 'bleeding', 'deformity'].includes(injury.kind));
    const chestText = [
      ...(caseData.abcde?.breathing?.findings ?? []),
      ...(caseData.abcde?.breathing?.auscultation ?? []),
      ...(caseData.secondarySurvey?.chest ?? []),
    ]
      .map(item => stripNegatedClauses(String(item)))
      .join(' ')
      .toLowerCase();
    const asymmetricEvidence = /\b(asymmetr|unilateral|flail|paradoxical|pneumothorax|hemothorax|haemothorax)\b|\b(?:reduced|absent|diminished)[^.]{0,45}\b(?:left|right)\b/.test(chestText);
    return chestInjury || asymmetricEvidence ? effect : null;
  }
  return effect;
}

export function deriveScenarioVisuals(
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): RealismVisualEffect[] {
  return matchRealismScenarios(caseData)
    .flatMap(scenario => scenario.immediateVisuals)
    .map(effect => contextualizeScenarioVisual(effect, caseData))
    .filter((effect): effect is RealismVisualEffect => effect != null)
    .filter(effect => shouldShowVisualEffect(effect, caseData, vitals, appliedTreatmentIds));
}

function deriveScenarioVisualContext(
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): RealismVisualEffect[] {
  return matchRealismScenarios(caseData)
    .flatMap(scenario => scenario.immediateVisuals)
    .map(effect => contextualizeScenarioVisual(effect, caseData))
    .filter((effect): effect is RealismVisualEffect => effect != null)
    .filter(effect => shouldIncludeVisualContext(effect, caseData, vitals, appliedTreatmentIds));
}

function uniqueVisualsById(visuals: RealismVisualEffect[]): RealismVisualEffect[] {
  const seen = new Set<string>();
  return visuals.filter(visual => {
    if (seen.has(visual.id)) return false;
    seen.add(visual.id);
    return true;
  });
}

function contextualActiveProblems(
  scenario: RealismScenarioSpec,
  caseData: CaseScenario,
  liveVitals?: VitalSigns | null,
): string[] {
  if (scenario.id === 'cardiac-acs-instability') {
    const initialVitals = caseData.vitalSignsProgression?.initial;
    const arrestText = [
      caseData.title,
      caseData.subcategory,
      caseData.initialRhythm,
      caseData.initialPresentation?.generalImpression,
      caseData.initialPresentation?.appearance,
      caseData.expectedFindings?.mostLikelyDiagnosis,
    ].filter(Boolean).join(' ').toLowerCase();
    const authoredCardiacArrest = initialVitals?.pulse === 0
      || /\b(cardiac arrest|pulseless|ventricular fibrillation|\bvf\b|asystole|pea)\b/.test(arrestText);
    const livePulse = liveVitals?.pulse ?? initialVitals?.pulse ?? 0;
    if (authoredCardiacArrest && livePulse > 0) {
      return [
        'ROSC — perfusing rhythm restored',
        'support ventilation and oxygenation',
        'repeat 12-lead, BP, neurologic and temperature assessment',
      ];
    }
    if (authoredCardiacArrest) {
      return [
        'cardiac arrest — no pulse or normal breathing',
        'high-quality CPR and ventilation required',
        'attach pads, analyse rhythm, then shock only if indicated',
      ];
    }
  }
  if (scenario.id !== 'trauma-haemorrhage-open-chest') return scenario.activeProblems;
  const injuries = inferInjuries(caseData);
  const hasExternalSource = injuries.some(injury => ['bleeding', 'wound', 'amputation'].includes(injury.kind));
  const vitals = caseData.vitalSignsProgression?.initial;
  const systolic = parseSystolic(vitals?.bp);
  const hasShockPhysiology = hasExternalSource
    || (typeof systolic === 'number' && systolic < 90)
    || (typeof vitals?.pulse === 'number' && vitals.pulse > 120);
  return scenario.activeProblems.filter(problem => {
    if (problem === 'external bleeding or open wound' || problem === 'source control priority') return hasExternalSource;
    if (problem === 'shock risk') return hasShockPhysiology;
    return true;
  });
}


/** Prospective kit placement cues for FIND EQUIPMENT — where gear will sit
 *  once applied. Unlike deriveRealismScenarioState.equipmentAnchors, these are
 *  NOT filtered to already-applied treatments. */
export function prospectiveEquipmentAnchorsForCase(caseData: CaseScenario): EquipmentAnchorSpec[] {
  return matchRealismScenarios(caseData).flatMap(scenario => scenario.equipmentAnchors);
}

export function deriveRealismScenarioState({
  caseData,
  vitals,
  appliedTreatmentIds = [],
}: ScenarioRealismInput): ScenarioRealismState {
  const scenarios = matchRealismScenarios(caseData);
  const treatmentResponses = deriveScenarioTreatmentResponses(caseData, appliedTreatmentIds);
  const equipmentAnchors = scenarios
    .flatMap(scenario => scenario.equipmentAnchors)
    .filter(anchor => hasTreatment(appliedTreatmentIds, anchor.treatmentIdFragments));
  const activeVisualEffects = deriveScenarioVisuals(caseData, vitals, appliedTreatmentIds);
  const contextualVisualEffects = deriveScenarioVisualContext(caseData, vitals, appliedTreatmentIds);

  return {
    matchedScenarioIds: scenarios.map(scenario => scenario.id),
    families: unique(scenarios.map(scenario => scenario.family)),
    activeProblems: unique(scenarios.flatMap(scenario => contextualActiveProblems(scenario, caseData, vitals))),
    activeVisualEffects,
    visualEffects: uniqueVisualsById([...activeVisualEffects, ...contextualVisualEffects]),
    equipmentAnchors,
    patientBehavior: scenarios.flatMap(scenario => scenario.patientBehavior),
    treatmentResponses,
    reassessmentRequirements: unique([
      ...scenarios.flatMap(scenario => scenario.reassessmentRequirements),
      ...equipmentAnchors.flatMap(anchor => anchor.reassess),
      ...treatmentResponses.flatMap(response => response.reassessment),
    ]),
    debriefSignals: unique([
      ...scenarios.flatMap(scenario => scenario.debriefSignals),
      ...treatmentResponses.map(response => response.debriefSignal),
    ]),
  };
}
