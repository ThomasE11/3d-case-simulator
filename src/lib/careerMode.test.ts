import { describe, expect, it } from 'vitest';
import {
  awardCaseResult,
  careerSummary,
  createCareerProfile,
  rankForXp,
  xpToNextRank,
} from './careerMode';

describe('careerMode', () => {
  it('starts as a student with a pass band unlocked', () => {
    const p = createCareerProfile('Elias');
    expect(p.rank).toBe('student');
    expect(p.unlockedCaseBands).toContain('diploma');
    expect(xpToNextRank(p.xp)).toBeGreaterThan(0);
  });

  it('ranks up from XP and unlocks harder case bands', () => {
    let p = createCareerProfile();
    p = awardCaseResult(p, { passed: true, scorePercent: 95, skills: { airway: 2 } });
    expect(p.casesCompleted).toBe(1);
    expect(p.casesPassed).toBe(1);
    expect(p.skills.airway).toBe(2);
    expect(rankForXp(400)).toBe('emt');
    expect(rankForXp(1200)).toBe('paramedic');

    const senior = { ...p, xp: 1300 };
    const next = awardCaseResult(senior, { passed: true, scorePercent: 100 });
    expect(next.unlockedCaseBands).toContain('2nd-year');
  });

  it('summarises for the UI', () => {
    expect(careerSummary(createCareerProfile('Sam'))).toContain('Sam');
  });
});
