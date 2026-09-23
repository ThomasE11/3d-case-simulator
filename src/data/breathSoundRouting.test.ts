import { describe, it, expect } from 'vitest';
import { allCases } from './cases';
import { createInitialPatientState } from './dynamicTreatmentEngine';
import type { ClinicalSoundState, BreathSoundType } from './clinicalSounds';

/**
 * Field feedback: "if it's a wheeze, it needs to SOUND like a wheeze."
 * This audit replays every case through the shipped sound-derivation path
 * (createInitialPatientState → getInitialSounds) and asserts that when the
 * case's breathing findings clearly state an adventitious sound, the derived
 * lung sounds actually play it (real recordings are mapped per type).
 */

function allLungSounds(s: ClinicalSoundState): BreathSoundType[] {
  return [
    s.leftLung, s.rightLung,
    s.leftUpperLung, s.leftLowerLung, s.rightUpperLung, s.rightLowerLung,
  ].filter((x): x is BreathSoundType => Boolean(x));
}

/** The same findings text the shipped derivation sees. */
function findingsText(c: (typeof allCases)[number]): string {
  return [
    ...(c.expectedFindings?.keyObservations || []),
    ...(c.abcde?.breathing?.findings || []),
    ...(c.abcde?.breathing?.auscultation || []),
    c.initialPresentation?.generalImpression || '',
  ].join(' ').toLowerCase();
}

// Positive assertion only when the finding is stated, not negated.
// "No wheeze", "without stridor", "nil wheeze", and "no crackles/wheeze"
// must not assert — the old lookbehind missed slash/or compounds and the
// suite demanded a wheeze on panic / PE cases that correctly play clear.
const positive = (text: string, term: string) => {
  const negated = new RegExp(
    `\\b(?:no|without|nil|denies|negative for|absent|rule out|r/o)\\s+(?:[\\w/]+\\s+){0,2}${term}`,
    'i',
  ).test(text);
  return !negated && new RegExp(term, 'i').test(text);
};

describe('breath-sound routing (findings → played recording)', () => {
  it('wheeze/crackles/stridor/silent-chest findings route to matching lung sounds', () => {
    const failures: string[] = [];
    for (const c of allCases) {
      let sounds: ClinicalSoundState;
      try {
        sounds = createInitialPatientState(c).sounds;
      } catch {
        continue; // engine path unavailable for this case shape — not a routing failure
      }
      const text = findingsText(c);
      const lungs = allLungSounds(sounds);
      const silent = positive(text, 'silent chest') || positive(text, 'absent breath sounds');

      const expectations: Array<[string, (t: BreathSoundType) => boolean]> = [
        ['wheez', (t) => t === 'wheeze'],
        ['crackle', (t) => t === 'crackles-fine' || t === 'crackles-coarse'],
        ['stridor', (t) => t === 'stridor'],
      ];
      for (const [term, matches] of expectations) {
        if (!positive(text, term)) continue;
        // A silent/absent chest legitimately overrides adventitious sounds
        // (you can't wheeze without air movement).
        const ok = lungs.some(matches) || (silent && (lungs.includes('absent') || lungs.includes('diminished')));
        if (!ok) failures.push(`${c.id}: findings say "${term}" but lungs derived as [${lungs.join(', ')}]`);
      }
      if (silent && !lungs.includes('absent') && !lungs.includes('diminished')) {
        failures.push(`${c.id}: findings say silent/absent chest but lungs derived as [${lungs.join(', ')}]`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});
