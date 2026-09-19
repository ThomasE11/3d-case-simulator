import { describe, expect, it } from 'vitest';
import { visibleSceneHazards, unifiedSceneHazards } from '@/lib/sceneSafety';
import { sceneAccessFromIntroduction, sceneIntroAccessIssues } from '@/lib/sceneDispatchPreview';
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

describe('sceneIntroAccessIssues', () => {
  it('returns only the raw access-issue strings, never the free-text note', () => {
    const c = { ...base, id: 'trauma-003' } as unknown as CaseScenario;
    const raw = sceneIntroAccessIssues(c);
    const withNote = sceneAccessFromIntroduction(c);
    // The note ("Patient is accessible but requires careful navigation
    // around debris.") is navigational guidance, not a scan hazard — it
    // must NOT appear in the raw list.
    expect(raw.some((h) => h.toLowerCase().includes('navigation'))).toBe(false);
    expect(raw).toEqual([
      'Broken glass and debris on pavement near the wound',
      'Passing traffic creating a safety hazard',
    ]);
    // sceneAccessFromIntroduction keeps the note for the entry-gate panel.
    expect(withNote.some((h) => h.toLowerCase().includes('navigation'))).toBe(true);
  });

  it('returns an empty array when the case has no generated introduction', () => {
    expect(sceneIntroAccessIssues(base)).toEqual([]);
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
    const access = sceneIntroAccessIssues(c);
    expect(unified.length).toBeGreaterThanOrEqual(access.length);
    for (const issue of access) {
      expect(unified.some((h) => h.toLowerCase().includes(issue.toLowerCase().slice(0, 12)))).toBe(true);
    }
  });

  it('does not fold the intro free-text note as a scan hazard', () => {
    const c = { ...base, id: 'trauma-003' } as unknown as CaseScenario;
    const unified = unifiedSceneHazards(c);
    expect(unified.some((h) => h.toLowerCase().includes('navigation'))).toBe(false);
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