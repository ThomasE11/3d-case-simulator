import { describe, expect, it } from 'vitest';
import { patientAgeShortLabel } from './patientAgePresentation';

describe('infant age presentation surfaces regression', () => {
  it('provides the shared clinically readable value used by live, classroom and PDF surfaces', () => {
    expect(patientAgeShortLabel(0.67)).toBe('8mo');
    expect(patientAgeShortLabel(0)).toBe('0d'); // neonate (under ~1 month)
  });
});
