import { describe, expect, it } from 'vitest';
import { patientAgeShortLabel } from './patientAgePresentation';

// Regression: ISSUE-005 — infant ages appeared as raw year decimals ("0.67yo")
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('patient age label', () => {
  it.each([
    [0, '0d'],
    [0.04, '15d'],
    [0.08, '1mo'],
    [0.5, '6mo'],
    [0.67, '8mo'],
    [1, '1yo'],
    [8, '8yo'],
    [58, '58yo'],
  ] as const)('formats %s years as %s', (age, expected) => {
    expect(patientAgeShortLabel(age)).toBe(expected);
  });
});
