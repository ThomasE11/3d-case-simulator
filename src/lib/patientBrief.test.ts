import { describe, it, expect } from 'vitest';
import type { CaseScenario } from '@/types';
import { allCases } from '@/data/cases';
import { buildPatientBrief, buildPatientSystemPrompt } from '@/lib/patientBrief';
import { sanitiseAnswer } from '../../api/history/chat';

const caseData = {
  id: 'test-001',
  patientInfo: { age: 54, gender: 'male', occupation: 'Driver', language: 'Arabic' },
  dispatchInfo: { callReason: 'Chest pain for 40 minutes', location: 'Villa in Dubai', timeOfDay: 'evening' },
  initialPresentation: { generalImpression: 'Pale, clammy, clutching his chest', position: 'Sitting forward' },
  history: {
    medications: [{ name: 'Metformin', dose: '500mg', frequency: 'twice daily' }],
    allergies: ['Penicillin'],
    medicalConditions: ['Type 2 diabetes'],
    surgicalHistory: [],
    lastMeal: 'Rice and chicken about two hours ago',
    eventsLeading: 'Started while watching TV after dinner',
    socialHistory: { smoking: '20 a day for 30 years' },
  },
  abcde: { disability: { gcs: { total: 15 } } },
} as unknown as CaseScenario;

describe('buildPatientBrief', () => {
  it('grounds free-text history in the active resp-001 villa scene and its authored trigger', () => {
    const asthma = allCases.find(caseData => caseData.id === 'resp-001');
    expect(asthma).toBeDefined();

    const brief = buildPatientBrief(asthma!);
    expect(brief).toContain('Where I am: Villa in Al Ain');
    expect(brief).toContain('Why the ambulance was called: Son cannot breathe, using inhaler repeatedly');
    expect(brief).toContain('Started feeling tight chest after cleaning dusty room, used inhaler 10 times with no relief');
    // The model gets the authored case facts, never a diagnosis label or
    // monitor values it could present as if the patient knew them.
    expect(brief).not.toContain('Life-threatening Asthma Exacerbation');
    expect(brief).not.toContain('SpO2');
  });

  it('includes facts the patient would know about themselves', () => {
    const brief = buildPatientBrief(caseData);
    expect(brief).toContain('Chest pain for 40 minutes');
    expect(brief).toContain('Metformin 500mg twice daily');
    expect(brief).toContain('Penicillin');
    expect(brief).toContain('Started while watching TV after dinner');
    expect(brief).toContain('20 a day for 30 years');
  });

  it('states no known allergies rather than leaving the line out', () => {
    const noAllergies = { ...caseData, history: { ...caseData.history, allergies: [] } } as CaseScenario;
    expect(buildPatientBrief(noAllergies)).toContain('No known allergies');
  });

  it('never leaks measured vitals — a patient does not know their own numbers', () => {
    const withVitals = {
      ...caseData,
      abcde: {
        ...caseData.abcde,
        circulation: { pulseRate: 118, bp: { systolic: 88, diastolic: 54 } },
        breathing: { spo2: 89, rate: 28, findings: ['Bilateral crackles'] },
      },
    } as unknown as CaseScenario;
    const brief = buildPatientBrief(withVitals);
    expect(brief).not.toContain('118');
    expect(brief).not.toContain('88');
    expect(brief).not.toContain('89');
  });

  it('tells an altered patient to answer haltingly', () => {
    const altered = {
      ...caseData,
      abcde: { disability: { gcs: { total: 10 } } },
    } as unknown as CaseScenario;
    const prompt = buildPatientSystemPrompt(altered, buildPatientBrief(altered));
    expect(prompt).toMatch(/confused and drowsy/i);
  });

  it('forbids inventing facts and forbids self-diagnosis', () => {
    const prompt = buildPatientSystemPrompt(caseData, buildPatientBrief(caseData));
    expect(prompt).toMatch(/Never invent a clinical fact/i);
    expect(prompt).toMatch(/Do not diagnose yourself/i);
  });
});

describe('sanitiseAnswer', () => {
  it('strips role prefixes, markdown and surrounding quotes', () => {
    expect(sanitiseAnswer('Patient: **"It started after dinner."**'))
      .toBe('It started after dinner.');
  });

  it('caps a runaway model at two sentences', () => {
    expect(sanitiseAnswer('One. Two. Three. Four.')).toBe('One. Two.');
  });

  it('returns empty for empty input so the caller keeps its own answer', () => {
    expect(sanitiseAnswer('   ')).toBe('');
  });
});
