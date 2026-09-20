import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  visibleSceneHazards,
  unifiedSceneHazards,
  dispatchAccessNotes,
  mandatoryScenePpe,
  sceneIntroAccessIssues,
  sceneIntroHazards,
} from './sceneSafety';

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

  it('folds an agitated-bystander signal out of the generated intro', () => {
    // psych-001's generated arrival layer describes a husband shouting and
    // arguing at the patient's side — that is a scene-safety signal the
    // "D" step must teach, and it has no authored hazard to carry it.
    const c = { ...authored(), id: 'psych-001' } as unknown as CaseScenario;
    const out = unifiedSceneHazards(c);
    expect(out).toContain('Agitated / aggressive bystander');
  });

  it('does NOT invent an agitated bystander for a calm scene', () => {
    // metab-002's intro describes a friend wringing their hands — worried,
    // not a threat. The signal must not fire.
    const c = { ...authored(), id: 'metab-002' } as unknown as CaseScenario;
    const out = unifiedSceneHazards(c);
    expect(out).not.toContain('Agitated / aggressive bystander');
  });
});

describe('visibleSceneHazards — authored only', () => {
  it('returns only authored hazards, never the generated layer', () => {
    const c = authored({ hazards: ['broken glass'] });
    expect(visibleSceneHazards(c)).toEqual(['broken glass']);
  });
});

describe('sceneIntroAccessIssues — raw access obstacles only', () => {
  it('returns only the raw access-issue strings, never the free-text note', () => {
    const c = { ...authored(), id: 'resp-001' } as unknown as CaseScenario;
    const raw = sceneIntroAccessIssues(c);
    // The note ("Patient is seated upright on a sofa; no physical removal
    // required.") is navigational guidance, not a scan hazard — it must NOT
    // appear in the raw list.
    expect(raw.some((h) => h.toLowerCase().includes('removal'))).toBe(false);
    expect(raw).toEqual(['limited working space']);
  });

  it('returns an empty array when the case has no generated introduction', () => {
    expect(sceneIntroAccessIssues(authored())).toEqual([]);
  });
});

describe('sceneIntroHazards — bystander-safety signals', () => {
  it('fires on shouting / arguing / threatening bystander language', () => {
    const c = {
      ...authored(),
      id: 'psych-001',
    } as unknown as CaseScenario;
    expect(sceneIntroHazards(c)).toEqual(['Agitated / aggressive bystander']);
  });

  it('does not fire on worried-but-calm bystander language', () => {
    const c = {
      ...authored(),
      id: 'metab-002',
    } as unknown as CaseScenario;
    expect(sceneIntroHazards(c)).toEqual([]);
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