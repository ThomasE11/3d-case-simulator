/**
 * Patient appearance — why every face used to look like the same MPFB shell.
 *
 * The GLB is a neutral base. A 68-year-old Emirati grandmother and a
 * 22-year-old Filipina nurse cannot share one skin/hair/habitus. This module
 * derives a deterministic look from the authored case (age, sex, occupation,
 * cultural cues, case id) and the 3D layer paints it on the shared shell.
 *
 * Deterministic: the same case always looks the same, so students recognise
 * the patient. Different cases stop reading as clones.
 */

import type { CaseScenario } from '@/types';

export type SkinToneId = 'fair' | 'light' | 'medium' | 'tan' | 'olive' | 'brown' | 'deep';
export type HairColourId = 'black' | 'dark-brown' | 'brown' | 'auburn' | 'grey' | 'white' | 'sandy';
export type HairStyleId = 'short' | 'medium' | 'long' | 'bun' | 'hijab' | 'bald' | 'curly';
export type BodyHabitusId = 'slim' | 'average' | 'stocky' | 'broad' | 'frail' | 'athletic' | 'obese';

export interface PatientAppearance {
  skinTone: SkinToneId;
  /** Multiplier over the authored base skin map. 1 = untouched. */
  skinWarmth: number;
  hairColour: HairColourId;
  hairStyle: HairStyleId;
  /** 0..1 body mass/build morph bias. */
  build: BodyHabitusId;
  /** Freckles / sun damage on fair skin; stubble density for adult males. */
  freckles: number;
  stubble: number;
}

const SKIN_HEX: Record<SkinToneId, string> = {
  fair: '#f3d3c0',
  light: '#e8b896',
  medium: '#d2a07a',
  tan: '#c4865c',
  olive: '#b87a4e',
  brown: '#9a5f3c',
  deep: '#6b3f28',
};

const HAIR_HEX: Record<HairColourId, string> = {
  black: '#1a1412',
  'dark-brown': '#2c211c',
  brown: '#4a3428',
  auburn: '#6b3424',
  sandy: '#8a6a45',
  grey: '#8a857e',
  white: '#d4d0c8',
};

export function skinHexFor(tone: SkinToneId): string {
  return SKIN_HEX[tone];
}

export function hairHexFor(colour: HairColourId): string {
  return HAIR_HEX[colour];
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFrom<T>(list: readonly T[], seed: number, salt: number): T {
  return list[(seed + salt) % list.length];
}

/**
 * UAE prehospital mix — Emirati / Arab, South Asian, Filipino, Western expat —
 * weighted toward the local population, not one default face.
 */
const TAN_POOL: readonly SkinToneId[] = ['olive', 'tan', 'medium', 'brown', 'light', 'deep', 'medium', 'tan'];
const HAIR_POOL: readonly HairColourId[] = ['black', 'dark-brown', 'black', 'brown', 'dark-brown', 'sandy', 'black'];

export function derivePatientAppearance(caseData: CaseScenario): PatientAppearance {
  const seed = hashId(caseData.id);
  const age = caseData.patientInfo?.age;
  const gender = caseData.patientInfo?.gender;
  const occupation = String(caseData.patientInfo?.occupation ?? '').toLowerCase();
  const cultural = (caseData.patientInfo?.culturalConsiderations ?? []).join(' ').toLowerCase();
  const haystack = [
    occupation,
    cultural,
    caseData.dispatchInfo?.location,
    caseData.patientInfo?.language,
  ].filter(Boolean).join(' ').toLowerCase();

  // --- Skin tone ---------------------------------------------------------
  let skinTone: SkinToneId;
  if (/western|british|european|australian|american|expat from (uk|us|europe)/.test(haystack)) {
    skinTone = pickFrom(['fair', 'light', 'light', 'medium'] as const, seed, 1);
  } else if (/filipin|pinoy|pinay/.test(haystack)) {
    skinTone = pickFrom(['tan', 'medium', 'olive'] as const, seed, 2);
  } else if (/indian|pakistani|bangladeshi|sri lankan|nepali|south asian/.test(haystack)) {
    skinTone = pickFrom(['brown', 'deep', 'tan', 'medium'] as const, seed, 3);
  } else if (/emirati|arab|khaliji|local national|uae national/.test(haystack)) {
    skinTone = pickFrom(['olive', 'tan', 'medium', 'brown'] as const, seed, 4);
  } else {
    skinTone = pickFrom(TAN_POOL, seed, 5);
  }

  // --- Hair --------------------------------------------------------------
  let hairColour: HairColourId = pickFrom(HAIR_POOL, seed, 7);
  let hairStyle: HairStyleId;
  if (typeof age === 'number' && age >= 70) {
    hairColour = pickFrom(['white', 'grey', 'grey', 'sandy'] as const, seed, 8);
  } else if (typeof age === 'number' && age >= 55) {
    hairColour = pickFrom(['grey', 'dark-brown', 'sandy', 'white'] as const, seed, 9);
  }
  if (gender === 'female') {
    // Hijab is common on UAE national women — honour cultural cues when authored.
    if (/hijab|abaya|thobe|traditional dress|emirati|arab|muslim/.test(haystack) && /emirati|arab|local|khaliji|hijab/.test(haystack + cultural)) {
      hairStyle = 'hijab';
    } else {
      hairStyle = pickFrom(['long', 'medium', 'bun', 'curly', 'long', 'medium'] as const, seed, 10);
    }
  } else if (typeof age === 'number' && age >= 65) {
    hairStyle = pickFrom(['bald', 'short', 'short', 'bald'] as const, seed, 11);
    if (hairStyle === 'bald') hairColour = pickFrom(['grey', 'white', 'sandy'] as const, seed, 12);
  } else {
    hairStyle = pickFrom(['short', 'short', 'medium', 'curly', 'short', 'bald'] as const, seed, 13);
  }

  // --- Habitus -----------------------------------------------------------
  let build: BodyHabitusId;
  if (typeof age === 'number' && age >= 75) {
    build = pickFrom(['frail', 'slim', 'frail', 'average'] as const, seed, 14);
  } else if (/labour|construction|scaffold|steel|forklift|paramedic|firefighter|athlete|player|footballer|labourer/.test(occupation + ' ' + haystack)) {
    build = pickFrom(['broad', 'athletic', 'stocky'] as const, seed, 15);
  } else if (/student|university|school/.test(occupation)) {
    build = pickFrom(['slim', 'average', 'average'] as const, seed, 16);
  } else if (/obese|overweight|bmi|bariatric/.test(haystack)) {
    build = 'obese';
  } else {
    build = pickFrom(['average', 'slim', 'stocky', 'average', 'athletic'] as const, seed, 17);
  }

  const fairSkin = skinTone === 'fair' || skinTone === 'light';
  const adultMale = gender === 'male' && (age == null || age >= 18);

  return {
    skinTone,
    skinWarmth: 0.92 + ((seed % 17) / 100),
    hairColour,
    hairStyle,
    build,
    freckles: fairSkin && (seed % 3 === 0) ? 0.45 + (seed % 40) / 200 : 0,
    stubble: adultMale ? 0.2 + (seed % 50) / 100 : 0,
  };
}
