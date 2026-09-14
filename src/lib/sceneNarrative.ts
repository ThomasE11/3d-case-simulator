import type { CaseScenario } from '@/types';
import { inferGeneralAppearance, inferInjuries } from '@/lib/injuryMap';
import { patientAgeLongLabel } from '@/lib/patientAgePresentation';

export interface SceneVisualBrief {
  patientDescriptor: string;
  incidentLabel: string;
  dispatchSummary: string;
  arrivalHeadline: string;
  sceneExpectation: string;
  visiblePatientCues: string[];
  environmentCues: string[];
  hazardCues: string[];
  injuryCues: string[];
  fidelityChecklist: string[];
}

function clean(value?: string | number | null): string {
  return String(value ?? '').trim();
}

/**
 * Student-facing setting copy for the few cases whose original clinical
 * record predates their authored 3D scene.  Keep this mapping deliberately
 * narrow: it corrects presentation drift without mutating the protected case
 * data that feeds the clinical engine, assessment logic, and debrief.
 */
const PRESENTATION_SCENE_DESCRIPTIONS: Record<string, string> = {
  'resp-001': 'Villa living room, patient seated upright in tripod position',
};

export function getScenePresentationDescription(caseData: CaseScenario): string {
  return PRESENTATION_SCENE_DESCRIPTIONS[caseData.id]
    ?? (clean(caseData.sceneInfo?.description) || 'Scene description not available');
}

function sceneTextFor(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.dispatchInfo?.location,
    caseData.dispatchInfo?.timeOfDay,
    caseData.dispatchInfo?.additionalInfo?.join(' '),
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.hazards?.join(' '),
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.appearance,
    caseData.history?.eventsLeading,
  ].filter(Boolean).join(' ').toLowerCase();
}

function isBurnOrFireIncident(text: string): boolean {
  // Keep respiratory triggers like "incense burning" from being treated as
  // thermal injury scenes. Only classify when the incident itself is fire,
  // smoke inhalation, explosion, scald, or a true burn injury.
  return /\b(scald|scalded|burn injury|burns|burned|burnt|thermal burn|electrical burn|chemical burn|flash burn|house fire|kitchen fire|industrial fire|structure fire|fire incident|active fire|smoke inhalation|soot|explosion|flame|charred|singed)\b/.test(text);
}

function isFallFromHeightIncident(text: string): boolean {
  return /\bfall from height\b|\bfell from\b|\bfallen from\b|\bfall(?:en|ing)?\b.{0,70}\b(building|balcony|roof|ladder|scaffold|scaffolding|height|metres?|meters?|upper floor|stairwell)\b|\b(building|balcony|roof|ladder|scaffold|scaffolding|height|upper floor|stairwell)\b.{0,70}\bfall(?:en|ing)?\b/.test(text);
}

export function getScenePatientDescriptor(caseData: CaseScenario): string {
  const age = caseData.patientInfo?.age;
  const gender = clean(caseData.patientInfo?.gender).toLowerCase();

  if (age === 0 && /multi|mci|mass casualty|multiple/i.test(`${caseData.title} ${caseData.dispatchInfo?.callReason}`)) {
    return 'multiple patients';
  }

  const genderWord = gender.includes('female') ? 'female'
    : gender.includes('male') ? 'male'
      : gender || 'patient';

  if (typeof age !== 'number') return genderWord === 'patient' ? 'patient' : `${genderWord} patient`;
  if (age < 1) return `${patientAgeLongLabel(age)} ${genderWord} infant`;
  if (age < 5) return `${age}-year-old ${genderWord} toddler`;
  if (age < 13) return `${age}-year-old ${genderWord} child`;
  if (age < 18) return `${age}-year-old ${genderWord} adolescent`;
  return `${age}-year-old ${genderWord}`;
}

export function getSceneTimeLabel(caseData: CaseScenario): string {
  const raw = clean(caseData.dispatchInfo?.timeOfDay || caseData.sceneInfo?.environment).toLowerCase();
  if (!raw) return 'time not stated';
  if (/night|late|dark|poor lighting|evening/.test(raw)) return 'night / low light';
  if (/early[-\s]?morning|morning|dawn/.test(raw)) return 'morning light';
  if (/afternoon|midday|noon|hot|sun/.test(raw)) return 'daylight / heat';
  return raw;
}

function inferIncidentLabel(caseData: CaseScenario): string {
  const text = sceneTextFor(caseData);
  if (/mci|mass casualty|multiple injuries|bus vs car/.test(text)) return 'mass casualty incident';
  if (isFallFromHeightIncident(text)) return 'fall from height';
  if (/pedestrian|struck by car|struck by vehicle/.test(text)) return 'pedestrian struck';
  if (/\brtc\b|mvc|collision|motorcycle|vehicle|car crash|road traffic/.test(text)) return 'road traffic collision';
  if (/stab|penetrating|gsw|gunshot|shooting|knife/.test(text)) return 'penetrating trauma';
  if (/panic|anxiety|hyperventilat/.test(text)) return 'anxiety / hyperventilation call';
  if (/psychosis|bizarre|aggressive|agitated|unseen|hallucinat|self[-\s]?harm|suicid|weapon|threat|shouting/.test(text)) return 'behavioural crisis';
  if (/drown|submersion|water|beach|pool/.test(text)) return 'water rescue';
  if (/chest pain|stemi|acs|angina/.test(text)) return 'chest pain call';
  if (/short of breath|difficulty breathing|asthma|copd|wheeze|respiratory/.test(text)) return 'breathing difficulty';
  if (isBurnOrFireIncident(text)) return 'burn / fire incident';
  if (/stroke|facial droop|weak arm|slurred/.test(text)) return 'neurological call';
  if (/seizure|postictal|convulsion/.test(text)) return 'seizure call';
  if (/abdominal pain|abdomen|vomiting/.test(text)) return 'abdominal pain call';
  return clean(caseData.dispatchInfo?.callReason) || clean(caseData.category) || 'emergency call';
}

function mechanismVisualRequirements(caseData: CaseScenario): string[] {
  const text = sceneTextFor(caseData);
  const cues: string[] = [];
  const anxietyLike = /panic|anxiety|hyperventilat/.test(text);

  if (isFallFromHeightIncident(text)) {
    cues.push('show height mechanism: ladder/scaffold/edge, hard landing surface, visible trauma or guarding');
  }
  if (/pedestrian|struck by car|struck by vehicle/.test(text)) {
    cues.push('show traffic lane, stopped vehicle, patient on road, pelvic/lower limb guarding or deformity');
  }
  if (/\brtc\b|mvc|collision|motorcycle|vehicle|car crash|road traffic/.test(text)) {
    cues.push('show vehicle damage, debris, traffic control, patient position relative to impact');
  }
  if (/stab|penetrating|gsw|gunshot|shooting|knife/.test(text)) {
    cues.push('show wound location, blood pattern, crowd/security/police safety context');
  }
  if (anxietyLike) {
    cues.push('show anxiety/hyperventilation posture: seated or pacing, frightened expression, supportive bystander, clear low-threat room');
  }
  if (/psychosis|bizarre|aggressive|agitated|unseen|hallucinat|self[-\s]?harm|suicid|weapon|threat|shouting/.test(text)) {
    cues.push('show behavioural scene safety: distance, exits, clutter/possible weapons, police/security if dispatched');
  }
  if (isBurnOrFireIncident(text)) {
    cues.push('show source of heat/electrical hazard, burned area, smoke/soot or wet floor when relevant');
  }
  if (!anxietyLike && /incense|allergen|chemical fumes|irritant|smoke trigger/.test(text) && /asthma|wheeze|bronchospasm|anaphylaxis|allergic/.test(text)) {
    cues.push('show respiratory trigger in the room without making it look like a fire or burn scene');
  }
  if (/drown|submersion|water|beach|pool/.test(text)) {
    cues.push('show water source, wet clothing/skin, rescue posture, hypothermia or airway concern');
  }
  if (/abdominal pain|right lower quadrant|rlq|guarding abdomen|vomiting/.test(text)) {
    cues.push('show hand placement over painful abdominal quadrant and guarding posture');
  }
  if (/chest pain|central chest|stemi|acs|angina/.test(text)) {
    cues.push('show hand to chest, diaphoresis/pallor, seated or collapsed posture matching severity');
  }
  if (!anxietyLike && /short of breath|difficulty breathing|asthma|copd|tripod|wheeze|respiratory/.test(text)) {
    cues.push('show upright/tripod posture, accessory muscle use, visible breathlessness');
  }
  if (/stroke|facial droop|weak arm|slurred/.test(text)) {
    cues.push('show facial asymmetry, one-sided weakness, family witness if present');
  }
  if (/child|paediatric|pediatric|toddler|infant|boy|girl/.test(text) || (caseData.patientInfo?.age ?? 99) < 13) {
    cues.push('show a child-sized patient with age-appropriate proportions and family/caregiver context');
  }

  return cues;
}

function unique(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const item = clean(value);
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function buildSceneVisualBrief(caseData: CaseScenario): SceneVisualBrief {
  const patientDescriptor = getScenePatientDescriptor(caseData);
  const incidentLabel = inferIncidentLabel(caseData);
  const appearance = inferGeneralAppearance(caseData);
  const injuries = inferInjuries(caseData);
  const mechanismCues = mechanismVisualRequirements(caseData);
  const location = clean(caseData.dispatchInfo?.location) || 'location not stated';
  const time = getSceneTimeLabel(caseData);
  const hazards = (caseData.sceneInfo?.hazards || [])
    .map(h => h.trim())
    .filter(h => h && !/^(none|none identified|no obvious hazards?|no hazards?)/i.test(h));

  const visiblePatientCues = unique([
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    appearance.pale ? 'pale/ashen skin tone' : null,
    appearance.cyanotic ? 'cyanosis visible at lips/face' : null,
    appearance.diaphoretic ? 'sweating/clammy appearance' : null,
    appearance.unconscious ? 'unresponsive posture' : null,
    appearance.distressed ? 'obvious distress' : null,
  ]);

  const injuryCues = unique([
    ...injuries.slice(0, 6).map(injury => `${injury.label}: ${injury.detail}`),
    ...mechanismCues,
  ]);

  const environmentCues = unique([
    `${location}`,
    `time: ${time}`,
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.bystanders ? `bystanders: ${caseData.sceneInfo.bystanders}` : null,
  ]);

  const hazardCues = hazards.length > 0 ? hazards : ['no obvious environmental hazards visible'];
  const dispatchSummary = `${patientDescriptor}; ${incidentLabel}; ${location}; ${time}.`;
  const arrivalHeadline = `On arrival, expect ${patientDescriptor} in a ${incidentLabel} scene.`;
  const sceneExpectation = unique([
    ...visiblePatientCues.slice(0, 3),
    ...injuryCues.slice(0, 3),
    ...hazardCues.slice(0, 2),
  ]).join(' | ');

  const fidelityChecklist = unique([
    `patient: ${patientDescriptor}`,
    `setting: ${location}`,
    `time/light: ${time}`,
    `mechanism: ${incidentLabel}`,
    visiblePatientCues[0] ? `posture/appearance: ${visiblePatientCues[0]}` : null,
    injuryCues[0] ? `visible clinical cue: ${injuryCues[0]}` : null,
    hazardCues[0] ? `scene safety: ${hazardCues[0]}` : null,
  ]);

  return {
    patientDescriptor,
    incidentLabel,
    dispatchSummary,
    arrivalHeadline,
    sceneExpectation,
    visiblePatientCues,
    environmentCues,
    hazardCues,
    injuryCues,
    fidelityChecklist,
  };
}
