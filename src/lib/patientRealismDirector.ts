import type { AppliedTreatment, CaseScenario, VitalSigns } from '@/types';
import type { PatientState } from '@/data/dynamicTreatmentEngine';
import {
  deriveAppliedTreatmentRealismCues,
  deriveCaseRealismProfile,
  type PatientRealismCue,
  type RealismSeverity,
} from '@/data/clinicalRealism';
import { deriveExpectedDevices, fallbackDeviceAnchor } from '@/lib/deviceAttachment';
import {
  deriveRealismScenarioState,
  type EquipmentAnchorSpec,
  type PatientBehaviorRule,
  type RealismVisualEffect,
  type TreatmentResponseRule,
} from '@/lib/patientRealismScenarios';
export interface RealismDirectorState {
  caseFamily: string;
  severity: RealismSeverity;
  headline: string;
  sceneConstraints: string[];
  visibleCues: PatientRealismCue[];
  reassessmentPrompts: string[];
  treatmentEvidence: string[];
  debriefTargets: string[];
  /** @since Round 2 — scenario layer integration */
  matchedScenarioIds: string[];
  activeProblems: string[];
  activeVisualEffects: RealismVisualEffect[];
  visualEffects: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
  /** @since Round 4 — treatment prepare/apply/reassess loop */
  treatmentLoopStates: TreatmentLoopState[];
  /** Treatment IDs that have been applied but not yet reassessed — triggers "pending reassessment" UI */
  pendingReassessmentIds: string[];
  /** Treatment IDs that have been applied AND reassessed — eligible for full realism credit */
  fullyRealizedTreatmentIds: string[];
}

/** Three-state lifecycle for a high-impact treatment. */
export interface TreatmentLoopState {
  treatmentId: string;
  state: 'applied' | 'reassessed';
  categoryLabel: string;
  reassessmentPrompt: string;
  /** Human-readable debrief note if treatment was never reassessed */
  pendingNote: string;
}

export interface RealismDirectorInput {
  caseData: CaseScenario;
  vitals?: VitalSigns | null;
  patientState?: PatientState | null;
  appliedTreatmentIds?: string[];
  appliedTreatments?: AppliedTreatment[];
  /**
   * Set of treatment-ids whose reassessment has been performed
   * (e.g. SpO2 checked after oxygen, BP checked after IV, wound checked after dressing).
   * Used by the treatment loop to determine full credit eligibility.
   */
  reassessedTreatmentIds?: string[];
}

/** Keep the HUD observation tied to the live patient, not the dispatch-time
 * appearance. This is especially important when an arrest transitions to
 * ROSC or respiratory treatment changes the patient's work of breathing. */
export function deriveLivePatientAppearance(
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  patientState?: PatientState | null,
): string {
  const initial = caseData.initialPresentation?.appearance || 'Observe patient state';
  const initialVitals = caseData.vitalSignsProgression?.initial;
  const authoredArrest = initialVitals?.pulse === 0
    || /\b(cardiac arrest|pulseless|ventricular fibrillation|\bvf\b|asystole|pea)\b/i.test([
      caseData.title,
      caseData.subcategory,
      caseData.initialRhythm,
      caseData.expectedFindings?.mostLikelyDiagnosis,
    ].filter(Boolean).join(' '));
  const livePulse = vitals?.pulse ?? initialVitals?.pulse ?? 0;
  const liveRespiration = vitals?.respiration ?? initialVitals?.respiration ?? 0;
  const stillInArrest = patientState?.isInArrest || livePulse === 0;

  if (authoredArrest && !stillInArrest && livePulse > 0) {
    if (liveRespiration <= 0) return 'Perfusing rhythm restored; remains unresponsive and apnoeic';
    if (liveRespiration < 8) return 'Perfusing rhythm restored; breathing remains inadequate';
    return 'Perfusing rhythm restored; reassess breathing and neurologic status';
  }

  const respiratoryContext = [
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.initialPresentation?.generalImpression,
    initial,
    caseData.expectedFindings?.mostLikelyDiagnosis,
    ...(caseData.abcde?.breathing?.findings ?? []),
    ...(caseData.abcde?.breathing?.auscultation ?? []),
  ].filter(Boolean).join(' ');
  const authoredRespiratoryDistress = /\b(asthma|bronchospasm|copd|respiratory distress|shortness of breath|dyspnoea|wheez|accessory muscle|unable to speak|single words|poor air entry)\b/i.test(respiratoryContext);
  const initialRespiration = initialVitals?.respiration ?? caseData.abcde?.breathing?.rate;
  const initialSpo2 = initialVitals?.spo2 ?? caseData.abcde?.breathing?.spo2;
  const liveSpo2 = vitals?.spo2 ?? initialSpo2;
  const objectivelyImproved = (
    (typeof initialRespiration === 'number' && initialRespiration > 24 && liveRespiration >= 12 && liveRespiration <= 24)
    || (typeof initialSpo2 === 'number' && initialSpo2 < 94 && typeof liveSpo2 === 'number' && liveSpo2 >= 94)
  );

  if (authoredRespiratoryDistress) {
    if (liveRespiration <= 0) return 'Apnoeic — no effective breathing';
    if ((typeof liveSpo2 === 'number' && liveSpo2 < 90) || liveRespiration >= 30) return initial;
    if ((typeof liveSpo2 === 'number' && liveSpo2 < 94) || liveRespiration > 24) {
      return 'Breathing remains laboured; reassess air entry, speech tolerance and oxygenation';
    }
    if (objectivelyImproved) {
      if (livePulse >= 130) {
        return 'Work of breathing improving; marked tachycardia remains — reassess speech tolerance, wheeze and air entry';
      }
      return 'Work of breathing improving; reassess speech tolerance, wheeze and air entry';
    }
  }

  return initial;
}

const severityRank: Record<RealismSeverity, number> = {
  normal: 0,
  observe: 1,
  warning: 2,
  critical: 3,
};

const unique = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

function parseSystolic(bp: string | undefined): number | undefined {
  if (!bp) return undefined;
  const match = String(bp).match(/\d{2,3}/);
  return match ? Number(match[0]) : undefined;
}

function highestSeverity(items: RealismSeverity[]): RealismSeverity {
  return items.reduce<RealismSeverity>(
    (highest, item) => (severityRank[item] > severityRank[highest] ? item : highest),
    'normal',
  );
}

function vitalSeverity(vitals: VitalSigns | null | undefined, patientState: PatientState | null | undefined): RealismSeverity {
  if (patientState?.isInArrest || vitals?.pulse === 0) return 'critical';

  const rr = vitals?.respiration;
  const spo2 = vitals?.spo2;
  const gcs = vitals?.gcs;
  const pulse = vitals?.pulse;
  const sbp = parseSystolic(vitals?.bp);

  if (
    (typeof spo2 === 'number' && spo2 < 90)
    || (typeof sbp === 'number' && sbp < 90)
    || (typeof gcs === 'number' && gcs <= 8)
    || (typeof rr === 'number' && (rr < 8 || rr > 32))
    || (typeof pulse === 'number' && pulse > 140)
  ) {
    return 'critical';
  }

  if (
    (typeof spo2 === 'number' && spo2 < 94)
    || (typeof sbp === 'number' && sbp < 100)
    || (typeof gcs === 'number' && gcs < 15)
    || (typeof rr === 'number' && (rr < 10 || rr > 24))
    || (typeof pulse === 'number' && pulse > 110)
  ) {
    return 'warning';
  }

  return 'observe';
}

function deriveSceneConstraints(caseData: CaseScenario): string[] {
  const scene = caseData.sceneInfo;
  return unique([
    scene.environment ? `Environment: ${scene.environment}` : '',
    ...(scene.hazards || []).slice(0, 2).map(hazard => `Hazard: ${hazard}`),
    ...(scene.accessIssues || []).slice(0, 2).map(issue => `Access: ${issue}`),
    scene.extricationNeeded ? 'Extrication: plan movement and packaging before treatment drift' : '',
    scene.bystanders ? `Bystanders: ${scene.bystanders}` : '',
  ]).slice(0, 5);
}

function includesAny(ids: Set<string>, fragments: string[]): boolean {
  return Array.from(ids).some(id => fragments.some(fragment => id.includes(fragment)));
}

function deriveTreatmentEvidence(appliedTreatmentIds: string[], appliedTreatments: AppliedTreatment[] = []): string[] {
  const ids = new Set(appliedTreatmentIds);
  const latest = [...appliedTreatments]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 2)
    .map(treatment => treatment.name || treatment.description || treatment.id)
    .filter(Boolean);

  return unique([
    includesAny(ids, ['oxygen', 'nonrebreather', 'nasal', 'nebulizer', 'cpap', 'bvm', 'ventilat'])
      ? 'Airway equipment should be visible on the face with chest response checked next'
      : '',
    includesAny(ids, ['iv', 'fluids', 'dextrose', 'txa'])
      ? 'Line or medication route should be visible; reassess BP, lungs, mentation, and perfusion'
      : '',
    includesAny(ids, ['bleeding', 'tourniquet', 'dressing', 'wound'])
      ? 'Source control should visibly slow bleeding before perfusion is credited'
      : '',
    includesAny(ids, ['splint', 'collar', 'binder', 'board', 'stretcher'])
      ? 'Immobilisation should match the injured region and reduce movement pain'
      : '',
    includesAny(ids, ['adrenaline', 'naloxone', 'glucose', 'salbutamol', 'ipratropium', 'aspirin', 'gtn'])
      ? 'Drug effect should create a reassessment moment, not an instant solved state'
      : '',
    ...latest.map(name => `Latest: ${name}`),
  ]).slice(0, 5);
}

function deriveReassessmentPrompts(input: RealismDirectorInput): string[] {
  const profile = deriveCaseRealismProfile(input.caseData);
  const ids = new Set(input.appliedTreatmentIds || []);
  const prompts: string[] = [];

  switch (profile.caseFamily) {
    case 'trauma':
      prompts.push('Assess: MARCH / ABCDE', 'Assess: external bleeding and wounds', 'Assess: distal pulses');
      break;
    case 'respiratory':
      prompts.push('Assess: work of breathing', 'Assess: SpO2 trend', 'Assess: chest auscultation zones');
      break;
    case 'anaphylaxis':
      prompts.push('Assess: airway swelling', 'Assess: wheeze/stridor', 'Assess: BP and perfusion');
      break;
    case 'toxicology':
      prompts.push('Assess: airway patency', 'Assess: respiratory rate and EtCO2', 'Assess: pupil zoom');
      break;
    case 'metabolic':
      prompts.push('Assess: blood glucose', 'Assess: airway safety before oral glucose', 'Assess: neuro status');
      break;
    case 'cardiac':
      prompts.push('Assess: 12-lead ECG', 'Assess: pain score and history', 'Assess: perfusion and BP');
      break;
    case 'neurology':
      prompts.push('Assess: FAST/neurologic screen', 'Assess: blood glucose', 'Assess: pupil comparison');
      break;
    case 'infection/sepsis':
      prompts.push('Assess: temperature', 'Assess: source of infection', 'Assess: perfusion and BP');
      break;
    default:
      break;
  }

  if (includesAny(ids, ['oxygen', 'nonrebreather', 'nasal', 'nebulizer', 'cpap', 'bvm', 'ventilat'])) {
    prompts.push('Recheck RR, SpO2, speech tolerance, air entry, and mask tolerance');
  }
  if (includesAny(ids, ['iv', 'fluids', 'dextrose', 'txa'])) {
    prompts.push('Recheck pulse quality, BP, capillary refill, lungs, and mental status');
  }
  if (includesAny(ids, ['bleeding', 'tourniquet', 'dressing', 'wound'])) {
    prompts.push('Inspect the wound again: bleeding control, distal pulse, pain, and shock trend');
  }
  if (includesAny(ids, ['adrenaline', 'naloxone', 'glucose', 'salbutamol', 'ipratropium', 'gtn', 'aspirin'])) {
    prompts.push('Ask what changed, repeat focused vitals, and watch for adverse response');
  }
  if (input.patientState?.isInArrest) {
    prompts.push('Maintain CPR rhythm: pulse/rhythm checks, EtCO2, reversible causes, and shock timing');
  }

  prompts.push(...profile.assessmentPriorities.slice(0, 3).map(item => `Assess: ${item}`));
  return unique(prompts).slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Treatment prepare/apply/reassess loop (Round 4)                   */
/* ------------------------------------------------------------------ */

/** Known high-impact treatment categories with their reassessment prompts. */
const HIGH_IMPACT_TREATMENT_CATEGORIES: Record<string, { label: string; prompt: string; pendingNote: string }> = {
  oxygen_nonrebreather:  { label: 'Oxygen',  prompt: 'Recheck RR, SpO2, work of breathing, and speech tolerance',  pendingNote: 'Oxygen applied — reassess SpO2 and work of breathing for full credit' },
  oxygen_mask:           { label: 'Oxygen',  prompt: 'Recheck RR, SpO2, work of breathing, and speech tolerance',  pendingNote: 'Oxygen applied — reassess SpO2 and work of breathing for full credit' },
  oxygen_nasal:          { label: 'Oxygen',  prompt: 'Recheck RR, SpO2, and nasal cannula tolerance',               pendingNote: 'Oxygen applied — reassess SpO2 for full credit' },
  oxygen_venturi:        { label: 'Controlled oxygen', prompt: 'Recheck RR, SpO2 against the 88–92% target, mental status, and work of breathing', pendingNote: 'Venturi oxygen applied — reassess SpO2 and signs of CO2 retention for full credit' },
  nebulizer_salbutamol:  { label: 'Nebuliser', prompt: 'Recheck wheeze, air entry, RR, and SpO2',                   pendingNote: 'Nebuliser given — reassess wheeze and air entry for full credit' },
  nebulizer_ipratropium: { label: 'Nebuliser', prompt: 'Recheck wheeze, air entry, RR, and SpO2',                   pendingNote: 'Nebuliser given — reassess wheeze and air entry for full credit' },
  cpap_niv:              { label: 'CPAP/NIV', prompt: 'Recheck mask tolerance, SpO2, BP, and work of breathing',     pendingNote: 'CPAP applied — reassess tolerance and respiratory response for full credit' },
  bvm_ventilation:       { label: 'BVM',      prompt: 'Recheck chest rise, SpO2, EtCO2, and gastric inflation',     pendingNote: 'BVM ventilation — reassess chest rise and ventilation adequacy' },
  mechanical_ventilation:{ label: 'Ventilator', prompt: 'Recheck chest rise, EtCO2, SpO2, BP, and ventilator synchrony', pendingNote: 'Ventilator started — reassess oxygenation, ventilation, and haemodynamics' },
  ventilator_setup:      { label: 'Ventilator', prompt: 'Recheck chest rise, EtCO2, SpO2, BP, and ventilator synchrony', pendingNote: 'Ventilator started — reassess oxygenation, ventilation, and haemodynamics' },
  intubation:            { label: 'Advanced airway', prompt: 'Confirm placement with capnography, chest rise, auscultation, and tube security', pendingNote: 'Advanced airway placed — confirm placement and ventilation' },
  rsi_intubation:        { label: 'RSI',       prompt: 'Confirm ETT placement, sedation/paralysis response, BP, and EtCO2', pendingNote: 'RSI performed — reassess tube position and physiological response' },
  opa_insert:            { label: 'OPA',       prompt: 'Recheck gag tolerance, airway patency, and breathing',       pendingNote: 'OPA inserted — reassess airway tolerance and patency' },
  suction:               { label: 'Suction',   prompt: 'Recheck airway patency, secretions, SpO2, and work of breathing', pendingNote: 'Airway suctioned — reassess patency and oxygenation' },
  iv_cannula:            { label: 'IV access', prompt: 'Recheck site patency, BP, pulse quality, and lungs',         pendingNote: 'IV cannulated — reassess BP, pulse, and lungs for full credit' },
  iv_access:             { label: 'IV access', prompt: 'Recheck site patency, BP, pulse quality, and lungs',         pendingNote: 'IV access established — reassess BP, pulse, and lungs for full credit' },
  io_access:             { label: 'IO access', prompt: 'Recheck site security, perfusion, pain, and response to therapy', pendingNote: 'IO access established — reassess site and circulation' },
  fluids_250ml:          { label: 'Fluids',    prompt: 'Recheck BP, pulse quality, lung sounds, mental status, and perfusion', pendingNote: 'Fluid bolus started — reassess perfusion and lungs' },
  fluids_500ml:          { label: 'Fluids',    prompt: 'Recheck BP, pulse quality, lung sounds, mental status, and perfusion', pendingNote: 'Fluid bolus started — reassess perfusion and lungs' },
  fluids_1000ml:         { label: 'Fluids',    prompt: 'Recheck BP, pulse quality, lung sounds, mental status, and perfusion', pendingNote: 'Fluid bolus started — reassess perfusion and lungs' },
  txa_1g:                { label: 'TXA',       prompt: 'Recheck bleeding control, shock trend, timing, and transport priority', pendingNote: 'TXA given — reassess haemorrhage control and shock trend' },
  adrenaline_im:         { label: 'IM adrenaline', prompt: 'Recheck airway, wheeze, BP, and repeat-dose timing',     pendingNote: 'IM adrenaline given — reassess airway and perfusion for full credit' },
  naloxone_04mg:         { label: 'Naloxone',  prompt: 'Recheck RR, GCS, airway, and vomiting risk',                 pendingNote: 'Naloxone given — reassess respiratory drive and consciousness' },
  glucose_10g:           { label: 'Oral glucose', prompt: 'Recheck BGL, GCS, and airway safety',                     pendingNote: 'Oral glucose given — reassess BGL and consciousness' },
  dextrose_10:           { label: 'IV dextrose', prompt: 'Recheck BGL, GCS, and IV site',                            pendingNote: 'IV dextrose given — reassess BGL and consciousness' },
  aspirin:               { label: 'Aspirin',    prompt: 'Recheck pain, BP, contraindications, and ECG',               pendingNote: 'Aspirin given — reassess pain, BP, and contraindications' },
  gtn_spray:             { label: 'GTN',        prompt: 'Recheck BP, pain, and contraindications',                   pendingNote: 'GTN given — reassess BP and pain response' },
  chest_seal:            { label: 'Chest seal', prompt: 'Recheck wound, breath sounds, and chest rise',              pendingNote: 'Chest seal applied — reassess lung sounds and bleeding' },
  chest_seal_vented:     { label: 'Chest seal', prompt: 'Recheck wound, breath sounds, and chest rise',              pendingNote: 'Vented chest seal applied — reassess lung sounds and bleeding' },
  occlusive_dressing_3sided: { label: 'Occlusive dressing', prompt: 'Recheck wound, breath sounds, and tension pneumothorax signs', pendingNote: 'Occlusive dressing applied — reassess lung sounds and deterioration' },
  bleeding_control:      { label: 'Bleeding control', prompt: 'Recheck wound, haemorrhage control, distal pulse, and shock trend', pendingNote: 'Bleeding controlled — reassess source control and perfusion' },
  dressing:              { label: 'Dressing',   prompt: 'Recheck wound, bleeding, and distal pulse',                 pendingNote: 'Dressing applied — reassess wound and distal perfusion' },
  tourniquet:            { label: 'Tourniquet', prompt: 'Recheck bleeding, distal pulse, pain, and time applied',    pendingNote: 'Tourniquet applied — reassess bleeding control and distal pulse' },
  splinting:             { label: 'Splint',     prompt: 'Recheck pain, alignment, distal pulse and sensation',       pendingNote: 'Splint applied — reassess pain and distal neurovascular status' },
  sam_splint:            { label: 'SAM splint', prompt: 'Recheck pain, alignment, distal pulse and sensation',       pendingNote: 'SAM splint applied — reassess distal neurovascular status' },
  box_splint:            { label: 'Box splint', prompt: 'Recheck pain, alignment, distal pulse and sensation',       pendingNote: 'Box splint applied — reassess distal neurovascular status' },
  vacuum_limb_splint:    { label: 'Vacuum splint', prompt: 'Recheck pain, alignment, distal pulse and sensation',    pendingNote: 'Vacuum splint applied — reassess distal neurovascular status' },
  air_splint:            { label: 'Air splint', prompt: 'Recheck pain, alignment, distal pulse and sensation',       pendingNote: 'Air splint applied — reassess distal neurovascular status' },
  traction_splint:       { label: 'Traction splint', prompt: 'Recheck pain, traction, alignment, distal pulse and sensation', pendingNote: 'Traction splint applied — reassess traction and distal neurovascular status' },
  cervical_collar:       { label: 'C-collar',   prompt: 'Recheck alignment, comfort, and distal neuro status',       pendingNote: 'C-collar applied — reassess comfort and neurological status' },
  head_blocks:           { label: 'Head blocks', prompt: 'Recheck immobilisation, airway access, comfort, and distal neuro status', pendingNote: 'Head blocks applied — reassess immobilisation and neurological status' },
  spinal_board:          { label: 'Spinal board', prompt: 'Recheck alignment, pressure areas, comfort, and distal neuro status', pendingNote: 'Spinal board used — reassess immobilisation and neurological status' },
  scoop_stretcher:       { label: 'Scoop stretcher', prompt: 'Recheck alignment, pain, straps, and distal neuro status', pendingNote: 'Scoop stretcher used — reassess alignment and neurological status' },
  vacuum_mattress:       { label: 'Vacuum mattress', prompt: 'Recheck alignment, pressure areas, comfort, and distal neuro status', pendingNote: 'Vacuum mattress used — reassess immobilisation and neurological status' },
  pelvic_binder:         { label: 'Pelvic binder', prompt: 'Recheck alignment, distal pulses, and perfusion',         pendingNote: 'Pelvic binder applied — reassess perfusion and distal pulses' },
  assist_delivery:       { label: 'Mother and newborn', prompt: 'Recheck maternal bleeding and vitals, then newborn breathing, heart rate, tone, colour, warmth and APGAR', pendingNote: 'Birth assisted — reassess both mother and newborn' },
  paced_breathing:       { label: 'Paced breathing', prompt: 'Recheck respiratory rate, pulse, SpO₂, chest findings, tingling and distress; reopen the differential if symptoms persist', pendingNote: 'Breathing coached — reassess physiology and exclude an organic cause' },
  warming_blanket:       { label: 'Warming',    prompt: 'Recheck temperature, skin, and perfusion',                  pendingNote: 'Warming blanket applied — reassess temperature and perfusion' },
  active_cooling:        { label: 'Cooling',    prompt: 'Recheck temperature, mental status, skin, and perfusion',    pendingNote: 'Active cooling started — reassess temperature and neurological status' },
};

/**
 * Derive the treatment loop state for each applied high-impact treatment.
 *
 * Maps applied treatment IDs against reassessed treatment IDs to determine
 * lifecycle state. Treatments not in the high-impact list are skipped.
 */
export function deriveTreatmentLoopStates(
  appliedTreatmentIds: string[],
  reassessedTreatmentIds: string[] = [],
  caseData?: CaseScenario,
): TreatmentLoopState[] {
  const reassessedSet = new Set(reassessedTreatmentIds);
  const loops: TreatmentLoopState[] = [];

  for (const txId of new Set(appliedTreatmentIds)) {
    const matchedKey = Object.keys(HIGH_IMPACT_TREATMENT_CATEGORIES).find(key =>
      txId === key || txId.startsWith(key) || key.startsWith(txId),
    );
    if (!matchedKey) continue;

    const localBurnCooling = matchedKey === 'active_cooling'
      && caseData != null
      && (caseData.category === 'burns'
        || /\b(?:burns?|scald|flash[- ]burn)\b/i.test(`${caseData.subcategory} ${caseData.dispatchInfo?.callReason}`));
    const cat = localBurnCooling
      ? {
          label: 'Burn dressing',
          prompt: 'Recheck pain, burn depth/TBSA, distal circulation, core temperature, and airway signs',
          pendingNote: 'Burn cooled and covered — reassess pain, tissue, circulation, and temperature',
        }
      : HIGH_IMPACT_TREATMENT_CATEGORIES[matchedKey];
    // Check reassessment against exact treatment ID, matched key, or prefix match
    const isReassessed = reassessedSet.has(txId)
      || reassessedSet.has(matchedKey)
      || Array.from(reassessedSet).some(r => txId.startsWith(r) || matchedKey.startsWith(r));

    loops.push({
      treatmentId: txId,
      state: isReassessed ? 'reassessed' : 'applied',
      categoryLabel: cat.label,
      reassessmentPrompt: cat.prompt,
      pendingNote: cat.pendingNote,
    });
  }

  return loops;
}

export function deriveRealismDirectorState(input: RealismDirectorInput): RealismDirectorState {
  const profile = deriveCaseRealismProfile(input.caseData);
  const treatmentCues = deriveAppliedTreatmentRealismCues(input.caseData, input.appliedTreatmentIds || []);
  const visibleCues = [...profile.observableCues, ...treatmentCues].slice(0, 6);
  const severity = highestSeverity([
    vitalSeverity(input.vitals, input.patientState),
    ...visibleCues.map(cue => cue.severity),
  ]);

  const scenarioState = deriveRealismScenarioState({
    caseData: input.caseData,
    vitals: input.vitals,
    appliedTreatmentIds: input.appliedTreatmentIds || [],
  });

  const loopStates = deriveTreatmentLoopStates(
    input.appliedTreatmentIds || [],
    input.reassessedTreatmentIds || [],
    input.caseData,
  );
  const pendingReassessmentIds = loopStates
    .filter(l => l.state === 'applied')
    .map(l => l.treatmentId);
  const fullyRealizedTreatmentIds = loopStates
    .filter(l => l.state === 'reassessed')
    .map(l => l.treatmentId);

  return {
    caseFamily: profile.caseFamily,
    severity,
    headline: profile.summary,
    sceneConstraints: deriveSceneConstraints(input.caseData),
    visibleCues,
    reassessmentPrompts: deriveReassessmentPrompts(input),
    treatmentEvidence: deriveTreatmentEvidence(input.appliedTreatmentIds || [], input.appliedTreatments),
    debriefTargets: profile.debriefEndpoints.slice(0, 4),
    matchedScenarioIds: scenarioState.matchedScenarioIds,
    activeProblems: scenarioState.activeProblems,
    activeVisualEffects: scenarioState.activeVisualEffects,
    visualEffects: scenarioState.visualEffects,
    equipmentAnchors: (() => {
      const covered = new Set(
        scenarioState.equipmentAnchors.flatMap(a => a.treatmentIdFragments),
      );
      const extras = deriveExpectedDevices(input.caseData)
        .filter(family => {
          const probe = fallbackDeviceAnchor(family);
          return !probe.treatmentIdFragments.some(f => covered.has(f));
        })
        .map(fallbackDeviceAnchor);
      return [...scenarioState.equipmentAnchors, ...extras];
    })(),
    patientBehavior: scenarioState.patientBehavior,
    treatmentResponses: scenarioState.treatmentResponses,
    reassessmentRequirements: scenarioState.reassessmentRequirements,
    debriefSignals: scenarioState.debriefSignals,
    treatmentLoopStates: loopStates,
    pendingReassessmentIds,
    fullyRealizedTreatmentIds,
  };
}
