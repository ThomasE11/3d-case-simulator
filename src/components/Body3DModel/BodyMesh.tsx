/**
 * Realistic 3D human body mesh loaded from GLB model.
 *
 * Male and female cases use their own MPFB clinical shell. Both active assets
 * carry a fitted Mixamo skeleton, case-finding morphs and real eye meshes; the
 * legacy patient remains only as a neutral fallback when gender is unknown.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { JSX } from 'react';
import type React from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  buildScrubs,
  buildBlendedGarments,
  CLOTHING_PARTING,
  CLOTHING_MODE,
  ALL_GARMENT_GLBS,
  adolescentGarmentGlbsForModel,
  garmentGlbsForModel,
  RESP001_GARMENT_GLBS,
} from './ClothingLayer';
import { buildHairLayer } from './HairLayer';
import { paintEyesOnTexture } from './EyesLayer';
import { buildMottledTextures, buildCyanosisLocalTwin } from './MottlingLayer';
import { applyWoundsToTextures } from './WoundLayer';
import { armAmputationSides } from './amputationPresentation';
import { injuryRegionTo3D, type BodyInjury } from '@/lib/injuryMap';
import { LifeSigns } from './LifeSigns';
import { createFaceAttachment } from './patientAttachments';
import { createPatientPulseAnchors } from './patientPulseAnchors';
import { createAssessmentContactSampler, type AssessmentContactFrame } from './assessmentContact';
import { IdleAnimations, type IdleCues } from './IdleAnimations';
import { getBreathPhase01, setBreathClock } from '@/lib/breathClock';
import { computeIdleLimbMotion, createIdleLimbMotion } from '@/lib/idleLimbMotion';
import { pupilDiscScale } from '@/lib/pupilDiscScale';
import { patientWalkingPath } from '@/lib/patientWalkingPath';
import { tripodHandBraceSweep, TRIPOD_BRACE_CALIBRATION } from '@/lib/tripodHandBrace';
import { skinDetailProfileForPilot, type SkinDetailProfile } from './resp001SkinDetail';
import { shouldApplyCorrectedLipArticulation, withResp001LipArticulationMorph } from './resp001LipArticulation';
import { lipSeamForCrown } from './lipSeamTable';
import { createEyeMorphFollower } from './eyeMorphFollow';
import {
  patientSkeletalAction,
  patientArmRestRadians,
  patientForearmRestRadians,
  patientForearmSweepRadians,
  patientSpineLeanRadians,
  type NeurologicalWeakSide,
  type PatientMobility,
  type PatientPosture,
} from '@/lib/patientStaging';
import {
  PATIENT_MOTION_MORPHS,
  type PatientMotionSignals,
} from '@/lib/patientMotion';
import type { ThreeEvent } from '@react-three/fiber';
import { HOVER_COLOR, ASSESSED_COLOR, GUIDED_NEXT_COLOR, GUIDED_LOCKED_COLOR } from './bodyRegions';
import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';
import {
  patientExpectedHeightMetres,
  patientModelPath,
} from '@/lib/patientAgePresentation';

export type SurfaceSamplerSpace = 'author' | 'mesh';

export interface SurfaceSamplerOptions {
  /**
   * Most markers are authored in the broad 1.8m / 0.5 half-width body frame.
   * Facial texel-derived anchors are already in mounted mesh coordinates and
   * must not be scaled a second time.
   */
  coordinateSpace?: SurfaceSamplerSpace;
  anatomicalSite?: string;
}

export type SurfaceSampler = ((
  x: number,
  y: number,
  options?: SurfaceSamplerOptions,
) => [number, number, number]) & {
  contact?: (x: number, y: number) => AssessmentContactFrame | null;
};

// Stage-parametric supine transform: same rotation/scale, different height.
// 'stretcher' rests the patient's back on the mattress; 'floor' rests it on
// the room floor for found-on-the-ground scenes ("treat them where they lie").
export type BayPatientStage = 'stretcher' | 'floor';

// Grounding is calibrated from the final exported male mesh's world-space
// bounds. The road is y=-0.05 and the stretcher sheet top is y=0.5025; these
// stage origins place the active posture against those support planes.
//
// The supine "body thickness" is the rig-origin-to-posterior depth measured on
// the skinned mesh in the treatment bay (root Y 0.98 → back min-Y ≈ 0.724,
// i.e. ≈ 0.256 m). The pre-normalisation constant of 0.4775 m assumed the back
// sat twice that far below the origin, leaving every recumbent patient to
// hover ~0.22 m above the bed, stretcher or floor.
const SUPINE_POSTERIOR_DEPTH = 0.256;
const BAY_STAGE_Y: Record<BayPatientStage, number> = {
  stretcher: 0.5025 + SUPINE_POSTERIOR_DEPTH,
  floor: -0.05 + SUPINE_POSTERIOR_DEPTH,
};
const BAY_SUPPORT_Y: Record<BayPatientStage, number> = { stretcher: 0.5025, floor: -0.05 };
const BAY_PATIENT_SCALE = 1.04;
// The final seated assets place their soles 0.289–0.321 m above the morph
// origin across adult female/male bodies. The midpoint keeps either sex within
// roughly 2 cm of the room floor, then scales continuously for younger bodies.
const SEATED_SOLE_LIFT = 0.305;
// Calibrated against the pilot's 32 mm rug, rather than the generic floor.
export const RESP001_SEATED_SUPPORT_LIFT = 0.051;

export function getTreatmentBayTransform(
  stage: BayPatientStage = 'stretcher',
  posture: string | null = null,
  mobility: PatientMobility = 'recumbent',
  patientScale = 1,
  seatedSupportLift = 0,
  plant?: { x?: number; z?: number },
) {
  if (mobility === 'standing' || mobility === 'pacing') {
    return {
      // The environment floor is y=-0.05. The normalised rig has its soles at
      // y=0, so this keeps an ambulatory patient planted instead of hovering
      // at stretcher height.
      position: [0, -0.045, 0.22] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1.04,
    };
  }
  const baseRotation = -Math.PI / 2;
  // Tripod remains upright—the authored morph supplies the forward lean and
  // braced arms. A residual -0.35rad root pitch was cancelling that lean and
  // making the seated patient look bolt upright from the arrival camera.
  const uprightSeated = posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated';
  const pitchUp = uprightSeated ? Math.PI / 2 : 0;
  // Upright tripod feet are at the model origin, so cancel the stage's supine
  // body-thickness calibration while retaining the support-surface height.
  // The refined tripod morph raises the knees and hangs the lower legs from
  // the seat. Ground the soles on the same support plane as the room instead
  // of retaining the old straight-legged morph's stretcher-height offset.
  // The rig is authored standing along local Y, so recovery rolls around that
  // longitudinal axis before the root is laid onto the support surface.
  const rollSide = posture === 'recovery' ? THREE.MathUtils.degToRad(75) : 0;
  const stageY = BAY_SUPPORT_Y[stage] + (BAY_STAGE_Y[stage] - BAY_SUPPORT_Y[stage]) * patientScale;
  // Ground hanging seated soles on the room floor. Legs-elevated keeps that
  // same pelvis plant so the chair still supports the sit; the morph raises
  // the calves onto the ottoman instead of dropping the whole body.
  const positionY = uprightSeated
    ? BAY_SUPPORT_Y.floor - SEATED_SOLE_LIFT * BAY_PATIENT_SCALE * patientScale + seatedSupportLift
    // A lateral patient rests on the shoulder/hip contour, roughly 0.33 m
    // from the rig origin—not on the 0.44 m posterior depth used for supine.
    // Keeping the supine height here is what made recovery patients hover.
    : posture === 'recovery'
      ? BAY_SUPPORT_Y[stage] + 0.332 * patientScale
    : stageY;
  return {
    position: [plant?.x ?? 0, positionY, plant?.z ?? 0.78] as [number, number, number],
    rotation: [baseRotation + pitchUp, rollSide, 0] as [number, number, number],
    scale: BAY_PATIENT_SCALE,
  };
}

export function treatmentBayClinicalToWorld(
  point: [number, number, number],
  stage: BayPatientStage = 'stretcher',
  posture: string | null = null,
  mobility: PatientMobility = 'recumbent',
  patientScale = 1,
  seatedSupportLift = 0,
  plant?: { x?: number; z?: number },
): [number, number, number] {
  const transform = getTreatmentBayTransform(stage, posture, mobility, patientScale, seatedSupportLift, plant);
  const projected = new THREE.Vector3(...point)
    .multiplyScalar(patientScale)
    .multiplyScalar(transform.scale)
    .applyEuler(new THREE.Euler(...transform.rotation))
    .add(new THREE.Vector3(...transform.position));
  return [projected.x, projected.y, projected.z];
}

interface BodyMeshProps {
  assessedRegions: Set<string>;
  onRegionClick: (stepId: string) => void;
  requiredRegions?: Set<string>;
  /** Phase 2 — guided exam mode. When true, only `nextGuidedStep` is clickable. */
  guidedMode?: boolean;
  /** Phase 2 — the region the student is expected to assess next. */
  nextGuidedStep?: SecondaryAssessmentStep | null;
  /** Phase 2 — called when the student clicks a locked region in guided mode. */
  onBlockedClick?: (attemptedStepId: string, expectedStepId: string) => void;
  /**
   * Fine-grained click hook: fires BEFORE region selection with the exact
   * mesh intersection point + the region it classified to. Return true to
   * consume the click (the parent fired a detail exam action at that spot —
   * "click the eye, get the pupil check"); false falls through to normal
   * region selection.
   */
  onBodyPoint?: (point: THREE.Vector3, regionId: string) => boolean;
  /** Case injuries to paint as skin decals (WoundLayer) — wound/burn/bruise/
   * bleeding kinds render at their anatomical site; shape findings don't. */
  bodyInjuries?: BodyInjury[];
  /** Optional patient gender — switches to a sex-matched mesh when the
   * project has a complete, browser-safe asset for that sex. */
  patientGender?: 'male' | 'female';
  /** Patient age in years, including decimals for infants. Selects a
   * developmentally proportioned mesh and its real-world standing height. */
  patientAge?: number;
  /** Pilot calibrated adult tripod support without changing other rigs. */
  braceHandsOnKnees?: boolean;
  /** Region the patient is guarding/clutching/self-splinting (e.g. whiplash
   *  "holding back of neck", cardiac "clutching chest", choking sign). Raises
   *  the hands from the lap to the guarded region instead of the default
   *  seated rest so the render matches the authored presentation. */
  handGuardRegion?: 'neck' | 'head' | 'chest' | 'abdomen' | 'choking' | null;
  /** Anatomical side with an authored acute motor deficit. The affected arm
   * hangs with reduced tone so FAST-positive cases are visible, not text-only. */
  neurologicalWeakSide?: NeurologicalWeakSide;
  /** Fade the surface patient when an internal anatomy reference is shown. */
  surfaceOpacity?: number;
  /** Names of finding morph targets that should be ACTIVE (revealed) — e.g.
   *  ['finding_jvd']. BodyMesh ramps these toward full influence and others
   *  back to 0. Driven by the parent from assessed-region + case findings. */
  activeFindingMorphs?: string[];
  /** Respiratory rate (breaths/min). When > 0, drives the breathe_chest_rise
   *  morph as a continuous sine so the patient visibly breathes at the case
   *  rate. 0 / undefined = no breathing animation (e.g. apnoea/arrest). */
  breathRateRpm?: number;
  /** Scenario-declared work of breathing, 0..1 (`PatientVisualState`). Drives
   *  visible accessory-muscle shoulder recruitment alongside the rate, so a
   *  severe asthmatic looks like hard work even before the rate looks bad. */
  breathingEffort?: number;
  /** Unilateral chest rise — drives the one-sided chest morph so the student
   *  can SEE a tension pneumothorax / flail segment, not just read about it. */
  chestRiseUnilateral?: boolean;
  /** Chest-rise depth multiplier (1 = normal). <1 = shallow (opioid/agonal),
   *  >1 = deep/laboured (Kussmaul). Combined with a fast-breathing taper. */
  breathDepthFactor?: number;
  /** Diaphoresis — drops skin roughness for a clammy/sweaty sheen. */
  skinDiaphoretic?: boolean;
  /** Emits a surface-projection function once the mesh is loaded + normalised.
   *  Given an intended (x, y) it returns [x, y, z] on the patient's actual
   *  camera-facing surface, so floating labels/finding markers anchor to the
   *  real body regardless of which GLB (male/female/future) is loaded. Emits
   *  null on unmount/model-swap. */
  onSurfaceSampler?: (sampler: SurfaceSampler | null) => void;
  onFaceAttachment?: (frame: THREE.Group | null) => void;
  /** Dressed view on/off — shows the scrubs layer derived from this mesh (see ClothingLayer). */
  dressed?: boolean;
  /** Focused region id — the garment piece covering it parts so the skin can be assessed. */
  dressedActiveRegion?: string | null;
  /** Case pupil diameters (mm) — rendered as the model's actual pupils. */
  pupilLeftMm?: number;
  pupilRightMm?: number;
  /**
   * Live skin perfusion target colour — cyanosis from SpO2, pallor from
   * shock index. The body mesh lerps every MeshStandardMaterial's `color`
   * toward this each frame (skipping meshes flagged `userData.skipRecolor`).
   * null/undefined = no tinting; the mesh keeps its authored skin colour.
   */
  skinTint?: THREE.Color | null;
  /**
   * Diaphoresis (sweat sheen) 0..1 — a MATERIAL channel. Ramps the skin
   * roughness down (0.5 → 0.34) and the envMapIntensity up (0.65 → 0.78) as
   * it rises, so the HDRI does the wet-glint work. Eased in the frame loop
   * (fast in ~10 s, dries out over ~60 s). Orthogonal to skinTint.
   */
  diaphoresis?: number;
  /**
   * Jaundice 0..1 — tints the eye-mesh scleras yellow (the skin cast is
   * carried by skinTint's colour chain; this handles the separate eye
   * materials). Constant while the case runs.
   */
  jaundice?: number;
  /**
   * Mottling 0..1 — late-shock livedo. A TEXTURE channel: at the severe-shock
   * crossing we composite one pre-rendered purple-grey blotch overlay onto the
   * diffuse map (legs/lower-body weighted) and swap material.map; we revert to
   * the clean texture on recovery. State-crossing events only — never a
   * per-frame upload.
   */
  mottling?: number;
  /** GCS <= 8 / AVPU 'U' / arrest — suppresses the procedural head sway and
   *  keeps the eyelids closed (see LifeSigns). */
  unconscious?: boolean;
  /** Condition-responsive idle motion cues (see lib/idleCues.ts) — wince,
   *  shiver, gasp, tremor/seizure, agitation, chest clutch. null = still. */
  idleCues?: IdleCues | null;
  /** Adaptive-quality low rung — IdleAnimations drops non-essential motion. */
  reduceIdleMotion?: boolean;
  /** Presentation-only transform for the full-body treatment bay overview. */
  presentation?: 'upright' | 'treatment-bay';
  /** Where the supine patient is staged in treatment-bay presentation. */
  bayStage?: BayPatientStage;
  /**
   * Subsurface-scattering skin. When true (and the male GLB is loaded) the
   * skin uses MeshPhysicalMaterial with thickness/attenuation/sheen + a tiled
   * pore detail-normal so ears/nostrils glow warm under the key light. Gated
   * OFF by the adaptive quality ladder (composer-shed tier) so iPad falls back
   * to plain PBR. Female/legacy meshes ignore it (no baked thickness map).
   */
  sss?: boolean;
  /**
   * Target posture morph — 'tripod' (asthma work-of-breathing), 'supine',
   * 'recovery', 'legs-elevated', or null (A-pose). Crossfaded via morph
   * influence; breathing + idle motion ride on top. resp-001 defaults to
   * 'tripod' and eases to 'recovery' as SpO2 improves.
   */
  posture?: PatientPosture;
  /** Authored scene mobility. Only standing/pacing presentations play the
   *  skeletal idle/walk clips; recumbent patients retain local clinical
   *  movement without sliding around the scene. */
  mobility?: PatientMobility;
  /**
   * Lip-sync drive: a 0..1 ref written by the voice analyser (per-frame RMS of
   * the patient's TTS). Applied to the viseme_open morph so the jaw moves in
   * time with speech. null = mouth stays shut.
   */
  mouthOpenRef?: React.MutableRefObject<number> | null;
  /** Local cyanosis overlay strength 0..1 — applied only to lip/nailbed
   *  vertices so those sites read as the primary cyanosis sign while the
   *  rest of the skin clears as SpO2 recovers. */
  cyanosisLocalStrength?: number;
  /** Horizontal plant from a scene rest anchor. Defaults keep the authored
   *  chair sit at x=0, z=0.78. */
  plantOffset?: { x?: number; z?: number };
  /** Seat-height correction. When omitted, the resp-001 tripod lift is used. */
  seatedSupportLift?: number;
}

/**
 * Resolve which GLB to load. The meshes in `public/models/`:
 *   • patient-female.glb — MPFB2/MakeHuman-generated female (CC0), A-pose,
 *     female shape baked into the basis, real eye meshes + AO-baked skin
 *     (scripts/blender-mpfb-female-bake.py + blender-stage2-eyes-ao.py), then
 *     fitted to the 52-bone runtime rig by rig-patient.py. Replaced the old
 *     Ready Player Me mesh (CC BY-NC — kept
 *     untracked as patient-female-rpm.bak.glb).
 *   • patient-male.glb   — MPFB2/MakeHuman-generated male (CC0), A-pose,
 *     male shape baked into the basis (scripts/blender-mpfb-male-bake.py +
 *     blender-stage2-eyes-ao.py), real eye meshes + AO-baked skin, then fitted
 *     to the same 52-bone runtime rig by rig-patient.py.
 *   • patient.glb        — legacy androgynous MakeHuman basis (CC0); the male
 *     macro morphs it carries never rendered because the app zeroes
 *     non-finding morphs. Kept as the neutral fallback.
 *
 * Why dropping the new meshes in works without retuning the Y-range
 * hit-test table: the primary hit-test path in `getRegionAtPoint`
 * uses weighted nearest-bone against the `mixamorig:*` skeleton, and
 * both fitted rigs use those joint names, so they slot straight into the
 * existing `BONE_REGION_MAP`. The Y-range table is only consulted when the
 * rig isn't traversable, and even then the new meshes are within ±5%
 * of the legacy 1.81m height (1.77m female, 1.92m male) so the
 * Y-band assignments still land in the right region for midline
 * clicks. Pose-induced arm position is irrelevant because the bones
 * carry their region label regardless of where the limb hangs.
 *
 * Tier-1 multi-layer anatomy (Z-Anatomy skin/muscle/skeleton toggles)
 * is a separate component — see `public/models/REALISTIC_ANATOMY.md`.
 */
function resolveModelPath(gender?: 'male' | 'female', age?: number): string {
  // Capture/testing hook: `?model=male|female` forces a specific mesh so
  // before/after screenshots (scripts/capture-model.mjs) compare the same GLB
  // regardless of the randomly generated case's gender.
  if (typeof window !== 'undefined') {
    const forced = new URLSearchParams(window.location.search).get('model');
    if (forced === 'male') return '/models/patient-male.glb';
    if (forced === 'female') return '/models/patient-female.glb';
  }
  return patientModelPath(gender, age);
}

/**
 * Map Y-coordinate on the model to a body region.
 * Michelle model stands ~1.7 units tall, centered at origin, feet at Y≈0.
 */
interface RegionRange {
  id: SecondaryAssessmentStep;
  label: string;
  description: string;
  yMin: number;
  yMax: number;
  /** If set, only match when |x| or |z| meets this condition */
  condition?: 'front' | 'back' | 'lateral';
}

// Beta_Surface GLB model — measured bounds: Y -0.003 to 1.806 (height 1.81)
// Using 7.5-head proportional system: head unit = 1.81 / 7.5 = 0.241
//
// Anatomical landmarks (Y coordinates):
//   Top of skull:    1.806
//   Crown/forehead:  ~1.71  (where hair starts)
//   Eyes/nose:       ~1.65  (mid-face)
//   Chin:            ~1.565 (bottom of mandible)
//   Neck (C3-C7):    ~1.44 to 1.565
//   Shoulders:       ~1.40
//   Nipple line:     ~1.20
//   Navel:           ~0.98
//   Groin:           ~0.83
//   Knees:           ~0.48
//   Feet:            ~0.00
interface ExtendedRegionRange extends RegionRange {
  /** X offset for limb highlights (arms/legs are not centered) */
  xOffset?: number;
  /** Custom radius for the highlight overlay */
  highlightRadius?: number;
}

// Region Y-bounds aligned to real human anatomy on a 1.81m model
// (percentages from Gray's Anatomy / Drake/Vogl/Mitchell):
//   Head crown:      Y 1.81 (100%)
//   Eyes:            Y ~1.71 (95%)
//   Chin / mandible: Y ~1.56 (86%)
//   Suprasternal notch: Y ~1.46 (81%) — top of chest
//   Nipple line:     Y ~1.30 (72%)
//   Xiphoid / costal margin: Y ~1.16 (64%) — chest / abdomen boundary
//   Umbilicus:       Y ~1.09 (60%) — middle of abdomen
//   ASIS / pelvic crest: Y ~1.00 (55%)
//   Pubic symphysis: Y ~0.91 (50%) — abdomen / pelvis boundary
//   Groin crease:    Y ~0.87 (48%)
//   Greater trochanter: Y ~0.83 (46%) — pelvis / leg boundary
const REGION_RANGES: ExtendedRegionRange[] = [
  { id: 'head', label: 'Head', description: 'Inspect and palpate scalp, skull, ears', yMin: 1.71, yMax: 1.81, highlightRadius: 0.18 },
  { id: 'face', label: 'Face', description: 'Eyes, nose, mouth, jaw, facial symmetry', yMin: 1.56, yMax: 1.71, highlightRadius: 0.15 },
  { id: 'neck-cspine', label: 'Neck & C-Spine', description: 'Trachea, JVD, C-spine, subcutaneous emphysema', yMin: 1.46, yMax: 1.56 },
  // Chest: suprasternal notch down to xiphoid / costal margin
  { id: 'chest', label: 'Chest', description: 'Inspect, palpate, percuss, auscultate', yMin: 1.16, yMax: 1.46 },
  // Abdomen: xiphoid down to pubic symphysis (wraps umbilicus at 1.09)
  { id: 'abdomen', label: 'Abdomen', description: 'Inspect, auscultate, percuss, palpate', yMin: 0.91, yMax: 1.16 },
  // Pelvis: pubic symphysis down to greater trochanter — the narrow band
  // where the pelvic ring + perineum live. Previous 0.83-0.98 was too wide
  // and hijacked mid-abdominal clicks.
  { id: 'pelvis', label: 'Pelvis', description: 'Stability test, perineal inspection', yMin: 0.83, yMax: 0.91 },
  // Arms — positioned laterally (x offset from center)
  { id: 'right-arm', label: 'Right Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: -0.45, highlightRadius: 0.14 },
  { id: 'left-arm', label: 'Left Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: 0.45, highlightRadius: 0.14 },
  // Legs — positioned laterally
  { id: 'right-leg', label: 'Right Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: -0.10, highlightRadius: 0.08 },
  { id: 'left-leg', label: 'Left Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: 0.10, highlightRadius: 0.08 },
  { id: 'posterior-logroll', label: 'Posterior / Log Roll', description: 'Log roll with C-spine control. Palpate entire spine.', yMin: 0.83, yMax: 1.56, condition: 'back' },
];

// Amber color for required-but-unassessed regions
const REQUIRED_UNASSESSED_COLOR = '#f59e0b';

// Stage-2 real-eye node names (authored by scripts/blender-stage2-eyes-ao.py).
// eyeR = the PATIENT'S right eye (app x < 0, screen-left facing the camera);
// each eye parents its iris + pupil discs so saccade rotations carry them.
const EYE_NODE_NAMES = ['eyeL', 'eyeR', 'irisL', 'irisR', 'pupilL', 'pupilR'] as const;

// Posture mixer: the `posture` prop maps to a Blender-authored morph target.
// POSTURE_MORPHS is the exclusion/crossfade set (all zeroed except the active
// one). A mesh without these morphs simply no-ops — the lookups miss.
// Morph names in patient-male.glb use the `pose_` prefix (authored by
// scripts/anatomy-models/add-viseme-morph.py: pose_tripod / pose_supine /
// pose_recovery).
const POSTURE_MORPH_BY_NAME: Record<'seated' | 'legs-elevated' | 'tripod' | 'supine' | 'recovery', string> = {
  seated: 'pose_seated',
  'legs-elevated': 'pose_legs_elevated',
  tripod: 'pose_tripod',
  supine: 'pose_supine',
  recovery: 'pose_recovery',
};
const POSTURE_MORPHS = Object.values(POSTURE_MORPH_BY_NAME);

// Additional fitted-rig articulation for a recognisable recovery position.
// The authored recovery morph only softens the lateral torso contour; without
// joint work the root roll stacks two straight legs and leaves both arms beside
// the hips. These local rotations were calibrated against the live skinned
// mesh: lower arm beneath the head, upper hand toward the cheek, upper knee
// flexed to prevent the patient rolling prone. Values are additive to the
// stable recumbent arm/forearm rest pose applied in the frame loop.
const RECOVERY_BONE_ADJUSTMENTS = {
  leftArm: [-1.08, 0.74, 1.42] as const,
  leftForeArm: [-1.89, 0, 0.67] as const,
  rightArm: [1.74, 1.35, -0.57] as const,
  rightForeArm: [-1.29, 0, 1.09] as const,
  rightUpLeg: [0.87, 0, 0] as const,
  rightLeg: [-1.4, 0, 0] as const,
};

// Acute unilateral weakness: shoulder depression/internal rotation with a
// lax, partly extended elbow. Applied after the stable seated rest pose and
// mirrored anatomically. The asymmetry is readable at overview distance while
// staying inside normal passive joint ranges.
const NEUROLOGICAL_WEAK_ARM_ADJUSTMENTS = {
  left: {
    arm: [-0.30, 0, -0.30] as const,
    foreArm: [0, 0, -0.10] as const,
  },
  right: {
    arm: [0.30, 0, -0.04] as const,
    foreArm: [-0.32, 0, -0.05] as const,
  },
};

// Natural one-hand posterior-neck/head guard. The old mirrored two-hand pose
// drove the elbows behind the torso on the current fitted rig. These values
// keep the unaffected hand at rest while the right hand reaches the lateral
// neck/temple and remains visible from the assessment camera.
const NECK_GUARD_ADJUSTMENTS = {
  leftArm: [0, 0, 0] as const,
  leftForeArm: [0, 0, 0] as const,
  rightArm: [0, 0, 0.2] as const,
  rightForeArm: [-0.5, -0.5, -2] as const,
};

/**
 * Hand-guard bone adjustments per guarded region, applied additively over the
 * stable seated/standing rest pose. One-hand guards are used for chest,
 * abdominal, head and posterior-neck pain; the universal choking sign remains
 * deliberately bilateral. Values were calibrated against the live fitted rig
 * and then image-reviewed so wrists land on the visible body surface rather
 * than merely on an internal target bone or behind the torso.
 */
const HAND_GUARD_ADJUSTMENTS: Record<
  'neck' | 'head' | 'chest' | 'abdomen' | 'choking',
  { leftArm: readonly [number, number, number]; leftForeArm: readonly [number, number, number]; rightArm: readonly [number, number, number]; rightForeArm: readonly [number, number, number] }
> = {
  neck: NECK_GUARD_ADJUSTMENTS,
  // One hand at the temple reads as holding the head without a surrender pose.
  head: NECK_GUARD_ADJUSTMENTS,
  // One hand crosses naturally to the lower sternum; the other remains relaxed.
  chest: {
    leftArm: [0, 0, 0] as const,
    leftForeArm: [0, 0, 0] as const,
    rightArm: [-0.5, 0, 0.2] as const,
    rightForeArm: [-0.5, -1.5, -2] as const,
  },
  // One protective hand settles over the lower abdomen.
  abdomen: {
    leftArm: [0, 0, 0] as const,
    leftForeArm: [0, 0, 0] as const,
    rightArm: [0, 0, 0.4] as const,
    rightForeArm: [-0.5, -1.5, -1] as const,
  },
  // Universal choking sign — both hands meet visibly at the anterior throat.
  choking: {
    leftArm: [0, 0, -0.2] as const,
    leftForeArm: [-0.5, 1, 2] as const,
    rightArm: [0, 0, 0.2] as const,
    rightForeArm: [-0.5, -1, -2] as const,
  },
};

/**
 * Recumbent self-splint / hand guard: the patient is lying down and draws the
 * hands ONTO the guarded anatomy rather than raising them from a lap. A supine
 * STEMI patient clutches the sternum (chest), an ectopic/placenta-previa
 * patient curls the hands onto the lower abdomen (abdomen). Gated on supine
 * posture in the frame loop; additive over the recumbent rest pose. Values are
 * calibrated against live skinned-mesh bone positions via
 * scripts/guard-recumbent-cal.mjs (drives window.__setHandGuard across an
 * arm/forearm Euler grid, reads LeftHand/RightHand world positions, and picks
 * the combo whose hand midpoint lands on the target bone: chest→Spine2,
 * abdomen→Spine1). Recovery (left-lateral) posture is deliberately excluded —
 * it already positions the arms via RECOVERY_BONE_ADJUSTMENTS and stacking the
 * supine guard on top would double-apply.
 */
const RECUMBENT_GUARD_ADJUSTMENTS: Record<
  'chest' | 'abdomen',
  { leftArm: readonly [number, number, number]; leftForeArm: readonly [number, number, number]; rightArm: readonly [number, number, number]; rightForeArm: readonly [number, number, number] }
> = {
  chest: {
    leftArm: [-0.4, -1.2, -0.6] as const,
    leftForeArm: [-0.6, 1.6, -0.8] as const,
    rightArm: [-0.4, 1.2, 0.6] as const,
    rightForeArm: [-0.6, -1.6, 0.8] as const,
  },
  abdomen: {
    leftArm: [-0.4, -1.2, -0.6] as const,
    leftForeArm: [-1.2, -1.6, 0] as const,
    rightArm: [-0.4, 1.2, 0.6] as const,
    rightForeArm: [-1.2, 1.6, 0] as const,
  },
};

// DEV-only calibration hook: lets scripts/guard-cal.mjs mutate the guard
// rotations at runtime (no rebuild) so the arm chain can be swept against live
// bone positions. Mirrors the existing `window.__r3f` DEV hook.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__setHandGuard = (
    mode: 'upright' | 'recumbent',
    region: string,
    values: Record<string, readonly [number, number, number]>,
  ) => {
    const table = mode === 'recumbent' ? RECUMBENT_GUARD_ADJUSTMENTS : HAND_GUARD_ADJUSTMENTS;
    (table as Record<string, unknown>)[region] = values;
  };
}

function applyLocalBoneAdjustment(
  bone: THREE.Object3D | null | undefined,
  [x, y, z]: readonly [number, number, number],
) {
  if (!bone) return;
  if (x) bone.rotateX(x);
  if (y) bone.rotateY(y);
  if (z) bone.rotateZ(z);
}

/** Case pupil mm -> pupil disc scale. Discs are authored at 5mm diameter. */
function pupilScale(mm: number): number {
  return pupilDiscScale(mm);
}

// ---------------------------------------------------------------------------
// SSS skin maps (male mesh only) — lazy-loaded, cached module-wide.
// ---------------------------------------------------------------------------
// Baked in Phase A (scripts/anatomy-models/bake-skin-maps.py):
//   thickness — greyscale, drives translucency at ears/nostrils/fingers.
//   detail    — tiled micro-normal, adds pore-scale surface detail.
// The 2.4MB AO map is baked into the diffuse already, so we don't sample it
// here. Loaded on first male render; female/legacy cases never fetch these.
interface SssMaps {
  thickness: THREE.Texture;
  detail: THREE.Texture;
  detailTiles: number;
  detailScale: number;
}
const sssMapsPromises = new Map<string, Promise<SssMaps | null>>();
function loadSssMaps(profile?: SkinDetailProfile): Promise<SssMaps | null> {
  const detailUrl = profile?.url ?? '/models/patient-male-skin-detail-normal.png';
  const cached = sssMapsPromises.get(detailUrl);
  if (cached) return cached;
  const pending = (async () => {
    const loader = new THREE.TextureLoader();
    const load = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject));
    try {
      const [thickness, detail] = await Promise.all([
        load('/models/patient-male-skin-thickness.png'),
        load(detailUrl),
      ]);
      thickness.flipY = false; // GLB UV convention
      detail.flipY = false;
      detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
      return { thickness, detail, detailTiles: profile?.tiles ?? DETAIL_TILES, detailScale: profile?.scale ?? 0.6 };
    } catch {
      return null; // maps missing → material stays plain PBR
    }
  })();
  sssMapsPromises.set(detailUrl, pending);
  return pending;
}

// Pore detail-normal blend: three has no second-normal slot, so inject a
// tiled detail normal into the standard normal_fragment_maps chunk. The base
// normalMap (if any) still applies; this adds high-frequency pore detail on
// top. Tiling is fixed (DETAIL_TILES across the UV) — the map is a seamless
// micro-normal, so a repeat count is all it needs.
// The male skin GLB is diffuse-only (no authored normalMap/tangents), so the
// stock tangent-space chunk (`tbn`, `vNormalMapUv`) isn't compiled in. We
// derive a cotangent frame from screen-space derivatives (Mikkelsen's
// derivative-maps method) — self-contained, needs only vMapUv (present because
// the material has a diffuse map) and vViewPosition. Injected after
// normal_fragment_begin so `normal` and `vViewPosition` are in scope.
const DETAIL_TILES = 12;
function injectDetailNormal(mat: THREE.MeshPhysicalMaterial, maps: SssMaps): void {
  mat.userData.detailNormalInjected = true;
  mat.userData.detailNormalProfile = `${maps.detail.uuid}:${maps.detailTiles}:${maps.detailScale}`;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.detailNormalMap = { value: maps.detail };
    shader.uniforms.detailNormalTiles = { value: maps.detailTiles };
    shader.uniforms.detailNormalScale = { value: maps.detailScale };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <normal_pars_fragment>',
        `#include <normal_pars_fragment>
         uniform sampler2D detailNormalMap;
         uniform float detailNormalTiles;
         uniform float detailNormalScale;`,
      )
      .replace(
        '#include <normal_fragment_begin>',
        `#include <normal_fragment_begin>
         #ifdef USE_MAP
         {
           vec2 detailUv = vMapUv * detailNormalTiles;
           vec3 dN = texture2D(detailNormalMap, detailUv).xyz * 2.0 - 1.0;
           // derivative cotangent frame (no vertex tangents required)
           vec3 q0 = dFdx(-vViewPosition);
           vec3 q1 = dFdy(-vViewPosition);
           vec2 st0 = dFdx(detailUv);
           vec2 st1 = dFdy(detailUv);
           vec3 S = normalize(q0 * st1.t - q1 * st0.t);
           vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
           normal = normalize(normal + (dN.x * S + dN.y * T) * detailNormalScale);
         }
         #endif`,
      );
  };
  mat.needsUpdate = true;
}

// Apply / toggle the subsurface channels. `on` gates the expensive path so the
// adaptive ladder can shed SSS to plain PBR under 30fps.
function applySssToMaterial(mat: THREE.MeshPhysicalMaterial, maps: SssMaps, on: boolean): void {
  if (on) {
    mat.thicknessMap = maps.thickness;
    mat.thickness = 0.5;
    mat.attenuationColor = new THREE.Color(0x883333); // warm subsurface red
    mat.attenuationDistance = 0.5;
    mat.sheen = 0.4;                                   // peach-fuzz rim
    mat.sheenRoughness = 0.8;
    mat.sheenColor = new THREE.Color(0xffd9c0);
    const profileKey = `${maps.detail.uuid}:${maps.detailTiles}:${maps.detailScale}`;
    if (!mat.userData.detailNormalInjected || mat.userData.detailNormalProfile !== profileKey) {
      injectDetailNormal(mat, maps);
    }
  } else {
    mat.thickness = 0;
    mat.thicknessMap = null;
    mat.sheen = 0;
    if (mat.userData.detailNormalInjected) {
      mat.onBeforeCompile = () => {};
      mat.userData.detailNormalInjected = false;
    }
  }
  mat.needsUpdate = true;
}

// Track which specific limb was clicked for exam panel filtering
export type LimbSide = 'right-arm' | 'left-arm' | 'right-leg' | 'left-leg' | null;
let lastClickedLimb: LimbSide = null;
export function getLastClickedLimb(): LimbSide { return lastClickedLimb; }

// ---------------------------------------------------------------------------
// Bone-based anatomical hit-testing
// ---------------------------------------------------------------------------
// The active patient is an MPFB Mixamo rig with 52 deform bones (Head, Neck,
// Spine/Spine1/Spine2, Hips, L/R Shoulder/Arm/ForeArm/Hand/UpLeg/Leg/Foot).
// We use those bones as anatomical anchors — every hit-point is assigned to
// the region whose anchor(s) it sits closest to.
//
// Why bones, not Y-ranges? Three reasons.
//   1. Anatomically correct. Character's left arm stays the character's left
//      regardless of pose, camera angle, or scene rotation. (Mixamo convention:
//      "Left" / "Right" are from the character's frame — which is exactly
//      clinical documentation convention: "patient's left", "patient's right".)
//   2. Pose-agnostic. If the character is repositioned (arms raised, bent,
//      seated) the bone positions still partition the body correctly.
//   3. Boundary accuracy. Costal margin, umbilicus, ASIS — these sit at
//      specific bone positions (Spine1 tail, Spine base, Hips), not at
//      fixed world-Y values. Using bones keeps our "chest vs abdomen vs
//      pelvis" boundaries on real anatomical landmarks.

type RegionId = SecondaryAssessmentStep;

interface Anchor {
  region: RegionId;
  /** Weight multiplier — favour more specific/local bones (e.g. Hand > ForeArm). */
  weight?: number;
  /**
   * World position of the bone, recomputed when the rig mounts. Populated
   * by `updateSkeleton()` below.
   */
  position: THREE.Vector3;
}

// Bone name → anatomical region + relative pull weight. Distal bones (hands,
// feet) get a higher weight so a click on the hand wins over the shoulder
// even when geometrically similar.
const BONE_REGION_MAP: Array<{ bone: string; region: RegionId; weight?: number }> = [
  // Head + face + neck
  { bone: 'mixamorig:HeadTop_End', region: 'head', weight: 1.2 },
  { bone: 'mixamorig:Head', region: 'head', weight: 1.0 },
  // Eyes live inside the Head bone — using them biases toward "face" for
  // anything below the crown.
  { bone: 'mixamorig:LeftEye', region: 'face', weight: 1.3 },
  { bone: 'mixamorig:RightEye', region: 'face', weight: 1.3 },
  { bone: 'mixamorig:Neck', region: 'neck-cspine', weight: 1.2 },

  // Torso: Spine2 = upper chest (sternum/manubrium level), Spine1 = mid
  // chest (xiphoid-ish), Spine = upper abdomen (epigastrium), Hips = pelvis.
  // Spine gets a slight weight bump so the full abdominal expanse between
  // xiphoid and pubic bone reliably resolves to "abdomen" rather than
  // drifting down to the Hips bone at the pelvic-crest level.
  { bone: 'mixamorig:Spine2', region: 'chest', weight: 1.0 },
  { bone: 'mixamorig:Spine1', region: 'chest', weight: 1.1 },
  { bone: 'mixamorig:Spine', region: 'abdomen', weight: 1.3 },
  { bone: 'mixamorig:Hips', region: 'pelvis', weight: 0.9 },

  // Arms — shoulder is on the body edge, so weight it lower than Arm/ForeArm/Hand
  // so a click on the upper lateral chest doesn't drift to the arm.
  { bone: 'mixamorig:LeftShoulder', region: 'left-arm', weight: 0.85 },
  { bone: 'mixamorig:LeftArm', region: 'left-arm', weight: 1.0 },
  { bone: 'mixamorig:LeftForeArm', region: 'left-arm', weight: 1.2 },
  { bone: 'mixamorig:LeftHand', region: 'left-arm', weight: 1.4 },
  { bone: 'mixamorig:RightShoulder', region: 'right-arm', weight: 0.85 },
  { bone: 'mixamorig:RightArm', region: 'right-arm', weight: 1.0 },
  { bone: 'mixamorig:RightForeArm', region: 'right-arm', weight: 1.2 },
  { bone: 'mixamorig:RightHand', region: 'right-arm', weight: 1.4 },

  // Legs — UpLeg is close to the hip crease, so slightly lower weight than
  // thigh/shin/foot (otherwise groin clicks drift to the leg).
  { bone: 'mixamorig:LeftUpLeg', region: 'left-leg', weight: 0.9 },
  { bone: 'mixamorig:LeftLeg', region: 'left-leg', weight: 1.1 },
  { bone: 'mixamorig:LeftFoot', region: 'left-leg', weight: 1.3 },
  { bone: 'mixamorig:RightUpLeg', region: 'right-leg', weight: 0.9 },
  { bone: 'mixamorig:RightLeg', region: 'right-leg', weight: 1.1 },
  { bone: 'mixamorig:RightFoot', region: 'right-leg', weight: 1.3 },
];

// Populated once the rig mounts. Kept module-level so both hover and click
// paths share the same snapshot.
let anchors: Anchor[] = [];

/**
 * Walk a scene tree to collect world positions of every anchor bone.
 * Call after the mesh is added to the scene so world matrices are valid.
 */
function updateSkeleton(root: THREE.Object3D | null): void {
  if (!root) return;
  root.updateMatrixWorld(true);
  const byName = new Map<string, THREE.Object3D>();
  root.traverse((obj) => { if (obj.name) byName.set(obj.name, obj); });

  anchors = BONE_REGION_MAP
    .map(({ bone, region, weight }) => {
      // GLTFLoader sanitises ':' out of node names for AnimationMixer path
      // compatibility (`mixamorig:Head` becomes `mixamorigHead`). Accept both
      // forms so the rig remains useful for anatomical hit-testing too.
      const node = byName.get(bone) ?? byName.get(bone.replace(/:/g, ''));
      if (!node) return null;
      const pos = new THREE.Vector3();
      node.getWorldPosition(pos);
      return { region, weight, position: pos } as Anchor;
    })
    .filter((a): a is Anchor => a !== null);
}

/**
 * Collapse only the hand subtree for a hand-level traumatic amputation and
 * seal the visible forearm with a small, bone-parented stump cap. This keeps
 * the original skinned arm and all pose/mobility animation intact while
 * removing the impossible intact hand. It intentionally does not use the
 * shared wound atlas: that atlas packs unrelated torso and limb UV islands.
 */
function applyArmAmputationPresentation(
  bodyMesh: THREE.Mesh,
  injuries: readonly BodyInjury[] | undefined,
): void {
  if (!(bodyMesh as THREE.SkinnedMesh).isSkinnedMesh) return;
  const sides = armAmputationSides(injuries);
  if (!sides.length) return;

  const body = bodyMesh as THREE.SkinnedMesh;
  for (const side of sides) {
    const title = side === 'right' ? 'Right' : 'Left';
    const hand = body.skeleton.bones.find(bone => bone.name === `mixamorig${title}Hand`);
    const forearm = body.skeleton.bones.find(bone => bone.name === `mixamorig${title}ForeArm`);
    if (!hand || !forearm) continue;

    hand.scale.setScalar(0.001);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.051, 0.046, 0.014, 20),
      new THREE.MeshStandardMaterial({ color: '#431719', roughness: 0.56, metalness: 0 }),
    );
    cap.name = `traumatic-${side}-hand-stump`;
    cap.position.copy(hand.position);
    cap.castShadow = true;
    cap.receiveShadow = true;
    cap.userData.skipRecolor = true;
    cap.raycast = () => {};
    forearm.add(cap);

    // A small, non-gory cross-section keeps the cap legible as a traumatic
    // stump at the overview without turning the patient into a flat red disc.
    const woundFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.030, 20),
      new THREE.MeshStandardMaterial({ color: '#762923', roughness: 0.48, side: THREE.DoubleSide }),
    );
    woundFace.name = `traumatic-${side}-hand-wound-face`;
    woundFace.position.y = 0.0075;
    woundFace.rotation.x = -Math.PI / 2;
    woundFace.userData.skipRecolor = true;
    cap.add(woundFace);

    const boneCue = new THREE.Mesh(
      new THREE.CircleGeometry(0.011, 16),
      new THREE.MeshStandardMaterial({ color: '#c7a17d', roughness: 0.72, side: THREE.DoubleSide }),
    );
    boneCue.name = `traumatic-${side}-hand-bone-cue`;
    boneCue.position.y = 0.001;
    boneCue.userData.skipRecolor = true;
    woundFace.add(boneCue);
  }
}

/**
 * Find the anatomical region for a hit point.
 *
 * Primary path: weighted nearest-anchor across the rig's skeletal bones.
 * Fallback path: the original Y-coordinate range + lateral-X heuristic,
 * used whenever the bone snapshot is empty or the nearest bone is so far
 * from the hit point that the result would be nonsense.
 *
 * The fallback matters in practice. `scene.clone(true)` on a Mixamo rig
 * does not always produce a tree where the bones are traversable as
 * independent named Object3D nodes (skeleton references can get flattened
 * depending on the GLB exporter). The fallback keeps the feature working
 * in that case; the primary path still wins when the bones are available.
 */
function getRegionAtPoint(
  point: THREE.Vector3,
  useBoneAnchors = true,
  patientScale = 1,
): RegionRange | null {
  // Strategy:
  //   Limbs (arms, legs) — use the bone rig when available (pose-agnostic,
  //     correct for patient's-left vs patient's-right) with an X-threshold
  //     fallback when the rig isn't traversable.
  //   Anterior midline (head, face, neck, chest, abdomen, pelvis) — use the
  //     anatomically-tuned Y-range table. Bones like Hips sit at the pelvic
  //     centre, which is physically inside the abdomen band anatomically;
  //     trusting nearest-bone there produced "Pelvis" labels for mid-abdomen
  //     hits. The Y-range table now uses real landmarks (xiphoid, pubic
  //     symphysis, greater trochanter) so it's authoritative for midline.
  //   Posterior — z < -0.05 on torso returns the log-roll region.

  // --- 1. Posterior first -------------------------------------------------
  const safeScale = Number.isFinite(patientScale) && patientScale > 0 ? patientScale : 1;
  const referencePoint = point.clone().multiplyScalar(1 / safeScale);

  if (referencePoint.z < -0.05) {
    const posterior = REGION_RANGES.find(r => r.condition === 'back' && referencePoint.y >= r.yMin && referencePoint.y < r.yMax);
    if (posterior) { lastClickedLimb = null; return posterior; }
  }

  // --- 2. Limb check via bones when available -----------------------------
  // Compare the nearest LIMB bone to the nearest TORSO/HEAD bone. If a limb
  // bone wins decisively, classify as that limb. Otherwise fall through to
  // the Y-range midline decision.
  if (useBoneAnchors && anchors.length > 0) {
    let bestLimb: { anchor: Anchor; score: number } | null = null;
    let bestTorso: { anchor: Anchor; score: number } | null = null;
    for (const a of anchors) {
      const d = point.distanceTo(a.position);
      const score = d / (a.weight ?? 1);
      const isLimb = a.region === 'left-arm' || a.region === 'right-arm' || a.region === 'left-leg' || a.region === 'right-leg';
      if (isLimb) {
        if (!bestLimb || score < bestLimb.score) bestLimb = { anchor: a, score };
      } else {
        if (!bestTorso || score < bestTorso.score) bestTorso = { anchor: a, score };
      }
    }
    // Limb wins only if clearly closer — prevents a shoulder click from
    // hijacking the upper chest (where Arm and Spine2 can be similar).
    if (bestLimb && (!bestTorso || bestLimb.score < bestTorso.score * 0.85)) {
      const limbId = bestLimb.anchor.region;
      lastClickedLimb = limbId as LimbSide;
      return REGION_RANGES.find(r => r.id === limbId)
        || { id: limbId, label: limbId, description: '', yMin: 0, yMax: 0 };
    }
  }

  // --- 3. X-threshold limb fallback (when rig isn't available) -----------
  const absX = Math.abs(referencePoint.x);
  const armXThreshold = referencePoint.y >= 1.16 ? 0.15 : 0.20;
  if (absX > armXThreshold && referencePoint.y >= 0.40 && referencePoint.y < 1.46) {
    // Mixamo convention: character faces +Z, +X = patient's left side.
    const limbId = referencePoint.x > 0 ? 'left-arm' : 'right-arm';
    lastClickedLimb = limbId;
    const r = REGION_RANGES.find(rr => rr.id === limbId);
    return r || { id: limbId, label: limbId, description: '', yMin: 0.40, yMax: 1.46 };
  }
  if (referencePoint.y < 0.83) {
    if (absX > 0.20 && referencePoint.y >= 0.40) {
      const limbId = referencePoint.x > 0 ? 'left-arm' : 'right-arm';
      lastClickedLimb = limbId;
      const r = REGION_RANGES.find(rr => rr.id === limbId);
      return r || { id: limbId, label: limbId, description: '', yMin: 0.40, yMax: 1.46 };
    }
    const limbId = referencePoint.x > 0 ? 'left-leg' : 'right-leg';
    lastClickedLimb = limbId;
    const r = REGION_RANGES.find(rr => rr.id === limbId);
    return r || { id: limbId, label: limbId, description: '', yMin: 0.0, yMax: 0.83 };
  }

  // --- 4. Anterior midline via anatomically-tuned Y-range ----------------
  lastClickedLimb = null;
  return REGION_RANGES.find(r => !r.condition && referencePoint.y >= r.yMin && referencePoint.y < r.yMax) || null;
}

// ---------------------------------------------------------------------------
// Runtime label anchoring — the ONLY reliable way to label across models.
// ---------------------------------------------------------------------------
// Hardcoded label coordinates can never be correct across different GLBs: the
// legacy (`patient.glb`) and female (`patient-female.glb`) meshes have different
// geometry and proportions. We sample the ACTUAL loaded + normalised mesh and
// project each label onto the
// patient's real camera-facing surface (the camera sits at +Z, so the visible
// front surface for any (x,y) is the vertex with the largest Z there). This
// self-calibrates for any model — no per-model tuning, no guessing.
function buildSurfaceSampler(root: THREE.Object3D | null, presentationRoot?: THREE.Object3D | null): SurfaceSampler | null {
  if (!root) return null;
  root.updateMatrixWorld(true);
  presentationRoot?.updateMatrixWorld(true);
  const presentationInverse = presentationRoot ? presentationRoot.matrixWorld.clone().invert() : null;
  // The body is the mesh with the most vertices (skips eye/hair/lash meshes).
  let mesh: THREE.Mesh | null = null;
  let best = -1;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    const geom = m.geometry as THREE.BufferGeometry | undefined;
    if (m.isMesh && geom && geom.attributes && geom.attributes.position) {
      const c = geom.attributes.position.count;
      if (c > best) { best = c; mesh = m; }
    }
  });
  if (!mesh) return null;
  const pulseAnchor = createPatientPulseAnchors(mesh as THREE.SkinnedMesh);
  const posAttr = ((mesh as THREE.Mesh).geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
  const mw = (mesh as THREE.Mesh).matrixWorld;
  const N = posAttr.count;
  // Transform every vertex into world (the exam coordinate frame) once, and
  // measure the model's ACTUAL rendered bounds while we're at it.
  const wx = new Float32Array(N), wy = new Float32Array(N), wz = new Float32Array(N);
  const v = new THREE.Vector3();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < N; i++) {
    v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).applyMatrix4(mw);
    if (presentationInverse) v.applyMatrix4(presentationInverse);
    wx[i] = v.x; wy[i] = v.y; wz[i] = v.z;
    if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
    if (v.z > maxZ) maxZ = v.z;
  }

  // Markers are authored in the SAME frame the app renders the reference
  // patient in: feet at y=0, head y=1.8, centred on x. The reference patient
  // (patient.glb AND patient-female.glb both measure a half-width of 0.536 via
  // scripts/measure-anatomy.cjs) defines the authoring half-width, so this
  // remap is the IDENTITY for the shipped models and only rescales x for a
  // future GLB of a different build. (It used to be 0.5 — a guess — which
  // multiplied every x by 0.536/0.5 ≈ 1.072, pushing arm/leg dots ~7% laterally
  // off the limb.) The y-remap is already identity because every model is
  // height-normalised to 1.8.
  const AUTHOR_H = 1.8, AUTHOR_HALFW = 0.536;
  const H = (maxY - minY) || AUTHOR_H;
  const cx = (minX + maxX) / 2;
  const halfW = ((maxX - minX) / 2) || AUTHOR_HALFW;
  const s = H / AUTHOR_H; // overall scale factor (tolerances/offsets scale too)
  const PROUD = 0.03 * s; // lift the label just off the skin toward the camera

  const contact = createAssessmentContactSampler(mesh as THREE.Mesh, [wx, wy, wz]);
  const sampler: SurfaceSampler = (xInput: number, yInput: number, options?: SurfaceSamplerOptions): [number, number, number] => {
    const pulse = options?.anatomicalSite ? pulseAnchor(options.anatomicalSite) : null;
    if (pulse) return pulse;
    const useMeshSpace = options?.coordinateSpace === 'mesh';
    const x = useMeshSpace ? xInput : cx + xInput * (halfW / AUTHOR_HALFW);
    const y = useMeshSpace ? yInput : minY + (yInput / AUTHOR_H) * H;
    // Front surface at (x,y) = the largest Z among nearby verts. Try a tight
    // window first, widen if nothing is close (e.g. a lateral limb point).
    const scan = (xTol: number, yTol: number): number | null => {
      let bz = -Infinity, found = false;
      for (let i = 0; i < N; i++) {
        if (Math.abs(wx[i] - x) < xTol && Math.abs(wy[i] - y) < yTol) {
          if (wz[i] > bz) { bz = wz[i]; found = true; }
        }
      }
      return found ? bz : null;
    };
    const z = scan(0.07 * s, 0.05 * s) ?? scan(0.16 * s, 0.11 * s) ?? scan(0.30 * s, 0.18 * s);
    const projected = new THREE.Vector3(x, y, (z ?? maxZ) + PROUD);
    if (presentationRoot) {
      // The ambulatory root can move every frame. Refresh its world matrix at
      // sample time so pulse targets and assessment labels travel with the
      // patient instead of remaining behind at the start of the walk.
      presentationRoot.updateMatrixWorld(true);
      projected.applyMatrix4(presentationRoot.matrixWorld);
    }
    return [projected.x, projected.y, projected.z];
  };
  const contactDepths = new Map<string, number>();
  sampler.contact = (xInput, yInput) => {
    const x = cx + xInput * (halfW / AUTHOR_HALFW);
    const y = minY + (yInput / AUTHOR_H) * H;
    // Tight local anterior search, not the broad label window that can catch
    // an adjacent shoulder or breast. The triangle supplies exact contact.
    const key = `${xInput}:${yInput}`;
    let z = contactDepths.get(key);
    if (z === undefined) {
      z = -Infinity;
      for (let i = 0; i < N; i++) {
        if (Math.abs(wx[i] - x) < .018 * s && Math.abs(wy[i] - y) < .018 * s) z = Math.max(z, wz[i]);
      }
      contactDepths.set(key, z);
    }
    return Number.isFinite(z) ? contact(x, y, z) : null;
  };
  return sampler;
}

/**
 * How much excursion the affected hemithorax keeps when the rise is
 * unilateral. Not 0: in a tension pneumothorax the bad side still moves a
 * little, and zeroing it reads as a mannequin half rather than a clinical
 * asymmetry the student has to notice.
 */
const ASYMMETRIC_CHEST_RESIDUAL = 0.35;

export function BodyMesh({ assessedRegions, onRegionClick, requiredRegions, guidedMode = false, nextGuidedStep = null, onBlockedClick, onBodyPoint, bodyInjuries, patientGender, patientAge, braceHandsOnKnees = false, handGuardRegion = null, neurologicalWeakSide = null, surfaceOpacity = 1, activeFindingMorphs, breathRateRpm = 0, breathingEffort = 0, chestRiseUnilateral = false, breathDepthFactor = 1, onSurfaceSampler, onFaceAttachment, dressed = false, dressedActiveRegion = null, pupilLeftMm = 3.5, pupilRightMm = 3.5, skinTint = null, skinDiaphoretic = false, diaphoresis = 0, jaundice = 0, mottling = 0, unconscious = false, idleCues = null, reduceIdleMotion = false, presentation = 'upright', bayStage = 'stretcher', sss = false, posture = null, mobility = 'recumbent', mouthOpenRef = null, cyanosisLocalStrength = 0, plantOffset, seatedSupportLift }: BodyMeshProps) {
  // The path is recomputed per render so a `caseData.patientInfo.gender`
  // change (e.g. user picks a different case) swaps the mesh without
  // remounting the parent. useGLTF caches by URL.
  const modelPath = resolveModelPath(patientGender, patientAge);
  const patientHeight = patientExpectedHeightMetres(patientAge);
  const patientScale = patientHeight / 1.8;
  const { scene, animations } = useGLTF(modelPath);
  // Blender-authored garment GLBs (blended-garment mode). Loaded here so the
  // clone build has them synchronously; Suspense holds render until ready.
  // Array form of useGLTF returns results positionally.
  const pilotGarment = braceHandsOnKnees && modelPath.includes('patient-male');
  const loadedGarmentSpecs = useMemo(() => pilotGarment
    ? ALL_GARMENT_GLBS
    : ALL_GARMENT_GLBS.filter(spec => spec.url !== RESP001_GARMENT_GLBS[1].url), [pilotGarment]);
  const garmentGltfs = useGLTF([
    ...loadedGarmentSpecs.map((g) => g.url),
    ...(pilotGarment ? ['/models/resp001-eyelids.glb'] : []),
  ]);
  const pilotEyelidScene = pilotGarment ? garmentGltfs[loadedGarmentSpecs.length]?.scene : undefined;
  const garmentScenes = useMemo(() => {
    const map = new Map<string, THREE.Object3D>();
    loadedGarmentSpecs.forEach((g, i) => {
      const s = garmentGltfs[i]?.scene;
      if (s) map.set(g.url, s);
    });
    return map;
  }, [garmentGltfs, loadedGarmentSpecs]);
  const fittedGarmentSpecs = garmentGlbsForModel(modelPath);
  const garmentSpecs = pilotGarment ? RESP001_GARMENT_GLBS : fittedGarmentSpecs.length
    ? fittedGarmentSpecs
    : adolescentGarmentGlbsForModel(modelPath);
  const [hoveredRegion, setHoveredRegion] = useState<RegionRange | null>(null);
  const meshRef = useRef<THREE.Group>(null);
  // For pulsing animation on required regions
  const pulseRef = useRef(0);
  // Morph-target driving: the skinned mesh that carries the clinical morphs
  // (finding_jvd, finding_abdo_distension, breathe_chest_rise), plus the
  // smoothed per-morph influence we ramp toward each frame, and a breathing
  // phase accumulator.
  //
  // morphMeshRef is resolved lazily inside useFrame from the COMMITTED
  // clonedScene (morphRootRef tracks which clone it belongs to). It must NOT
  // be assigned during the clone-building useMemo: React StrictMode invokes
  // that memo twice and can mount the clone from one invocation while the ref
  // holds the mesh from the discarded one — which left the breathing/finding
  // morphs silently driving an unmounted mesh in dev.
  const morphMeshRef = useRef<THREE.Mesh | null>(null);
  const morphRootRef = useRef<THREE.Object3D | null>(null);
  const morphInfluenceRef = useRef<Record<string, number>>({});
  const breathPhaseRef = useRef(0);
  const idleLimbRef = useRef(createIdleLimbMotion());
  const idleLimbTimeRef = useRef(0);
  const idleLimbGateRef = useRef(0);
  const skeletalMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const locomotionTimeRef = useRef(0);
  // Reusable temp colour for the per-frame skin-tint lerp so we don't allocate
  // a THREE.Color every frame (GC pressure under 60fps useFrame).
  const tintTmpRef = useRef(new THREE.Color());
  const treatmentBayPresentation = presentation === 'treatment-bay';
  const resolvedSeatedLift = seatedSupportLift ?? (braceHandsOnKnees ? RESP001_SEATED_SUPPORT_LIFT : 0);
  const treatmentBayTransform = useMemo(
    () => getTreatmentBayTransform(bayStage, posture, mobility, patientScale, resolvedSeatedLift, plantOffset),
    [bayStage, mobility, posture, patientScale, resolvedSeatedLift, plantOffset],
  );
  // Diaphoresis (sweat sheen): the eased 0..1 scalar the frame loop drives
  // toward the `diaphoresis` prop (fast up ~10 s, slow dry-out ~60 s), plus a
  // lazily-resolved cache of the skin materials + their authored roughness /
  // envMapIntensity so we can lerp them wet↔dry without a per-frame traverse
  // or any allocation. Resolved from the COMMITTED clone (skinMatRootRef
  // tracks which clone the cache belongs to — same guard pattern as the morph
  // mesh, so a StrictMode double-mount can't cache the discarded clone).
  const diaphoresisEaseRef = useRef(0);
  const skinDiaphoreticAppliedRef = useRef<boolean | null>(null);
  const skinMatsRef = useRef<Array<{ mat: THREE.MeshStandardMaterial; roughness: number; envMapIntensity: number }>>([]);
  const skinMatRootRef = useRef<THREE.Object3D | null>(null);
  // Mottling: whether the mottled twin textures are currently swapped in, the
  // clone they belong to (a model switch resets the flag), and a lazily-cached
  // reference to the body mesh that carries the diffuse atlas. The swap is a
  // state-crossing event checked in the frame loop — it acts ONCE when the
  // mottling channel flips (never a per-frame upload), but re-checking each
  // frame makes it robust to the diffuse texture / painted atlas not being
  // ready at mount (the crossing self-heals as soon as the body resolves).
  const mottleRootRef = useRef<THREE.Object3D | null>(null);
  const mottleAppliedRef = useRef(false);
  const mottleBodyRef = useRef<THREE.Mesh | null>(null);
  // Local cyanosis twin refs — same lifecycle as mottling (clone reset).
  const cyanosisLocalRootRef = useRef<THREE.Object3D | null>(null);
  const cyanosisLocalAppliedRef = useRef(false);
  const cyanosisLocalLevelRef = useRef(0);
  const cyanosisLocalBodyRef = useRef<THREE.Mesh | null>(null);

  // Clone the rig with SkeletonUtils so skinned meshes keep their own bone
  // bindings. A regular deep clone can detach limbs on some exported GLBs.
  const { clonedScene, updateEyeMorphs } = useMemo(() => {
    const clone = cloneSkeleton(scene) as THREE.Group;
    let updateEyeMorphs = () => {};
    const isMaleMesh = modelPath.includes('-male.glb');
    const useSolidMaleBodyMaterial = modelPath === '/models/patient-male.glb';
    // Both active exam meshes are normalised to face the default camera (+Z).
    // Rotating the legacy patient here shows the posterior surface first while
    // landmarks still describe anterior anatomy, so keep the loaded orientation.
    const rotateLegacyToCamera = false;

    // Preserve the source model's visual detail. The previous implementation
    // replaced every material with one skin shader, which erased eyes, hair,
    // mouth, clothing and texture cues that students need for examination.
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Crown (head top in the exam frame): the measured mouth seam sits a
        // fixed fraction below it, so each mesh's own crown calibrates the
        // articulation band. Adult male = 1.81 reproduces the old hardcoded
        // band exactly; every other mesh tracks its own measured size. The
        // seam table is keyed on the body's own maxY (what
        // measure-lip-seam.mjs reports), so read the same quantity here rather
        // than the head region's extent.
        const posAttr2 = (mesh.geometry as THREE.BufferGeometry).attributes.position;
        let crownMax = -Infinity;
        for (let i = 0; i < posAttr2.count; i++) {
          const yv = posAttr2.getY(i);
          if (yv > crownMax) crownMax = yv;
        }
        const crown = Number.isFinite(crownMax) ? crownMax : 0;
        // Replace the malformed mouth delta locally; never mutate the GLTF
        // cache. The corrected articulation is calibrated to each mesh's own
        // measured mouth seam, so every Patient mesh with a measured seam speaks
        // with a 5.8 mm vermilion excursion instead of the shipped 50 mm
        // lower-face viseme. The adult male row reproduces the old hardcoded
        // band exactly, so its behaviour is unchanged.
        const lipBand = lipSeamForCrown(crown);
        if (shouldApplyCorrectedLipArticulation(modelPath, mesh.name, crown)) {
          const influences = mesh.morphTargetInfluences?.slice();
          const dictionary = mesh.morphTargetDictionary;
          mesh.geometry = withResp001LipArticulationMorph(mesh.geometry, dictionary?.viseme_open, lipBand);
          mesh.updateMorphTargets();
          mesh.morphTargetDictionary = dictionary;
          if (influences) mesh.morphTargetInfluences = influences;
          mesh.userData.ownsLipGeometry = true;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const meshName = mesh.name.toLowerCase();
        if (useSolidMaleBodyMaterial && meshName === 'human') {
          // The compact MPFB male GLB carries a diffuse texture that can render
          // patchily after compression in Safari/Chromium. Use a solid clinical
          // skin material for the body mesh while preserving the separate eye
          // mesh material, so the patient never appears as disconnected limbs.
          // Generate a flat skin atlas matching the solid colour so local
          // cyanosis overlay (`buildCyanosisLocalTwin`) has texels to paint
          // onto at the lip/nail UVs — a 1×1 atlas would map the whole body
          // to a single texel and the local blotch would tint everything.
          const ATLAS = 512;
          const baseCanvas = document.createElement('canvas');
          baseCanvas.width = ATLAS;
          baseCanvas.height = ATLAS;
          const bctx = baseCanvas.getContext('2d');
          if (bctx) {
            bctx.fillStyle = '#c58f72';
            bctx.fillRect(0, 0, ATLAS, ATLAS);
          }
          const baseTex = new THREE.CanvasTexture(baseCanvas);
          baseTex.colorSpace = THREE.SRGBColorSpace;
          baseTex.anisotropy = 4;
          mesh.material = new THREE.MeshStandardMaterial({
            map: baseTex,
            roughness: 0.68,
            metalness: 0,
            side: THREE.DoubleSide,
          });
          mesh.userData.eyesOpenTex = baseTex;
          mesh.userData.eyesClosedTex = null;
        } else {
          mesh.material = Array.isArray(mesh.material)
            ? mesh.material.map(material => material.clone())
            : mesh.material.clone();
        }
        // Stage-2 real eyes: keep their authored PBR values (sclera roughness
        // .35 etc.) and flag the MATERIALS skipRecolor so the live perfusion
        // tint never blues the sclera. The mesh-level flag stays unset so the
        // skeleton-view opacity fade still applies to them with the skin.
        const isEyeMesh = (EYE_NODE_NAMES as readonly string[]).includes(mesh.name);
        // SSS skin: promote the male body skin material to MeshPhysicalMaterial
        // so the runtime effect can wire thickness/attenuation/sheen. Physical
        // extends Standard, so every per-frame path that treats materials as
        // MeshStandardMaterial (tint, diaphoresis, mottling) keeps working. The
        // heavy SSS channels stay at 0 until the `sss` effect turns them on, so
        // when the quality ladder sheds SSS this collapses to plain PBR cost.
        if (isMaleMesh && !isEyeMesh) {
          const src = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const promoted = src.map((m) => {
            const s = m as THREE.MeshStandardMaterial;
            if (!s.isMeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) return m;
            const phys = new THREE.MeshPhysicalMaterial();
            // phys.copy(s) crashes here: MeshPhysicalMaterial.copy assumes the
            // source is also physical and reads physical-only Vector2/Color
            // channels (clearcoatNormalScale et al.) that a plain
            // MeshStandardMaterial doesn't have. Invoke the parent
            // (standard) copy explicitly — physical channels stay at their
            // defaults, which is correct: SSS is gated at 0 until the effect
            // turns it on.
            Reflect.apply(THREE.MeshStandardMaterial.prototype.copy, phys, [s]);
            phys.userData = { ...s.userData, isSssSkin: true };
            return phys;
          });
          mesh.material = Array.isArray(mesh.material) ? promoted : promoted[0];
        }
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          // Physically sensible dielectric skin response under the HDRI
          // environment: the GLBs ship diffuse-only (no roughness map) with an
          // authored roughness that reads plastic under image-based lighting.
          // ~0.5 gives soft broad speculars (real skin); envMapIntensity keeps
          // the IBL contribution just below full so the diffuse tone leads.
          const std = material as THREE.MeshStandardMaterial;
          if (std.isMeshStandardMaterial) {
            if (isEyeMesh) {
              material.userData.skipRecolor = true;
              std.envMapIntensity = 0.65;
            } else {
              std.roughness = 0.5;
              std.metalness = 0;
              std.envMapIntensity = 0.65;
            }
          }
          material.transparent = surfaceOpacity < 1;
          material.opacity = surfaceOpacity;
          // Patient body resting in bed or standing must always write depth.
          // Otherwise transparency < 1 turns off depthWrite, causing the bed
          // mattress to draw over/through the patient mesh.
          material.depthWrite = surfaceOpacity > 0.05;
          material.needsUpdate = true;
        });
      }
    });

    if (rotateLegacyToCamera) {
      clone.rotation.y = Math.PI;
    }

    // Normalise all GLBs into the clinical exam coordinate frame: feet at Y=0,
    // head near Y=1.8, body centred on X/Z. The male MPFB mesh ships with a
    // baked +0.92m vertical offset, which made the torso/camera alignment look
    // broken and left floating limbs in the viewport.
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    if (Number.isFinite(height) && height > 0.5) {
      const targetHeight = patientHeight;
      const modelScale = targetHeight / height;
      const center = box.getCenter(new THREE.Vector3());
      clone.scale.setScalar(modelScale);
      clone.position.set(
        -center.x * modelScale,
        -box.min.y * modelScale,
        -center.z * modelScale,
      );
      clone.updateMatrixWorld(true);
    }

    // Snapshot anchors from the aligned clone so bone hit-testing and floating
    // labels share the same coordinate frame as the rendered patient.
    updateSkeleton(clone);

    // Dressed view: cut scrubs out of the body mesh itself so the garment
    // follows this patient's real geometry (ClothingLayer.buildScrubs).
    // Cosmetic only — a rig/geometry surprise must never break the exam.
    try {
      let bodyMesh: THREE.Mesh | null = null;
      let bestCount = -1;
      clone.traverse((child) => {
        const m = child as THREE.Mesh;
        const g = m.geometry as THREE.BufferGeometry | undefined;
        if (m.isMesh && g && g.attributes && g.attributes.position && g.attributes.position.count > bestCount) {
          bestCount = g.attributes.position.count;
          bodyMesh = m;
        }
      });
      if (bodyMesh) {
        applyArmAmputationPresentation(bodyMesh as THREE.Mesh, bodyInjuries);
        // Prefer Blender-authored garments (blended-garment mode); fall back to
        // the runtime cut-from-skin scrubs if the GLBs didn't load or the piece
        // build came back empty.
        //
        const authoredGarments = CLOTHING_MODE === 'blended-garment'
          ? buildBlendedGarments(bodyMesh as THREE.Mesh, garmentScenes, garmentSpecs)
          : null;
        const scrubs = authoredGarments ?? buildScrubs(bodyMesh as THREE.Mesh);
        if (authoredGarments) {
          const authoredPieceNames = new Set(garmentSpecs.map(spec => spec.name));
          // A partial authored set is deliberate for adolescents: retain the
          // fitted trouser shell, then supply the top from the patient's own
          // surface so adult shoulders are never stretched over a teen body.
          const proceduralComplements = buildScrubs(bodyMesh as THREE.Mesh);
          if (proceduralComplements) {
            for (const piece of [...proceduralComplements.children]) {
              if (authoredPieceNames.has(piece.name)) continue;
              authoredGarments.add(piece);
            }
          }
          // Current garments carry the current body's posture morphs. Do not
          // layer a second, differently cut shirt underneath to cover an old
          // bake: its longer hem and collar protrude as tears and hanging flaps.
        }
        // Child of the body mesh at identity → inherits its exact placement.
        if (scrubs) (bodyMesh as THREE.Mesh).add(scrubs);
        // Hair and eyebrows are derived from this exact body surface and reuse
        // its skin weights/morphs, preventing the universal bald mannequin
        // presentation without adding an independent rig that could detach.
        const hairLayer = buildHairLayer(bodyMesh as THREE.Mesh, patientGender, patientAge);
        if (hairLayer) (bodyMesh as THREE.Mesh).add(hairLayer);
        // Eyes — the skin texture paints the sockets bright red (a placeholder).
        // Models WITH real eyeball meshes (Stage 2: getObjectByName('eyeL'))
        // only need the red texels recoloured to sclera behind the 3D eyes;
        // models without keep the full painted sclera/iris/pupil path, sized
        // from the case pupils. Works on any of the textured patient meshes.
        const hasEyeMeshes = !!clone.getObjectByName('eyeL') && !!clone.getObjectByName('eyeR');
        paintEyesOnTexture(bodyMesh as THREE.Mesh, pupilLeftMm, pupilRightMm, { hasEyeMeshes });

        // The pilot has actual skinned lid panels. A texture cannot close the
        // model's open socket boundary; these panels cover the eye physically.
        if (pilotEyelidScene && (bodyMesh as THREE.SkinnedMesh).isSkinnedMesh) {
          const body = bodyMesh as THREE.SkinnedMesh;
          const source = pilotEyelidScene.getObjectByName('PilotEyelids') as THREE.SkinnedMesh | undefined;
          if (!source?.isSkinnedMesh) throw new Error('Pilot eyelids require a skinned attachment');
          const geometry = source.geometry.clone();
          const joints = geometry.getAttribute('skinIndex');
          const weights = geometry.getAttribute('skinWeight');
          const boneMap = source.skeleton.bones.map(bone => body.skeleton.bones.findIndex(target => (
            target.name.replace(/:/g, '') === bone.name.replace(/:/g, '')
          )));
          const remapped = new Uint16Array(joints.count * 4);
          for (let vertex = 0; vertex < joints.count; vertex++) for (let lane = 0; lane < 4; lane++) {
            const mapped = boneMap[joints.getComponent(vertex, lane)];
            if (weights.getComponent(vertex, lane) > 0 && (mapped === undefined || mapped < 0)) {
              throw new Error('Pilot eyelid joint is absent from patient skeleton');
            }
            remapped[vertex * 4 + lane] = Math.max(0, mapped ?? 0);
          }
          geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(remapped, 4));
          const lids = new THREE.SkinnedMesh(geometry, body.material);
          lids.name = 'PilotEyelids';
          lids.castShadow = true;
          lids.receiveShadow = true;
          // A cached neutral-pose sphere does not follow the patient's head.
          // This tiny attachment must not disappear during a face close-up.
          lids.frustumCulled = false;
          lids.morphTargetDictionary = { ...source.morphTargetDictionary };
          lids.morphTargetInfluences = new Array(source.morphTargetInfluences?.length ?? 0).fill(0);
          lids.bindMode = body.bindMode;
          lids.bind(body.skeleton, body.bindMatrix);
          lids.userData.skipRecolor = true;
          lids.raycast = () => {};
          lids.onBeforeRender = () => {
            for (const [name, sourceIndex] of Object.entries(body.morphTargetDictionary ?? {})) {
              const targetIndex = lids.morphTargetDictionary?.[name];
              if (targetIndex !== undefined) lids.morphTargetInfluences![targetIndex] = body.morphTargetInfluences?.[sourceIndex] ?? 0;
            }
          };
          body.add(lids);
          updateEyeMorphs = createEyeMorphFollower(clone, body, lids);
          // Keep direct renders coherent too: the eye can be drawn before the
          // body/lids, so syncing from the body's render callback is too late.
          for (const name of EYE_NODE_NAMES) {
            const eyePart = clone.getObjectByName(name) as THREE.Mesh | undefined;
            if (eyePart) eyePart.onBeforeRender = updateEyeMorphs;
          }
        }

        // Case wounds — drawn INTO the freshly-stashed atlases so the blink
        // twin and any later mottling twins inherit them. Runs once per clone;
        // world matrices must be current for the region classification.
        if (bodyInjuries && bodyInjuries.length) {
          clone.updateMatrixWorld(true);
          applyWoundsToTextures(bodyMesh as THREE.Mesh, bodyInjuries, injuryRegionTo3D);
        }

        // Invisible, generously-sized hit boxes over each arm. The rendered
        // forearm is only a few pixels wide at the overview zoom, so honest
        // clicks slip past it (or graze the torso and read as "abdomen"). Each
        // box spans the arm's measured lateral region — filling it, unlike a
        // thin capsule whose bounding box is mostly empty air — and is tagged
        // with its limb id; the click handler resolves the tag before any
        // geometric guessing. Added to the normalised root (no rotation) so a
        // world-axis box stays world-aligned regardless of the GLB's own node
        // transform.
        try {
          clone.updateMatrixWorld(true);
          const invClone = clone.matrixWorld.clone().invert();
          const cloneScale = clone.scale.x || 1;
          const bm = bodyMesh as THREE.Mesh;
          const posB = (bm.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
          bm.updateWorldMatrix(true, false);
          const mwB = bm.matrixWorld;
          const vB = new THREE.Vector3();
          let minYB = Infinity, maxYB = -Infinity;
          const wpos: Array<[number, number, number]> = new Array(posB.count);
          for (let i = 0; i < posB.count; i++) {
            vB.fromBufferAttribute(posB, i).applyMatrix4(mwB);
            wpos[i] = [vB.x, vB.y, vB.z];
            if (vB.y < minYB) minYB = vB.y;
            if (vB.y > maxYB) maxYB = vB.y;
          }
          const HB = maxYB - minYB;
          const sB = HB / 1.8;
          for (const side of [1, -1] as const) {
            let xn = Infinity, xx = -Infinity, yn = Infinity, yx = -Infinity, zn = Infinity, zx = -Infinity, cnt = 0;
            for (let i = 0; i < posB.count; i++) {
              const [x, y, z] = wpos[i];
              // Clearly-lateral verts (beyond shoulder width) from the upper
              // arm down to the hanging hand. Excludes the shoulder root so the
              // box never steals a lateral-chest click.
              if (Math.sign(x) !== side || Math.abs(x) < 0.18 * sB || y < minYB + 0.42 * HB || y > minYB + 0.86 * HB) continue;
              cnt++;
              if (x < xn) xn = x; if (x > xx) xx = x;
              if (y < yn) yn = y; if (y > yx) yx = y;
              if (z < zn) zn = z; if (z > zx) zx = z;
            }
            if (cnt < 20) continue;
            // Pad so near-misses beside the arm still land on it.
            const padXY = 0.03 * sB, padZ = 0.06 * sB;
            const wCenter = new THREE.Vector3((xn + xx) / 2, (yn + yx) / 2, (zn + zx) / 2);
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(
                ((xx - xn) + 2 * padXY) / cloneScale,
                ((yx - yn) + 2 * padXY) / cloneScale,
                ((zx - zn) + 2 * padZ) / cloneScale,
              ),
              new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
            );
            box.position.copy(wCenter).applyMatrix4(invClone);
            // Mixamo convention: +X is the PATIENT'S left.
            box.userData.limbRegion = side > 0 ? 'left-arm' : 'right-arm';
            box.userData.skipRecolor = true;
            box.name = side > 0 ? 'hit-left-arm' : 'hit-right-arm';
            clone.add(box);
          }
        } catch {
          // hit volumes are a convenience — never break the exam
        }
      }
    } catch {
      // dressing is cosmetic; the exam continues undressed
    }
    createFaceAttachment(clone, patientScale);
    return { clonedScene: clone, updateEyeMorphs };
    // surfaceOpacity & pupil sizes are deliberately omitted from deps: a
    // Skin/Skeleton toggle or pupil change must NOT rebuild the clone (mesh +
    // scrubs + 2048² eye texture repaint). Opacity is applied live by the
    // effect below; the eyes are baked once (live pupil reading is the 2D panel).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, modelPath, bodyInjuries, garmentScenes, garmentSpecs, mobility, patientHeight, patientGender, patientAge, pilotGarment, pilotEyelidScene]); // bodyInjuries: stable per case (memoised upstream + per-case key)

  const standingArmBones = useMemo(() => (
    ['mixamorig:LeftArm', 'mixamorig:RightArm']
      .map(name => clonedScene.getObjectByName(name) ?? clonedScene.getObjectByName(name.replace(/:/g, '')))
      .filter((node): node is THREE.Object3D => node !== undefined)
  ), [clonedScene]);
  const standingArmRest = useMemo(
    () => standingArmBones.map(arm => arm.quaternion.clone()),
    [standingArmBones],
  );
  const tripodBraceRef = useRef(0);
  // Skeleton.bones are the ORIGINAL mesh's bones, not the cloned scene's —
  // clonedScene.getObjectByName cannot see them. Every bone lookup below
  // routes through this helper, which resolves off the patient's own
  // skeleton first (measured: without it, all leg bones came back null and
  // recumbent patients read as mannequins with 0 mm leg span).
  const resolveSkeletonBone = (scene: THREE.Object3D, name: string) => {
    const patientObj = scene.getObjectByName('Patient');
    const skel = patientObj && (patientObj as THREE.SkinnedMesh).skeleton;
    if (skel) return skel.bones.find(b => b.name === name.replace(/:/g, '')) ?? null;
    return scene.getObjectByName(name) ?? scene.getObjectByName(name.replace(/:/g, '')) ?? null;
  };
  // Accessory recruitment is a girdle shrug, not an upper-arm wave. Mixamo's
  // LeftArm/RightArm sit distal to the clavicle; rotating them levers the
  // hands ~30 mm and reads as jitter on a tripod patient.
  const accessoryShoulderBones = useMemo(() => (
    ['mixamorig:LeftShoulder', 'mixamorig:RightShoulder']
      .map(name => resolveSkeletonBone(clonedScene, name))
      .filter((node): node is THREE.Object3D => node !== undefined)
  ), [clonedScene]);
  const accessoryShoulderRest = useMemo(
    () => accessoryShoulderBones.map(shoulder => shoulder.quaternion.clone()),
    [accessoryShoulderBones],
  );
  const recumbentForearmBones = useMemo(() => (
    ['mixamorig:LeftForeArm', 'mixamorig:RightForeArm']
      .map(name => resolveSkeletonBone(clonedScene, name))
      .filter((node): node is THREE.Object3D => node !== undefined)
  ), [clonedScene]);
  const recumbentForearmRest = useMemo(
    () => recumbentForearmBones.map(forearm => forearm.quaternion.clone()),
    [recumbentForearmBones],
  );
  const postureSpineBones = useMemo(() => (
    ['mixamorig:Spine', 'mixamorig:Spine1']
      .map(name => resolveSkeletonBone(clonedScene, name))
      .filter((node): node is THREE.Object3D => node !== undefined)
  ), [clonedScene]);
  const postureSpineRest = useMemo(
    () => postureSpineBones.map(spine => spine.quaternion.clone()),
    [postureSpineBones],
  );
  const recoveryPoseBones = useMemo(() => {
    // NB: Skeleton.bones are the ORIGINAL mesh's bones, not the cloned
    // scene's — clonedScene.getObjectByName cannot see them (measured:
    // every leg bone came back null, which is why recumbent patients read
    // as mannequins with 0 mm leg span). resolveSkeletonBone handles that.
    const find = (name: string) => resolveSkeletonBone(clonedScene, name);
    return {
      leftArm: find('mixamorig:LeftArm'),
      leftForeArm: find('mixamorig:LeftForeArm'),
      rightArm: find('mixamorig:RightArm'),
      rightForeArm: find('mixamorig:RightForeArm'),
      leftUpLeg: find('mixamorig:LeftUpLeg'),
      leftLeg: find('mixamorig:LeftLeg'),
      rightUpLeg: find('mixamorig:RightUpLeg'),
      rightLeg: find('mixamorig:RightLeg'),
    };
  }, [clonedScene]);
  const recoveryLegRest = useMemo(() => ({
    leftUpLeg: recoveryPoseBones.leftUpLeg?.quaternion.clone() ?? null,
    leftLeg: recoveryPoseBones.leftLeg?.quaternion.clone() ?? null,
    rightUpLeg: recoveryPoseBones.rightUpLeg?.quaternion.clone() ?? null,
    rightLeg: recoveryPoseBones.rightLeg?.quaternion.clone() ?? null,
  }), [recoveryPoseBones]);

  // Whole-skeleton movement is reserved for genuinely ambulatory cases. The
  // source clips are in-place Mixamo loops, so the patient remains inside the
  // scene while stepping/pacing rather than drifting through equipment.
  useEffect(() => {
    const actionName = patientSkeletalAction(mobility, unconscious);
    const clip = actionName
      ? THREE.AnimationClip.findByName(animations, actionName)
      : null;
    if (!clip) {
      skeletalMixerRef.current = null;
      return;
    }

    const mixer = new THREE.AnimationMixer(clonedScene);
    const action = mixer.clipAction(clip);
    action.reset();
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.timeScale = actionName === 'walk' ? 0.58 : 0.68;
    action.fadeIn(0.3).play();
    skeletalMixerRef.current = mixer;

    return () => {
      // Extended fade-out smooths the transition and reduces residual drift
      action.fadeOut(0.38);
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
      if (skeletalMixerRef.current === mixer) skeletalMixerRef.current = null;
    };
  }, [animations, clonedScene, mobility, unconscious]);

  useEffect(() => {
    locomotionTimeRef.current = 0;
    const root = meshRef.current;
    if (!root || !treatmentBayPresentation) return;
    root.position.set(...treatmentBayTransform.position);
    root.rotation.set(...treatmentBayTransform.rotation);
  }, [mobility, treatmentBayPresentation, treatmentBayTransform]);

  // ---- SSS skin material (male mesh only) --------------------------------
  // Wire the baked thickness map + tiled pore detail-normal onto the promoted
  // MeshPhysicalMaterial and toggle the subsurface channels with `sss`. When
  // sss is off (adaptive ladder shed it, or female/legacy mesh) the material
  // stays plain PBR. Textures load lazily on first male render and are cached
  // module-wide so female cases never fetch them.
  const isMaleMesh = modelPath.includes('patient-male');
  useEffect(() => {
    if (!isMaleMesh) return;
    let cancelled = false;
    loadSssMaps(skinDetailProfileForPilot(braceHandsOnKnees)).then((maps) => {
      if (cancelled || !maps) return;
      clonedScene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of list) {
          const phys = m as THREE.MeshPhysicalMaterial;
          if (!phys.userData?.isSssSkin || !phys.isMeshPhysicalMaterial) continue;
          applySssToMaterial(phys, maps, sss);
        }
      });
    });
    return () => { cancelled = true; };
  }, [clonedScene, isMaleMesh, sss, braceHandsOnKnees]);

  // Region state is now communicated with anatomical overlays and landmarks,
  // not by recolouring the whole patient. Keep this callback for the pointer
  // path, but leave the model's real materials untouched.
  const updateMeshColors = useCallback((region: RegionRange | null) => {
    void region;
  }, []);

  // Refresh the skeleton snapshot on mount, after the primitive has been
  // inserted into the r3f scene graph. Walks the MOUNTED group so the bone
  // world matrices are computed in the same frame as pointer hit-points. If
  // the scan finds no bones (skinned-clone flattened the rig) the earlier
  // snapshot from the original scene, taken in the useMemo above, stays
  // valid — the frames match because the parent group is identity.
  useEffect(() => {
    if (!meshRef.current) return;
    const before = anchors.length;
    updateSkeleton(meshRef.current);
    // If the mounted group doesn't expose the bones by name (some GLB
    // exporters flatten the skeleton on clone), anchors end up empty —
    // re-populate from the original scene so the primary path keeps
    // working. The fallback getRegionAtPoint() still works regardless.
    if (anchors.length === 0 && before > 0) updateSkeleton(clonedScene);
  }, [clonedScene]);

  useEffect(() => {
    const frame = clonedScene.getObjectByName('PatientFaceAttachment');
    onFaceAttachment?.(frame instanceof THREE.Group ? frame : null);
    return () => onFaceAttachment?.(null);
  }, [clonedScene, onFaceAttachment]);

  // Emit a surface-projection sampler built from the actual mounted mesh, so
  // the parent can anchor every floating label/finding marker onto the real
  // patient surface (self-calibrating across the male/female/any GLB).
  useEffect(() => {
    if (!onSurfaceSampler) return;
    const sampler = buildSurfaceSampler(meshRef.current ?? clonedScene, treatmentBayPresentation ? meshRef.current : null);
    onSurfaceSampler(sampler);
    return () => onSurfaceSampler(null);
  }, [clonedScene, onSurfaceSampler, treatmentBayPresentation]);

  // Dressed-view garment: layer on only in dressed mode, and the piece
  // covering the focused region parts so the skin underneath is assessable.
  useEffect(() => {
    const layer = clonedScene.getObjectByName('clothing-layer');
    if (!layer) return;
    layer.visible = dressed;
    const parted = new Set(dressed ? CLOTHING_PARTING[dressedActiveRegion ?? ''] ?? [] : []);
    for (const piece of layer.children) piece.visible = !parted.has(piece.name);
  }, [clonedScene, dressed, dressedActiveRegion]);

  // Stage-2 real eyes: the case pupil diameters drive the 3D pupil discs
  // directly (authored at 5mm — scale 1). Live, per-render-cheap, and unlike
  // the baked texture pupils this shows anisocoria/blown pupils changing
  // mid-case. pupilL = the PATIENT'S left pupil (app x > 0).
  useEffect(() => {
    const pl = clonedScene.getObjectByName('pupilL');
    const pr = clonedScene.getObjectByName('pupilR');
    if (pl) pl.scale.setScalar(pupilScale(pupilLeftMm));
    if (pr) pr.scale.setScalar(pupilScale(pupilRightMm));
  }, [clonedScene, pupilLeftMm, pupilRightMm]);

  // Jaundice: yellow the eye-mesh scleras. The skin cast is carried by
  // skinTint's colour chain, but the eye materials are flagged skipRecolor
  // (so the perfusion tint never blues the whites), which means jaundice has
  // to reach them separately here. Scleral icterus is one of the earliest,
  // most recognisable jaundice signs — worth the two extra material writes.
  // The iris/pupil discs are left alone. Constant while the case runs, so a
  // cheap effect (not a frame-loop mutation). Real-eye models only; painted-
  // eye models simply have no eyeL/eyeR node to tint.
  useEffect(() => {
    const j = Math.min(1, Math.max(0, jaundice));
    for (const name of ['eyeL', 'eyeR']) {
      const eye = clonedScene.getObjectByName(name) as THREE.Mesh | undefined;
      if (!eye || !eye.isMesh) continue;
      const list = Array.isArray(eye.material) ? eye.material : eye.material ? [eye.material] : [];
      for (const mat of list) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!std.isMeshStandardMaterial) continue;
        // Cache the authored sclera colour once so we can restore it exactly
        // when jaundice clears (avoids drifting the whites on model reuse).
        if (std.userData.baseScleraColor === undefined) {
          std.userData.baseScleraColor = std.color.getHex();
        }
        const base = tintTmpRef.current.setHex(std.userData.baseScleraColor as number);
        // Blend the sclera toward an icteric yellow by up to ~0.55 at full.
        std.color.copy(base).lerp(new THREE.Color(0xd9c24a), 0.55 * j);
        std.needsUpdate = true;
      }
    }
  }, [clonedScene, jaundice]);


  // Surface opacity (Skin = 1, Skeleton = 0.28) is applied to the body material
  // HERE, not baked into the clone build — so toggling the view layer flips a
  // material flag instead of rebuilding the mesh/scrubs/eyes. Scrubs and arm
  // hit-boxes carry skipRecolor and are left untouched (they manage their own
  // visibility).
  useEffect(() => {
    clonedScene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData?.skipRecolor) return;
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        mat.transparent = surfaceOpacity < 1;
        mat.opacity = surfaceOpacity;
        mat.depthWrite = surfaceOpacity > 0.05;
        mat.needsUpdate = true;
      }
    });
  }, [clonedScene, surfaceOpacity]);

  // Perfusion only owns colour. The frame loop below is the sole sheen writer:
  // resetting roughness here on a tint update erased settled diaphoresis,
  // whose frame loop correctly had no further easing work to do.
  useEffect(() => {
    clonedScene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData?.skipRecolor) return;
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        // Eyes are child meshes of the patient model, so they intentionally
        // remain in this traversal for opacity/blink handling. Their authored
        // iris, pupil and sclera colours are protected on the material (rather
        // than the mesh) because LifeSigns still needs to control the eye mesh
        // itself. Respect that material flag here: whitening the initial skin
        // multiplier used to turn all three eye materials into sclera white,
        // leaving the patient with blank mannequin eyes.
        if (!std.color || mat.userData.skipRecolor) continue;
        std.color.set(skinTint ?? '#ffffff');
        std.needsUpdate = true;
      }
    });
  }, [clonedScene, skinTint]);

  // Free the GPU resources WE created on the PREVIOUS clone when a new one
  // replaces it (e.g. a male↔female model switch): the scrubs/hit-box
  // geometry+materials and the painted eye CanvasTexture. The body geometry and
  // any un-painted skin texture are SHARED with the useGLTF cache
  // (SkeletonUtils.clone shares them) and are never disposed. We compare the
  // previous ref instead of returning a cleanup, so React StrictMode's
  // double-invoke can't dispose the live clone.
  const prevCloneRef = useRef<THREE.Object3D | null>(null);
  useEffect(() => {
    const prev = prevCloneRef.current;
    if (prev && prev !== clonedScene) {
      prev.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const created = m.userData?.skipRecolor === true || m.name.startsWith('hit-');
        if ((created || m.userData.ownsLipGeometry) && m.geometry) m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          const map = (mat as THREE.MeshStandardMaterial).map;
          if (map instanceof THREE.CanvasTexture) map.dispose(); // our painted eye texture
          mat.dispose(); // every material in this clone is a per-instance clone/fresh
        }
        // The blink pair (open/closed lids) — whichever isn't currently
        // assigned as `map` would otherwise leak. dispose() is idempotent.
        // When mottling is active these hold the MOTTLED twins; the clean
        // originals live in cleanOpenTex/cleanClosedTex, so free those too.
        const openTex = m.userData?.eyesOpenTex;
        const closedTex = m.userData?.eyesClosedTex;
        const cleanOpenTex = m.userData?.cleanOpenTex;
        const cleanClosedTex = m.userData?.cleanClosedTex;
        if (openTex instanceof THREE.CanvasTexture) openTex.dispose();
        if (closedTex instanceof THREE.CanvasTexture) closedTex.dispose();
        if (cleanOpenTex instanceof THREE.CanvasTexture) cleanOpenTex.dispose();
        if (cleanClosedTex instanceof THREE.CanvasTexture) cleanClosedTex.dispose();
      });
    }
    prevCloneRef.current = clonedScene;
  }, [clonedScene]);

  // Drive continuous rendering for pulse animation when required regions exist
  // or when guided mode is active (next-step ring needs to pulse).
  useFrame((_, delta) => {
    const skeletalMixer = skeletalMixerRef.current;
    if (skeletalMixer) {
      // Start every ambulatory frame from the fitted bind pose before the
      // animation mixer writes its keyed tracks. Some donor clips omit a
      // shoulder or spine track; applying our clinical pose correction on top
      // of an unkeyed bone would otherwise accumulate rotation frame by frame
      // and present as vibrating or progressively splayed arms.
      standingArmBones.forEach((arm, index) => arm.quaternion.copy(standingArmRest[index]));
      accessoryShoulderBones.forEach((shoulder, index) => (
        shoulder.quaternion.copy(accessoryShoulderRest[index])
      ));
      postureSpineBones.forEach((spine, index) => spine.quaternion.copy(postureSpineRest[index]));
    }
    skeletalMixer?.update(Math.min(delta, 0.05));
    const armRelaxation = patientArmRestRadians(mobility, unconscious, patientAge);
    if (skeletalMixer && armRelaxation > 0) {
      // The donor's idle action retains its capture A-pose. Apply the
      // Blender-calibrated local-X offset after the mixer writes each frame so
      // hands rest beside the thighs. Pacing uses a smaller offset, preserving
      // the walk clip's authored opposing swing while removing its broad pose.
      for (const arm of standingArmBones) arm.rotateX(armRelaxation);
    } else if (!skeletalMixer) {
      // Non-ambulatory patients have no clip to reset the A-pose each frame.
      // Restore the fitted rest quaternion explicitly before applying the
      // mobility-specific arm drop so the rotation cannot accumulate into the
      // high-frequency "vibrating arms" failure reported in seated cases.
      // Baseline "alive" movement. Without this the arms hold one frozen pose
      // for the whole case and the patient reads as a mannequin. Applied after
      // the rest-quaternion restore above, so it layers on the posed arm and
      // still cannot accumulate frame to frame.
      idleLimbGateRef.current += ((unconscious ? 0 : 1) - idleLimbGateRef.current)
        * Math.min(1, delta * 1.5);
      const idleLimb = computeIdleLimbMotion({
        time: idleLimbTimeRef.current += delta,
        gate: idleLimbGateRef.current,
        breathPhase01: getBreathPhase01(),
        respiratoryRate: breathRateRpm,
        breathingEffort,
        reduced: reduceIdleMotion,
        braced: posture === 'tripod' || breathingEffort >= 0.5,
      }, idleLimbRef.current);

      const braceTarget = tripodHandBraceSweep(braceHandsOnKnees, posture, 'right');
      tripodBraceRef.current += (braceTarget - tripodBraceRef.current) * (1 - Math.exp(-delta * 5));
      const braceBlend = tripodBraceRef.current / TRIPOD_BRACE_CALIBRATION.forearm;
      standingArmBones.forEach((arm, index) => {
        arm.quaternion.copy(standingArmRest[index]);
        if (armRelaxation > 0) arm.rotateX(armRelaxation);
        arm.rotateX(braceBlend * TRIPOD_BRACE_CALIBRATION.upperArm);
        const isLeft = arm.name.toLowerCase().includes('left');
        arm.rotateX(isLeft ? idleLimb.leftArmDrift : idleLimb.rightArmDrift);
      });
      // Shrug the girdle, not the upper arms: the clavicle/scapula bones
      // sit proximal to the planted hands, so a 1° rise reads as accessory
      // recruitment instead of waving the forearms.
      accessoryShoulderBones.forEach((shoulder, index) => {
        shoulder.quaternion.copy(accessoryShoulderRest[index]);
        if (idleLimb.shoulderLift === 0) return;
        const isLeft = shoulder.name.toLowerCase().includes('left');
        shoulder.rotateZ(isLeft ? idleLimb.shoulderLift : -idleLimb.shoulderLift);
      });
      const forearmRelaxation = patientForearmRestRadians(mobility, patientAge);
      recumbentForearmBones.forEach((forearm, index) => {
        forearm.quaternion.copy(recumbentForearmRest[index]);
        if (forearmRelaxation !== 0) forearm.rotateX(forearmRelaxation);
        const side = forearm.name.toLowerCase().includes('left') ? 'left' : 'right';
        const sweep = patientForearmSweepRadians(mobility, side, patientAge);
        if (sweep !== 0) forearm.rotateZ(sweep);
        forearm.rotateZ(side === 'left' ? -tripodBraceRef.current : tripodBraceRef.current);
        forearm.rotateX(side === 'left' ? idleLimb.leftForeArmDrift : idleLimb.rightForeArmDrift);
      });
      // Legs are otherwise static in recumbent presentations, so explicitly
      // restore them before applying the recovery bend. This also makes a
      // later move back to supine deterministic instead of retaining a knee.
      // The idle knee drift layers on top of that restore — a resting leg's
      // knee never holds one angle, and the foot stays planted because the
      // drift is applied to the knee joint only.
      if (recoveryPoseBones.leftUpLeg && recoveryLegRest.leftUpLeg) {
        recoveryPoseBones.leftUpLeg.quaternion.copy(recoveryLegRest.leftUpLeg);
      }
      if (recoveryPoseBones.leftLeg && recoveryLegRest.leftLeg) {
        recoveryPoseBones.leftLeg.quaternion.copy(recoveryLegRest.leftLeg);
        recoveryPoseBones.leftLeg.rotateX(idleLimb.leftKneeDrift);
      }
      if (recoveryPoseBones.rightUpLeg && recoveryLegRest.rightUpLeg) {
        recoveryPoseBones.rightUpLeg.quaternion.copy(recoveryLegRest.rightUpLeg);
      }
      if (recoveryPoseBones.rightLeg && recoveryLegRest.rightLeg) {
        recoveryPoseBones.rightLeg.quaternion.copy(recoveryLegRest.rightLeg);
        recoveryPoseBones.rightLeg.rotateX(idleLimb.rightKneeDrift);
      }
      if (posture === 'recovery') {
        applyLocalBoneAdjustment(recoveryPoseBones.leftArm, RECOVERY_BONE_ADJUSTMENTS.leftArm);
        applyLocalBoneAdjustment(recoveryPoseBones.leftForeArm, RECOVERY_BONE_ADJUSTMENTS.leftForeArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightArm, RECOVERY_BONE_ADJUSTMENTS.rightArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightForeArm, RECOVERY_BONE_ADJUSTMENTS.rightForeArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightUpLeg, RECOVERY_BONE_ADJUSTMENTS.rightUpLeg);
        applyLocalBoneAdjustment(recoveryPoseBones.rightLeg, RECOVERY_BONE_ADJUSTMENTS.rightLeg);
      }
      if (
        neurologicalWeakSide
        && posture !== 'recovery'
        && !handGuardRegion
        && (mobility === 'seated' || mobility === 'standing')
      ) {
        const weak = NEUROLOGICAL_WEAK_ARM_ADJUSTMENTS[neurologicalWeakSide];
        const arm = neurologicalWeakSide === 'left' ? recoveryPoseBones.leftArm : recoveryPoseBones.rightArm;
        const foreArm = neurologicalWeakSide === 'left' ? recoveryPoseBones.leftForeArm : recoveryPoseBones.rightForeArm;
        applyLocalBoneAdjustment(arm, weak.arm);
        applyLocalBoneAdjustment(foreArm, weak.foreArm);
      }
      // Seated/standing self-splint / hand guard: raise both hands from the
      // lap/sides to the guarded region (neck, head, chest, abdomen, choking
      // sign). Gated on upright mobility rather than a specific posture so a
      // tripod patient clutching their chest and a standing choking patient
      // both render correctly — recoveryPoseBones resolve to the same
      // LeftArm/RightArm/LeftForeArm/RightForeArm bones the rest pose just
      // positioned, so this is a clean additive layer, not a competing pose.
      if (handGuardRegion && (mobility === 'seated' || mobility === 'standing')) {
        const adj = HAND_GUARD_ADJUSTMENTS[handGuardRegion];
        applyLocalBoneAdjustment(recoveryPoseBones.leftArm, adj.leftArm);
        applyLocalBoneAdjustment(recoveryPoseBones.leftForeArm, adj.leftForeArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightArm, adj.rightArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightForeArm, adj.rightForeArm);
      } else if (posture === 'supine' && (handGuardRegion === 'chest' || handGuardRegion === 'abdomen')) {
        // Recumbent self-splint: the supine patient draws the hands ONTO the
        // guarded anatomy (supine STEMI clutching the sternum; ectopic /
        // placenta-previa curling the hands onto the lower abdomen). Only
        // chest/abdomen have a recumbent variant — neck/head/choking guards are
        // inherently upright gestures. Fires for supine posture here, which the
        // upright branch above excludes. Recovery (left-lateral) posture is
        // deliberately skipped: it positions the arms via the recovery pose and
        // stacking the supine guard on top would double-apply.
        const adj = RECUMBENT_GUARD_ADJUSTMENTS[handGuardRegion];
        applyLocalBoneAdjustment(recoveryPoseBones.leftArm, adj.leftArm);
        applyLocalBoneAdjustment(recoveryPoseBones.leftForeArm, adj.leftForeArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightArm, adj.rightArm);
        applyLocalBoneAdjustment(recoveryPoseBones.rightForeArm, adj.rightForeArm);
      }
    }
    const spineLean = patientSpineLeanRadians(posture, patientAge)
      + (tripodBraceRef.current / TRIPOD_BRACE_CALIBRATION.forearm) * TRIPOD_BRACE_CALIBRATION.spine;
    if (skeletalMixer && spineLean > 0) {
      // Mixer first, then a small additive local flex. In normal case data a
      // tripod patient is seated and has no locomotion mixer, but this keeps a
      // treatment-driven transition stable if those states briefly overlap.
      for (const spine of postureSpineBones) spine.rotateX(spineLean);
    } else if (!skeletalMixer) {
      // As with the arms, restore before applying. This prevents accumulated
      // frame-to-frame rotation and returns a recovered tripod patient to an
      // anatomically neutral seated spine without a remount.
      postureSpineBones.forEach((spine, index) => {
        spine.quaternion.copy(postureSpineRest[index]);
        if (spineLean > 0) spine.rotateX(spineLean);
      });
    }
    const root = meshRef.current;
    if (root && treatmentBayPresentation && mobility === 'pacing' && !unconscious) {
      locomotionTimeRef.current += Math.min(delta, 0.05);
      const pace = patientWalkingPath(locomotionTimeRef.current);
      root.position.set(
        treatmentBayTransform.position[0] + pace.x,
        treatmentBayTransform.position[1],
        treatmentBayTransform.position[2] + pace.z,
      );
      root.rotation.set(
        treatmentBayTransform.rotation[0],
        treatmentBayTransform.rotation[1] + pace.yaw,
        treatmentBayTransform.rotation[2],
      );
    }
    if ((requiredRegions && requiredRegions.size > 0) || (guidedMode && nextGuidedStep)) {
      pulseRef.current += delta;
    }

    // ---- Drive clinical morph targets ----
    // Resolve the morph-carrying mesh from the CURRENTLY COMMITTED clone
    // (useFrame's closure always sees the mounted clonedScene). Re-resolved
    // only when the clone changes — not a per-frame traverse.
    if (morphRootRef.current !== clonedScene) {
      let found: THREE.Mesh | null = null;
      clonedScene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!(m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences)) return;
        // Prefer the Patient body mesh so lip-sync drives the face jaw, not a
        // clothing/hair mesh that also inherited the same morph dictionary.
        if (!found || m.name === 'Patient') found = m;
      });
      morphMeshRef.current = found;
      morphRootRef.current = clonedScene;
    }
    const mesh = morphMeshRef.current;
    if (mesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      const active = activeFindingMorphs ?? [];

      // Findings: ramp active morphs toward 1, inactive toward 0 (~0.6s).
      // breathe_chest_rise, the posture morphs, and viseme_open are driven
      // separately below, so they're excluded here or the zero-ramp would
      // fight them.
      for (const name of Object.keys(dict)) {
        if (name === 'breathe_chest_rise') continue; // handled below
        if (name === 'breathe_chest_rise_unilateral') continue; // handled below
        if (name === 'viseme_open') continue;        // lip-sync, below
        if (POSTURE_MORPHS.includes(name)) continue; // posture mixer, below
        if (PATIENT_MOTION_MORPHS.includes(name as typeof PATIENT_MOTION_MORPHS[number])) continue;
        const target = active.includes(name) ? 1 : 0;
        const cur = morphInfluenceRef.current[name] ?? 0;
        const next = cur + (target - cur) * Math.min(1, delta * 4);
        morphInfluenceRef.current[name] = next;
        const idx = dict[name];
        if (idx !== undefined) infl[idx] = next;
      }

      // Posture mixer: crossfade the target posture morph toward 1 and the
      // others toward 0 (~0.5s). No-op when the mesh carries no posture morphs.
      // A paediatric / older GLB without pose_legs_elevated still sits; the
      // ottoman does the rest of the clinical read.
      const requestedMorph = posture ? POSTURE_MORPH_BY_NAME[posture] : undefined;
      const activeMorph = requestedMorph && dict[requestedMorph] !== undefined
        ? requestedMorph
        : posture === 'legs-elevated' && dict.pose_seated !== undefined
          ? 'pose_seated'
          : requestedMorph;
      for (const name of POSTURE_MORPHS) {
        const idx = dict[name];
        if (idx === undefined) continue;
        const target = activeMorph === name ? 1 : 0;
        const cur = morphInfluenceRef.current[name] ?? 0;
        const next = cur + (target - cur) * Math.min(1, delta * 4);
        morphInfluenceRef.current[name] = next;
        infl[idx] = next;
      }

      // Condition-responsive LOCAL movement. IdleAnimations publishes these
      // weights without translating or rotating the scene root, so collapsed
      // patients remain grounded while shoulders and limbs still move.
      const motion = clonedScene.userData.patientMotion as PatientMotionSignals | undefined;
      for (const name of PATIENT_MOTION_MORPHS) {
        const motionIdx = dict[name];
        if (motionIdx !== undefined) infl[motionIdx] = motion?.[name] ?? 0;
      }

      // Lip-sync: drive viseme_open from the voice analyser's 0..1 amplitude.
      // The ref is already EMA-smoothed in the hook, so read it straight.
      {
        const idx = dict['viseme_open'];
        if (idx !== undefined) infl[idx] = mouthOpenRef?.current ?? 0;
      }

      // Breathing: continuous sine at the case respiratory rate. Apnoea
      // (rate 0) leaves the chest still — itself a finding.
      const idx = dict['breathe_chest_rise'];
      if (idx !== undefined) {
        if (breathRateRpm > 0) {
          const hz = breathRateRpm / 60;
          breathPhaseRef.current += delta * hz * Math.PI * 2;
          // Visible chest-rise depth: case-driven shallow/deep factor, tapered a
          // little more when very tachypnoeic (fast breathing rides shallower).
          // Clamped so shallow stays perceptible and deep never clips. This makes
          // the four states unmistakable: fast (high hz), shallow (low amp), deep
          // (high amp), absent (rpm 0 → no movement, handled below).
          const fastTaper = breathRateRpm >= 34 ? 0.7 : breathRateRpm >= 26 ? 0.85 : 1.0;
          // The authored morph contains a small whole-silhouette delta in addition
          // to chest expansion. Keep its influence in a clinical range so breathing
          // remains visible without making a supine patient rise/sink as a loop.
          const amp = Math.min(0.42, Math.max(0.08, breathDepthFactor * fastTaper * 0.32));
          // IdleAnimations publishes an occasional sharp extra rise (hypoxic
          // gasp) via userData — additive on the regular cycle, tightly capped.
          const gaspBoost = Math.min(0.14, (clonedScene.userData.idleGaspBoost as number | undefined) ?? 0);
          const rise = Math.min(0.5, (0.5 - 0.5 * Math.cos(breathPhaseRef.current)) * amp + gaspBoost);
          // A unilateral chest rise (tension pneumothorax, flail segment) is
          // the classic LOOK finding, and the symmetric morph cannot show it.
          // Split the same waveform: the good hemithorax keeps full excursion
          // via the one-sided morph while the symmetric morph drops to a
          // residual, so the affected side moves LESS rather than not at all.
          const uniIdx = dict['breathe_chest_rise_unilateral'];
          const asymmetric = chestRiseUnilateral && uniIdx !== undefined;
          infl[idx] = asymmetric ? rise * ASYMMETRIC_CHEST_RESIDUAL : rise;
          if (uniIdx !== undefined) infl[uniIdx] = asymmetric ? rise : 0;
        } else {
          infl[idx] = 0;
          const uniIdx = dict['breathe_chest_rise_unilateral'];
          if (uniIdx !== undefined) infl[uniIdx] = 0;
        }
        // Publish the phase so auscultation audio can inhale/exhale in sync
        // with the chest the student is watching.
        setBreathClock(breathPhaseRef.current, breathRateRpm);
      }
    }

    // ---- Live skin perfusion tint (cyanosis / pallor) ----
    // Lerp every MeshStandardMaterial's colour toward `skinTint` each frame.
    // Meshes flagged `userData.skipRecolor` (clothing, eyes, hair, devices) are
    // left alone so only skin surfaces shift. null tint = no work done. The
    // easing (`delta * 3`) reaches ~95% of target in ~1s, which reads as a
    // gradual clinical change rather than a pop when SpO2 crosses a threshold.
    if (skinTint && clonedScene) {
      const tmp = tintTmpRef.current;
      clonedScene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (mesh.userData.skipRecolor) return;
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        if (Array.isArray(mat)) {
          for (const m of mat) {
            if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial && !m.userData.skipRecolor) {
              tmp.copy(m.color).lerp(skinTint, Math.min(1, delta * 3));
              m.color.copy(tmp);
            }
          }
        } else if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial && !mat.userData.skipRecolor) {
          tmp.copy(mat.color).lerp(skinTint, Math.min(1, delta * 3));
          mat.color.copy(tmp);
        }
      });
    }

    // ---- Diaphoresis (sweat sheen) ----------------------------------------
    // Ease a single scalar toward the target: sweat breaks fast (~10 s to
    // full) and dries slowly (~60 s) as physiology recovers — an asymmetric
    // linear approach, no allocation. When wet, lower the skin roughness and
    // raise envMapIntensity so the HDRI paints a broad wet glint; the tone
    // (skinTint) is untouched. Skin materials are cached once per clone.
    {
      const target = Math.min(1, Math.max(0, diaphoresis));
      const cur = diaphoresisEaseRef.current;
      // Run when the scalar is still easing OR the clone changed under a
      // settled scalar (a model swap must re-apply the wet level to the fresh
      // materials — otherwise a sweaty patient looks dry after the swap).
      const cloneChanged = skinMatRootRef.current !== clonedScene;
      const binarySheenChanged = skinDiaphoreticAppliedRef.current !== skinDiaphoretic;
      if (cur !== target || cloneChanged || binarySheenChanged) {
        const perSec = target > cur ? 1 / 10 : 1 / 60; // ramp-in vs dry-out
        const step = perSec * delta;
        const next = target > cur ? Math.min(target, cur + step) : Math.max(target, cur - step);
        diaphoresisEaseRef.current = next;
        // (Re)resolve the skin material cache from the committed clone.
        if (cloneChanged) {
          const mats: Array<{ mat: THREE.MeshStandardMaterial; roughness: number; envMapIntensity: number }> = [];
          clonedScene.traverse((child) => {
            const m = child as THREE.Mesh;
            if (!m.isMesh || m.userData?.skipRecolor) return;
            const list = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
            for (const mat of list) {
              const std = mat as THREE.MeshStandardMaterial;
              if (std.isMeshStandardMaterial && !std.userData?.skipRecolor) {
                mats.push({ mat: std, roughness: std.roughness, envMapIntensity: std.envMapIntensity });
              }
            }
          });
          skinMatsRef.current = mats;
          skinMatRootRef.current = clonedScene;
        }
        skinDiaphoreticAppliedRef.current = skinDiaphoretic;
        const e = diaphoresisEaseRef.current;
        for (const entry of skinMatsRef.current) {
          // A wet patient needs a broad, broken sheen—not a lacquered plastic
          // body. Keep enough microsurface roughness to retain the skin read,
          // and lift the environment reflection only modestly. This is still
          // visibly clammy under the villa key light without turning every
          // limb into a white specular strip.
          // Retain the legacy boolean's immediate .32 override, but give it
          // the same writer as continuous sweat. Toggling it off restores the
          // current eased value, not an unrelated dry-material snapshot.
          entry.mat.roughness = skinDiaphoretic
            ? Math.min(entry.roughness, 0.32)
            : entry.roughness + (0.34 - entry.roughness) * e;
          entry.mat.envMapIntensity = entry.envMapIntensity + (0.78 - entry.envMapIntensity) * e;
        }
      }
    }

    // ---- Mottling (late-shock livedo) — state-crossing texture swap --------
    // Only acts when the mottling channel disagrees with what's applied. When
    // it crosses ON we composite ONE mottled twin of the diffuse atlas (see
    // MottlingLayer) and repoint the body material + blink pair at it; on
    // recovery we swap back to the clean atlas and free the copies. No work in
    // steady state; the build/swap happens once per crossing, never per frame.
    {
      // A fresh clone starts clean (its textures are freed by the disposal
      // effect). Reset the cache + applied flag.
      if (mottleRootRef.current !== clonedScene) {
        mottleRootRef.current = clonedScene;
        mottleAppliedRef.current = false;
        mottleBodyRef.current = null;
      }
      const want = mottling > 0.5;
      if (want !== mottleAppliedRef.current) {
        // Resolve (and cache) the body mesh carrying the painted diffuse atlas.
        if (!mottleBodyRef.current) {
          let found: THREE.Mesh | null = null;
          clonedScene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!found && m.isMesh && m.userData?.eyesOpenTex) found = m;
          });
          mottleBodyRef.current = found;
        }
        const bodyMesh = mottleBodyRef.current;
        const mat = bodyMesh
          ? ((Array.isArray(bodyMesh.material) ? bodyMesh.material[0] : bodyMesh.material) as
              | THREE.MeshStandardMaterial
              | undefined)
          : undefined;
        // If the body/atlas isn't ready yet, leave the flag as-is and retry
        // next frame (self-healing) — never mark applied without doing the work.
        if (bodyMesh && mat) {
          if (want) {
            const twin = buildMottledTextures(bodyMesh);
            if (twin) {
              const cleanOpen = bodyMesh.userData.eyesOpenTex as THREE.Texture | undefined;
              const cleanClosed = bodyMesh.userData.eyesClosedTex as THREE.Texture | null | undefined;
              bodyMesh.userData.cleanOpenTex = cleanOpen ?? null;
              bodyMesh.userData.cleanClosedTex = cleanClosed ?? null;
              bodyMesh.userData.eyesOpenTex = twin.open;
              bodyMesh.userData.eyesClosedTex = twin.closed ?? cleanClosed ?? null;
              // Preserve whichever lid state shows so mottling can't flash the
              // eyes open mid-blink.
              const showingClosed = mat.map === cleanClosed;
              mat.map = showingClosed ? (twin.closed ?? twin.open) : twin.open;
              mat.needsUpdate = true;
              mottleAppliedRef.current = true;
            }
          } else {
            const cleanOpen = (bodyMesh.userData.cleanOpenTex as THREE.Texture | null) ?? null;
            const cleanClosed = (bodyMesh.userData.cleanClosedTex as THREE.Texture | null) ?? null;
            const mottledOpen = bodyMesh.userData.eyesOpenTex as THREE.Texture | undefined;
            const mottledClosed = bodyMesh.userData.eyesClosedTex as THREE.Texture | null | undefined;
            const showingClosed = mat.map === mottledClosed;
            bodyMesh.userData.eyesOpenTex = cleanOpen;
            bodyMesh.userData.eyesClosedTex = cleanClosed;
            if (cleanOpen) {
              mat.map = showingClosed && cleanClosed ? cleanClosed : cleanOpen;
              mat.needsUpdate = true;
            }
            if (mottledOpen instanceof THREE.CanvasTexture && mottledOpen !== cleanOpen) mottledOpen.dispose();
            if (mottledClosed instanceof THREE.CanvasTexture && mottledClosed !== cleanClosed) mottledClosed.dispose();
            mottleAppliedRef.current = false;
          }
        }
      }
    }

    // ---- Local cyanosis (lips + nailbeds) — graded texture swap ----
    // Four clinical levels avoid rebuilding the 2K atlas every frame while
    // still letting lips/nailbeds deepen and clear as SpO2 changes. The base
    // texture is retained separately so repeated level changes never paint
    // cyanosis on top of cyanosis.
    {
      if (cyanosisLocalRootRef.current !== clonedScene) {
        cyanosisLocalRootRef.current = clonedScene;
        cyanosisLocalAppliedRef.current = false;
        cyanosisLocalLevelRef.current = 0;
        cyanosisLocalBodyRef.current = null;
      }
      const nextLevel = Math.min(4, Math.max(0, Math.round(cyanosisLocalStrength * 4)));
      if (nextLevel !== cyanosisLocalLevelRef.current) {
        if (!cyanosisLocalBodyRef.current) {
          let found: THREE.Mesh | null = null;
          clonedScene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!found && m.isMesh && m.userData?.eyesOpenTex) found = m;
          });
          cyanosisLocalBodyRef.current = found;
        }
        const bodyMesh = cyanosisLocalBodyRef.current;
        const mat = bodyMesh
          ? ((Array.isArray(bodyMesh.material) ? bodyMesh.material[0] : bodyMesh.material) as
              | THREE.MeshStandardMaterial
              | undefined)
          : undefined;
        if (bodyMesh && mat) {
          if (nextLevel > 0) {
            const activeOpen = bodyMesh.userData.eyesOpenTex as THREE.CanvasTexture | undefined;
            const activeClosed = bodyMesh.userData.eyesClosedTex as THREE.CanvasTexture | null | undefined;
            const baseOpen = (bodyMesh.userData.cyanosisBaseOpenTex as THREE.CanvasTexture | undefined) ?? activeOpen;
            const baseClosed = bodyMesh.userData.cyanosisBaseClosedTex === undefined
              ? (activeClosed ?? null)
              : (bodyMesh.userData.cyanosisBaseClosedTex as THREE.CanvasTexture | null);
            if (!cyanosisLocalAppliedRef.current) {
              bodyMesh.userData.cyanosisBaseOpenTex = baseOpen ?? null;
              bodyMesh.userData.cyanosisBaseClosedTex = baseClosed;
            }
            const twin = buildCyanosisLocalTwin(bodyMesh, nextLevel / 4, baseOpen, baseClosed, braceHandsOnKnees);
            if (twin) {
              const previousOpen = bodyMesh.userData.cyanosisOpenTex as THREE.Texture | undefined;
              const previousClosed = bodyMesh.userData.cyanosisClosedTex as THREE.Texture | null | undefined;
              bodyMesh.userData.cyanosisOpenTex = twin.open;
              bodyMesh.userData.cyanosisClosedTex = twin.closed ?? baseClosed ?? null;
              bodyMesh.userData.eyesOpenTex = twin.open;
              bodyMesh.userData.eyesClosedTex = twin.closed ?? baseClosed ?? null;
              const showingClosed = mat.map === activeClosed || mat.map === previousClosed;
              mat.map = showingClosed ? (twin.closed ?? twin.open) : twin.open;
              mat.needsUpdate = true;
              cyanosisLocalAppliedRef.current = true;
              cyanosisLocalLevelRef.current = nextLevel;
              if (previousOpen instanceof THREE.CanvasTexture && previousOpen !== baseOpen && previousOpen !== twin.open) previousOpen.dispose();
              if (previousClosed instanceof THREE.CanvasTexture && previousClosed !== baseClosed && previousClosed !== twin.closed) previousClosed.dispose();
            }
          } else {
            const cleanOpen = (bodyMesh.userData.cyanosisBaseOpenTex as THREE.Texture | null) ?? null;
            const cleanClosed = (bodyMesh.userData.cyanosisBaseClosedTex as THREE.Texture | null) ?? null;
            const cyanosedOpen = bodyMesh.userData.cyanosisOpenTex as THREE.Texture | undefined;
            const cyanosedClosed = bodyMesh.userData.cyanosisClosedTex as THREE.Texture | null | undefined;
            const showingClosed = mat.map === cyanosedClosed;
            bodyMesh.userData.eyesOpenTex = cleanOpen;
            bodyMesh.userData.eyesClosedTex = cleanClosed;
            if (cleanOpen) {
              mat.map = showingClosed && cleanClosed ? cleanClosed : cleanOpen;
              mat.needsUpdate = true;
            }
            if (cyanosedOpen instanceof THREE.CanvasTexture && cyanosedOpen !== cleanOpen) cyanosedOpen.dispose();
            if (cyanosedClosed instanceof THREE.CanvasTexture && cyanosedClosed !== cleanClosed) cyanosedClosed.dispose();
            cyanosisLocalAppliedRef.current = false;
            cyanosisLocalLevelRef.current = 0;
            bodyMesh.userData.cyanosisBaseOpenTex = null;
            bodyMesh.userData.cyanosisBaseClosedTex = null;
          }
        }
      }
    }
  });

  // Registered after the main animation callback so it consumes this frame's
  // clinical morph weights; render callbacks also cover explicit render calls.
  useFrame(() => {
    if (!pilotEyelidScene) return;
    clonedScene.updateMatrixWorld(true);
    updateEyeMorphs();
  });

  const toClinicalPoint = useCallback((worldPoint: THREE.Vector3): THREE.Vector3 => {
    const point = worldPoint.clone();
    if (treatmentBayPresentation && meshRef.current) meshRef.current.worldToLocal(point);
    return point;
  }, [treatmentBayPresentation]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const point = toClinicalPoint(e.point);
    const region = getRegionAtPoint(point, !treatmentBayPresentation, patientScale);

    if (region !== hoveredRegion) {
      setHoveredRegion(region);
      updateMeshColors(region);
      document.body.style.cursor = region ? 'pointer' : 'auto';
    }
  }, [hoveredRegion, updateMeshColors, toClinicalPoint, treatmentBayPresentation, patientScale]);

  const handlePointerOut = useCallback(() => {
    setHoveredRegion(null);
    updateMeshColors(null);
    document.body.style.cursor = 'auto';
  }, [updateMeshColors]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // OrbitControls also ends a drag with a click. Rotating the patient is
    // not an examination and must not award assessment credit or move focus.
    if (e.delta > 5) return;
    // A tagged limb hit-box beats coordinate guessing — thin forearms are
    // nearly impossible to ray-hit honestly at the overview zoom.
    const limbHit = (e.intersections ?? [])
      .map(i => i.object.userData?.limbRegion as SecondaryAssessmentStep | undefined)
      .find(Boolean);
    if (limbHit) {
      lastClickedLimb = limbHit as LimbSide;
      if (guidedMode && nextGuidedStep && limbHit !== nextGuidedStep) {
        onBlockedClick?.(limbHit, nextGuidedStep);
        return;
      }
      const clinicalPoint = toClinicalPoint(e.point);
      const referencePoint = clinicalPoint.clone().multiplyScalar(1 / patientScale);
      if (onBodyPoint?.(referencePoint, limbHit)) return;
      onRegionClick(limbHit);
      return;
    }
    const clinicalPoint = toClinicalPoint(e.point);
    const region = getRegionAtPoint(clinicalPoint, !treatmentBayPresentation, patientScale);
    if (!region) return;

    // Phase 2 — in guided mode, block clicks on anything other than the
    // expected next step. Let the parent know so it can nudge the student.
    if (guidedMode && nextGuidedStep && region.id !== nextGuidedStep) {
      onBlockedClick?.(region.id, nextGuidedStep);
      return;
    }

    const referencePoint = clinicalPoint.clone().multiplyScalar(1 / patientScale);
    if (onBodyPoint?.(referencePoint, region.id)) return;
    onRegionClick(region.id);
  }, [onRegionClick, guidedMode, nextGuidedStep, onBlockedClick, onBodyPoint, toClinicalPoint, treatmentBayPresentation, patientScale]);

  // Render region highlight overlays using transparent cylinders
  const regionHighlights = useMemo(() => {
    // The big torus ring overlays were removed — they cluttered the view and
    // hid the patient. Region affordance now comes from the small landmark
    // dots (rendered by the parent) plus the hover tooltip. The legacy ring
    // builder below stays in place but is disabled by this guard.
    const ringsEnabled = false;
    const highlights: JSX.Element[] = [];
    if (!ringsEnabled) return highlights;
    const required = requiredRegions || new Set<string>();
    // Compute pulse opacity for amber ring
    const pulseOpacity = 0.15 + Math.sin(pulseRef.current * 3) * 0.1;
    // Phase 2 — stronger pulse for the guided "next" region so it really pops.
    const guidedPulseOpacity = 0.35 + Math.sin(pulseRef.current * 2.5) * 0.2;

    for (const region of REGION_RANGES) {
      if (region.condition === 'back') continue; // Don't show overlay for posterior

      const isLimbId = region.id === 'right-arm' || region.id === 'left-arm' || region.id === 'right-leg' || region.id === 'left-leg';
      const isAssessed = assessedRegions.has(region.id) || (isLimbId && assessedRegions.has('extremities'));
      const isHovered = hoveredRegion?.id === region.id;
      const isRequired = required.has(region.id);
      // Phase 2 — guided mode states
      const isGuidedNext = guidedMode && nextGuidedStep === region.id && !isAssessed;
      const isGuidedLocked = guidedMode && !!nextGuidedStep && region.id !== nextGuidedStep && !isAssessed;

      // Show highlights only when they are instructional: hovered,
      // required, guided next/locked, or assessed+required. Assessed-only
      // regions stay clean so focused face/airway views do not grow large
      // floating outlines over the patient.
      if (!isHovered && !isRequired && !isGuidedNext && !isGuidedLocked) continue;

      const height = region.yMax - region.yMin;
      const centerY = region.yMin + height / 2;
      const xOffset = (region as ExtendedRegionRange).xOffset || 0;
      // Width varies by body part — use custom radius if defined
      const radius = (region as ExtendedRegionRange).highlightRadius
        || (region.id === 'neck-cspine' ? 0.08
          : 0.18);

      // Determine color and opacity based on state
      let color: string;
      let opacity: number;

      if (isGuidedNext) {
        // Guided: indigo pulse on the current step, overrides other states
        color = GUIDED_NEXT_COLOR;
        opacity = isHovered ? 0.65 : guidedPulseOpacity;
      } else if (isGuidedLocked) {
        // Guided: dim grey wash on everything else — still visible so the
        // student can see where they'll go next, but obviously disabled.
        color = GUIDED_LOCKED_COLOR;
        opacity = 0.22;
      } else if (isAssessed && isRequired) {
        color = ASSESSED_COLOR;
        opacity = isHovered ? 0.5 : 0.35;
      } else if (isAssessed) {
        color = ASSESSED_COLOR;
        opacity = isHovered ? 0.45 : 0.25;
      } else if (isRequired && !isAssessed) {
        // Required but not yet assessed: pulsing amber
        color = REQUIRED_UNASSESSED_COLOR;
        opacity = isHovered ? 0.5 : pulseOpacity;
      } else {
        // Hovered: bright cyan
        color = HOVER_COLOR;
        opacity = 0.45;
      }

      const ringDepth = region.id === 'posterior-logroll' ? -0.36 : 0.42;
      const ringHeightScale = Math.max(0.72, Math.min(3.2, height / Math.max(radius * 2, 0.01)));

      highlights.push(
        <mesh
          key={region.id}
          position={[xOffset, centerY, ringDepth]}
          scale={[1, ringHeightScale, 1]}
          userData={{ skipRecolor: true }}
        >
          <torusGeometry args={[radius, 0.008, 8, 48]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={Math.min(opacity + 0.18, 0.72)}
            side={THREE.DoubleSide}
            depthWrite={false}
            emissive={color}
            emissiveIntensity={0.08}
          />
        </mesh>
      );

      // Phase 2B: Add emissive outline ring for required unassessed regions
      if (isRequired && !isAssessed && !isGuidedNext) {
        highlights.push(
          <mesh
            key={`${region.id}-ring`}
            position={[xOffset, centerY, ringDepth + 0.01]}
            scale={[1, ringHeightScale, 1]}
            userData={{ skipRecolor: true }}
          >
            <torusGeometry args={[radius + 0.012, 0.006, 8, 48]} />
            <meshStandardMaterial
              color={REQUIRED_UNASSESSED_COLOR}
              transparent
              opacity={pulseOpacity * 1.5}
              side={THREE.DoubleSide}
              depthWrite={false}
              emissive={REQUIRED_UNASSESSED_COLOR}
              emissiveIntensity={0.3 + Math.sin(pulseRef.current * 3) * 0.2}
            />
          </mesh>
        );
      }

      // Phase 2 — glowing indigo ring on the guided next step
      if (isGuidedNext) {
        highlights.push(
          <mesh
            key={`${region.id}-guided-ring`}
            position={[xOffset, centerY, ringDepth + 0.012]}
            scale={[1, ringHeightScale, 1]}
            userData={{ skipRecolor: true }}
          >
            <torusGeometry args={[radius + 0.018, 0.007, 8, 48]} />
            <meshStandardMaterial
              color={GUIDED_NEXT_COLOR}
              transparent
              opacity={0.5 + Math.sin(pulseRef.current * 2.5) * 0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
              emissive={GUIDED_NEXT_COLOR}
              emissiveIntensity={0.55 + Math.sin(pulseRef.current * 2.5) * 0.3}
            />
          </mesh>
        );
      }
    }

    return highlights;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessedRegions, hoveredRegion, requiredRegions, guidedMode, nextGuidedStep, pulseRef.current]);

  return (
    <group
      name="TreatmentBayPatientRoot"
      ref={meshRef}
      position={treatmentBayPresentation ? treatmentBayTransform.position : [0, 0, 0]}
      rotation={treatmentBayPresentation ? treatmentBayTransform.rotation : [0, 0, 0]}
      scale={treatmentBayPresentation ? treatmentBayTransform.scale : 1}
    >
      {/* Invisible "catch-all" plane behind the body. r3f only fires
          onPointerMove on the mesh the raycast hits, so moving the pointer
          from the body to empty canvas space left the hover state stuck.
          This plane sits behind the model and catches any pointer event
          that missed the anatomy — when it fires, we clear the hover.
          userData.skipRecolor keeps updateMeshColors from recolouring it
          (it has no emissive property → would throw). */}
      <mesh
        position={[0, 0.9, -1.5]}
        userData={{ skipRecolor: true }}
        onPointerMove={(e) => {
          e.stopPropagation();
          handlePointerOut();
        }}
      >
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {/* The actual model */}
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />

      {/* Procedural life loop — micro head sway + blink (pre-rendered lid
          texture swap). Unconscious patients lie still, eyes closed. */}
      <LifeSigns scene={clonedScene} unconscious={unconscious} />

      {/* Condition-responsive local morph motion — wince, shiver, gasp,
          tremor, seizure, agitation and chest clutch. The patient root is
          deliberately left planted on its support surface. */}
      <IdleAnimations
        scene={clonedScene}
        unconscious={unconscious}
        cues={idleCues}
        reduced={reduceIdleMotion}
      />

      {/* Region highlight overlays */}
      {regionHighlights}

      {/* The big black hover tooltip was removed \u2014 the small dot markers
          (rendered by the parent) already name each region/landmark on hover,
          so the bulky black label is redundant clutter. Hovering still sets
          the pointer cursor so the body reads as clickable. */}
    </group>
  );
}

// Preload only the compact legacy/adult baseline. Paediatric files are
// texture-rich 7–8 MB variants and load on demand through `useGLTF(modelPath)`;
// preloading the full age/sex matrix would add roughly 63 MB to every launch.
useGLTF.preload('/models/patient.glb');
useGLTF.preload('/models/patient-male.glb');
useGLTF.preload('/models/patient-female.glb');
// The reference-only corrective is loaded on demand, not by other scenarios.
ALL_GARMENT_GLBS.filter(g => g.url !== RESP001_GARMENT_GLBS[1].url)
  .forEach((g) => useGLTF.preload(g.url));
