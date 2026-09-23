import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  buildArrivalSentence,
  hasReviewedEveryHazard,
  inferSceneTone,
  sceneSurveyGateHint,
  sceneSurveySetting,
} from './SceneSurveyPanel';

function caseWith(callReason: string): CaseScenario {
  return {
    patientInfo: { age: 79, gender: 'female' },
    dispatchInfo: { callReason },
  } as CaseScenario;
}

describe('scene arrival sentence', () => {
  it('uses a dash for state-led dispatch descriptions', () => {
    expect(buildArrivalSentence(caseWith('79-year-old female, increasingly confused and unwell for 2 days')))
      .toBe('On arrival, you find a 79-year-old female — increasingly confused and unwell for 2 days.');
  });

  it('keeps symptom noun phrases after “with”', () => {
    expect(buildArrivalSentence(caseWith('79-year-old female, severe allergic reaction after eating')))
      .toBe('On arrival, you find a 79-year-old female with severe allergic reaction.');
  });

  it('uses a dash for negative ability descriptions', () => {
    const pilot = {
      ...caseWith('Son cannot breathe, using inhaler repeatedly'),
      patientInfo: { age: 19, gender: 'male' },
    } as CaseScenario;
    expect(buildArrivalSentence(pilot))
      .toBe('On arrival, you find a 19-year-old male who cannot breathe.');
  });
});

describe('hasReviewedEveryHazard', () => {
  it('requires every authored hotspot before the survey is complete', () => {
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], [])).toBe(false);
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], ['chemical-1'])).toBe(false);
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], ['chemical-1', 'access-2'])).toBe(true);
  });

  it('requires an explicit clear-scene sweep when no hotspot is authored', () => {
    expect(hasReviewedEveryHazard([], [])).toBe(false);
    expect(hasReviewedEveryHazard([], ['none'])).toBe(true);
  });

  it('does not require a hidden clear-scene filler label as a hazard id', () => {
    // "None" used to land in hazardIds via generated accessIssues while its
    // chip was filtered out — the gate could never open. After filtering,
    // the list is empty and the clear-scene button is the only requirement.
    expect(hasReviewedEveryHazard([], ['none'])).toBe(true);
    expect(hasReviewedEveryHazard(['None'], [])).toBe(false); // pre-filter behaviour, documented
  });
});

describe('sceneSurveyGateHint', () => {
  const reviewedHazard = {
    hazardIds: ['chemical'],
    selectedHazards: ['chemical'],
    resourcesRequested: [],
    mandatoryPpe: ['gloves'],
    ppeSelected: ['gloves'],
  };

  it('allows a safe declaration after the hazards were swept and PPE is on', () => {
    // Regression: the old gate refused "scene is safe" whenever any hotspot
    // existed, so Enter Scene was impossible on every hazard scene once the
    // markers were confirmed. Safe after mitigation is a valid EMS call.
    expect(sceneSurveyGateHint({ ...reviewedHazard, sceneSafe: true })).toBe('');
  });

  it('asks for support after an unsafe declaration', () => {
    expect(sceneSurveyGateHint({ ...reviewedHazard, sceneSafe: false }))
      .toBe('Request at least one additional resource.');
  });
});

describe('sceneSurveySetting', () => {
  it.each([
    ['roadside', 'road'],
    ['industrial', 'industrial'],
    ['agricultural', 'agricultural'],
    ['home', 'home'],
    ['fire', 'fire'],
    ['heat', 'heat'],
    ['public', 'public'],
    ['water', 'water'],
    ['clinic', 'medical'],
  ] as const)('maps authored %s scenes to %s survey dressing', (environmentVariant, expected) => {
    const sceneCase = {
      ...caseWith('Patient unresponsive after collapse'),
      sceneInfo: { environmentVariant },
    } as CaseScenario;

    expect(sceneSurveySetting(sceneCase)).toBe(expected);
  });

  it('leaves legacy scenes to the text fallback', () => {
    expect(sceneSurveySetting(caseWith('Motorcycle collision'))).toBeNull();
  });
});

describe('inferSceneTone public-venue vs hostile-scene split', () => {
  function publicScene(overrides: Record<string, unknown>): CaseScenario {
    return {
      patientInfo: { age: 62, gender: 'male' },
      dispatchInfo: { callReason: 'episode of facial droop and slurred speech, now resolved' },
      sceneInfo: {
        environmentVariant: 'public',
        description: 'Golf clubhouse lounge, patient sitting in a club chair',
        environment: 'Comfortable indoor golf clubhouse lounge, air conditioned',
        hazards: ['None identified'],
      },
      ...overrides,
    } as CaseScenario;
  }

  it('renders a benign public venue (golf-club TIA) as a venue, not a hostile scene', () => {
    const tone = inferSceneTone(publicScene({}));
    expect(tone.setting).toBe('venue');
    expect(tone.responderLine).not.toContain('Dynamic safety assessment');
  });

  it('still renders a genuine hostile public scene (nightclub GSW) with the threat dressing', () => {
    const tone = inferSceneTone(publicScene({
      dispatchInfo: { callReason: 'Multiple GSW victims, one with chest wounds' },
      sceneInfo: {
        environmentVariant: 'public',
        description: 'Chaotic scene, multiple casualties',
        environment: 'Indoor nightclub, loud music, flashing lights',
        hazards: ['ACTIVE SHOOTER SCENE - unsafe!', 'Multiple weapons', 'Panic'],
      },
    }));
    expect(tone.setting).toBe('public');
    expect(tone.responderLine).toContain('Dynamic safety assessment');
  });
});
