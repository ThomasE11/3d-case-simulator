import type { CaseScenario } from '@/types';
import { sceneIntroAccessIssues } from '@/lib/sceneDispatchPreview';

function uniqueMeaningful(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  return values
    .filter((value): value is string => Boolean(value?.trim()))
    .filter((value) => !/^(none|none identified|no obvious hazards?|no hazards?|none -|clean home)/i.test(value.trim()))
    .filter((value) => {
      const key = value.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Hazards the student can reasonably be expected to identify in the image. */
export function visibleSceneHazards(caseData: CaseScenario): string[] {
  return uniqueMeaningful(caseData.sceneInfo?.hazards ?? []);
}

/**
 * Unified hazard list for the survey's scan step. Folds the authored scene
 * hazards with the generated introduction's access issues (broken glass,
 * passing traffic, unstable flooring — the same class of obstacle) and
 * dedupes, so the hazard hotspots on the image and the access panel on the
 * entry gate read ONE source of truth. Falls back to authored hazards only
 * when no introduction exists.
 *
 * Only the raw access-issue strings are folded — not the intro's free-text
 * note, which is navigational guidance ("requires careful navigation around
 * debris"), not a hazard the student scans for.
 */
export function unifiedSceneHazards(caseData: CaseScenario): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const hazard of [
    ...visibleSceneHazards(caseData),
    ...sceneIntroAccessIssues(caseData),
  ]) {
    const key = hazard.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(hazard.trim());
  }
  return out;
}

/** Dispatch/logistical knowledge, kept separate from the visual hazard task. */
export function dispatchAccessNotes(caseData: CaseScenario): string[] {
  return uniqueMeaningful(caseData.sceneInfo?.accessIssues ?? []);
}

/** PPE that is mandatory before entering this specific scene. */
export function mandatoryScenePpe(caseData: CaseScenario): string[] {
  const text = [
    caseData.category,
    caseData.subcategory,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
    ...(caseData.sceneInfo?.hazards ?? []),
  ].filter(Boolean).join(' ').toLowerCase();

  const required = new Set<string>(['gloves']);
  if (/construction|worksite|active site|hard hat|industrial|factory|scaffold/.test(text)) {
    required.add('helmet');
    required.add('hivis');
  }
  if (/chemical|hazmat|contamination|pesticide|organophosphate/.test(text)) {
    required.add('mask');
    required.add('eye');
    required.add('gown');
  } else if (/respiratory|infect|airborne|mening|tuberculosis|covid/.test(text)) {
    required.add('n95');
    required.add('eye');
  } else if (/trauma|burn|bleed|blood|obstet|delivery/.test(text)) {
    required.add('eye');
  }
  return [...required];
}
