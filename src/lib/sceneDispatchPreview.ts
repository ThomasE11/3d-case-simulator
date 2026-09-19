/**
 * sceneDispatchPreview.ts
 *
 * The briefing↔scene seam. The student reads the dispatch card, then taps
 * Begin Simulation and walks into the scene — but until now the arrival
 * layer (what the place actually feels like) only existed inside the On
 * Arrival panel, after the student was already standing in it. This module
 * renders that same first-person arrival content as a compact preview card
 * so the student forms a scene expectation BEFORE they press Enter Scene.
 *
 * Pure and presentational: it reads the generated scene introduction (which
 * is itself grounded in the case record) and renders it. It never touches
 * the clinical state machine, cases.ts, or the scene survey scoring.
 */

import type { CaseScenario } from '@/types';
import type { SceneIntroduction } from '@/lib/sceneIntroductions';
import { sceneIntroductionFor } from '@/lib/sceneIntroductions';
import { getScenePresentationDescription } from '@/lib/sceneNarrative';

export interface SceneDispatchPreviewData {
  sceneDescription: string;
  arrivalNarrative: string | null;
  sensory: {
    sounds: string[];
    smells: string[];
    temperature: string | null;
    light: string | null;
    air: string | null;
  };
  bystanderDetail: string | null;
  hasEnrichment: boolean;
}

/** Build the preview data for a case. Returns null when there is nothing
 *  to preview (no scene description and no generated introduction). */
export function buildSceneDispatchPreview(caseData: CaseScenario): SceneDispatchPreviewData | null {
  const sceneDescription = getScenePresentationDescription(caseData);
  const intro: SceneIntroduction | null = sceneIntroductionFor(caseData);

  // A case with no authored scene description renders the generic fallback
  // string ("Scene description not available"). That is not a real scene to
  // preview — skip it unless a generated intro gives us something concrete.
  const hasRealDescription = sceneDescription && sceneDescription !== 'Scene description not available';
  if (!hasRealDescription && !intro) return null;

  const cues = intro?.sensoryCues;
  return {
    sceneDescription,
    arrivalNarrative: intro?.arrivalNarrative?.trim() || null,
    sensory: {
      sounds: cues?.sounds ?? [],
      smells: cues?.smells ?? [],
      temperature: cues?.temperature?.trim() || null,
      light: cues?.light?.trim() || null,
      air: cues?.air?.trim() || null,
    },
    bystanderDetail: intro?.bystanderDetail?.trim() || null,
    hasEnrichment: Boolean(intro),
  };
}

/** One-line scene-setting sentence used as the preview card heading. */
export function buildSceneExpectationLine(caseData: CaseScenario): string {
  const intro = sceneIntroductionFor(caseData);
  if (intro?.arrivalNarrative) {
    // The first clause of the generated narrative already names the place
    // and the patient's posture — that IS the scene expectation.
    return intro.arrivalNarrative;
  }
  const desc = getScenePresentationDescription(caseData);
  const location = caseData.dispatchInfo?.location?.trim();
  if (desc && location && desc.toLowerCase() !== location.toLowerCase()) {
    return `${location} — ${desc}.`;
  }
  return desc || location || 'Scene details pending';
}

/**
 * Access / extrication knowledge the student must weigh before entering.
 *
 * The scene-safety step asks "what would stop me here?" and currently only
 * reads `sceneInfo.accessIssues` — authored, dispatch-side knowledge. The
 * generated arrival layer carries its own access/extrication block (real
 * obstacles implied by the scene: slippery floor, active machinery, fallen
 * debris). Folding it in means the student's entry decision is informed by
 * the same layer that describes what they will walk into.
 *
 * Returns a flat list of access-issue strings; the caller renders them.
 */
export function sceneAccessFromIntroduction(caseData: CaseScenario): string[] {
  const intro = sceneIntroductionFor(caseData);
  const access = intro?.accessExtrication;
  if (!access) return [];
  const issues = Array.isArray(access.accessIssues) ? access.accessIssues : [];
  const note = access.note?.trim();
  return [...issues, note ? `Note: ${note}` : ''].filter(Boolean);
}

/**
 * Whether the generated arrival layer says the patient cannot be left in
 * place — i.e. extrication is required before treatment can proceed. Used by
 * the entry gate to flag a scene where the student must plan a carry/step.
 */
export function sceneRequiresExtrication(caseData: CaseScenario): boolean {
  return Boolean(sceneIntroductionFor(caseData)?.accessExtrication?.extricationNeeded);
}

export const SCENE_PREVIEW_LABEL = 'Scene preview';
export const SCENE_PREVIEW_HINT =
  'What you will walk into. Read before you press Enter Scene — the scene itself is discovered on approach, not told.';