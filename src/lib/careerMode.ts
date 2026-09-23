/**
 * Paramedic career mode — the football-manager-shaped progression shell.
 *
 * Realism first: this module is intentionally a pure data/logic seam so the
 * live case UI can start awarding XP and unlocking ranks without any screen
 * work yet. When the career screens land they read/write this contract only.
 */

export type CareerRank =
  | 'student'
  | 'emt'
  | 'paramedic'
  | 'senior-paramedic'
  | 'critical-care-paramedic'
  | 'clinical-lead';

export interface CareerProfile {
  displayName: string;
  rank: CareerRank;
  xp: number;
  casesCompleted: number;
  casesPassed: number;
  skills: Partial<Record<CareerSkillId, number>>;
  unlockedCaseBands: string[];
}

export type CareerSkillId =
  | 'airway'
  | 'breathing'
  | 'circulation'
  | 'disability'
  | 'exposure'
  | 'communication'
  | 'scene-safety'
  | 'clinical-reasoning';

const RANK_XP: Array<{ rank: CareerRank; xp: number }> = [
  { rank: 'student', xp: 0 },
  { rank: 'emt', xp: 400 },
  { rank: 'paramedic', xp: 1200 },
  { rank: 'senior-paramedic', xp: 2800 },
  { rank: 'critical-care-paramedic', xp: 5200 },
  { rank: 'clinical-lead', xp: 9000 },
];

export function createCareerProfile(displayName = 'Cadet'): CareerProfile {
  return {
    displayName,
    rank: 'student',
    xp: 0,
    casesCompleted: 0,
    casesPassed: 0,
    skills: {},
    unlockedCaseBands: ['diploma', '1st-year'],
  };
}

export function rankForXp(xp: number): CareerRank {
  let current: CareerRank = 'student';
  for (const step of RANK_XP) {
    if (xp >= step.xp) current = step.rank;
  }
  return current;
}

export function xpToNextRank(xp: number): number {
  const next = RANK_XP.find(step => step.xp > xp);
  return next ? next.xp - xp : 0;
}

/**
 * Post-case award. A pass is worth more than a completion, and checklist
 * categories map onto skills so the career sheet shows *what* is improving.
 */
export function awardCaseResult(
  profile: CareerProfile,
  input: {
    passed: boolean;
    scorePercent: number;
    skills?: Partial<Record<CareerSkillId, number>>;
  },
): CareerProfile {
  const base = input.passed ? 80 : 30;
  const bonus = Math.round(Math.max(0, Math.min(100, input.scorePercent)) * 0.6);
  const xp = profile.xp + base + bonus;
  const skills = { ...profile.skills };
  for (const [id, delta] of Object.entries(input.skills ?? {})) {
    const key = id as CareerSkillId;
    skills[key] = (skills[key] ?? 0) + (delta ?? 0);
  }
  const rank = rankForXp(xp);
  const unlockedCaseBands = [...profile.unlockedCaseBands];
  if (rank === 'paramedic' && !unlockedCaseBands.includes('2nd-year')) unlockedCaseBands.push('2nd-year');
  if (rank === 'senior-paramedic' && !unlockedCaseBands.includes('3rd-year')) unlockedCaseBands.push('3rd-year');
  if (rank === 'critical-care-paramedic' && !unlockedCaseBands.includes('4th-year')) unlockedCaseBands.push('4th-year');

  return {
    ...profile,
    xp,
    rank,
    skills,
    casesCompleted: profile.casesCompleted + 1,
    casesPassed: profile.casesPassed + (input.passed ? 1 : 0),
    unlockedCaseBands,
  };
}

export function careerSummary(profile: CareerProfile): string {
  const passRate = profile.casesCompleted
    ? Math.round((profile.casesPassed / profile.casesCompleted) * 100)
    : 0;
  return `${profile.displayName} · ${profile.rank} · ${profile.xp} XP · ${passRate}% pass`;
}
