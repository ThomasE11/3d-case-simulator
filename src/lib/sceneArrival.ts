/**
 * Scene-arrival chyron copy — presentational D3 helper.
 *
 * Derives the broadcast lower-third text that announces the student's
 * arrival on scene, keyed to the case's authored scene-image caption.
 * Pure and unit-testable; no rendering logic lives here.
 */
import type { CaseScenario } from '@/types';

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
 * scene-visualisation (no `sceneImageCaption`). The chyron only fires for
 * cases that actually walk the student into a place — it must never appear
 * for a plain clinic-bay case that has no authored scene.
 */
export function sceneArrivalCopy(
  caseData: CaseScenario | null | undefined,
): SceneArrivalCopy | null {
  if (!caseData) return null;
  const caption = caseData.sceneInfo?.sceneImageCaption?.trim();
  if (!caption) return null;

  const location = caseData.dispatchInfo?.location?.trim();
  return {
    kicker: 'ON SCENE',
    title: caption,
    sub: location && location !== caption ? location : undefined,
  };
}
