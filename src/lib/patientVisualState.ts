/**
 * Patient visual state — pure adapter between RealismDirectorState and the
 * 3D model layer (Body3DModel).
 *
 * Given the realism director's scenario-derived state, this module produces a
 * flat `PatientVisualState` that the 3D layer can consume directly — skin
 * effects, eye changes, chest rise asymmetries, wound/blood/burn overlays,
 * and equipment anchor positions — without the 3D code needing to understand
 * clinical rules.
 *
 * The three.js layer imports this, not `patientRealismScenarios`. Keeps
 * rendering code decoupled from clinical logic.
 *
 * Each channel returns a normalised value (or null when absent) so the renderer
 * can interpolate, fade, or switch without duplicating decision logic.
 */

import type {
  EquipmentAnchorRegion,
  RealismVisualEffect,
  RealismVisualEffectKind,
} from '@/lib/patientRealismScenarios';
import type { RealismDirectorState } from '@/lib/patientRealismDirector';

/* ------------------------------------------------------------------ */
/*  Output types                                                       */
/* ------------------------------------------------------------------ */

export type SkinEffectKind =
  | 'rash'
  | 'facial_swelling'
  | 'flushing'
  | 'pallor'
  | 'mottling'
  | 'diaphoresis'
  | 'cyanosis'
  | 'burn_pattern'
  | 'soot'
  | 'jaundice'
  | 'accessory_muscle_use';

export interface SkinEffect {
  kind: SkinEffectKind;
  region: EquipmentAnchorRegion;
  intensity: number; // 0..1
  detail: string;
}

export interface EyeEffect {
  kind: 'pinpoint' | 'dilated' | 'normal';
  detail: string;
}

export interface ChestRiseAsymmetry {
  present: boolean;
  side: 'left' | 'right' | 'both';
  detail: string;
}

export interface PatientWoundOverlay {
  kind: 'open_wound' | 'active_bleeding' | 'blood_pool' | 'deformity' | 'burn_pattern';
  region: EquipmentAnchorRegion;
  detail: string;
}

export interface PatientEquipmentAnchor {
  region: EquipmentAnchorRegion;
  appearance: string;
  treatmentIdFragments: string[];
  reassess: string[];
}

export interface PatientVisualState {
  skinEffects: SkinEffect[];
  eyeEffects: EyeEffect;
  chestRiseAsymmetry: ChestRiseAsymmetry | null;
  woundOverlays: PatientWoundOverlay[];
  equipmentAnchors: PatientEquipmentAnchor[];
  hasSeizureActivity: boolean;
  hasTremor: boolean;
  vomitRisk: boolean;
  /** Whether accessory muscle use (neck/chest retractions) is visible */
  hasAccessoryMuscleUse: boolean;
  /** Breathing effort intensity: 0 (normal) .. 1 (severe distress) */
  breathingEffort: number;
  /**
   * Unilateral facial droop, 0 (none) .. 1 (severe) — the F of FAST.
   * Drives the `finding_facial_droop` morph on the patient mesh.
   */
  facialDroop: number;
  /**
   * True only for a genuinely UNILATERAL chest rise (tension pneumothorax,
   * flail segment) — not for bilateral reduction. `chestRiseAsymmetry` cannot
   * answer this: it reports side 'both' for a chest-region asymmetry AND for
   * reduced_chest_rise, so the two are indistinguishable there.
   */
  chestRiseUnilateral: boolean;
  /**
   * Lip / perioral swelling, 0 (none) .. 1 (severe) — the airway-risk half of
   * the anaphylaxis story that the rash alone does not tell.
   */
  facialSwelling: number;
}

/* ------------------------------------------------------------------ */
/*  Mapping tables                                                     */
/* ------------------------------------------------------------------ */

const SKIN_EFFECT_KINDS: Set<RealismVisualEffectKind> = new Set([
  'cyanosis', 'diaphoresis', 'flushing', 'pallor', 'mottling',
  'rash', 'facial_swelling', 'burn_pattern', 'soot',
  'accessory_muscle_use',
]);

const WOUND_KINDS: Set<RealismVisualEffectKind> = new Set([
  'active_bleeding', 'open_wound', 'blood_pool', 'deformity', 'burn_pattern',
]);

const intensityTo01 = (i: 'subtle' | 'moderate' | 'severe'): number =>
  i === 'subtle' ? 0.33 : i === 'moderate' ? 0.66 : 1.0;

const eyeEffectFromVisuals = (visuals: RealismVisualEffect[]): EyeEffect => {
  for (const v of visuals) {
    if (v.kind === 'pinpoint_pupils') return { kind: 'pinpoint', detail: v.detail };
    if (v.kind === 'dilated_pupils') return { kind: 'dilated', detail: v.detail };
  }
  return { kind: 'normal', detail: '' };
};

const chestAsymmetryFromVisuals = (visuals: RealismVisualEffect[]): ChestRiseAsymmetry | null => {
  for (const v of visuals) {
    if (v.kind === 'asymmetric_chest_rise') {
      return {
        present: true,
        side: v.region === 'chest' ? 'both' : v.region === 'left-arm' ? 'left' : 'right',
        detail: v.detail,
      };
    }
    if (v.kind === 'reduced_chest_rise') {
      return { present: true, side: 'both', detail: v.detail };
    }
  }
  return null;
};

/* ------------------------------------------------------------------ */
/*  Main derivation                                                    */
/* ------------------------------------------------------------------ */

export function derivePatientVisualState(director: RealismDirectorState): PatientVisualState {
  const visuals = director.activeVisualEffects ?? director.visualEffects ?? [];

  // Skin effects — filter to skin-relevant kinds
  const skinEffects: SkinEffect[] = visuals
    .filter(v => SKIN_EFFECT_KINDS.has(v.kind))
    .map(v => ({
      kind: v.kind as SkinEffectKind,
      region: v.region,
      intensity: intensityTo01(v.intensity),
      detail: v.detail,
    }));

  // Eye effects
  const eyeEffects: EyeEffect = eyeEffectFromVisuals(visuals);

  // Chest rise asymmetry
  const chestRiseAsymmetry = chestAsymmetryFromVisuals(visuals);

  // Wound/blood/burn overlays
  const woundOverlays: PatientWoundOverlay[] = visuals
    .filter(v => WOUND_KINDS.has(v.kind))
    .map(v => ({
      kind: v.kind as PatientWoundOverlay['kind'],
      region: v.region,
      detail: v.detail,
    }));

  // Equipment anchors — forward the director's matched anchors
  const equipmentAnchors: PatientEquipmentAnchor[] = (director.equipmentAnchors ?? []).map(a => ({
    region: a.region,
    appearance: a.appearance,
    treatmentIdFragments: a.treatmentIdFragments,
    reassess: a.reassess,
  }));

  // Boolean flags from scenario state
  const hasSeizureActivity = visuals.some(v => v.kind === 'seizure_activity');
  const hasTremor = visuals.some(v => v.kind === 'tremor');
  const vomitRisk = visuals.some(v => v.kind === 'vomit_risk');
  const hasAccessoryMuscleUse = visuals.some(v => v.kind === 'accessory_muscle_use');
  // Breathing effort: combine accessory muscle use intensity + reduced_chest_rise
  const accessoryIntensity = visuals
    .filter(v => v.kind === 'accessory_muscle_use')
    .reduce((max, v) => Math.max(max, intensityTo01(v.intensity)), 0);
  const reducedChest = visuals.some(v => v.kind === 'reduced_chest_rise') ? 0.5 : 0;
  const breathingEffort = Math.min(1, Math.max(accessoryIntensity, reducedChest));
  const chestRiseUnilateral = visuals.some(v => v.kind === 'asymmetric_chest_rise');
  const facialSwelling = Math.max(0, ...visuals
    .filter(v => v.kind === 'facial_swelling')
    .map(v => intensityTo01(v.intensity)));
  const facialDroop = Math.max(0, ...visuals
    .filter(v => v.kind === 'facial_droop')
    .map(v => intensityTo01(v.intensity)));

  return {
    skinEffects,
    eyeEffects,
    chestRiseAsymmetry,
    woundOverlays,
    equipmentAnchors,
    hasSeizureActivity,
    hasTremor,
    vomitRisk,
    hasAccessoryMuscleUse,
    breathingEffort,
    facialDroop,
    chestRiseUnilateral,
    facialSwelling,
  };
}
