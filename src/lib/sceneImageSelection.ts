import type { CaseScenario } from '@/types';

type SceneImageEntry = {
  src: string;
  match: RegExp;
  gender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
};

const SCENE_ASSET_GENDER_OVERRIDES: Record<string, 'male' | 'female'> = {
  // These neutral filenames still contain a clearly gendered patient. Keep
  // the metadata beside the resolver so every UI phase and audit agrees.
  '/scene-assets/office-medical-dubai.png': 'male',
  '/scene-assets/cardiac-002-home-cardiac-arrest-deira.png': 'male',
  '/scene-assets/cardiac-004-hypertensive-headache-villa.png': 'male',
  '/scene-assets/cardiac-012-rehab-dizziness-pacemaker.png': 'male',
  '/scene-assets/cardiac-ecg-001-epigastric-mi-burdubai.png': 'male',
  '/scene-assets/litfl-003-renal-failure-hyperkalemia-apartment.png': 'male',
  '/scene-assets/metab-003-clinic-hyperkalemia-renal.png': 'male',
  '/scene-assets/resp-012-mall-restaurant-anaphylaxis-male.png': 'male',
  '/scene-assets/sepsis-001-assisted-living-urosepsis.png': 'female',
  '/scene-assets/y2-009-construction-office-arrest.png': 'male',
  '/scene-assets/staff-accommodation-collapse-sharjah.png': 'male',
  '/scene-assets/construction-fall-male-29-dubaihills.png': 'male',
  '/scene-assets/y2-004-workshop-flash-burn.png': 'male',
  '/scene-assets/trauma-004-park-stabbing-tamponade.png': 'male',
  '/scene-assets/y2-007-student-bedroom-overdose-female.png': 'female',
};

/** Patient gender visibly represented by a scene asset, when it is known. */
export function sceneImagePatientGender(src: string): 'male' | 'female' | undefined {
  const override = SCENE_ASSET_GENDER_OVERRIDES[src];
  if (override) return override;
  const file = src.split('/').pop()?.toLowerCase() ?? '';
  if (/female|woman|obstetric|eclamptic|ectopic/.test(file)) return 'female';
  if (/male/.test(file)) return 'male';
  return undefined;
}

export const KNOWN_SCENE_ASSETS = new Set<string>([
  '/scene-assets/asthma-villa-male-uae.png',
  '/scene-assets/burn-001-jebel-ali-industrial-fire-burns.png',
  '/scene-assets/burn-002-electrical-arrest-business-bay.png',
  '/scene-assets/campus-student-uae.png',
  '/scene-assets/y2-007-student-bedroom-overdose-female.png',
  '/scene-assets/cardiac-002-home-cardiac-arrest-deira.png',
  '/scene-assets/cardiac-004-hypertensive-headache-villa.png',
  '/scene-assets/cardiac-009-elderly-female-aflutter-retirement-home.png',
  '/scene-assets/cardiac-010-supermarket-syncope-female.png',
  '/scene-assets/cardiac-012-rehab-dizziness-pacemaker.png',
  '/scene-assets/cardiac-ecg-001-epigastric-mi-burdubai.png',
  '/scene-assets/cardiac-arrest-mall-male-dubai.png',
  '/scene-assets/construction-anaphylaxis-male-uae.png',
  '/scene-assets/construction-fall-male-29-dubaihills.png',
  '/scene-assets/elderly-fall-bathroom-female-uae.png',
  '/scene-assets/env-002-heat-stroke-jebel-ali.png',
  '/scene-assets/farm-toxicology-male-35-alawir.png',
  '/scene-assets/female-asthma-home-severe-uae.png',
  '/scene-assets/female-asthma-student-sharjah.png',
  '/scene-assets/gym-cardiac-arrest-male-dubai.png',
  '/scene-assets/airport-pe-female-uae.png',
  '/scene-assets/beach-spinal-injury-uae.png',
  '/scene-assets/home-abdominal-female-uae.png',
  '/scene-assets/home-copd-male-68-sharjah.png',
  '/scene-assets/home-fall-female-livingroom-alain.png',
  '/scene-assets/home-medical-female-dubai-apartment.png',
  '/scene-assets/home-medical-male-dubai-apartment.png',
  '/scene-assets/home-meningitis-young-adult-uae.png',
  '/scene-assets/home-pediatric-uae-family.png',
  '/scene-assets/infant-nursery-environment.png',
  '/scene-assets/home-pulmonary-oedema-male-uae.png',
  '/scene-assets/home-stroke-elderly-male-uae.png',
  '/scene-assets/hotel-room-medical-uae.png',
  '/scene-assets/industrial-workshop-male-uae.png',
  '/scene-assets/kitchen-scald-burn-female-uae.png',
  '/scene-assets/litfl-003-renal-failure-hyperkalemia-apartment.png',
  '/scene-assets/litfl-010-balcony-hypothermia-fujairah.png',
  '/scene-assets/mall-foodcourt-chestpain-male-65.png',
  '/scene-assets/mci-highway-uae.png',
  '/scene-assets/metab-001-hypoglycemia-male-villa.png',
  '/scene-assets/metab-003-clinic-hyperkalemia-renal.png',
  '/scene-assets/nightclub-stabbing-male-dubai.png',
  '/scene-assets/obstetric-home-female-uae.png',
  '/scene-assets/obs-002-eclamptic-seizure-pregnant.png',
  '/scene-assets/office-female-palpitations-syncope-dubai.png',
  '/scene-assets/office-abdominal-male-uae.png',
  '/scene-assets/office-medical-dubai.png',
  '/scene-assets/outdoor-heat-illness-uae.png',
  '/scene-assets/paediatric-pool-rescue-environment.png',
  '/scene-assets/parking-garage-opioid-od-uae.png',
  '/scene-assets/postd-001-post-op-wound-infection-ajman.png',
  '/scene-assets/pedestrian-road-night-female-45.png',
  '/scene-assets/pedestrian-road-night.png',
  '/scene-assets/psychiatric-apartment-safety-uae.png',
  '/scene-assets/public-restaurant-female-uae.png',
  '/scene-assets/resp-002-construction-tension-pneumothorax.png',
  '/scene-assets/resp-008-female-pulmonary-oedema-villa.png',
  '/scene-assets/resp-009-restaurant-choking-dubai.png',
  '/scene-assets/resp-011-pneumonia-deira-apartment.png',
  '/scene-assets/resp-012-mall-restaurant-anaphylaxis-male.png',
  '/scene-assets/restaurant-anaphylaxis-female-abu-dhabi.png',
  '/scene-assets/road-traffic-male-dubai.png',
  '/scene-assets/seizure-bedroom-female-uae.png',
  '/scene-assets/sepsis-001-assisted-living-urosepsis.png',
  '/scene-assets/staff-accommodation-collapse-sharjah.png',
  '/scene-assets/trauma-003-deira-chest-wound.png',
  '/scene-assets/trauma-004-park-stabbing-tamponade.png',
  '/scene-assets/trauma-005-trapped-driver-flail-chest.png',
  '/scene-assets/trauma-007-mvc-splenic-luq.png',
  '/scene-assets/trauma-011-industrial-hand-amputation.png',
  '/scene-assets/water-beach-drowning-dubai.png',
  '/scene-assets/y1-008-university-library-panic-female.png',
  '/scene-assets/y1-010-park-bicycle-wrist-fall.png',
  '/scene-assets/y1-020-school-football-tibial-fracture-male.png',
  '/scene-assets/y2-004-workshop-flash-burn.png',
  '/scene-assets/y2-005-office-ectopic-lower-abdo.png',
  '/scene-assets/y2-009-construction-office-arrest.png',
]);

export const PROMPT_SCENE_IMAGE_OVERRIDES: Record<string, string> = {
  // Generated-image targets from CASE_IMAGE_PROMPTS.md. These are only used
  // when the matching PNG exists in public/scene-assets and is listed above,
  // so the app never points at a missing image while production art is pending.
  'cardiac-002': '/scene-assets/cardiac-002-home-cardiac-arrest-deira.png',
  'cardiac-003': '/scene-assets/office-female-palpitations-syncope-dubai.png',
  'cardiac-004': '/scene-assets/cardiac-004-hypertensive-headache-villa.png',
  'cardiac-009': '/scene-assets/cardiac-009-elderly-female-aflutter-retirement-home.png',
  'cardiac-010': '/scene-assets/cardiac-010-supermarket-syncope-female.png',
  'cardiac-012': '/scene-assets/cardiac-012-rehab-dizziness-pacemaker.png',
  'cardiac-ecg-001': '/scene-assets/cardiac-ecg-001-epigastric-mi-burdubai.png',
  'cardiac-013': '/scene-assets/gym-cardiac-arrest-male-dubai.png',
  'cardiac-014': '/scene-assets/paediatric-pool-rescue-environment.png',
  'cardiac-017': '/scene-assets/infant-nursery-environment.png',
  'tox-002': '/scene-assets/parking-garage-opioid-od-uae.png',
  'cardiac-007': '/scene-assets/hotel-room-medical-uae.png',
  'resp-004': '/scene-assets/hotel-room-medical-uae.png',
  'litfl-007': '/scene-assets/airport-pe-female-uae.png',
  'litfl-001': '/scene-assets/y2-009-construction-office-arrest.png',
  'litfl-003': '/scene-assets/litfl-003-renal-failure-hyperkalemia-apartment.png',
  'litfl-010': '/scene-assets/litfl-010-balcony-hypothermia-fujairah.png',
  'litfl-019': '/scene-assets/office-medical-dubai.png',
  // Dedicated plates that were on disk but never routed — briefing/survey
  // must match dispatch location and patient gender. Do not reuse a plate
  // just because the filename is close (bathroom ≠ villa steps, scald ≠ toddler ingestion, arrest ≠ stable angina).
  'trauma-004': '/scene-assets/trauma-004-park-stabbing-tamponade.png',
  'trauma-008': '/scene-assets/pedestrian-road-night-female-45.png',
  'trauma-009': '/scene-assets/construction-fall-male-29-dubaihills.png',
  'cardiac-005': '/scene-assets/mall-foodcourt-chestpain-male-65.png',
  'cardiac-016': '/scene-assets/public-restaurant-female-uae.png',
  'cardiac-ecg-002': '/scene-assets/office-medical-dubai.png',
  'fall-001': '/scene-assets/elderly-fall-bathroom-female-uae.png',
  'fall-002': '/scene-assets/home-medical-male-dubai-apartment.png',
  'fall-003': '/scene-assets/home-medical-female-dubai-apartment.png',
  'y1-001': '/scene-assets/home-fall-female-livingroom-alain.png',
  'y1-003': '/scene-assets/metab-001-hypoglycemia-male-villa.png',
  'y1-004': '/scene-assets/kitchen-scald-burn-female-uae.png',
  'y1-006': '/scene-assets/obstetric-home-female-uae.png',
  'y1-007': '/scene-assets/home-pediatric-uae-family.png',
  'y1-009': '/scene-assets/home-pediatric-uae-family.png',
  'y1-016': '/scene-assets/home-stroke-elderly-male-uae.png',
  'y1-019': '/scene-assets/home-medical-female-dubai-apartment.png',
  'y1-021': '/scene-assets/home-copd-male-68-sharjah.png',
  'y1-022': '/scene-assets/home-abdominal-female-uae.png',
  'y1-023': '/scene-assets/staff-accommodation-collapse-sharjah.png',
  'obs-001': '/scene-assets/obstetric-home-female-uae.png',
  'obs-003': '/scene-assets/obstetric-home-female-uae.png',
  'neuro-002': '/scene-assets/seizure-bedroom-female-uae.png',
  'psych-002': '/scene-assets/psychiatric-apartment-safety-uae.png',
  'psych-003': '/scene-assets/psychiatric-apartment-safety-uae.png',
  'y2-002': '/scene-assets/home-medical-male-dubai-apartment.png',
  'y2-008': '/scene-assets/psychiatric-apartment-safety-uae.png',
  'resp-007': '/scene-assets/home-pediatric-uae-family.png',
  'asthma-mod-001': '/scene-assets/asthma-villa-male-uae.png',
  'ruleout-001': '/scene-assets/home-medical-male-dubai-apartment.png',
  'cardiac-006': '/scene-assets/home-medical-female-dubai-apartment.png',
  'cardiac-015': '/scene-assets/home-medical-male-dubai-apartment.png',
  // Office male cases previously pointed at the female palpitations plate.
  'y1-013': '/scene-assets/office-medical-dubai.png',
  'y1-017': '/scene-assets/office-medical-dubai.png',
  'cardiac-011': '/scene-assets/home-pulmonary-oedema-male-uae.png',
  'resp-008': '/scene-assets/resp-008-female-pulmonary-oedema-villa.png',
  'cardiac-008': '/scene-assets/home-pulmonary-oedema-male-uae.png',
  'neuro-001': '/scene-assets/home-stroke-elderly-male-uae.png',
  'y2-003': '/scene-assets/home-stroke-elderly-male-uae.png',
  'y2-006': '/scene-assets/hotel-room-medical-uae.png',
  'neuro-003': '/scene-assets/home-meningitis-young-adult-uae.png',
  'neuro-004': '/scene-assets/home-meningitis-young-adult-uae.png',
  'y1-002': '/scene-assets/office-abdominal-male-uae.png',
  'metab-001': '/scene-assets/metab-001-hypoglycemia-male-villa.png',
  'metab-002': '/scene-assets/home-abdominal-female-uae.png',
  'metab-003': '/scene-assets/metab-003-clinic-hyperkalemia-renal.png',
  'postd-001': '/scene-assets/postd-001-post-op-wound-infection-ajman.png',
  'env-001': '/scene-assets/env-002-heat-stroke-jebel-ali.png',
  'env-002': '/scene-assets/env-002-heat-stroke-jebel-ali.png',
  'resp-002': '/scene-assets/resp-002-construction-tension-pneumothorax.png',
  'resp-006': '/scene-assets/resp-002-construction-tension-pneumothorax.png',
  'resp-009': '/scene-assets/resp-009-restaurant-choking-dubai.png',
  'resp-011': '/scene-assets/resp-011-pneumonia-deira-apartment.png',
  'resp-012': '/scene-assets/resp-012-mall-restaurant-anaphylaxis-male.png',
  'y2-001': '/scene-assets/female-asthma-student-sharjah.png',
  'asthma-mild-001': '/scene-assets/female-asthma-student-sharjah.png',
  'asthma-sev-001': '/scene-assets/female-asthma-home-severe-uae.png',
  'y1-015': '/scene-assets/restaurant-anaphylaxis-female-abu-dhabi.png',
  'resp-010': '/scene-assets/construction-anaphylaxis-male-uae.png',
  'burn-001': '/scene-assets/burn-001-jebel-ali-industrial-fire-burns.png',
  'burn-002': '/scene-assets/burn-002-electrical-arrest-business-bay.png',
  'general-001': '/scene-assets/office-female-palpitations-syncope-dubai.png',
  'obs-002': '/scene-assets/obs-002-eclamptic-seizure-pregnant.png',
  'ped-001': '/scene-assets/home-pediatric-uae-family.png',
  'ped-002': '/scene-assets/home-pediatric-uae-family.png',
  'psych-001': '/scene-assets/home-medical-female-dubai-apartment.png',
  'trauma-005': '/scene-assets/trauma-005-trapped-driver-flail-chest.png',
  'trauma-006': '/scene-assets/nightclub-stabbing-male-dubai.png',
  'trauma-003': '/scene-assets/trauma-003-deira-chest-wound.png',
  'trauma-007': '/scene-assets/trauma-007-mvc-splenic-luq.png',
  'trauma-010': '/scene-assets/beach-spinal-injury-uae.png',
  'trauma-011': '/scene-assets/trauma-011-industrial-hand-amputation.png',
  'trauma-012': '/scene-assets/paediatric-pool-rescue-environment.png',
  'y1-005': '/scene-assets/home-pediatric-uae-family.png',
  'y1-008': '/scene-assets/y1-008-university-library-panic-female.png',
  'y1-010': '/scene-assets/y1-010-park-bicycle-wrist-fall.png',
  'y1-020': '/scene-assets/y1-020-school-football-tibial-fracture-male.png',
  'y2-005': '/scene-assets/y2-005-office-ectopic-lower-abdo.png',
  'y2-009': '/scene-assets/y2-009-construction-office-arrest.png',
  'y2-004': '/scene-assets/y2-004-workshop-flash-burn.png',
  'litfl-012': '/scene-assets/staff-accommodation-collapse-sharjah.png',
  'multi-001': '/scene-assets/mci-highway-uae.png',
  'sepsis-001': '/scene-assets/sepsis-001-assisted-living-urosepsis.png',
};

const PATIENT_OVERLAY_SCENE_ASSETS = new Set<string>([
  // These are deliberately patient-free environment plates. The scene survey
  // adds the case-driven procedural patient at the correct age and posture,
  // avoiding an adult stock patient in paediatric/infant scenarios.
  '/scene-assets/infant-nursery-environment.png',
  '/scene-assets/paediatric-pool-rescue-environment.png',
  '/scene-assets/y1-010-park-bicycle-wrist-fall.png',
]);

export function sceneImageNeedsPatientOverlay(src: string | null): boolean {
  return Boolean(src && PATIENT_OVERLAY_SCENE_ASSETS.has(src));
}

/**
 * Case-aware overlay decision for scene rendering. The cardiac-017 nursery
 * plate now contains the age-correct infant held by her mother, so adding the
 * legacy procedural figure would duplicate the patient. The one-argument
 * asset predicate remains available for registry validation.
 */
export function caseSceneNeedsPatientOverlay(caseData: CaseScenario, src: string | null): boolean {
  return caseData.id !== 'cardiac-017' && sceneImageNeedsPatientOverlay(src);
}

const CURRENT_CONTEXT_OVERRIDES: Record<string, string> = {
  // Closest currently available images while the exact prompt targets above
  // are being generated. These remove obvious scene/context contradictions.
  'tox-002': '/scene-assets/home-medical-male-dubai-apartment.png',
  'cardiac-007': '/scene-assets/home-medical-male-dubai-apartment.png',
  'cardiac-011': '/scene-assets/home-copd-male-68-sharjah.png',
  'resp-008': '/scene-assets/home-medical-female-dubai-apartment.png',
  'neuro-001': '/scene-assets/home-medical-male-dubai-apartment.png',
  'neuro-003': '/scene-assets/home-medical-male-dubai-apartment.png',
  'litfl-012': '/scene-assets/staff-accommodation-collapse-sharjah.png',
  'multi-001': '/scene-assets/road-traffic-male-dubai.png',
};

export const SCENE_IMAGE_REGISTRY: SceneImageEntry[] = [
  {
    src: '/scene-assets/elderly-fall-bathroom-female-uae.png',
    match: /elderly|older|fall|hip fracture|neck of femur|bathroom|rug|slipped/,
    gender: 'female',
    minAge: 60,
  },
  {
    src: '/scene-assets/asthma-villa-male-uae.png',
    match: /life[-\s]?threatening asthma|severe asthma|asthma attack|wheeze|bronchospasm|tripod/,
  },
  {
    src: '/scene-assets/seizure-bedroom-female-uae.png',
    match: /seizure|postictal|post-ictal|tonic[-\s]?clonic|convulsion|jerking limbs/,
    gender: 'female',
  },
  {
    src: '/scene-assets/psychiatric-apartment-safety-uae.png',
    match: /psychosis|psychotic|psychiatric|behaviou?r|agitated|aggressive|bizarre|talking to unseen/,
  },
  {
    src: '/scene-assets/cardiac-arrest-mall-male-dubai.png',
    match: /cardiac arrest|not breathing|cpr|aed|vf\b|pea\b|asystole/,
    gender: 'male',
    minAge: 18,
  },
  {
    src: '/scene-assets/kitchen-scald-burn-female-uae.png',
    match: /scald|kitchen burn|burn|hot water|boiling/,
    gender: 'female',
  },
  {
    src: '/scene-assets/pedestrian-road-night-female-45.png',
    match: /pedestrian|struck by car|pelvic pain|pelvic fracture/,
    gender: 'female',
    minAge: 35,
    maxAge: 60,
  },
  {
    src: '/scene-assets/mall-foodcourt-chestpain-male-65.png',
    match: /chest pain|stable angina|angina/,
    gender: 'male',
    minAge: 55,
  },
  {
    src: '/scene-assets/home-copd-male-68-sharjah.png',
    match: /copd|increased breathlessness|oxygen at home|home oxygen/,
    gender: 'male',
    minAge: 60,
  },
  {
    src: '/scene-assets/construction-fall-male-29-dubaihills.png',
    match: /fall from height|construction|scaffolding|head injury/,
    gender: 'male',
    minAge: 18,
    maxAge: 45,
  },
  {
    src: '/scene-assets/farm-toxicology-male-35-alawir.png',
    match: /organophosphate|pesticide|spraying pesticides|farm worker|chemical contamination/,
    gender: 'male',
    minAge: 25,
    maxAge: 50,
  },
  {
    src: '/scene-assets/pedestrian-road-night.png',
    match: /pedestrian|struck by car|pelvic pain|pelvic fracture/,
    gender: 'male',
  },
];

function normalisedGender(caseData: CaseScenario): 'male' | 'female' | undefined {
  const rawGender = String(caseData.patientInfo?.gender || '').toLowerCase();
  if (rawGender.includes('female')) return 'female';
  if (rawGender.includes('male')) return 'male';
  return undefined;
}

function sceneHaystack(caseData: CaseScenario): string {
  return [
    caseData.dispatchInfo?.callReason,
    caseData.dispatchInfo?.location,
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.hazards?.join(' '),
    caseData.category,
    caseData.subcategory,
    caseData.title,
  ].join(' ').toLowerCase();
}

function selectTemplateSceneImage(
  haystack: string,
  age?: number,
  gender?: 'male' | 'female',
): string {
  const isChild = (age != null && age < 13) || /paediatric|pediatric|toddler|infant|child|boy|girl|febrile|croup/.test(haystack);
  const isFemale = gender === 'female' || /\bfemale\b|pregnan|woman|mother/.test(haystack);
  const isMale = gender === 'male' || /\bmale\b|man|worker|father/.test(haystack);

  // "Labour accommodation" is a common UAE scene location and must never be
  // mistaken for obstetric labour. Require an actual obstetric context.
  if (/pregnan|obstetric|eclampsia|delivery|ectopic|postpartum|\b(?:in|active|preterm) labou?r\b|labou?r pains?|contractions?/.test(haystack)) {
    return '/scene-assets/obstetric-home-female-uae.png';
  }

  if (/cardiac arrest|not breathing|cpr|aed|vf\b|pea\b|asystole/.test(haystack)) {
    return /mall|shopping|public|security|bystander|workplace|office/.test(haystack)
      ? '/scene-assets/cardiac-arrest-mall-male-dubai.png'
      : isFemale
        ? '/scene-assets/home-medical-female-dubai-apartment.png'
        : '/scene-assets/home-medical-male-dubai-apartment.png';
  }

  if (/scald|kitchen burn|hot water|boiling/.test(haystack)) {
    return '/scene-assets/kitchen-scald-burn-female-uae.png';
  }

  if (/elderly|older adult|fall|hip fracture|neck of femur|bathroom|rug|slipped/.test(haystack) && (age == null || age >= 60)) {
    return isFemale
      ? '/scene-assets/elderly-fall-bathroom-female-uae.png'
      : '/scene-assets/home-medical-male-dubai-apartment.png';
  }

  if (/life[-\s]?threatening asthma|severe asthma|asthma attack|wheeze|bronchospasm|tripod/.test(haystack)) {
    return '/scene-assets/asthma-villa-male-uae.png';
  }

  if (/seizure|postictal|post-ictal|tonic[-\s]?clonic|convulsion|jerking limbs/.test(haystack)) {
    if (isFemale) return '/scene-assets/seizure-bedroom-female-uae.png';
    return /office|workplace|corporate/.test(haystack)
      ? '/scene-assets/office-medical-dubai.png'
      : '/scene-assets/home-medical-male-dubai-apartment.png';
  }

  if (/psychosis|psychotic|psychiatric|behaviou?r|agitated|aggressive|bizarre|talking to unseen/.test(haystack)) {
    return '/scene-assets/psychiatric-apartment-safety-uae.png';
  }

  if (isChild) {
    return /school|nursery|campus|university|student/.test(haystack)
      ? '/scene-assets/campus-student-uae.png'
      : '/scene-assets/home-pediatric-uae-family.png';
  }

  if (/drown|hypotherm|beach|pool|\bwater\b|\bsea\b|submersion|lifeguard/.test(haystack)) {
    return '/scene-assets/water-beach-drowning-dubai.png';
  }

  if (/organophosphate|pesticide|farm|chemical|hazmat|contamination/.test(haystack)) {
    return isMale ? '/scene-assets/farm-toxicology-male-35-alawir.png' : '/scene-assets/outdoor-heat-illness-uae.png';
  }

  if (/heat stroke|heat exhaustion|hypertherm|hot sun|desert|outdoor heat/.test(haystack)) {
    return '/scene-assets/outdoor-heat-illness-uae.png';
  }

  if (/construction|scaffold|fall from height/.test(haystack)) {
    return '/scene-assets/construction-fall-male-29-dubaihills.png';
  }

  if (/workshop|industrial|factory|warehouse|machinery|amputation|flash burn|electrical burn|workplace/.test(haystack)) {
    return '/scene-assets/industrial-workshop-male-uae.png';
  }

  if (/\broad\b|\bstreet\b|\btraffic\b|\bvehicle\b|\bcar\b|\bcars\b|\bmotorcycle\b|\bcollision\b|\brtc\b|\bmvc\b|\bpedestrian\b|\bbicycle\b|\bbike\b|\bbus\b/.test(haystack)) {
    return isFemale ? '/scene-assets/pedestrian-road-night-female-45.png' : '/scene-assets/road-traffic-male-dubai.png';
  }

  if (/office|downtown|work desk|corporate/.test(haystack)) {
    return '/scene-assets/office-medical-dubai.png';
  }

  if (/school|campus|university|student/.test(haystack)) {
    return '/scene-assets/campus-student-uae.png';
  }

  if (/restaurant|cafe|food court|mall|shopping|public place|security guard/.test(haystack)) {
    return isFemale ? '/scene-assets/public-restaurant-female-uae.png' : '/scene-assets/mall-foodcourt-chestpain-male-65.png';
  }

  if (/home|apartment|villa|bedroom|bathroom|kitchen|house|hotel room/.test(haystack)) {
    if (/copd|home oxygen|oxygen at home/.test(haystack) && isMale) return '/scene-assets/home-copd-male-68-sharjah.png';
    return isFemale ? '/scene-assets/home-medical-female-dubai-apartment.png' : '/scene-assets/home-medical-male-dubai-apartment.png';
  }

  return isFemale ? '/scene-assets/home-medical-female-dubai-apartment.png' : '/scene-assets/home-medical-male-dubai-apartment.png';
}

function hasSceneAsset(src: string): boolean {
  return KNOWN_SCENE_ASSETS.has(src);
}

function resolveCaseSceneOverride(caseData: CaseScenario): string | null {
  const caseId = caseData.id;
  if (!caseId) return null;

  const promptTarget = PROMPT_SCENE_IMAGE_OVERRIDES[caseId];
  if (promptTarget && hasSceneAsset(promptTarget)) return promptTarget;

  const currentBest = CURRENT_CONTEXT_OVERRIDES[caseId];
  if (currentBest && hasSceneAsset(currentBest)) return currentBest;

  return null;
}

export function inferSceneImage(caseData: CaseScenario): string {
  const caseOverride = resolveCaseSceneOverride(caseData);
  if (caseOverride) return caseOverride;

  // A plate authored ON the case is a stronger signal than keyword matching
  // against the registry. y2-007 is why: it authors a student-bedroom plate
  // for a female overdose, and the registry's "student/campus" keywords
  // rendered a classroom full of people around a male patient instead.
  //
  // The override layer above still wins, because that is the deliberate patch
  // layer for cases whose authored choice was itself wrong. Guarded on
  // KNOWN_SCENE_ASSETS so a typo cannot render a 404.
  const authored = caseData.sceneInfo?.sceneImagePath;
  if (authored && KNOWN_SCENE_ASSETS.has(authored)) return authored;

  const haystack = sceneHaystack(caseData);
  const age = caseData.patientInfo?.age;
  const gender = normalisedGender(caseData);

  for (const entry of SCENE_IMAGE_REGISTRY) {
    if (!entry.match.test(haystack)) continue;
    if (entry.src.includes('elderly-fall') && !/home|apartment|villa|bathroom|fall|slipped|rug|hip/.test(haystack)) continue;
    if (entry.src.includes('asthma-villa') && !/asthma|wheeze|breath|bronchospasm|tripod/.test(haystack)) continue;
    if (entry.src.includes('seizure-bedroom') && !/seizure|postictal|post-ictal|tonic|convulsion|jerking/.test(haystack)) continue;
    if (entry.src.includes('psychiatric-apartment') && !/psych|behaviou?r|agitat|aggress|bizarre|talking to unseen/.test(haystack)) continue;
    if (entry.src.includes('cardiac-arrest') && !/arrest|not breathing|cpr|aed|vf\b|pea\b|asystole/.test(haystack)) continue;
    if (entry.src.includes('kitchen-scald') && !/kitchen|scald|burn|hot water|boiling/.test(haystack)) continue;
    if (entry.src.includes('mall-foodcourt') && !/mall|food court|shopping/.test(haystack)) continue;
    if (entry.src.includes('pedestrian-road') && !/dubai|mamzar|beach|road|street|sheikh zayed/.test(haystack)) continue;
    if (entry.src.includes('home-copd') && !/apartment|sharjah|home|oxygen/.test(haystack)) continue;
    if (entry.src.includes('construction-fall') && !/construction|dubai hills|scaffolding|site/.test(haystack)) continue;
    if (entry.src.includes('farm-toxicology') && !/farm|al awir|pesticide|chemical/.test(haystack)) continue;
    if (entry.gender && gender && entry.gender !== gender) continue;
    if (entry.minAge != null && age != null && age < entry.minAge) continue;
    if (entry.maxAge != null && age != null && age > entry.maxAge) continue;
    return entry.src;
  }

  return selectTemplateSceneImage(haystack, age, gender);
}

// ---------------------------------------------------------------------------
// Animated arrival clips (opt-in, sparse). A case may carry an optional
// `sceneInfo.sceneVideoPath`; when it does AND the clip is registered, the
// Scene Brief card renders a muted looping <video> instead of the static
// image. Falls back to null → existing image path everywhere else.
// ---------------------------------------------------------------------------

/** Case-id → arrival clip path. Deliberately tiny: video is expensive to
 *  generate, so this is the sparse high-value layer, not blanket coverage. */
const SCENE_VIDEO_OVERRIDES: Record<string, string> = {
  'resp-001': '/scene-assets/arrival-resp-001-villa.mp4',
};

const KNOWN_SCENE_VIDEOS = new Set<string>([
  '/scene-assets/arrival-trauma-001-rtc.mp4',
  '/scene-assets/arrival-resp-001-villa.mp4',
]);

export function hasSceneVideoAsset(src: string): boolean {
  return KNOWN_SCENE_VIDEOS.has(src);
}

/**
 * Resolve the animated arrival clip for a case, or null. Mirrors
 * `inferSceneImage` but for the (optional, sparse) video layer.
 */
export function inferSceneVideo(caseData: CaseScenario): string | null {
  const caseId = caseData.id;
  if (!caseId) return null;
  const override = SCENE_VIDEO_OVERRIDES[caseId];
  if (override && hasSceneVideoAsset(override)) return override;
  const authored = caseData.sceneInfo?.sceneVideoPath;
  if (authored && hasSceneVideoAsset(authored)) return authored;
  return null;
}

