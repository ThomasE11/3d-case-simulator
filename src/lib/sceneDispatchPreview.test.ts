/**
 * sceneDispatchPreview.test.ts
 *
 * The briefing↔scene seam: the student reads the dispatch card, then taps
 * Begin Simulation and walks into the scene. Until now the arrival layer
 * only existed inside the On Arrival panel, AFTER the student was already
 * standing in it. This module renders that same content as a compact
 * preview so the student forms a scene expectation BEFORE they press Enter
 * Scene. These tests pin the pure builder.
 */

import { describe, it, expect } from 'vitest';
import { buildSceneDispatchPreview, buildSceneExpectationLine, sceneAccessFromIntroduction, sceneRequiresExtrication } from '@/lib/sceneDispatchPreview';
import type { CaseScenario } from '@/types';

const baseCase = {
  title: 'Life-Threatening Asthma Attack',
  dispatchInfo: {
    callReason: 'Son cannot breathe',
    timeOfDay: 'evening' as const,
    location: 'Villa in Al Ain',
    callerInfo: 'Mother',
  },
} as unknown as CaseScenario;

describe('buildSceneDispatchPreview', () => {
  it('returns null when a case has neither a scene description nor an intro', () => {
    const c = {
      ...baseCase,
      id: 'none-001',
      sceneInfo: { description: '', environment: 'clinic' },
    } as unknown as CaseScenario;
    expect(buildSceneDispatchPreview(c)).toBeNull();
  });

  it('returns the scene description even without an intro', () => {
    const c = {
      ...baseCase,
      id: 'basic-001',
      sceneInfo: { description: 'Villa living room', environment: 'home' },
    } as unknown as CaseScenario;
    const p = buildSceneDispatchPreview(c);
    expect(p).not.toBeNull();
    expect(p!.sceneDescription).toBe('Villa living room');
    expect(p!.hasEnrichment).toBe(false);
    expect(p!.arrivalNarrative).toBeNull();
  });

  it('folds the generated intro into the preview, including sensory cues', () => {
    const c = { ...baseCase, id: 'resp-001' } as unknown as CaseScenario;
    const p = buildSceneDispatchPreview(c);
    expect(p).not.toBeNull();
    expect(p!.hasEnrichment).toBe(true);
    expect(p!.arrivalNarrative).toBeTruthy();
    expect(p!.sensory.sounds.length).toBeGreaterThan(0);
    expect(p!.sensory.temperature).toBeTruthy();
  });

  it('returns null for a case with no sceneInfo at all', () => {
    const c = { ...baseCase, id: 'bare-001' } as unknown as CaseScenario;
    expect(buildSceneDispatchPreview(c)).toBeNull();
  });
});

describe('buildSceneExpectationLine', () => {
  it('prefers the generated arrival narrative when one exists', () => {
    const c = { ...baseCase, id: 'resp-001' } as unknown as CaseScenario;
    const line = buildSceneExpectationLine(c);
    expect(line).toContain('villa living room');
  });

  it('falls back to scene description + location when no intro exists', () => {
    const c = {
      ...baseCase,
      id: 'basic-002',
      dispatchInfo: { ...baseCase.dispatchInfo, location: 'Clinic, Al Ain' },
      sceneInfo: { description: 'Examination room', environment: 'clinic' },
    } as unknown as CaseScenario;
    const line = buildSceneExpectationLine(c);
    expect(line).toContain('Clinic, Al Ain');
    expect(line).toContain('Examination room');
  });
});

describe('sceneAccessFromIntroduction', () => {
  it('returns an empty array when the case has no generated introduction', () => {
    const c = {
      ...baseCase,
      id: 'basic-001',
      sceneInfo: { description: 'Villa living room', environment: 'home' },
    } as unknown as CaseScenario;
    expect(sceneAccessFromIntroduction(c)).toEqual([]);
  });

  it('flattens access issues and the extrication note into one list', () => {
    const c = { ...baseCase, id: 'resp-001' } as unknown as CaseScenario;
    const notes = sceneAccessFromIntroduction(c);
    expect(Array.isArray(notes)).toBe(true);
    // resp-001's generated intro has an empty accessIssues array and no note,
    // so the result is empty — the function is additive, not a substitute.
    expect(notes.length).toBe(0);
  });

  it('returns real obstacles for a scene that has them', () => {
    const c = { ...baseCase, id: 'trauma-003' } as unknown as CaseScenario;
    const notes = sceneAccessFromIntroduction(c);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.some((n) => /glass|debris|traffic/i.test(n))).toBe(true);
  });
});

describe('sceneRequiresExtrication', () => {
  it('returns false when no introduction exists', () => {
    const c = {
      ...baseCase,
      id: 'basic-001',
      sceneInfo: { description: 'Villa living room', environment: 'home' },
    } as unknown as CaseScenario;
    expect(sceneRequiresExtrication(c)).toBe(false);
  });

  it('returns false when the intro marks extrication as not needed', () => {
    const c = { ...baseCase, id: 'resp-001' } as unknown as CaseScenario;
    expect(sceneRequiresExtrication(c)).toBe(false);
  });
});