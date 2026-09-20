import { describe, it, expect } from 'vitest';
import { sceneArrivalCopy } from './sceneArrival';
import { getSceneIntroduction } from './sceneIntroductions';

/**
 * Scene-arrival chyron copy — regression guard.
 *
 * The chyron previously gated solely on `sceneInfo.sceneImageCaption`, so the
 * 89 cases that have a generated arrival layer (arrivalNarrative, sensory
 * cues, access notes) but no authored scene-image caption never got a
 * broadcast lower-third at all — the richest scene description in the case
 * was the one thing the arrival chyron refused to read.
 *
 * The fallback uses the generated arrival layer's own words (never a
 * fabricated caption) so every case that describes a place gets an arrival
 * announcement, while plain clinic-bay cases with no scene at all still
 * return null.
 */
describe('sceneArrivalCopy', () => {
  it('returns null when the case has no scene image caption AND no arrival layer', () => {
    expect(sceneArrivalCopy({ id: 'plain', sceneInfo: {} } as any)).toBeNull();
  });

  it('prefers the authored scene-image caption when both are present', () => {
    const c = {
      id: 'resp-001',
      sceneInfo: { sceneImageCaption: 'Villa living room — Al Ain' },
    } as any;
    const copy = sceneArrivalCopy(c);
    expect(copy?.title).toBe('Villa living room — Al Ain');
    expect(copy?.kicker).toBe('ON SCENE');
  });

  it('falls back to the generated arrival narrative when there is no caption', () => {
    const intro = getSceneIntroduction('resp-001');
    // resp-001 is the flagship case — it MUST have an arrival layer.
    expect(intro).not.toBeNull();
    expect(intro?.arrivalNarrative?.length).toBeGreaterThan(0);

    const c = { id: 'resp-001', sceneInfo: {} } as any;
    const copy = sceneArrivalCopy(c);
    expect(copy).not.toBeNull();
    // The title must be the generated narrative's own words, not a guess.
    expect(copy?.title).toBe(intro?.arrivalNarrative);
  });

  it('uses the arrival air cue as the sub-line when no distinct location exists', () => {
    const intro = getSceneIntroduction('resp-001');
    const c = { id: 'resp-001', sceneInfo: {} } as any;
    const copy = sceneArrivalCopy(c);
    const air = intro?.sensoryCues?.air;
    if (air) {
      expect(copy?.sub).toBe(air);
    }
  });

  it('never fabricates a caption — a case with no scene at all stays null', () => {
    // A clinic-bay case with no sceneInfo and no generated intro.
    expect(sceneArrivalCopy({ id: 'does-not-exist', sceneInfo: undefined } as any)).toBeNull();
  });
});