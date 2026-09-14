import { describe, it, expect } from 'vitest';
import {
  phaseTransitionKey,
  sceneEntryOrigin,
  VILLA_DOORWAY,
  phaseMotionVariant,
  type CinematicPhase,
  type PhaseMotionVariant,
} from './cinematicPhase';
import { RESP001_VILLA_ENTRY } from './cameraOrbitSafety';

describe('phaseTransitionKey', () => {
  it('crossfades briefing → scene → treat as distinct keys', () => {
    expect(phaseTransitionKey('prebriefing')).toBe('prebriefing');
    expect(phaseTransitionKey('scene-survey')).toBe('scene-survey');
    expect(phaseTransitionKey('vitals')).toBe('live-treatment');
    expect(phaseTransitionKey('prebriefing')).not.toBe(phaseTransitionKey('scene-survey'));
    expect(phaseTransitionKey('scene-survey')).not.toBe(phaseTransitionKey('vitals'));
  });

  it('keeps vitals and case on the same key so the monitor never remounts', () => {
    expect(phaseTransitionKey('vitals')).toBe(phaseTransitionKey('case'));
    expect(phaseTransitionKey('vitals')).toBe('live-treatment');
  });

  it('gives select and postcase their own keys', () => {
    expect(phaseTransitionKey('select')).toBe('select');
    expect(phaseTransitionKey('postcase')).toBe('postcase');
  });
});

describe('sceneEntryOrigin', () => {
  it('starts the villa dolly on the physical entry landing', () => {
    expect(sceneEntryOrigin('home')).toEqual(VILLA_DOORWAY);
    expect(VILLA_DOORWAY[0]).toBe(RESP001_VILLA_ENTRY.x);
    expect(VILLA_DOORWAY[2]).toBe(RESP001_VILLA_ENTRY.arrivalZ);
  });

  it('gives every scene variant a real doorway dolly, clinic stays on the short pull-back', () => {
    expect(sceneEntryOrigin('home')).toEqual(VILLA_DOORWAY);
    expect(sceneEntryOrigin('public')).toEqual([0, 1.9, 3.6]);
    expect(sceneEntryOrigin('roadside')).toEqual([0.4, 2.4, 4.2]);
    expect(sceneEntryOrigin('industrial')).toEqual([1.4, 2.4, 3.6]);
    // Clinical bay keeps the short pull-back: the student is already in the room.
    expect(sceneEntryOrigin('clinic')).toBeUndefined();
    expect(sceneEntryOrigin(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// D3 regression: phase-specific motion variants
// ---------------------------------------------------------------------------

const ALL_PHASES: CinematicPhase[] = [
  'select', 'prebriefing', 'scene-survey', 'vitals', 'case', 'postcase',
];

/** Every variant must have well-formed initial/animate/exit + transition. */
function durationOf(v: PhaseMotionVariant): number {
  return typeof v.transition.duration === 'number' ? v.transition.duration : 0;
}

function assertVariantShape(v: PhaseMotionVariant) {
  expect(v.initial).toBeDefined();
  expect(v.animate).toBeDefined();
  expect(v.exit).toBeDefined();
  expect(v.transition).toBeDefined();
  expect(durationOf(v)).toBeGreaterThan(0);
  // animate always fully visible
  expect(v.animate.opacity).toBe(1);
}

describe('phaseMotionVariant', () => {
  it('returns a well-formed variant for every phase', () => {
    for (const p of ALL_PHASES) {
      assertVariantShape(phaseMotionVariant(p, false));
    }
  });

  it('gives prebriefing a distinct exit feel (scale or blur)', () => {
    const { exit } = phaseMotionVariant('prebriefing', false);
    const exitScale = typeof exit.scale === 'number' ? exit.scale : undefined;
    const exitFilter = typeof exit.filter === 'string' ? exit.filter : undefined;
    const hasScaleOrBlur =
      (exitScale !== undefined && exitScale < 1) ||
      exitFilter?.includes('blur') === true;
    expect(hasScaleOrBlur).toBe(true);
  });

  it('gives live-treatment a longer duration than select (cinematic entrance feel)', () => {
    const selectDur = durationOf(phaseMotionVariant('select', false));
    const liveDur = durationOf(phaseMotionVariant('vitals', false));
    expect(liveDur).toBeGreaterThan(selectDur);
  });

  it('vitals and case share the same variant (LIFEPAK stays mounted)', () => {
    const vitals = phaseMotionVariant('vitals', false);
    const caseV = phaseMotionVariant('case', false);
    expect(vitals).toEqual(caseV);
  });

  it('each phase starts transparent or off-position, animates to fully visible', () => {
    for (const p of ALL_PHASES) {
      const v = phaseMotionVariant(p, false);
      // initial opacity should be 0 or animate.y should differ from initial.y
      const startsHidden = v.initial.opacity === 0 ||
        (v.initial.y !== undefined && v.initial.y !== 0);
      expect(startsHidden).toBe(true);
      expect(v.animate.opacity).toBe(1);
      // animate settles at y=0 (no residual offset)
      expect(v.animate.y ?? 0).toBe(0);
    }
  });

  // Reduced-motion safety
  describe('reduced motion', () => {
    it('collapses all phases to instant (duration ≤ 0.01s)', () => {
      for (const p of ALL_PHASES) {
        const v = phaseMotionVariant(p, true);
        expect(durationOf(v)).toBeLessThanOrEqual(0.01);
      }
    });

    it('starts fully visible (no visual flash)', () => {
      for (const p of ALL_PHASES) {
        const v = phaseMotionVariant(p, true);
        expect(v.initial.opacity).toBe(1);
        expect(v.animate.opacity).toBe(1);
      }
    });

    it('has no scale, y-offset, or filter in initial/animate', () => {
      for (const p of ALL_PHASES) {
        const v = phaseMotionVariant(p, true);
        expect(v.initial.y).toBeUndefined();
        expect(v.initial.scale).toBeUndefined();
        expect(v.initial.filter).toBeUndefined();
        expect(v.animate.y).toBeUndefined();
        expect(v.animate.scale).toBeUndefined();
        expect(v.animate.filter).toBeUndefined();
      }
    });
  });

  // Guard: no phase accidentally gets zero-duration in normal mode
  it('normal-mode durations are all > 100ms (perceptible crossfade)', () => {
    for (const p of ALL_PHASES) {
      const v = phaseMotionVariant(p, false);
      expect(durationOf(v)).toBeGreaterThanOrEqual(0.1);
    }
  });
});
