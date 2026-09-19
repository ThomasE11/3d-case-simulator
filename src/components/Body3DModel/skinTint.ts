import * as THREE from 'three';
import type { VitalSigns } from '@/types';

export interface SkinTintInputs {
  vitals?: Partial<VitalSigns> | null;
  initialVitals?: Partial<VitalSigns> | null;
  jaundice?: number;
  scenarioFlushing?: number;
  scenarioPallor?: number;
  scenarioCyanosis?: number;
}

export function parseSystolic(bp: unknown): number | null {
  if (typeof bp === 'number' && Number.isFinite(bp)) return bp;
  if (typeof bp !== 'string') return null;
  const m = bp.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (m) return parseInt(m[1], 10);
  const single = bp.match(/\d{2,3}/);
  return single ? parseInt(single[0], 10) : null;
}

/**
 * Derives the target THREE.Color for live skin perfusion tinting.
 * Order: base (white) -> jaundice -> pallor.
 * Cyanosis is handled locally (lips + nailbeds) by deriveCyanosisLocalStrength,
 * so whole-body skin stays natural while target sites go dusky/blue.
 */
export function deriveSkinTint(inputs: SkinTintInputs): THREE.Color | null {
  const source = inputs.vitals ?? inputs.initialVitals;
  const pulse = typeof source?.pulse === 'number' ? source.pulse : null;
  const systolic = parseSystolic(source?.bp);
  const temperature = typeof source?.temperature === 'number' ? source.temperature : null;

  const color = new THREE.Color(0xffffff);
  let touched = false;

  const jaundice = inputs.jaundice ?? 0;
  if (jaundice > 0) {
    color.lerp(new THREE.Color(0xd6bd6a), 0.45 * jaundice);
    touched = true;
  }

  // Fever should be clinically visible before the learner opens the monitor:
  // warm pink-red cheeks/upper skin, not the grey pallor used for shock. The
  // authored flushing channel preserves this cue even when a case omits a
  // numeric temperature; a live normal temperature can subsequently clear it.
  const authoredFlushing = inputs.scenarioFlushing ?? 0;
  const feverStrength = temperature !== null && temperature >= 38
    ? Math.min(1, 0.45 + (temperature - 38) * 0.35)
    : 0;
  const flushing = Math.max(authoredFlushing, feverStrength);
  if (flushing > 0) {
    color.lerp(new THREE.Color(0xefaa9d), Math.min(0.55, 0.2 + flushing * 0.32));
    touched = true;
  }

  if (pulse !== null && systolic !== null && systolic > 0) {
    const shockIndex = pulse / systolic;
    if (shockIndex > 0.8) {
      const p = Math.min(0.7, 0.3 + (shockIndex - 0.8) * 0.4);
      color.lerp(new THREE.Color(0xc9b6a6), p);
      touched = true;
    }
  }
  const scenarioPallor = inputs.scenarioPallor ?? 0;
  if (scenarioPallor > 0) {
    color.lerp(new THREE.Color(0xc9b6a6), Math.min(0.72, 0.24 + scenarioPallor * 0.42));
    touched = true;
  }

  return touched ? color : null;
}

/** Derives 0..1 local cyanosis overlay strength from SpO2.
 *  Clear at SpO2 >= 94%, dusky at 85%, strong below 85%. */
export function deriveCyanosisLocalStrength(
  vitals?: Partial<VitalSigns> | null,
  initialVitals?: Partial<VitalSigns> | null,
  scenarioCyanosis: number = 0,
): number {
  const source = vitals ?? initialVitals;
  const spo2 = typeof source?.spo2 === 'number' ? source.spo2 : null;
  if (spo2 !== null) {
    if (spo2 >= 94) return 0;
    if (spo2 >= 85) return ((94 - spo2) / 9) * 0.7;
    return Math.min(0.9, 0.7 + ((85 - spo2) / 5) * 0.2);
  }
  if (scenarioCyanosis > 0) {
    return Math.min(0.82, 0.26 + scenarioCyanosis * 0.5);
  }
  return 0;
}
