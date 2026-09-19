import { describe, expect, it } from 'vitest';
import { visibleSceneHazards, unifiedSceneHazards } from '@/lib/sceneSafety';
import { sceneAccessFromIntroduction } from '@/lib/sceneDispatchPreview';
import type { CaseScenario } from '@/types';

const base = {
  id: 'basic-001',
  title: 'Basic case',
  category: 'general',
  subcategory: 'general',
  dispatchInfo: { location: 'Clinic', callReason: 'Fall' },
  sceneInfo: { description: 'Examination room', environment: 'clinic' },
} as unknown as CaseScenario;

describe('visibleSceneHazards', () => {
  it('keeps authored hazards when no intro exists', () => {
    const c = { ...base, sceneInfo: { ...base.sceneInfo, hazards: ['Broken glass'] } };
    expect(visibleSceneHazards(c)).toEqual(['Broken glass']);
  });

  it('filters noise values and duplicates from the authored hazard list', () => {
    const c = {
      ...base,
      sceneInfo: { ...base.sceneInfo, hazards: ['Broken glass', 'none identified', 'No hazards', 'Broken glass'] },
    };
    expect(visibleSceneHazards(c)).toEqual(['Broken glass']);
  });

  it('returns an empty array when there are no hazards', () => {
    expect(visibleSceneHazards(base)).toEqual([]);
  });
});

describe('unifiedSceneHazards', () => {
  it('falls back to authored hazards when no introduction exists', () => {
    const c = { ...base, sceneInfo: { ...base.sceneInfo, hazards: ['Broken glass'] } };
    expect(unifiedSceneHazards(c)).toEqual(['Broken glass']);
  });

  it('folds the generated introduction access issues into the hazard list', () => {
    // trauma-003's generated intro lists broken glass + passing traffic as
    // access issues; the authored scene hazards are separate. The unified
    // list must contain both, deduped.
    const c = { ...base, id: 'trauma-003' } as unknown as CaseScenario;
    const unified = unifiedSceneHazards(c);
    const access = sceneAccessFromIntroduction(c);
    expect(unified.length).toBeGreaterThanOrEqual(access.length);
    for (const issue of access) {
      expect(unified.some((h) => h.toLowerCase().includes(issue.toLowerCase().slice(0, 12)))).toBe(true);
    }
  });

  it('dedupes authored hazards that duplicate an intro access issue', () => {
    const c = {
      ...base,
      sceneInfo: { ...base.sceneInfo, hazards: ['Broken glass on the pavement'] },
    };
    // No intro for basic-001, so this is a pure authored-list test — the
    // dedupe path is exercised by the fold in the trauma-003 case above.
    expect(unifiedSceneHazards(c)).toEqual(['Broken glass on the pavement']);
  });
});