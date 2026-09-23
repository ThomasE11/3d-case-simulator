import type { CaseScenario } from '@/types';
import { sceneIntroductionFor } from '@/lib/sceneIntroductions';

/**
 * Labels that must never become required hazard hotspots.
 *
 * Two families:
 *  1. Clear-scene filler ("None", "no hazards") — authored lists and some
 *     generated accessIssues carry these. Folding them into the scan made
 *     Enter Scene unsatisfiable: the chip is hidden as a no-hazard label and
 *     the "None identified" sweep button is hidden because a hotspot exists.
 *  2. Patient posture / clinical state ("patient seated at desk") — size-up
 *     copy, not an environmental hazard the student tags on the photograph.
 *     Exception: entrapment / submersion wording is a real scene hazard.
 */
export function isFillerHazardLabel(label: string): boolean {
  const value = label.trim();
  if (!value) return true;
  if (/^(none|none identified|no obvious hazards?|no hazards?|none -|clean home)/i.test(value)) return true;
  if (/^patient\b/i.test(value) && !/submerged|trapped|entrap|crush|unstable vehicle/i.test(value)) {
    return true;
  }
  return false;
}

function uniqueMeaningful(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  return values
    .filter((value): value is string => Boolean(value?.trim()))
    .filter((value) => !isFillerHazardLabel(value))
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
 * Raw access-issue strings from the generated introduction — the obstacle
 * list only, without the free-text note. Used by the scene-survey hazard
 * scan, where the note ("requires careful navigation around debris") is
 * navigational guidance rather than a hazard the student identifies in
 * the image. Inlined here (rather than imported from sceneDispatchPreview)
 * to keep the dependency graph acyclic — sceneDispatchPreview reads the
 * same introduction layer and must not depend on the hazard scan.
 */
export function sceneIntroAccessIssues(caseData: CaseScenario): string[] {
  const intro = sceneIntroductionFor(caseData);
  const access = intro?.accessExtrication;
  if (!access) return [];
  return (Array.isArray(access.accessIssues) ? access.accessIssues : [])
    .filter((value): value is string => Boolean(value?.trim()));
}

/**
 * Scene-safety hazards the student can identify from the generated arrival
 * layer's own words — currently, an agitated or aggressive bystander.
 *
 * The "D" in DRSABCD asks whether the environment is safe to approach, and
 * an indoor scene with no authored hazards and no access obstacles still
 * has something to teach when the arrival layer describes a person shouting,
 * arguing, or pacing aggressively at the patient's side. This reads that
 * signal out of the intro's own text (bystanderDetail + sensory cues) and
 * never invents it: the generator only writes an agitated bystander when
 * the case facts carry one, so the regex is a reader, not a fabricator.
 */
export function sceneIntroHazards(caseData: CaseScenario): string[] {
  const intro = sceneIntroductionFor(caseData);
  if (!intro) return [];

  const text = [
    intro.bystanderDetail,
    ...(intro.sensoryCues?.sounds ?? []),
    ...(intro.sensoryCues?.smells ?? []),
  ].filter(Boolean).join(' ').toLowerCase();

  if (/shout|argu|agitat|aggress|threat|weapon|violence|panic|frustrated voice|tense and voice|shouting/.test(text)) {
    return ['Agitated / aggressive bystander'];
  }
  return [];
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
    ...sceneIntroHazards(caseData),
  ]) {
    const trimmed = hazard.trim();
    if (!trimmed || isFillerHazardLabel(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
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
    ...(unifiedSceneHazards(caseData) ?? []),
  ].filter(Boolean).join(' ').toLowerCase();

  // Gloves always. At most ONE scene-specific extra — a long mandatory PPE
  // shopping list blocked Enter Scene after the student had already made a
  // sensible call ("I put on all my protection" and still could not enter).
  const required = new Set<string>(['gloves']);
  if (/chemical|hazmat|contamination|pesticide|organophosphate/.test(text)) {
    required.add('mask');
  } else if (/respiratory|infect|airborne|mening|tuberculosis|covid/.test(text)) {
    required.add('n95');
  } else if (/construction|worksite|hard hat|industrial|factory|scaffold/.test(text)) {
    required.add('helmet');
  } else if (/traffic|roadside|highway|motorway|collision|\brtc\b|crash/.test(text)) {
    required.add('hivis');
  } else if (/trauma|burn|bleed|blood|obstet|delivery/.test(text)) {
    required.add('eye');
  }
  return [...required];
}


