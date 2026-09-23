import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  generateCollateralResponse,
  generatePatientResponse,
  pickCollateralVoice,
  sceneHasAskableBystander,
} from './historyTaking';

function fakeCase(overrides: Partial<CaseScenario> = {}): CaseScenario {
  return {
    history: {
      allergies: ['NKDA'],
      medications: [],
      medicalConditions: [],
      eventsLeading: 'Sudden shortness of breath twenty minutes ago while watching television.',
    },
    sceneInfo: { bystanders: 'Wife present and helpful' },
    dispatchInfo: { callReason: 'Severe shortness of breath' },
    ...overrides,
  } as unknown as CaseScenario;
}

describe('sceneHasAskableBystander', () => {
  it('treats named witnesses as askable', () => {
    expect(sceneHasAskableBystander(fakeCase())).toBe(true);
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'Security guard who called ambulance' },
    } as Partial<CaseScenario>))).toBe(true);
  });

  it('rejects empty, missing and explicit none fields', () => {
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'None' },
    } as Partial<CaseScenario>))).toBe(false);
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'nobody on scene' },
    } as Partial<CaseScenario>))).toBe(false);
    expect(sceneHasAskableBystander({} as CaseScenario)).toBe(false);
  });
});

describe('generateCollateralResponse', () => {
  it('lets a named bystander answer even when the patient can still talk', () => {
    const answer = generateCollateralResponse(fakeCase(), 'events');
    expect(answer).toMatch(/His wife/i);
    expect(answer).toMatch(/Sudden shortness of breath/i);
  });

  it('refuses collateral when the scene is unattended', () => {
    const answer = generateCollateralResponse(fakeCase({
      sceneInfo: { bystanders: 'None' },
    } as Partial<CaseScenario>), 'events');
    expect(answer).toMatch(/no-one here/i);
  });

  it('bystander never invents patient pain and redirects to observed facts', () => {
    for (const cat of ['opqrst-region', 'opqrst-quality', 'opqrst-severity', 'pain-current'] as const) {
      const answer = generateCollateralResponse(fakeCase(), cat);
      expect(answer).toMatch(/can't speak for their pain/i);
      expect(answer).not.toMatch(/crushing|stabbing|\d+\s*out of 10/i);
    }
  });

  it('bystander unknown category yields an honest re-ask, never null', () => {
    const answer = generateCollateralResponse(fakeCase(), 'unknown');
    expect(answer).not.toBeNull();
    expect(answer).toMatch(/what do you want to know about them/i);
  });

  it('labels collateral voices beyond the generic bystander', () => {
    expect(pickCollateralVoice('Neighbour heard the fall')).toMatch(/neighbour/i);
    expect(pickCollateralVoice('Cyclist stopped to help')).toMatch(/passerby|witness/i);
    expect(pickCollateralVoice('Wife called 999')).toMatch(/his wife/i);
    expect(pickCollateralVoice('Police officer on scene')).toMatch(/police/i);
  });
});

describe('generatePatientResponse', () => {
  it('fragments speech when the patient is breathless', () => {
    const answer = generatePatientResponse(fakeCase(), 'introduction', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });
    expect(answer).toMatch(/\.\.\./);
    expect(answer?.toLowerCase()).toMatch(/can't|breath/);
  });

  it('keeps a full greeting when the patient can talk', () => {
    const answer = generatePatientResponse(fakeCase(), 'introduction', {
      severity: 'mild',
      altered: false,
      breathless: false,
    });
    expect(answer).toMatch(/hello|hi|thank/i);
    expect(answer).not.toMatch(/can't\.\.\. talk/i);
  });

  it('fragments OPQRST severity when breathless (severe asthma)', () => {
    const answer = generatePatientResponse(fakeCase({
      vitalSignsProgression: {
        initial: { bp: '120/80', pulse: 100, respiration: 32, spo2: 88, gcs: 14, painScore: 8 },
      },
    } as Partial<CaseScenario>), 'opqrst-severity', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });
    expect(answer).toMatch(/\.\.\./);
    expect(answer?.toLowerCase()).toMatch(/can't|breath|out of 10|nine|eight/);
  });

  it('does not invent a pain score for severe asthma with no authored pain', () => {
    const answer = generatePatientResponse(fakeCase({
      expectedFindings: { mostLikelyDiagnosis: 'Life-threatening asthma' },
      vitalSignsProgression: {
        initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 14 },
      },
    } as Partial<CaseScenario>), 'opqrst-severity', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });

    expect(answer).toMatch(/no pain/i);
    expect(answer).toMatch(/\.\.\./);
    expect(answer).not.toMatch(/eight|nine|\b[2-9]\s*out of 10/i);
  });

  it('answers pain location from the authored examination, including laterality', () => {
    const answer = generatePatientResponse(fakeCase({
      dispatchInfo: { callReason: 'Older patient fallen and unable to get up' },
      secondarySurvey: {
        head: [], neck: [], chest: [], abdomen: [], pelvis: [], posterior: ['Mild lower back pain'],
        extremities: ['Right hip pain', 'Movement possible but painful at right hip'], neurological: [],
      },
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Tripped on a rug and landed on the right hip.',
      },
    } as unknown as Partial<CaseScenario>), 'opqrst-region', {
      severity: 'mild', altered: false, breathless: false,
    });

    expect(answer).toMatch(/right hip/i);
    expect(answer).not.toMatch(/all over/i);
  });

  it('does not invent pain quality from the diagnosis when the case authors no quality cues', () => {
    const answer = generatePatientResponse(fakeCase({
      expectedFindings: { mostLikelyDiagnosis: 'Inferior STEMI' },
      initialPresentation: { generalImpression: 'Pale and sweaty', appearance: 'holding chest' },
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Sudden central chest discomfort.',
      },
    } as unknown as Partial<CaseScenario>), 'opqrst-quality', {
      severity: 'severe', altered: false, breathless: false,
    });
    // No authored "crushing/pressure/sharp" word → honest IDK, not a fabricated character
    expect(answer).toMatch(/hard to (describe|put into words)|aching|dull/i);
    expect(answer).not.toMatch(/elephant|an elephant|crushing|stabbing/i);
  });

  it('never fabricates an onset time when eventsLeading has no parseable time', () => {
    const answer = generatePatientResponse(fakeCase({
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Gradual worsening of breathlessness.',
      },
    } as unknown as Partial<CaseScenario>), 'opqrst-onset', {
      severity: 'mild', altered: false, breathless: false,
    });
    expect(answer).not.toMatch(/half an hour ago/i);
    expect(answer).toMatch(/not sure|couldn't tell|don't remember|don't really remember/i);
  });

  it('gives an honest uncertain answer for last meal when not authored', () => {
    const answer = generatePatientResponse(fakeCase({
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Felt dizzy.',
        // lastMeal intentionally absent
      },
    } as unknown as Partial<CaseScenario>), 'last-meal', {
      severity: 'mild', altered: false, breathless: false,
    });
    expect(answer).toMatch(/can't remember|not sure|couldn't tell/i);
    expect(answer).not.toMatch(/sometime earlier/i);
  });

  it('reports only authored pain radiation instead of inferring it from a cardiac label', () => {
    const withoutRadiation = generatePatientResponse(fakeCase({
      expectedFindings: { mostLikelyDiagnosis: 'Stable angina' },
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Central chest pressure began while walking and improved with rest.',
      },
    } as unknown as Partial<CaseScenario>), 'opqrst-radiation', {
      severity: 'mild', altered: false, breathless: false,
    });
    const withRadiation = generatePatientResponse(fakeCase({
      expectedFindings: { mostLikelyDiagnosis: 'Anterior STEMI' },
      history: {
        allergies: [], medications: [], medicalConditions: [], surgicalHistory: [],
        eventsLeading: 'Crushing central chest pressure radiating to left arm and jaw.',
      },
    } as unknown as Partial<CaseScenario>), 'opqrst-radiation', {
      severity: 'severe', altered: false, breathless: false,
    });

    expect(withoutRadiation).toMatch(/stays in the one spot/i);
    expect(withoutRadiation).not.toMatch(/left arm|jaw/i);
    expect(withRadiation).toMatch(/left arm and jaw/i);
  });
});

describe('patient voice is first-person, never the caller script', () => {
  it('does not echo "Wife having panic attack" back as the patient', () => {
    const c = fakeCase({
      dispatchInfo: {
        callReason: 'Wife having panic attack, cannot breathe, chest pain',
        timeOfDay: 'evening',
        location: 'Apartment in Jumeirah, Dubai',
        callerInfo: 'Husband',
      },
      initialPresentation: {
        generalImpression: 'Young female, visibly distressed, breathing rapidly',
        appearance: 'Anxious, tearful, hyperventilating',
        position: 'Sitting on floor against wall, knees drawn up',
        consciousness: 'Alert but highly anxious',
      },
      history: {
        eventsLeading: 'Felt chest tightness, heart racing, could not catch breath.',
        medications: [],
        allergies: ['No known allergies'],
        medicalConditions: ['Anxiety disorder'],
        surgicalHistory: ['None'],
        lastMeal: 'Coffee only',
      },
    });
    const answer = generatePatientResponse(c, 'signs-symptoms', {
      severity: 'severe', altered: false, breathless: true,
    });
    expect(answer).toBeTruthy();
    expect(answer!.toLowerCase()).not.toContain('wife');
    expect(answer!.toLowerCase()).not.toContain('husband');
    // Breathless patient still owns the symptom in first person.
    expect(answer!.toLowerCase()).toMatch(/breath|chest|can.?t/);
  });
});

