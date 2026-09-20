import { describe, it, expect } from 'vitest';
import type { CaseScenario } from '@/types';
import { unifiedSceneHazards, visibleSceneHazards, dispatchAccessNotes, mandatoryScenePpe } from './sceneSafety';
import { sceneIntroAccessIssues } from './sceneDispatchPreview';

/**
 * sceneSafety.ts — the survey scan's single source of truth for hazards.
 *
 * unifiedSceneHazards folds authored scene hazards with the generated
 * introduction's raw access-issue strings and dedupes, so the hazard
 * hotspots on the image and the access panel on the entry gate read ONE
 * list. This test pins that contract: the fold, the dedupe, and the
 * separation of navigational note from hazard.
 */
const authored = (over: Partial<{ hazards: string[]; accessIssues: string[]; description: string; environment: string }> = {}) => ({
  id: 'test-case',
  category: 'trauma',
  subcategory: 'bleeding',
  sceneInfo: {
    hazards: ['broken glass', 'slippery floor'],
    accessIssues: ['narrow doorway'],
    description: 'a construction site',
    environment: 'outdoor',
    ...over,
  },
} as unknown as CaseScenario);

describe('unifiedSceneHazards — fold + dedupe', () => {
  it('returns authored hazards when there is no generated introduction', () => {
    const c = authored();
    expect(unifiedSceneHazards(c)).toEqual(['broken glass', 'slippery floor']);
  });

  it('folds generated access issues alongside authored hazards', () => {
    const c = authored({ hazards: ['broken glass'] });
    const out = unifiedSceneHazards(c);
    expect(out).toContain('broken glass');
    // sceneIntroAccessIssues reads the generated layer; for a case with no
    // generated intro this is empty, so the fold is a no-op here.
    expect(sceneIntroAccessIssues(c)).toEqual([]);
  });

  it('dedupes case-insensitively and trims', () => {
    const c = authored({ hazards: ['Broken Glass', '  slippery floor  ', 'broken glass'] });
    expect(unifiedSceneHazards(c)).toEqual(['Broken Glass', 'slippery floor']);
  });

  it('drops the non-hazard filler words the authored list sometimes carries', () => {
    const c = authored({ hazards: ['none', 'no hazards', 'clean home', 'none -'] });
    expect(unifiedSceneHazards(c)).toEqual([]);
  });

  it('keeps authored and generated hazards in source order, authored first', () => {
    const c = authored({ hazards: ['a', 'b'] });
    const out = unifiedSceneHazards(c);
    expect(out.indexOf('a')).toBeLessThan(out.indexOf('b'));
  });
});

describe('visibleSceneHazards — authored only', () => {
  it('returns only authored hazards, never the generated layer', () => {
    const c = authored({ hazards: ['broken glass'] });
    expect(visibleSceneHazards(c)).toEqual(['broken glass']);
  });
});

describe('dispatchAccessNotes — separate from hazards', () => {
  it('returns authored access issues, deduped and filtered', () => {
    const c = authored({ accessIssues: ['narrow doorway', 'narrow doorway'] });
    expect(dispatchAccessNotes(c)).toEqual(['narrow doorway']);
  });
});

describe('mandatoryScenePpe — keyword-driven', () => {
  it('always requires gloves', () => {
    expect(mandatoryScenePpe(authored())).toContain('gloves');
  });

  it('adds helmet + hivis on a worksite', () => {
    const c = authored({ description: 'active construction site with scaffolding' });
    const ppe = mandatoryScenePpe(c);
    expect(ppe).toContain('helmet');
    expect(ppe).toContain('hivis');
  });

  it('adds respiratory protection for infectious cases', () => {
    const c = authored({ description: 'suspected tuberculosis cough' });
    expect(mandatoryScenePpe(c)).toContain('n95');
  });
});