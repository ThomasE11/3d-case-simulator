import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { firstYearCases } from '@/data/firstYearCases';
import { additionalTraumaCases } from '@/data/additionalCases';
import { allCases } from '@/data/cases';
import {
  matchRealismScenarios,
  deriveScenarioTreatmentResponses,
  deriveScenarioVisuals,
  deriveRealismScenarioState,
  prospectiveEquipmentAnchorsForCase,
  REALISM_SCENARIOS,
} from './patientRealismScenarios';

/* ------------------------------------------------------------------ */
/*  Minimal case factories                                            */
/* ------------------------------------------------------------------ */

const baseCase = (overrides: Partial<CaseScenario> & { id: string; title: string }): CaseScenario =>
  ({
    version: 1,
    createdAt: '2026-07-06T00:00:00.000Z',
    updatedAt: '2026-07-06T00:00:00.000Z',
    category: 'general',
    subcategory: 'assessment',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['2nd-year'],
    dispatchInfo: { callReason: 'Patient unwell', timeOfDay: 'afternoon', location: 'Home', callerInfo: 'Family' },
    sceneInfo: { description: 'Home setting', environment: 'Indoor', hazards: [], bystanders: 'Family present' },
    initialPresentation: { generalImpression: 'Patient appears unwell', appearance: 'Pale', position: 'Supine', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: [] },
      circulation: { pulseRate: 80, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [], lastMeal: 'Unknown', eventsLeading: 'Unknown' },
    expectedFindings: { keyObservations: [], redFlags: [], differentialDiagnoses: [], mostLikelyDiagnosis: 'Undifferentiated' },
    patientInfo: { age: 40, gender: 'male', weight: 70, language: 'English' },
    vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 18, spo2: 97, gcs: 15, bloodGlucose: 5.0 } },
    ...overrides,
  }) as CaseScenario;

/* ------------------------------------------------------------------ */
/*  Sentinel scenario existence                                        */
/* ------------------------------------------------------------------ */

describe('REALISM_SCENARIOS', () => {
  it('contains at least 8 sentinel scenarios', () => {
    expect(REALISM_SCENARIOS.length).toBeGreaterThanOrEqual(8);
  });

  it('has unique scenario IDs', () => {
    const ids = REALISM_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes all required problem families', () => {
    const families = REALISM_SCENARIOS.map(s => s.family);
    expect(families).toContain('respiratory');
    expect(families).toContain('toxicology');
    expect(families).toContain('metabolic');
    expect(families).toContain('cardiac');
    expect(families).toContain('neurology');
    expect(families).toContain('trauma');
    expect(families).toContain('burns');
  });

  it('each scenario has match keywords', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.match.length).toBeGreaterThan(0);
      expect(scenario.priority).toBeGreaterThan(0);
    }
  });

  it('each scenario has immediateVisuals', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.immediateVisuals.length).toBeGreaterThan(0);
    }
  });

  it('each scenario has treatmentResponses', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.treatmentResponses.length).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  Mapping: case text → scenario                                      */
/* ------------------------------------------------------------------ */

describe('matchRealismScenarios', () => {
  it('maps asthma case to respiratory scenario', () => {
    const scenario = baseCase({
      id: 'test-asthma',
      title: 'Asthma attack',
      category: 'respiratory',
      subcategory: 'asthma',
      vitalSignsProgression: {
        initial: { bp: '130/80', pulse: 110, respiration: 30, spo2: 88, gcs: 15, bloodGlucose: 5.0 },
      },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze audible', 'Accessory muscle use'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze', 'Reduced air entry'], interventions: [], auscultation: ['Diffuse expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Tripod position, accessory muscle use', appearance: 'Diaphoretic, distressed', position: 'Sitting upright, tripod', consciousness: 'Alert' },
      dispatchInfo: { callReason: 'Short of breath', timeOfDay: 'afternoon', location: 'Home', callerInfo: 'Family' },
    });

    const matched = matchRealismScenarios(scenario);
    const respiratoryScenario = matched.find(s => s.family === 'respiratory');
    expect(respiratoryScenario).toBeDefined();
    expect(respiratoryScenario!.id).toBe('respiratory-bronchospasm');
    expect(respiratoryScenario!.activeProblems).toContain('bronchospasm');
  });

  it('describes a confirmed arrest as arrest rather than possible ACS', () => {
    const arrest = firstYearCases.find(caseData => caseData.id === 'y1-014')!;
    const state = deriveRealismScenarioState({
      caseData: arrest,
      vitals: arrest.vitalSignsProgression.initial,
    });

    expect(state.activeProblems[0]).toBe('cardiac arrest — no pulse or normal breathing');
    expect(state.activeProblems).toContain('attach pads, analyse rhythm, then shock only if indicated');

    const postRosc = deriveRealismScenarioState({
      caseData: arrest,
      vitals: { ...arrest.vitalSignsProgression.initial, bp: '100/65', pulse: 80, spo2: 90 },
    });
    expect(postRosc.activeProblems[0]).toBe('ROSC — perfusing rhythm restored');
    expect(postRosc.activeProblems).toContain('support ventilation and oxygenation');
  });

  it('does not render differential diagnoses as active patient visuals', () => {
    const scenario = baseCase({
      id: 'test-asthma-with-differential',
      title: 'Severe asthma using inhaler repeatedly',
      category: 'respiratory',
      subcategory: 'asthma',
      dispatchInfo: {
        callReason: 'Cannot breathe, using inhaler repeatedly',
        timeOfDay: 'evening',
        location: 'Home',
        callerInfo: 'Parent',
      },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking one-word answers'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 120, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      expectedFindings: {
        keyObservations: ['Severe bronchospasm', 'Hypoxia'],
        redFlags: ['Silent chest risk'],
        differentialDiagnoses: ['Anaphylaxis', 'Foreign body aspiration'],
        mostLikelyDiagnosis: 'Severe asthma',
      },
    });

    const matched = matchRealismScenarios(scenario);
    expect(matched.some(s => s.id === 'respiratory-bronchospasm')).toBe(true);
    expect(matched.some(s => s.id === 'anaphylaxis-systemic')).toBe(false);
  });

  it('does not turn a panic case red-flag differential into open trauma', () => {
    const panicCase = firstYearCases.find(item => item.id === 'y1-008');
    expect(panicCase).toBeDefined();

    const matched = matchRealismScenarios(panicCase!);
    expect(matched.some(scenario => scenario.id === 'trauma-haemorrhage-open-chest')).toBe(false);
  });

  it('maps anaphylaxis case to anaphylaxis scenario', () => {
    const scenario = baseCase({
      id: 'test-anaphylaxis',
      title: 'Allergic reaction / anaphylaxis',
      subcategory: 'anaphylaxis',
      dispatchInfo: { callReason: 'Bee sting — facial swelling', timeOfDay: 'afternoon', location: 'Park', callerInfo: 'Friend' },
      abcde: {
        patent: true,
        airway: { patent: false, findings: ['Lip swelling', 'Stridor'], interventions: [] },
        breathing: { rate: 26, rhythm: 'normal', depth: 'normal', spo2: 94, findings: ['Wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'weak', bp: { systolic: 90, diastolic: 55 }, capillaryRefill: 3, skin: 'Flushed, urticaria', findings: ['Hypotension', 'Urticaria chest and arms'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: ['Generalised urticaria', 'Lip swelling'], rashes: ['Urticaria'], wounds: [] },
      } as any,
    });

    const matched = matchRealismScenarios(scenario);
    const anaScenario = matched.find(s => s.family === 'respiratory' && s.id === 'anaphylaxis-systemic');
    expect(anaScenario).toBeDefined();
    expect(anaScenario!.activeProblems).toContain('anaphylaxis');
  });

  it('does not mistake road rash in a trauma case for systemic anaphylaxis', () => {
    const scenario = baseCase({
      id: 'test-road-rash',
      title: 'Motorcycle collision with open femur fracture',
      category: 'trauma',
      subcategory: 'polytrauma',
      dispatchInfo: { callReason: 'Rider on road after collision', timeOfDay: 'afternoon', location: 'Roadside', callerInfo: 'Bystander' },
      initialPresentation: { generalImpression: 'Shocked trauma patient', appearance: 'Road rash, open right femur wound', position: 'Supine', consciousness: 'Unresponsive' },
      abcde: {
        ...baseCase({ id: 'base', title: 'base' }).abcde,
        exposure: { findings: ['Open right femur fracture', 'Road rash'], interventions: [], wounds: ['Open femur wound'] },
      },
      expectedFindings: {
        keyObservations: ['Haemorrhagic shock'],
        redFlags: [],
        differentialDiagnoses: [],
        mostLikelyDiagnosis: 'Polytrauma with open femur fracture',
      },
    });

    const matched = matchRealismScenarios(scenario);
    expect(matched.some(item => item.id === 'trauma-haemorrhage-open-chest')).toBe(true);
    expect(matched.some(item => item.id === 'anaphylaxis-systemic')).toBe(false);
    expect(matched.some(item => item.id === 'toxicology-opioid-hypoventilation')).toBe(false);
  });

  it('maps opioid overdose to toxicology scenario', () => {
    const scenario = baseCase({
      id: 'test-opioid',
      title: 'Opioid overdose',
      category: 'toxicology',
      dispatchInfo: { callReason: 'Unconscious, possible overdose', timeOfDay: 'evening', location: 'Alley', callerInfo: 'Bystander' },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Snoring respirations'], interventions: [] },
        breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 85, findings: ['Bradypnoea', 'Shallow respirations'], interventions: [], auscultation: ['Reduced air entry bilaterally'] },
        circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Cool, pale', findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive to voice'], interventions: [] },
        exposure: { findings: ['Needle track marks left arm'] },
      } as any,
    });

    const matched = matchRealismScenarios(scenario);
    const toxScenario = matched.find(s => s.id === 'toxicology-opioid-hypoventilation');
    expect(toxScenario).toBeDefined();
    expect(toxScenario!.activeProblems).toContain('opioid toxidrome');
  });

  it('maps hypoglycaemia to metabolic scenario', () => {
    const scenario = baseCase({
      id: 'test-hypogly',
      title: 'Hypoglycaemia / diabetic emergency',
      category: 'metabolic',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 98, findings: [], interventions: [], auscultation: [] },
        circulation: { pulseRate: 95, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: [], interventions: [] },
        disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 5, total: 12 }, pupils: 'equal and reactive', findings: ['Confused', 'Diaphoretic'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Confused, sweaty', appearance: 'Diaphoretic, pale', position: 'Supine', consciousness: 'Confused' },
      history: { medications: [{ name: 'Insulin' }], allergies: [], medicalConditions: ['Type 1 diabetes'], surgicalHistory: [], lastMeal: 'Missed breakfast', eventsLeading: 'Missed breakfast' },
    });

    const matched = matchRealismScenarios(scenario);
    const metabScenario = matched.find(s => s.id === 'metabolic-hypoglycaemia-seizure');
    expect(metabScenario).toBeDefined();
    expect(metabScenario!.activeProblems).toContain('glucose-driven altered mentation');
  });

  it('maps trauma case to trauma-haemorrhage scenario', () => {
    const scenario = baseCase({
      id: 'test-trauma',
      title: 'Stab wound to chest',
      category: 'trauma',
      subcategory: 'penetrating-chest',
      priority: 'critical',
      dispatchInfo: { callReason: 'Stab wound to chest, bleeding heavily', timeOfDay: 'evening', location: 'Street', callerInfo: 'Bystander' },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking short phrases'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 90, findings: ['Sucking chest wound left side', 'Reduced air entry left'], interventions: [], auscultation: ['Reduced breath sounds left'] },
        circulation: { pulseRate: 128, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Moderate bleeding from chest wound', 'Shock signs'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['2cm stab wound 5th intercostal space left anterior chest'], wounds: ['Open chest wound'] },
      } as any,
      initialPresentation: { generalImpression: 'Young male, holding chest', appearance: 'Pale, distressed, blood on chest', position: 'Sitting, leaning forward', consciousness: 'Alert' },
    });

    const matched = matchRealismScenarios(scenario);
    const traumaScenario = matched.find(s => s.id === 'trauma-haemorrhage-open-chest');
    expect(traumaScenario).toBeDefined();
    expect(traumaScenario!.activeProblems).toContain('external bleeding or open wound');
    expect(traumaScenario!.immediateVisuals.some(v => v.kind === 'open_wound')).toBe(true);
  });

  it('does not map non-traumatic intracranial haemorrhage language to external trauma visuals', () => {
    const scenario = baseCase({
      id: 'test-headache-haemorrhage',
      title: 'Severe headache with vision changes',
      category: 'cardiac',
      subcategory: 'hypertensive-emergency',
      dispatchInfo: {
        callReason: 'Severe headache, vision changes',
        timeOfDay: 'evening',
        location: 'Villa',
        callerInfo: 'Housekeeper',
      },
      initialPresentation: {
        generalImpression: 'Middle-aged male, distressed, holding head',
        appearance: 'Flushed, diaphoretic',
        position: 'Sitting',
        consciousness: 'Alert',
      },
      expectedFindings: {
        keyObservations: ['Hypertension', 'Headache', 'Visual disturbance'],
        redFlags: ['Possible intracranial haemorrhage'],
        differentialDiagnoses: ['Hypertensive emergency', 'Subarachnoid haemorrhage'],
        mostLikelyDiagnosis: 'Hypertensive emergency',
      },
    });

    const matched = matchRealismScenarios(scenario);
    expect(matched.some(s => s.id === 'trauma-haemorrhage-open-chest')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Scenario visuals                                                   */
/* ------------------------------------------------------------------ */

describe('deriveScenarioVisuals', () => {
  it('renders the post-operative infection as flushed and sweaty before deterioration', () => {
    const scenario = allCases.find(caseData => caseData.id === 'postd-001');
    expect(scenario).toBeDefined();

    const visuals = deriveScenarioVisuals(scenario!);
    expect(visuals).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'flushing', region: 'face' }),
      expect.objectContaining({ kind: 'diaphoresis', region: 'face' }),
    ]));
    expect(visuals.some(visual => visual.id === 'sepsis-flush' && visual.kind === 'pallor')).toBe(false);
  });

  it('returns immediate visuals from matched respiratory scenario', () => {
    const scenario = baseCase({
      id: 'test-visuals-asthma',
      title: 'Asthma exacerbation',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 28, rhythm: 'rapid', depth: 'shallow', spo2: 91, findings: ['Expiratory wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 100, pulseQuality: 'normal', bp: { systolic: 125, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const visuals = deriveScenarioVisuals(scenario);
    expect(visuals.length).toBeGreaterThan(0);
    expect(visuals.some(v => v.kind === 'accessory_muscle_use')).toBe(true);
    expect(visuals.some(v => v.kind === 'diaphoresis')).toBe(true);
  });

  it('clears respiratory distress visuals when live breathing objectively improves', () => {
    const scenario = baseCase({
      id: 'test-visuals-asthma-response',
      title: 'Life-threatening asthma attack',
      category: 'respiratory',
      subcategory: 'asthma',
      initialPresentation: {
        generalImpression: 'Tripod position with accessory muscle use',
        appearance: 'Diaphoretic, distressed and cyanosed',
        position: 'Sitting upright, tripod',
        consciousness: 'Alert',
      },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Reduced air entry', 'Diffuse expiratory wheeze'] },
        circulation: { pulseRate: 120, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
      vitalSignsProgression: {
        initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 15, bloodGlucose: 5.0 },
      },
    });
    const improvedVitals = {
      ...scenario.vitalSignsProgression.initial,
      pulse: 140,
      respiration: 16,
      spo2: 97,
    };
    const clearedKinds = ['accessory_muscle_use', 'cyanosis', 'diaphoresis'];

    const visuals = deriveScenarioVisuals(scenario, improvedVitals, ['nebulizer_salbutamol']);
    expect(visuals.filter(effect => clearedKinds.includes(effect.kind))).toEqual([]);

    const state = deriveRealismScenarioState({
      caseData: scenario,
      vitals: improvedVitals,
      appliedTreatmentIds: ['nebulizer_salbutamol'],
    });
    expect(state.activeVisualEffects.filter(effect => clearedKinds.includes(effect.kind))).toEqual([]);
  });

  it('anchors limb haemorrhage to the authored limb without inventing chest trauma', () => {
    const scenario = additionalTraumaCases.find(item => item.id === 'trauma-011');
    expect(scenario).toBeDefined();

    const visuals = deriveScenarioVisuals(scenario!);
    expect(visuals).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'active_bleeding', region: 'right-arm' }),
      expect.objectContaining({ kind: 'open_wound', region: 'right-arm' }),
    ]));
    const openWound = visuals.find(visual => visual.kind === 'open_wound');
    expect(openWound?.detail).toContain('remains visible after source control');
    expect(openWound?.detail).not.toContain('Active haemorrhage');
    expect(visuals.some(visual => visual.kind === 'asymmetric_chest_rise')).toBe(false);
  });

  it('does not turn pain-driven fast breathing into a neurological pupil sign', () => {
    const fracture = firstYearCases.find(item => item.id === 'y1-020');
    expect(fracture).toBeDefined();
    const visuals = deriveScenarioVisuals(fracture!);
    expect(visuals.some(visual => visual.kind === 'dilated_pupils')).toBe(false);
    expect(visuals.some(visual => visual.kind === 'facial_droop')).toBe(false);
    const state = deriveRealismScenarioState({ caseData: fracture! });
    expect(state.activeProblems).toContain('pain and movement risk');
    expect(state.activeProblems).not.toContain('external bleeding or open wound');
    expect(state.activeProblems).not.toContain('source control priority');
    expect(state.activeProblems).not.toContain('shock risk');
  });

  it('only renders the neurological sign actually authored', () => {
    const stroke = baseCase({
      id: 'test-focal-stroke',
      title: 'Suspected stroke',
      category: 'neurological',
      abcde: {
        disability: {
          avpu: 'A',
          gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
          pupils: 'Equal and reactive',
          findings: ['Left facial droop and slurred speech'],
          interventions: [],
        },
      } as unknown as CaseScenario['abcde'],
    });
    const visuals = deriveScenarioVisuals(stroke);
    expect(visuals.some(visual => visual.kind === 'facial_droop')).toBe(true);
    expect(visuals.some(visual => visual.kind === 'dilated_pupils')).toBe(false);
    expect(visuals.some(visual => visual.kind === 'seizure_activity')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Treatment response                                                 */
/* ------------------------------------------------------------------ */

describe('deriveScenarioTreatmentResponses', () => {
  it('returns matched oxygen response for asthma', () => {
    const scenario = baseCase({
      id: 'test-tx-asthma',
      title: 'Asthma attack',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['oxygen_nonrebreather']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched' && r.debriefSignal.includes('oxygen'))).toBe(true);
  });

  it('returns adrenaline response for anaphylaxis', () => {
    const scenario = baseCase({
      id: 'test-tx-ana',
      title: 'Anaphylactic shock',
      subcategory: 'anaphylaxis',
      dispatchInfo: { callReason: 'Bee sting', timeOfDay: 'afternoon', location: 'Park', callerInfo: 'Friend' },
      abcde: {
        patent: true,
        airway: { patent: false, findings: ['Facial swelling', 'Stridor'], interventions: [] },
        breathing: { rate: 26, rhythm: 'normal', depth: 'normal', spo2: 94, findings: ['Wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 115, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 55 }, capillaryRefill: 3, skin: 'Urticaria', findings: ['Hypotension'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: ['Generalised urticaria'], rashes: ['Urticaria'] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['adrenaline_im']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched' && r.debriefSignal.includes('IM adrenaline'))).toBe(true);
  });

  it('returns naloxone response for opioid overdose', () => {
    const scenario = baseCase({
      id: 'test-tx-naloxone',
      title: 'Opioid overdose',
      category: 'toxicology',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Snoring'], interventions: [] },
        breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 82, findings: ['Bradypnoea'], interventions: [], auscultation: ['Reduced air entry'] },
        circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Pale, cool', findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive'], interventions: [] },
        exposure: { findings: ['Needle tracks'] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['naloxone_04mg']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Integrated scenario state                                          */
/* ------------------------------------------------------------------ */

describe('deriveRealismScenarioState', () => {
  it('returns aggregated state for matched trauma scenario', () => {
    const scenario = baseCase({
      id: 'test-state-trauma',
      title: 'MVA — open chest wound',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking with difficulty'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound', 'Reduced air entry right'], interventions: [], auscultation: ['Reduced breath sounds right'] },
        circulation: { pulseRate: 130, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Haemorrhage from chest wound', 'Shock'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Open chest wound right 4th intercostal space', 'Active bleeding'], wounds: ['Open chest wound'] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario, appliedTreatmentIds: ['oxygen_nonrebreather', 'chest_seal'] });

    expect(state.matchedScenarioIds).toContain('trauma-haemorrhage-open-chest');
    expect(state.families).toContain('trauma');
    expect(state.activeProblems.length).toBeGreaterThan(0);
    expect(state.activeProblems).toContain('external bleeding or open wound');
    expect(state.visualEffects.some(v => v.kind === 'open_wound')).toBe(true);
    expect(state.visualEffects.some(v => v.kind === 'active_bleeding')).toBe(true);
    expect(state.equipmentAnchors.length).toBeGreaterThan(0);
    expect(state.equipmentAnchors.some(a => a.region === 'chest')).toBe(true);
    expect(state.patientBehavior.length).toBeGreaterThan(0);
    expect(state.reassessmentRequirements.length).toBeGreaterThan(0);
    expect(state.debriefSignals.length).toBeGreaterThan(0);
  });

  it('returns empty state for unmatched case', () => {
    const scenario = baseCase({
      id: 'test-no-match',
      title: 'Routine check-up',
      category: 'general',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 99, findings: [], interventions: [], auscultation: ['Clear air entry bilaterally'] },
        circulation: { pulseRate: 72, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario });
    expect(state.matchedScenarioIds).toEqual([]);
    expect(state.families).toEqual([]);
    expect(state.activeProblems).toEqual([]);
    expect(state.visualEffects).toEqual([]);
    expect(state.equipmentAnchors).toEqual([]);
    expect(state.reassessmentRequirements).toEqual([]);
  });

  it('includes equipment anchors for applied treatments', () => {
    const scenario = baseCase({
      id: 'test-anchors-asthma',
      title: 'Asthma exacerbation',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 28, rhythm: 'rapid', depth: 'shallow', spo2: 91, findings: ['Expiratory wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 100, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario, appliedTreatmentIds: ['oxygen_nonrebreather'] });
    expect(state.equipmentAnchors.length).toBeGreaterThan(0);
    expect(state.equipmentAnchors.some(a => a.region === 'face')).toBe(true);
  });
});

describe('prospectiveEquipmentAnchorsForCase', () => {
  it('returns placement cues for asthma before treatments are applied', () => {
    const caseData = {
      id: 'resp-001',
      title: 'Severe Asthma',
      category: 'respiratory',
      subcategory: 'asthma',
      dispatchInfo: { callReason: 'cannot breathe wheeze' },
      vitalSignsProgression: { initial: { pulse: 120, bp: '130/80', spo2: 88, respiration: 32 } },
    } as any;
    const anchors = prospectiveEquipmentAnchorsForCase(caseData);
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors.some(a => a.region === 'face')).toBe(true);
    expect(anchors.some(a => a.treatmentIdFragments.some(f => f.includes('oxygen') || f.includes('nebulizer') || f.includes('salbutamol')))).toBe(true);
  });
});

/**
 * Keyword creep regression net.
 *
 * These scenarios were added after the coverage audit, and each one initially
 * stole a case from a scenario that was already right. They are locked here by
 * the exact clinical overlap that caused it, so a future keyword cannot quietly
 * re-break them.
 */
describe('scenario matching does not hijack correct diagnoses', () => {
  const topScenarioFor = (id: string) => {
    const caseData = allCases.find(c => c.id === id);
    expect(caseData, `case ${id} should exist`).toBeTruthy();
    return matchRealismScenarios(caseData!)[0]?.id ?? null;
  };

  it('a dysphasic stroke stays a stroke, not a choking', () => {
    // Dispatch says "cannot speak" — true of aphasia AND of a blocked airway.
    expect(topScenarioFor('neuro-001')).toBe('neurology-stroke-seizure');
  });

  it('severe asthma unable to speak in sentences stays bronchospasm', () => {
    expect(topScenarioFor('asthma-sev-001')).toBe('respiratory-bronchospasm');
  });

  it('a subarachnoid haemorrhage is not labelled sepsis by its meningism', () => {
    // Neck stiffness and photophobia belong to both SAH and meningitis.
    expect(topScenarioFor('litfl-012')).not.toBe('infection-sepsis');
  });

  it('anxiety stays a diagnosis of exclusion, below every organic scenario', () => {
    const anxiety = REALISM_SCENARIOS.find(s => s.id === 'anxiety-hyperventilation')!;
    const organic = REALISM_SCENARIOS.filter(s => s.id !== 'anxiety-hyperventilation');
    for (const other of organic) {
      expect(other.priority, `${other.id} must outrank anxiety`).toBeGreaterThan(anxiety.priority);
    }
  });

  it('a blocked airway ranks with the other immediate airway killers', () => {
    // Ties with anaphylaxis by design — both close an airway in minutes, and
    // anaphylaxis carries its own hard allergy gate so it cannot over-match.
    const choking = REALISM_SCENARIOS.find(s => s.id === 'airway-foreign-body-obstruction')!;
    for (const other of REALISM_SCENARIOS) {
      if (other.id === choking.id) continue;
      expect(choking.priority).toBeGreaterThanOrEqual(other.priority);
    }
    // What actually matters: it must beat bronchospasm, or a choking patient
    // gets treated with salbutamol.
    const bronchospasm = REALISM_SCENARIOS.find(s => s.id === 'respiratory-bronchospasm')!;
    expect(choking.priority).toBeGreaterThan(bronchospasm.priority);
  });

  it('the newly covered cases actually match their intended scenario', () => {
    expect(topScenarioFor('sepsis-001')).toBe('infection-sepsis');
    expect(topScenarioFor('psych-002')).toBe('behavioural-acute-agitation');
    expect(topScenarioFor('resp-009')).toBe('airway-foreign-body-obstruction');
    expect(topScenarioFor('y1-012')).toBe('anxiety-hyperventilation');
  });
});

describe('every case gets a realism scenario', () => {
  const topScenarioFor = (id: string) => {
    const caseData = allCases.find(c => c.id === id);
    expect(caseData, `case ${id} should exist`).toBeTruthy();
    return matchRealismScenarios(caseData!)[0]?.id ?? null;
  };

  it('leaves no case presenting generically', () => {
    // Coverage was 99/114 before the scenario families were completed. A case
    // that matches nothing has no declared signs, so its patient looks the
    // same no matter what is wrong with them.
    const uncovered = allCases.filter(c => matchRealismScenarios(c).length === 0);
    expect(uncovered.map(c => `${c.id} (${c.category})`)).toEqual([]);
  });

  it('an eclamptic seizure is eclampsia, not hypoglycaemia', () => {
    // The seizure keywords collided and nothing obstetric outranked them, so
    // this case used to teach reaching for glucose in a seizing pregnant
    // patient.
    expect(topScenarioFor('obs-002')).toBe('obstetric-eclampsia');
  });

  it('routes each newly covered presentation to its own family', () => {
    expect(topScenarioFor('y1-006')).toBe('obstetric-imminent-delivery');
    expect(topScenarioFor('y1-007')).toBe('pediatric-stridor-croup');
    expect(topScenarioFor('env-001')).toBe('environmental-heat-illness');
    expect(topScenarioFor('cardiac-004')).toBe('cardiac-hypertensive-emergency');
    expect(topScenarioFor('y1-022')).toBe('gastro-dehydration');
  });

  it('keeps the non-specific presentations below every organic scenario', () => {
    // Vomiting, diarrhoea and abdominal pain front for a great many dangerous
    // things; anxiety is a diagnosis of exclusion. Neither may outrank one.
    const soft = ['gastro-dehydration', 'anxiety-hyperventilation'];
    const softMax = Math.max(...REALISM_SCENARIOS.filter(s => soft.includes(s.id)).map(s => s.priority));
    const organic = REALISM_SCENARIOS.filter(s => !soft.includes(s.id));
    for (const other of organic) {
      expect(other.priority, `${other.id} must outrank the non-specific scenarios`).toBeGreaterThan(softMax);
    }
  });

  it('gives every scenario a unique id', () => {
    const ids = REALISM_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('trauma is not one undifferentiated scenario', () => {
  const topScenarioFor = (id: string) => {
    const caseData = allCases.find(c => c.id === id);
    expect(caseData, `case ${id} should exist`).toBeTruthy();
    return matchRealismScenarios(caseData!)[0]?.id ?? null;
  };

  it('obstetric haemorrhage is not an open chest wound', () => {
    // Placenta praevia and a postpartum haemorrhage were both matching the
    // open-chest trauma scenario: wrong compartment, wrong source control,
    // wrong destination.
    expect(topScenarioFor('obs-001')).toBe('obstetric-haemorrhage');
    expect(topScenarioFor('obs-003')).toBe('obstetric-haemorrhage');
  });

  it('a genuine open chest wound still outranks the limb scenario', () => {
    const open = REALISM_SCENARIOS.find(s => s.id === 'trauma-haemorrhage-open-chest')!;
    const limb = REALISM_SCENARIOS.find(s => s.id === 'trauma-limb-injury')!;
    expect(open.priority).toBeGreaterThan(limb.priority);
  });

  it('isolated limb injuries and mechanical falls declare their own signs', () => {
    // These used to match only the open-chest scenario, whose chest visuals
    // are correctly suppressed without wound context — so the patient showed
    // nothing at all.
    for (const id of ['fall-001', 'y1-010', 'y1-020']) {
      const matched = matchRealismScenarios(allCases.find(c => c.id === id)!).map(s => s.id);
      expect(matched, `${id} should reach the limb scenario`).toContain('trauma-limb-injury');
    }
  });
});
