import type { CaseScenario } from '@/types';

/**
 * Which 3D environment the treatment-bay scene renders in — derived from the
 * case's own scene words, same approach as patientStaging.ts.
 *
 * This drives the 3D presentation only. It never changes clinical state.
 */
export type EnvironmentVariant =
  | 'clinic'
  | 'home'
  | 'public'
  | 'roadside'
  | 'industrial'
  | 'fire'
  | 'water'
  | 'heat'
  | 'agricultural';

export const SCENE_ENVIRONMENT_LABELS: Record<EnvironmentVariant, string> = {
  clinic: 'clinical bay',
  home: 'home scene',
  public: 'public venue',
  roadside: 'road incident',
  industrial: 'worksite scene',
  fire: 'fire scene',
  water: 'water rescue',
  heat: 'heat exposure',
  agricultural: 'farm field',
};

const WORKSITE_OFFICE_PATTERN = /\b(?:construction|building|work)site office\b|\bportacabin\b/;

/**
 * Human-facing scene label. The rendered avenue can stay a public interior,
 * while the student-facing chip preserves the operational context from
 * dispatch (for example a construction-site office is not a generic venue).
 */
export function sceneEnvironmentLabel(caseData: CaseScenario, variant: EnvironmentVariant): string {
  const sceneText = [
    caseData.dispatchInfo?.location,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (WORKSITE_OFFICE_PATTERN.test(sceneText)) return 'worksite office';
  return SCENE_ENVIRONMENT_LABELS[variant];
}

// ponytail: keyword scene-typing over authored per-case data — mirrors the
// staging heuristic. Ambiguous scenes fall through to the clinic bay.
// Upgrade path: an authored `sceneVariant` field per case.
const FIRE_PATTERN = new RegExp(
  [
    '\\bfire\\b',
    'house fire',
    'warehouse fire',
    'industrial fire',
    'smoke inhalation',
    '\\bflame(?:s)?\\b',
    '\\bexplosion\\b',
  ].join('|'),
);

const WATER_PATTERN = new RegExp(
  [
    // "Beach Road" is a street name (an RTA on it is a road incident), not a
    // beach rescue. A genuine beach scene never carries a road suffix.
    '\\bbeach\\b(?!\\s+(?:road|street|drive|avenue|boulevard)\\b)',
    // "blood pool" is haemorrhage under the patient, not a swimming pool.
    '(?<!blood )\\bpool(?:side)?\\b',
    '\\bsea\\b',
    '\\bdrown(?:ing|ed)?\\b',
    '\\bsubmersion\\b',
    '\\bnear-drowning\\b',
  ].join('|'),
);

const INDUSTRIAL_PATTERN = new RegExp(
  [
    'construction site',
    'building site',
    '\\bwarehouse\\b',
    '\\bfactory\\b',
    '\\bworkshop\\b',
    // "Industrial Area" / "Industrial Zone" is a Dubai district name in a
    // dispatch address (e.g. a gym in Al Quoz Industrial Area), not a worksite.
    // A genuine industrial scene uses construction/factory/workshop/machinery.
    '\\bindustrial\\b(?!\\s+(?:area|zone|district|park)\\b)',
    '\\bscaffold(?:ing)?\\b',
    '\\bmachinery\\b',
  ].join('|'),
);

const AGRICULTURAL_PATTERN = new RegExp(
  [
    '\\bfarm\\b',
    'cotton field',
    'orchard',
    'vineyard',
    'greenhouse',
    'barn',
    'agricultural',
    'pesticide',
    '\\bsprayer\\b',
  ].join('|'),
);

const HEAT_PATTERN = new RegExp(
  [
    '\\bdesert\\b',
    '\\bheatstroke\\b',
    '\\bheat exhaustion\\b',
    '\\bheat illness\\b',
    '\\bhyperthermia\\b',
    '\\bsun exposure\\b',
    'direct sun',
    '\\boutdoor work(?:er|site)?\\b',
    // A sports field/pitch is a location, not a heat illness; a twisted ankle
    // on the pitch must not render as heat exposure.
  ].join('|'),
);

const ROADSIDE_PATTERN = new RegExp(
  [
    '\\broad\\b',
    'roadside',
    '\\bstreet\\b',
    'highway',
    'motorway',
    '\\brta\\b',
    '\\bmvc\\b',
    'collision',
    'car crash',
    'vehicle crash',
    'motorcycle',
    'motorbike',
    'pedestrian',
    'struck',
    'run over',
    'car park',
    'parking lot',
    'pavement',
    'sidewalk',
    '\\bkerb\\b',
    '\\bcurb\\b',
    '\\bpitch\\b',
    '\\bfield\\b',
  ].join('|'),
);

const VEHICLE_INCIDENT_PATTERN = new RegExp(
  [
    '\\brta\\b',
    '\\bmvc\\b',
    '\\bcollision\\b',
    'car crash',
    'vehicle crash',
    '\\bmotorcycle\\b',
    '\\bmotorbike\\b',
    '\\bpedestrian\\b',
    '\\bstruck by (?:a )?(?:car|vehicle|truck|lorry)\\b',
    '\\brun over\\b',
  ].join('|'),
);

const HOME_PATTERN = new RegExp(
  [
    '\\bvilla\\b',
    'apartment',
    '\\bflat\\b',
    '\\bhome\\b',
    '\\bhouse\\b',
    'residence',
    'bedroom',
    'living room',
    '\\bkitchen\\b',
    '\\bmajlis\\b',
    'hotel room',
  ].join('|'),
);

const PUBLIC_PATTERN = new RegExp(
  [
    '\\bmall\\b',
    'shopping',
    'supermarket',
    '\\bsouk\\b',
    '\\boffice\\b',
    '\\bhotel\\b',
    'restaurant',
    '\\bcafe\\b',
    '\\bschool\\b',
    'university',
    '\\bcollege\\b',
    '\\bmosque\\b',
    '\\bgym\\b',
    '\\bairport\\b',
    '\\bmetro\\b',
    '\\bstadium\\b',
    'warehouse',
  ].join('|'),
);

/**
 * Derive the environment variant from the scene's own words. The most
 * clinically distinctive scenes win first: a warehouse fire must not become
 * a generic industrial bay, and a beach drowning must not become a road.
 * Roadside still wins over home/public (an RTA outside a villa is outdoors).
 */
export function deriveSceneEnvironment(caseData: CaseScenario): EnvironmentVariant {
  const authoredVariant = caseData.sceneInfo?.environmentVariant;
  const text = [
    caseData.title,
    caseData.subcategory,
    caseData.dispatchInfo?.location,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // New, specific authored variants are authoritative. Legacy scene data only
  // knew clinic/home/public/roadside; incident-defining evidence must be able
  // to migrate an old generic override (for example, a pool drowning that was
  // historically marked roadside) without mutating the clinical case record.
  if (authoredVariant && ['industrial', 'fire', 'water', 'heat', 'agricultural'].includes(authoredVariant)) {
    return authoredVariant;
  }
  if (FIRE_PATTERN.test(text)) return 'fire';
  if (WATER_PATTERN.test(text)) return 'water';
  if (HEAT_PATTERN.test(text)) return 'heat';
  if (VEHICLE_INCIDENT_PATTERN.test(text)) return 'roadside';
  if (AUTHORED_AGRI.test(text)) return 'agricultural';
  if (AGRICULTURAL_PATTERN.test(text) && !authoredVariant) return 'agricultural';
  if (
    INDUSTRIAL_PATTERN.test(text)
    && (!authoredVariant || ['public', 'roadside'].includes(authoredVariant))
    && !/\boffice\b|portacabin/.test(text)
  ) {
    return 'industrial';
  }
  if (authoredVariant) return authoredVariant;
  if (INDUSTRIAL_PATTERN.test(text)) return 'industrial';
  if (ROADSIDE_PATTERN.test(text)) return 'roadside';
  if (HOME_PATTERN.test(text)) return 'home';
  if (PUBLIC_PATTERN.test(text)) return 'public';
  return 'clinic';
}

const AUTHORED_AGRI = /\b(?:farm|agricultural)\b/i;
