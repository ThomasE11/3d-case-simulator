import type { CaseScenario } from '@/types';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

/**
 * Authored 3D Jutsu / Blender scene profiles. One strong GLB can serve many
 * cases that share an environment archetype; patient pose stays separate.
 */
export type SceneProfile =
  | 'resp-001-villa'
  | 'y2-007-od-bedroom'
  | 'trauma-008-roadside'
  | 'bathroom-fall';

export type SceneArchetypeEntry = {
  profile: SceneProfile;
  /** Public URL under /models/scenes/ */
  glbUrl: string;
  /** Preferred bay environment variant this dressing belongs to. */
  variant: EnvironmentVariant;
  /** Case ids that should use this GLB immediately. */
  caseIds: readonly string[];
  /** Optional keyword haystack match against location/environment/description. */
  keywords?: RegExp;
  /** Higgsfield 3D Jutsu project id (audit trail). */
  higgsfieldProjectId: string;
  revision: number;
  /** Mesh-name prefixes to keep from the GLB (empty = keep all meshes). */
  includeMeshPrefixes?: readonly string[];
  /** Mesh-name prefixes to hide (room shells when the shared variant already has walls). */
  excludeMeshPrefixes?: readonly string[];
  /**
   * Node names whose extra local rotation should be zeroed after load.
   * Kenney sedan in the roadside GLB was exported rolled 90° about Z.
   */
  unrollNodeNames?: readonly string[];
  /**
   * Named parents whose visible-mesh AABB is snapped so min-Y sits on the
   * bay floor. Applied after unroll. Do not list both a parent and its child.
   */
  groundNodePrefixes?: readonly string[];
  /** World-space translation of the whole dressing (pull a far catalog prop into the bay). */
  rootOffset?: readonly [number, number, number];
  /** Extra local translation applied to named nodes after unroll + ground. */
  nodeOffsets?: Readonly<Record<string, readonly [number, number, number]>>;
};

export const SCENE_ARCHETYPES: readonly SceneArchetypeEntry[] = [
  {
    profile: 'resp-001-villa',
    glbUrl: '/models/scenes/resp-001-villa-dressing.glb',
    variant: 'home',
    caseIds: ['resp-001'],
    keywords: /\bvilla\b.*\bal ain\b|\bal ain\b.*\bvilla\b/i,
    higgsfieldProjectId: '35130cd0-bfc0-4096-a4e3-19f7f7945918',
    revision: 3,
    includeMeshPrefixes: ['asthma_'],
  },
  {
    profile: 'y2-007-od-bedroom',
    glbUrl: '/models/scenes/y2-007-od-bedroom.glb',
    variant: 'home',
    caseIds: ['y2-007'],
    keywords: /\bstudent (?:accommodation|bedroom)|academic city|paracetamol overdose/i,
    higgsfieldProjectId: 'e322ce53-08ff-4171-a05d-f1d50d2324f1',
    revision: 3,
    // Kenney bed mesh origin sits 55 cm above the floor; snap the parent, not the child.
    groundNodePrefixes: ['IntBed01'],
    // Slide the grounded bed so the seated patient sits on the camera-facing edge.
    nodeOffsets: { IntBed01: [-0.7, 0, -1.58] },
    // Keep furniture + bed; drop metre-scale room shell (HomeScene already builds walls).
    excludeMeshPrefixes: [
      'BedroomFloor',
      'BedroomCeiling',
      'BedroomWall_',
      'DeliveryCamera',
      'BedroomKey',
      'BedroomFill',
      'BedroomRim',
      'PatientPlant_',
    ],
  },
  {
    profile: 'trauma-008-roadside',
    glbUrl: '/models/scenes/trauma-008-roadside-mvc.glb',
    variant: 'roadside',
    caseIds: ['trauma-008'],
    keywords: /\bmamzar\b|pedestrian struck|pelvic fracture/i,
    higgsfieldProjectId: '362542eb-eed5-422d-99e4-e3a58f0377c8',
    revision: 3,
    // Prefer the catalog sedan; hide procedural asphalt that fights the bay road plane.
    // Match node *and* ancestor names so Kenney Cube children of car_sedan stay visible.
    includeMeshPrefixes: ['car_sedan', 'CarSedan', 'BumperDeform'],
    // Exported on its side (quat z=90°) with the body origin at y≈4.2 m.
    unrollNodeNames: ['CarSedan01'],
    groundNodePrefixes: ['CarSedan01'],
    // Pull the grounded sedan into the right of the exam frustum (AABB was x≈1.7–2.9, just off-camera).
    rootOffset: [-4.2, 0, -1.6],
  },
  {
    profile: 'bathroom-fall',
    glbUrl: '/models/scenes/bathroom-fall.glb',
    variant: 'home',
    caseIds: ['fall-001', 'fall-003', 'litfl-012'],
    keywords: /\bbathroom\b|\bbath\b.*\bfall\b|\bfall\b.*\bbath/i,
    higgsfieldProjectId: '80420c68-cfc6-48a0-b5f3-02638c0c5d4a',
    revision: 2,
    excludeMeshPrefixes: [
      'BathFloor',
      'BathCeil',
      'BathWall_',
      'DeliveryCamera',
      'BathKey',
      'BathFill',
      'PatientPlant_',
    ],
  },
] as const;

function caseHaystack(caseData: CaseScenario): string {
  return [
    caseData.id,
    caseData.title,
    caseData.dispatchInfo?.location,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Resolve authored scene dressing for a case (case id wins over keywords). */
export function resolveSceneArchetype(caseData: CaseScenario): SceneArchetypeEntry | undefined {
  const byId = SCENE_ARCHETYPES.find(entry => entry.caseIds.includes(caseData.id));
  if (byId) return byId;
  const hay = caseHaystack(caseData);
  return SCENE_ARCHETYPES.find(entry => entry.keywords?.test(hay));
}

export function resolveSceneProfile(caseData: CaseScenario): SceneProfile | undefined {
  return resolveSceneArchetype(caseData)?.profile;
}

export function isResp001VillaProfile(profile: SceneProfile | undefined): boolean {
  return profile === 'resp-001-villa';
}

export function isY2007OdBedroomProfile(profile: SceneProfile | undefined): boolean {
  return profile === 'y2-007-od-bedroom';
}

export function isTrauma008RoadsideProfile(profile: SceneProfile | undefined): boolean {
  return profile === 'trauma-008-roadside';
}

export function isBathroomFallProfile(profile: SceneProfile | undefined): boolean {
  return profile === 'bathroom-fall';
}

function nameMatchesPrefix(name: string, prefix: string): boolean {
  return name.startsWith(prefix) || name.includes(prefix);
}

/**
 * Visibility for a GLB mesh given its own name plus ancestor node names.
 * Include/exclude prefixes match any name in the chain so catalog props whose
 * leaf meshes are generic (`Cube.008`) still follow the named parent
 * (`BumperDeformProxy`, `car_sedan_01`).
 */
export function archetypeMeshVisible(
  names: readonly string[],
  entry: Pick<SceneArchetypeEntry, 'includeMeshPrefixes' | 'excludeMeshPrefixes'>,
): boolean {
  const { includeMeshPrefixes, excludeMeshPrefixes } = entry;
  if (excludeMeshPrefixes?.some(prefix => names.some(name => nameMatchesPrefix(name, prefix)))) {
    return false;
  }
  if (includeMeshPrefixes && includeMeshPrefixes.length > 0) {
    return includeMeshPrefixes.some(prefix => names.some(name => nameMatchesPrefix(name, prefix)));
  }
  return true;
}

/** Keep the room dressed after transfer while removing the vacated support. */
export function resp001VillaMeshVisible(name: string, showPatientSeat: boolean): boolean {
  return showPatientSeat || !name.startsWith('asthma_chair_');
}
