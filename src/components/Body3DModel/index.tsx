/**
 * 3D Physical Examination
 *
 * Interactive patient examination frame.
 *
 * Clicking a body region zooms the mannequin and opens an in-frame exam tray:
 * technique choices, clinical maps, flow cues, and findings all remain inside
 * the patient area so the student stays oriented to the anatomy.
 */

import { useRef, useCallback, useState, useMemo, useEffect, Suspense } from 'react';
import type { CSSProperties, ElementRef, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Eye, Hand, Activity, Stethoscope, X, ChevronRight, ChevronDown, AlertTriangle, Compass, Unlock, Wind, Shirt } from 'lucide-react';
import { BodyMesh, getTreatmentBayTransform, treatmentBayClinicalToWorld, RESP001_SEATED_SUPPORT_LIFT, type BayPatientStage } from './BodyMesh';
import { getPilotAuscultationSteps, resolveAssessmentContact, startAuscultationSequence } from './assessmentContact';
import { createPalpationHandFit, PALPATION_FINGERS } from './palpationHandFit';
import { hasPainfulPalpationFinding } from './palpationReaction';
import { PilotIrisDetail, PupilLightExam, PupilLightControls } from './PupilLightExam';
import { getBreathingPattern, liveBreathingDepth } from '@/lib/breathingPresentation';
import { activeRespiratoryInterface, type OxygenVisualMode } from '@/lib/respiratoryEquipment';
import {
  deriveAppliedPatientStage,
  deriveHandGuardRegion,
  derivePatientMobility,
  derivePatientPosture,
  derivePatientSeatKind,
  derivePatientSupportSurface,
  deriveScenePatientStage,
  deriveTreatmentPositioningOverride,
  patientLoadedOnStretcher,
  patientLivePositionPresentation,
  type PatientMobility,
  type PatientPosture,
  type PatientSeatKind,
  type PatientSupportSurface,
} from '@/lib/patientStaging';
import { deriveSceneEnvironment, type EnvironmentVariant } from '@/lib/sceneEnvironment';
import { resolveSceneProfile } from './Environment/sceneProfile';
import { sceneEntryOrigin } from '@/lib/cinematicPhase';
import { cameraOrbitSafetyForEnvironment } from '@/lib/cameraOrbitSafety';
import {
  fallbackSceneAnchors,
  plantFromRestAnchor,
  type SceneAnchorSet,
} from '@/lib/sceneAnchors';
import type { LimbSide, SurfaceSampler } from './BodyMesh';
import { AdaptiveQuality, qualityForTier } from './AdaptiveQuality';
import { TreatmentBayEnvironment, CameraEntrance } from './Environment';
import { AmbientAudioLayer } from './AmbientAudioLayer';
import { ConversationFocus } from './ConversationFocus';
import type { AmbientBreathKind } from '@/lib/ambientAudio';
import type { QualityTier } from './AdaptiveQuality';
import { AnatomyReferenceLayer } from './AnatomyReferenceLayer';
import {
  floorOverviewFov,
  floorOverviewMaxDistance,
  floorOverviewMinPolarAngle,
  resolveTreatmentBayActionTarget,
  treatmentBayFloorOverviewOffset,
  treatmentBayActionFramingRadius,
} from './cameraFraming';
import {
  getFittedFaceEquipmentSpec,
  type FittedFaceEquipmentMode,
} from './faceEquipment';
import { PilotRespiratoryMask3D } from './PilotRespiratoryMask3D';
import { PilotMaskStrap3D } from './PilotMaskStrap3D';
import { pilotRespiratoryMaskGeometry } from './pilotRespiratoryMaskGeometry';
import { recommendedManagementTabForCase, type ManagementTab } from '@/components/TreatmentJumpBagPanel';
import { CLOTHING_PARTING } from './ClothingLayer';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { useBedsideConversation } from '@/hooks/useBedsideConversation';
import { derivePatientCommunication, type PatientCommunicationInput } from '@/lib/patientCommunication';
import { getNextGuidedStep, EXAM_SEQUENCE } from './bodyRegions';
import { useTranslation } from 'react-i18next';
import type { AssessmentStepId, SecondaryAssessmentStep } from '@/data/assessmentFramework';
import { getAssessmentProfile, getOxygenationAppearanceFinding } from '@/data/assessmentFramework';
import type { CaseScenario, CaseCategory, VitalSigns } from '@/types';
import type { ClinicalSoundState } from '@/data/clinicalSounds';
import { playBreathSound, playHeartSound, playPercussionSound, playBowelSound, stopAllSounds, getZoneBreathSound } from '@/data/clinicalSounds';
import type { BowelSoundType, BreathSoundType } from '@/data/clinicalSounds';
import { inferInjuries, injuryRegionTo3D, injuryWorldOffsetX, type BodyInjury, type BodyRegion, type InjuryKind, type InjurySeverity } from '@/lib/injuryMap';
import { classifyBodyPoint } from '@/lib/regionClassifier';
import {
  applyVisualEyeEffect,
  describePupilFinding,
  getPupilProfile,
  isPupilExamAction,
  nearestPupilExamAction,
  type PupilProfile,
} from '@/lib/pupilExam';
import { ActiveBleedSprites } from './ActiveBleedLayer';
import { FocusedWoundLayer } from './FocusedWoundLayer';
import type { PatientVisualState, PatientWoundOverlay } from '@/lib/patientVisualState';
import { deriveIdleCues } from '@/lib/idleCues';
import {
  deriveAppliedTreatmentRealismCues,
  deriveCaseRealismProfile,
  shouldRevealRealismCue,
  type PatientRealismCue,
  type PatientRealismProfile,
  type RealismSeverity,
} from '@/data/clinicalRealism';
import {
  deriveUnwellness,
  collectUnwellnessText,
  type UnwellnessState,
} from '@/lib/unwellnessStates';
import { deriveSkinTint, deriveCyanosisLocalStrength } from './skinTint';
import { hasAttachedDefibrillatorPads } from '@/lib/defibrillatorSafety';
import { patientAgeShortLabel, patientExpectedHeightMetres } from '@/lib/patientAgePresentation';

const TOTAL_REGIONS = 11;
type OrbitControlsHandle = ElementRef<typeof OrbitControls>;

// Dev/capture-only forced unwellness state so the capture harness can
// screenshot each state deterministically (the case library has no
// hepatic/jaundice-text case). Two hurdles make a naive `location.search` read
// unreliable: the app strips the query string on mount (useEducatorPanel URL
// management), AND this component ships in a lazily-loaded chunk that only
// executes at scene entry — by then the URL is already clean. So the capture
// harness stashes `?unwell=…` into sessionStorage before any app script runs
// (scripts/capture-model.mjs addInitScript); we read the live param first, then
// fall back to that seed. Never consulted in a production build.
function readForcedUnwell(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const live = new URLSearchParams(window.location.search).get('unwell');
    if (live) return live;
    return window.sessionStorage.getItem('captureUnwell');
  } catch {
    return null;
  }
}
const CAPTURE_FORCED_UNWELL: string | null = readForcedUnwell();

function readForcedSpo2(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const live = new URLSearchParams(window.location.search).get('spo2');
    if (live) return Number(live);
    const seed = window.sessionStorage.getItem('captureSpo2');
    return seed ? Number(seed) : null;
  } catch {
    return null;
  }
}
/** Helper: is this a limb region ID? */
const isLimbRegion = (id: string): boolean =>
  id === 'right-arm' || id === 'left-arm' || id === 'right-leg' || id === 'left-leg';

interface ExamLandmark {
  id: string;
  region: SecondaryAssessmentStep;
  label: string;
  sublabel: string;
  position: [number, number, number];
  level: 'overview' | 'detail';
  actionId?: string;
  tone?: 'neutral' | 'airway' | 'breathing' | 'circulation' | 'abdomen' | 'neuro' | 'warning';
  anchorSpace?: 'author' | 'mesh';
}

interface OxygenEquipmentVisual {
  mode: OxygenVisualMode;
  label: string;
  detail: string;
}

type AppliedProcedureSite = BodyRegion | 'right-chest' | 'left-chest';

interface AppliedEquipmentVisualState {
  oxygen: OxygenEquipmentVisual | null;
  hasIvAccess: boolean;
  hasFluids: boolean;
  hasDefibPads: boolean;
  hasLucas: boolean;
  hasEtTube: boolean;
  hasOpa: boolean;
  hasCollar: boolean;
  hasChestSeal: boolean;
  hasNeedleDecompression: boolean;
  hasPelvicBinder: boolean;
  hasSurgicalAirway: boolean;
  hasGastricTube: boolean;
  hasPericardialDrain: boolean;
  hasTemperatureControl: boolean;
  hasWarmingBlanket: boolean;
  hasActiveCooling: boolean;
  hasCompletedDelivery: boolean;
  immobilisationDevice: 'spinal-board' | 'scoop' | 'vacuum-mattress' | 'head-blocks' | 'ked' | null;
  siteControls: Array<{ treatmentId: string; target: AppliedProcedureSite }>;
  /** Bleeding wound ids considered under source control (tourniquet /
   *  pressure dressing / haemostatic / chest seal applied). */
  controlledBleedIds: Set<string>;
}

const TREATMENT_ASSET_PATHS = {
  nasal: '/equipment-assets/nasal-cannula.webp',
  simpleMask: '/equipment-assets/oxygen-mask-front.webp',
  nonrebreather: '/equipment-assets/nonrebreather-mask-v2.webp',
  nebulizer: '/equipment-assets/nebulizer-mask-v2.webp',
  bvm: '/equipment-assets/bvm.webp',
  bvmFaceSeal: '/equipment-assets/bvm-face-seal-v2.png',
  cpap: '/equipment-assets/cpap-mask-front-v2.png',
  ventilator: '/equipment-assets/ett-ventilator-connected-v3.png',
  ivCannula: '/treatment-assets/iv-cannula.svg',
  fluidBag: '/treatment-assets/fluid-bag.svg',
  defibPads: '/treatment-assets/defib-pads.svg',
  defibPadSternal: '/equipment-assets/defib-pad-sternal.webp',
  defibPadApical: '/equipment-assets/defib-pad-apical.webp',
  lucas: '/equipment-assets/lucas-device.webp',
  etTube: '/equipment-assets/et-tube.webp',
  etTubeSecured: '/equipment-assets/ett-secured-front-v2.png',
  opa: '/equipment-assets/opa-set.webp',
  opaFlange: '/equipment-assets/opa-flange-front-v2.png',
  ivPole: '/treatment-assets/iv-pole.svg',
  collar: '/equipment-assets/cervical-collar.webp',
  collarFitted: '/equipment-assets/cervical-collar-fitted-front-v2.png',
  bandage: '/equipment-assets/bandages.webp',
  pressureDressing: '/equipment-assets/pressure-dressing-fitted-front-v2.png',
  tourniquet: '/equipment-assets/tourniquet.webp',
  suction: '/equipment-assets/portable-suction.webp',
  needle: '/equipment-assets/needle-decompression.webp',
  pelvicBinder: '/equipment-assets/pelvic-binder.svg',
  fonaKit: '/equipment-assets/fona-kit.svg',
  gastricTubeKit: '/equipment-assets/gastric-tube-kit.svg',
  pericardiocentesisKit: '/equipment-assets/pericardiocentesis-kit.svg',
  temperatureControlPads: '/equipment-assets/temperature-control-pads.svg',
  warmingBlanket: '/equipment-assets/warming-blanket.webp',
  coolingPack: '/equipment-assets/cooling-pack.webp',
  deliveryKit: '/equipment-assets/delivery-kit.webp',
  newbornSwaddled: '/equipment-assets/newborn-swaddled.webp',
  spineBoard: '/equipment-assets/spine-board.webp',
  scoop: '/equipment-assets/scoop-stretcher.webp',
  vacuumMattress: '/equipment-assets/vacuum-mattress.webp',
  headBlocks: '/equipment-assets/head-blocks.webp',
  ked: '/equipment-assets/ked-extrication-device.webp',
} as const;

const BODY_REGION_DIAGRAM_ANCHOR: Record<BodyRegion, { x: number; y: number }> = {
  head: { x: 50, y: 8 },
  face: { x: 50, y: 10 },
  neck: { x: 50, y: 17 },
  airway: { x: 50, y: 15 },
  chest: { x: 50, y: 30 },
  abdomen: { x: 50, y: 44 },
  pelvis: { x: 50, y: 53 },
  'right-arm': { x: 28, y: 40 },
  'left-arm': { x: 72, y: 40 },
  'right-leg': { x: 43, y: 76 },
  'left-leg': { x: 57, y: 76 },
  back: { x: 50, y: 32 },
};

function visualRegionToBodyRegion(region: PatientWoundOverlay['region']): BodyRegion | null {
  switch (region) {
    case 'face':
    case 'mouth':
    case 'nose':
      return 'face';
    case 'neck':
      return 'neck';
    case 'chest':
      return 'chest';
    case 'pelvis':
      return 'pelvis';
    case 'left-arm':
    case 'right-arm':
    case 'left-leg':
    case 'right-leg':
      return region;
    case 'posterior':
      return 'back';
    case 'scene':
      return null;
    default:
      return 'chest';
  }
}

/**
 * Some scenario signs are painted ON the skin but are not wounds, so they never
 * reached the wound-overlay path — and the 3D layer only reads pallor,
 * cyanosis, diaphoresis and mottling out of skinEffects. They were declared,
 * adapted, and invisible. Route them through the same decal pipeline.
 */
const SKIN_DECAL_INJURIES: Record<string, { kind: BodyInjury['kind']; label: string; fallback: string }> = {
  rash: {
    kind: 'rash',
    label: 'Urticaria',
    fallback: 'Raised weals on an erythematous flare.',
  },
  soot: {
    kind: 'soot',
    label: 'Soot',
    fallback: 'Soot deposits around the nose and mouth — suspect inhalation injury.',
  },
};

function buildScenarioSkinDecalInjuries(visualState?: PatientVisualState | null): BodyInjury[] {
  return (visualState?.skinEffects ?? [])
    .flatMap((effect, index): BodyInjury[] => {
      const spec = SKIN_DECAL_INJURIES[effect.kind];
      if (!spec) return [];
      const region = visualRegionToBodyRegion(effect.region);
      if (!region) return [];
      const anchor = BODY_REGION_DIAGRAM_ANCHOR[region];
      return [{
        id: `scenario-${effect.kind}-${effect.region}-${index}`,
        region,
        kind: spec.kind,
        label: spec.label,
        detail: effect.detail || spec.fallback,
        severity: effect.intensity >= 0.66 ? 'major' : 'minor',
        x: anchor.x,
        y: anchor.y,
      }];
    });
}

function buildScenarioBodyInjuries(visualState?: PatientVisualState | null): BodyInjury[] {
  const decals = buildScenarioSkinDecalInjuries(visualState);
  if (!visualState?.woundOverlays.length) return decals;

  return decals.concat(visualState.woundOverlays.flatMap((overlay, index): BodyInjury[] => {
    const region = visualRegionToBodyRegion(overlay.region);
    if (!region) return [];
    const kind: BodyInjury['kind'] | null =
      overlay.kind === 'open_wound' ? 'wound'
      : overlay.kind === 'active_bleeding' ? null
      : overlay.kind === 'blood_pool' ? 'bleeding'
      : overlay.kind === 'deformity' ? 'deformity'
      : overlay.kind === 'burn_pattern' ? 'burn'
      : null;
    if (!kind) return [];

    const anchor = BODY_REGION_DIAGRAM_ANCHOR[region];
    const label =
      overlay.kind === 'open_wound' ? 'Open wound'
      : overlay.kind === 'active_bleeding' ? 'Bleeding'
      : overlay.kind === 'blood_pool' ? 'Blood'
      : overlay.kind === 'deformity' ? 'Deformity'
      : 'Burn';

    return [{
      id: `scenario-${overlay.kind}-${overlay.region}-${index}`,
      region,
      kind,
      label,
      detail: overlay.detail,
      severity: overlay.kind === 'open_wound' || overlay.kind === 'active_bleeding' || overlay.kind === 'burn_pattern'
        ? 'critical'
        : 'major',
      x: anchor.x,
      y: anchor.y,
    }];
  }));
}

function skinEffectStrength(visualState: PatientVisualState | null | undefined, kind: PatientVisualState['skinEffects'][number]['kind']): number {
  return Math.max(0, ...((visualState?.skinEffects ?? [])
    .filter(effect => effect.kind === kind)
    .map(effect => effect.intensity)));
}

type AbdomenQuadrant = 'ruq' | 'luq' | 'rlq' | 'llq';

const ABDOMEN_QUADRANTS: Array<{ id: AbdomenQuadrant; label: string; full: string; hint: string }> = [
  { id: 'ruq', label: 'RUQ', full: 'Right upper quadrant', hint: 'liver, gallbladder' },
  { id: 'luq', label: 'LUQ', full: 'Left upper quadrant', hint: 'stomach, spleen' },
  { id: 'rlq', label: 'RLQ', full: 'Right lower quadrant', hint: 'appendix, pelvis' },
  { id: 'llq', label: 'LLQ', full: 'Left lower quadrant', hint: 'colon, pelvis' },
];

// Anchors measured from the ACTUAL decoded mesh (scripts/measure-anatomy.cjs)
// in the exact in-app frame: feet Y=0, head Y≈1.8, centred on X/Z, anatomical
// front at +Z (camera side). The body's front surface sits at only z ≈ 0.16
// (face/chest) to 0.22 (belly) — NOT 0.3+ — so anything past ~0.25 floats in
// the air in front of the patient. The arms hang at the sides: although the
// upper arm's OUTER edge reaches ±0.49, the camera-FACING surface of the whole
// arm (shoulder→hand) sits at only x ≈ ±0.13–0.15, so arm dots belong there,
// not splayed out to ±0.3. The legs are slightly apart — the leg front runs
// from x ≈ ±0.15 (thigh) out to ±0.20 (ankle/foot). These positions sit just
// proud of the real camera-facing surface; the surface sampler then snaps z
// (and lightly rescales x for non-reference models).
const EXAM_LANDMARKS: ExamLandmark[] = [
  { id: 'eyes-overview', region: 'face', label: 'Face / eyes', sublabel: 'Look — pupils, lips, speech', position: [0.0, 1.62, 0.20], level: 'overview', tone: 'neuro' },
  { id: 'airway-overview', region: 'neck-cspine', label: 'Airway / neck', sublabel: 'Look & listen — mouth, trachea, JVD', position: [0.0, 1.46, 0.22], level: 'overview', tone: 'airway' },
  { id: 'chest-overview', region: 'chest', label: 'Chest', sublabel: 'Look · Listen · Feel — rise, lungs, wall', position: [0.02, 1.27, 0.20], level: 'overview', tone: 'breathing' },
  { id: 'abdomen-overview', region: 'abdomen', label: 'Abdomen', sublabel: 'Look · Listen · Feel — quadrants', position: [0.03, 1.02, 0.24], level: 'overview', tone: 'abdomen' },
  // Minimal anatomical pulse points — click to check (works from any view).
  // (Removed the duplicate 'radial-overview' dot that sat ~2 cm from
  // 'pulse-radial-r' on the same wrist — it created the cluttered arm cluster.)
  { id: 'pulse-carotid', region: 'neck-cspine', label: 'Right carotid', sublabel: 'central pulse', position: [-0.11, 1.42, 0.19], level: 'overview', actionId: 'pulse-carotid-right', tone: 'circulation' },
  { id: 'pulse-radial-r', region: 'right-arm', label: 'Right radial', sublabel: 'wrist pulse + CRT', position: [-0.135, 0.81, 0.18], level: 'overview', actionId: 'pulse-radial-right', tone: 'circulation' },
  { id: 'pulse-radial-l', region: 'left-arm', label: 'Left radial', sublabel: 'wrist pulse + CRT', position: [0.135, 0.81, 0.18], level: 'overview', actionId: 'pulse-radial-left', tone: 'circulation' },
  { id: 'pedal-overview-r', region: 'right-leg', label: 'Right pedal', sublabel: 'DP / PT + CRT', position: [-0.20, 0.13, 0.18], level: 'overview', actionId: 'pulse-pedal-right', tone: 'circulation' },
  { id: 'pedal-overview-l', region: 'left-leg', label: 'Left pedal', sublabel: 'DP / PT + CRT', position: [0.20, 0.13, 0.18], level: 'overview', actionId: 'pulse-pedal-left', tone: 'circulation' },
  { id: 'posterior-overview', region: 'posterior-logroll', label: 'Posterior', sublabel: 'log roll / spine', position: [0.0, 1.10, -0.20], level: 'overview', tone: 'neutral' },

  // Facial landmarks: x/y are tuned to sit ON the painted features (eyes/lips)
  // of the actual mesh — the sampler only corrects depth (z), so these x/y are
  // the calibration knob. Nudge here if a dot drifts off its feature.
  // x/y computed from the model's own eye-socket texels via UV→geometry
  // (scripts/calibrate-face.cjs) — deterministic, not eyeballed. The sampler
  // overrides z to sit each dot on the real surface. Re-run that script if the
  // patient mesh/texture ever changes.
  { id: 'right-eye', region: 'face', label: 'Right eye', sublabel: 'pupil size, reactivity', position: [-0.029, 1.55, 0.16], level: 'detail', actionId: 'pupils-size', tone: 'neuro', anchorSpace: 'mesh' },
  { id: 'left-eye', region: 'face', label: 'Left eye', sublabel: 'compare equality', position: [0.029, 1.55, 0.16], level: 'detail', actionId: 'pupils-equality', tone: 'neuro', anchorSpace: 'mesh' },
  { id: 'nose-detail', region: 'face', label: 'Nose', sublabel: 'CSF, bleeding, deformity', position: [0, 1.515, 0.16], level: 'detail', actionId: 'nose-inspect', tone: 'neutral', anchorSpace: 'mesh' },
  { id: 'mouth-detail', region: 'face', label: 'Mouth / lips', sublabel: 'cyanosis, secretions, tongue', position: [0, 1.478, 0.165], level: 'detail', actionId: 'mouth-inspect', tone: 'airway', anchorSpace: 'mesh' },
  // Carotid pulse points sit on the neck, lateral to the midline — tappable
  // from the face zoom so students feel the central pulse on the patient
  // (not the monitor). Side-specific carotid actions fire onPulse from either detail view.
  { id: 'face-carotid-r', region: 'face', label: 'Right carotid', sublabel: 'central pulse', position: [-0.082, 1.505, 0.175], level: 'detail', actionId: 'pulse-carotid-right', tone: 'circulation' },
  { id: 'face-carotid-l', region: 'face', label: 'Left carotid', sublabel: 'central pulse', position: [0.082, 1.505, 0.175], level: 'detail', actionId: 'pulse-carotid-left', tone: 'circulation' },

  { id: 'trachea-detail', region: 'neck-cspine', label: 'Trachea', sublabel: 'midline / deviated', position: [0, 1.44, 0.22], level: 'detail', actionId: 'trachea-palpate', tone: 'airway' },
  { id: 'jvd-detail', region: 'neck-cspine', label: 'JVD', sublabel: 'neck veins', position: [0.09, 1.47, 0.19], level: 'detail', actionId: 'jvd-inspect', tone: 'circulation' },
  { id: 'cspine-detail', region: 'neck-cspine', label: 'C-spine', sublabel: 'midline tenderness', position: [0, 1.49, -0.12], level: 'detail', actionId: 'cspine-palpate', tone: 'warning' },

  { id: 'lung-ru', region: 'chest', label: 'R upper zone', sublabel: 'right apex / upper field', position: [-0.09, 1.34, 0.205], level: 'detail', actionId: 'chest-auscultate-ru', tone: 'breathing' },
  { id: 'lung-rl', region: 'chest', label: 'R lower zone', sublabel: 'right base', position: [-0.10, 1.22, 0.205], level: 'detail', actionId: 'chest-auscultate-rl', tone: 'breathing' },
  { id: 'lung-lu', region: 'chest', label: 'L upper zone', sublabel: 'left apex / upper field', position: [0.09, 1.34, 0.205], level: 'detail', actionId: 'chest-auscultate-lu', tone: 'breathing' },
  { id: 'lung-ll', region: 'chest', label: 'L lower zone', sublabel: 'left base', position: [0.10, 1.22, 0.205], level: 'detail', actionId: 'chest-auscultate-ll', tone: 'breathing' },
  { id: 'sternum-detail', region: 'chest', label: 'Chest wall', sublabel: 'tenderness, crepitus, flail', position: [0, 1.245, 0.215], level: 'detail', actionId: 'chest-palpate', tone: 'warning' },
  { id: 'heart-detail', region: 'chest', label: 'Heart', sublabel: 'aortic, pulmonic, apex', position: [0.05, 1.165, 0.215], level: 'detail', actionId: 'chest-auscultate-heart', tone: 'circulation' },

  { id: 'ruq-detail', region: 'abdomen', label: 'RUQ', sublabel: 'liver / gallbladder', position: [-0.095, 1.085, 0.245], level: 'detail', actionId: 'abd-ruq-auscultate', tone: 'abdomen' },
  { id: 'luq-detail', region: 'abdomen', label: 'LUQ', sublabel: 'stomach / spleen', position: [0.095, 1.085, 0.245], level: 'detail', actionId: 'abd-luq-auscultate', tone: 'abdomen' },
  { id: 'rlq-detail', region: 'abdomen', label: 'RLQ', sublabel: 'appendix / pelvis', position: [-0.095, 0.985, 0.245], level: 'detail', actionId: 'abd-rlq-auscultate', tone: 'abdomen' },
  { id: 'llq-detail', region: 'abdomen', label: 'LLQ', sublabel: 'colon / pelvis', position: [0.095, 0.985, 0.245], level: 'detail', actionId: 'abd-llq-auscultate', tone: 'abdomen' },
  { id: 'umbilicus-detail', region: 'abdomen', label: 'Umbilicus', sublabel: 'distension / bruising', position: [0, 1.035, 0.255], level: 'detail', actionId: 'abd-inspect', tone: 'abdomen' },

  // ===== HEAD (cranium — face/eyes/mouth live on the separate 'face' region) =====
  { id: 'scalp-detail', region: 'head', label: 'Scalp', sublabel: 'lacerations, haematoma', position: [-0.02, 1.79, 0.12], level: 'detail', actionId: 'scalp-inspect', tone: 'warning' },
  { id: 'skull-detail', region: 'head', label: 'Skull', sublabel: 'deformity, step, boggy', position: [0.03, 1.73, 0.16], level: 'detail', actionId: 'scalp-palpate', tone: 'warning' },
  { id: 'ear-right-detail', region: 'head', label: 'R ear', sublabel: 'Battle sign, CSF otorrhoea', position: [-0.135, 1.66, 0.05], level: 'detail', actionId: 'ears-inspect', tone: 'neutral' },
  { id: 'ear-left-detail', region: 'head', label: 'L ear', sublabel: 'Battle sign, CSF otorrhoea', position: [0.135, 1.66, 0.05], level: 'detail', actionId: 'ears-inspect', tone: 'neutral' },

  // ===== RIGHT ARM (patient's right = camera-left = negative X) =====
  { id: 'r-shoulder-detail', region: 'right-arm', label: 'Shoulder', sublabel: 'clavicle, ROM', position: [-0.15, 1.39, 0.18], level: 'detail', actionId: 'r-shoulder-palpate', tone: 'warning' },
  { id: 'r-humerus-detail', region: 'right-arm', label: 'Upper arm', sublabel: 'humerus, deformity', position: [-0.145, 1.12, 0.16], level: 'detail', actionId: 'r-humerus-palpate', tone: 'warning' },
  { id: 'r-elbow-detail', region: 'right-arm', label: 'Elbow', sublabel: 'effusion, ROM', position: [-0.14, 0.95, 0.19], level: 'detail', actionId: 'r-elbow-palpate', tone: 'warning' },
  { id: 'r-forearm-detail', region: 'right-arm', label: 'Forearm', sublabel: 'radius / ulna', position: [-0.145, 0.88, 0.19], level: 'detail', actionId: 'r-forearm-palpate', tone: 'warning' },
  { id: 'r-wrist-detail', region: 'right-arm', label: 'Wrist', sublabel: 'radial pulse, CRT', position: [-0.135, 0.81, 0.18], level: 'detail', actionId: 'r-arm-pulses', tone: 'circulation' },
  { id: 'r-hand-detail', region: 'right-arm', label: 'Hand', sublabel: 'grip, sensation, digits', position: [-0.15, 0.72, 0.17], level: 'detail', actionId: 'r-hand-palpate', tone: 'neuro' },

  // ===== LEFT ARM (patient's left = camera-right = positive X) =====
  { id: 'l-shoulder-detail', region: 'left-arm', label: 'Shoulder', sublabel: 'clavicle, ROM', position: [0.15, 1.39, 0.18], level: 'detail', actionId: 'l-shoulder-palpate', tone: 'warning' },
  { id: 'l-humerus-detail', region: 'left-arm', label: 'Upper arm', sublabel: 'humerus, deformity', position: [0.145, 1.12, 0.16], level: 'detail', actionId: 'l-humerus-palpate', tone: 'warning' },
  { id: 'l-elbow-detail', region: 'left-arm', label: 'Elbow', sublabel: 'effusion, ROM', position: [0.14, 0.95, 0.19], level: 'detail', actionId: 'l-elbow-palpate', tone: 'warning' },
  { id: 'l-forearm-detail', region: 'left-arm', label: 'Forearm', sublabel: 'radius / ulna', position: [0.145, 0.88, 0.19], level: 'detail', actionId: 'l-forearm-palpate', tone: 'warning' },
  { id: 'l-wrist-detail', region: 'left-arm', label: 'Wrist', sublabel: 'radial pulse, CRT', position: [0.135, 0.81, 0.18], level: 'detail', actionId: 'l-arm-pulses', tone: 'circulation' },
  { id: 'l-hand-detail', region: 'left-arm', label: 'Hand', sublabel: 'grip, sensation, digits', position: [0.15, 0.72, 0.17], level: 'detail', actionId: 'l-hand-palpate', tone: 'neuro' },

  // ===== RIGHT LEG (upper thigh → foot) =====
  { id: 'r-hip-detail', region: 'right-leg', label: 'Hip', sublabel: 'shortening, rotation', position: [-0.14, 0.88, 0.19], level: 'detail', actionId: 'r-hip-palpate', tone: 'warning' },
  { id: 'r-thigh-detail', region: 'right-leg', label: 'Upper thigh', sublabel: 'femur, quadriceps', position: [-0.15, 0.70, 0.18], level: 'detail', actionId: 'r-femur-palpate', tone: 'warning' },
  { id: 'r-knee-detail', region: 'right-leg', label: 'Knee', sublabel: 'patella, effusion', position: [-0.165, 0.46, 0.18], level: 'detail', actionId: 'r-knee-palpate', tone: 'warning' },
  { id: 'r-shin-detail', region: 'right-leg', label: 'Lower leg', sublabel: 'tibia, compartments', position: [-0.18, 0.31, 0.19], level: 'detail', actionId: 'r-tibia-palpate', tone: 'warning' },
  { id: 'r-ankle-detail', region: 'right-leg', label: 'Ankle', sublabel: 'malleoli, oedema', position: [-0.20, 0.17, 0.18], level: 'detail', actionId: 'r-ankle-palpate', tone: 'warning' },
  { id: 'r-foot-detail', region: 'right-leg', label: 'Foot', sublabel: 'pedal pulse, CRT', position: [-0.20, 0.06, 0.18], level: 'detail', actionId: 'r-leg-pulses', tone: 'circulation' },

  // ===== LEFT LEG (upper thigh → foot) =====
  { id: 'l-hip-detail', region: 'left-leg', label: 'Hip', sublabel: 'shortening, rotation', position: [0.14, 0.88, 0.19], level: 'detail', actionId: 'l-hip-palpate', tone: 'warning' },
  { id: 'l-thigh-detail', region: 'left-leg', label: 'Upper thigh', sublabel: 'femur, quadriceps', position: [0.15, 0.70, 0.18], level: 'detail', actionId: 'l-femur-palpate', tone: 'warning' },
  { id: 'l-knee-detail', region: 'left-leg', label: 'Knee', sublabel: 'patella, effusion', position: [0.165, 0.46, 0.18], level: 'detail', actionId: 'l-knee-palpate', tone: 'warning' },
  { id: 'l-shin-detail', region: 'left-leg', label: 'Lower leg', sublabel: 'tibia, compartments', position: [0.18, 0.31, 0.19], level: 'detail', actionId: 'l-tibia-palpate', tone: 'warning' },
  { id: 'l-ankle-detail', region: 'left-leg', label: 'Ankle', sublabel: 'malleoli, oedema', position: [0.20, 0.17, 0.18], level: 'detail', actionId: 'l-ankle-palpate', tone: 'warning' },
  { id: 'l-foot-detail', region: 'left-leg', label: 'Foot', sublabel: 'pedal pulse, CRT', position: [0.20, 0.06, 0.18], level: 'detail', actionId: 'l-leg-pulses', tone: 'circulation' },

  // ===== PELVIS =====
  { id: 'pelvis-right-detail', region: 'pelvis', label: 'R iliac crest', sublabel: 'spring test', position: [-0.14, 0.93, 0.18], level: 'detail', actionId: 'pelvis-palpate', tone: 'warning' },
  { id: 'pelvis-left-detail', region: 'pelvis', label: 'L iliac crest', sublabel: 'spring test', position: [0.14, 0.93, 0.18], level: 'detail', actionId: 'pelvis-palpate', tone: 'warning' },
  { id: 'pelvis-symphysis-detail', region: 'pelvis', label: 'Symphysis', sublabel: 'deformity, bruising', position: [0, 0.86, 0.21], level: 'detail', actionId: 'pelvis-inspect', tone: 'abdomen' },
];

// Contact calibration for the resp-001 reference adult. Keep other patient
// models unchanged until their anatomy has been visually calibrated as well.
const RESP001_CONTACT_POSITIONS: Record<string, [number, number, number]> = {
  'lung-ru': [-0.09, 1.42, 0.205],
  'lung-rl': [-0.12, 1.31, 0.205],
  'lung-lu': [0.09, 1.42, 0.205],
  'lung-ll': [0.12, 1.31, 0.205],
  'sternum-detail': [0, 1.37, 0.215],
  'heart-detail': [0.06, 1.34, 0.215],
  'ruq-detail': [-0.075, 1.205, 0.245],
  'luq-detail': [0.075, 1.205, 0.245],
  'rlq-detail': [-0.075, 1.095, 0.245],
  'llq-detail': [0.075, 1.095, 0.245],
  'umbilicus-detail': [0, 1.15, 0.255],
};
const RESP001_VILLA_RUG_TOP_Y = 0.032;
const RESP001_EXAM_LANDMARKS = EXAM_LANDMARKS.map(marker => ({
  ...marker, position: RESP001_CONTACT_POSITIONS[marker.id] ?? marker.position,
}));

function SceneCable({
  points,
  color,
  opacity = 0.62,
  radius = 0.005,
  anchor,
}: {
  points: Array<[number, number, number]>;
  color: string;
  opacity?: number;
  radius?: number;
  anchor?: { frame: THREE.Object3D; points: Array<[number, number, number] | null> };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dynamicGeometry = useRef<THREE.TubeGeometry | null>(null);
  const elapsed = useRef(0);
  const lastAnchorMatrix = useRef(new THREE.Matrix4());
  const lastPathKey = useRef('');
  const pointsKey = points.map(point => point.join(',')).join('|');
  const pathKey = `${pointsKey}:${radius}:${anchor?.points.map(point => point?.join(',') ?? 'world').join('|') ?? ''}`;
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, 28, radius, 8, false);
    // pointsKey is the stable scalar dependency; `points` is usually an inline array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => { dynamicGeometry.current?.dispose(); }, []);

  useFrame((_, delta) => {
    if (!anchor || !meshRef.current) return;
    elapsed.current += delta;
    if (elapsed.current < 1 / 15) return;
    elapsed.current = 0;
    anchor.frame.updateWorldMatrix(true, false);
    // Replacing a mask changes the circuit exit even when the patient's head
    // has not moved. Comparing only the matrix leaves the new tube unposed.
    if (lastPathKey.current === pathKey && lastAnchorMatrix.current.equals(anchor.frame.matrixWorld)) return;
    lastPathKey.current = pathKey;
    lastAnchorMatrix.current.copy(anchor.frame.matrixWorld);
    const path = points.map((point, index) => anchor.points[index]
      ? new THREE.Vector3(...anchor.points[index]!).applyMatrix4(anchor.frame.matrixWorld)
      : new THREE.Vector3(...point));
    const next = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 28, radius, 8, false);
    dynamicGeometry.current?.dispose();
    dynamicGeometry.current = next;
    meshRef.current.geometry = next;
  });

  return (
    <mesh name={anchor ? 'patient-anchored-circuit' : undefined} ref={meshRef} geometry={geometry} raycast={() => null} userData={{ skipRecolor: true }}>
      <meshStandardMaterial color={color} roughness={0.38} metalness={0.08} transparent opacity={opacity} />
    </mesh>
  );
}

function TreatmentBayImmersionLayer({
  appliedTreatmentIds,
  active,
  stage = 'stretcher',
  supportSurface = 'stretcher',
  posture = null,
  mobility = 'recumbent',
  patientScale = 1,
  faceAttachment = null,
  showWallMonitor = true,
  seatedSupportLift = 0,
  equipmentGroundY = -0.045,
  plantOffset,
}: {
  appliedTreatmentIds: string[];
  active: boolean;
  stage?: BayPatientStage;
  supportSurface?: PatientSupportSurface;
  posture?: PatientPosture;
  mobility?: PatientMobility;
  patientScale?: number;
  faceAttachment?: THREE.Group | null;
  showWallMonitor?: boolean;
  seatedSupportLift?: number;
  equipmentGroundY?: number;
  plantOffset?: { x?: number; z?: number };
}) {
  const equipment = useMemo(
    () => buildTreatmentEquipmentState(appliedTreatmentIds),
    [appliedTreatmentIds],
  );

  if (!active) return null;

  const clinicalPoint = (point: [number, number, number]) =>
    treatmentBayClinicalToWorld(point, stage, posture, mobility, patientScale, seatedSupportLift, plantOffset);
  const fittedFaceSpec = getFittedFaceEquipmentSpec(equipment.oxygen?.mode);
  // Each fitted photo texture already contains a short circuit tail. Continue
  // the world-space tube from that device-specific exit so it reads as one
  // connected circuit rather than two overlapping lines.
  const fittedTubeExit = fittedFaceSpec
    ? clinicalPoint(fittedFaceSpec.tubeExit)
    : null;
  const legacyOxygenFace = clinicalPoint([0.01, 1.64, 0.24]);
  const oxygenJawRoute = clinicalPoint([0.14, 1.42, 0.165]);
  const oxygenShoulderRoute = clinicalPoint([0.27, 1.30, 0.14]);
  const uprightPatient = posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' || mobility === 'standing' || mobility === 'pacing';
  const oxygenCylinderZ = uprightPatient ? 0.72 : (fittedTubeExit?.[2] ?? legacyOxygenFace[2]) + 0.16;
  const oxygenCylinderBase: [number, number, number] = [0.66, equipmentGroundY, oxygenCylinderZ];
  const oxygenRegulator: [number, number, number] = [0.66, equipmentGroundY + 0.475, oxygenCylinderZ];
  const chestLeft = clinicalPoint([-0.03, 1.23, 0.25]);
  const chestRight = clinicalPoint([0.15, 1.15, 0.25]);
  const ivSite = clinicalPoint([-0.23, 0.82, 0.24]);
  const headPadZ = clinicalPoint([0, 1.56, 0])[2];

  return (
    <group>
      {/* Head pad exists only on the stretcher. Floor/roadside patients are
          treated where found; rendering a pad there obscures the face and can
          look like vehicle geometry crossing the body. */}
      {supportSurface === 'stretcher' && stage === 'stretcher' && mobility === 'recumbent' && (
        <mesh position={[0, 0.505, headPadZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <boxGeometry args={[0.72 * Math.max(0.58, patientScale), 0.36 * Math.max(0.58, patientScale), 0.055]} />
          <meshStandardMaterial color="#e5edf4" roughness={0.86} metalness={0.02} transparent opacity={0.88} />
        </mesh>
      )}

      {/* Stretcher straps, foreground rails, and the foot-end bar were removed
          deliberately: they rendered as detached bars floating over the body
          and occluded the anatomy from most camera angles ("3 or 4 bars are
          blocking the patient"). Reintroduce only as geometry that actually
          hugs the mesh. */}

      {fittedFaceSpec?.connectsToCylinder && fittedTubeExit && (
        <>
          <SceneCable
            points={[fittedTubeExit, oxygenJawRoute, oxygenShoulderRoute, [0.46, 0.56, oxygenCylinderZ + 0.06], oxygenRegulator]}
            anchor={faceAttachment ? { frame: faceAttachment, points: [fittedFaceSpec.tubeExit, [0.14, 1.42, 0.035], null, null, null] } : undefined}
            color="#d9f7ef"
            opacity={0.82}
            radius={0.0028}
          />
          <group name="active-oxygen-cylinder" position={oxygenCylinderBase} raycast={() => null}>
            <mesh position={[0, 0.19, 0]} castShadow>
              <cylinderGeometry args={[0.064, 0.068, 0.38, 18]} />
              <meshStandardMaterial color="#16664f" roughness={0.48} metalness={0.18} />
            </mesh>
            <mesh position={[0, 0.385, 0]} castShadow scale={[1, 0.72, 1]}>
              <sphereGeometry args={[0.064, 18, 12]} />
              <meshStandardMaterial color="#1d765d" roughness={0.44} metalness={0.16} />
            </mesh>
            <mesh position={[0, 0.435, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.034, 0.065, 14]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.475, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.04, 0.009, 8, 18]} />
              <meshStandardMaterial color="#334155" roughness={0.36} metalness={0.58} />
            </mesh>
            <mesh position={[-0.055, 0.47, 0]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.031, 0.031, 0.018, 18]} />
              <meshStandardMaterial color="#eef2f7" roughness={0.28} metalness={0.16} />
            </mesh>
            <mesh position={[0, 0.20, 0.069]}>
              <boxGeometry args={[0.078, 0.11, 0.004]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.74} metalness={0} />
            </mesh>
          </group>
        </>
      )}

      {equipment.oxygen && !fittedFaceSpec && equipment.oxygen.mode !== 'bvm' && (
        <SceneCable
          points={[legacyOxygenFace, [0.18, 0.83, -0.76], [0.62, 0.82, -0.86], [0.98, 1.04, -0.70]]}
          color="#6ee7b7"
          opacity={0.72}
          radius={0.0045}
        />
      )}

      {equipment.hasDefibPads && (
        <>
          <SceneCable points={[chestLeft, [0.18, 0.93, -0.42], [0.74, 1.26, -0.80]]} color="#e2e8f0" opacity={0.58} radius={0.0038} />
          <SceneCable points={[chestRight, [0.28, 0.88, -0.31], [0.76, 1.22, -0.78]]} color="#e2e8f0" opacity={0.58} radius={0.0038} />
        </>
      )}

      {equipment.hasFluids && (
        <group name="active-iv-fluid-stand">
          {/* A single active stand appears only once fluid is connected. The
              old always-on half pole (and its translucent ghost bag) could sit
              behind an untreated patient's head and read as a pole through
              the body. */}
          <mesh position={[-0.92, 0.76, -0.62]} castShadow raycast={() => null}>
            <cylinderGeometry args={[0.009, 0.011, 1.56, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.76} />
          </mesh>
          <mesh position={[-0.92, -0.02, -0.62]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 10]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.34} metalness={0.72} />
          </mesh>
          <mesh position={[-0.92, -0.02, -0.62]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 10]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.34} metalness={0.72} />
          </mesh>
          {[0, Math.PI / 2].map(rotation => (
            <mesh key={`active-iv-hook-${rotation}`} position={[-0.92, 1.54, -0.62]} rotation={[Math.PI / 2, 0, rotation]} raycast={() => null}>
              <cylinderGeometry args={[0.006, 0.006, 0.34, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.76} />
            </mesh>
          ))}
          <mesh position={[-0.78, 1.39, -0.62]} castShadow raycast={() => null}>
            <boxGeometry args={[0.14, 0.24, 0.035]} />
            <meshPhysicalMaterial color="#e0f2fe" transmission={0.18} transparent opacity={0.78} roughness={0.2} metalness={0} />
          </mesh>
          <mesh position={[-0.78, 1.34, -0.599]} raycast={() => null}>
            <boxGeometry args={[0.12, 0.11, 0.005]} />
            <meshStandardMaterial color="#bfdbfe" transparent opacity={0.58} roughness={0.15} />
          </mesh>
          <mesh position={[-0.78, 1.2, -0.62]} raycast={() => null}>
            <cylinderGeometry args={[0.013, 0.009, 0.07, 10]} />
            <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.72} roughness={0.16} />
          </mesh>
          <SceneCable
            points={[[-0.78, 1.165, -0.62], [-0.72, 0.92, -0.44], [-0.46, 0.72, 0.02], ivSite]}
            color="#dbeafe"
            opacity={0.78}
            radius={0.0034}
          />
        </group>
      )}

      {/* The villa uses its portable device, not this legacy clinic fixture. */}
      {showWallMonitor && (
        <group name="legacy-wall-monitor">
          <mesh position={[0.82, 1.37, -0.865]} raycast={() => null}>
            <boxGeometry args={[0.34, 0.18, 0.012]} />
            <meshStandardMaterial color="#020617" emissive="#22d3ee" emissiveIntensity={0.34} roughness={0.36} transparent opacity={0.88} />
          </mesh>
          {[-0.055, 0, 0.055].map((y, index) => (
            <mesh key={`monitor-trace-${index}`} position={[0.82, 1.37 + y, -0.856]} raycast={() => null}>
              <boxGeometry args={[0.21, 0.008, 0.006]} />
              <meshStandardMaterial
                color={index === 0 ? '#ef4444' : index === 1 ? '#38bdf8' : '#22c55e'}
                emissive={index === 0 ? '#ef4444' : index === 1 ? '#38bdf8' : '#22c55e'}
                emissiveIntensity={0.65}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * Floating marker wrapper that fades/hides itself as its anchored body
 * surface rotates away from the camera. Outward direction at an anchor is
 * approximated as the horizontal vector from the body's central axis to the
 * point; the dot product with the camera direction drives opacity. This keeps
 * region dots/labels from piling up and overlapping at any rotation
 * (top-down, posterior, oblique) — only the surfaces actually facing the
 * viewer show a marker.
 */
type MarkerPresentation = 'upright' | 'treatment-bay';

function MarkerHtml({
  position,
  followPosition,
  distanceFactor,
  zIndexRange,
  interactive = true,
  presentation = 'upright',
  contentScale = 1,
  surfaceAware = true,
  children,
}: {
  position: [number, number, number];
  followPosition?: () => [number, number, number];
  distanceFactor?: number;
  zIndexRange?: [number, number];
  interactive?: boolean;
  presentation?: MarkerPresentation;
  contentScale?: number;
  surfaceAware?: boolean;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const el = wrapRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const [x, y, z] = followPosition?.() ?? position;
    anchor.position.set(x, y, z);
    // Airway equipment is already placed in the posed clinical head frame.
    // Keep it visible at treatment-bay oblique angles: the generic body-surface
    // normal is not valid after a recumbent/tripod root transform and otherwise
    // fades a correctly applied mask to opacity zero.
    if (!surfaceAware) {
      el.style.opacity = '1';
      el.style.pointerEvents = interactive ? 'auto' : 'none';
      return;
    }
    const ol = Math.hypot(x, z) || 1;            // outward (horizontal) magnitude
    const dx = camera.position.x - x;
    const dy = camera.position.y - y;
    const dz = camera.position.z - z;
    const dl = Math.hypot(dx, dy, dz) || 1;
    // 1 = camera dead-on the surface, 0 = edge / straight above, <0 = behind.
    // Upright overview uses horizontal outward direction; stretcher overview has
    // the patient's anterior surface facing upward, so the useful normal is +Y.
    const facing = presentation === 'treatment-bay'
      ? dy / dl
      : (x / ol) * (dx / dl) + (z / ol) * (dz / dl);
    const op = Math.max(0, Math.min(1, (facing - 0.12) / 0.32));
    el.style.opacity = String(op);
    el.style.pointerEvents = interactive && op >= 0.2 ? 'auto' : 'none';
  });
  return (
    <group ref={anchorRef} position={position}>
      <Html position={[0, 0, 0]} center distanceFactor={distanceFactor} zIndexRange={zIndexRange}>
        <div ref={wrapRef} style={{ transition: 'opacity 120ms linear', transform: `scale(${contentScale})` }}>
          {children}
        </div>
      </Html>
    </group>
  );
}

const NO_TOOL_RAYCAST = () => {};

function AssessmentContactTool({ action, region, sampler, patientScale, exposed, listeningStep }: {
  action: string | null;
  region: string | null;
  sampler: SurfaceSampler | null;
  patientScale: number;
  exposed: boolean;
  listeningStep: number;
}) {
  const root = useRef<THREE.Group>(null);
  const gesture = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);
  const fitHand = useMemo(() => createPalpationHandFit(), []);
  const elapsed = useRef(0);
  const [sequence, setSequence] = useState(0);
  const contact = resolveAssessmentContact(action, region, RESP001_EXAM_LANDMARKS, action === 'chest-percuss' ? sequence : listeningStep);
  const vectors = useMemo(() => ({ normal: new THREE.Vector3(), z: new THREE.Vector3(0, 0, 1) }), []);
  useEffect(() => {
    elapsed.current = 0;
    setSequence(0);
    if (action !== 'chest-percuss') return;
    const timer = window.setInterval(() => setSequence(value => (value + 1) % 4), 3000);
    return () => window.clearInterval(timer);
  }, [action]);
  // Registered after the body animation; keep priority zero so the overlay
  // never takes ownership of rendering when the composer is disabled.
  useFrame((_, delta) => {
    if (!root.current || !contact) return;
    const frame = sampler?.contact?.(contact.position[0], contact.position[1]);
    root.current.visible = !!frame;
    if (!frame) return;
    elapsed.current += Math.min(delta, .05);
    vectors.normal.fromArray(frame.normal);
    root.current.position.fromArray(frame.position).addScaledVector(vectors.normal, .002 * patientScale);
    root.current.quaternion.setFromUnitVectors(vectors.z, vectors.normal);
    root.current.userData.site = contact.label;
    root.current.userData.technique = contact.technique;
    if (contact.technique === 'palpate' && hand.current && sampler?.contact) {
      fitHand(root.current, hand.current, sampler.contact, contact.position, patientScale);
    }
    if (gesture.current) {
      const motion = contact.technique === 'percuss' ? Math.pow(Math.max(0, Math.sin(elapsed.current * 9)), 4) * .022
        : contact.technique === 'palpate' ? (1 - Math.cos(elapsed.current * 2.5)) * .002 : 0;
      gesture.current.position.z = motion;
    }
  });
  if (!contact || !sampler?.contact) return null;
  const title = contact.technique === 'auscultate' ? 'Stethoscope' : contact.technique === 'palpate' ? 'Palpation' : 'Percussion';
  return (
    <group ref={root} name="assessment-contact-tool" scale={patientScale}>
      <mesh raycast={NO_TOOL_RAYCAST} visible={exposed}>
        <ringGeometry args={[.024, .027, 40]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={.75} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={gesture} visible={exposed}>
        {contact.technique === 'auscultate' ? (
          <group name="assessment-stethoscope" position={[0, 0, -.0025]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .006]} raycast={NO_TOOL_RAYCAST}>
              <cylinderGeometry args={[.023, .023, .01, 40]} />
              <meshStandardMaterial color="#cbd5e1" metalness={.75} roughness={.25} />
            </mesh>
            <mesh position={[0, 0, .012]} raycast={NO_TOOL_RAYCAST}>
              <circleGeometry args={[.018, 40]} />
              <meshStandardMaterial color="#334155" metalness={.25} roughness={.42} />
            </mesh>
            <mesh position={[0, -.032, .012]} raycast={NO_TOOL_RAYCAST}>
              <capsuleGeometry args={[.004, .05, 4, 8]} />
              <meshStandardMaterial color="#0f172a" roughness={.8} />
            </mesh>
          </group>
        ) : contact.technique === 'percuss' ? (
          <group name="assessment-percussion-fingers" position={[0, 0, .018]}>
            {[-.006, .006].map(x => (
              <mesh key={x} position={[x, -.015, .006]} rotation={[.8, 0, 0]} raycast={NO_TOOL_RAYCAST}>
                <capsuleGeometry args={[.005, .026, 4, 8]} />
                <meshStandardMaterial color="#60a5d6" roughness={.8} />
              </mesh>
            ))}
          </group>
        ) : (
          <group ref={hand} name="assessment-gloved-hand">
            <mesh name="assessment-palm" scale={[.027, .034, .009]} raycast={NO_TOOL_RAYCAST}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#60a5d6" roughness={.8} />
            </mesh>
            {PALPATION_FINGERS.map((finger, i) => (
              <mesh key={finger.x} name={`assessment-finger-${i}`} raycast={NO_TOOL_RAYCAST}>
                <capsuleGeometry args={[.006, finger.length, 4, 8]} />
                <meshStandardMaterial color="#60a5d6" roughness={.8} />
              </mesh>
            ))}
            <mesh name="assessment-thumb" raycast={NO_TOOL_RAYCAST}>
              <capsuleGeometry args={[.008, .022, 4, 8]} />
              <meshStandardMaterial color="#60a5d6" roughness={.8} />
            </mesh>
          </group>
        )}
      </group>
      {exposed && contact.technique === 'percuss' && (
        <mesh name="assessment-percussion-contact-finger" position={[0, 0, .006]} rotation={[0, 0, Math.PI / 2]} raycast={NO_TOOL_RAYCAST}>
          <capsuleGeometry args={[.006, .042, 4, 8]} />
          <meshStandardMaterial color="#60a5d6" roughness={.8} />
        </mesh>
      )}
      <Html position={[.06, .065, .04]} center occlude zIndexRange={[82, 0]} style={{ pointerEvents: 'none' }}>
        <div data-testid="assessment-contact-label" className="whitespace-nowrap rounded-lg border border-cyan-200/50 bg-slate-950/95 px-2 py-1 text-[10px] text-white shadow-lg">
          <span className="font-semibold text-cyan-200">{title}</span> · {contact.label}
          {!exposed && <span className="block text-[9px] text-amber-200">Expose this region for skin contact</span>}
          {contact.bilateral && <span className="block text-[9px] text-slate-300">Bilateral contact sequence</span>}
          {action === 'chest-auscultate-lungs' && <span className="block text-[9px] text-slate-300">Anterior fields · also assess lateral/posterior fields</span>}
        </div>
      </Html>
    </group>
  );
}

function LandmarkMarkers({
  activeRegion,
  assessedRegions,
  requiredRegions,
  onSelect,
  onAction,
  onPulse,
  sampler,
  presentation,
  patientScale = 1,
  landmarks = EXAM_LANDMARKS,
  useContactAnchors = false,
}: {
  activeRegion: string | null;
  assessedRegions: Set<string>;
  requiredRegions: Set<string>;
  onSelect: (region: SecondaryAssessmentStep) => void;
  onAction?: (actionId: string) => void;
  onPulse?: (site: string) => void;
  sampler: SurfaceSampler | null;
  presentation: MarkerPresentation;
  patientScale?: number;
  landmarks?: ExamLandmark[];
  useContactAnchors?: boolean;
}) {
  const compactPatient = patientScale < 0.55;
  const visibleMarkers = activeRegion
    ? landmarks.filter(marker => marker.region === activeRegion && marker.level === 'detail'
      && !(useContactAnchors && activeRegion === 'face' && marker.actionId?.startsWith('pulse-')))
    : landmarks.filter(marker => marker.level === 'overview' && (
      requiredRegions.has(marker.region)
      || marker.id === 'eyes-overview'
      || marker.id === 'airway-overview'
      || marker.id === 'chest-overview'
      || marker.id === 'abdomen-overview'
      || marker.id === 'pulse-carotid'
      || marker.id === 'pulse-radial-r'
      || marker.id === 'pulse-radial-l'
      || marker.id === 'pedal-overview-r'
      || marker.id === 'pedal-overview-l'
    ));

  const toneClasses: Record<NonNullable<ExamLandmark['tone']>, string> = {
    neutral: 'border-slate-200/80 bg-white/90 text-slate-800 dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-100',
    airway: 'border-sky-300/80 bg-sky-50/95 text-sky-900 dark:border-sky-400/35 dark:bg-sky-950/85 dark:text-sky-100',
    breathing: 'border-cyan-300/80 bg-cyan-50/95 text-cyan-900 dark:border-cyan-400/35 dark:bg-cyan-950/85 dark:text-cyan-100',
    circulation: 'border-rose-300/80 bg-rose-50/95 text-rose-900 dark:border-rose-400/35 dark:bg-rose-950/85 dark:text-rose-100',
    abdomen: 'border-emerald-300/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/35 dark:bg-emerald-950/85 dark:text-emerald-100',
    neuro: 'border-blue-300/80 bg-blue-50/95 text-blue-900 dark:border-blue-400/35 dark:bg-blue-950/85 dark:text-blue-100',
    warning: 'border-amber-300/80 bg-amber-50/95 text-amber-900 dark:border-amber-400/35 dark:bg-amber-950/85 dark:text-amber-100',
  };

  // Higher df = smaller on-screen marker. Face/neck zoom in very tight, which
  // otherwise balloons their dots; shrink them so the clustered facial/airway
  // landmarks stay separate and tappable.
  const DETAIL_DF: Record<string, number> = { face: 1.25, 'neck-cspine': 1.4 };
  return (
    <>
      {visibleMarkers.map(marker => {
        const assessed = assessedRegions.has(marker.region) || (isLimbRegion(marker.region) && assessedRegions.has('extremities'));
        const required = requiredRegions.has(marker.region);
        // Project the label's intended (x, y) onto the real patient surface.
        // 'posterior' lives on the back, which the front-facing sampler can't
        // resolve, so it keeps its authored anchor.
        const sampleMarkerPosition = sampler && marker.region !== 'posterior-logroll'
          ? () => {
            const contact = useContactAnchors && (marker.region === 'chest' || marker.region === 'abdomen')
              ? sampler.contact?.(marker.position[0], marker.position[1]) : null;
            return contact?.position ?? sampler(marker.position[0], marker.position[1], { coordinateSpace: marker.anchorSpace ?? 'author', anatomicalSite: marker.actionId });
          }
          : undefined;
        const pos: [number, number, number] = sampleMarkerPosition?.() ?? marker.position;
        const isDetail = marker.level === 'detail';
        const isPulseMarker = marker.actionId?.startsWith('pulse-') ?? false;
        const dotColor = assessed
          ? 'bg-emerald-400'
          : required
            ? 'bg-amber-400'
            : isDetail ? 'bg-cyan-300' : 'bg-sky-400';
        // Focused-region landmarks stay as quiet touch targets; the loupe and
        // cockpit already name the targets, so hover labels would just clutter
        // the patient surface.
        return (
          <MarkerHtml key={marker.id} position={pos} followPosition={sampleMarkerPosition} distanceFactor={isDetail ? (DETAIL_DF[activeRegion ?? ''] ?? 2.0) : 3.0} zIndexRange={[80, 0]} presentation={presentation}>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                // Pulse points work from any view — one click checks the pulse.
                if (marker.actionId?.startsWith('pulse-') && onPulse) {
                  onPulse(marker.actionId);
                  return;
                }
                if (activeRegion === marker.region && marker.actionId && onAction) {
                  onAction(marker.actionId);
                  return;
                }
                onSelect(marker.region);
              }}
              className={`group pointer-events-auto relative flex items-center justify-center ${isPulseMarker && !isDetail ? 'h-9 w-9' : marker.actionId && isPupilExamAction(marker.actionId) ? 'h-11 w-11' : isDetail ? 'h-6 w-6' : 'h-7 w-7'}`}
              data-compact-patient={compactPatient || undefined}
              aria-label={marker.actionId?.startsWith('pulse-') ? `Check ${marker.label.toLowerCase()} pulse` : `${marker.label}: ${marker.sublabel}`}
              title={`${marker.label} — ${marker.sublabel}`}
            >
              {/* Invisible touch target — keeps the patient surface clean. The
                  dot itself is hidden (opacity 0); only the enlarged hit zone stays
                  clickable so tapping the face/eyes/chest of the
                  model triggers the region's assessment zoom + actions. */}
              {isPulseMarker ? (
                <span className={`pointer-events-none absolute flex items-center justify-center rounded-full border border-rose-200/90 bg-rose-600/90 text-white shadow-[0_0_0_3px_rgba(244,63,94,.18),0_4px_10px_rgba(15,23,42,.45)] motion-safe:animate-pulse ${compactPatient ? 'inset-2.5' : isDetail ? 'inset-1.5' : 'inset-1'}`}>
                  <Activity className={compactPatient || isDetail ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
                </span>
              ) : (
                <span className={`pointer-events-none absolute inset-0 ${dotColor}`} style={{ opacity: 0 }} />
              )}
              {!isDetail && !(compactPatient && isPulseMarker) && (
                <span className={`pointer-events-none absolute left-1/2 top-[112%] z-10 -translate-x-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[8px] font-semibold leading-none shadow-lg backdrop-blur-md transition-opacity duration-150 ${isPulseMarker ? 'opacity-95' : 'opacity-0 group-hover:opacity-100'} ${toneClasses[marker.tone ?? 'neutral']}`}>
                  {marker.label}
                </span>
              )}
            </button>
          </MarkerHtml>
        );
      })}
    </>
  );
}

// 3D anchor positions per region for revealed-finding markers. Reuses the
// EXAM_LANDMARK coordinate space; adds the regions landmarks don't cover.
// Measured from the actual mesh (see EXAM_LANDMARKS note). Sit just proud of
// the real camera-facing (+Z) surface; arms anchor mid-upper-arm.
const FINDING_ANCHORS: Record<string, [number, number, number]> = {
  'head': [0.0, 1.70, 0.19],
  'face': [0.0, 1.62, 0.20],
  'neck-cspine': [0.0, 1.46, 0.22],
  'chest': [0.0, 1.27, 0.20],
  'abdomen': [0.0, 1.02, 0.24],
  'pelvis': [0.0, 0.90, 0.24],
  'right-arm': [-0.145, 1.10, 0.16],
  'left-arm': [0.145, 1.10, 0.16],
  'right-leg': [-0.165, 0.46, 0.18],
  'left-leg': [0.165, 0.46, 0.18],
  'posterior-logroll': [0.0, 1.10, -0.20],
};

const FINDING_SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-rose-300/70 bg-rose-600/90 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)]',
  major: 'border-orange-300/70 bg-orange-600/90 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]',
  minor: 'border-amber-300/70 bg-amber-400/90 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
};

const REALISM_CUE_STYLE: Record<RealismSeverity, { marker: string; dot: string; chip: string }> = {
  normal: {
    marker: 'border-emerald-200/45 bg-emerald-950/72 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-300',
    chip: 'border-emerald-200/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  },
  observe: {
    marker: 'border-sky-200/45 bg-sky-950/72 text-sky-50 shadow-[0_0_16px_rgba(14,165,233,0.25)]',
    dot: 'bg-sky-300',
    chip: 'border-sky-200/40 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  },
  warning: {
    marker: 'border-amber-200/55 bg-amber-950/78 text-amber-50 shadow-[0_0_18px_rgba(245,158,11,0.35)]',
    dot: 'bg-amber-300',
    chip: 'border-amber-200/50 bg-amber-500/12 text-amber-800 dark:text-amber-100',
  },
  critical: {
    marker: 'border-rose-200/60 bg-rose-950/82 text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.42)]',
    dot: 'bg-rose-300',
    chip: 'border-rose-200/55 bg-rose-500/12 text-rose-800 dark:text-rose-100',
  },
};

/**
 * Renders injury findings ON the body — but ONLY for regions the student has
 * already assessed. This is the core discovery mechanic: you don't see the
 * JVD until you go to the neck and examine it. Findings for un-assessed
 * regions stay hidden, so the student must work the systematic survey to
 * uncover them (the whole point of assessment).
 *
 * Model-agnostic: anchors to region coordinates, so it works on the current
 * placeholder mesh and the future Character Creator patient alike.
 */
function RevealedFindingMarkers({
  caseData,
  assessedRegions,
  activeRegion,
  sampler,
  presentation,
}: {
  caseData: CaseScenario;
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: SurfaceSampler | null;
  presentation: MarkerPresentation;
}) {
  const injuries = useMemo(() => inferInjuries(caseData), [caseData]);
  // Floating injury badges are an OVERVIEW discovery layer. In a focused
  // region view they piled on top of the exam landmarks / loupe (the
  // "overlapping pop-ups" problem) while duplicating what the cockpit and
  // findings panel already show — so they hide whenever a region is active.
  if (!injuries.length || activeRegion) return null;

  // Per-region slot counter so multiple findings in the SAME region fan out
  // instead of stacking on the identical FINDING_ANCHORS point (which made
  // abdominal findings pile up over the quadrant markers). Injuries flank the
  // LEFT of the region midline and stack DOWNWARD; realism cues mirror this on
  // the right (see CaseRealismMarkers), keeping the centre clear for the exam
  // landmark dots.
  const injurySlots: Record<string, number> = {};

  return (
    <>
      {injuries.map((inj) => {
        const region3d = injuryRegionTo3D(inj.region);
        // Reveal gate: region examined (with limb-group + extremities fallback)
        const revealed = assessedRegions.has(region3d)
          || (isLimbRegion(region3d) && assessedRegions.has('extremities'))
          || activeRegion === region3d;
        if (!revealed) return null;
        const fallback = FINDING_ANCHORS[region3d];
        if (!fallback) return null;
        const slot = (injurySlots[region3d] = (injurySlots[region3d] ?? -1) + 1);
        const fx = fallback[0] + (inj.laterality ? injuryWorldOffsetX(inj.laterality) : -0.17);
        const fy = fallback[1] - slot * 0.11; // ~21px steps at overview zoom — clears the badge height
        // Anchor the finding badge to the real surface at the offset (x, y).
        const anchor: [number, number, number] = sampler && region3d !== 'posterior-logroll'
          ? sampler(fx, fy)
          : [fx, fy, fallback[2]];
        return (
          <MarkerHtml key={inj.id} position={anchor} distanceFactor={3.2} zIndexRange={[90, 0]} interactive={false} presentation={presentation}>
            <div className="scale-[0.6] pointer-events-none animate-in fade-in zoom-in-50 duration-500">
              <div className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 backdrop-blur-md ${FINDING_SEVERITY_STYLE[inj.severity] || FINDING_SEVERITY_STYLE.major}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.1em] leading-none">{inj.label}</span>
              </div>
            </div>
          </MarkerHtml>
        );
      })}
    </>
  );
}

// Visible wounds painted on the skin — blood, bruising, burns — at the injured
// region, sized by severity and coloured by kind. Unlike the text badges these
// stay visible when you zoom INTO a region, so a described injury is actually
// THERE on the mannequin to inspect. Shape-only findings (deformity, rotation,
// fracture, distension) are conveyed by badges/morphs, not a skin mark.
const WOUND_STYLE: Partial<Record<InjuryKind, { core: string; edge: string }>> = {
  bleeding: { core: 'rgba(150,16,22,0.92)', edge: 'rgba(120,10,14,0)' },
  wound: { core: 'rgba(140,14,20,0.92)', edge: 'rgba(110,8,12,0)' },
  amputation: { core: 'rgba(105,8,10,0.96)', edge: 'rgba(80,4,6,0)' },
  burn: { core: 'rgba(92,42,20,0.9)', edge: 'rgba(150,60,30,0)' },
  bruising: { core: 'rgba(74,28,104,0.8)', edge: 'rgba(60,20,90,0)' },
  flail: { core: 'rgba(80,32,96,0.72)', edge: 'rgba(60,22,80,0)' },
  swelling: { core: 'rgba(176,132,110,0.62)', edge: 'rgba(176,132,110,0)' },
};
const WOUND_SIZE: Record<InjurySeverity, number> = { critical: 42, major: 31, minor: 23 };

function InjuryWoundMarkers({
  caseData,
  assessedRegions,
  activeRegion,
  sampler,
}: {
  caseData: CaseScenario;
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  const injuries = useMemo(() => inferInjuries(caseData), [caseData]);
  if (!injuries.length) return null;
  const slots: Record<string, number> = {};
  return (
    <>
      {injuries.map((inj) => {
        const style = WOUND_STYLE[inj.kind];
        if (!style) return null; // shape-only finding — no skin mark
        const region3d = injuryRegionTo3D(inj.region);
        const revealed = assessedRegions.has(region3d)
          || (isLimbRegion(region3d) && assessedRegions.has('extremities'))
          || activeRegion === region3d;
        if (!revealed) return null;
        const base = FINDING_ANCHORS[region3d];
        if (!base) return null;
        const n = (slots[region3d] = (slots[region3d] ?? -1) + 1);
        // Small fan so several wounds in one region don't stack dead-centre.
        // Laterality shifts the blob onto the named hemithorax first.
        const bx = base[0] + injuryWorldOffsetX(inj.laterality) + (n % 2 === 0 ? 0.03 : -0.03) * Math.ceil(n / 2);
        const by = base[1] - 0.04 * n;
        const anchor: [number, number, number] = sampler && region3d !== 'posterior-logroll'
          ? sampler(bx, by)
          : [bx, by, base[2]];
        const d = WOUND_SIZE[inj.severity] ?? 26;
        return (
          <MarkerHtml key={`wound-${inj.id}`} position={anchor} distanceFactor={2.4} zIndexRange={[60, 0]} interactive={false}>
            <div
              aria-hidden
              className="pointer-events-none animate-in fade-in duration-700"
              style={{
                width: d,
                height: d,
                borderRadius: '50%',
                background: `radial-gradient(circle at 42% 40%, ${style.core} 0%, ${style.core} 26%, ${style.edge} 80%)`,
                filter: 'blur(1px)',
              }}
            />
          </MarkerHtml>
        );
      })}
    </>
  );
}

function CaseRealismMarkers({
  cues,
  assessedRegions,
  activeRegion,
  sampler,
  presentation,
}: {
  cues: PatientRealismCue[];
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: SurfaceSampler | null;
  presentation: MarkerPresentation;
}) {
  // Cue rings are an OVERVIEW breadcrumb. In a focused region view they
  // ballooned (~90px) over the loupe and exam landmarks — the detail panels
  // already convey patient state, so the rings hide whenever a region is active.
  if (activeRegion) return null;

  const visibleCues = cues.filter(item => shouldRevealRealismCue(item, assessedRegions, activeRegion)).slice(0, 5);
  if (!visibleCues.length) return null;

  // Collapse to ONE ring per region (highest severity wins, +N chip for the
  // rest). Stacked same-region rings overlapped heavily at overview zoom and
  // conveyed nothing a count doesn't. Rings flank the RIGHT of the region
  // midline, mirroring the injury badges on the left, keeping the centre
  // clear for the exam landmark dots.
  const severityRank: Record<RealismSeverity, number> = { critical: 3, warning: 2, observe: 1, normal: 0 };
  const byRegion = new Map<string, { top: PatientRealismCue; count: number }>();
  for (const item of visibleCues) {
    const cur = byRegion.get(item.region);
    if (!cur) byRegion.set(item.region, { top: item, count: 1 });
    else {
      cur.count += 1;
      if (severityRank[item.severity] > severityRank[cur.top.severity]) cur.top = item;
    }
  }

  return (
    <>
      {[...byRegion.values()].map(({ top, count }, index) => {
        const fallback = FINDING_ANCHORS[top.region] || FINDING_ANCHORS.chest;
        const fx = fallback[0] + 0.17;
        const anchor: [number, number, number] = sampler && top.region !== 'posterior-logroll'
          ? sampler(fx, fallback[1])
          : [fx, fallback[1], fallback[2]];
        const style = REALISM_CUE_STYLE[top.severity];
        return (
          <MarkerHtml key={top.id} position={anchor} distanceFactor={2.7} zIndexRange={[82 - index, 0]} interactive={false} presentation={presentation}>
            <div
              className="pointer-events-none relative flex h-3 w-3 items-center justify-center animate-in fade-in zoom-in-75 duration-500"
              aria-hidden="true"
            >
              <span className={`absolute h-3 w-3 rounded-full border backdrop-blur-md ${style.marker}`} />
              <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot} ${top.severity === 'critical' ? 'animate-pulse' : ''}`} />
              {count > 1 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full border border-white/25 bg-slate-900/85 px-1 text-[7px] font-bold leading-[10px] text-white">
                  +{count - 1}
                </span>
              )}
            </div>
          </MarkerHtml>
        );
      })}
    </>
  );
}

function ScenarioVisualMarkers({
  visualState,
  activeRegion,
  sampler,
  presentation,
}: {
  visualState?: PatientVisualState | null;
  activeRegion: string | null;
  sampler: SurfaceSampler | null;
  presentation: MarkerPresentation;
}) {
  if (!visualState || activeRegion) return null;

  const markers = [
    ...visualState.skinEffects
      .filter(effect => !['pallor', 'cyanosis', 'diaphoresis', 'mottling'].includes(effect.kind))
      .map(effect => ({
        id: `skin-${effect.kind}-${effect.region}`,
        kind: effect.kind,
        region: effect.region,
        detail: effect.detail,
        intensity: effect.intensity,
      })),
    ...visualState.woundOverlays.map(effect => ({
      id: `wound-${effect.kind}-${effect.region}`,
      kind: effect.kind,
      region: effect.region,
      detail: effect.detail,
      intensity: 1,
    })),
  ].slice(0, 6);

  if (!markers.length) return null;

  const toneFor = (kind: string): string => {
    if (/bleeding|wound|blood/.test(kind)) return 'border-rose-200/50 bg-rose-950/66 text-rose-50';
    if (/burn|soot/.test(kind)) return 'border-orange-200/50 bg-orange-950/66 text-orange-50';
    if (/rash|swelling/.test(kind)) return 'border-pink-200/50 bg-pink-950/66 text-pink-50';
    return 'border-cyan-200/45 bg-cyan-950/62 text-cyan-50';
  };

  const labelFor = (kind: string): string =>
    kind.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

  return (
    <>
      {markers.map((marker, index) => {
        const bodyRegion = visualRegionToBodyRegion(marker.region);
        if (!bodyRegion) return null;
        const region3d = injuryRegionTo3D(bodyRegion);
        const fallback = FINDING_ANCHORS[region3d] || FINDING_ANCHORS.chest;
        const fx = fallback[0] + 0.24;
        const fy = fallback[1] - index * 0.035;
        const anchor: [number, number, number] = sampler && region3d !== 'posterior-logroll'
          ? sampler(fx, fy)
          : [fx, fy, fallback[2]];
        return (
          <MarkerHtml key={marker.id} position={anchor} distanceFactor={2.9} zIndexRange={[78 - index, 0]} interactive={false} presentation={presentation}>
            <div className={`pointer-events-none max-w-[8.5rem] rounded-xl border px-2 py-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-75 duration-500 ${toneFor(marker.kind)}`}>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
                <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] leading-none">
                  {labelFor(marker.kind)}
                </p>
              </div>
              <p className="mt-1 line-clamp-2 text-[8px] leading-snug text-white/72">
                {marker.detail}
              </p>
            </div>
          </MarkerHtml>
        );
      })}
    </>
  );
}

const IV_MEDICATION_LINE_IDS = new Set([
  'adrenaline_1mg',
  'adrenaline_infusion',
  'amiodarone_300mg',
  'amiodarone_150mg',
  'morphine_5mg',
  'fentanyl_50mcg',
  'midazolam_5mg',
  'hydrocortisone_200mg',
  'magnesium_2g',
  'txa_1g',
  'naloxone_iv',
  'dextrose_iv',
  'glucose_iv',
]);

function buildTreatmentEquipmentState(appliedTreatmentIds: string[]): AppliedEquipmentVisualState {
  const applied = new Set(appliedTreatmentIds);
  const oxygenMatch = activeRespiratoryInterface(appliedTreatmentIds);
  const hasFluids = appliedTreatmentIds.some(id => id.startsWith('fluids_'));
  const hasMedicationLine = appliedTreatmentIds.some(id =>
    IV_MEDICATION_LINE_IDS.has(id) || id.endsWith('_iv') || id.includes('_infusion'),
  );
  const hasSurgicalAirway = applied.has('surgical_cric');
  const hasEtTube = !hasSurgicalAirway && (
    applied.has('intubation')
      || applied.has('endotracheal_intubation')
      || applied.has('rsi_intubation')
      || applied.has('mechanical_ventilation')
      || applied.has('ventilator_setup')
  );
  // Source control for active bleeding: any haemorrhage-control treatment
  // lands here. Wound ids are matched by region suffix in ActiveBleedSprites.
  const BLEED_CONTROL_IDS = new Set([
    'bleeding_control',
    'tourniquet', 'tourniquet_application', 'pressure_dressing', 'pressure_bandage',
    'haemostatic', 'hemostatic', 'chest_seal', 'wound_packing', 'direct_pressure',
  ]);
  const controlledBleedIds = new Set<string>(
    [...applied].filter(id => id.startsWith('site:') || [...BLEED_CONTROL_IDS].some(ctl => id.includes(ctl))),
  );
  const siteControls = appliedTreatmentIds.flatMap(id => {
    const match = id.match(/^site:([^:]+):(.+)$/);
    return match ? [{ treatmentId: match[1], target: match[2] as AppliedProcedureSite }] : [];
  });
  const immobilisationDevice: AppliedEquipmentVisualState['immobilisationDevice'] =
    applied.has('vacuum_mattress') ? 'vacuum-mattress'
      : applied.has('scoop_stretcher') ? 'scoop'
        : applied.has('spinal_board') ? 'spinal-board'
          : applied.has('ked') ? 'ked'
            : applied.has('head_blocks') ? 'head-blocks'
              : null;

  return {
    oxygen: oxygenMatch ? { mode: oxygenMatch.mode, label: oxygenMatch.label, detail: oxygenMatch.detail } : null,
    hasIvAccess: applied.has('iv_access') || applied.has('iv_cannula') || hasFluids || hasMedicationLine,
    hasFluids,
    hasDefibPads: hasAttachedDefibrillatorPads(appliedTreatmentIds),
    hasLucas: applied.has('lucas_device'),
    hasEtTube,
    hasOpa: applied.has('opa_insert'),
    hasCollar: applied.has('cervical_collar')
      || applied.has('c-collar')
      || applied.has('cspine_protection')
      || applied.has('immobilisation'),
    hasChestSeal: applied.has('chest_seal_vented') || applied.has('vented_chest_seal') || applied.has('occlusive_dressing_3sided'),
    hasNeedleDecompression: applied.has('needle_decompression'),
    hasPelvicBinder: applied.has('pelvic_binder'),
    hasSurgicalAirway,
    hasGastricTube: applied.has('orogastric_tube'),
    hasPericardialDrain: applied.has('pericardiocentesis'),
    hasTemperatureControl: applied.has('targeted_temp_mgmt'),
    hasWarmingBlanket: applied.has('warming_blanket'),
    hasActiveCooling: applied.has('active_cooling')
      && !siteControls.some(control => control.treatmentId === 'active_cooling'),
    hasCompletedDelivery: applied.has('assist_delivery'),
    immobilisationDevice,
    siteControls,
    controlledBleedIds,
  };
}

const OXYGEN_SRC: Record<OxygenEquipmentVisual['mode'], string> = {
  nasal: TREATMENT_ASSET_PATHS.nasal,
  'simple-mask': TREATMENT_ASSET_PATHS.simpleMask,
  venturi: TREATMENT_ASSET_PATHS.simpleMask,
  nonrebreather: TREATMENT_ASSET_PATHS.nonrebreather,
  nebulizer: TREATMENT_ASSET_PATHS.nebulizer,
  bvm: TREATMENT_ASSET_PATHS.bvm,
  cpap: TREATMENT_ASSET_PATHS.cpap,
  ventilator: TREATMENT_ASSET_PATHS.ventilator,
};

function WornFaceEquipment({
  equipment,
  connectedToEtTube = false,
}: {
  equipment: OxygenEquipmentVisual;
  connectedToEtTube?: boolean;
}) {
  const large = equipment.mode === 'bvm' || equipment.mode === 'cpap' || equipment.mode === 'ventilator';
  const bvm = equipment.mode === 'bvm';
  const bvmViaTube = bvm && connectedToEtTube;
  const nonrebreather = equipment.mode === 'nonrebreather';
  const nebulizer = equipment.mode === 'nebulizer';
  const cpap = equipment.mode === 'cpap';
  const ventilator = equipment.mode === 'ventilator';
  const fittedPhotorealisticMask = nonrebreather || nebulizer || cpap;
  if (bvm && !bvmViaTube) {
    return (
      <div
        data-applied-equipment="bvm"
        data-airway-connection="face"
        data-oxygen-connected="true"
        aria-label="Bag-valve-mask held with a two-handed face seal"
        className="pointer-events-none relative h-16 w-24 translate-x-[28%] translate-y-[120%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_6px_7px_rgba(2,44,58,0.48)]"
      >
        <img
          src={TREATMENT_ASSET_PATHS.bvmFaceSeal}
          alt=""
          draggable={false}
          className="h-full w-full object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute left-[91%] top-[53%] h-0.5 w-20 origin-left -rotate-6 rounded-full bg-emerald-200/90 shadow-[0_0_3px_rgba(16,185,129,0.8)]"
        />
      </div>
    );
  }
  if (cpap) {
    return (
      <div
        data-applied-equipment="cpap"
        data-airway-connection="face"
        aria-label="CPAP full-face mask sealed with a four-point harness"
        className="pointer-events-none relative h-12 w-16 -translate-y-[28%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_5px_6px_rgba(2,44,58,0.5)]"
      >
        <img src={OXYGEN_SRC.cpap} alt="" draggable={false} className="h-full w-full object-contain" />
      </div>
    );
  }
  if (ventilator) {
    return (
      <div
        data-applied-equipment="ventilator-circuit"
        data-airway-connection="ett"
        aria-label="Ventilator circuit connected to the secured endotracheal tube through an HME and capnography elbow"
        className="pointer-events-none relative h-10 w-14 translate-y-[23%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_5px_6px_rgba(2,44,58,0.5)]"
      >
        <img src={OXYGEN_SRC.ventilator} alt="" draggable={false} className="h-full w-full object-contain" />
      </div>
    );
  }
  if (equipment.mode === 'simple-mask') {
    return (
      <div
        data-applied-equipment={equipment.mode}
        data-airway-connection="face"
        className="pointer-events-none relative h-12 w-12 translate-y-[30%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_5px_6px_rgba(2,44,58,0.55)]"
      >
        <img src={OXYGEN_SRC[equipment.mode]} alt="" draggable={false} className="h-full w-full object-contain" />
        <span className="absolute left-[53%] top-[84%] h-0.5 w-14 origin-left rotate-[28deg] rounded-full bg-cyan-100/85 shadow-[0_0_2px_rgba(8,145,178,0.85)]" />
      </div>
    );
  }
  return (
    <div data-applied-equipment={equipment.mode} data-airway-connection={bvmViaTube ? 'ett' : 'face'} className={`pointer-events-none relative flex items-center justify-center drop-shadow-[0_5px_6px_rgba(2,44,58,0.55)] animate-in fade-in zoom-in-75 duration-300 ${nonrebreather ? 'h-16 w-16 translate-y-[38%]' : nebulizer ? 'h-16 w-16 translate-y-[15%]' : bvmViaTube ? 'h-12 w-16 -translate-x-[52%] translate-y-[140%]' : bvm ? 'h-16 w-20 translate-y-[88%]' : large ? 'h-16 w-20' : 'h-12 w-14'}`}>
      <img
        src={OXYGEN_SRC[equipment.mode]}
        alt=""
        className={`h-full w-full object-contain ${bvmViaTube ? '[clip-path:inset(0_0_0_28%)]' : bvm ? 'translate-x-[30%] -translate-y-[20%]' : ''}`}
        draggable={false}
      />
      {bvmViaTube ? (
        <span className="absolute left-[75%] top-[45%] h-0.5 w-4 origin-left rounded-full bg-cyan-100/90 shadow-[0_0_3px_rgba(8,145,178,0.9)]" />
      ) : !fittedPhotorealisticMask && (
        <span className="absolute left-[62%] top-[68%] h-0.5 w-14 origin-left rotate-[28deg] rounded-full bg-cyan-100/80 shadow-[0_0_2px_rgba(8,145,178,0.8)]" />
      )}
    </div>
  );
}

function AppliedCpapMask3D({
  position,
  rotation,
  scale,
  width,
  height,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  width: number;
  height: number;
}) {
  const sealPoints: Array<[number, number, number]> = [
    [0, height * 0.48, 0.004],
    [-width * 0.43, height * 0.18, 0.004],
    [-width * 0.36, -height * 0.34, 0.004],
    [0, -height * 0.49, 0.004],
    [width * 0.36, -height * 0.34, 0.004],
    [width * 0.43, height * 0.18, 0.004],
    [0, height * 0.48, 0.004],
  ];

  return (
    <group
      name="applied-cpap-mask"
      position={position}
      rotation={rotation}
      scale={scale}
      raycast={() => null}
    >
      {/* A real CPAP interface has volume and a continuous silicone seal. The
          previous front-view texture looked convincing head-on but exposed a
          flat rectangular card and baked-on straps as soon as the camera
          moved. These patient-space parts remain coherent from every angle. */}
      <SceneCable
        points={sealPoints}
        color="#b9d4ed"
        opacity={0.88}
        radius={0.0032}
      />
      <mesh
        position={[0, height * 0.015, 0.047]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[width * 0.45, 0.05, height * 0.45]}
        renderOrder={17}
      >
        <cylinderGeometry args={[0.42, 1, 1, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#dcecf8"
          // Thin clear plastic uses alpha, not refraction: transmission here
          // produced invalid HDR pixels and bloom blacked out the whole room.
          transparent
          opacity={0.24}
          roughness={0.12}
          metalness={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, -height * 0.17, 0.096]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={19}
      >
        <cylinderGeometry args={[0.012, 0.017, 0.032, 18]} />
        <meshStandardMaterial color="#d5e4ee" roughness={0.34} metalness={0.08} />
      </mesh>
      <SceneCable
        points={[
          [0, -height * 0.17, 0.115],
          [0.022, -height * 0.24, 0.125],
          [0.065, -height * 0.34, 0.11],
          [0.12, -height * 0.41, 0.075],
        ]}
        color="#dbe7ee"
        opacity={0.96}
        radius={0.0058}
      />
      {[0.031, 0.052, 0.073, 0.094].map((x, index) => (
        <mesh
          key={`cpap-hose-rib-${x}`}
          position={[x, -height * (0.255 + index * 0.035), 0.119 - index * 0.011]}
          rotation={[Math.PI / 2, 0.08, -0.45]}
          scale={[1, 1, 0.7]}
          renderOrder={20}
        >
          <torusGeometry args={[0.0072, 0.0009, 6, 14]} />
          <meshStandardMaterial color="#aebfca" roughness={0.48} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}

function AppliedBvmMask3D({
  position,
  rotation,
  scale,
  width,
  height,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  width: number;
  height: number;
}) {
  // A bag-valve-mask is held on the face by a two-handed C–E grip, not
  // strapped. Correct anatomy (verified against reference photos): the
  // one-way patient valve sits at the mask's APEX (over the nasal bridge),
  // and the self-inflating bag extends OUTWARD from that apex toward the
  // clinician — never down toward the chest. The seal cuff is a soft
  // silicone skirt tracing the nose-to-chin contour.
  const sealPoints: Array<[number, number, number]> = [
    [0, height * 0.42, 0.004],
    [-width * 0.30, height * 0.10, 0.004],
    [-width * 0.44, -height * 0.16, 0.004],
    [-width * 0.32, -height * 0.42, 0.004],
    [0, -height * 0.50, 0.004],
    [width * 0.32, -height * 0.42, 0.004],
    [width * 0.44, -height * 0.16, 0.004],
    [width * 0.30, height * 0.10, 0.004],
    [0, height * 0.42, 0.004],
  ];

  return (
    <group
      name="applied-bvm-mask"
      position={position}
      rotation={rotation}
      scale={scale}
      raycast={() => null}
    >
      {/* Silicone seal skirt hugging the nose-to-chin contour. */}
      <SceneCable
        points={sealPoints}
        color="#8fb7cf"
        opacity={0.9}
        radius={0.0036}
      />
      {/* Soft cuff dome over nose + mouth. */}
      <mesh
        position={[0, height * 0.02, 0.034]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[width * 0.44, 0.055, height * 0.44]}
        renderOrder={17}
      >
        <cylinderGeometry args={[0.48, 1, 1, 28, 1, true]} />
        <meshPhysicalMaterial
          color="#a9c7dd"
          transparent
          opacity={0.42}
          roughness={0.2}
          metalness={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Patient valve housing at the mask APEX (nasal bridge), protruding toward the camera. */}
      <mesh position={[0, height * 0.18, 0.10]} rotation={[Math.PI / 2, 0, 0]} renderOrder={19}>
        <cylinderGeometry args={[0.016, 0.019, 0.045, 20]} />
        <meshStandardMaterial color="#d5e4ee" roughness={0.32} metalness={0.08} />
      </mesh>
      {/* O₂ reservoir / expiratory port on the apex valve. */}
      <mesh position={[0.028, height * 0.18, 0.085]} rotation={[0, 0, Math.PI / 2]} renderOrder={19}>
        <cylinderGeometry args={[0.006, 0.006, 0.03, 12]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.34} metalness={0.04} />
      </mesh>
      {/* Self-inflating bag, extending outward from the apex valve (held toward the clinician). */}
      <group position={[0, height * 0.10, 0.24]} rotation={[0, 0, 0]} renderOrder={18}>
        {/* Long axis along +z: an ellipsoid pointing at the clinician. */}
        <mesh scale={[0.052, 0.052, 0.085]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#3b82c4" roughness={0.42} metalness={0.02} />
        </mesh>
        {/* Bag ribs — circumferential pleats perpendicular to the +z long axis. */}
        {[0.0, 0.35, 0.7].map((t) => (
          <mesh key={`bvm-bag-rib-${t}`} position={[0, 0, 0.085 * (t - 0.35)]}>
            <torusGeometry args={[0.052, 0.004, 6, 20]} />
            <meshStandardMaterial color="#2563a8" roughness={0.5} metalness={0.02} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function AppliedTextureFaceEquipment3D({
  mode,
  position,
  rotation,
  scale,
  width,
  height,
}: {
  mode: FittedFaceEquipmentMode;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  width: number;
  height: number;
}) {
  const texture = useTexture(OXYGEN_SRC[mode]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.max(texture.anisotropy, 4);
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group
      name={`applied-${mode}-mask`}
      position={position}
      rotation={rotation}
      scale={scale}
      raycast={() => null}
    >
      <mesh
        position={[0, height * (mode === 'nonrebreather' || mode === 'nebulizer' ? 0.25 : 0.08), 0.015]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[width * 0.34, mode === 'cpap' ? 0.05 : 0.038, height * 0.26]}
        renderOrder={17}
      >
        <cylinderGeometry args={[0.48, 1, 1, 24, 1, true]} />
        <meshPhysicalMaterial
          color={mode === 'cpap' ? '#bfd7ef' : '#edfaff'}
          // Match the stable clear-plastic shell used by the CPAP interface.
          transparent
          opacity={mode === 'cpap' ? 0.2 : 0.14}
          roughness={0.12}
          metalness={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh renderOrder={18}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.025}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {mode === 'venturi' && (
        <group position={[0, -height * 0.47, 0.028]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={19}>
            <cylinderGeometry args={[0.008, 0.011, 0.035, 14]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.32} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.017, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={19}>
            <cylinderGeometry args={[0.012, 0.012, 0.01, 14]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.04} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AppliedFittedFaceEquipment3D(props: {
  mode: FittedFaceEquipmentMode;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  width: number;
  height: number;
  pilotVolumetricMasks?: boolean;
  tubeExitOffset: [number, number, number];
}) {
  if (props.pilotVolumetricMasks && (props.mode === 'nonrebreather' || props.mode === 'nebulizer')) {
    return <PilotRespiratoryMask3D {...props} mode={props.mode} />;
  }
  if (props.mode === 'bvm') {
    return <AppliedBvmMask3D {...props} />;
  }
  return props.mode === 'cpap'
    ? <AppliedCpapMask3D {...props} />
    : <AppliedTextureFaceEquipment3D {...props} />;
}

function AppliedEndotrachealTube() {
  return (
    <div
      data-applied-equipment="endotracheal-tube"
      data-airway-connection="oral"
      aria-label="Endotracheal tube secured at the mouth with pilot balloon visible"
      className="pointer-events-none relative h-6 w-8 translate-y-[8%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_4px_5px_rgba(2,44,58,0.55)]"
    >
      <img src={TREATMENT_ASSET_PATHS.etTubeSecured} alt="" draggable={false} className="h-full w-full object-contain" />
    </div>
  );
}

function AppliedOropharyngealAirway() {
  return (
    <div
      data-applied-equipment="oropharyngeal-airway"
      data-airway-connection="oral"
      aria-label="OPA flange seated at the lips with the airway opening visible"
      className="pointer-events-none relative h-3 w-3 translate-y-[325%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_3px_4px_rgba(2,44,58,0.5)]"
    >
      <img src={TREATMENT_ASSET_PATHS.opaFlange} alt="" draggable={false} className="h-full w-full object-contain" />
    </div>
  );
}

function AppliedCervicalCollar() {
  return (
    <div
      data-applied-equipment="cervical-collar"
      data-spinal-support="sized-and-fitted"
      aria-label="Sized rigid cervical collar fitted with the chin centred and tracheal opening visible"
      className="pointer-events-none relative h-9 w-16 translate-y-[20%] animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_4px_5px_rgba(2,44,58,0.52)]"
    >
      <img src={TREATMENT_ASSET_PATHS.collarFitted} alt="" draggable={false} className="h-full w-full object-contain" />
    </div>
  );
}

function AppliedMechanicalCprDevice() {
  return (
    <div
      data-applied-equipment="mechanical-cpr-device"
      data-compression-rate="110-per-minute"
      aria-label="Mechanical CPR frame secured with the piston cycling at 110 compressions per minute"
      className="pointer-events-none relative h-20 w-20 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_6px_7px_rgba(2,6,23,0.7)]"
    >
      <img src={TREATMENT_ASSET_PATHS.lucas} alt="" draggable={false} className="h-full w-full object-contain" />
      <span className="applied-lucas-piston absolute left-1/2 top-[36%] h-7 w-2 -translate-x-1/2 rounded-b-full border border-slate-400 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-500 shadow" />
      <span className="absolute left-1/2 top-[69%] h-2.5 w-6 -translate-x-1/2 rounded-full border border-slate-600 bg-slate-200/95 shadow" />
    </div>
  );
}

function AppliedDefibPad({ site }: { site: 'sternal' | 'apical' }) {
  return (
    <div
      data-applied-equipment="defibrillator-pads"
      data-pad-site={site}
      aria-label={`${site === 'sternal' ? 'Sternal' : 'Apical'} defibrillator pad attached`}
      className={`pointer-events-none relative h-11 w-9 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_4px_3px_rgba(2,6,23,0.85)] ${site === 'sternal' ? '-rotate-3' : 'rotate-6'}`}
    >
      <img
        src={site === 'sternal' ? TREATMENT_ASSET_PATHS.defibPadSternal : TREATMENT_ASSET_PATHS.defibPadApical}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function AppliedIvDressing() {
  return (
    <div data-applied-equipment="vascular-access" aria-label="IV cannula secured with transparent dressing, flushed extension and injection port" className="pointer-events-none relative h-12 w-16 -rotate-12 animate-in fade-in zoom-in-75 duration-300 drop-shadow-md">
      {/* ponytail: insertion site — visible catheter under transparent dressing */}
      <span className="absolute left-2 top-3 h-7 w-9 rounded-sm border border-white/95 bg-white/35 shadow-sm backdrop-blur-[2px]" />
      <span className="absolute left-4 top-5 h-1 w-5 rounded-full bg-teal-600 shadow-[0_1px_2px_rgba(13,148,136,0.6)]" />
      <span className="absolute left-[18px] top-[19px] h-1.5 w-2 rounded-sm bg-cyan-400/90 shadow-sm" />
      {/* ponytail: extension tubing — realistic IV extension line */}
      <span className="absolute left-10 top-[21px] h-0.5 w-14 origin-left bg-slate-100/95 shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
      {/* ponytail: injection port — visible three-way or needleless connector */}
      <span className="absolute left-[38px] top-[18px] h-2 w-1.5 rounded-sm border border-cyan-200 bg-cyan-100 shadow-sm" />
      <span className="absolute left-[37px] top-[21px] h-0.5 w-0.5 rounded-full bg-cyan-400" />
    </div>
  );
}

function AppliedLimbEquipment({ treatmentId }: { treatmentId: string }) {
  if (treatmentId === 'active_cooling') {
    return (
      <div
        data-applied-equipment="cooled-burn-dressing"
        aria-label="Burn cooled and covered with a loose non-adherent dressing"
        className="pointer-events-none relative h-14 w-16 -rotate-3 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_4px_5px_rgba(8,47,73,0.5)]"
      >
        <span className="absolute inset-1 rounded-xl border-2 border-cyan-100/90 bg-gradient-to-br from-white/90 via-cyan-100/80 to-sky-200/75 shadow-inner" />
        <span className="absolute left-2 top-3 h-1 w-12 -rotate-6 rounded-full bg-cyan-300/75" />
        <span className="absolute left-2 top-7 h-1 w-12 rotate-3 rounded-full bg-sky-300/70" />
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-sky-950/90 px-1 py-0.5 text-[6px] font-black tracking-wide text-cyan-100">LOOSE</span>
      </div>
    );
  }
  if (treatmentId.includes('tourniquet')) {
    return (
      <div data-applied-equipment="tourniquet" aria-label="Windlass tourniquet secured" className="pointer-events-none relative h-14 w-16 -rotate-6 animate-in fade-in zoom-in-75 drop-shadow-lg">
        <span className="absolute left-0 top-6 h-3 w-full rounded-full bg-slate-950 shadow-[0_2px_4px_rgba(0,0,0,0.65)]" />
        <img src={TREATMENT_ASSET_PATHS.tourniquet} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-amber-100 px-1 py-0.5 text-[6px] font-black tracking-wide text-slate-900 shadow">TIME</span>
      </div>
    );
  }
  if (treatmentId === 'bleeding_control') {
    return (
      <div
        data-applied-equipment="pressure-dressing"
        data-haemorrhage-control="direct-pressure-and-wrap"
        aria-label="Layered pressure dressing wrapped firmly over the bleeding site"
        className="pointer-events-none relative h-12 w-16 -rotate-6 animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_4px_5px_rgba(28,25,23,0.46)]"
      >
        <img src={TREATMENT_ASSET_PATHS.pressureDressing} alt="" draggable={false} className="h-full w-full object-contain" />
      </div>
    );
  }
  if (treatmentId === 'iv_access' || treatmentId === 'io_access') return <AppliedIvDressing />;
  if (treatmentId === 'needle_decompression') return <AppliedChestDevice needle />;
  if (treatmentId.includes('chest_seal') || treatmentId.includes('occlusive')) return <AppliedChestDevice />;
  const traction = treatmentId === 'traction_splint';
  const air = treatmentId === 'air_splint';
  const vacuum = treatmentId === 'vacuum_limb_splint';
  const sam = treatmentId === 'sam_splint';
  const box = treatmentId === 'box_splint';
  if (traction) {
    return (
      <div data-applied-equipment="traction-splint" aria-label="Traction splint secured with maintained longitudinal traction" className="pointer-events-none relative h-32 w-16 -rotate-3 animate-in fade-in zoom-in-75 duration-300 drop-shadow-xl">
        <span className="absolute left-1 top-1 h-[106px] w-1.5 rounded-full border border-white/60 bg-gradient-to-b from-slate-100 via-slate-400 to-slate-200" />
        <span className="absolute right-1 top-1 h-[106px] w-1.5 rounded-full border border-white/60 bg-gradient-to-b from-slate-100 via-slate-400 to-slate-200" />
        <span className="absolute left-0 top-0 h-5 w-full rounded-lg border border-blue-200/60 bg-blue-950 shadow" />
        {[25, 47, 69].map(top => <span key={top} className="absolute left-0 h-2.5 w-full rounded-md border border-slate-300/60 bg-slate-950 shadow" style={{ top: `${top}%` }} />)}
        <span className="absolute bottom-4 left-1/2 h-5 w-12 -translate-x-1/2 rounded-b-xl border-x-4 border-b-4 border-slate-300 bg-slate-900/80" />
        <span className="absolute bottom-0 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-slate-200" />
        <span className="absolute -bottom-1 left-1/2 h-3 w-6 -translate-x-1/2 rounded-full border-2 border-amber-300 bg-slate-800" />
      </div>
    );
  }
  if (sam) {
    return (
      <div data-applied-equipment="sam-splint" aria-label="Moulded SAM splint secured with distal circulation visible" className="pointer-events-none relative h-24 w-11 -rotate-3 animate-in fade-in zoom-in-75 duration-300 drop-shadow-lg">
        <span className="absolute inset-x-1 top-0 h-full rounded-[40%] border-2 border-orange-200 bg-orange-500 shadow-inner" />
        <span className="absolute left-1/2 top-1 h-[88px] w-1 -translate-x-1/2 rounded-full bg-slate-200/90" />
        {[24, 52, 78].map(top => <span key={top} className="absolute left-0 h-2 w-full rounded bg-slate-900/90 shadow" style={{ top: `${top}%` }} />)}
      </div>
    );
  }
  if (box) {
    return (
      <div data-applied-equipment="box-splint" aria-label="Rigid channel splint secured around the injured limb" className="pointer-events-none relative h-24 w-14 animate-in fade-in zoom-in-75 duration-300 drop-shadow-lg">
        <span className="absolute left-0 top-0 h-full w-3 rounded-l-md border border-amber-200 bg-amber-600" />
        <span className="absolute right-0 top-0 h-full w-3 rounded-r-md border border-amber-200 bg-amber-600" />
        <span className="absolute left-2 top-0 h-full w-10 bg-amber-100/35" />
        {[22, 50, 78].map(top => <span key={top} className="absolute left-0 h-2.5 w-full rounded bg-slate-900/90 shadow" style={{ top: `${top}%` }} />)}
      </div>
    );
  }
  return (
    <div data-applied-equipment={air ? 'air-splint' : vacuum ? 'vacuum-splint' : 'limb-splint'} aria-label={air ? 'Clear air splint inflated with distal circulation visible' : vacuum ? 'Vacuum limb splint moulded and evacuated' : 'Limb splint secured'} className={`pointer-events-none relative h-24 w-12 animate-in fade-in zoom-in-75 duration-300 ${air ? 'rounded-2xl border-2 border-cyan-100/80 bg-cyan-100/25 backdrop-blur-[1px]' : vacuum ? 'rounded-2xl border border-blue-800 bg-blue-700/85' : 'rounded-lg bg-orange-500/90'} shadow-lg`}>
      {vacuum && <span className="absolute inset-1 rounded-xl bg-[radial-gradient(circle,rgba(255,255,255,.55)_1px,transparent_2px)] [background-size:7px_7px]" />}
      {[20, 48, 76].map(top => <span key={top} className="absolute left-0 h-2 w-full rounded bg-slate-900/85" style={{ top: `${top}%` }} />)}
    </div>
  );
}

function AppliedPelvicBinder() {
  return (
    <div
      data-applied-equipment="pelvic-binder"
      aria-label="Pelvic binder secured over the greater trochanters"
      className="pointer-events-none relative h-12 w-32 -rotate-1 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_5px_7px_rgba(2,6,23,0.72)]"
    >
      <span className="absolute inset-x-0 top-1.5 h-9 rounded-[13px] border-2 border-slate-500 bg-gradient-to-b from-slate-50 via-slate-200 to-slate-400 shadow-inner" />
      <span className="absolute inset-x-0 top-1.5 h-2 rounded-t-[12px] bg-slate-700/90" />
      <span className="absolute inset-x-0 bottom-1.5 h-2 rounded-b-[12px] bg-slate-700/90" />
      <span className="absolute left-1/2 top-0 h-12 w-10 -translate-x-1/2 rounded-lg border-2 border-slate-800 bg-slate-600 shadow-md" />
      <span className="absolute left-1/2 top-2.5 h-7 w-5 -translate-x-1/2 rounded border-2 border-slate-300 bg-slate-950" />
      <span className="absolute left-[61%] top-[18px] h-3 w-14 rounded-r-md border border-red-950 bg-gradient-to-r from-red-700 to-red-500 shadow" />
      <span className="absolute -right-2 top-[15px] h-5 w-5 rotate-45 rounded-sm border border-red-950 bg-red-600" />
      <span className="absolute left-3 top-[17px] text-[6px] font-black tracking-[0.08em] text-slate-700">TROCHANTERS</span>
    </div>
  );
}

function AppliedFrontOfNeckAirway() {
  return (
    <div
      data-applied-equipment="front-of-neck-airway"
      aria-label="Cuffed front-of-neck airway secured and connected"
      className="pointer-events-none relative h-16 w-16 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_4px_6px_rgba(2,6,23,.8)]"
    >
      <span className="absolute left-1/2 top-4 h-7 w-11 -translate-x-1/2 rounded-lg border-2 border-white/90 bg-slate-100/80 shadow backdrop-blur-[1px]" />
      <span className="absolute left-1/2 top-[23px] h-3 w-5 -translate-x-1/2 rounded-full border-2 border-teal-950 bg-teal-500" />
      <span className="absolute left-1/2 top-[28px] h-8 w-3 -translate-x-1/2 rounded-b-full border-2 border-cyan-100 bg-cyan-100/75" />
      <span className="absolute left-[34px] top-[48px] h-0.5 w-11 origin-left rotate-[24deg] rounded bg-cyan-100 shadow-[0_0_4px_rgba(34,211,238,.75)]" />
      <span className="absolute left-[17px] top-[31px] h-0.5 w-8 -rotate-[22deg] bg-amber-100" />
      <span className="absolute right-[17px] top-[31px] h-0.5 w-8 rotate-[22deg] bg-amber-100" />
    </div>
  );
}

function AppliedGastricDecompressionTube() {
  return (
    <div
      data-applied-equipment="orogastric-tube"
      aria-label="Orogastric tube secured with gastric drainage connected"
      className="pointer-events-none relative h-36 w-24 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_4px_6px_rgba(2,6,23,.72)]"
    >
      <span className="absolute left-7 top-0 h-7 w-9 -rotate-6 rounded-lg border-2 border-white/85 bg-white/55 backdrop-blur-[1px]" />
      <span className="absolute left-[43px] top-3 h-[90px] w-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-500 via-amber-100 to-amber-600 shadow" />
      {[29, 43, 57, 71].map(top => <span key={top} className="absolute left-[44px] h-px w-1.5 bg-amber-900/65" style={{ top }} />)}
      <span className="absolute left-[46px] top-[94px] h-0.5 w-11 origin-left rotate-[34deg] bg-amber-300" />
      <span className="absolute bottom-0 right-0 h-11 w-12 rounded-lg border-2 border-cyan-200/70 bg-cyan-100/30 shadow-inner" />
      <span className="absolute bottom-3 right-1 h-2 w-10 rounded-full bg-cyan-400/35" />
    </div>
  );
}

function AppliedPericardialDrain() {
  return (
    <div
      data-applied-equipment="pericardial-drain"
      aria-label="Pigtail pericardial drain secured to a closed collection system"
      className="pointer-events-none relative h-28 w-28 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_4px_7px_rgba(2,6,23,.78)]"
    >
      <span className="absolute left-[38px] top-2 h-12 w-12 rotate-6 rounded-xl border-2 border-white/90 bg-white/65 shadow backdrop-blur-[1px]" />
      <span className="absolute left-[54px] top-[18px] h-5 w-5 rounded-full border-4 border-cyan-200 border-l-transparent" />
      <span className="absolute left-[58px] top-[42px] h-1 w-14 origin-left rotate-[38deg] rounded-full bg-cyan-100 shadow" />
      <span className="absolute bottom-0 right-0 h-12 w-14 rounded-lg border-2 border-rose-200/75 bg-rose-950/75 shadow-inner" />
      <span className="absolute bottom-2 right-1 h-5 w-12 rounded bg-rose-600/50" />
      <span className="absolute bottom-3 right-2 text-[6px] font-black uppercase tracking-[0.08em] text-rose-100">Measured</span>
    </div>
  );
}

function AppliedTemperatureControlPads() {
  return (
    <div
      data-applied-equipment="temperature-control-pads"
      aria-label="Feedback-controlled surface temperature pads connected to a core-temperature monitor"
      className="pointer-events-none relative h-52 w-36 animate-in fade-in zoom-in-95 duration-500 drop-shadow-[0_5px_8px_rgba(2,6,23,.7)]"
    >
      <span className="absolute left-1/2 top-0 h-[92px] w-[98px] -translate-x-1/2 rounded-[38px_38px_26px_26px] border-2 border-cyan-100/80 bg-gradient-to-br from-cyan-50/78 via-sky-400/58 to-cyan-700/72 shadow-inner" />
      <span className="absolute left-[24px] top-[104px] h-[93px] w-[37px] rotate-2 rounded-2xl border-2 border-cyan-100/75 bg-sky-500/58 shadow-inner" />
      <span className="absolute right-[24px] top-[104px] h-[93px] w-[37px] -rotate-2 rounded-2xl border-2 border-cyan-100/75 bg-sky-500/58 shadow-inner" />
      <span className="absolute left-[13px] top-[55px] h-1.5 w-[58px] -rotate-[22deg] rounded-full bg-cyan-100" />
      <span className="absolute right-[13px] top-[55px] h-1.5 w-[58px] rotate-[22deg] rounded-full bg-sky-400" />
      <span className="absolute -left-[2px] top-[22px] flex h-11 w-12 flex-col items-center justify-center rounded-lg border-2 border-slate-400 bg-slate-950 text-[6px] font-black uppercase tracking-[0.08em] text-cyan-100 shadow-lg"><em className="not-italic text-[12px] leading-none text-white">37.5°</em>target</span>
      <span className="absolute left-1/2 top-[82px] h-[104px] w-1 -translate-x-1/2 bg-amber-300" aria-hidden="true" />
    </div>
  );
}

function AppliedTorsoCover({ cooling }: { cooling: boolean }) {
  return (
    <div data-applied-equipment={cooling ? 'active-cooling' : 'warming-blanket'} className={`pointer-events-none h-40 w-28 rounded-[28px] border shadow-xl animate-in fade-in zoom-in-95 duration-500 ${cooling ? 'border-cyan-100/80 bg-gradient-to-b from-cyan-100/55 via-sky-300/45 to-cyan-100/50' : 'border-amber-100/70 bg-[linear-gradient(125deg,rgba(254,243,199,.88),rgba(180,83,9,.62),rgba(254,243,199,.82))]'}`}>
      <div className="h-full w-full rounded-[inherit] bg-[repeating-linear-gradient(100deg,transparent_0,transparent_13px,rgba(255,255,255,.24)_14px,transparent_16px)]" />
    </div>
  );
}

function AppliedImmobilisationDevice({ mode }: { mode: NonNullable<AppliedEquipmentVisualState['immobilisationDevice']> }) {
  if (mode === 'head-blocks') {
    return <div data-applied-equipment="head-blocks" className="pointer-events-none relative h-20 w-28 animate-in fade-in zoom-in-95"><span className="absolute left-1 top-2 h-16 w-7 rounded-lg bg-orange-500 shadow-lg" /><span className="absolute right-1 top-2 h-16 w-7 rounded-lg bg-orange-500 shadow-lg" /><span className="absolute left-4 top-8 h-3 w-20 rounded bg-slate-900/80" /></div>;
  }
  if (mode === 'ked') {
    return <div data-applied-equipment="ked" className="pointer-events-none relative h-36 w-28 rounded-[30px] border-4 border-amber-500 bg-amber-400/55 shadow-xl animate-in fade-in zoom-in-95">{[22, 48, 74].map(top => <span key={top} className="absolute left-0 h-3 w-full bg-slate-900/80" style={{ top: `${top}%` }} />)}</div>;
  }
  if (mode === 'scoop') {
    return <div data-applied-equipment="scoop" className="pointer-events-none relative h-52 w-24 animate-in fade-in zoom-in-95"><span className="absolute left-1 top-0 h-full w-8 rounded-full border-4 border-slate-300 bg-slate-500/50 shadow-xl" /><span className="absolute right-1 top-0 h-full w-8 rounded-full border-4 border-slate-300 bg-slate-500/50 shadow-xl" />{[18, 42, 66, 84].map(top => <span key={top} className="absolute left-5 h-2 w-14 bg-slate-800" style={{ top: `${top}%` }} />)}</div>;
  }
  const vacuum = mode === 'vacuum-mattress';
  return (
    <div data-applied-equipment={vacuum ? 'vacuum-mattress' : 'spinal-board'} className={`pointer-events-none relative h-52 w-28 rounded-[38px] border-4 shadow-xl animate-in fade-in zoom-in-95 ${vacuum ? 'border-blue-800 bg-blue-600/70' : 'border-yellow-500 bg-yellow-400/75'}`}>
      {[22, 46, 70].map(top => <span key={top} className="absolute left-0 h-3 w-full bg-slate-900/80" style={{ top: `${top}%` }} />)}
      {vacuum && <div className="absolute inset-2 rounded-[30px] bg-[radial-gradient(circle,rgba(255,255,255,.28)_1px,transparent_2px)] [background-size:10px_10px]" />}
    </div>
  );
}

function AppliedChestDevice({ needle = false }: { needle?: boolean }) {
  return needle ? (
    <div data-applied-equipment="decompression-catheter" className="pointer-events-none relative h-12 w-12 animate-in fade-in zoom-in-75"><span className="absolute left-5 top-0 h-9 w-1 rotate-12 rounded bg-orange-400 shadow" /><span className="absolute left-[17px] top-0 h-3 w-2 rotate-12 rounded-sm bg-cyan-400" /><span className="absolute left-6 top-8 h-px w-14 rotate-[20deg] bg-slate-100" /></div>
  ) : (
    <div data-applied-equipment="chest-seal" className="pointer-events-none relative h-14 w-14 animate-in fade-in zoom-in-75"><span className="absolute inset-1 rotate-6 rounded-lg border-2 border-white/90 bg-slate-100/65 shadow-lg backdrop-blur-[1px]" /><span className="absolute left-[23px] top-[18px] h-5 w-2 rounded-full border border-slate-400 bg-white/70" /></div>
  );
}

function AppliedNewbornSkinToSkin() {
  return (
    <div
      data-applied-equipment="newborn-skin-to-skin"
      aria-label="Newborn dried, capped, swaddled and positioned skin-to-skin"
      className="pointer-events-none relative flex h-24 w-16 items-center justify-center -rotate-6 animate-in fade-in zoom-in-75 duration-500 drop-shadow-[0_7px_8px_rgba(2,6,23,.58)]"
    >
      <img
        src={TREATMENT_ASSET_PATHS.newbornSwaddled}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function siteEquipmentLabel(treatmentId: string): string {
  if (treatmentId === 'active_cooling') return 'Cooled burn dressing';
  if (treatmentId.includes('tourniquet')) return 'Tourniquet';
  if (treatmentId === 'bleeding_control') return 'Pressure dressing';
  if (treatmentId === 'iv_access') return 'IV access';
  if (treatmentId === 'io_access') return 'IO access';
  if (treatmentId === 'needle_decompression') return 'Decompression catheter';
  if (treatmentId.includes('chest_seal') || treatmentId.includes('occlusive')) return 'Chest seal';
  if (treatmentId === 'traction_splint') return 'Traction splint';
  if (treatmentId === 'sam_splint') return 'SAM splint';
  if (treatmentId === 'box_splint') return 'Box splint';
  if (treatmentId === 'vacuum_limb_splint') return 'Vacuum limb splint';
  if (treatmentId === 'air_splint') return 'Air splint';
  if (treatmentId.includes('splint')) return 'Limb splint';
  return treatmentId.replaceAll('_', ' ');
}

function siteEquipmentAsset(treatmentId: string): string {
  if (treatmentId === 'active_cooling') return TREATMENT_ASSET_PATHS.coolingPack;
  if (treatmentId.includes('tourniquet')) return TREATMENT_ASSET_PATHS.tourniquet;
  if (treatmentId === 'bleeding_control') return TREATMENT_ASSET_PATHS.bandage;
  if (treatmentId === 'iv_access' || treatmentId === 'io_access') return TREATMENT_ASSET_PATHS.ivCannula;
  if (treatmentId === 'needle_decompression') return TREATMENT_ASSET_PATHS.needle;
  if (treatmentId.includes('chest_seal') || treatmentId.includes('occlusive')) return TREATMENT_ASSET_PATHS.bandage;
  if (treatmentId === 'traction_splint') return '/equipment-assets/traction-splint.webp';
  if (treatmentId === 'vacuum_limb_splint') return '/equipment-assets/vacuum-limb-splint.webp';
  if (treatmentId === 'air_splint') return '/equipment-assets/air-splint.webp';
  if (treatmentId === 'box_splint') return '/equipment-assets/box-splint.webp';
  if (treatmentId === 'sam_splint') return '/equipment-assets/sam-splint.webp';
  return '/equipment-assets/splints.webp';
}

/** Scene/bay kit hotspots — spot gear beside the patient, then open that jump
 *  bag in the Treat rail. Complements the 3D SceneJumpBags props with reliable
 *  DOM hit targets (OrbitControls-safe). */
function BayKitHotspots({
  recommendedTab,
  onOpenKit,
  showFirstAid = false,
}: {
  recommendedTab: ManagementTab;
  onOpenKit?: (tab: ManagementTab, search?: string) => void;
  showFirstAid?: boolean;
}) {
  if (!onOpenKit) return null;
  const kits: Array<{ key: ManagementTab; label: string; image: string; hint: string; search?: string }> = [
    { key: 'airway', label: 'Airway', image: '/bag-assets/airway-bag.webp', hint: 'OPA · suction · tube' },
    { key: 'breathing', label: 'Breathing', image: '/bag-assets/breathing-bag.webp', hint: 'O₂ · neb · BVM' },
    { key: 'breathing', label: 'Oxygen', image: '/equipment-assets/oxygen-cylinder.webp', hint: 'Cylinder → NRB', search: 'Non-Rebreather' },
    { key: 'circulation', label: 'Circulation', image: '/bag-assets/circulation-kit.webp', hint: 'IV · CPR · pads' },
    { key: 'medications', label: 'Meds', image: '/bag-assets/medication-pouch.webp', hint: 'Drugs · doses' },
    ...(showFirstAid
      ? [{ key: 'exposure' as const, label: 'First aid', image: '/bag-assets/medication-pouch.webp', hint: 'Cabinet · dressings', search: 'Dressing' }]
      : []),
  ];
  return (
    <div
      className="bay-kit-hotspots pointer-events-auto absolute bottom-3 left-3 z-20 flex max-w-[52%] flex-col gap-1.5"
      data-bay-hotspot-strip="true"
      role="group"
      aria-label="Scene kits — spot gear, open kit, treat"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-100/80 shadow-md backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.85)]" />
        Spot gear · open kit
      </div>
      <div className="flex flex-wrap gap-1.5">
        {kits.map(kit => {
          const isRecommended = kit.key === recommendedTab && !kit.search;
          return (
            <button
              key={`${kit.key}-${kit.label}`}
              type="button"
              data-bay-hotspot={kit.label.toLowerCase().replace(/\s+/g, '-')}
              data-recommended={isRecommended ? 'true' : 'false'}
              aria-label={`Open ${kit.label} kit from scene`}
              title={`${kit.label} kit — ${kit.hint}${isRecommended ? ' · matches this case' : ''}`}
              onClick={() => onOpenKit(kit.key, kit.search)}
              className={`group flex items-center gap-1.5 rounded-xl border py-1 pl-1 pr-2.5 text-left shadow-md backdrop-blur-md transition hover:-translate-y-0.5 active:scale-95 ${
                isRecommended
                  ? 'border-emerald-300/55 bg-emerald-500/25 ring-1 ring-emerald-300/40'
                  : 'border-white/15 bg-slate-950/70 hover:border-white/35 hover:bg-slate-900/80'
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                <img src={kit.image} alt="" className="h-8 w-8 object-contain" draggable={false} />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold text-white">{kit.label}</span>
                <span className="block truncate text-[8px] text-cyan-100/70">
                  {isRecommended ? 'For this case · tap to open' : kit.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact, fixed corner list of everything currently applied — restores the
// labels the on-body pins omit, without floating cards over the patient.
function AppliedEquipmentTray({ appliedTreatmentIds }: { appliedTreatmentIds: string[] }) {
  const equipment = useMemo(() => buildTreatmentEquipmentState(appliedTreatmentIds), [appliedTreatmentIds]);
  const siteTreatmentIds = new Set(equipment.siteControls.map(control => control.treatmentId));
  const chips: Array<{ src: string; label: string; oxygenMode?: OxygenEquipmentVisual['mode'] }> = [];
  if (equipment.oxygen) chips.push({ src: OXYGEN_SRC[equipment.oxygen.mode], label: equipment.oxygen.label, oxygenMode: equipment.oxygen.mode });
  if (equipment.hasEtTube && equipment.oxygen?.mode !== 'ventilator') chips.push({ src: TREATMENT_ASSET_PATHS.etTube, label: 'ET tube' });
  if (equipment.hasOpa && !equipment.hasEtTube) chips.push({ src: TREATMENT_ASSET_PATHS.opa, label: 'OPA inserted' });
  if (equipment.hasFluids) chips.push({ src: TREATMENT_ASSET_PATHS.ivPole, label: 'Fluids running' });
  else if (equipment.hasIvAccess) chips.push({ src: TREATMENT_ASSET_PATHS.ivCannula, label: 'IV access' });
  if (equipment.hasDefibPads) chips.push({ src: TREATMENT_ASSET_PATHS.defibPads, label: 'Defib pads on' });
  if (equipment.hasLucas) chips.push({ src: TREATMENT_ASSET_PATHS.lucas, label: 'LUCAS running' });
  if (equipment.hasCollar) chips.push({ src: TREATMENT_ASSET_PATHS.collar, label: 'C-collar applied' });
  if (equipment.hasChestSeal && ![...siteTreatmentIds].some(id => id.includes('chest_seal') || id.includes('occlusive'))) chips.push({ src: TREATMENT_ASSET_PATHS.bandage, label: 'Chest seal adhered' });
  if (equipment.hasNeedleDecompression && !siteTreatmentIds.has('needle_decompression')) chips.push({ src: TREATMENT_ASSET_PATHS.needle, label: 'Decompression catheter' });
  if (equipment.hasPelvicBinder) chips.push({ src: TREATMENT_ASSET_PATHS.pelvicBinder, label: 'Pelvic binder secured' });
  if (equipment.hasSurgicalAirway) chips.push({ src: TREATMENT_ASSET_PATHS.fonaKit, label: 'FONA tube secured' });
  if (equipment.hasGastricTube) chips.push({ src: TREATMENT_ASSET_PATHS.gastricTubeKit, label: 'Gastric decompression active' });
  if (equipment.hasPericardialDrain) chips.push({ src: TREATMENT_ASSET_PATHS.pericardiocentesisKit, label: 'Pericardial drain secured' });
  if (equipment.hasTemperatureControl) chips.push({ src: TREATMENT_ASSET_PATHS.temperatureControlPads, label: 'Temperature feedback active' });
  if (equipment.hasWarmingBlanket) chips.push({ src: TREATMENT_ASSET_PATHS.warmingBlanket, label: 'Warming blanket' });
  if (equipment.hasActiveCooling) chips.push({ src: TREATMENT_ASSET_PATHS.coolingPack, label: 'Active cooling' });
  if (equipment.hasCompletedDelivery) chips.push({ src: TREATMENT_ASSET_PATHS.deliveryKit, label: 'Birth assisted · mother + newborn' });
  if (equipment.immobilisationDevice) {
    const assets = { 'spinal-board': TREATMENT_ASSET_PATHS.spineBoard, scoop: TREATMENT_ASSET_PATHS.scoop, 'vacuum-mattress': TREATMENT_ASSET_PATHS.vacuumMattress, 'head-blocks': TREATMENT_ASSET_PATHS.headBlocks, ked: TREATMENT_ASSET_PATHS.ked };
    chips.push({ src: assets[equipment.immobilisationDevice], label: equipment.immobilisationDevice.replace('-', ' ') });
  }
  equipment.siteControls.forEach(control => chips.push({
    src: siteEquipmentAsset(control.treatmentId),
    label: `${siteEquipmentLabel(control.treatmentId)} · ${control.target.replace('-', ' ')}`,
  }));
  if (chips.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex max-w-[44%] flex-col items-end gap-1.5">
      {chips.map((chip, i) => (
        <div
          key={i}
          data-applied-equipment={chip.oxygenMode}
          data-airway-connection={chip.oxygenMode ? 'face' : undefined}
          data-oxygen-connected={chip.oxygenMode ? 'true' : undefined}
          data-patient-anchored={chip.oxygenMode && getFittedFaceEquipmentSpec(chip.oxygenMode) ? 'true' : undefined}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 py-0.5 pl-0.5 pr-2.5 text-[10px] font-medium text-white/90 shadow-md backdrop-blur-md"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
            <img src={chip.src} alt="" className="h-3.5 w-3.5 object-contain" draggable={false} />
          </span>
          {chip.label}
        </div>
      ))}
    </div>
  );
}

// Per-device graphic components removed — the overlay now renders small
// EquipmentPin markers driven directly by TREATMENT_ASSET_PATHS / OXYGEN_SRC.

function FaceEquipmentFrame({ frame, children }: { frame: THREE.Group | null; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    if (frame) {
      frame.updateWorldMatrix(true, false);
      group.current.matrix.copy(frame.matrixWorld);
    } else {
      group.current.matrix.identity();
    }
    group.current.matrixWorldNeedsUpdate = true;
  });
  return <group ref={group} name="fitted-face-equipment" matrixAutoUpdate={false}>{children}</group>;
}

function TreatmentEquipmentOverlay({
  appliedTreatmentIds,
  sampler,
  presentation,
  bayStage = 'stretcher',
  posture = null,
  mobility = 'recumbent',
  patientScale = 1,
  faceAttachment = null,
  seatedSupportLift = 0,
  plantOffset,
  pilotVolumetricMasks = false,
}: {
  appliedTreatmentIds: string[];
  sampler: SurfaceSampler | null;
  presentation: MarkerPresentation;
  bayStage?: BayPatientStage;
  posture?: PatientPosture;
  mobility?: PatientMobility;
  patientScale?: number;
  faceAttachment?: THREE.Group | null;
  seatedSupportLift?: number;
  plantOffset?: { x?: number; z?: number };
  pilotVolumetricMasks?: boolean;
}) {
  const equipment = useMemo(
    () => buildTreatmentEquipmentState(appliedTreatmentIds),
    [appliedTreatmentIds],
  );
  const hasVisibleEquipment = equipment.oxygen
    || equipment.hasIvAccess
    || equipment.hasDefibPads
    || equipment.hasLucas
    || equipment.hasEtTube
    || equipment.hasOpa
    || equipment.hasCollar
    || equipment.hasChestSeal
    || equipment.hasNeedleDecompression
    || equipment.hasPelvicBinder
    || equipment.hasSurgicalAirway
    || equipment.hasGastricTube
    || equipment.hasPericardialDrain
    || equipment.hasTemperatureControl
    || equipment.hasWarmingBlanket
    || equipment.hasActiveCooling
    || equipment.hasCompletedDelivery
    || equipment.immobilisationDevice
    || equipment.siteControls.length > 0;

  if (!hasVisibleEquipment) return null;

  const anchor = (x: number, y: number, z: number): [number, number, number] =>
    sampler ? sampler(x, y) : [x, y, z];
  // Treatment-bay patients are root-transformed and may be posed by morphs.
  // The surface sampler is derived from the un-morphed geometry, which put
  // face equipment on a tripod patient's clavicle. Use the clinical head
  // frame for airway devices so masks remain fitted after the posture changes.
  const faceAnchor = (x: number, y: number, z: number): [number, number, number] =>
    presentation === 'treatment-bay'
      ? treatmentBayClinicalToWorld([x, y, z], bayStage, posture, mobility, patientScale, seatedSupportLift, plantOffset)
      : anchor(x, y, z);
  const faceRotation: [number, number, number] = presentation === 'treatment-bay'
    ? getTreatmentBayTransform(bayStage, posture, mobility, patientScale, seatedSupportLift, plantOffset).rotation
    : [0, 0, 0];
  const faceEquipmentScale = presentation === 'treatment-bay'
    ? getTreatmentBayTransform(bayStage, posture, mobility, patientScale, seatedSupportLift, plantOffset).scale * patientScale
    : 1;
  const fittedFaceSpec = getFittedFaceEquipmentSpec(equipment.oxygen?.mode);
  const fittedAnchor = (x: number, y: number, z: number): [number, number, number] =>
    faceAttachment ? [x, y, z] : faceAnchor(x, y, z);
  // Texture silhouettes alone collapse edge-on. A patient-space harness keeps
  // every fitted mask visibly wrapped around the head from oblique views.
  // BVM is held by a two-handed C–E grip, never strapped, so it is excluded.
  const oxygenMaskNeedsHarness = fittedFaceSpec != null && fittedFaceSpec.mode !== 'bvm';
  const pilotHarnessAnchors = pilotVolumetricMasks && fittedFaceSpec
    && (fittedFaceSpec.mode === 'nonrebreather' || fittedFaceSpec.mode === 'nebulizer')
    ? pilotRespiratoryMaskGeometry(fittedFaceSpec.mode, fittedFaceSpec.width, fittedFaceSpec.height, [0, 0, 0])
      .strapAnchors.map(point => fittedAnchor(
        point[0] + fittedFaceSpec.centre[0],
        point[1] + fittedFaceSpec.centre[1],
        point[2] + fittedFaceSpec.centre[2],
      ))
    : null;
  const faceHarnessPoints: Array<[number, number, number]> = fittedFaceSpec?.mode === 'cpap'
    ? [
        fittedAnchor(-0.068, 1.66, 0.03),
        fittedAnchor(-0.084, 1.67, -0.08),
        fittedAnchor(0.084, 1.67, -0.08),
        fittedAnchor(0.068, 1.66, 0.03),
      ]
    // The pilot's occiput is at z=-0.187 in its clinical head frame.
    // Wrap the elastic behind it and around the ears, not through the skull.
    : pilotHarnessAnchors ? [
        pilotHarnessAnchors[0],
        fittedAnchor(-0.077, 1.657, -0.045),
        fittedAnchor(-0.092, 1.665, -0.10),
        fittedAnchor(-0.071, 1.665, -0.143),
        fittedAnchor(-0.042, 1.665, -0.177),
        fittedAnchor(0, 1.665, -0.192),
        fittedAnchor(0.042, 1.665, -0.177),
        fittedAnchor(0.071, 1.665, -0.143),
        fittedAnchor(0.092, 1.665, -0.10),
        fittedAnchor(0.077, 1.657, -0.045),
        pilotHarnessAnchors[1],
      ] : [
        fittedAnchor(-0.064, 1.635, 0.03),
        fittedAnchor(-0.082, 1.665, -0.08),
        fittedAnchor(0.082, 1.665, -0.08),
        fittedAnchor(0.064, 1.635, 0.03),
      ];
  const equipmentScale = Math.max(0.62, Math.min(1, 0.55 + patientScale * 0.45));
  const hasSiteAccess = equipment.siteControls.some(control => control.treatmentId === 'iv_access' || control.treatmentId === 'io_access');
  const hasSiteChestSeal = equipment.siteControls.some(control => control.treatmentId.includes('chest_seal') || control.treatmentId.includes('occlusive'));
  const hasSiteNeedleDecompression = equipment.siteControls.some(control => control.treatmentId === 'needle_decompression');

  const fittedEquipment = <>
      {oxygenMaskNeedsHarness && (
        <>
          {pilotHarnessAnchors ? (
            <PilotMaskStrap3D points={faceHarnessPoints} />
          ) : (
            <SceneCable
              points={faceHarnessPoints}
              color={fittedFaceSpec?.mode === 'cpap' ? '#5c78a4' : '#0f7158'}
              opacity={0.72}
              radius={fittedFaceSpec?.mode === 'cpap' ? 0.0036 : 0.0024}
            />
          )}
          {fittedFaceSpec?.mode === 'cpap' && (
            <SceneCable
              points={[
                fittedAnchor(-0.07, 1.59, 0.03),
                fittedAnchor(-0.088, 1.60, -0.085),
                fittedAnchor(0.088, 1.60, -0.085),
                fittedAnchor(0.07, 1.59, 0.03),
              ]}
              color="#5c78a4"
              opacity={0.82}
              radius={0.004}
            />
          )}
        </>
      )}

      {equipment.oxygen && fittedFaceSpec && !equipment.hasSurgicalAirway && !(equipment.hasEtTube && fittedFaceSpec.mode === 'bvm') && (
        <>
          <AppliedFittedFaceEquipment3D
            mode={fittedFaceSpec.mode}
            pilotVolumetricMasks={pilotVolumetricMasks}
            tubeExitOffset={[
              fittedFaceSpec.tubeExit[0] - fittedFaceSpec.centre[0],
              fittedFaceSpec.tubeExit[1] - fittedFaceSpec.centre[1],
              fittedFaceSpec.tubeExit[2] - fittedFaceSpec.centre[2],
            ]}
            position={fittedAnchor(...fittedFaceSpec.centre)}
            rotation={faceAttachment ? [0, 0, 0] : faceRotation}
            scale={faceAttachment ? 1 : faceEquipmentScale}
            width={fittedFaceSpec.width}
            height={fittedFaceSpec.height}
          />
          <MarkerHtml
            position={fittedAnchor(...fittedFaceSpec.centre)}
            zIndexRange={[0, 0]}
            interactive={false}
            surfaceAware={false}
          >
            <span
              className="sr-only"
            >
              {fittedFaceSpec.mode === 'bvm'
                ? 'Bag-valve-mask held with a two-handed face seal'
                : `${equipment.oxygen.label} fitted over the nose and mouth`}
            </span>
          </MarkerHtml>
        </>
      )}

    </>;

  return (
    <>
      <FaceEquipmentFrame frame={faceAttachment}>{fittedEquipment}</FaceEquipmentFrame>
      {equipment.oxygen && (!fittedFaceSpec || (equipment.hasEtTube && fittedFaceSpec.mode === 'bvm')) && !equipment.hasSurgicalAirway && (
        <MarkerHtml
          position={faceAnchor(0.01, 1.66, 0.24)}
          distanceFactor={1.5}
          zIndexRange={[76, 0]}
          interactive={false}
          presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation}
          contentScale={equipmentScale}
          surfaceAware={false}
        >
          <WornFaceEquipment
            equipment={equipment.oxygen}
            connectedToEtTube={equipment.hasEtTube && equipment.oxygen.mode === 'bvm'}
          />
        </MarkerHtml>
      )}

      {equipment.hasEtTube && equipment.oxygen?.mode !== 'ventilator' && (
        <MarkerHtml position={faceAnchor(0, 1.64, 0.24)} distanceFactor={2.4} zIndexRange={[74, 0]} interactive={false} presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation} contentScale={equipmentScale} surfaceAware={false}>
          <AppliedEndotrachealTube />
        </MarkerHtml>
      )}

      {equipment.hasCompletedDelivery && (
        <MarkerHtml
          position={faceAnchor(0.03, 1.3, 0.27)}
          distanceFactor={2.25}
          zIndexRange={[77, 0]}
          interactive={false}
          presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation}
          contentScale={equipmentScale}
          surfaceAware={false}
        >
          <AppliedNewbornSkinToSkin />
        </MarkerHtml>
      )}

      {equipment.hasOpa && !equipment.hasEtTube && (
        <MarkerHtml position={faceAnchor(0, 1.64, 0.24)} distanceFactor={2.4} zIndexRange={[73, 0]} interactive={false} presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation} contentScale={equipmentScale} surfaceAware={false}>
          <AppliedOropharyngealAirway />
        </MarkerHtml>
      )}

      {equipment.hasIvAccess && !hasSiteAccess && (
        <MarkerHtml position={anchor(-0.205, 0.82, 0.2)} distanceFactor={2.5} zIndexRange={[72, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedIvDressing />
        </MarkerHtml>
      )}

      {equipment.hasDefibPads && (
        <>
          <MarkerHtml position={anchor(-0.03, 1.23, 0.225)} distanceFactor={1.85} zIndexRange={[68, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
            <AppliedDefibPad site="sternal" />
          </MarkerHtml>
          <MarkerHtml position={anchor(0.15, 1.15, 0.223)} distanceFactor={1.85} zIndexRange={[68, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
            <AppliedDefibPad site="apical" />
          </MarkerHtml>
        </>
      )}

      {equipment.hasLucas && (
        <MarkerHtml position={anchor(0, 1.19, 0.22)} distanceFactor={2.6} zIndexRange={[69, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedMechanicalCprDevice />
        </MarkerHtml>
      )}

      {equipment.hasCollar && (
        <MarkerHtml position={faceAnchor(0, 1.47, 0.22)} distanceFactor={2.0} zIndexRange={[72, 0]} interactive={false} presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation} contentScale={equipmentScale} surfaceAware={false}>
          <AppliedCervicalCollar />
        </MarkerHtml>
      )}

      {equipment.hasChestSeal && !hasSiteChestSeal && (
        <MarkerHtml position={anchor(-0.08, 1.25, 0.225)} distanceFactor={2.2} zIndexRange={[72, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedChestDevice />
        </MarkerHtml>
      )}

      {equipment.hasNeedleDecompression && !hasSiteNeedleDecompression && (
        <MarkerHtml position={anchor(0.13, 1.24, 0.225)} distanceFactor={2.3} zIndexRange={[73, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedChestDevice needle />
        </MarkerHtml>
      )}

      {equipment.hasPelvicBinder && (
        <MarkerHtml position={anchor(0, 0.88, 0.245)} distanceFactor={2.15} zIndexRange={[71, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedPelvicBinder />
        </MarkerHtml>
      )}

      {equipment.hasSurgicalAirway && (
        <MarkerHtml position={faceAnchor(0, 1.47, 0.235)} distanceFactor={1.95} zIndexRange={[74, 0]} interactive={false} presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation} contentScale={equipmentScale} surfaceAware={false}>
          <AppliedFrontOfNeckAirway />
        </MarkerHtml>
      )}

      {equipment.hasGastricTube && (
        <MarkerHtml position={faceAnchor(0.035, 1.61, 0.245)} distanceFactor={2.05} zIndexRange={[73, 0]} interactive={false} presentation={posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' ? 'upright' : presentation} contentScale={equipmentScale} surfaceAware={false}>
          <AppliedGastricDecompressionTube />
        </MarkerHtml>
      )}

      {equipment.hasPericardialDrain && (
        <MarkerHtml position={anchor(-0.04, 1.14, 0.25)} distanceFactor={2.1} zIndexRange={[73, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedPericardialDrain />
        </MarkerHtml>
      )}

      {equipment.hasTemperatureControl && (
        <MarkerHtml position={anchor(0, 1.03, 0.28)} distanceFactor={2.45} zIndexRange={[69, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedTemperatureControlPads />
        </MarkerHtml>
      )}

      {(equipment.hasWarmingBlanket || equipment.hasActiveCooling) && (
        <MarkerHtml position={anchor(0, 1.02, 0.27)} distanceFactor={2.5} zIndexRange={[60, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedTorsoCover cooling={equipment.hasActiveCooling} />
        </MarkerHtml>
      )}

      {equipment.immobilisationDevice && (
        <MarkerHtml position={anchor(0, 0.9, 0.08)} distanceFactor={3.0} zIndexRange={[54, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
          <AppliedImmobilisationDevice mode={equipment.immobilisationDevice} />
        </MarkerHtml>
      )}

      {equipment.siteControls.map(control => {
        const siteAnchor: Record<AppliedProcedureSite, [number, number, number]> = {
          head: [0, 1.63, 0.22], face: [0, 1.58, 0.23], neck: [0, 1.47, 0.22], airway: [0, 1.52, 0.22],
          chest: [0, 1.25, 0.23], 'right-chest': [-0.1, 1.25, 0.23], 'left-chest': [0.1, 1.25, 0.23],
          abdomen: [0, 1.02, 0.25], pelvis: [0, 0.9, 0.24],
          'right-arm': [-0.2, 1.08, 0.2], 'left-arm': [0.2, 1.08, 0.2],
          'right-leg': [-0.16, 0.43, 0.2], 'left-leg': [0.16, 0.43, 0.2], back: [0, 1.12, -0.2],
        };
        const point = siteAnchor[control.target] ?? siteAnchor.chest;
        return (
          <MarkerHtml key={`${control.treatmentId}-${control.target}`} position={anchor(...point)} distanceFactor={2.5} zIndexRange={[70, 0]} interactive={false} presentation={presentation} contentScale={equipmentScale}>
            <AppliedLimbEquipment treatmentId={control.treatmentId} />
          </MarkerHtml>
        );
      })}
    </>
  );
}

function getAirwayCue(caseData: CaseScenario): { status: string; cues: string[]; compromised: boolean } {
  const airway = caseData.abcde?.airway;
  const findings = airway?.findings || [];
  const cues = findings.length > 0 ? findings : ['No visible obstruction', 'No gurgling or stridor', 'Airway patent on first look'];
  return {
    status: airway?.patent ? 'Patent' : 'Compromised',
    cues,
    compromised: airway?.patent === false,
  };
}

function getWorkflowForRegion(regionId: string | null): string[] {
  switch (regionId) {
    case 'head':
      return ['Inspect scalp and hairline', 'Palpate skull and facial bones', 'Check ears for blood or CSF', 'Move to eyes, lips, mouth, and speech', 'Escalate any altered LOC or head injury signs'];
    case 'face':
      return ['Inspect face, eyes, lips, and gaze', 'Measure pupils in mm', 'Compare equality', 'Assess direct and consensual response', 'Check oral cavity, speech, and facial symmetry'];
    case 'neck-cspine':
      return ['Maintain C-spine awareness', 'Look into mouth and listen at neck', 'Check tracheal position', 'Assess JVD and neck swelling', 'Palpate for crepitus or midline tenderness'];
    case 'chest':
      return ['Expose chest', 'Inspect breathing pattern and chest rise', 'Palpate expansion and crepitus', 'Percuss both sides', 'Auscultate apices, bases, and heart'];
    case 'abdomen':
      return ['Inspect before touching', 'Auscultate RUQ, LUQ, RLQ, LLQ', 'Percuss each quadrant', 'Palpate away from pain first', 'Note guarding, rigidity, distension'];
    case 'right-arm':
    case 'left-arm':
      return ['Inspect from shoulder to fingers', 'Palpate joints and long bones', 'Check radial pulse and CRT', 'Test sensation', 'Test motor function and grip'];
    case 'right-leg':
    case 'left-leg':
      return ['Inspect limb alignment and wounds', 'Palpate femur, knee, tib/fib, ankle, foot', 'Check DP/PT pulses and CRT', 'Assess sensation and motor', 'Screen compartments'];
    case 'posterior-logroll':
      return ['Assign C-spine control', 'Log roll on command', 'Inspect posterior surface', 'Palpate whole spine', 'Return patient safely'];
    default:
      return ['Select a region', 'Inspect first', 'Palpate only when indicated', 'Compare sides', 'Document what you find'];
  }
}

function getWorkflowStepForAction(regionId: string | null, actionId: string | null): number | null {
  if (!regionId || !actionId) return null;

  if (regionId === 'head') {
    if (actionId === 'scalp-inspect') return 0;
    if (actionId === 'scalp-palpate') return 1;
    if (actionId === 'ears-inspect') return 2;
  }

  if (regionId === 'face') {
    if (actionId === 'eyes-inspect' || actionId === 'lips-inspect') return 0;
    if (actionId === 'pupils-size') return 1;
    if (actionId === 'pupils-equality') return 2;
    if (actionId === 'pupils-reactivity') return 3;
    if (actionId.includes('mouth') || actionId.includes('teeth') || actionId.includes('tongue') || actionId === 'face-symmetry-inspect' || actionId === 'face-speech') return 4;
  }

  if (regionId === 'neck-cspine') {
    if (actionId === 'cspine-inspect') return 0;
    if (actionId === 'mouth-inspect' || actionId === 'airway-listen') return 1;
    if (actionId === 'trachea-palpate') return 2;
    if (actionId === 'jvd-inspect') return 3;
    if (actionId === 'neck-emphysema' || actionId === 'cspine-palpate') return 4;
  }

  if (regionId === 'chest') {
    if (actionId === 'chest-inspect') return 1;
    if (actionId === 'chest-palpate') return 2;
    if (actionId === 'chest-percuss') return 3;
    if (actionId === 'chest-auscultate-lungs' || actionId === 'chest-auscultate-heart' || actionId.startsWith('chest-auscultate-')) return 4;
  }

  if (regionId === 'abdomen') {
    if (actionId === 'abd-inspect') return 0;
    if (actionId === 'abd-auscultate' || (actionId.startsWith('abd-') && actionId.includes('auscultate'))) return 1;
    if (actionId === 'abd-percuss' || (actionId.startsWith('abd-') && actionId.includes('percuss'))) return 2;
    if (actionId === 'abd-palpate' || (actionId.startsWith('abd-') && actionId.includes('palpate'))) return 3;
  }

  if (regionId === 'posterior-logroll') {
    if (actionId === 'logroll-inspect') return 1;
    if (actionId === 'spine-inspect') return 2;
    if (actionId === 'spine-palpate') return 3;
  }

  if (isLimbRegion(regionId)) {
    if (actionId.includes('inspect')) return 0;
    if (actionId.includes('palpate') || actionId.includes('femur') || actionId.includes('tibia') || actionId.includes('ankle') || actionId.includes('foot')) return 1;
    if (actionId.includes('pulse')) return 2;
    if (actionId.includes('neuro') || actionId.includes('sensation')) return 3;
    if (actionId.includes('compartment')) return 4;
  }

  return null;
}

function getQuadrantFromAction(actionId: string | null | undefined): AbdomenQuadrant | null {
  if (!actionId) return null;
  const match = actionId.match(/^abd-(ruq|luq|rlq|llq)-/);
  return match ? (match[1] as AbdomenQuadrant) : null;
}

function getQuadrantMeta(quadrant: AbdomenQuadrant) {
  return ABDOMEN_QUADRANTS.find(q => q.id === quadrant) || ABDOMEN_QUADRANTS[0];
}

function getAbdomenText(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    ...(caseData.secondarySurvey?.abdomen || []),
    ...(caseData.expectedFindings?.keyObservations || []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function getBowelSoundTypeForCase(caseData: CaseScenario): BowelSoundType {
  const abdText = getAbdomenText(caseData);
  if (/bruit|aneurysm|aortic|vascular|renal artery/.test(abdText)) return 'bruit';
  if (/absent bowel|ileus|paralytic|peritonitis|silent abdomen/.test(abdText)) return 'absent';
  if (/tinkling|mechanical obstruction|bowel obstruction/.test(abdText)) return 'tinkling';
  if (/borborygmi|loud gurgling|hunger/.test(abdText)) return 'borborygmi';
  if (/hyperactive|diarrh|gastroenter|vomiting/.test(abdText)) return 'hyperactive';
  if (/hypoactive|post-op|postoperative|opioid|constipat/.test(abdText)) return 'hypoactive';
  return 'normal';
}

function getQuadrantRelevantFindings(caseData: CaseScenario, quadrant: AbdomenQuadrant): string[] {
  const abdomen = caseData.secondarySurvey?.abdomen || [];
  const qNeedles: Record<AbdomenQuadrant, RegExp[]> = {
    ruq: [/ruq|right upper|right hypochond|liver|hepatic|gallbladder|murphy|right costal/],
    luq: [/luq|left upper|left hypochond|spleen|splenic|stomach|epigastric.*left/],
    rlq: [/rlq|right lower|right iliac|appendix|appendic|mcburney|right pelvic|right flank/],
    llq: [/llq|left lower|left iliac|sigmoid|divertic|left pelvic|left flank/],
  };
  const generic = /diffuse|general|all quadrants|periton|rigid|guard|distend|bloated|tender abdomen|abdominal tenderness/;
  const needles = qNeedles[quadrant];
  const specific = abdomen.filter(f => needles.some(rx => rx.test(f.toLowerCase())));
  if (specific.length) return specific;
  return abdomen.filter(f => generic.test(f.toLowerCase()));
}

function getQuadrantPercussionFinding(caseData: CaseScenario, quadrant: AbdomenQuadrant): string {
  const meta = getQuadrantMeta(quadrant);
  const abdText = getAbdomenText(caseData);
  if (/ascites|free fluid|shifting dullness|fluid thrill/.test(abdText)) {
    return `${meta.label}: Dullness shifts with position — possible free fluid.`;
  }
  if (/obstruction|distend|tympan/.test(abdText)) {
    return `${meta.label}: Hyper-tympanic note over distended bowel loops.`;
  }
  if (quadrant === 'ruq') return 'RUQ: Expected liver dullness at the costal margin, with tympany over bowel inferiorly.';
  return `${meta.label}: Tympanic percussion note, no focal dullness.`;
}

function getQuadrantPalpationFinding(caseData: CaseScenario, quadrant: AbdomenQuadrant): string {
  const meta = getQuadrantMeta(quadrant);
  const findings = getQuadrantRelevantFindings(caseData, quadrant);
  if (findings.length) return `${meta.label}: ${findings.join('. ')}`;
  return `${meta.label}: Soft, non-tender. No guarding, rigidity, rebound tenderness, or palpable mass.`;
}


function PupilCloseUp({ profile }: { profile: PupilProfile }) {
  const pupilStyle = (mm: number): CSSProperties => ({
    width: `${Math.max(10, Math.min(34, mm * 5.4))}px`,
    height: `${Math.max(10, Math.min(34, mm * 5.4))}px`,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.22),transparent_34%),linear-gradient(180deg,#111827,#020617)] p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-28px_rgba(2,6,23,0.95)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-300">Pupil Close-Up</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Direct light, compare left and right</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-semibold ${
          profile.abnormal
            ? 'border-amber-300/30 bg-amber-400/15 text-amber-100'
            : 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100'
        }`}>
          {profile.abnormal ? 'Abnormal finding' : 'Normal finding'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {[
          { side: 'Left', mm: profile.leftMm, reaction: profile.leftReaction },
          { side: 'Right', mm: profile.rightMm, reaction: profile.rightReaction },
        ].map(eye => (
          <div key={eye.side} className="rounded-xl border border-white/10 bg-white/[0.07] p-2 shadow-[inset_0_1px_12px_rgba(255,255,255,0.03)]">
            <div className="relative mx-auto h-[76px] w-full min-w-[110px] max-w-[168px] overflow-hidden rounded-[50%] border border-white/15 bg-[#b9876e] shadow-[0_10px_22px_-18px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-x-2 top-1/2 h-[48px] -translate-y-1/2 rounded-[999px] bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-[inset_0_2px_8px_rgba(15,23,42,0.34)]" />
              <div className="absolute inset-x-5 top-3 h-5 rounded-[100%] border-t-[10px] border-[#7a493d]/55" />
              <div className="absolute inset-x-5 bottom-3 h-5 rounded-[100%] border-b-[8px] border-[#6b3f35]/45" />
              <div className="absolute left-1/2 top-1/2 h-[47px] w-[47px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_32%,#67e8f9_0%,#0891b2_31%,#155e75_55%,#082f49_76%,#020617_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,0.2),inset_0_0_18px_rgba(2,6,23,0.75)]" />
              <div className="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20" />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_12px_rgba(0,0,0,0.75)]"
                style={pupilStyle(eye.mm)}
              />
              <div className="absolute left-[42%] top-[35%] h-2.5 w-2.5 rounded-full bg-white/90 blur-[0.5px]" />
              <div className="absolute left-[54%] top-[29%] h-1.5 w-1.5 rounded-full bg-white/60" />
              <div className="absolute left-[18%] top-[48%] h-px w-8 rotate-[-10deg] bg-red-400/25" />
              <div className="absolute right-[18%] top-[54%] h-px w-7 rotate-[12deg] bg-red-400/20" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[9px]">
              <span className="font-semibold text-slate-100">{eye.side}</span>
              <span className="rounded-full bg-black/25 px-1.5 py-0.5 font-mono text-slate-100">{eye.mm} mm</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${eye.reaction.includes('fixed') ? 'bg-red-300' : eye.reaction.includes('sluggish') ? 'bg-amber-300' : 'bg-emerald-300'}`} />
              <p className="truncate text-[8px] uppercase tracking-[0.12em] text-slate-300">{eye.reaction}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-[10px] font-semibold text-sky-100">mm</div>
        <p className="text-[10px] leading-relaxed text-slate-200">{profile.note}</p>
      </div>
    </div>
  );
}

function AirwayCloseUp({ caseData }: { caseData: CaseScenario }) {
  const airway = getAirwayCue(caseData);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-sky-50/70 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Airway View</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Look, listen, then palpate neck structures</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${airway.compromised ? 'border-red-300/40 bg-red-500/15 text-red-600 dark:text-red-300' : 'border-emerald-300/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>
          {airway.status}
        </span>
      </div>
      <div className="relative mx-auto h-28 max-w-[190px] rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/70 dark:from-slate-800 dark:to-slate-900">
        <div className="absolute left-1/2 top-1 h-20 w-28 -translate-x-1/2 rounded-[48%] bg-gradient-to-b from-[#d6a688] to-[#a96d54] shadow-lg" />
        <div className="absolute left-[42%] top-7 h-2.5 w-2.5 rounded-full bg-slate-900/85" />
        <div className="absolute right-[42%] top-7 h-2.5 w-2.5 rounded-full bg-slate-900/85" />
        <div className="absolute left-1/2 top-11 h-3 w-5 -translate-x-1/2 rounded-b-full border-b-2 border-[#8f5749]/80" />
        <div className={`absolute left-1/2 top-14 h-8 w-16 -translate-x-1/2 rounded-b-full border-4 border-[#9f5f4e] shadow-inner ${airway.compromised ? 'bg-red-950' : 'bg-slate-900'}`}>
          <div className={`absolute left-1/2 top-2 h-3 w-6 -translate-x-1/2 rounded-full ${airway.compromised ? 'bg-red-500/70' : 'bg-pink-300/80'}`} />
        </div>
        <div className={`absolute bottom-0 left-1/2 h-12 w-10 -translate-x-1/2 rounded-t-full ${airway.compromised ? 'bg-red-500/20 ring-2 ring-red-400/40' : 'bg-sky-500/15 ring-1 ring-sky-300/50'}`} />
      </div>
      <div className="mt-2 space-y-1">
        {airway.cues.slice(0, 3).map(cue => (
          <div key={cue} className="rounded-lg border border-border/50 bg-muted/30 px-2 py-1 text-[10px] leading-relaxed">
            {cue}
          </div>
        ))}
      </div>
    </div>
  );
}

function BreathingPatternPanel({ caseData, liveVitals }: { caseData: CaseScenario; liveVitals?: Partial<VitalSigns> | null }) {
  const pattern = getBreathingPattern(caseData, liveVitals);
  const cycleSeconds = pattern.rate > 0 ? Math.max(0.85, Math.min(4, 60 / pattern.rate)) : 2.8;
  const color = pattern.severity === 'critical' ? 'text-red-500 border-red-400/40 bg-red-500/10'
    : pattern.severity === 'warning' ? 'text-amber-500 border-amber-400/40 bg-amber-500/10'
      : pattern.severity === 'observe' ? 'text-sky-600 border-sky-400/40 bg-sky-500/10'
        : 'text-emerald-600 border-emerald-400/40 bg-emerald-500/10';
  const leftScale = pattern.asymmetry === 'left' ? 0.55 : 1;
  const rightScale = pattern.asymmetry === 'right' ? 0.55 : 1;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10">
            <Wind className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Breathing Pattern</p>
            <p className="text-[10px] text-muted-foreground">RR {pattern.rate || '--'} /min</p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${color}`}>{pattern.label}</span>
      </div>
      <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
        <div className="absolute inset-x-8 bottom-4 h-14 rounded-t-[50px] border-t border-slate-400/30" />
        {[
          { side: 'L', scale: leftScale },
          { side: 'R', scale: rightScale },
        ].map(chest => (
          <div
            key={chest.side}
            className={`absolute bottom-5 h-12 w-12 rounded-[45%] border ${chest.scale < 1 ? 'border-amber-400/70 bg-amber-400/20' : 'border-sky-400/45 bg-sky-400/15'} animate-pulse`}
            style={{
              ...(chest.side === 'L' ? { left: '27%' } : { right: '27%' }),
              transform: `scaleY(${chest.scale})`,
              transformOrigin: 'bottom center',
              animationDuration: `${cycleSeconds}s`,
            }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 dark:text-slate-300">{chest.side}</span>
          </div>
        ))}
        <div className="absolute left-1/2 bottom-4 h-16 w-px -translate-x-1/2 bg-slate-400/30" />
      </div>
      <p className="mt-2 rounded-lg bg-muted/35 px-2 py-1.5 text-[10px] leading-relaxed text-foreground/80">{pattern.detail}</p>
    </div>
  );
}

function ChestAssessmentMap({ selectedAction, caseData, liveVitals }: { selectedAction: string | null; caseData: CaseScenario; liveVitals?: Partial<VitalSigns> | null }) {
  const pattern = getBreathingPattern(caseData, liveVitals);
  const chestText = [
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.secondarySurvey?.chest || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
  ].join(' ').toLowerCase();
  const rightFlag = /right|r hemithorax/.test(chestText) && /(absent|diminished|reduced|tender|wound|bruise|crepitus)/.test(chestText);
  const leftFlag = /left|l hemithorax/.test(chestText) && /(absent|diminished|reduced|tender|wound|bruise|crepitus)/.test(chestText);
  const activeTone = selectedAction?.includes('auscultate')
    ? 'Auscultation'
    : selectedAction?.includes('percuss')
      ? 'Percussion'
      : selectedAction?.includes('palpate')
        ? 'Palpation'
        : selectedAction?.includes('inspect')
          ? 'Inspection'
          : 'Ready';

  const lungClass = (side: 'right' | 'left', zone: 'upper' | 'lower') => {
    const flagged = side === 'right' ? rightFlag : leftFlag;
    const zoneActionId = `chest-auscultate-${side === 'right' ? 'r' : 'l'}${zone === 'upper' ? 'u' : 'l'}`;
    const active = selectedAction === 'chest-auscultate-lungs'
      || selectedAction === 'chest-percuss'
      || selectedAction === zoneActionId;
    if (flagged) return 'border-amber-300 bg-amber-400/20 shadow-[0_0_18px_rgba(251,191,36,0.22)]';
    if (active) return zone === 'upper' ? 'border-cyan-300 bg-cyan-400/20' : 'border-sky-300 bg-sky-400/15';
    return 'border-slate-300/70 bg-white/70 dark:border-white/15 dark:bg-slate-900/70';
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-cyan-50/45 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:to-cyan-950/15">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Chest Landmarks</p>
          <p className="text-[10px] text-muted-foreground">Compare sides, then listen in matching fields</p>
        </div>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-semibold text-cyan-700 dark:text-cyan-300">
          {activeTone}
        </span>
      </div>

      <div className="grid gap-2 min-[430px]:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-40 w-36 rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
          <div className="absolute left-1/2 top-2 h-[132px] w-[108px] -translate-x-1/2 rounded-[40%] border border-slate-300/50 bg-white/45 dark:border-white/10 dark:bg-white/5" />
          <div className="absolute left-1/2 top-4 h-[116px] w-px -translate-x-1/2 bg-slate-400/35" />
          {[
            { key: 'right-upper', side: 'right' as const, zone: 'upper' as const, label: 'R upper', style: { left: '18px', top: '26px' } },
            { key: 'left-upper', side: 'left' as const, zone: 'upper' as const, label: 'L upper', style: { right: '18px', top: '26px' } },
            { key: 'right-lower', side: 'right' as const, zone: 'lower' as const, label: 'R lower', style: { left: '17px', top: '78px' } },
            { key: 'left-lower', side: 'left' as const, zone: 'lower' as const, label: 'L lower', style: { right: '17px', top: '78px' } },
          ].map(zone => (
            <div
              key={zone.key}
              className={`absolute h-[46px] w-[46px] rounded-[45%] border p-1 text-center text-[8px] font-semibold leading-[1.1] text-slate-700 transition-colors dark:text-slate-100 ${lungClass(zone.side, zone.zone)}`}
              style={zone.style}
            >
              <span className="absolute inset-0 rounded-[45%] border-t border-white/60" />
              <span className="relative top-3">{zone.label}</span>
            </div>
          ))}
          <div className={`absolute left-1/2 top-[74px] h-[42px] w-[34px] -translate-x-[18%] rounded-[45%_55%_55%_45%] border text-center text-[8px] font-bold leading-[42px] ${
            selectedAction === 'chest-auscultate-heart'
              ? 'border-rose-300 bg-rose-500/20 text-rose-700 shadow-[0_0_18px_rgba(244,63,94,0.22)] dark:text-rose-200'
              : 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200'
          }`}>
            Heart
          </div>
          <div className={`absolute inset-x-7 top-[18px] h-[112px] rounded-[40%] border-2 border-dashed ${
            selectedAction === 'chest-palpate' || selectedAction === 'chest-inspect'
              ? 'border-amber-400/70'
              : 'border-transparent'
          }`} />
        </div>
        <div className="grid content-start gap-1.5">
          {[
            ['Pattern', pattern.label],
            ['Chest wall', 'symmetry, tenderness, crepitus, flail'],
            ['Lungs', 'upper and lower fields, compare right to left'],
            ['Heart', 'aortic, pulmonic, tricuspid, mitral/apex'],
          ].map(([label, detail]) => (
            <div key={label} className="rounded-lg border border-border/50 bg-white/65 px-2 py-1.5 dark:bg-slate-950/35">
              <p className="text-[9px] font-semibold text-foreground">{label}</p>
              <p className="text-[9px] leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AbdominalQuadrantPanel({ selectedAction, caseData, compact = false, revealedFindings, onAction }: { selectedAction: string | null; caseData: CaseScenario; compact?: boolean; revealedFindings?: Map<string, string>; onAction?: (actionId: string) => void }) {
  const selectedQuadrant = getQuadrantFromAction(selectedAction);
  const isDone = (id: string) => revealedFindings?.has(id) ?? false;
  // Each quadrant tile performs that quadrant's full IAPP exam step the
  // student is currently working on: palpation/percussion/auscultation when
  // such an action is already selected, auscultation by default (IAPP — the
  // workflow asks to listen before laying hands on a tender belly).
  const actionForQuadrant = (q: AbdomenQuadrant): string => {
    if (selectedAction && getQuadrantFromAction(selectedAction) === q) {
      return selectedAction; // re-tap = re-examine the same technique
    }
    const activeTechnique = selectedAction?.endsWith('-palpate') ? 'palpate'
      : selectedAction?.endsWith('-percuss') ? 'percuss'
        : selectedAction?.includes('inspect') ? 'inspect'
          : null;
    if (activeTechnique && activeTechnique !== 'inspect') return `abd-${q}-${activeTechnique}`;
    return `abd-${q}-auscultate`;
  };
  const bowelType = getBowelSoundTypeForCase(caseData);
  const painText = getAbdomenText(caseData);
  const technique = selectedAction?.includes('palpate')
    ? 'Palpation'
    : selectedAction?.includes('percuss')
      ? 'Percussion'
      : selectedAction?.includes('auscultate')
        ? 'Auscultation'
        : selectedAction?.includes('inspect')
          ? 'Inspection'
          : 'Ready';
  const isLikelyRelevant = (quadrant: AbdomenQuadrant) => quadrant === 'ruq' ? /ruq|right upper|liver|gallbladder/.test(painText)
    : quadrant === 'luq' ? /luq|left upper|spleen|stomach/.test(painText)
      : quadrant === 'rlq' ? /rlq|right lower|append/.test(painText)
        : /llq|left lower|sigmoid|divertic/.test(painText);

  if (compact) {
    return (
      <div className="rounded-xl border border-white/14 bg-white/92 p-2 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:text-white">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/45">Quadrants</p>
            <p className="truncate text-[10px] font-semibold text-slate-800 dark:text-white/88">IAPP sequence</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-300/50 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 dark:text-emerald-200">
            {technique}
          </span>
        </div>

        <div className="grid grid-cols-[6.3rem_1fr] gap-2">
          <div className="relative h-28 w-[6.3rem] rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
            <div className="absolute left-1/2 top-3 h-[5.4rem] w-[4.6rem] -translate-x-1/2 rounded-[42%] border border-slate-300/50 bg-white/55 dark:border-white/10 dark:bg-white/5" />
            <div className="absolute left-1/2 top-[1.2rem] h-[4.7rem] w-px -translate-x-1/2 bg-slate-400/35" />
            <div className="absolute left-[1rem] right-[1rem] top-[3.55rem] h-px bg-slate-400/35" />
            <div className="absolute left-1/2 top-[3.15rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-slate-400/45 bg-slate-100 shadow-sm dark:bg-slate-700" />
            {ABDOMEN_QUADRANTS.map(q => {
              const isActive = selectedQuadrant === q.id;
              const likelyRelevant = isLikelyRelevant(q.id);
              const done = isDone(`abd-${q.id}-auscultate`) || isDone(`abd-${q.id}-palpate`);
              const position = q.id === 'ruq' ? 'left-[0.95rem] top-[1.4rem]'
                : q.id === 'luq' ? 'right-[0.95rem] top-[1.4rem]'
                  : q.id === 'rlq' ? 'left-[0.95rem] top-[4.35rem]'
                    : 'right-[0.95rem] top-[4.35rem]';
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={onAction ? () => onAction(actionForQuadrant(q.id)) : undefined}
                  disabled={!onAction}
                  title={`${q.full} — listen, percuss, palpate`}
                  className={`absolute flex h-9 w-9 items-center justify-center rounded-xl border text-[8px] font-bold transition-colors touch-manipulation ${position} ${
                    onAction ? 'cursor-pointer hover:border-cyan-300 hover:bg-cyan-400/20 active:scale-95' : ''
                  } ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-500/25 text-emerald-950 ring-1 ring-emerald-400/40 dark:text-emerald-100'
                      : likelyRelevant
                        ? 'border-amber-300/80 bg-amber-300/20 text-amber-900 dark:text-amber-100'
                        : 'border-slate-300/70 bg-white/72 text-slate-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100'
                  }`}
                >
                  {done && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  {q.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {ABDOMEN_QUADRANTS.map(q => {
              const isActive = selectedQuadrant === q.id;
              const likelyRelevant = isLikelyRelevant(q.id);
              const done = isDone(`abd-${q.id}-auscultate`) || isDone(`abd-${q.id}-palpate`);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={onAction ? () => onAction(actionForQuadrant(q.id)) : undefined}
                  disabled={!onAction}
                  title={`${q.full} — listen, percuss, palpate`}
                  className={`rounded-lg border px-1.5 py-1 text-left text-[8px] leading-tight transition-colors touch-manipulation ${
                    onAction ? 'cursor-pointer hover:border-cyan-300/70 hover:bg-cyan-500/10 active:scale-[0.98]' : ''
                  } ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100'
                      : likelyRelevant
                        ? 'border-amber-300/70 bg-amber-300/12 text-amber-900 dark:text-amber-100'
                        : 'border-slate-200 bg-slate-50/85 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/65'
                  }`}
                >
                  <p className="flex items-center gap-1 font-bold">
                    {done && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {q.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2">{q.hint}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-emerald-50/40 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Abdominal Quadrants</p>
          <p className="text-[10px] text-muted-foreground">Auscultate, percuss, then palpate each area</p>
        </div>
        <div className="flex gap-1">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 dark:text-emerald-300">
            {bowelType}
          </span>
          <span className="rounded-full border border-slate-300/60 bg-white/70 px-2 py-0.5 text-[8px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            {technique}
          </span>
        </div>
      </div>
      <div className="grid gap-2 min-[430px]:grid-cols-[132px_1fr]">
        <div className="relative mx-auto h-40 w-32 rounded-[38px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
          <div className="absolute left-1/2 top-4 h-[126px] w-[96px] -translate-x-1/2 rounded-[42%] border border-slate-300/50 bg-white/50 dark:border-white/10 dark:bg-white/5" />
          <div className="absolute left-1/2 top-[22px] h-[106px] w-px -translate-x-1/2 bg-slate-400/35" />
          <div className="absolute left-[19px] right-[19px] top-[77px] h-px bg-slate-400/35" />
          <div className="absolute left-1/2 top-[69px] h-3 w-3 -translate-x-1/2 rounded-full border border-slate-400/45 bg-slate-100 shadow-sm dark:bg-slate-700" />
          {ABDOMEN_QUADRANTS.map(q => {
            const isActive = selectedQuadrant === q.id;
            const likelyRelevant = isLikelyRelevant(q.id);
            const position = q.id === 'ruq' ? 'left-[21px] top-[30px]'
              : q.id === 'luq' ? 'right-[21px] top-[30px]'
                : q.id === 'rlq' ? 'left-[21px] top-[83px]'
                  : 'right-[21px] top-[83px]';
            return (
              <button
                key={q.id}
                type="button"
                onClick={onAction ? () => onAction(actionForQuadrant(q.id)) : undefined}
                disabled={!onAction}
                title={`${q.full} — listen, percuss, palpate`}
                className={`absolute h-[44px] w-[42px] rounded-2xl border px-1 pt-2 text-center text-[9px] font-bold transition-colors touch-manipulation ${position} ${
                  onAction ? 'cursor-pointer hover:border-cyan-300 hover:bg-cyan-400/20 active:scale-95' : ''
                } ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-900 ring-1 ring-emerald-400/30 dark:text-emerald-100'
                    : likelyRelevant
                      ? 'border-amber-300/80 bg-amber-400/15 text-amber-900 dark:text-amber-100'
                      : 'border-slate-300/70 bg-white/70 text-slate-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100'
                }`}
              >
                {q.label}
                {isActive && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ABDOMEN_QUADRANTS.map(q => {
            const isActive = selectedQuadrant === q.id;
            const likelyRelevant = isLikelyRelevant(q.id);
            return (
              <button
                key={q.id}
                type="button"
                onClick={onAction ? () => onAction(actionForQuadrant(q.id)) : undefined}
                disabled={!onAction}
                title={`${q.full} — listen, percuss, palpate`}
                className={`min-h-[58px] rounded-xl border p-2 text-left transition-colors touch-manipulation ${
                  onAction ? 'cursor-pointer hover:border-cyan-300/70 hover:bg-cyan-500/10 active:scale-[0.99]' : ''
                } ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/30'
                    : likelyRelevant
                      ? 'border-amber-300/70 bg-amber-400/10'
                      : 'border-border/60 bg-white/70 dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold">{q.label}</p>
                  {isDone(`abd-${q.id}-palpate`) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  {likelyRelevant && <span className="rounded-full bg-amber-400/20 px-1 text-[7px] font-semibold text-amber-700 dark:text-amber-300">focus</span>}
                </div>
                <p className="mt-0.5 text-[8px] leading-tight text-muted-foreground">{q.full}</p>
                <p className="mt-1 text-[8px] leading-tight text-muted-foreground/80">{q.hint}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SecondaryAssessmentOutline({ activeRegion, selectedAction, caseData, liveVitals, revealedFindings, onAction }: {
  activeRegion: string | null;
  selectedAction: string | null;
  caseData: CaseScenario;
  liveVitals?: Partial<VitalSigns> | null;
  revealedFindings?: Map<string, string>;
  onAction?: (actionId: string) => void;
}) {
  const workflow = getWorkflowForRegion(activeRegion);
  const activeWorkflowStep = getWorkflowStepForAction(activeRegion, selectedAction);
  const shouldShowAirway = activeRegion === 'neck-cspine' && (!selectedAction || selectedAction.includes('airway') || selectedAction.includes('trachea') || selectedAction.includes('jvd'));
  const shouldShowBreathing = activeRegion === 'chest';
  const shouldShowAbdomen = activeRegion === 'abdomen';

  return (
    <div className="space-y-2">
      {/* Pupil close-up lives in the floating loupe (always shown for the face),
          so we don't repeat it here — it was the third redundant copy. */}
      {shouldShowAirway && <AirwayCloseUp caseData={caseData} />}
      {shouldShowBreathing && <ChestAssessmentMap selectedAction={selectedAction} caseData={caseData} liveVitals={liveVitals} />}
      {shouldShowBreathing && <BreathingPatternPanel caseData={caseData} liveVitals={liveVitals} />}
      {shouldShowAbdomen && <AbdominalQuadrantPanel selectedAction={selectedAction} caseData={caseData} revealedFindings={revealedFindings} onAction={onAction} />}
      <div className="rounded-xl border border-border/50 bg-white/80 p-2.5 shadow-sm dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Secondary Assessment Flow</p>
          {activeWorkflowStep !== null && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">
              Step {activeWorkflowStep + 1}
            </span>
          )}
        </div>
        <div className="mt-2 space-y-0.5">
          {workflow.map((item, index) => {
            const isActive = activeWorkflowStep === index;
            const isBeforeActive = activeWorkflowStep !== null && index < activeWorkflowStep;
            return (
              <div
                key={item}
                className={`grid grid-cols-[18px_1fr] gap-2 rounded-lg px-1.5 py-1.5 text-[10px] leading-relaxed transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                    : isBeforeActive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-foreground/80 dark:text-slate-300'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[8px] ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isBeforeActive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                }`}>
                {index + 1}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Region config — what exams can be done per body region
// ============================================================================

interface ExamAction {
  id: string;
  label: string;
  technique: 'inspect' | 'palpate' | 'percuss' | 'auscultate';
}

interface SubRegion {
  id: string;
  label: string;
  actions: ExamAction[];
}

/** Collapsible action group for limb regions */
interface ActionGroup {
  id: string;
  label: string;
  defaultExpanded: boolean;
  actions: ExamAction[];
}

const TECHNIQUE_ICONS = { inspect: Eye, palpate: Hand, percuss: Activity, auscultate: Stethoscope };
type ExamTechnique = ExamAction['technique'];

const TECHNIQUE_META: Record<ExamTechnique, { label: string; hint: string; tone: string; active: string }> = {
  inspect: {
    label: 'Inspect',
    hint: 'look first',
    tone: 'border-sky-300/40 bg-sky-400/10 text-sky-800 dark:text-sky-100',
    active: 'border-sky-300 bg-sky-400/20 text-sky-900 shadow-[0_0_18px_rgba(56,189,248,0.22)] dark:text-sky-50',
  },
  palpate: {
    label: 'Palpate',
    hint: 'hands on',
    tone: 'border-amber-300/40 bg-amber-400/10 text-amber-800 dark:text-amber-100',
    active: 'border-amber-300 bg-amber-400/20 text-amber-900 shadow-[0_0_18px_rgba(251,191,36,0.22)] dark:text-amber-50',
  },
  percuss: {
    label: 'Percuss',
    hint: 'compare sides',
    tone: 'border-violet-300/40 bg-violet-400/10 text-violet-800 dark:text-violet-100',
    active: 'border-violet-300 bg-violet-400/20 text-violet-900 shadow-[0_0_18px_rgba(167,139,250,0.22)] dark:text-violet-50',
  },
  auscultate: {
    label: 'Listen',
    hint: 'stethoscope',
    tone: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-800 dark:text-emerald-100',
    active: 'border-emerald-300 bg-emerald-400/20 text-emerald-900 shadow-[0_0_18px_rgba(52,211,153,0.22)] dark:text-emerald-50',
  },
};

const TECHNIQUE_ORDER: ExamTechnique[] = ['inspect', 'palpate', 'percuss', 'auscultate'];

// Vivid, theme-independent tones for the in-frame Assessment Cockpit dock.
// The dock always sits on a dark glass panel, so it must NOT use the
// theme-aware TECHNIQUE_META tones (those go dark-text on the dark panel in
// light mode and wash out behind the blur). Bright icon + saturated fill +
// near-white text so each technique reads at a glance over the model.
const DOCK_TONE: Record<ExamTechnique, { tone: string; active: string; icon: string }> = {
  inspect: {
    tone: 'border-sky-400/55 bg-sky-500/25 text-sky-50',
    active: 'border-sky-300 bg-sky-500/45 text-white shadow-[0_0_16px_rgba(56,189,248,0.45)]',
    icon: 'text-sky-300',
  },
  palpate: {
    tone: 'border-amber-400/55 bg-amber-500/25 text-amber-50',
    active: 'border-amber-300 bg-amber-500/45 text-white shadow-[0_0_16px_rgba(251,146,60,0.45)]',
    icon: 'text-amber-300',
  },
  percuss: {
    tone: 'border-violet-400/55 bg-violet-500/25 text-violet-50',
    active: 'border-violet-300 bg-violet-500/45 text-white shadow-[0_0_16px_rgba(167,139,250,0.45)]',
    icon: 'text-violet-300',
  },
  auscultate: {
    tone: 'border-emerald-400/55 bg-emerald-500/25 text-emerald-50',
    active: 'border-emerald-300 bg-emerald-500/45 text-white shadow-[0_0_16px_rgba(52,211,153,0.45)]',
    icon: 'text-emerald-300',
  },
};

// ============================================================================
// Collapsible action groups for limb regions (Phase 2A)
// ============================================================================

function getLimbActionGroups(regionId: string): ActionGroup[] | null {
  const prefix = regionId === 'right-arm' ? 'r' : regionId === 'left-arm' ? 'l' : regionId === 'right-leg' ? 'r' : regionId === 'left-leg' ? 'l' : null;
  if (!prefix) return null;

  if (regionId === 'right-arm' || regionId === 'left-arm') {
    return [
      {
        id: `${regionId}-core`,
        label: 'Core Assessment',
        defaultExpanded: true,
        actions: [
          { id: `${prefix}-arm-inspect`, label: 'Inspect', technique: 'inspect' },
          { id: `${prefix}-arm-pulses`, label: 'Radial Pulse + CRT', technique: 'palpate' },
          { id: `${prefix}-arm-neuro`, label: 'Sensation & Motor', technique: 'inspect' },
        ],
      },
      {
        id: `${regionId}-bones`,
        label: 'Bone & Joint Palpation',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-shoulder-palpate`, label: 'Shoulder', technique: 'palpate' },
          { id: `${prefix}-humerus-palpate`, label: 'Humerus (upper arm)', technique: 'palpate' },
          { id: `${prefix}-elbow-palpate`, label: 'Elbow', technique: 'palpate' },
          { id: `${prefix}-forearm-palpate`, label: 'Radius / Ulna (forearm)', technique: 'palpate' },
          { id: `${prefix}-wrist-palpate`, label: 'Wrist / Scaphoid', technique: 'palpate' },
          { id: `${prefix}-hand-palpate`, label: 'Hand (metacarpals)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-digits`,
        label: 'Detailed Digit Exam',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-thumb-palpate`, label: 'Thumb', technique: 'palpate' },
          { id: `${prefix}-fingers-palpate`, label: 'Fingers (index\u2013little)', technique: 'palpate' },
        ],
      },
    ];
  }

  if (regionId === 'right-leg' || regionId === 'left-leg') {
    return [
      {
        id: `${regionId}-core`,
        label: 'Core Assessment',
        defaultExpanded: true,
        actions: [
          { id: `${prefix}-leg-inspect`, label: 'Inspect (wounds, deformity, swelling)', technique: 'inspect' },
          { id: `${prefix}-leg-pulses`, label: 'Pedal Pulses (DP + PT) + CRT', technique: 'palpate' },
          { id: `${prefix}-leg-neuro`, label: 'Sensation & Motor', technique: 'inspect' },
        ],
      },
      {
        id: `${regionId}-upper`,
        label: 'Upper Leg (Thigh)',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-thigh-inspect`, label: 'Inspect Thigh', technique: 'inspect' },
          { id: `${prefix}-femur-palpate`, label: 'Palpate Femur', technique: 'palpate' },
          { id: `${prefix}-thigh-compartment`, label: 'Compartment Check (thigh)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-knee`,
        label: 'Knee',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-knee-inspect`, label: 'Inspect Knee', technique: 'inspect' },
          { id: `${prefix}-knee-palpate`, label: 'Palpate Knee (patella, ligaments)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-lower`,
        label: 'Lower Leg (Shin)',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-shin-inspect`, label: 'Inspect Lower Leg', technique: 'inspect' },
          { id: `${prefix}-tibia-palpate`, label: 'Palpate Tibia / Fibula', technique: 'palpate' },
          { id: `${prefix}-shin-compartment`, label: 'Compartment Check (lower leg)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-foot`,
        label: 'Ankle & Foot',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-ankle-inspect`, label: 'Inspect Ankle', technique: 'inspect' },
          { id: `${prefix}-ankle-palpate`, label: 'Palpate Ankle (malleoli)', technique: 'palpate' },
          { id: `${prefix}-foot-palpate`, label: 'Palpate Foot (metatarsals)', technique: 'palpate' },
          { id: `${prefix}-toes-inspect`, label: 'Toes (colour, cap refill)', technique: 'inspect' },
        ],
      },
    ];
  }

  return null;
}

function getSubRegions(regionId: string): SubRegion[] {
  switch (regionId) {
    // ===== HEAD =====
    // What you examine ON the head: scalp, skull, ears
    case 'head': return [
      { id: 'head-exam', label: 'Head', actions: [
        { id: 'scalp-inspect', label: 'Inspect Scalp', technique: 'inspect' },
        { id: 'scalp-palpate', label: 'Palpate Skull', technique: 'palpate' },
        { id: 'face-inspect', label: 'Inspect Face (bruising, swelling)', technique: 'inspect' },
        { id: 'jaw-palpate', label: 'Palpate Facial Bones / Jaw', technique: 'palpate' },
        { id: 'ears-inspect', label: 'Ears (Battle sign, CSF, haemotympanum)', technique: 'inspect' },
      ]},
    ];

    // ===== FACE =====
    // Specific structures: eyes, nose, mouth, jaw, facial symmetry
    case 'face': return [
      { id: 'face-eyes', label: 'Eyes', actions: [
        { id: 'pupils-size', label: 'Pupil Size (mm)', technique: 'inspect' },
        { id: 'pupils-reactivity', label: 'Pupil Reactivity', technique: 'inspect' },
        { id: 'pupils-equality', label: 'Pupil Equality (compare L vs R)', technique: 'inspect' },
        { id: 'eyes-inspect', label: 'Conjunctiva, Sclera, Periorbital', technique: 'inspect' },
      ]},
      { id: 'face-nose', label: 'Nose', actions: [
        { id: 'nose-inspect', label: 'Inspect (CSF, epistaxis, deformity)', technique: 'inspect' },
        { id: 'nose-palpate', label: 'Palpate (crepitus, deviation)', technique: 'palpate' },
      ]},
      { id: 'face-mouth', label: 'Mouth', actions: [
        { id: 'lips-inspect', label: 'Lips (colour, cyanosis, dryness)', technique: 'inspect' },
        { id: 'mouth-inspect', label: 'Inspect (foreign body, blood, vomit, substances)', technique: 'inspect' },
        { id: 'mouth-mucosa', label: 'Mucosa / Hydration', technique: 'inspect' },
        { id: 'tongue-inspect', label: 'Tongue (swelling, bite, deviation)', technique: 'inspect' },
        { id: 'mouth-smell', label: 'Note Odour (alcohol, ketones, toxins)', technique: 'inspect' },
        { id: 'teeth-inspect', label: 'Teeth (loose, broken, dentures)', technique: 'inspect' },
      ]},
      { id: 'face-jaw', label: 'Jaw', actions: [
        { id: 'jaw-palpate', label: 'Palpate (stability, crepitus)', technique: 'palpate' },
      ]},
      { id: 'face-symmetry', label: 'Facial Assessment', actions: [
        { id: 'face-symmetry-inspect', label: 'Symmetry (droop, weakness)', technique: 'inspect' },
        { id: 'face-speech', label: 'Speech (clarity, coherence)', technique: 'inspect' },
      ]},
    ];

    // ===== NECK & C-SPINE =====
    // Airway auscultation belongs here — you listen at the neck for stridor
    case 'neck-cspine': return [
      { id: 'neck-exam', label: 'Neck & C-Spine', actions: [
        { id: 'cspine-inspect', label: 'Inspect (wounds, swelling, deformity)', technique: 'inspect' },
        { id: 'cspine-palpate', label: 'Palpate Midline (tenderness, step)', technique: 'palpate' },
        { id: 'trachea-palpate', label: 'Trachea Position', technique: 'palpate' },
        { id: 'jvd-inspect', label: 'Jugular Veins (JVP / JVD)', technique: 'inspect' },
        { id: 'airway-listen', label: 'Auscultate Airway', technique: 'auscultate' },
        { id: 'neck-emphysema', label: 'Subcutaneous Emphysema', technique: 'palpate' },
      ]},
    ];

    // ===== CHEST =====
    case 'chest': return [
      { id: 'chest-core', label: 'Core Chest Exam', actions: [
        { id: 'chest-inspect', label: 'Inspect chest rise, accessory muscles, wounds', technique: 'inspect' },
        { id: 'chest-palpate', label: 'Palpate expansion, tenderness, crepitus, flail', technique: 'palpate' },
        { id: 'chest-percuss', label: 'Percuss right and left lung fields', technique: 'percuss' },
        { id: 'chest-auscultate-lungs', label: 'Auscultate apices, mid-zones, bases', technique: 'auscultate' },
        { id: 'chest-auscultate-heart', label: 'Auscultate heart sounds at four points', technique: 'auscultate' },
      ]},
      { id: 'chest-zones', label: 'Specific Lung Fields', actions: [
        { id: 'chest-auscultate-ru', label: 'Auscultate right upper zone', technique: 'auscultate' },
        { id: 'chest-auscultate-rl', label: 'Auscultate right base', technique: 'auscultate' },
        { id: 'chest-auscultate-lu', label: 'Auscultate left upper zone', technique: 'auscultate' },
        { id: 'chest-auscultate-ll', label: 'Auscultate left base', technique: 'auscultate' },
      ]},
    ];

    // ===== ABDOMEN =====
    // Clinical exam order: Inspect -> Auscultate -> Percuss -> Palpate
    case 'abdomen': return [
      { id: 'abd-general', label: 'General Look', actions: [
        { id: 'abd-inspect', label: 'Inspect (distension, bruising, wounds)', technique: 'inspect' },
      ]},
      ...ABDOMEN_QUADRANTS.map(q => ({
        id: `abd-${q.id}`,
        label: `${q.label} - ${q.full}`,
        actions: [
          { id: `abd-${q.id}-auscultate`, label: `${q.label} bowel sounds and bruits`, technique: 'auscultate' as const },
          { id: `abd-${q.id}-percuss`, label: `${q.label} percussion note`, technique: 'percuss' as const },
          { id: `abd-${q.id}-palpate`, label: `${q.label} light/deep palpation`, technique: 'palpate' as const },
        ],
      })),
    ];

    // ===== PELVIS =====
    case 'pelvis': return [
      { id: 'pelvis-exam', label: 'Pelvis', actions: [
        { id: 'pelvis-inspect', label: 'Inspect (deformity, bruising)', technique: 'inspect' },
        { id: 'pelvis-palpate', label: 'Spring Test (single attempt)', technique: 'palpate' },
        { id: 'r-hip-palpate', label: 'Right Hip', technique: 'palpate' },
        { id: 'l-hip-palpate', label: 'Left Hip', technique: 'palpate' },
      ]},
    ];
    // Limb regions: flat SubRegion[] for backward compat (getAllActions uses groups instead)
    case 'right-arm': return [
      { id: 'right-arm', label: 'Right Arm', actions: [
        { id: 'r-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-shoulder-palpate', label: 'Shoulder', technique: 'palpate' },
        { id: 'r-humerus-palpate', label: 'Humerus (upper arm)', technique: 'palpate' },
        { id: 'r-elbow-palpate', label: 'Elbow', technique: 'palpate' },
        { id: 'r-forearm-palpate', label: 'Radius / Ulna (forearm)', technique: 'palpate' },
        { id: 'r-wrist-palpate', label: 'Wrist / Scaphoid', technique: 'palpate' },
        { id: 'r-hand-palpate', label: 'Hand (metacarpals)', technique: 'palpate' },
        { id: 'r-thumb-palpate', label: 'Thumb', technique: 'palpate' },
        { id: 'r-fingers-palpate', label: 'Fingers (index\u2013little)', technique: 'palpate' },
        { id: 'r-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'r-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'left-arm': return [
      { id: 'left-arm', label: 'Left Arm', actions: [
        { id: 'l-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-shoulder-palpate', label: 'Shoulder', technique: 'palpate' },
        { id: 'l-humerus-palpate', label: 'Humerus (upper arm)', technique: 'palpate' },
        { id: 'l-elbow-palpate', label: 'Elbow', technique: 'palpate' },
        { id: 'l-forearm-palpate', label: 'Radius / Ulna (forearm)', technique: 'palpate' },
        { id: 'l-wrist-palpate', label: 'Wrist / Scaphoid', technique: 'palpate' },
        { id: 'l-hand-palpate', label: 'Hand (metacarpals)', technique: 'palpate' },
        { id: 'l-thumb-palpate', label: 'Thumb', technique: 'palpate' },
        { id: 'l-fingers-palpate', label: 'Fingers (index\u2013little)', technique: 'palpate' },
        { id: 'l-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'l-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'right-leg': return [
      { id: 'right-leg', label: 'Right Leg', actions: [
        { id: 'r-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-femur-palpate', label: 'Femur (thigh)', technique: 'palpate' },
        { id: 'r-knee-palpate', label: 'Knee', technique: 'palpate' },
        { id: 'r-tibia-palpate', label: 'Tibia / Fibula (shin)', technique: 'palpate' },
        { id: 'r-ankle-palpate', label: 'Ankle (malleoli)', technique: 'palpate' },
        { id: 'r-foot-palpate', label: 'Foot (metatarsals)', technique: 'palpate' },
        { id: 'r-toes-palpate', label: 'Toes (all digits)', technique: 'palpate' },
        { id: 'r-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'r-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
        { id: 'r-leg-compartment', label: 'Compartment Check', technique: 'palpate' },
      ]},
    ];
    case 'left-leg': return [
      { id: 'left-leg', label: 'Left Leg', actions: [
        { id: 'l-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-femur-palpate', label: 'Femur (thigh)', technique: 'palpate' },
        { id: 'l-knee-palpate', label: 'Knee', technique: 'palpate' },
        { id: 'l-tibia-palpate', label: 'Tibia / Fibula (shin)', technique: 'palpate' },
        { id: 'l-ankle-palpate', label: 'Ankle (malleoli)', technique: 'palpate' },
        { id: 'l-foot-palpate', label: 'Foot (metatarsals)', technique: 'palpate' },
        { id: 'l-toes-palpate', label: 'Toes (all digits)', technique: 'palpate' },
        { id: 'l-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'l-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
        { id: 'l-leg-compartment', label: 'Compartment Check', technique: 'palpate' },
      ]},
    ];
    // Legacy: if 'extremities' is somehow passed, show all limbs
    case 'extremities': return [
      { id: 'right-arm', label: 'Right Arm', actions: [
        { id: 'r-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'r-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'left-arm', label: 'Left Arm', actions: [
        { id: 'l-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'l-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'right-leg', label: 'Right Leg', actions: [
        { id: 'r-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'r-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'left-leg', label: 'Left Leg', actions: [
        { id: 'l-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'l-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'posterior-logroll': return [
      { id: 'posterior-exam', label: 'Posterior', actions: [
        { id: 'logroll-inspect', label: 'Log Roll', technique: 'inspect' },
        { id: 'spine-inspect', label: 'Inspect Spine', technique: 'inspect' },
        { id: 'spine-palpate', label: 'Palpate Spine', technique: 'palpate' },
      ]},
    ];
    default: return [];
  }
}

// ============================================================================
// Finding generator — case-specific
// ============================================================================

function getFinding(
  caseData: CaseScenario,
  actionId: string,
  isInArrest = false,
  liveVitals?: Partial<VitalSigns> | null,
): string {
  // During cardiac arrest, all pulses are absent
  if (actionId.includes('pulse') && (isInArrest || caseData.vitalSignsProgression?.initial?.pulse === 0)) {
    return 'No pulse detected.';
  }

  const ss = caseData.secondarySurvey;
  const breathing = caseData.abcde?.breathing;
  const disability = caseData.abcde?.disability;
  const airway = caseData.abcde?.airway;

  // Chest — consolidated techniques
  if (actionId === 'chest-inspect') {
    const pattern = getBreathingPattern(caseData, isInArrest ? { ...liveVitals, respiration: 0 } : liveVitals);
    const structural = ss?.chest?.filter(f => /wound|bruis|deform|flail|abrasion|laceration|scar|swelling/i.test(f)) ?? [];
    return [`${pattern.label}. Respiratory rate ${pattern.rate}/min. ${pattern.detail}`, ...structural].join(' ');
  }
  if (actionId === 'chest-palpate') {
    return ss?.chest?.some(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender'))
      ? ss.chest.filter(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender') || f.toLowerCase().includes('emphysema')).join('. ')
      : 'No tenderness. No crepitus. No subcutaneous emphysema. Trachea central.';
  }
  if (actionId === 'chest-percuss') {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax'))) return 'Hyper-resonant percussion note \u2014 suggests pneumothorax.';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion') || f.toLowerCase().includes('haemothorax'))) return 'Dull percussion note \u2014 suggests fluid collection.';
    return 'Resonant percussion note bilaterally \u2014 normal.';
  }
  // Auscultation findings — sound plays, no text description.
  // Student must determine what they hear themselves.
  if (actionId === 'chest-auscultate-lungs') {
    return 'Auscultating lung fields — listen carefully.';
  }
  if (actionId.startsWith('chest-auscultate-')) {
    const zone: Record<string, string> = {
      'chest-auscultate-ru': 'right upper zone',
      'chest-auscultate-rl': 'right base',
      'chest-auscultate-lu': 'left upper zone',
      'chest-auscultate-ll': 'left base',
    };
    const z = zone[actionId];
    if (z) return `Auscultating the ${z} — listen for air entry, wheeze, or crackles.`;
  }
  if (actionId === 'chest-auscultate-heart') {
    return 'Auscultating heart — listen carefully.';
  }
  const abdomenQuadrant = getQuadrantFromAction(actionId);
  // Abdomen — consolidated techniques (each covers the whole abdomen)
  if (actionId === 'abd-inspect') {
    const abd = ss?.abdomen || [];
    const inspectFindings = abd.filter(f => f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') || f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible'));
    return inspectFindings.length ? inspectFindings.join('. ') : 'Abdomen flat, symmetrical. No distension. No visible bruising, scars, or peristalsis.';
  }
  if (abdomenQuadrant && actionId.endsWith('-auscultate')) {
    const meta = getQuadrantMeta(abdomenQuadrant);
    return `${meta.label}: Auscultating for bowel sounds and bruits — listen for pitch, frequency, and vascular whoosh.`;
  }
  if (abdomenQuadrant && actionId.endsWith('-percuss')) {
    return getQuadrantPercussionFinding(caseData, abdomenQuadrant);
  }
  if (abdomenQuadrant && actionId.endsWith('-palpate')) {
    return getQuadrantPalpationFinding(caseData, abdomenQuadrant);
  }
  if (actionId === 'abd-auscultate') {
    return 'Auscultating abdomen — listen to all 4 quadrants.';
  }
  if (actionId === 'abd-percuss') {
    const abd = ss?.abdomen || [];
    if (abd.some(f => f.toLowerCase().includes('ascites') || f.toLowerCase().includes('fluid'))) return 'Shifting dullness present \u2014 suggests free fluid.';
    if (abd.some(f => f.toLowerCase().includes('hepato'))) return 'RUQ: Dull \u2014 enlarged liver span >12cm. Rest: Tympanic.';
    return 'Tympanic throughout all quadrants \u2014 normal gas-filled bowel.';
  }
  if (actionId === 'abd-palpate') {
    const abd = ss?.abdomen || [];
    if (abd.length) return abd.join('. ');
    return 'Soft, non-tender in all 4 quadrants. No guarding, rigidity, or masses.';
  }
  // ===== FACE — Eyes =====
  if (isPupilExamAction(actionId) && actionId !== 'eyes-inspect') {
    return describePupilFinding(getPupilProfile(caseData), actionId)
      ?? 'Equal, round, reactive pupils.';
  }
  if (actionId === 'eyes-inspect') {
    // Look across face-detail, head, and neurological for eye-relevant signs:
    // periorbital bruising (trauma), gaze deviation (stroke), ptosis, nystagmus,
    // field cut / hemianopia. Previous logic only checked face-detail and
    // missed stroke-relevant gaze signs documented in the neurological line.
    const haystack = [
      ...(ss?.headDetailed?.face || []),
      ...(ss?.head || []),
      ...(ss?.neurological || []),
    ];
    const needles = ['eye', 'gaze', 'ptosis', 'nystagmus', 'hemianopia', 'field cut', 'periorbital', 'racoon', 'raccoon', 'conjunctiv', 'sclera', 'pupil'];
    const matches = haystack.filter(f => needles.some(n => f.toLowerCase().includes(n)));
    if (matches.length) return matches.join('. ');
    return 'Conjunctiva pink. Sclera white. No periorbital bruising. No foreign bodies. No gaze deviation or nystagmus.';
  }
  // ===== FACE — Nose =====
  if (actionId === 'nose-inspect') return ss?.headDetailed?.nose?.join('. ') || 'No CSF rhinorrhoea. No epistaxis. No deformity. Septum midline.';
  if (actionId === 'nose-palpate') return 'No crepitus. No deviation. Non-tender.';
  // ===== FACE — Mouth =====
  if (actionId === 'mouth-inspect') {
    const airwayFindings = airway?.findings || [];
    const mouthFindings = airwayFindings.filter(f => f.toLowerCase().includes('blood') || f.toLowerCase().includes('vomit') || f.toLowerCase().includes('foreign') || f.toLowerCase().includes('secretion') || f.toLowerCase().includes('obstruct'));
    if (mouthFindings.length) return mouthFindings.join('. ');
    return airway?.patent ? 'Clear. No foreign body, blood, vomit, or secretions. Mucosa moist.' : 'Airway compromised. Check for obstruction.';
  }
  if (actionId === 'lips-inspect') {
    const appearance = `${caseData.initialPresentation?.appearance || ''} ${caseData.initialPresentation?.generalImpression || ''}`.toLowerCase();
    const mouth = ss?.headDetailed?.mouth || [];
    const oxygenation = getOxygenationAppearanceFinding(liveVitals);
    // Live oxygenation replaces stale authored colour words after treatment,
    // while structural mouth findings (dryness, burns, swelling) remain true.
    const matched = mouth.filter(f => {
      const text = f.toLowerCase();
      if (liveVitals && /cyan|blue|dusky|pink|pale|colour|color/.test(text)) return false;
      return /lip|cyan|pale|dry|mucosa|dehydrat|burn|swelling|laceration/.test(text);
    });
    if (oxygenation || matched.length) {
      return [oxygenation?.value, ...matched].filter(Boolean).join(' ');
    }
    if (appearance.includes('cyan')) return 'Lips cyanotic with bluish discoloration — correlate with SpO2 and work of breathing.';
    if (appearance.includes('pale')) return 'Lips pale. Oral mucosa appears less perfused.';
    return 'Lips pink. No cyanosis, swelling, burns, or laceration.';
  }
  if (actionId === 'mouth-mucosa') {
    const mouth = ss?.headDetailed?.mouth || [];
    const matched = mouth.filter(f => /mucosa|dry|moist|dehydrat|tongue|oral/.test(f.toLowerCase()));
    return matched.length ? matched.join('. ') : 'Oral mucosa moist and pink. No dryness, burns, ulcers, or secretions.';
  }
  if (actionId === 'tongue-inspect') {
    const mouth = ss?.headDetailed?.mouth || [];
    const matched = mouth.filter(f => /tongue|bite|swelling|deviation|angioedema/.test(f.toLowerCase()));
    return matched.length ? matched.join('. ') : 'Tongue midline. No swelling, bite mark, fasciculation, or deviation.';
  }
  if (actionId === 'mouth-smell') {
    // Alcohol, ketones (fruity/DKA), uraemia (ammonia), hepatic fetor
    const history = caseData.history?.medicalConditions?.join(' ').toLowerCase() || '';
    const presentation = caseData.initialPresentation?.appearance?.toLowerCase() || '';
    if (history.includes('diabet') || presentation.includes('ketone') || presentation.includes('fruity')) return 'Fruity/acetone odour noted.';
    if (presentation.includes('alcohol') || history.includes('alcohol')) return 'Alcohol odour noted.';
    return 'No abnormal odour detected.';
  }
  if (actionId === 'teeth-inspect') return 'Dentition intact. No loose or broken teeth. No dentures.';
  // ===== FACE — Facial Assessment =====
  if (actionId === 'face-symmetry-inspect') {
    // Pull from every place facial-droop evidence might live: face-detail,
    // disability findings, secondary survey head + neurological. Previous
    // logic only looked at the first two, so a case with "Right nasolabial
    // fold flattened" / "Right hemiparesis" sitting in head/neurological
    // would return the generic "Symmetrical" lie.
    const faceFinding = (ss?.headDetailed?.face || []).join(' ').toLowerCase();
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    const headLine = (ss?.head || []).join(' ').toLowerCase();
    const neuroSS = (ss?.neurological || []).join(' ').toLowerCase();
    const haystack = `${faceFinding} ${neuro} ${headLine} ${neuroSS}`;
    if (/droop|facial weakness|facial asymm|nasolabial|hemipar|hemipleg|fast positive/.test(haystack)) {
      // Side it if we can — "right droop" reads better than a generic message.
      const right = /right.*droop|right.*nasolabial|right.*hemipar|right.*facial|facial.*right/.test(haystack);
      const left = /left.*droop|left.*nasolabial|left.*hemipar|left.*facial|facial.*left/.test(haystack);
      const side = right && !left ? ' on the RIGHT' : left && !right ? ' on the LEFT' : '';
      return `Asymmetry noted. Facial droop present${side} — nasolabial fold flattened, unable to smile equally.`;
    }
    return 'Symmetrical. No droop. Equal movement bilaterally on smile and brow raise.';
  }
  if (actionId === 'face-speech') {
    // Also consult the neurological section — aphasia/dysphasia is usually
    // documented there, not in disability findings.
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    const neuroSS = (ss?.neurological || []).join(' ').toLowerCase();
    const hay = `${neuro} ${neuroSS}`;
    // Aphasia takes precedence over slurred speech when both present — more
    // specific finding, points towards dominant-hemisphere stroke.
    if (/aphasia|dysphasia/.test(hay)) {
      const expressive = /expressive|broca/.test(hay);
      const receptive = /receptive|wernicke/.test(hay);
      if (expressive) return 'Expressive aphasia — patient can understand but struggles to produce words; speech non-fluent, frustrated.';
      if (receptive) return 'Receptive aphasia — fluent but non-sensical speech; patient does not understand commands.';
      return 'Aphasia — difficulty producing or understanding speech. Words garbled, absent, or out of sequence.';
    }
    if (/slur|dysarthria/.test(hay)) return 'Slurred speech (dysarthria) — articulation affected, comprehension intact.';
    return 'Clear, coherent speech. Repeats phrases correctly.';
  }
  if (actionId === 'face-inspect') return ss?.headDetailed?.face?.join('. ') || 'Symmetrical. No lacerations, bruising, or swelling.';
  // ===== FACE — Jaw =====
  if (actionId === 'jaw-palpate') return 'Jaw stable. No crepitus. TMJ non-tender. Full range of movement.';
  // ===== HEAD =====
  if (actionId === 'pupils-inspect') {
    const pupils = disability?.pupils;
    if (Array.isArray(pupils) && pupils.length) return pupils.join('; ');
    if (typeof pupils === 'string' && pupils.trim()) return pupils;
    return 'Equal and reactive';
  }
  // ===== NECK — Additional =====
  if (actionId === 'neck-emphysema') {
    const neckFindings = ss?.neck || [];
    if (neckFindings.some(f => f.toLowerCase().includes('emphysema') || f.toLowerCase().includes('crepitus'))) return 'Subcutaneous emphysema present — crackling sensation on palpation.';
    return 'No subcutaneous emphysema. No crepitus.';
  }
  // ===== HEAD — Scalp & Skull (NOT face/mouth/lip findings) =====
  if (actionId === 'scalp-inspect') {
    const headFindings = ss?.head || [];
    // Only return findings relevant to scalp: wounds, lacerations, haematoma, deformity, swelling
    const scalpOnly = headFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('scalp') || lower.includes('lacerat') || lower.includes('haematoma')
        || lower.includes('deform') || lower.includes('wound') || lower.includes('swelling')
        || lower.includes('bleed') || lower.includes('contusion') || lower.includes('skull');
    });
    return scalpOnly.length ? scalpOnly.join('. ') : 'No wounds. No lacerations. No swelling. No deformity palpable.';
  }
  if (actionId === 'scalp-palpate') {
    const headFindings = ss?.head || [];
    const palpFindings = headFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('depress') || lower.includes('step') || lower.includes('boggy')
        || lower.includes('crepitus') || lower.includes('tender') || lower.includes('fracture');
    });
    return palpFindings.length ? palpFindings.join('. ') : 'No depressed fracture. No boggy swelling. No step deformity. Non-tender.';
  }
  if (actionId === 'ears-inspect') return ss?.headDetailed?.ears?.join('. ') || 'No Battle sign. No CSF otorrhoea. No haemotympanum. Canals clear.';
  // ===== NECK =====
  if (actionId === 'airway-listen') return 'Auscultating airway — listen carefully.';
  if (actionId === 'trachea-palpate') return ss?.neck?.find(f => f.toLowerCase().includes('trachea')) || 'Trachea central and midline.';
  if (actionId === 'jvd-inspect') return ss?.neck?.find(f => f.toLowerCase().includes('jvd') || f.toLowerCase().includes('jugular')) || 'No JVD. Veins not distended.';
  if (actionId === 'cspine-inspect') {
    const neckFindings = ss?.neck || [];
    const inspectFindings = neckFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('wound') || lower.includes('bruis') || lower.includes('swelling') || lower.includes('deform');
    });
    return inspectFindings.length ? inspectFindings.join('. ') : 'No wounds. No swelling. No deformity. Cervical collar in situ if applied.';
  }
  if (actionId === 'cspine-palpate') {
    const neckFindings = ss?.neck || [];
    const palpFindings = neckFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('tender') || lower.includes('step') || lower.includes('midline') || lower.includes('spasm');
    });
    return palpFindings.length ? palpFindings.join('. ') : 'No midline tenderness. No step deformity. No muscle spasm.';
  }
  // Pelvis
  if (actionId === 'pelvis-inspect') return ss?.pelvis?.some(f => f.toLowerCase().includes('deform') || f.toLowerCase().includes('bruis')) ? ss.pelvis.join('. ') : 'No deformity. No bruising. Leg length equal.';
  if (actionId === 'pelvis-palpate') return ss?.pelvis?.join('. ') || 'Pelvis stable on single spring test. No instability.';
  // Extremities — specific bone/joint findings
  // Search case data for specific limb pathology
  const extFindings = ss?.extremities || [];
  const allExtText = extFindings.join(' ').toLowerCase();
  // Neurological findings (hemiparesis / aphasia / cranial nerve signs) are
  // stored on `ss.neurological` in case data. We MUST include this field when
  // the student examines a limb, otherwise a stroke case with "Right arm
  // weakness" in extremities and "Right hemiparesis" in neurological will
  // silently fall through to the generic "Motor power 5/5" default (real bug
  // reported: right-MCA stroke case showing 5/5 on arms).
  const neuroFindings = ss?.neurological || [];

  // Helper: find findings matching keywords for a specific area. Searches BOTH
  // extremities and neurological arrays so limb-strength findings documented
  // in the neuro line ("Right hemiparesis", "Left arm 0/5", "Pronator drift
  // on the right") surface correctly on the 3D body.
  const findFor = (keywords: string[]): string | null => {
    const matchIn = (arr: string[]) =>
      arr.filter(f => keywords.some(k => f.toLowerCase().includes(k)));
    const matches = [...matchIn(extFindings), ...matchIn(neuroFindings)];
    return matches.length ? matches.join('. ') : null;
  };

  // Neuro-specific helper: looks for limb strength / tone / reflex findings
  // that describe a whole side (hemiparesis, hemiplegia, pronator drift) so a
  // per-limb click can surface them. Without this, clicking "right arm neuro"
  // on a left-hemisphere stroke case returns the stock "5/5" lie.
  const sideNeuroFor = (side: 'right' | 'left'): string | null => {
    const needles = side === 'right'
      ? ['right hemipar', 'right hemipleg', 'right-sided weak', 'right sided weak', 'right pronator drift', 'right arm drift', 'right leg drift', 'right arm weak', 'right leg weak', 'right leg 0/5', 'right arm 0/5', 'right 0/5', 'right 1/5', 'right 2/5', 'right 3/5', 'right 4/5', 'babinski.*right', 'right.*babinski', 'right hyperreflex']
      : ['left hemipar', 'left hemipleg', 'left-sided weak', 'left sided weak', 'left pronator drift', 'left arm drift', 'left leg drift', 'left arm weak', 'left leg weak', 'left leg 0/5', 'left arm 0/5', 'left 0/5', 'left 1/5', 'left 2/5', 'left 3/5', 'left 4/5', 'babinski.*left', 'left.*babinski', 'left hyperreflex'];
    const all = [...extFindings, ...neuroFindings];
    const matches = all.filter(f => {
      const lower = f.toLowerCase();
      return needles.some(n => new RegExp(n).test(lower));
    });
    return matches.length ? matches.join('. ') : null;
  };

  // RIGHT ARM
  if (actionId === 'r-arm-inspect') return findFor(['right arm', 'right upper limb', 'right forearm', 'right hand']) || 'No deformity. No swelling. No wounds. No bruising. Skin colour normal.';
  if (actionId === 'r-shoulder-palpate') return findFor(['right shoulder', 'r shoulder']) || 'No tenderness. Full range of motion. No crepitus.';
  if (actionId === 'r-humerus-palpate') return findFor(['humerus', 'right upper arm', 'r upper arm']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'r-elbow-palpate') return findFor(['right elbow', 'r elbow', 'olecranon']) || 'No tenderness. No effusion. Full flexion/extension.';
  if (actionId === 'r-forearm-palpate') return findFor(['right forearm', 'radius', 'ulna', 'colles', 'smith']) || 'No tenderness along radius or ulna. No deformity.';
  if (actionId === 'r-wrist-palpate') return findFor(['right wrist', 'r wrist', 'scaphoid', 'anatomical snuffbox']) || 'No tenderness. No swelling. Anatomical snuffbox non-tender.';
  if (actionId === 'r-hand-palpate') return findFor(['right hand', 'r hand', 'metacarpal']) || 'No metacarpal tenderness. No deformity. Grip strength normal.';
  if (actionId === 'r-thumb-palpate') return findFor(['right thumb', 'r thumb', 'gamekeeper', 'bennett']) || 'Thumb: no tenderness at MCP or IP joints. Full opposition. No instability.';
  if (actionId === 'r-fingers-palpate') return findFor(['right finger', 'r finger', 'right digit', 'mallet', 'boutonniere', 'phalanx']) || 'All digits: no tenderness. No deformity. Full range of motion. No mallet or boutonniere deformity.';
  if (actionId === 'r-arm-pulses') return findFor(['right radial', 'r radial']) || 'Right radial pulse present, strong, regular. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'r-arm-neuro') {
    return sideNeuroFor('right')
      || findFor(['right arm', 'right upper limb', 'right arm sensation', 'right grip', 'r arm weak', 'right arm weak'])
      || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';
  }

  // LEFT ARM
  if (actionId === 'l-arm-inspect') return findFor(['left arm', 'left upper limb', 'left forearm', 'left hand']) || 'No deformity. No swelling. No wounds. No bruising. Skin colour normal.';
  if (actionId === 'l-shoulder-palpate') return findFor(['left shoulder', 'l shoulder']) || 'No tenderness. Full range of motion. No crepitus.';
  if (actionId === 'l-humerus-palpate') return findFor(['left humerus', 'l upper arm']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'l-elbow-palpate') return findFor(['left elbow', 'l elbow']) || 'No tenderness. No effusion. Full flexion/extension.';
  if (actionId === 'l-forearm-palpate') return findFor(['left forearm', 'l forearm', 'left radius', 'left ulna']) || 'No tenderness along radius or ulna. No deformity.';
  if (actionId === 'l-wrist-palpate') return findFor(['left wrist', 'l wrist']) || 'No tenderness. No swelling. Anatomical snuffbox non-tender.';
  if (actionId === 'l-hand-palpate') return findFor(['left hand', 'l hand', 'left metacarpal']) || 'No metacarpal tenderness. No deformity. Grip strength normal.';
  if (actionId === 'l-thumb-palpate') return findFor(['left thumb', 'l thumb']) || 'Thumb: no tenderness at MCP or IP joints. Full opposition. No instability.';
  if (actionId === 'l-fingers-palpate') return findFor(['left finger', 'l finger', 'left digit']) || 'All digits: no tenderness. No deformity. Full range of motion. No mallet or boutonniere deformity.';
  if (actionId === 'l-arm-pulses') return findFor(['left radial', 'l radial']) || 'Left radial pulse present, strong, regular. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'l-arm-neuro') {
    return sideNeuroFor('left')
      || findFor(['left arm', 'left upper limb', 'left arm sensation', 'left grip', 'l arm weak', 'left arm weak'])
      || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';
  }

  // Helper: check for oedema findings in ankle/foot exam
  const getOedemaFindings = (): string | null => {
    if (allExtText.includes('oedema') || allExtText.includes('edema') || allExtText.includes('swell') || allExtText.includes('pitting')) {
      const oedemaFindings = extFindings.filter(f =>
        f.toLowerCase().includes('oedema') || f.toLowerCase().includes('edema') || f.toLowerCase().includes('swell') || f.toLowerCase().includes('pitting')
      );
      if (oedemaFindings.length) return oedemaFindings.join('. ');
    }
    return null;
  };

  // RIGHT LEG
  // Bilateral findings like "Bilateral pitting oedema to mid-calf (2+)"
  // don't match limb-specific keywords — check the oedema helper too so
  // that pulmonary-oedema / heart-failure / DVT cases show their
  // expected leg findings instead of a generic "no swelling".
  if (actionId === 'r-leg-inspect') return findFor(['right leg', 'right lower limb', 'right thigh', 'right shin']) || getOedemaFindings() || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
  if (actionId === 'r-hip-palpate') return findFor(['right hip', 'r hip']) || 'No tenderness. No shortening or rotation.';
  if (actionId === 'r-femur-palpate') return findFor(['right femur', 'r femur', 'right thigh', 'r thigh']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'r-knee-palpate') return findFor(['right knee', 'r knee', 'patella']) || 'No tenderness. No effusion. Stable to valgus/varus stress.';
  if (actionId === 'r-tibia-palpate') return findFor(['right tibia', 'right fibula', 'r tibia', 'right shin', 'r shin']) || 'No tenderness. No deformity. No crepitus.';
  if (actionId === 'r-ankle-palpate') {
    const specific = findFor(['right ankle', 'r ankle', 'right malleol']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness over malleoli. No swelling. Ottawa rules negative.';
  }
  if (actionId === 'r-foot-palpate') {
    const specific = findFor(['right foot', 'r foot', 'right metatarsal']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness. No deformity. Weight-bearing ability normal.';
  }
  if (actionId === 'r-toes-palpate') return findFor(['right toe', 'r toe', 'right digit', 'right hallux']) || 'All toes: no tenderness. No deformity. Capillary refill brisk. Sensation intact.';
  if (actionId === 'r-leg-pulses') return findFor(['right dorsalis', 'right pedal', 'r dorsalis']) || 'Right dorsalis pedis and posterior tibial pulses present. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'r-leg-neuro') {
    return sideNeuroFor('right')
      || findFor(['right leg', 'right lower limb', 'right leg sensation', 'right leg weak', 'r leg weak'])
      || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  }
  if (actionId === 'r-leg-compartment' || actionId === 'r-thigh-compartment' || actionId === 'r-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('right') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'r-thigh-inspect') return findFor(['right thigh', 'right femur', 'r thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'r-knee-inspect') return findFor(['right knee', 'r knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'r-shin-inspect') return findFor(['right shin', 'right tibia', 'r shin']) || getOedemaFindings() || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'r-ankle-inspect') return findFor(['right ankle', 'r ankle']) || getOedemaFindings() || 'No swelling. No deformity. No bruising.';
  if (actionId === 'r-toes-inspect') return findFor(['right toe', 'r toe']) || 'Colour normal. Cap refill <2 seconds. No cyanosis.';

  // LEFT LEG
  if (actionId === 'l-leg-inspect') return findFor(['left leg', 'left lower limb', 'left thigh', 'left shin']) || getOedemaFindings() || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
  if (actionId === 'l-hip-palpate') return findFor(['left hip', 'l hip']) || 'No tenderness. No shortening or rotation.';
  if (actionId === 'l-femur-palpate') return findFor(['left femur', 'l femur', 'left thigh', 'l thigh']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'l-knee-palpate') return findFor(['left knee', 'l knee']) || 'No tenderness. No effusion. Stable to valgus/varus stress.';
  if (actionId === 'l-tibia-palpate') return findFor(['left tibia', 'left fibula', 'l tibia', 'left shin']) || 'No tenderness. No deformity. No crepitus.';
  if (actionId === 'l-ankle-palpate') {
    const specific = findFor(['left ankle', 'l ankle', 'left malleol']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness over malleoli. No swelling. Ottawa rules negative.';
  }
  if (actionId === 'l-foot-palpate') {
    const specific = findFor(['left foot', 'l foot', 'left metatarsal']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness. No deformity. Weight-bearing ability normal.';
  }
  if (actionId === 'l-toes-palpate') return findFor(['left toe', 'l toe', 'left digit', 'left hallux']) || 'All toes: no tenderness. No deformity. Capillary refill brisk. Sensation intact.';
  if (actionId === 'l-leg-pulses') return findFor(['left dorsalis', 'left pedal', 'l dorsalis']) || 'Left dorsalis pedis and posterior tibial pulses present. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'l-leg-neuro') {
    return sideNeuroFor('left')
      || findFor(['left leg', 'left lower limb', 'left leg sensation', 'left leg weak', 'l leg weak'])
      || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  }
  if (actionId === 'l-leg-compartment' || actionId === 'l-thigh-compartment' || actionId === 'l-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('left') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'l-thigh-inspect') return findFor(['left thigh', 'left femur', 'l thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'l-knee-inspect') return findFor(['left knee', 'l knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'l-shin-inspect') return findFor(['left shin', 'left tibia', 'l shin']) || getOedemaFindings() || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'l-ankle-inspect') return findFor(['left ankle', 'l ankle']) || getOedemaFindings() || 'No swelling. No deformity. No bruising.';
  if (actionId === 'l-toes-inspect') return findFor(['left toe', 'l toe']) || 'Colour normal. Cap refill <2 seconds. No cyanosis.';
  // Posterior
  if (actionId === 'logroll-inspect') {
    // Check for sacral oedema (heart failure, renal failure)
    const sacralFindings: string[] = [];
    if (ss?.posterior?.some(f => f.toLowerCase().includes('sacral'))) {
      sacralFindings.push(...(ss?.posterior?.filter(f => f.toLowerCase().includes('sacral')) || []));
    }
    if (allExtText.includes('sacral')) {
      sacralFindings.push(...extFindings.filter(f => f.toLowerCase().includes('sacral')));
    }
    const baseMsg = 'Log roll performed with manual in-line C-spine stabilisation. Patient rolled on command.';
    return sacralFindings.length ? `${baseMsg} ${sacralFindings.join('. ')}.` : baseMsg;
  }
  if (actionId === 'spine-inspect') {
    const posteriorFindings = ss?.posterior || [];
    return posteriorFindings.length ? posteriorFindings.join('. ') : 'No bruising, wounds, or haematoma along spine.';
  }
  if (actionId === 'spine-palpate') {
    const posteriorFindings = ss?.posterior || [];
    // Include sacral oedema in palpation findings if present
    const sacral = posteriorFindings.filter(f => f.toLowerCase().includes('sacral') || f.toLowerCase().includes('oedema') || f.toLowerCase().includes('edema'));
    const spinal = posteriorFindings.filter(f => !f.toLowerCase().includes('sacral'));
    const palpFindings = [...spinal, ...sacral].filter(Boolean);
    return palpFindings.length ? palpFindings.join('. ') : 'No midline tenderness. No step deformity. No muscle spasm.';
  }
  return 'No abnormalities detected.';
}

// ============================================================================
// Region label for display
// ============================================================================
const REGION_LABELS: Record<string, string> = {
  head: 'Head', face: 'Face', 'neck-cspine': 'Neck & C-Spine', chest: 'Chest',
  abdomen: 'Abdomen', pelvis: 'Pelvis',
  'right-arm': 'Right Arm', 'left-arm': 'Left Arm',
  'right-leg': 'Right Leg', 'left-leg': 'Left Leg',
  extremities: 'Extremities', 'posterior-logroll': 'Posterior',
};

const LIMB_LABELS: Record<string, string> = {
  'right-arm': 'Right Arm', 'left-arm': 'Left Arm',
  'right-leg': 'Right Leg', 'left-leg': 'Left Leg',
};

// ============================================================================
// Camera Animation Utility (Phase 2C)
// ============================================================================

function useCameraAnimation() {
  const animationRef = useRef<number | null>(null);

  const animateCamera = useCallback((
    controls: OrbitControlsHandle | null,
    targetPos: [number, number, number],
    targetLookAt: [number, number, number],
    duration = 400,
  ) => {
    if (!controls) return;
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPos = controls.object.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / duration, 1);
      const t = easeInOut(rawT);

      controls.object.position.set(
        startPos.x + (targetPos[0] - startPos.x) * t,
        startPos.y + (targetPos[1] - startPos.y) * t,
        startPos.z + (targetPos[2] - startPos.z) * t,
      );
      controls.target.set(
        startTarget.x + (targetLookAt[0] - startTarget.x) * t,
        startTarget.y + (targetLookAt[1] - startTarget.y) * t,
        startTarget.z + (targetLookAt[2] - startTarget.z) * t,
      );
      controls.update();

      if (rawT < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // The student grabbing the orbit controls must win instantly — an in-flight
  // preset animation fighting a drag reads as "the camera keeps rotating and
  // I can't stop it".
  const cancelCameraAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { animateCamera, cancelCameraAnimation };
}

const PERCUSSION_DURATION = 800;

function getUprightCameraFocus(patientScale = 1) {
  const cameraScale = Math.max(0.6, Math.min(1, patientScale));
  const target: [number, number, number] = [0, 0.92 * patientScale, 0];
  return {
    pos: [0, target[1] + 0.04 * cameraScale, 3.55 * cameraScale] as [number, number, number],
    target,
  };
}

// The treatment-bay model is rotated supine, so clinical Y becomes the
// scene's depth axis. Aim at the thoraco-abdominal centre of the patient
// rather than the head-side; floor staging drops the eye-line with the body.
function getTreatmentBayCameraFocus(
  stage: BayPatientStage,
  posture: PatientPosture,
  mobility: PatientMobility = 'recumbent',
  patientScale = 1,
  seatedSupportLift = 0,
  environment: EnvironmentVariant = 'clinic',
  plant?: { x?: number; z?: number },
) {
  const cameraScale = Math.max(0.6, Math.min(1, patientScale));
  const plantX = plant?.x ?? 0;
  if (mobility === 'pacing') {
    // Frame the whole walking lane, not just the starting pose. The patient
    // approaches the camera on each pass; torso-centred seated framing cuts
    // off the head at that end of the route.
    const target: [number, number, number] = [0.24 + plantX, 0.72 * patientScale, 0.55];
    return {
      pos: [target[0], target[1] + 0.3 * cameraScale, target[2] + 3.95 * cameraScale] as [number, number, number],
      target,
    };
  }
  if (posture === 'tripod' || posture === 'seated' || posture === 'legs-elevated' || mobility === 'standing') {
    // Keep the whole seated body inside the unobstructed part of the viewport.
    // The bottom care ribbon consumes part of the Canvas, so a torso-centred
    // portrait cropped both feet and made pedal assessment impossible from the
    // overview. A slightly lower target and longer three-quarter view retain
    // the face while showing knees, ankles, soles and their interaction sites.
    const stageLift = mobility === 'standing' ? 0 : seatedSupportLift;
    const target: [number, number, number] = [plantX, 0.70 * patientScale + stageLift, 0.18];
    return {
      // A slight three-quarter arrival angle makes the forward trunk lean and
      // hands-on-thigh bracing readable immediately. The extra stand-off also
      // keeps the distal legs visible below the persistent care controls.
      pos: [target[0] + 1.1 * cameraScale, target[1] + 0.36 * cameraScale, target[2] + 3.55 * cameraScale] as [number, number, number],
      target,
    };
  }
  const target = treatmentBayClinicalToWorld([0, 0.96, -0.05], stage, posture, mobility, patientScale, seatedSupportLift, plant);
  if (posture === 'recovery') {
    const recoveryOffset = stage === 'floor'
      ? [-1.45, 2.25, 1.95]
      : [-2.05, 0.56, 1.37];
    return {
      // Look across the patient's side instead of down the long axis. The
      // lateral view makes the flexed upper knee and airway-protecting arm
      // position immediately legible, while the negative-X side avoids the
      // trolley monitor that blocks the opposite lateral approach.
      pos: [
        target[0] + recoveryOffset[0] * cameraScale,
        target[1] + recoveryOffset[1] * cameraScale,
        target[2] + recoveryOffset[2] * cameraScale,
      ] as [number, number, number],
      target,
    };
  }
  const adultOffset = stage === 'floor'
    ? treatmentBayFloorOverviewOffset(environment)
    : [1.42, 1.30 - 0.888, 2.12 - (-0.218)];
  return {
    // Scene context is established before the student enters treatment. Once
    // care starts, scale the adult camera offset around the patient's real
    // thoraco-abdominal centre so an infant remains legible rather than a tiny
    // figure at the far end of an adult frame.
    pos: [
      target[0] + adultOffset[0] * cameraScale,
      target[1] + adultOffset[1] * cameraScale,
      target[2] + adultOffset[2] * cameraScale,
    ] as [number, number, number],
    target,
  };
}

const REGION_CAMERA_FOCUS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  head: { pos: [0, 1.68, 1.72], target: [0, 1.68, 0.06] },
  face: { pos: [0, 1.61, 1.42], target: [0, 1.61, 0.07] },
  'neck-cspine': { pos: [0, 1.46, 1.6], target: [0, 1.46, 0.06] },
  chest: { pos: [0, 1.26, 1.78], target: [0, 1.26, 0.08] },
  abdomen: { pos: [0, 1.03, 1.84], target: [0, 1.03, 0.10] },
  pelvis: { pos: [0, 0.88, 2.28], target: [0, 0.88, 0.08] },
  'right-arm': { pos: [-0.32, 0.98, 2.42], target: [-0.22, 0.98, 0.06] },
  'left-arm': { pos: [0.32, 0.98, 2.42], target: [0.22, 0.98, 0.06] },
  'right-leg': { pos: [-0.14, 0.48, 2.55], target: [-0.10, 0.48, 0.06] },
  'left-leg': { pos: [0.14, 0.48, 2.55], target: [0.10, 0.48, 0.06] },
  extremities: { pos: [0, 0.62, 2.85], target: [0, 0.62, 0.06] },
  'posterior-logroll': { pos: [0, 1.10, -2.55], target: [0, 1.10, 0] },
};

// Approximate framing radius (metres) per region — the vertical half-extent
// the zoom should fill. Distance is derived from this + the live fov/aspect
// so the region fills the frame instead of sitting low with empty space
// above (the old fixed distances framed the head at only ~22% of height).
const REGION_RADIUS: Record<string, number> = {
  head: 0.16, face: 0.12, 'neck-cspine': 0.13, chest: 0.30, abdomen: 0.26,
  pelvis: 0.28, 'right-arm': 0.40, 'left-arm': 0.40, 'right-leg': 0.46,
  'left-leg': 0.46, extremities: 0.55, 'posterior-logroll': 0.55,
};

/**
 * Compute a camera position that frames a sphere of `radius` metres around
 * `target`, viewed from direction `dir`, filling ~`fill` of the viewport.
 * Distance comes from the LIVE perspective fov + aspect, so framing is
 * correct for any canvas shape (tall/narrow included).
 */
function fitCameraPos(
  controls: OrbitControlsHandle,
  target: [number, number, number],
  dir: [number, number, number],
  radius: number,
  fill = 0.82,
): [number, number, number] {
  const cam = controls.object as unknown as { fov?: number; aspect?: number };
  const vFov = ((cam.fov ?? 38) * Math.PI) / 180;
  const aspect = cam.aspect && cam.aspect > 0 ? cam.aspect : 1;
  const tan = Math.tan(vFov / 2);
  const distV = radius / tan / fill;
  const distH = radius / (tan * aspect) / fill;
  const dist = Math.max(distV, distH, 0.45);
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return [
    target[0] + (dir[0] / len) * dist,
    target[1] + (dir[1] / len) * dist,
    target[2] + (dir[2] / len) * dist,
  ];
}

// ============================================================================
// Main Component
// ============================================================================

interface Body3DModelProps {
  onRegionClick: (stepId: AssessmentStepId) => void;
  assessedRegions: Set<string>;
  caseData: CaseScenario;
  patientSounds?: ClinicalSoundState | null;
  isStudentView?: boolean;
  caseCategory?: string;
  /** Treatments already applied, used to render visible devices on the mannequin. */
  appliedTreatmentIds?: string[];
  /** Scenario-derived render state: mannequin effects, equipment anchors, and risk flags. */
  patientVisualState?: PatientVisualState | null;
  /** Whether the patient is currently in cardiac arrest (all pulses absent) */
  isInArrest?: boolean;
  /**
   * Live vital signs used to drive perfusion visuals on the mannequin
   * (skin cyanosis from SpO2, pallor from shock index). When undefined,
   * the body falls back to the case's initial vitals (no live tint).
   */
  vitals?: VitalSigns;
  /** Live respiratory rate from the monitor (breaths/min). Drives the visible
   *  chest-rise so the mannequin breathes IN SYNC with the monitor — fast when
   *  tachypnoeic, absent at 0. Falls back to the case rate when undefined. */
  liveRespiration?: number;
  /** Run a pulse check from a mannequin pulse point (radial wrist / carotid neck). */
  onPulse?: (site: string) => void;
  /** Use stretcher-side treatment presentation in the full-body overview. */
  treatmentBayMode?: boolean;
  /**
   * Signals that the patient has mounted and survived two paint frames. This
   * lets the surrounding encounter UI time arrival cues to a usable scene,
   * rather than to the start of an asynchronous GLB/environment load.
   */
  onSceneReady?: () => void;
  /**
   * Tiny bridge to the care rail Treat tab after a finding (does not open jump-bag
   * internals — StudentPanel owns bag selection). Used for "listen → then treat".
   */
  onRequestTreat?: (hint?: { reason?: string; managementTab?: string; search?: string }) => void;
}

// Phase 2 — guided exam mode: persist preference across sessions
const GUIDED_MODE_STORAGE_KEY = 'paramedic-studio-guided-exam-mode';

function loadGuidedModePreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(GUIDED_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveGuidedModePreference(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDED_MODE_STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    /* noop */
  }
}

/**
 * Premium in-frame findings overlay. Renders the revealed exam findings as
 * small, semi-transparent glass cards layered over the bottom of the 3D
 * frame (instead of dropping into a panel below the mannequin). The active
 * finding is shown prominently; previously-revealed findings for the region
 * collapse into compact chips. Severity is inferred from the finding text
 * (findings are plain strings) so the card colour reads at a glance.
 */
function InFrameFindings({
  selectedAction,
  revealedFindings,
  allActions,
  offsetForEyeContext = false,
}: {
  selectedAction: string | null;
  revealedFindings: Map<string, string>;
  allActions: { id: string; label: string }[];
  offsetForEyeContext?: boolean;
}) {
  const labelFor = (id: string) => allActions.find(a => a.id === id)?.label ?? 'Finding';
  // When the eye loupe is open it already shows the pupils in full — so the
  // pupil/eye finding bubble is redundant AND it's the element the loupe was
  // overlapping. Drop it here so the loupe is the single source of truth.
  const isEyeFinding = (id: string) => offsetForEyeContext && (id.includes('pupil') || id.includes('eye'));
  const active = selectedAction && revealedFindings.has(selectedAction) && !isEyeFinding(selectedAction)
    ? { label: labelFor(selectedAction), text: revealedFindings.get(selectedAction)! }
    : null;
  const regionIds = new Set(allActions.map(a => a.id));
  const others = [...revealedFindings.entries()].filter(([id]) => regionIds.has(id) && id !== selectedAction && !isEyeFinding(id));
  if (!active && others.length === 0) return null;

  const severity = (t: string): 'crit' | 'warn' | 'ok' => {
    const s = t.toLowerCase();
    if (/no pulse|pulseless|absent|silent chest|stridor|cyanos|severe|critical|haemorrhag|hemorrhag|arrest|unequal|deviat|fixed|blown/.test(s)) return 'crit';
    if (/reduced|decreased|diminish|wheeze|crackle|delayed|abnormal|prolonged|weak|guard|tender|sluggish|distress/.test(s)) return 'warn';
    return 'ok';
  };
  const tone = {
    crit: 'border-red-400/40',
    warn: 'border-amber-300/40',
    ok: 'border-emerald-300/30',
  } as const;
  const dotTone = { crit: 'bg-red-400', warn: 'bg-amber-300', ok: 'bg-emerald-400' } as const;

  return (
    <div className={`pointer-events-none absolute right-3 z-30 flex w-[min(18rem,calc(100%-1.5rem))] flex-col items-stretch gap-1.5 ${offsetForEyeContext ? 'top-[20.5rem]' : 'top-14'}`}>
      {active && (() => {
        const sv = severity(active.text);
        return (
          <div className={`pointer-events-auto rounded-2xl border ${tone[sv]} bg-slate-950/55 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl animate-fade-in`}>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotTone[sv]} animate-pulse`} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">{active.label}</p>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/95">{active.text}</p>
          </div>
        );
      })()}
      {others.length > 0 && (
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {others.map(([id, text]) => (
            <span key={id} className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur-md">
              <span className="font-semibold text-white/90">{labelFor(id)}:</span>{' '}
              {text.length > 44 ? `${text.slice(0, 42)}…` : text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentActionDock({
  activeRegion,
  actions,
  selectedAction,
  revealedFindings,
  onAction,
}: {
  activeRegion: string;
  actions: ExamAction[];
  selectedAction: string | null;
  revealedFindings: Map<string, string>;
  onAction: (actionId: string) => void;
}) {
  const grouped = TECHNIQUE_ORDER
    .map(technique => {
      const items = actions.filter(action => action.technique === technique);
      if (items.length === 0) return null;
      const selected = items.find(action => action.id === selectedAction);
      const primary = selected ?? items[0];
      const completed = items.filter(action => revealedFindings.has(action.id)).length;
      return { technique, items, primary, selected, completed };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (grouped.length === 0) return null;

  const selectedGroup = grouped.find(group => group.items.some(action => action.id === selectedAction)) ?? grouped[0];

  return (
    <div className="pointer-events-auto absolute bottom-2 left-2 z-20 w-[min(18rem,calc(100%-1rem))] overflow-hidden rounded-xl border border-white/20 bg-slate-950/90 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-3 border-b border-white/12 px-2.5 py-1.5">
        <div className="min-w-0">
          <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/60">Assessment cockpit</p>
          <p className="truncate text-[11px] font-bold text-white">{REGION_LABELS[activeRegion] || activeRegion}</p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/12 px-2 py-0.5 text-[7px] font-semibold text-white/85">
          {actions.filter(action => revealedFindings.has(action.id)).length}/{actions.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1.5">
        {grouped.map(group => {
          const Icon = TECHNIQUE_ICONS[group.technique];
          const isActive = group.items.some(action => action.id === selectedAction);
          const meta = TECHNIQUE_META[group.technique];
          const dock = DOCK_TONE[group.technique];
          return (
            <button
              key={group.technique}
              type="button"
              onClick={() => onAction(group.primary.id)}
              className={`group flex min-h-[3.55rem] flex-col justify-between rounded-lg border px-1.5 py-1.5 text-left transition-all hover:-translate-y-0.5 ${isActive ? dock.active : `${dock.tone} hover:border-white/40`}`}
            >
              <span className="flex items-center justify-between gap-1">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : dock.icon}`} />
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[6px] font-bold text-white/90">
                  {group.completed}/{group.items.length}
                </span>
              </span>
              <span>
                <span className="block text-[9px] font-bold leading-tight text-white">{meta.label}</span>
                <span className="mt-0.5 block text-[7px] font-semibold leading-tight text-white/80">{meta.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/12 px-1.5 pb-1.5">
        <p className="px-1 pt-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/65">
          Targets
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {selectedGroup.items.map(action => {
            const isSelected = selectedAction === action.id;
            const isDone = revealedFindings.has(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction(action.id)}
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-medium transition-colors ${
                  isSelected
                    ? 'border-white/35 bg-white/22 text-white'
                    : isDone
                      ? 'border-emerald-300/45 bg-emerald-400/22 text-emerald-50'
                      : 'border-white/18 bg-white/12 text-white/85 hover:bg-white/20'
                }`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RegionalZoomLoupe({
  activeRegion,
  selectedAction,
  caseData,
  pupilProfile,
  revealedFindings,
  onAction,
  eyeControls,
}: {
  activeRegion: string | null;
  selectedAction: string | null;
  caseData: CaseScenario;
  pupilProfile: PupilProfile;
  revealedFindings?: Map<string, string>;
  onAction?: (actionId: string) => void;
  eyeControls?: ReactNode;
}) {
  const isEyeFocused = activeRegion === 'face'
    && !!selectedAction
    && (selectedAction.includes('pupil') || selectedAction.includes('eyes'));

  if (isEyeFocused) return eyeControls ?? <PupilCloseUp profile={pupilProfile} />;

  // Chest "zoom loupe" intentionally removed — it duplicated the full chest
  // map already shown in the bottom Hands-On Exam Station. Chest detail now
  // lives in exactly one place to keep the assessment view uncluttered.

  if (activeRegion === 'abdomen') {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-100/30 bg-slate-950/52 p-2 shadow-2xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <div>
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-emerald-100/55">Zoom loupe</p>
            <p className="text-[10px] font-semibold text-white/92">Abdominal quadrants</p>
          </div>
          <span className="rounded-full border border-emerald-200/25 bg-emerald-300/12 px-2 py-0.5 text-[7px] font-semibold text-emerald-100">
            IAPP order
          </span>
        </div>
        <AbdominalQuadrantPanel selectedAction={selectedAction} caseData={caseData} compact revealedFindings={revealedFindings} onAction={onAction} />
      </div>
    );
  }

  return null;
}

type PatientReactionTone = 'patient' | 'coach' | 'warning' | 'calm';

interface PatientReaction {
  id: string;
  tone: PatientReactionTone;
  title: string;
  message: string;
  quote?: string;
  regionId: string;
  actionId: string;
}

function getPatientResponsiveness(caseData: CaseScenario, live: PatientCommunicationInput = {}) {
  const { canVocalize, isAwake } = derivePatientCommunication(caseData, live);
  const appearance = [
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
  ].filter(Boolean).join(' ').toLowerCase();

  return {
    canVocalize,
    isAwake,
    isDistressed: /distress|anxious|pain|cry|gasping|moaning|uncomfortable|miserable|agitated/.test(appearance),
  };
}

function hasRevealedMatching(revealedFindings: Map<string, string>, predicate: (actionId: string) => boolean): boolean {
  for (const actionId of revealedFindings.keys()) {
    if (predicate(actionId)) return true;
  }
  return false;
}

function getPatientReaction(
  caseData: CaseScenario,
  regionId: string,
  actionId: string,
  finding: string,
  revealedFindings: Map<string, string>,
  live: PatientCommunicationInput = {},
): PatientReaction | null {
  const patient = getPatientResponsiveness(caseData, live);
  const lowerFinding = finding.toLowerCase();
  const reactionBase = { regionId, actionId };

  if (/no pulse|absent pulse|pulseless/.test(lowerFinding)) {
    return {
      ...reactionBase,
      id: `${actionId}-no-pulse`,
      tone: 'warning',
      title: 'Critical finding',
      message: 'Treat this as absent perfusion. Confirm quickly, call for help, and move straight into the relevant resuscitation pathway.',
    };
  }

  if (regionId === 'abdomen' && actionId.includes('palpate')) {
    const auscultated = hasRevealedMatching(
      revealedFindings,
      id => id === 'abd-auscultate' || /^abd-(ruq|luq|rlq|llq)-.*auscultate$/.test(id),
    );

    if (!auscultated) {
      return {
        ...reactionBase,
        id: `${actionId}-abd-sequence`,
        tone: 'warning',
        title: 'Sequence critique',
        quote: patient.canVocalize ? 'Can you tell me before you press there?' : undefined,
        message: 'Auscultate before palpation when bowel sounds matter. Palpation can change bowel activity and can increase guarding.',
      };
    }
  }

  const closeAirwayCheck = actionId === 'mouth-inspect'
    || actionId === 'mouth-mucosa'
    || actionId === 'tongue-inspect'
    || actionId === 'teeth-inspect';

  if (closeAirwayCheck && patient.isAwake) {
    return {
      ...reactionBase,
      id: `${actionId}-awake-airway`,
      tone: 'warning',
      title: 'Patient tolerance',
      quote: 'What are you doing? That makes me gag.',
      message: 'Explain first and keep the check gentle. Awake patients may refuse or gag with invasive airway checks or adjuncts such as an OPA.',
    };
  }

  if (actionId.includes('palpate') && hasPainfulPalpationFinding(finding)) {
    return {
      ...reactionBase,
      id: `${actionId}-pain-response`,
      tone: 'patient',
      title: 'Patient response',
      quote: patient.canVocalize
        ? (patient.isDistressed ? 'Please stop, that really hurts.' : 'Ow, that is sore there.')
        : undefined,
      message: 'The patient guards away from your hand. Reassess pain, distal perfusion, and explain before continuing.',
    };
  }

  if (regionId === 'posterior-logroll' && actionId === 'logroll-inspect') {
    return {
      ...reactionBase,
      id: `${actionId}-logroll`,
      tone: 'coach',
      title: 'Movement cue',
      quote: patient.canVocalize ? 'My back hurts when you move me.' : undefined,
      message: 'Coordinate the roll on one count, maintain C-spine control, and keep the patient aligned while you inspect the posterior surface.',
    };
  }

  if (actionId.includes('pupil') || actionId.includes('eyes')) {
    return {
      ...reactionBase,
      id: `${actionId}-eye-light`,
      tone: 'coach',
      title: 'Pupil check',
      // No spoken complaint — a real patient just squints. quote is undefined
      // so nothing is read aloud (the quote feeds TTS). The teaching point is
      // to forewarn before shining the light.
      quote: undefined,
      message: 'Warn the patient before you shine the light in their eyes — expect them to squint. Then compare both eyes: size in millimetres, equality, and direct + consensual response.',
    };
  }

  if (actionId.includes('auscultate')) {
    return {
      ...reactionBase,
      id: `${actionId}-listen-cue`,
      tone: 'coach',
      title: 'Auscultation cue',
      // Consent belongs at the beginning of the examination. The calibrated
      // site sequence itself is deliberately quiet: the learner needs to hear
      // the breath/heart sounds, not a new patient line at every position.
      quote: patient.canVocalize && regionId === 'chest' ? 'You can go ahead and listen to my chest.' : undefined,
      message: regionId === 'chest'
        ? 'Ask for normal open-mouth breaths, compare matching positions side to side, then keep the patient quiet while you move between sites.'
        : 'Pause long enough to hear a real pattern before moving to the next site.',
    };
  }

  if (actionId.includes('percuss')) {
    return {
      ...reactionBase,
      id: `${actionId}-percussion-cue`,
      tone: 'coach',
      title: 'Technique cue',
      message: 'Percuss equivalent points right-to-left at the same level so dullness, resonance, or hyper-resonance means something.',
    };
  }

  return null;
}

function PatientReactionCard({ reaction }: { reaction: PatientReaction | null }) {
  if (!reaction) return null;

  // Near-solid dark backing (not translucent) so the text stays readable over
  // the bright patient model — the coloured border + glow carry the tone.
  const tone: Record<PatientReactionTone, { wrap: string; dot: string; label: string; icon: typeof User }> = {
    patient: {
      wrap: 'border-cyan-300/60 bg-slate-950/92 shadow-[0_24px_60px_-26px_rgba(34,211,238,0.7)]',
      dot: 'bg-cyan-300',
      label: 'Patient response',
      icon: User,
    },
    coach: {
      wrap: 'border-violet-300/60 bg-slate-950/92 shadow-[0_24px_60px_-26px_rgba(167,139,250,0.7)]',
      dot: 'bg-violet-300',
      label: 'Clinical coach',
      icon: Activity,
    },
    warning: {
      wrap: 'border-amber-300/65 bg-slate-950/92 shadow-[0_24px_60px_-26px_rgba(251,191,36,0.75)]',
      dot: 'bg-amber-300',
      label: 'Clinical critique',
      icon: AlertTriangle,
    },
    calm: {
      wrap: 'border-emerald-300/60 bg-slate-950/92 shadow-[0_24px_60px_-26px_rgba(52,211,153,0.6)]',
      dot: 'bg-emerald-300',
      label: 'Encounter cue',
      icon: User,
    },
  };
  const meta = tone[reaction.tone];
  const Icon = meta.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute left-3 top-14 z-30 w-[min(16rem,calc(100%-1.5rem))] rounded-2xl border px-3.5 py-3 text-white backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-300 ${meta.wrap}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/75">{meta.label}</p>
          </div>
          <p className="mt-0.5 text-[12px] font-semibold leading-tight text-white">{reaction.title}</p>
        </div>
      </div>

      {reaction.quote && (
        <p className="mt-2 rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-[12px] font-medium italic leading-snug text-white">
          "{reaction.quote}"
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-white/90">{reaction.message}</p>
    </div>
  );
}

function ObserveQuickActions({
  onCue,
  referenceScene = false,
}: {
  onCue: (cue: 'look' | 'listen' | 'feel') => void;
  referenceScene?: boolean;
}) {
  const cues: Array<{
    id: 'look' | 'listen' | 'feel';
    label: string;
    hint: string;
    Icon: typeof Eye;
    tone: string;
  }> = [
    {
      id: 'look',
      label: 'Look',
      hint: 'Chest rise & colour',
      Icon: Eye,
      tone: 'border-sky-300/45 bg-sky-500/25 text-sky-50 hover:bg-sky-500/40',
    },
    {
      id: 'listen',
      label: 'Listen',
      hint: 'Auscultate lungs',
      Icon: Stethoscope,
      tone: 'border-emerald-300/45 bg-emerald-500/25 text-emerald-50 hover:bg-emerald-500/40',
    },
    {
      id: 'feel',
      label: 'Feel',
      hint: 'Chest wall & pulse',
      Icon: Hand,
      tone: 'border-amber-300/45 bg-amber-500/25 text-amber-50 hover:bg-amber-500/40',
    },
  ];

  return (
    <div
      className={`patient-observe-quick-actions pointer-events-auto absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 ${referenceScene ? 'bg-slate-950/95' : 'bg-slate-950/72'} px-2 py-1.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl`}
      role="group"
      aria-label="Observe the patient — Look, Listen, Feel"
    >
      <span className="hidden px-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70 sm:inline">
        Observe
      </span>
      {cues.map(cue => {
        const Icon = cue.Icon;
        return (
          <button
            key={cue.id}
            type="button"
            onClick={() => onCue(cue.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition hover:-translate-y-0.5 active:scale-95 ${cue.tone}`}
            title={`${cue.label} — ${cue.hint}`}
            aria-label={`${cue.label}: ${cue.hint}`}
            data-observe-cue={cue.id}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{cue.label}</span>
            <span className="hidden text-[8px] font-medium opacity-75 sm:inline">{cue.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

function PatientFirstExamDock({
  activeRegion,
  actions,
  selectedAction,
  revealedFindings,
  onAction,
  caseData,
  pupilProfile,
  patientReaction,
  showRegionalLoupe,
  playingSound,
  soundProgress,
  onRequestTreat,
  onTechniqueChange,
  eyeControls,
}: {
  activeRegion: string;
  actions: ExamAction[];
  selectedAction: string | null;
  revealedFindings: Map<string, string>;
  onAction: (actionId: string) => void;
  caseData: CaseScenario;
  pupilProfile: PupilProfile;
  patientReaction: PatientReaction | null;
  showRegionalLoupe: boolean;
  playingSound: string | null;
  soundProgress: number;
  onRequestTreat?: (hint?: { reason?: string; managementTab?: string; search?: string }) => void;
  onTechniqueChange?: () => void;
  eyeControls?: ReactNode;
}) {
  const grouped = TECHNIQUE_ORDER
    .map(technique => {
      const items = actions.filter(action => action.technique === technique);
      if (items.length === 0) return null;
      const selected = items.find(action => action.id === selectedAction);
      const primary = selected ?? items[0];
      const completed = items.filter(action => revealedFindings.has(action.id)).length;
      return { technique, items, primary, selected, completed };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedActionTechnique = actions.find(action => action.id === selectedAction)?.technique ?? null;
  const defaultTechnique = grouped[0]?.technique ?? 'inspect';
  const [selectedTechnique, setSelectedTechnique] = useState<ExamTechnique>(
    selectedActionTechnique ?? defaultTechnique,
  );

  useEffect(() => {
    setSelectedTechnique(selectedActionTechnique ?? defaultTechnique);
  }, [activeRegion, defaultTechnique, selectedActionTechnique]);

  if (grouped.length === 0) return null;

  const selectedGroup = grouped.find(group => group.technique === selectedTechnique) ?? grouped[0];
  const completedCount = actions.filter(action => revealedFindings.has(action.id)).length;
  const selectedActionLabel = actions.find(action => action.id === selectedAction)?.label ?? 'Finding';
  const activeFinding = selectedAction
    && selectedActionTechnique === selectedTechnique
    && revealedFindings.has(selectedAction)
    ? revealedFindings.get(selectedAction) ?? null
    : null;
  const nextAction = actions.find(action => !revealedFindings.has(action.id) && action.id !== selectedAction)
    ?? actions.find(action => !revealedFindings.has(action.id))
    ?? null;
  const findingSuggestsTreat = Boolean(
    activeFinding
    && (
      (selectedAction?.includes('auscultate') ?? false)
      || /wheez|crackle|stridor|diminished|absent|air entry|cyanosis|accessory|tripod|silent chest/i.test(activeFinding)
    ),
  );
  const treatTab = activeRegion === 'chest' || activeRegion === 'face' || activeRegion === 'neck-cspine'
    ? 'breathing'
    : activeRegion === 'abdomen'
      ? 'circulation'
      : 'airway';
  const regionFindings = actions
    .filter(action => revealedFindings.has(action.id) && action.id !== selectedAction)
    .slice(-4);
  const hasPatientQuote = Boolean(patientReaction?.quote);
  const reactionTone: Record<PatientReactionTone, string> = {
    patient: 'border-cyan-300/35 bg-cyan-400/10 text-cyan-50',
    coach: 'border-violet-300/35 bg-violet-400/10 text-violet-50',
    warning: 'border-amber-300/40 bg-amber-400/12 text-amber-50',
    calm: 'border-emerald-300/35 bg-emerald-400/10 text-emerald-50',
  };

  return (
    <div className="patient-first-exam-dock pointer-events-auto relative z-20 mx-2 mb-2 rounded-2xl border border-cyan-200/20 bg-slate-950/88 p-2.5 text-white shadow-[0_28px_70px_-38px_rgba(0,0,0,1)] backdrop-blur-xl sm:mx-3 sm:mb-3">
      <div className="patient-first-exam-grid">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="min-w-0">
              <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-cyan-100/90">Hands-on assessment bay</p>
              <h3 className="truncate text-sm font-semibold text-white">
                {REGION_LABELS[activeRegion] || activeRegion}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-0.5 text-[8px] font-semibold text-cyan-50">
                Patient visible
              </span>
              <span className="rounded-full border border-white/12 bg-white/10 px-2 py-0.5 text-[8px] font-semibold text-white/82">
                {completedCount}/{actions.length}
              </span>
            </div>
          </div>

          <div className="patient-first-technique-grid mt-2">
            {grouped.map(group => {
              const Icon = TECHNIQUE_ICONS[group.technique];
              const isActive = group.technique === selectedTechnique;
              const meta = TECHNIQUE_META[group.technique];
              const dock = DOCK_TONE[group.technique];
              return (
                <button
                  key={group.technique}
                  type="button"
                  title={`${meta.label} — ${meta.hint}`}
                  aria-label={meta.label}
                  onClick={() => { setSelectedTechnique(group.technique); onTechniqueChange?.(); }}
                  className={`patient-first-technique-button ${isActive ? dock.active : dock.tone}`}
                >
                  <span className="flex w-full items-center justify-center">
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : dock.icon}`} />
                  </span>
                  <span className="flex w-full items-center justify-between gap-1">
                    <span className="min-w-0 truncate text-[9px] font-bold leading-tight">{meta.label}</span>
                    <span className="rounded-full bg-white/18 px-1.5 py-0.5 text-[7px] font-bold text-white/88">
                      {group.completed}/{group.items.length}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2">
            <p className="px-0.5 text-[7px] font-semibold uppercase tracking-[0.16em] text-white/46">Target points</p>
            <div className="patient-first-target-track mt-1.5">
              {selectedGroup.items.map(action => {
                const isSelected = selectedAction === action.id;
                const isDone = revealedFindings.has(action.id);
                const isPlaying = playingSound === action.id;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      setSelectedTechnique(action.technique);
                      onAction(action.id);
                    }}
                    className={`patient-first-target-chip ${isSelected ? 'is-selected' : ''} ${isDone ? 'is-done' : ''}`}
                  >
                    <span className="truncate">{action.label}</span>
                    {isDone && <span className="shrink-0 text-[10px] font-black text-emerald-200">{'\u2713'}</span>}
                    {isPlaying && (
                      <span className="absolute inset-x-2 bottom-0.5 h-0.5 overflow-hidden rounded-full bg-white/16">
                        <span className="block h-full rounded-full bg-cyan-300" style={{ width: `${soundProgress * 100}%` }} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="patient-first-feedback mt-2">
            {activeFinding ? (
              <div className="rounded-xl border border-emerald-300/24 bg-emerald-400/10 px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-50/70">{selectedActionLabel}</p>
                </div>
                <p className="text-[11px] leading-relaxed text-white/92">{activeFinding}</p>
              </div>
            ) : patientReaction ? (
              <div className={`rounded-xl border px-3 py-2 ${reactionTone[patientReaction.tone]}`}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-75">{patientReaction.title}</p>
                </div>
                <p className="text-[11px] leading-relaxed text-white/88">
                  {hasPatientQuote ? `"${patientReaction.quote}" ` : ''}
                  {patientReaction.message}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
                <p className="text-[10px] font-semibold text-white/78">Select a technique, then choose the exact point you are assessing.</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/52">The patient remains in view so you can relate the finding to the body position and applied equipment.</p>
              </div>
            )}

            {patientReaction && activeFinding && (
              <div className={`rounded-xl border px-3 py-2 ${reactionTone[patientReaction.tone]}`}>
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-75">{patientReaction.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/82">
                  {hasPatientQuote ? `"${patientReaction.quote}" ` : ''}
                  {patientReaction.message}
                </p>
              </div>
            )}

            {activeFinding && (nextAction || findingSuggestsTreat) && (
              <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-cyan-100/75">Next step</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {nextAction && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTechnique(nextAction.technique);
                        onAction(nextAction.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-white/20"
                      data-exam-next-step={nextAction.id}
                    >
                      {TECHNIQUE_META[nextAction.technique].label}: {nextAction.label}
                    </button>
                  )}
                  {findingSuggestsTreat && onRequestTreat && (
                    <button
                      type="button"
                      onClick={() => onRequestTreat({ reason: selectedAction ?? 'finding', managementTab: treatTab })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/25 px-2.5 py-1 text-[10px] font-semibold text-emerald-50 hover:bg-emerald-500/40"
                      data-exam-next-treat="true"
                    >
                      Then treat → open {treatTab === 'breathing' ? 'Breathing' : treatTab === 'circulation' ? 'Circulation' : 'Airway'} bag
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[9px] leading-relaxed text-cyan-50/65">
                  Camera stays on this region — relate the finding to the body, then act.
                </p>
              </div>
            )}
          </div>

          {regionFindings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {regionFindings.map(action => (
                <span key={action.id} className="max-w-full rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[8px] font-medium text-white/70">
                  <span className="font-semibold text-white/88">{action.label}:</span>{' '}
                  {(revealedFindings.get(action.id) || '').slice(0, 42)}
                  {(revealedFindings.get(action.id) || '').length > 42 ? '…' : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="patient-first-loupe-column">
          {showRegionalLoupe ? (
            <RegionalZoomLoupe
              eyeControls={eyeControls}
              activeRegion={activeRegion}
              selectedAction={selectedAction}
              caseData={caseData}
              pupilProfile={pupilProfile}
              revealedFindings={revealedFindings}
              onAction={onAction}
            />
          ) : (
            <div className="patient-first-context-panel">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-cyan-100/52">Scene context</p>
              <p className="mt-1 text-[11px] font-semibold text-white/86">Body stays clear</p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/58">
                Assessment controls are docked here so injuries, equipment, breathing, skin colour, and patient posture stay readable.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientRealismStrip({
  profile,
  cues,
  assessedRegions,
  activeRegion,
}: {
  profile: PatientRealismProfile;
  cues: PatientRealismCue[];
  assessedRegions: Set<string>;
  activeRegion: string | null;
}) {
  const visibleCues = cues
    .filter(item => shouldRevealRealismCue(item, assessedRegions, activeRegion))
    .slice(0, 4);
  const priorities = profile.assessmentPriorities.slice(0, 4);

  if (!visibleCues.length && !priorities.length) return null;

  return (
    <div className="patient-realism-strip border-b border-slate-200/50 bg-gradient-to-r from-white/72 via-cyan-50/50 to-white/55 px-3 py-2 dark:border-white/5 dark:from-slate-950/70 dark:via-cyan-950/20 dark:to-slate-950/55">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 rounded-xl border border-white/70 bg-white/68 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.75)]" />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Live Patient Cues</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {visibleCues.map(item => {
              const style = REALISM_CUE_STYLE[item.severity];
              return (
                <span key={item.id} className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold ${style.chip}`}>
                  {item.label}
                </span>
              );
            })}
            {visibleCues.length === 0 && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-slate-900/60">
                Cues reveal as you assess
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/45">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.65)]" />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Assessment Targets</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {priorities.map(item => (
              <span key={item} className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[9px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData, patientSounds, caseCategory, appliedTreatmentIds = [], patientVisualState = null, isInArrest = false, vitals, liveRespiration, onPulse, treatmentBayMode = false, onSceneReady, onRequestTreat }: Body3DModelProps) {
  const { t } = useTranslation();
  const bedsideConversation = useBedsideConversation(caseData.id);
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const patientFrameRef = useRef<HTMLDivElement | null>(null);
  // Surface projector emitted by BodyMesh once the patient mesh loads — used to
  // anchor every floating label/finding onto the real body surface (works for
  // the male, female, or any future GLB without per-model coordinate tuning).
  const [surfaceSampler, setSurfaceSampler] = useState<SurfaceSampler | null>(null);
  const [faceAttachment, setFaceAttachment] = useState<THREE.Group | null>(null);
  // A mounted face attachment is the last asynchronous patient asset. Wait
  // through two animation frames so the caller receives this only after the
  // first meaningful patient frame has reached the canvas.
  useEffect(() => {
    if (!faceAttachment || !onSceneReady) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(onSceneReady);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [caseData.id, faceAttachment, onSceneReady]);
  // Stable callback for BodyMesh — it lives in an effect dependency array, so
  // a fresh inline arrow each render would re-run that effect → setState →
  // re-render every frame (an infinite "Maximum update depth" loop that read
  // on-screen as the vitals/3D flickering). useCallback pins it once.
  const handleSurfaceSampler = useCallback(
    (fn: SurfaceSampler | null) =>
      setSurfaceSampler(() => fn),
    [],
  );
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [showLimbDropdown, setShowLimbDropdown] = useState(false);
  const [activeLimb, setActiveLimb] = useState<LimbSide>(null);
  // Stage-3 auto-degrade ladder: single tier number, everything derived.
  // 0 = full (composer+dpr2+shadows) … 4 = minimal (see AdaptiveQuality.tsx).
  const [qualityTier, setQualityTier] = useState<QualityTier>(0);
  const quality = qualityForTier(
    qualityTier,
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2,
  );
  const [revealedFindings, setRevealedFindings] = useState<Map<string, string>>(new Map());
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [contactAction, setContactAction] = useState<string | null>(null);
  const [pupilLightSide, setPupilLightSide] = useState<'left' | 'right' | null>(null);
  const [patientReaction, setPatientReaction] = useState<PatientReaction | null>(null);
  // Regions the patient has already consented to exposing this case.
  const consentedRegionsRef = useRef<Set<string>>(new Set());
  // The patient's spoken voice — exam reactions are read aloud through the
  // same ElevenLabs → Supertonic → Web Speech chain as history answers.
  const patientVoice = usePatientVoice(caseData, { vitals, isInArrest, appliedTreatmentIds });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Patients present "as you would find them": dressed by default — the
  // student exposes regions through the exam (parting per CLOTHING_PARTING),
  // which is itself the clinical skill. Skin/skeleton stay one click away.
  const [anatomyLayer, setAnatomyLayer] = useState<'surface' | 'skeleton' | 'dressed'>('dressed');
  const defibrillatorPadsAttached = hasAttachedDefibrillatorPads(appliedTreatmentIds);
  // Dressed view: zooming does NOT undress the patient. Exposure is a
  // deliberate clinical act — this flags that the student chose to expose
  // the focused region (reset on every region change/close).
  const [regionExposed, setRegionExposed] = useState(false);
  // Phase 2F: Sound playback progress
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [soundProgress, setSoundProgress] = useState(0);
  const soundTimerRef = useRef<number | null>(null);
  const [pilotListeningStep, setPilotListeningStep] = useState(0);
  const pilotListeningCancel = useRef<(() => void) | null>(null);
  const cancelPilotListening = useCallback(() => {
    if (!pilotListeningCancel.current) return;
    pilotListeningCancel.current();
    pilotListeningCancel.current = null;
    if (soundTimerRef.current !== null) cancelAnimationFrame(soundTimerRef.current);
    soundTimerRef.current = null;
    stopAllSounds();
    setPlayingSound(null);
    setSoundProgress(0);
  }, []);
  useEffect(() => () => cancelPilotListening(), [caseData.id, cancelPilotListening]);
  useEffect(() => {
    if (bedsideConversation.active || anatomyLayer === 'skeleton') cancelPilotListening();
  }, [bedsideConversation.active, anatomyLayer, cancelPilotListening]);
  // Observe cues (Look / Listen / Feel) queue an exam action for the region
  // once handleRegionClick has finished opening the side rail.
  const pendingObserveActionRef = useRef<string | null>(null);

  // Phase 2 — guided exam mode state + transient "blocked" flash
  const [guidedMode, setGuidedMode] = useState<boolean>(loadGuidedModePreference);
  const [blockedNudge, setBlockedNudge] = useState<{ attempted: string; expected: string } | null>(null);
  const nudgeTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const treatmentBayOverviewEnabled = treatmentBayMode;
  const useTreatmentBayPresentation = treatmentBayOverviewEnabled;
  const patientFirstExamLayout = treatmentBayOverviewEnabled && !!activeRegion;
  const markerPresentation: MarkerPresentation = useTreatmentBayPresentation ? 'treatment-bay' : 'upright';
  // Scene-contextual staging: a collapsed/roadside patient renders on the
  // floor instead of pre-loaded onto the stretcher. Loading kit later lifts
  // them onto the trolley without rewriting the authored arrival pose.
  const sceneStage: BayPatientStage = useMemo(() => deriveScenePatientStage(caseData), [caseData]);
  const loadedOnStretcher = useMemo(
    () => patientLoadedOnStretcher(appliedTreatmentIds),
    [appliedTreatmentIds],
  );
  const bayStage: BayPatientStage = useMemo(
    () => deriveAppliedPatientStage(sceneStage, appliedTreatmentIds),
    [sceneStage, appliedTreatmentIds],
  );
  // MCI uses age/weight zero as an aggregate sentinel and has no single body
  // until a casualty is selected. Do not render that metadata as a newborn.
  const activePatientAge = caseData.mci?.isMCI ? undefined : caseData.patientInfo?.age;
  const patientScale = patientExpectedHeightMetres(activePatientAge) / 1.8;
  const [sceneAnchors, setSceneAnchors] = useState<SceneAnchorSet | null>(null);
  const handleSceneAnchorsReady = useCallback((anchors: SceneAnchorSet) => {
    setSceneAnchors(prev => {
      if (
        prev
        && prev.rest.x === anchors.rest.x
        && prev.rest.y === anchors.rest.y
        && prev.rest.z === anchors.rest.z
        && prev.kit.x === anchors.kit.x
        && prev.kit.y === anchors.kit.y
        && prev.kit.z === anchors.kit.z
        && prev.firstAid.x === anchors.firstAid.x
        && prev.firstAid.y === anchors.firstAid.y
        && prev.firstAid.z === anchors.firstAid.z
      ) {
        return prev;
      }
      return anchors;
    });
  }, []);
  const villaAnchors = useMemo(
    () => (caseData.id === 'resp-001' ? (sceneAnchors ?? fallbackSceneAnchors()) : null),
    [caseData.id, sceneAnchors],
  );
  const villaPlant = useMemo(
    () => (villaAnchors ? plantFromRestAnchor(villaAnchors.rest) : null),
    [villaAnchors],
  );
  const seatedSupportLift = villaPlant?.seatedSupportLift
    ?? (caseData.id === 'resp-001' ? RESP001_SEATED_SUPPORT_LIFT : 0);
  const plantOffset = useMemo(
    () => (villaPlant ? { x: villaPlant.x, z: villaPlant.z } : undefined),
    [villaPlant],
  );
  // Scene-contextual environment: villa cases render in a living room,
  // street cases at a roadside, mall cases in a public atrium.
  const bayVariant = useMemo(() => deriveSceneEnvironment(caseData), [caseData]);
  const cameraOrbitSafety = useMemo(
    () => cameraOrbitSafetyForEnvironment(bayVariant),
    [bayVariant],
  );

  // Region buttons may sit below the initial viewport. When selecting one
  // changes the patient panel from overview to the focused cockpit, preserve
  // orientation by bringing the whole patient frame back into view. Without
  // this correction the browser retained the old document scroll position and
  // the newly opened assessment dock could start above the visible viewport.
  useEffect(() => {
    if (!patientFirstExamLayout || !patientFrameRef.current) return;
    const frame = patientFrameRef.current;
    const frameId = window.requestAnimationFrame(() => {
      const rect = frame.getBoundingClientRect();
      const safeTop = 16;
      if (rect.top < safeTop || rect.top > window.innerHeight * 0.42) {
        window.scrollBy({ top: rect.top - safeTop, behavior: 'auto' });
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [patientFirstExamLayout, activeRegion]);

  const patientUnconscious = useMemo(() => {
    if (isInArrest) return true;
    const gcs = vitals?.gcs ?? caseData.abcde?.disability?.gcs?.total;
    if (typeof gcs === 'number' && gcs <= 8) return true;
    return caseData.abcde?.disability?.avpu === 'U';
  }, [isInArrest, vitals?.gcs, caseData]);

  const treatmentPositioning = useMemo(
    () => deriveTreatmentPositioningOverride(appliedTreatmentIds),
    [appliedTreatmentIds],
  );
  const patientMobility = useMemo<PatientMobility>(() => {
    if (isInArrest) return 'recumbent';
    return treatmentPositioning?.mobility ?? derivePatientMobility(caseData, patientUnconscious);
  }, [caseData, isInArrest, patientUnconscious, treatmentPositioning]);

  // Capture/dev-only SpO2 override so the harness can pin 85 vs 94 without
  // mutating the live treatment engine. Production builds never set it.
  // Read live inside the memo, not from the module-level CAPTURE_FORCED_SPO2
  // constant: that constant is evaluated at module load, which is BEFORE
  // Playwright's addInitScript writes sessionStorage. Every capture page
  // therefore loaded with spo2=null and the two cyanosis frames rendered
  // identically (mean delta 0.01/255 across the whole face panel).
  const effectiveVitals = useMemo<Partial<VitalSigns> | undefined>(() => {
    const base = vitals ?? caseData.vitalSignsProgression?.initial;
    if (import.meta.env.DEV) {
      const forced = readForcedSpo2();
      if (forced != null && Number.isFinite(forced)) {
        return { ...base, spo2: forced };
      }
    }
    return base;
  }, [vitals, caseData.vitalSignsProgression?.initial]);

  // The posture must be known before the overview camera is created. Upright
  // tripod and supine bodies occupy different world volumes; using the supine
  // target for a respiratory patient cropped the head out of the viewport.
  const patientPosture = useMemo<PatientPosture>(() => {
    return derivePatientPosture(caseData, {
      mobility: patientMobility,
      isInArrest,
      unconscious: patientUnconscious,
      positioningOverride: treatmentPositioning,
      respiration: effectiveVitals?.respiration ?? caseData.abcde?.breathing?.rate ?? null,
    });
  }, [isInArrest, treatmentPositioning, patientUnconscious, patientMobility, effectiveVitals, caseData]);

  const patientSupportSurface = useMemo(
    () => derivePatientSupportSurface(caseData, {
      stage: bayStage,
      mobility: patientMobility,
      loadedOnStretcher,
    }),
    [bayStage, caseData, loadedOnStretcher, patientMobility],
  );

  const patientSeatKind = useMemo<PatientSeatKind>(
    () => derivePatientSeatKind(caseData),
    [caseData],
  );

  const handGuardRegion = useMemo(
    () => deriveHandGuardRegion(caseData),
    [caseData],
  );

  const livePositionPresentation = useMemo(
    () => patientLivePositionPresentation(caseData, {
      stage: bayStage,
      mobility: patientMobility,
      posture: patientPosture,
      supportSurface: patientSupportSurface,
    }),
    [bayStage, caseData, patientMobility, patientPosture, patientSupportSurface],
  );
  const livePositionLabel = t(`patientPosition.${livePositionPresentation.key}`, {
    defaultValue: livePositionPresentation.fallback,
  });

  // useMemo keeps the pos/target array identities stable — OrbitControls'
  // `target` prop and several useCallback deps rely on that.
  const overviewCameraFocus = useMemo(
    () => {
      const focus = treatmentBayOverviewEnabled
        ? getTreatmentBayCameraFocus(bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift, bayVariant, plantOffset)
        : getUprightCameraFocus(patientScale);
      if (caseData.id === 'resp-001' && treatmentBayOverviewEnabled && (patientPosture === 'tripod' || patientPosture === 'seated')) {
        // Orbit around the patient root, not a point 60cm behind the chair.
        // The old target pushed the patient's head off-screen in side views.
        const depth = getTreatmentBayTransform(bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift, plantOffset).position[2];
        const shift = depth - focus.target[2];
        focus.target[2] = depth;
        focus.pos[2] += shift;
      }
      return focus;
    },
    [caseData.id, treatmentBayOverviewEnabled, bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift, bayVariant, plantOffset],
  );

  // OrbitControls target is imperative state. Initialise/reset it only for the
  // overview; region-click camera animations own it while a region is active.
  useEffect(() => {
    if (activeRegion || !controlsRef.current) return;
    controlsRef.current.target.set(...overviewCameraFocus.target);
    controlsRef.current.update();
  }, [activeRegion, overviewCameraFocus.target]);

  const nextGuidedStep = useMemo(
    () => (guidedMode ? getNextGuidedStep(assessedRegions) : null),
    [guidedMode, assessedRegions],
  );

  const realismProfile = useMemo(
    () => deriveCaseRealismProfile(caseData),
    [caseData],
  );
  const appliedRealismCues = useMemo(
    () => deriveAppliedTreatmentRealismCues(caseData, appliedTreatmentIds),
    [caseData, appliedTreatmentIds],
  );
  const visibleRealismCues = useMemo(
    () => [...appliedRealismCues, ...realismProfile.observableCues],
    [appliedRealismCues, realismProfile.observableCues],
  );

  // Respiratory rate that drives the breathing morph (chest rise). This is a
  // clinical signal, not decoration: prefer the LIVE vitals stream (updates as
  // the patient deteriorates/responds to treatment), falling back to the
  // case's authored initial rate for surfaces without a live feed.
  const breathRateRpm = useMemo(() => {
    const rr = typeof liveRespiration === 'number'
      ? liveRespiration
      : vitals?.respiration
      ?? caseData.abcde?.breathing?.rate
      ?? caseData.vitalSignsProgression?.initial?.respiration;
    return typeof rr === 'number' && rr > 0 ? rr : 0;
  }, [vitals?.respiration, caseData, liveRespiration]);

  // Depth factor for the chest-rise amplitude so SHALLOW breathing (opioid tox,
  // exhaustion, agonal) looks visibly shallow and DEEP/laboured breathing (DKA
  // Kussmaul, severe distress) looks visibly deep — not just faster/slower.
  const breathDepthFactor = useMemo(() => {
    return liveBreathingDepth(String(caseData.abcde?.breathing?.depth ?? ''), caseData.vitalSignsProgression?.initial, effectiveVitals);
  }, [caseData, effectiveVitals]);

  // Ambient breath loop (Phase C3): the audible room breath derives from the
  // same respiratory rate that drives the chest-rise morph and from the
  // case's auscultation findings — stridor/wheeze zones or "audible without
  // stethoscope" notes win; otherwise only genuinely respiratory cases get a
  // quiet vesicular rustle. Arrest/unconscious patients breathe nothing.
  const ambientBreath = useMemo<{ kind: AmbientBreathKind; rpm: number }>(() => {
    const rpm = isInArrest ? 0 : breathRateRpm;
    if (rpm <= 0 || patientUnconscious) return { kind: 'none', rpm: 0 };
    const zones: (string | undefined)[] = [
      patientSounds?.leftLung,
      patientSounds?.rightLung,
      patientSounds?.leftUpperLung,
      patientSounds?.leftLowerLung,
      patientSounds?.rightUpperLung,
      patientSounds?.rightLowerLung,
    ];
    const audible = (patientSounds?.additionalSounds ?? []).join(' ').toLowerCase();
    if (zones.includes('stridor') || /stridor/.test(audible)) return { kind: 'stridor', rpm };
    if (zones.includes('wheeze') || /wheez/.test(audible)) return { kind: 'wheeze', rpm };
    const context = `${caseData.category ?? ''} ${caseData.title ?? ''} ${caseData.dispatchInfo?.callReason ?? ''}`.toLowerCase();
    const respiratory =
      rpm >= 22 || /asthma|copd|respiratory|breath|dyspn|pneumonia|bronch|wheez/.test(context);
    return { kind: respiratory ? 'clear' : 'none', rpm };
  }, [patientSounds, breathRateRpm, isInArrest, patientUnconscious, caseData]);

  const ambientPatientPosition = useMemo(() => caseData.id === 'resp-001'
    ? treatmentBayClinicalToWorld([0, 1.31, 0], bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift)
    : undefined, [caseData.id, bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift]);

  // Condition-responsive idle motion cues (wince/shiver/gasp/tremor/seizure/
  // agitation/chest-clutch) — pure derivation, consumed by IdleAnimations
  // inside BodyMesh.
  const idleCues = useMemo(
    () => deriveIdleCues(caseData, vitals, patientVisualState),
    [caseData, vitals, patientVisualState],
  );

  // Case text used for the text-driven unwellness states (diaphoresis
  // appearance, jaundice). Recomputed only when the case changes.
  const unwellnessCaseText = useMemo(
    () => collectUnwellnessText(caseData),
    [caseData],
  );

  // OMS-style visible unwellness states (diaphoresis / jaundice / mottling)
  // derived purely from live vitals + case text (see lib/unwellnessStates.ts).
  // The mottling channel is latched with hysteresis, so we feed the previously
  // committed state back in via a ref (updated in the effect below). The ref
  // read is intentionally not a dependency — hysteresis compares against the
  // LAST committed state, which is exactly what the effect stores.
  const prevUnwellnessRef = useRef<UnwellnessState>({ diaphoresis: 0, jaundice: 0, mottling: 0 });
  const unwellness = useMemo<UnwellnessState>(() => {
    const source = effectiveVitals;
    const derived = deriveUnwellness({
      vitals: source,
      caseText: unwellnessCaseText,
      previous: prevUnwellnessRef.current,
    });
    // Dev/capture-only override (snapshot taken at module load — see
    // CAPTURE_FORCED_UNWELL). Forces a single state on so the capture harness can
    // screenshot each one deterministically. Never active in a production build.
    if (import.meta.env.DEV && CAPTURE_FORCED_UNWELL) {
      if (CAPTURE_FORCED_UNWELL === 'diaphoresis') return { ...derived, diaphoresis: 1 };
      if (CAPTURE_FORCED_UNWELL === 'jaundice') return { ...derived, jaundice: 1 };
      if (CAPTURE_FORCED_UNWELL === 'mottling') return { ...derived, mottling: 1 };
    }
    return derived;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveVitals, unwellnessCaseText]);
  useEffect(() => {
    prevUnwellnessRef.current = unwellness;
  }, [unwellness]);

  const scenarioPallor = skinEffectStrength(patientVisualState, 'pallor');
  const scenarioCyanosis = skinEffectStrength(patientVisualState, 'cyanosis');
  const scenarioDiaphoresis = skinEffectStrength(patientVisualState, 'diaphoresis');
  const scenarioMottling = skinEffectStrength(patientVisualState, 'mottling');

  // Live skin colour tint. Composed in a fixed order so the channels layer
  // coherently on top of one another:
  //
  //   base skin (texture, no tint = white multiplier)
  //     → jaundice   (yellow-ochre cast — a days-scale hepatic finding)
  //       → pallor   (shock desaturates toward grey-ochre)
  //         → cyanosis (hypoxaemia blues the skin — the most acute sign, so
  //                     it sits on top and dominates when present)
  //
  // Rationale: jaundice is the slowest-changing / most "baked into the skin"
  // colour, so it goes closest to the base; acute perfusion changes (pallor
  // then cyanosis) layer over it. Diaphoresis (sheen) and mottling (texture
  // overlay) are ORTHOGONAL channels — they are not colours and take no part
  // in this lerp chain (handled by material roughness + a texture swap
  // respectively). Returns a target THREE.Color the mesh lerps toward per
  // frame, or null when nothing applies (mesh keeps its authored skin colour).
  // Falls back to the case's initial vitals when no live `vitals` prop is
  // supplied, so non-StudentPanel surfaces keep the case-presentation tone.
  const skinTint = useMemo<THREE.Color | null>(() => {
    return deriveSkinTint({
      vitals: effectiveVitals,
      initialVitals: caseData.vitalSignsProgression?.initial,
      jaundice: unwellness.jaundice,
      scenarioPallor,
    });
  }, [effectiveVitals, caseData.vitalSignsProgression?.initial, unwellness.jaundice, scenarioPallor]);

  const cyanosisLocalStrength = useMemo<number>(() => {
    return deriveCyanosisLocalStrength(
      effectiveVitals,
      caseData.vitalSignsProgression?.initial,
      scenarioCyanosis,
    );
  }, [effectiveVitals, caseData.vitalSignsProgression?.initial, scenarioCyanosis]);

  // Which finding morphs are REVEALED — a finding's morph activates only
  // once the student has assessed its region. This is the discovery
  // mechanic expressed on the mesh: no JVD bulge until you examine the neck.
  // Case injuries drive the finding morphs AND the wound skin decals.
  const caseInjuries = useMemo(() => inferInjuries(caseData), [caseData]);
  // The realism director is recalculated as live vitals ease toward a
  // treatment response, so `patientVisualState` gets a fresh object even when
  // its authored wounds have not changed. Rebuilding the SkeletonUtils clone
  // for every one of those ticks briefly mounts the garment layer at its
  // default hidden state; in the browser that reads as clothes flickering off
  // (and can expose the whole patient between frames). Key the expensive
  // injury/mesh path to wound content only. Skin, breathing and equipment
  // channels continue updating live through their own props and effects.
  const scenarioWoundSignature = (patientVisualState?.woundOverlays ?? [])
    .map(overlay => `${overlay.kind}\u001f${overlay.region}\u001f${overlay.detail}`)
    .join('\u001e');
  const scenarioBodyInjuries = useMemo(
    () => buildScenarioBodyInjuries(patientVisualState),
    // The signature fully represents the only visual-state channel consumed
    // by buildScenarioBodyInjuries. Depending on the parent object would
    // reintroduce a clone on every vital-sign animation tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioWoundSignature],
  );
  const bodyInjuriesForMesh = useMemo(
    () => [...caseInjuries, ...scenarioBodyInjuries],
    [caseInjuries, scenarioBodyInjuries],
  );

  const activeFindingMorphs = useMemo(() => {
    const injuries = bodyInjuriesForMesh;
    // Map a detected finding to the morph that depicts it.
    const MORPH_FOR_KIND: Record<string, string> = {
      distension: 'finding_abdo_distension', // abdominal distension
    };
    const out = new Set<string>();
    for (const inj of injuries) {
      const region3d = injuryRegionTo3D(inj.region);
      const revealed = assessedRegions.has(region3d)
        || (isLimbRegion(region3d) && assessedRegions.has('extremities'));
      if (!revealed) continue;
      // JVD: neck distension finding → finding_jvd morph
      if (inj.region === 'neck' && inj.kind === 'distension') { out.add('finding_jvd'); continue; }
      const morph = MORPH_FOR_KIND[inj.kind];
      if (morph) out.add(morph);
    }
    // Facial droop comes from the scenario layer rather than the injury list.
    // Its showWhen gating is already applied upstream (activeVisualEffects),
    // so its presence here means it is meant to be visible now.
    if ((patientVisualState?.facialDroop ?? 0) > 0) out.add('finding_facial_droop');
    if ((patientVisualState?.facialSwelling ?? 0) > 0) out.add('finding_facial_swelling');
    return Array.from(out);
  }, [
    bodyInjuriesForMesh,
    assessedRegions,
    patientVisualState?.facialDroop,
    patientVisualState?.facialSwelling,
  ]);

  const guidedStepIndex = useMemo(() => {
    if (!nextGuidedStep) return -1;
    return EXAM_SEQUENCE.indexOf(nextGuidedStep);
  }, [nextGuidedStep]);
  const caseSubcategory = caseData.subcategory;

  const handleToggleGuidedMode = useCallback(() => {
    setGuidedMode(prev => {
      const next = !prev;
      saveGuidedModePreference(next);
      return next;
    });
  }, []);

  const handleBlockedClick = useCallback((attempted: string, expected: string) => {
    setBlockedNudge({ attempted, expected });
    if (nudgeTimerRef.current !== null) {
      window.clearTimeout(nudgeTimerRef.current);
    }
    nudgeTimerRef.current = window.setTimeout(() => {
      setBlockedNudge(null);
      nudgeTimerRef.current = null;
    }, 2600);
  }, []);

  const clearPatientReaction = useCallback(() => {
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
    setPatientReaction(null);
  }, []);

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current !== null) {
        window.clearTimeout(nudgeTimerRef.current);
      }
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, []);

  const { animateCamera, cancelCameraAnimation } = useCameraAnimation();

  // Phase 2B: Determine required regions from assessment profile
  const requiredRegions = useMemo<Set<string>>(() => {
    if (!caseCategory) return new Set<string>();
    const profile = getAssessmentProfile(caseCategory as CaseCategory, caseSubcategory);
    const regions = new Set<string>();
    for (const step of profile.requiredSecondary) {
      // 'extremities' requirement maps to all 4 individual limbs
      if (step === 'extremities') {
        regions.add('right-arm');
        regions.add('left-arm');
        regions.add('right-leg');
        regions.add('left-leg');
      } else {
        regions.add(step);
      }
    }
    return regions;
  }, [caseCategory, caseSubcategory]);

  // Phase 2B: Count required regions that have been assessed
  const regionIds = ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'right-arm', 'left-arm', 'right-leg', 'left-leg', 'posterior-logroll'];
  const isRegionAssessed = (id: string): boolean =>
    assessedRegions.has(id) || (isLimbRegion(id) && assessedRegions.has('extremities'));
  const assessedCount = regionIds.filter(id => isRegionAssessed(id)).length;

  const requiredTotal = requiredRegions.size;
  const requiredDone = regionIds.filter(id => requiredRegions.has(id) && isRegionAssessed(id)).length;

  // Phase 2E: Consolidated close handler
  const handleCloseRegion = useCallback(() => {
    cancelPilotListening();
    setActiveRegion(null);
    setShowLimbDropdown(false);
    setRegionExposed(false);
    setSelectedAction(null);
    clearPatientReaction();
    setPlayingSound(null);
    setSoundProgress(0);
    if (soundTimerRef.current !== null) {
      cancelAnimationFrame(soundTimerRef.current);
      soundTimerRef.current = null;
    }
    stopAllSounds();
    // Animate camera back to the mode's overview (bay overview included —
    // otherwise closing a region leaves the student stranded at the zoom).
    if (controlsRef.current) {
      animateCamera(
        controlsRef.current,
        overviewCameraFocus.pos,
        overviewCameraFocus.target,
        400,
      );
    }
  }, [animateCamera, clearPatientReaction, overviewCameraFocus.pos, overviewCameraFocus.target, cancelPilotListening]);

  const wasConversing = useRef(false);
  useEffect(() => {
    if (bedsideConversation.active && (!faceAttachment || !controlsRef.current)) return;
    if (bedsideConversation.active && !wasConversing.current) {
      handleCloseRegion();
      // Conversation is a chest-up bedside view, not a scored face exam.
      // Use the live head frame so a leaning patient stays inside the shot.
      if (faceAttachment && controlsRef.current) {
        faceAttachment.updateWorldMatrix(true, false);
        const target = new THREE.Vector3(0, 1.43, 0.06).applyMatrix4(faceAttachment.matrixWorld);
        const direction = new THREE.Vector3(0.04, 0.08, 1).transformDirection(faceAttachment.matrixWorld);
        const pos = target.clone().addScaledVector(direction, 2.05);
        animateCamera(controlsRef.current, pos.toArray(), target.toArray(), 500);
      }
    } else if (!bedsideConversation.active && wasConversing.current) {
      handleCloseRegion();
    }
    wasConversing.current = bedsideConversation.active;
  }, [bedsideConversation.active, handleCloseRegion, faceAttachment, animateCamera]);

  // Esc deselects the focused region — alongside the in-frame "Full body"
  // pill and click-on-empty-space (onPointerMissed on the Canvas).
  useEffect(() => {
    if (!activeRegion) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseRegion(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeRegion, handleCloseRegion]);

  const handleRegionClick = useCallback((stepId: string) => {
    cancelPilotListening();
    setActiveRegion(stepId);
    setRegionExposed(false);
    // Individual limb regions are directly the active limb
    setActiveLimb(isLimbRegion(stepId) ? stepId as LimbSide : null);
    setSelectedAction(null);
    clearPatientReaction();

    // Focusing a clothed region is not itself a patient interaction. Keep the
    // exposure reminder for the clinical coach, but do not make the patient
    // talk just because the learner changes view. Patient dialogue belongs to
    // a deliberate clinical action (for example the single consent cue that
    // starts auscultation), never to the subsequent site-to-site movement.
    // Once per region per case (component is keyed per case → ref resets).
    if (anatomyLayer === 'dressed' && (CLOTHING_PARTING[stepId]?.length ?? 0) > 0
      && consentedRegionsRef.current.size === 0) {
      consentedRegionsRef.current.add(stepId);
      if (patientVoice.communication.isAwake) {
        setPatientReaction({
          id: `${stepId}-consent`,
          tone: 'coach',
          title: 'Exposure with consent',
          message: 'Always tell the patient before exposing them — “I need to look at your chest, is that alright?” — and keep exposure to the minimum needed.',
          regionId: stepId,
          actionId: 'expose-consent',
        });
      }
    }
    // Initialize expanded groups for limb regions
    const groups = getLimbActionGroups(stepId);
    if (groups) {
      const initial = new Set<string>();
      groups.forEach(g => { if (g.defaultExpanded) initial.add(g.id); });
      setExpandedGroups(initial);
    }
    // Also mark 'extremities' as assessed when any limb is assessed (for backward compatibility)
    onRegionClick(stepId as AssessmentStepId);

    // Zoom camera to a clinically useful close-up. Region presets are more
    // reliable than "current orbit direction" because the student may have
    // rotated to a posterior view before selecting an anterior structure.
    if (controlsRef.current && treatmentBayOverviewEnabled) {
      // Supine presentation: convert the upright clinical focus through the
      // stretcher transform and hover the camera above the region, biased to
      // the patient's side/feet so it never dives under the bed. Without this
      // the bay had NO camera assist — students had to hand-orbit to reach
      // the chest, which is the #1 "access to the patient is limited" report.
      const focus = REGION_CAMERA_FOCUS[stepId] ?? REGION_CAMERA_FOCUS.chest;
      let target = treatmentBayClinicalToWorld([
        focus.target[0],
        focus.target[1],
        stepId === 'posterior-logroll' ? -0.08 : 0.10,
      ], bayStage, patientPosture, patientMobility, patientScale, seatedSupportLift);
      let clinicalDirection: [number, number, number] = patientPosture === 'tripod' || patientPosture === 'seated' || patientMobility === 'standing' || patientMobility === 'pacing'
        ? (stepId === 'face' || stepId === 'head' || stepId === 'neck-cspine'
            ? [0.04, 0.48, 1]
            : [0.10, 0.10, 1])
        : stepId === 'face' || stepId === 'head' || stepId === 'neck-cspine'
          ? [0, 1, 0.02]
          : stepId === 'chest' || stepId === 'abdomen'
            ? [0.14, 1, 0.18]
            : [0.38, 0.95, 0.52];
      if (faceAttachment && (stepId === 'face' || stepId === 'head')) {
        // Face the actual tilted head, not the static upright mannequin. The
        // old above-patient preset mostly showed scalp in a tripod close-up.
        faceAttachment.updateWorldMatrix(true, false);
        target = new THREE.Vector3(0, 1.61, 0.06)
          .applyMatrix4(faceAttachment.matrixWorld).toArray() as [number, number, number];
        clinicalDirection = new THREE.Vector3(0.04, 0.08, 1)
          .transformDirection(faceAttachment.matrixWorld).toArray() as [number, number, number];
      }
      const pos = fitCameraPos(
        controlsRef.current,
        target,
        clinicalDirection,
        (REGION_RADIUS[stepId] ?? 0.28) * Math.max(0.5, patientScale),
      );
      if (import.meta.env.DEV) {
        (window as Window & { __lastRegionCamera?: unknown }).__lastRegionCamera = {
          stepId, patientPosture, bayStage, target, pos, clinicalDirection,
        };
      }
      animateCamera(controlsRef.current, pos, target, 460);
    } else if (controlsRef.current) {
      const focus = REGION_CAMERA_FOCUS[stepId] ?? REGION_CAMERA_FOCUS.chest;
      const cameraScale = Math.max(0.5, Math.min(1, patientScale));
      const dir: [number, number, number] = [
        (focus.pos[0] - focus.target[0]) * cameraScale,
        (focus.pos[1] - focus.target[1]) * cameraScale,
        (focus.pos[2] - focus.target[2]) * cameraScale,
      ];
      // HUD-aware framing. Chest/abdomen show the zoom loupe (top-right) and the
      // assessment cockpit (bottom-left). Bias the patient LEFT of the loupe (x),
      // and for the marker-dense chest also lift it ABOVE the cockpit (y), so no
      // exam landmark ever hides under a panel.
      const wide = typeof window !== 'undefined' && window.innerWidth >= 640;
      // Lift each region's framing above the bottom-left cockpit (values tuned per
      // region zoom — tighter regions need a smaller world-space lift) and shift
      // the loupe regions left of the top-right zoom panel.
      const Y_LIFT: Record<string, number> = { chest: -0.09, abdomen: -0.06, face: -0.19, 'neck-cspine': -0.13 };
      const X_BIAS: Record<string, number> = { chest: 0.13, abdomen: 0.13 };
      const xBias = wide ? (X_BIAS[stepId] ?? 0) : 0;
      const yBias = wide ? (Y_LIFT[stepId] ?? 0) : 0;
      const target: [number, number, number] = [
        (focus.target[0] + xBias) * patientScale,
        (focus.target[1] + yBias) * patientScale,
        focus.target[2] * patientScale,
      ];
      const pos = fitCameraPos(controlsRef.current, target, dir, (REGION_RADIUS[stepId] ?? 0.28) * cameraScale);
      animateCamera(controlsRef.current, pos, target, 460);
    }
  }, [onRegionClick, animateCamera, clearPatientReaction, anatomyLayer, bayStage, patientVoice, patientPosture, patientMobility, treatmentBayOverviewEnabled, patientScale, faceAttachment, seatedSupportLift, cancelPilotListening]);

  // Phase 2F: Sound progress animation
  const startSoundProgress = useCallback((actionId: string, durationMs: number, from = 0, to = 1, finishOnElapsed = true) => {
    // Cancel previous
    if (soundTimerRef.current !== null) {
      cancelAnimationFrame(soundTimerRef.current);
    }
    setPlayingSound(actionId);
    setSoundProgress(from);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(Math.max(0, elapsed / durationMs), 1);
      const displayed = !finishOnElapsed && to === 1 ? Math.min(progress, .999) : progress;
      setSoundProgress(from + (to - from) * displayed);
      if (progress < 1) {
        soundTimerRef.current = requestAnimationFrame(tick);
      } else {
        soundTimerRef.current = null;
        if (to === 1 && finishOnElapsed) setPlayingSound(null);
      }
    };
    soundTimerRef.current = requestAnimationFrame(tick);
  }, []);

  const handleExamAction = useCallback((actionId: string) => {
    if (!activeRegion) return;
    cancelPilotListening();
    setPilotListeningStep(0);
    setSelectedAction(actionId);
    setContactAction(actionId);

    if (controlsRef.current) {
      const focus: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
        'pupils-size': { pos: [0, 1.63, 1.22], target: [0, 1.63, 0.08] },
        'pupils-reactivity': { pos: [0, 1.63, 1.18], target: [0, 1.63, 0.08] },
        'pupils-equality': { pos: [0, 1.63, 1.2], target: [0, 1.63, 0.08] },
        'eyes-inspect': { pos: [0, 1.61, 1.34], target: [0, 1.61, 0.06] },
        'nose-inspect': { pos: [0, 1.59, 1.22], target: [0, 1.59, 0.08] },
        'nose-palpate': { pos: [0, 1.59, 1.22], target: [0, 1.59, 0.08] },
        'lips-inspect': { pos: [0, 1.56, 1.24], target: [0, 1.56, 0.08] },
        'mouth-mucosa': { pos: [0, 1.56, 1.22], target: [0, 1.55, 0.08] },
        'tongue-inspect': { pos: [0, 1.56, 1.22], target: [0, 1.55, 0.08] },
        'airway-listen': { pos: [0, 1.46, 1.38], target: [0, 1.45, 0.05] },
        'mouth-inspect': { pos: [0, 1.56, 1.28], target: [0, 1.54, 0.08] },
        'trachea-palpate': { pos: [0, 1.42, 1.44], target: [0, 1.42, 0.04] },
        'jvd-inspect': { pos: [0.08, 1.47, 1.38], target: [0.06, 1.47, 0.06] },
        'cspine-inspect': { pos: [0, 1.47, 1.54], target: [0, 1.47, 0.02] },
        'cspine-palpate': { pos: [0, 1.47, 1.50], target: [0, 1.47, 0.02] },
        'neck-emphysema': { pos: [0, 1.43, 1.42], target: [0, 1.43, 0.04] },
        // Chest exam — zoom in tight on the chest like the eyes/airway do, so
        // the student is looking right at the chest wall while they work.
        'chest-inspect': { pos: [0, 1.27, 1.42], target: [0, 1.27, 0.1] },
        'chest-palpate': { pos: [0, 1.25, 1.34], target: [0, 1.25, 0.1] },
        'chest-percuss': { pos: [0, 1.27, 1.36], target: [0, 1.27, 0.1] },
        'chest-auscultate-lungs': { pos: [0, 1.30, 1.38], target: [0, 1.28, 0.1] },
        'chest-auscultate-ru': { pos: [-0.09, 1.34, 1.20], target: [-0.09, 1.34, 0.1] },
        'chest-auscultate-rl': { pos: [-0.10, 1.22, 1.20], target: [-0.10, 1.22, 0.1] },
        'chest-auscultate-lu': { pos: [0.09, 1.34, 1.20], target: [0.09, 1.34, 0.1] },
        'chest-auscultate-ll': { pos: [0.10, 1.22, 1.20], target: [0.10, 1.22, 0.1] },
        'chest-auscultate-heart': { pos: [0.06, 1.22, 1.28], target: [0.05, 1.21, 0.1] },
        'abd-inspect': { pos: [0, 1.03, 1.28], target: [0, 1.03, 0.10] },
      };
      const abdomenQuadrant = getQuadrantFromAction(actionId);
      const quadrantX: Record<AbdomenQuadrant, number> = { ruq: -0.10, luq: 0.10, rlq: -0.10, llq: 0.10 };
      const quadrantY: Record<AbdomenQuadrant, number> = { ruq: 1.08, luq: 1.08, rlq: 0.98, llq: 0.98 };
      const exactFocus = abdomenQuadrant
        ? { pos: [quadrantX[abdomenQuadrant], quadrantY[abdomenQuadrant], 1.26] as [number, number, number], target: [quadrantX[abdomenQuadrant], quadrantY[abdomenQuadrant], 0.10] as [number, number, number] }
        : focus[actionId];
      if (exactFocus) {
        const sampled = surfaceSampler
          ? surfaceSampler(exactFocus.target[0], exactFocus.target[1])
          : null;
        const actionRadius =
          /pupil|eyes/.test(actionId) ? 0.045 :
          /nose|lips|mouth|tongue/.test(actionId) ? 0.065 :
          /chest/.test(actionId) ? 0.18 :
          (abdomenQuadrant || /abd/.test(actionId)) ? 0.14 :
          0.10;
        if (treatmentBayOverviewEnabled) {
          // Keep camera assist in the treatment bay so a revealed finding stays
          // framed on the patient — convert upright clinical focus through the
          // stretcher / posture transform used by region zooms.
          let target = resolveTreatmentBayActionTarget(
            sampled,
            exactFocus.target,
            point => treatmentBayClinicalToWorld(
              point,
              bayStage,
              patientPosture,
              patientMobility,
              patientScale,
              seatedSupportLift,
            ),
          );
          let clinicalDirection: [number, number, number] =
            patientPosture === 'tripod' || patientPosture === 'seated' || patientMobility === 'standing' || patientMobility === 'pacing'
              ? (/pupil|eyes|lips|mouth|nose|face/.test(actionId)
                  ? [0.04, 0.48, 1]
                  : [0.10, 0.12, 1])
              : (/pupil|eyes|lips|mouth|nose/.test(actionId)
                  ? [0, 1, 0.02]
                  : /chest|abd/.test(actionId)
                    ? [0.14, 1, 0.18]
                    : [0.2, 0.95, 0.45]);
          if (caseData.id === 'resp-001' && faceAttachment && /pupil|eyes/.test(actionId)) {
            let root: THREE.Object3D = faceAttachment;
            while (root.parent) root = root.parent;
            const left = root.getObjectByName('eyeL');
            const right = root.getObjectByName('eyeR');
            if (left && right) {
              target = left.getWorldPosition(new THREE.Vector3()).add(right.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5).toArray();
              faceAttachment.updateWorldMatrix(true, false);
              clinicalDirection = new THREE.Vector3(0, .025, 1).transformDirection(faceAttachment.matrixWorld).toArray();
            }
          }
          const pos = fitCameraPos(
            controlsRef.current,
            target,
            clinicalDirection,
            treatmentBayActionFramingRadius(actionRadius, patientScale),
          );
          animateCamera(controlsRef.current, pos, target, 500);
        } else {
          const projected = sampled
            ? { pos: exactFocus.pos, target: sampled }
            : exactFocus;
          const dir: [number, number, number] = [
            exactFocus.pos[0] - exactFocus.target[0],
            exactFocus.pos[1] - exactFocus.target[1],
            exactFocus.pos[2] - exactFocus.target[2],
          ];
          const pos = fitCameraPos(controlsRef.current, projected.target, dir, actionRadius);
          animateCamera(controlsRef.current, pos, projected.target, 500);
        }
      }
    }

    const finding = getFinding(caseData, actionId, isInArrest, effectiveVitals);
    const reaction = getPatientReaction(caseData, activeRegion, actionId, finding, revealedFindings, {
      vitals: effectiveVitals, isInArrest, appliedTreatmentIds,
    });
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
    setPatientReaction(reaction);
    if (reaction) {
      // Every quote is the PATIENT speaking ("Please stop, that really
      // hurts") — make it audible, not just a caption.
      if (reaction.quote) patientVoice.say(reaction.quote);
      reactionTimerRef.current = window.setTimeout(() => {
        setPatientReaction(null);
        reactionTimerRef.current = null;
      }, 6200);
    }
    setRevealedFindings(prev => {
      const next = new Map(prev);
      next.set(actionId, finding);
      return next;
    });

    // Play sounds for auscultation actions
    if (actionId.includes('auscultate')) {
      stopAllSounds();
      const pilotSteps = caseData.id === 'resp-001' ? getPilotAuscultationSteps(actionId, RESP001_EXAM_LANDMARKS, breathRateRpm) : [];
      if (pilotSteps.length && patientSounds) {
        pilotListeningCancel.current = startAuscultationSequence(pilotSteps, (step, index) => {
          setPilotListeningStep(index);
          // A delayed/backgrounded step cannot let the overall bar finish
          // ahead of the actual listening tour. Each step owns its segment.
          startSoundProgress(actionId, step.durationMs, index / pilotSteps.length, (index + 1) / pilotSteps.length, false);
          if (step.sound === 'heart') playHeartSound(patientSounds.heartSound, step.durationMs);
          else playBreathSound(step.sound === 'right' ? patientSounds.rightLung : step.sound === 'left' ? patientSounds.leftLung
            : getZoneBreathSound(patientSounds, step.sound), step.durationMs);
        }, () => {
          pilotListeningCancel.current = null;
          stopAllSounds();
          if (soundTimerRef.current !== null) cancelAnimationFrame(soundTimerRef.current);
          soundTimerRef.current = null;
          setSoundProgress(1);
          setPlayingSound(null);
        });
      } else if (actionId === 'chest-auscultate-lungs' && patientSounds) {
        // Play left lung (3s), then right lung (3s) — bilateral auscultation
        playBreathSound(patientSounds.leftLung, 3000);
        setTimeout(() => {
          playBreathSound(patientSounds.rightLung, 3000);
        }, 3200);
        startSoundProgress(actionId, 6200);
      } else if (actionId === 'chest-auscultate-ru' && patientSounds) {
        // Right apex — upper zone may differ from the base (e.g. a clear apex
        // over a consolidated/oedematous lower zone).
        playBreathSound(getZoneBreathSound(patientSounds, 'right-upper'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-rl' && patientSounds) {
        // Right base.
        playBreathSound(getZoneBreathSound(patientSounds, 'right-lower'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-lu' && patientSounds) {
        // Left apex.
        playBreathSound(getZoneBreathSound(patientSounds, 'left-upper'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-ll' && patientSounds) {
        // Left base.
        playBreathSound(getZoneBreathSound(patientSounds, 'left-lower'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-heart' && patientSounds) {
        // Heart sounds — realistic listening duration
        playHeartSound(patientSounds.heartSound, 8000);
        startSoundProgress(actionId, 8000);
      } else if (activeRegion === 'abdomen' && (actionId === 'abd-auscultate' || getQuadrantFromAction(actionId))) {
        // Bowel sounds are ongoing. Real practice may require much longer
        // listening for absent sounds, but this gives students a usable cue.
        const bowelType: BowelSoundType = patientSounds?.bowelSounds ?? getBowelSoundTypeForCase(caseData);
        const duration = bowelType === 'absent' ? 15000 : 12000;
        playBowelSound(bowelType, duration);
        startSoundProgress(actionId, duration);
      }
    }
    // Airway sounds — separate from chest auscultation (stridor/gurgling/snoring, not lung sounds)
    if (actionId === 'airway-listen' && patientSounds) {
      stopAllSounds();
      const airwayFindings = caseData.abcde?.airway?.findings || [];
      const airwayText = airwayFindings.join(' ').toLowerCase();
      // Determine airway sound: stridor > gurgling > snoring > clear
      const airwaySoundType: BreathSoundType = airwayText.includes('stridor') ? 'stridor'
        : airwayText.includes('gurgl') ? 'rhonchi'
        : airwayText.includes('snor') ? 'snoring'
        : 'clear';
      playBreathSound(airwaySoundType, 3000);
      startSoundProgress(actionId, 3000);
    }

    // Play percussion sound
    if (actionId.includes('percuss')) {
      stopAllSounds();
      const percFinding = getFinding(caseData, actionId);
      const percType = percFinding.toLowerCase().includes('hyper') ? 'hyper-resonant'
        : percFinding.toLowerCase().includes('dull') ? 'dull'
        : percFinding.toLowerCase().includes('tympanic') ? 'tympanic'
        : 'resonant';
      playPercussionSound(percType);
      startSoundProgress(actionId, PERCUSSION_DURATION);
    }
  }, [activeRegion, animateCamera, appliedTreatmentIds, bayStage, caseData, effectiveVitals, patientMobility, patientPosture, patientScale, patientSounds, patientVoice, revealedFindings, startSoundProgress, isInArrest, surfaceSampler, treatmentBayOverviewEnabled, faceAttachment, seatedSupportLift, cancelPilotListening, breathRateRpm]);
  const handleExamActionRef = useRef(handleExamAction);
  handleExamActionRef.current = handleExamAction;

  const handleObserveCue = useCallback((cue: 'look' | 'listen' | 'feel') => {
    // Novice-facing Observe strip: jump straight into the high-yield technique
    // without hunting through region → technique → target.
    const plan: Record<'look' | 'listen' | 'feel', { region: string; action: string }> = {
      look: { region: 'chest', action: 'chest-inspect' },
      listen: { region: 'chest', action: 'chest-auscultate-lungs' },
      feel: { region: 'chest', action: 'chest-palpate' },
    };
    const next = plan[cue];
    if (activeRegion === next.region) {
      handleExamActionRef.current(next.action);
      return;
    }
    pendingObserveActionRef.current = next.action;
    handleRegionClick(next.region);
  }, [activeRegion, handleRegionClick]);

  // After an Observe cue opens a region, fire the queued technique once the
  // side rail + action list are mounted for that region.
  useEffect(() => {
    if (!activeRegion) return;
    const queued = pendingObserveActionRef.current;
    if (!queued) return;
    pendingObserveActionRef.current = null;
    const timer = window.setTimeout(() => {
      handleExamActionRef.current(queued);
    }, 30);
    return () => window.clearTimeout(timer);
  }, [activeRegion]);


  // Click the ANATOMY, not just the dots: inside an active region, a click on
  // the body fires the nearest detail exam action at that spot — click the
  // eye and you get the pupil check, the neck spot gives the carotid, the
  // foot gives foot palpation. Overview clicks (no active region, or a click
  // on a different region) return false and fall through to BodyMesh's normal
  // region selection.
  const handleBodyPoint = useCallback((point: THREE.Vector3, regionId: string): boolean => {
    if (!activeRegion || regionId !== activeRegion) return false;
    // Legs have no authored detail landmarks; the bottom of the leg IS the
    // foot — route it to the existing foot exam action.
    if ((activeRegion === 'right-leg' || activeRegion === 'left-leg')
      && classifyBodyPoint(point.x, point.y, point.z).foot) {
      handleExamAction(`${activeRegion === 'right-leg' ? 'r' : 'l'}-foot-palpate`);
      return true;
    }
    if (activeRegion === 'face') {
      const pupilAction = nearestPupilExamAction(point);
      if (pupilAction) {
        handleExamAction(pupilAction);
        return true;
      }
    }
    let best: { actionId: string; d2: number } | null = null;
    for (const lm of EXAM_LANDMARKS) {
      if (lm.region !== activeRegion || lm.level !== 'detail' || !lm.actionId) continue;
      const dx = lm.position[0] - point.x;
      const dy = lm.position[1] - point.y;
      const dz = lm.position[2] - point.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (!best || d2 < best.d2) best = { actionId: lm.actionId, d2 };
    }
    // ~9cm grab radius — generous enough for eyes/carotid, tight enough that
    // adjacent chest zones stay distinct.
    if (best && best.d2 <= 0.09 * 0.09) {
      if (best.actionId.startsWith('pulse-') && onPulse) onPulse(best.actionId);
      else handleExamAction(best.actionId);
      return true;
    }
    return false;
  }, [activeRegion, handleExamAction, onPulse]);

  const allSubRegions = activeRegion ? getSubRegions(activeRegion) : [];
  const subRegions = allSubRegions;
  const limbGroups = activeRegion ? getLimbActionGroups(activeRegion) : null;

  // Collect all actions for findings lookup (from groups or subRegions)
  const allActions = useMemo(() => {
    if (limbGroups) {
      return limbGroups.flatMap(g => g.actions);
    }
    return subRegions.flatMap(sr => sr.actions);
  }, [limbGroups, subRegions]);
  const pupilProfile = useMemo(
    () => applyVisualEyeEffect(getPupilProfile(caseData), patientVisualState),
    [caseData, patientVisualState],
  );
  const showEyeContext = activeRegion === 'face'
    && !!selectedAction
    && (selectedAction.includes('pupil') || selectedAction.includes('eyes'));
  useEffect(() => { if (!showEyeContext) setPupilLightSide(null); }, [showEyeContext]);
  const showRegionalLoupe = showEyeContext || activeRegion === 'chest' || activeRegion === 'abdomen';
  // Narrow enough that the right-side exam landmarks (LUQ/LLQ, left lung
  // zones) clear the panel once the camera's loupe bias shifts the patient
  // left — the loupe must never sit on top of clickable anatomy.
  const loupeWidthClass = 'w-[min(14rem,calc(100%-1.5rem))]';

  // Phase 2D: Log roll hint
  const showLogRollHint = assessedRegions.size >= 8 && !assessedRegions.has('posterior-logroll');

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Render an action button (shared between grouped and flat rendering)
  const renderActionButton = (action: ExamAction) => {
    const Icon = TECHNIQUE_ICONS[action.technique];
    const isRevealed = revealedFindings.has(action.id);
    const isSelected = selectedAction === action.id;
    const isPlaying = playingSound === action.id;

    return (
      <div key={action.id} className="relative">
        <button
          onClick={() => handleExamAction(action.id)}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-lg text-[11px] leading-tight transition-all border ${
            isSelected ? 'ring-1 ring-blue-400 shadow-sm border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
            : isRevealed ? 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
            : 'border-border/40 dark:border-slate-700 hover:border-blue-300 hover:bg-accent/30 text-foreground dark:text-slate-200'
          }`}
        >
          <Icon className="h-3 w-3 shrink-0" />
          <span className="flex-1 font-medium truncate">{action.label}</span>
          {isRevealed && <span className="text-green-500 font-bold text-xs shrink-0">{'\u2713'}</span>}
        </button>
        {/* Phase 2F: Sound progress bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-none rounded-full"
              style={{ width: `${soundProgress * 100}%` }}
            />
          </div>
        )}
        {/* Inline finding — mobile-only, appears immediately below the clicked technique
            so students don't have to scroll to the bottom of the techniques list. */}
        {isSelected && isRevealed && (
          <div className="sm:hidden mt-1 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 animate-fade-in">
            <p className="text-[10px] font-bold text-green-800 dark:text-green-200 mb-0.5">{action.label}</p>
            <p className="text-[11px] text-green-700 dark:text-green-300 leading-relaxed">{revealedFindings.get(action.id)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={patientFrameRef} data-bedside-conversation={bedsideConversation.active || undefined} className="glass-panel relative rounded-2xl overflow-hidden border border-white/45 dark:border-white/[0.06] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      {/* Teal accent hairline — "hands on patient" phase */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      {/* Header */}
      <div className="patient-exam-header flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 border-b border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 ring-1 ring-teal-500/15">
            <User className="h-3.5 w-3.5 text-teal-500/80" />
          </div>
          <div>
            <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Phase&nbsp;3</p>
            <h2 className="text-sm font-semibold tracking-tight leading-tight">
              Patient Examination
              {activeRegion && (
                <span className="ml-2 text-xs font-light text-muted-foreground">
                  {'\u2014'} {REGION_LABELS[activeRegion] || activeRegion}
                </span>
              )}
            </h2>
            {!activeRegion && (
              <p
                className="mt-0.5 max-w-[17rem] truncate text-[9px] text-muted-foreground/70 sm:max-w-[22rem]"
                title={livePositionLabel}
                data-current-patient-position
              >
                {livePositionLabel}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* ONE view switch (skin ↔ skeleton). Previously labelled
              "Surface | Anatomy", which read as two unrelated controls —
              renamed so it is obviously a single mutually-exclusive toggle. */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/70 p-0.5 dark:border-white/10 dark:bg-slate-900/60" role="group" aria-label="Model view layer">
            <span className="pl-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">View</span>
            <button
              type="button"
              onClick={() => setAnatomyLayer('surface')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'surface'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'surface'}
              title="Skin / surface examination view"
            >
              <User className="h-2.5 w-2.5" />
              Skin
            </button>
            <button
              type="button"
              onClick={() => setAnatomyLayer('skeleton')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'skeleton'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'skeleton'}
              title="Skeletal anatomy reference overlay"
            >
              <Activity className="h-2.5 w-2.5" />
              Skeleton
            </button>
            <button
              type="button"
              onClick={() => setAnatomyLayer('dressed')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'dressed'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'dressed'}
              title="Clothed view — clothing parts over the region you assess"
            >
              <Shirt className="h-2.5 w-2.5" />
              Dressed
            </button>
          </div>
          {/* Dressed view: deliberate exposure of the focused region. */}
          {anatomyLayer === 'dressed' && activeRegion && (CLOTHING_PARTING[activeRegion]?.length ?? 0) > 0 && (
            <Button
              variant={regionExposed ? 'default' : 'ghost'}
              size="sm"
              className={`h-6 gap-1 px-2 text-[9px] rounded-lg ${regionExposed ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border border-teal-500/30 text-teal-600 dark:text-teal-300'}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setRegionExposed(value => !value);
              }}
              aria-pressed={regionExposed}
              title={regionExposed ? 'Re-dress this region' : 'Expose this region for examination'}
            >
              <Shirt className="h-3 w-3" />
              {regionExposed ? 'Re-dress' : 'Expose'}
            </Button>
          )}
          {/* Phase 2 — guided exam mode toggle */}
          <Button
            variant={guidedMode ? 'default' : 'ghost'}
            size="sm"
            className={`h-6 gap-1 px-2 text-[9px] rounded-lg ${guidedMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}`}
            onClick={handleToggleGuidedMode}
            aria-pressed={guidedMode}
            title={t('guidedExam.toggleHint')}
          >
            {guidedMode ? <Compass className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {guidedMode ? t('guidedExam.on') : t('guidedExam.off')}
          </Button>
          {/* Phase 2B: Required vs optional badge */}
          <Badge variant={assessedCount === TOTAL_REGIONS ? 'default' : 'secondary'}
            className={`text-[9px] ${assessedCount === TOTAL_REGIONS ? 'bg-green-500' : ''}`}>
            {requiredTotal > 0
              ? `${requiredDone}/${requiredTotal} required \u00b7 ${assessedCount}/${TOTAL_REGIONS} total`
              : `${assessedCount}/${TOTAL_REGIONS}`
            }
          </Badge>
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCloseRegion}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Phase 2 — guided exam mode: step indicator + blocked-click nudge */}
      {guidedMode && !activeRegion && (
        <div className="px-3 py-1.5 border-b border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/70 dark:bg-cyan-950/30 flex items-center gap-2">
          <Compass className="h-3 w-3 text-indigo-500 shrink-0" />
          {nextGuidedStep ? (
            <p className="text-[10px] text-indigo-700 dark:text-indigo-200">
              <span className="font-semibold">
                {t('guidedExam.stepOf', { current: guidedStepIndex + 1, total: EXAM_SEQUENCE.length })}
              </span>
              <span className="mx-1.5 text-indigo-400">{'\u2192'}</span>
              <span>{REGION_LABELS[nextGuidedStep] || nextGuidedStep}</span>
            </p>
          ) : (
            <p className="text-[10px] text-indigo-700 dark:text-indigo-200 font-semibold">
              {t('guidedExam.complete')}
            </p>
          )}
        </div>
      )}
      {guidedMode && blockedNudge && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-200">
            {t('guidedExam.blocked', {
              attempted: REGION_LABELS[blockedNudge.attempted] || blockedNudge.attempted,
              expected: REGION_LABELS[blockedNudge.expected] || blockedNudge.expected,
            })}
          </p>
        </div>
      )}

      {!activeRegion && (
        <div className="patient-exam-summary grid grid-cols-2 gap-2 px-3 py-2 border-b border-slate-200/50 bg-white/45 text-[10px] dark:border-white/5 dark:bg-slate-950/30 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Patient</p>
            <p className="truncate font-medium">{patientAgeShortLabel(caseData.patientInfo?.age)} {caseData.patientInfo?.gender}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Posture</p>
            <p className="truncate font-medium" title={livePositionLabel}>{livePositionLabel}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Appearance</p>
            <p className="truncate font-medium">{caseData.initialPresentation?.appearance || 'Observe closely'}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Focus</p>
            <p className="truncate font-medium">{requiredTotal > 0 ? `${requiredTotal} required regions` : 'Head-to-toe survey'}</p>
          </div>
        </div>
      )}

      {!activeRegion && (
        <PatientRealismStrip
          profile={realismProfile}
          cues={visibleRealismCues}
          assessedRegions={assessedRegions}
          activeRegion={activeRegion}
        />
      )}

      <div className="patient-region-selector border-b border-slate-200/60 bg-white/55 px-3 py-2 dark:border-white/5 dark:bg-slate-950/30">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Examine region</p>
            <p className="text-[8px] text-muted-foreground/55">Select region or tap patient directly</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'face', label: 'Face', Icon: Eye },
              { id: 'neck-cspine', label: 'Neck', Icon: User },
              { id: 'chest', label: 'Chest', Icon: Stethoscope },
              { id: 'abdomen', label: 'Abdomen', Icon: Activity },
              { id: 'extremities', label: 'Limbs', Icon: Hand },
            ].map(({ id, label, Icon }) => {
              const assessed = isRegionAssessed(id);
              const required = requiredRegions.has(id);
              const isActive = activeRegion === id || (id === 'extremities' && !!activeRegion && isLimbRegion(activeRegion));
              const isSelected = (id === 'extremities' && showLimbDropdown) || isActive;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Examine ${label}`}
                  onClick={() => {
                    if (id === 'extremities') {
                      setShowLimbDropdown(!showLimbDropdown);
                    } else {
                      setShowLimbDropdown(false);
                      handleRegionClick(id);
                    }
                  }}
                  className={`relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 text-[8px] font-semibold transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/25 text-cyan-900 dark:border-cyan-400 dark:bg-cyan-950/65 dark:text-cyan-100 shadow-md ring-2 ring-cyan-400/50 scale-[1.02]'
                      : assessed
                        ? 'border-emerald-300/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-slate-200/80 bg-white/75 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-950/25'
                  }`}
                >
                  {required && !assessed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  {assessed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Extremities limb selector dropdown / segment control */}
          {showLimbDropdown && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-cyan-300/40 bg-slate-900/90 p-2 text-white shadow-xl backdrop-blur-md">
              <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-cyan-200">Select extremity</p>
                <button
                  type="button"
                  onClick={() => setShowLimbDropdown(false)}
                  className="rounded px-1 text-[10px] text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {[
                  { id: 'right-arm', label: 'R Arm', sub: 'Brachial / Radial' },
                  { id: 'left-arm', label: 'L Arm', sub: 'Brachial / Radial' },
                  { id: 'right-leg', label: 'R Leg', sub: 'Femoral / Pedal' },
                  { id: 'left-leg', label: 'L Leg', sub: 'Femoral / Pedal' },
                ].map((limb) => {
                  const limbAssessed = isRegionAssessed(limb.id);
                  const limbActive = activeRegion === limb.id;
                  return (
                    <button
                      key={limb.id}
                      type="button"
                      onClick={() => {
                        setShowLimbDropdown(false);
                        handleRegionClick(limb.id);
                      }}
                      className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                        limbActive
                          ? 'border-cyan-300 bg-cyan-500/30 text-white ring-2 ring-cyan-300/60'
                          : limbAssessed
                            ? 'border-emerald-400/50 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50'
                            : 'border-cyan-400/30 bg-slate-800/80 text-white hover:border-cyan-300 hover:bg-cyan-950/60'
                      }`}
                    >
                      <span className="flex w-full items-center justify-between text-[10px] font-bold">
                        {limb.label}
                        {limbAssessed && <span className="text-[10px] text-emerald-300">✓</span>}
                      </span>
                      <span className="text-[7px] text-white/60">{limb.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      {/* Patient frame. In treatment-bay mode the mannequin stays as the centre
          of the scene; controls move to a dock below the patient instead of
          floating across the anatomy. */}
      <div className="patient-model-frame">
        <div className={`patient-model-canvas-shell relative min-w-0 overflow-hidden ${patientFirstExamLayout ? 'patient-first-canvas' : ''} ${activeRegion ? 'bg-slate-100/35 dark:bg-slate-950/20' : 'h-[320px] sm:h-[380px] lg:h-[420px]'}`}>
          <div className={`patient-model-canvas-stage relative min-w-0 overflow-hidden ${patientFirstExamLayout ? 'patient-first-canvas-stage' : activeRegion ? 'h-[430px] sm:h-[470px]' : 'h-full'}`}>
            <Canvas
              camera={{
                position: overviewCameraFocus.pos,
                fov: treatmentBayOverviewEnabled && bayStage === 'floor'
                  ? floorOverviewFov(bayVariant)
                  : treatmentBayOverviewEnabled && patientMobility === 'pacing' ? 48 : 34,
                near: 0.05,
                far: 200,
              }}
              dpr={Math.min(window.devicePixelRatio, 2)}
              frameloop="always"
              // One standard PCF shadow map for the surgical key light;
              // disabled on the last quality rung alongside contact shadows.
              // `shadows="soft"` now selects Three's deprecated
              // PCFSoftShadowMap and flooded the console on every remount.
              shadows={quality.contactShadows ? { type: THREE.PCFShadowMap } : false}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: new URLSearchParams(window.location.search).has('capture'),
                // Explicit filmic response + exposure tuned against the HDRI
                // environment so skin holds highlight detail without going muddy.
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 0.9,
              }}
              style={{ background: 'transparent' }}
              onPointerMissed={(event) => {
                // UI controls layered over the Canvas are not patient-surface
                // misses. Never close a focused region because the student
                // pressed Expose, a technique, a tab, a pulse site or a form
                // control.
                const target = event.target as Element | null;
                if (
                  event.defaultPrevented
                  || target?.closest('button, a, input, textarea, select, [role="button"], [role="tab"], [data-patient-ui]')
                ) return;
                if (activeRegion && activeRegion !== 'posterior-logroll') handleCloseRegion();
              }}
              onCreated={(state) => {
                // ponytail: dev-only calibration hook — lets a script reach the
                // live scene/camera to compute exact facial-landmark positions
                // from the model's own geometry+texture (see scripts/calibrate).
                if (import.meta.env.DEV) {
                  (window as unknown as { __r3f?: unknown }).__r3f = state;
                }
              }}
            >
              {/* Image-based lighting: a CC0 Poly Haven studio HDRI (local file,
                  NOT a drei preset — presets fetch from a CDN at runtime) does
                  the ambient/fill work with real directional variation, which is
                  what gives skin its depth. On top of the IBL we keep exactly one
                  warm key light for shape and one rim light for silhouette
                  separation; the old 4-directional + strong ambient rig flattened
                  every surface to the same value. */}
              <Suspense fallback={null}>
                {/* Villa scenes carry their own window/lamp/AC rig; keep the
                    studio HDRI as a low-level bounce only so the room lights
                    sell the place. Clinic/roadside keep the full HDRI. */}
                <Environment
                  files="/hdri/studio_small_08_1k.hdr"
                  environmentIntensity={bayVariant === 'home' ? 0.22 : 1}
                />
              </Suspense>

              {/* Stage 3: FPS watchdog + degrade ladder (composer → dpr →
                  contact shadows). Lives inside the Canvas so it reads the
                  real frame loop; the tier state lives outside so the JSX
                  below can derive from it. */}
              <AdaptiveQuality tier={qualityTier} onTierChange={setQualityTier}
                postEffectsMounted={caseData.id === 'resp-001' && bedsideConversation.active && !!faceAttachment && quality.composerEnabled} />

              <ambientLight intensity={bayVariant === 'home' ? 0.12 : 0.1} />
              <directionalLight position={[4, 8, 5]} intensity={bayVariant === 'home' ? 0.32 : 1.45} color="#fff2e6" />
              <directionalLight position={[0, 4, -5]} intensity={bayVariant === 'home' ? 0.22 : 0.95} color="#ffffff" />
              {/* The villa already has an authored daylight/examination rig.
                  These legacy close-range fills bleach its skin and cyanosis. */}
              {activeRegion === 'face' && caseData.id !== 'resp-001' && (
                <FaceEquipmentFrame frame={faceAttachment}>
                  <pointLight
                    name="pupil-exam-light"
                    position={[0, 1.62, 0.42]}
                    intensity={3.2}
                    distance={0.9}
                    decay={2}
                    color="#fffcf5"
                  />
                  <spotLight
                    name="exam-fill-light"
                    position={[0, 1.42, 0.28]}
                    target-position={[0, 1.55, 0.16]}
                    intensity={1.6}
                    angle={Math.PI * 0.45}
                    penumbra={0.55}
                    distance={1.1}
                    decay={2}
                    color="#f5f2ed"
                  />
                </FaceEquipmentFrame>
              )}

              <TreatmentBayEnvironment
                hideOverhead={treatmentBayOverviewEnabled}
                patientSupportSurface={treatmentBayOverviewEnabled ? patientSupportSurface : 'stretcher'}
                showPatientSeat={treatmentBayOverviewEnabled && patientSupportSurface === 'seat'}
                patientSeated={patientMobility === 'seated'}
                patientSeatKind={patientSeatKind}
                shadowsEnabled={quality.contactShadows}
                variant={bayVariant}
                sceneProfile={resolveSceneProfile(caseData)}
                onAnchorsReady={caseData.id === 'resp-001' ? handleSceneAnchorsReady : undefined}
                kitAnchor={villaAnchors?.kit}
                firstAidAnchor={villaAnchors?.firstAid}
              />

              {/* Cinematic ease-in when entering the treatment bay — slight
                  pull-back + dutch tilt settling onto the preset framing.
                  Any pointer interaction cancels it instantly. */}
              <CameraEntrance
                active={useTreatmentBayPresentation && !activeRegion && !bedsideConversation.active}
                once={caseData.id === 'resp-001'}
                focus={overviewCameraFocus}
                controlsRef={controlsRef}
                origin={sceneEntryOrigin(bayVariant)}
              />

              <AmbientAudioLayer
                active={useTreatmentBayPresentation}
                variant={bayVariant}
                breathKind={ambientBreath.kind}
                breathRpm={ambientBreath.rpm}
                patientPosition={ambientPatientPosition}
              />

              <BodyMesh
                assessedRegions={assessedRegions}
                onRegionClick={handleRegionClick}
                requiredRegions={requiredRegions}
                guidedMode={guidedMode}
                nextGuidedStep={nextGuidedStep}
                onBlockedClick={handleBlockedClick}
                onBodyPoint={handleBodyPoint}
                bodyInjuries={bodyInjuriesForMesh}
                // See public/models/REALISTIC_ANATOMY.md for the vetted model
                // sources and the required export/validation path.
                patientGender={caseData.patientInfo?.gender}
                patientAge={activePatientAge}
                surfaceOpacity={anatomyLayer === 'skeleton' ? 0 : 1}
                // Finding morphs reveal ONLY once their region is assessed —
                // the discovery mechanic, now expressed on the mesh itself.
                activeFindingMorphs={activeFindingMorphs}
                // Breathing morph driven at the case respiratory rate (0 when
                // apnoeic / in arrest — stillness is itself a finding).
                breathRateRpm={isInArrest ? 0 : breathRateRpm}
                // Breathing depth — shallow vs deep laboured.
                breathDepthFactor={breathDepthFactor}
                // Scenario-declared accessory-muscle recruitment. The rate
                // alone under-reads cases like severe asthma, where the work
                // of breathing is visible before the rate looks alarming.
                breathingEffort={patientVisualState?.breathingEffort ?? 0}
                // Unilateral chest rise — the look finding for tension
                // pneumothorax / flail segment, previously text-only.
                chestRiseUnilateral={patientVisualState?.chestRiseUnilateral ?? false}
                // Procedural life loop — GCS<=8/arrest = still, eyes closed.
                unconscious={patientUnconscious}
                // Condition-responsive idle motion; drops non-essential
                // animations once the quality ladder has degraded resolution.
                idleCues={idleCues}
                reduceIdleMotion={qualityTier >= 3}
                // Live skin perfusion tint — cyanosis from SpO2, pallor from
                // shock index, jaundice cast when the case is hepatic. null
                // when nothing applies (no tint).
                skinTint={skinTint}
                cyanosisLocalStrength={cyanosisLocalStrength}
                // OMS-style visible unwellness states, orthogonal to the tint:
                // diaphoresis → sweat sheen (material roughness/envMap),
                // jaundice → scleral yellowing (eye materials), mottling →
                // late-shock livedo texture overlay.
                diaphoresis={Math.max(unwellness.diaphoresis, scenarioDiaphoresis)}
                jaundice={unwellness.jaundice}
                mottling={Math.max(unwellness.mottling, scenarioMottling)}
                // Receive the surface projector so labels anchor to the real mesh.
                // Wrap in an arrow so React stores the function rather than calling it.
                onSurfaceSampler={handleSurfaceSampler}
                onFaceAttachment={setFaceAttachment}
                dressed={anatomyLayer === 'dressed'}
                dressedActiveRegion={regionExposed ? activeRegion : defibrillatorPadsAttached ? 'chest' : null}
                pupilLeftMm={pupilProfile.leftMm}
                pupilRightMm={pupilProfile.rightMm}
                presentation={useTreatmentBayPresentation ? 'treatment-bay' : 'upright'}
                bayStage={bayStage}
                // SSS skin (male mesh only) — shed with the composer on the
                // adaptive ladder so iPad falls back to plain PBR.
                sss={qualityTier < 1}
                // Work-of-breathing posture; eases to recovery as SpO2 climbs.
                posture={patientPosture}
                braceHandsOnKnees={caseData.id === 'resp-001'}
                handGuardRegion={handGuardRegion}
                mobility={patientMobility}
                plantOffset={plantOffset}
                seatedSupportLift={seatedSupportLift}
                // Lip-sync drive from the patient's TTS analyser.
                mouthOpenRef={patientVoice.mouthOpenRef}
              />

              <TreatmentBayImmersionLayer
                seatedSupportLift={seatedSupportLift}
                plantOffset={plantOffset}
                equipmentGroundY={caseData.id === 'resp-001' ? RESP001_VILLA_RUG_TOP_Y : undefined}
                faceAttachment={faceAttachment}
                showWallMonitor={caseData.id !== 'resp-001'}
                appliedTreatmentIds={appliedTreatmentIds}
                active={useTreatmentBayPresentation}
                stage={bayStage}
                supportSurface={patientSupportSurface}
                posture={patientPosture}
                mobility={patientMobility}
                patientScale={patientScale}
              />

              {caseData.id === 'resp-001' && faceAttachment && <PilotIrisDetail attachment={faceAttachment} />}
              {caseData.id === 'resp-001' && showEyeContext && !bedsideConversation.active && (
                <PupilLightExam side={pupilLightSide} profile={pupilProfile} />
              )}

              {/* Active bleed overlay — pulsing red glow at bleeding wounds,
                  collapses when source control (tourniquet / dressing /
                  chest seal) is applied. */}
              <ActiveBleedSprites
                overlays={patientVisualState?.woundOverlays ?? []}
                controlledIds={buildTreatmentEquipmentState(appliedTreatmentIds).controlledBleedIds}
                sampler={surfaceSampler}
                bpm={isInArrest ? 0 : (vitals?.pulse ?? 80)}
              />

              <FocusedWoundLayer
                injuries={bodyInjuriesForMesh}
                activeRegion={activeRegion}
                exposed={regionExposed}
                assessedRegions={assessedRegions}
                sampler={surfaceSampler}
              />

              <AnatomyReferenceLayer
                visible={anatomyLayer === 'skeleton'}
                presentation={treatmentBayMode ? 'treatment-bay' : 'upright'}
                stage={bayStage}
                posture={patientPosture}
                mobility={patientMobility}
                activeRegion={activeRegion}
                patientAge={activePatientAge}
                seatedSupportLift={seatedSupportLift}
                plantOffset={plantOffset}
              />

              {!bedsideConversation.active && <LandmarkMarkers
                landmarks={caseData.id === 'resp-001' ? RESP001_EXAM_LANDMARKS : EXAM_LANDMARKS}
                useContactAnchors={caseData.id === 'resp-001'}
                activeRegion={activeRegion}
                assessedRegions={assessedRegions}
                requiredRegions={requiredRegions}
                onSelect={handleRegionClick}
                onAction={handleExamAction}
                onPulse={onPulse}
                sampler={surfaceSampler}
                presentation={markerPresentation}
                patientScale={patientScale}
              />}

              {caseData.id === 'resp-001' && !bedsideConversation.active && anatomyLayer !== 'skeleton' && (activeRegion === 'chest' || activeRegion === 'abdomen') && (
                <AssessmentContactTool
                  action={selectedAction === contactAction ? contactAction : null}
                  region={activeRegion}
                  sampler={surfaceSampler}
                  patientScale={patientScale}
                  listeningStep={pilotListeningStep}
                  exposed={anatomyLayer !== 'dressed' || regionExposed || (activeRegion === 'chest' && defibrillatorPadsAttached)}
                />
              )}

              {!useTreatmentBayPresentation && (
                <>
                  <CaseRealismMarkers
                    cues={visibleRealismCues}
                    assessedRegions={assessedRegions}
                    activeRegion={activeRegion}
                    sampler={surfaceSampler}
                    presentation={markerPresentation}
                  />

                  <ScenarioVisualMarkers
                    visualState={patientVisualState}
                    activeRegion={activeRegion}
                    sampler={surfaceSampler}
                    presentation={markerPresentation}
                  />

                  {/* Findings revealed ON the body, only once their region has
                      been assessed — the discovery mechanic. */}
                  <RevealedFindingMarkers
                    caseData={caseData}
                    assessedRegions={assessedRegions}
                    activeRegion={activeRegion}
                    sampler={surfaceSampler}
                    presentation={markerPresentation}
                  />
                </>
              )}

              <InjuryWoundMarkers
                caseData={caseData}
                assessedRegions={assessedRegions}
                activeRegion={activeRegion}
                sampler={surfaceSampler}
              />

              {/* A newly selected texture must not suspend the whole patient,
                  canvas controls or equipment status while it loads. */}
              <Suspense fallback={null}>
                <TreatmentEquipmentOverlay
                  pilotVolumetricMasks={caseData.id === 'resp-001'}
                  seatedSupportLift={seatedSupportLift}
                  plantOffset={plantOffset}
                  faceAttachment={faceAttachment}
                  appliedTreatmentIds={appliedTreatmentIds}
                  sampler={surfaceSampler}
                  presentation={markerPresentation}
                  bayStage={bayStage}
                  posture={patientPosture}
                  mobility={patientMobility}
                  patientScale={patientScale}
                />
              </Suspense>

              {quality.contactShadows && (
                <ContactShadows
                  name="patient-contact-shadow"
                  // The authored villa rug is 32 mm thick. A floor-level
                  // receiver is hidden beneath it, making contact look absent.
                  position={[0, caseData.id === 'resp-001' ? 0.033 : -0.01, 0]}
                  opacity={0.32} scale={3.4} blur={3.4} far={3}
                />
              )}

              {/* Keep the old AO/upscale composer out of clinical care: it
                  produced black frames on Retina dock resizes. The reference
                  scene uses a focus + ACES-only pass during dialogue only.
                  Hands-on assessment keeps direct rendering and auto-clear;
                  the adaptive ladder sheds portrait focus under load. */}
              {caseData.id === 'resp-001' && bedsideConversation.active && faceAttachment && quality.composerEnabled && (
                <ConversationFocus active={bedsideConversation.active} face={faceAttachment} />
              )}

              <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableDamping
                dampingFactor={0.07}
                rotateSpeed={0.55}
                zoomSpeed={0.65}
                minDistance={caseData.id === 'resp-001' && showEyeContext ? .28 : activeRegion ? 0.7 : 2}
                maxDistance={caseData.id === 'resp-001' && showEyeContext
                  ? 1
                  : bayStage === 'floor'
                    ? floorOverviewMaxDistance(bayVariant) ?? cameraOrbitSafety.maxDistance
                    : cameraOrbitSafety.maxDistance}
                minAzimuthAngle={cameraOrbitSafety.minAzimuthAngle}
                maxAzimuthAngle={cameraOrbitSafety.maxAzimuthAngle}
                minPolarAngle={caseData.id === 'resp-001' && !showEyeContext
                  ? cameraOrbitSafety.minPolarAngle
                  : bayStage === 'floor'
                    ? floorOverviewMinPolarAngle(bayVariant)
                    : Math.PI * 0.15}
                // The focal point is on the patient, above their support.
                // Never orbit below that plane into the road/floor underside.
                maxPolarAngle={caseData.id === 'resp-001' && showEyeContext ? Math.PI * .65 : caseData.id === 'resp-001' ? cameraOrbitSafety.maxPolarAngle : Math.PI / 2 - 0.05}
                onStart={cancelCameraAnimation}
              />
            </Canvas>

            {/* Compact list of applied equipment — labels for the on-body pins */}
            <AppliedEquipmentTray appliedTreatmentIds={appliedTreatmentIds} />

            {treatmentBayOverviewEnabled && !activeRegion && !bedsideConversation.active && (
              <BayKitHotspots
                recommendedTab={recommendedManagementTabForCase(caseData)}
                showFirstAid={caseData.id === 'resp-001'}
                onOpenKit={onRequestTreat
                  ? (tab, search) => onRequestTreat({ reason: 'scene-kit', managementTab: tab, search })
                  : undefined}
              />
            )}

            {treatmentBayOverviewEnabled && !activeRegion && (
              <ObserveQuickActions onCue={handleObserveCue} referenceScene={caseData.id === 'resp-001'} />
            )}

            {/* Floating deselect — effortless "back to full body" while focused */}
            {activeRegion && (
              <button
                onClick={handleCloseRegion}
                className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-[11px] font-medium text-white/90 shadow-lg backdrop-blur-md transition hover:bg-slate-900/70 active:scale-95"
                aria-label="Back to full body"
              >
                <X className="h-3 w-3" /> Full body
              </button>
            )}

            {activeRegion && !patientFirstExamLayout && <PatientReactionCard reaction={patientReaction} />}

            {activeRegion && !patientFirstExamLayout && (
              <AssessmentActionDock
                activeRegion={activeRegion}
                actions={allActions}
                selectedAction={selectedAction}
                revealedFindings={revealedFindings}
                onAction={handleExamAction}
              />
            )}

            {showRegionalLoupe && !patientFirstExamLayout && (
              <div className={`pointer-events-none absolute right-3 top-3 z-20 ${loupeWidthClass} animate-in fade-in slide-in-from-top-2 duration-300 ${showEyeContext ? '' : 'hidden sm:block'}`}>
                <RegionalZoomLoupe
                  activeRegion={activeRegion}
                  selectedAction={selectedAction}
                  caseData={caseData}
                  pupilProfile={pupilProfile}
                  revealedFindings={revealedFindings}
                  onAction={handleExamAction}
                />
              </div>
            )}

            {/* In-frame premium glass findings — replaces the drop-below panel */}
            {activeRegion && !patientFirstExamLayout && (
              <InFrameFindings
                selectedAction={selectedAction}
                revealedFindings={revealedFindings}
                allActions={allActions}
                offsetForEyeContext={showRegionalLoupe}
              />
            )}
          </div>

          {bedsideConversation.enabled && <aside ref={bedsideConversation.register} className="bedside-history-dock" aria-label={t('bedside.title')} />}

          {patientFirstExamLayout && activeRegion && (
            <PatientFirstExamDock
              eyeControls={caseData.id === 'resp-001' ? <PupilLightControls side={pupilLightSide} onChange={setPupilLightSide} /> : undefined}
              activeRegion={activeRegion}
              actions={allActions}
              selectedAction={selectedAction}
              revealedFindings={revealedFindings}
              onAction={handleExamAction}
              caseData={caseData}
              pupilProfile={pupilProfile}
              patientReaction={patientReaction}
              showRegionalLoupe={showRegionalLoupe}
              playingSound={playingSound}
              soundProgress={soundProgress}
              onRequestTreat={onRequestTreat}
              onTechniqueChange={() => { cancelPilotListening(); setContactAction(null); }}
            />
          )}

          {activeRegion && !patientFirstExamLayout && (
            <div className="glass-panel relative z-20 m-2 mt-0 max-h-[290px] overflow-hidden rounded-2xl border border-white/45 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 sm:m-3 sm:mt-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-3 py-2 dark:border-white/10">
                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Hands-on exam station
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {activeLimb ? LIMB_LABELS[activeLimb] : REGION_LABELS[activeRegion]}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full text-[9px]">
                  {allActions.filter(action => revealedFindings.has(action.id)).length}/{allActions.length} checked
                </Badge>
              </div>

              <div className="grid max-h-[calc(100%-3rem)] gap-0 overflow-hidden sm:grid-cols-[minmax(220px,0.9fr)_minmax(280px,1.1fr)]">
                <div className="min-h-0 overflow-y-auto border-b border-slate-200/70 p-2.5 dark:border-white/10 sm:border-b-0 sm:border-r">
                  <div className="space-y-1.5">
                    {limbGroups ? (
                      limbGroups.map(group => {
                        const isGroupExpanded = expandedGroups.has(group.id);
                        const groupRevealedCount = group.actions.filter(a => revealedFindings.has(a.id)).length;
                        const isCore = group.defaultExpanded;
                        return (
                          <div key={group.id} className={`rounded-xl overflow-hidden ${!isCore ? 'border border-border/40 bg-white/45 dark:bg-slate-900/40' : ''}`}>
                            <button
                              onClick={() => toggleGroup(group.id)}
                              className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 transition-colors ${
                                !isCore ? 'bg-muted/50 hover:bg-muted border-b border-border/20' : ''
                              }`}
                            >
                              {isGroupExpanded
                                ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                              }
                              <span className="text-[10px] font-semibold flex-1">{group.label}</span>
                              <Badge variant="outline" className={`h-3.5 py-0 text-[7px] ${
                                groupRevealedCount === group.actions.length && groupRevealedCount > 0
                                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30'
                                  : ''
                              }`}>
                                {groupRevealedCount}/{group.actions.length}
                              </Badge>
                            </button>
                            {isGroupExpanded && (
                              <div className={`space-y-0.5 ${!isCore ? 'p-1.5' : 'py-0.5'}`}>
                                {group.actions.map(action => renderActionButton(action))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      subRegions.map(sr => (
                        <div key={sr.id} className="space-y-0.5">
                          {subRegions.length > 1 && (
                            <p className="px-1 pt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {sr.label}
                            </p>
                          )}
                          {sr.actions.map(action => renderActionButton(action))}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto p-2.5">
                  <SecondaryAssessmentOutline
                    liveVitals={effectiveVitals}
                    activeRegion={activeRegion}
                    selectedAction={selectedAction}
                    caseData={caseData}
                    revealedFindings={revealedFindings}
                    onAction={handleExamAction}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls + footer */}
      <div className="patient-exam-footer relative flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground">
          {activeRegion
            ? 'Work inside the patient frame: choose a technique, watch the anatomy, then reassess.'
            : 'Observe the patient — Look / Listen / Feel, or tap a body region to examine'}
        </p>
        <div className="flex gap-1.5">
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[9px] rounded-lg" onClick={handleCloseRegion}>
              <X className="h-2.5 w-2.5" /> Back
            </Button>
          )}
          {/* Phase 2D: Log Roll button */}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-[9px] rounded-lg"
            onClick={() => handleRegionClick('posterior-logroll')}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Log Roll
          </Button>
        </div>
      </div>

      {/* Phase 2D: Log roll reminder hint */}
      {showLogRollHint && !activeRegion && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200/50 dark:border-amber-800/50 flex items-center gap-2">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300">Remember to log roll the patient</p>
        </div>
      )}

    </div>
  );
}

export default Body3DModel;
