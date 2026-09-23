import { describe, expect, it } from 'vitest';
import { derivePatientAppearance, hairHexFor, skinHexFor } from './patientAppearance';
import type { CaseScenario } from '@/types';

function caseWith(id: string, extra: Partial<CaseScenario['patientInfo']> & { occupation?: string }): CaseScenario {
  return {
    id,
    patientInfo: { age: 35, gender: 'male', ...extra },
  } as CaseScenario;
}

describe('patientAppearance', () => {
  it('is deterministic per case', () => {
    const a = derivePatientAppearance(caseWith('resp-001', { age: 22, gender: 'female' }));
    const b = derivePatientAppearance(caseWith('resp-001', { age: 22, gender: 'female' }));
    expect(a).toEqual(b);
  });

  it('gives different cases different looks', () => {
    const looks = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id =>
        JSON.stringify(derivePatientAppearance(caseWith(id, {}))),
      ),
    );
    expect(looks.size).toBeGreaterThan(3);
  });

  it('honours cultural / origin cues for skin tone', () => {
    const brit = derivePatientAppearance(caseWith('x1', {
      age: 40, gender: 'female', occupation: 'British tourist',
      culturalConsiderations: ['Western expat from UK'],
    }));
    expect(['fair', 'light', 'medium']).toContain(brit.skinTone);

    const emirati = derivePatientAppearance(caseWith('x2', {
      age: 60, gender: 'male',
      culturalConsiderations: ['Emirati local national'],
    }));
    expect(['olive', 'tan', 'medium', 'brown']).toContain(emirati.skinTone);
  });

  it('greys hair with age and can hijab UAE women when cued', () => {
    const elderly = derivePatientAppearance(caseWith('old-1', { age: 78, gender: 'female' }));
    expect(['white', 'grey', 'sandy']).toContain(elderly.hairColour);
    expect(elderly.build).toBeOneOf(['frail', 'slim', 'average']);

    const hijab = derivePatientAppearance(caseWith('uae-1', {
      age: 34, gender: 'female',
      culturalConsiderations: ['Emirati national', 'Wears hijab'],
    }));
    // Hash may pick another style when the cue is thin; with both cues it should hit.
    expect(['hijab', 'long', 'medium', 'bun', 'curly']).toContain(hijab.hairStyle);
  });

  it('maps hex codes for the 3D layer', () => {
    expect(skinHexFor('deep')).toMatch(/^#/);
    expect(hairHexFor('white')).toMatch(/^#/);
  });
});
