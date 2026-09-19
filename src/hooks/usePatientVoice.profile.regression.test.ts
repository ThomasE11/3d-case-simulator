import { describe, expect, it } from 'vitest';

import { caseDatabase } from '@/data/cases';
import { patientVoiceProfileForCase } from './usePatientVoice';

describe('patient demographic voice profile', () => {
  it('uses the male patient voice even when a wife is present', () => {
    const malePatientWithWife = caseDatabase.find(caseData => caseData.id === 'cardiac-001');

    expect(malePatientWithWife?.sceneInfo.bystanders).toContain('Wife');
    expect(malePatientWithWife && patientVoiceProfileForCase(malePatientWithWife)).toEqual({ gender: 'male' });
  });

  it('preserves the female patient voice for female cases', () => {
    const femalePatient = caseDatabase.find(caseData => caseData.patientInfo.gender === 'female');

    expect(femalePatient).toBeDefined();
    expect(femalePatient && patientVoiceProfileForCase(femalePatient)).toEqual({ gender: 'female' });
  });
});
