/**
 * sceneIntroductions.ts
 *
 * Additive scene-introduction enrichment layer.
 *
 * The generated JSON (sceneIntroductions.generated.json) carries the
 * first-person paramedic "arrival" layer — sensory cues, access/extrication
 * notes, and bystander micro-behaviour — authored by the on-device model and
 * reviewed by Elias. It is keyed by case id and merged at render time; it
 * NEVER mutates the source case files (cases.ts / additionalCases.ts /
 * firstYearCases.ts), so the clinical state machine and all existing tests
 * are untouched.
 *
 * Cases without an entry simply render the existing minimal arrival view.
 */

import type { CaseScenario } from '@/types';
import { SCENE_INTRODUCTIONS } from '@/data/sceneIntroductions.generated';

export interface SensoryCues {
  sounds?: string[];
  smells?: string[];
  temperature?: string;
  light?: string;
  air?: string;
}

export interface AccessExtrication {
  accessIssues?: string[];
  extricationNeeded?: boolean;
  note?: string;
}

export interface SceneIntroduction {
  arrivalNarrative?: string;
  sensoryCues?: SensoryCues;
  accessExtrication?: AccessExtrication;
  bystanderDetail?: string;
}

const INTRODUCTIONS = SCENE_INTRODUCTIONS as Record<string, SceneIntroduction>;

export function getSceneIntroduction(caseId: string | undefined): SceneIntroduction | null {
  if (!caseId) return null;
  const entry = INTRODUCTIONS[caseId];
  return entry || null;
}

export function hasSceneIntroduction(caseId: string | undefined): boolean {
  return getSceneIntroduction(caseId) !== null;
}

/** Convenience accessor keyed off the full case, mirroring the JSON key (id). */
export function sceneIntroductionFor(caseData: CaseScenario): SceneIntroduction | null {
  return getSceneIntroduction(caseData.id);
}
