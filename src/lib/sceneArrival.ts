/**
 * Scene-arrival chyron copy — presentational D3 helper.
 *
 * Derives the broadcast lower-third text that announces the student's
 * arrival on scene. Pure and unit-testable; no rendering logic lives here.
 *
 * The chyron previously gated solely on `sceneInfo.sceneImageCaption`, so the
 * cases that have a generated arrival layer (arrivalNarrative, sensory cues,
 * access notes) but no authored scene-image caption never got a broadcast
 * lower-third at all — the richest scene description in the case was the one
 * thing the arrival chyron refused to read.
 *
 * The fallback uses the generated arrival layer's own words (never a
 * fabricated caption) so every case that describes a place gets an arrival
 * announcement, while plain clinic-bay cases with no scene at all still
 * return null.
 */
import type { CaseScenario } from '@/types';
import { getSceneIntroduction } from './sceneIntroductions';

export interface SceneArrivalCopy {
  /** Small mono kicker, e.g. "ON SCENE". */
  kicker: string;
  /** Main line — the authored scene caption (visual the student sees). */
  title: string;
  /** Optional secondary line — dispatch location when distinct from the caption. */
  sub?: string;
}

/**
 * Return the arrival-chyron copy for a case, or null when the case has no
 * scene-visualisation at all (no `sceneImageCaption` AND no generated arrival
 * layer). The chyron only fires for cases that actually walk the student into
 * a place — it must never appear for a plain clinic-bay case that has no
 * authored scene.
 *
 * When a case has both an authored caption and a generated arrival layer the
 * caption wins (it is the visual the student sees); when only the generated
 * layer exists its own `arrivalNarrative` is used verbatim, so the chyron
 * reads the same words the student heard spoken on approach.
 */
export function sceneArrivalCopy(
  caseData: CaseScenario | null | undefined,
): SceneArrivalCopy | null {
  if (!caseData) return null;
  const caption = caseData.sceneInfo?.sceneImageCaption?.trim();
  if (caption) {
    const location = caseData.dispatchInfo?.location?.trim();
    return {
      kicker: 'ON SCENE',
      title: caption,
      sub: location && location !== caption ? location : undefined,
    };
  }

  // No authored caption — fall back to the generated arrival layer's own
  // words. Never fabricate: if there is no arrival narrative either, the
  // case has no scene to announce and we return null.
  const intro = getSceneIntroduction(caseData.id);
  const narrative = intro?.arrivalNarrative?.trim();
  if (!narrative) return null;

  const location = caseData.dispatchInfo?.location?.trim();
  const air = intro?.sensoryCues?.air?.trim();
  return {
    kicker: 'ON SCENE',
    title: narrative,
    sub: air && air !== narrative ? air : (location && location !== narrative ? location : undefined),
  };
}