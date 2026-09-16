/**
 * LLM fallback for history questions the keyword classifier can't place.
 *
 * The deterministic engine in historyTaking.ts stays the authority: it owns
 * every SAMPLE/OPQRST category, every clinical-accuracy test, and the
 * breathless/altered speech degradation. This module only covers the gap —
 * a question phrased in a way no regex anticipated, which otherwise got a
 * generic "sorry, what?" re-prompt.
 *
 * Every failure path returns null, so a missing key, a dead model, or a slow
 * network just leaves the existing re-prompt in place.
 */
import type { CaseScenario } from '@/types';
import { buildPatientBrief, buildPatientSystemPrompt } from '@/lib/patientBrief';

const HISTORY_URL = '/api/history';
const HISTORY_HEALTH = '/api/history/health';

let availabilityProbe: Promise<boolean> | null = null;

/** One-shot, cached: is any history model configured for this deployment? */
export function probeHistoryModel(): Promise<boolean> {
  if (availabilityProbe) return availabilityProbe;
  availabilityProbe = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(HISTORY_HEALTH, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return false;
      const json = await res.json().catch(() => ({} as { ok?: boolean }));
      return json.ok === true;
    } catch {
      return false;
    }
  })();
  return availabilityProbe;
}

/** Test seam — lets a test reset the cached probe. */
export function resetHistoryModelProbe(): void {
  availabilityProbe = null;
}

/**
 * Ask the model to answer as this case's patient. Returns null whenever the
 * caller should keep its deterministic answer.
 */
export async function askPatientModel(
  caseData: CaseScenario,
  question: string,
): Promise<string | null> {
  const trimmed = question.trim();
  if (!trimmed) return null;
  if (!(await probeHistoryModel())) return null;

  const brief = buildPatientBrief(caseData);
  // No facts to ground an answer in — a model given an empty brief would
  // invent a history, which is worse than a re-prompt.
  if (!brief.trim()) return null;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 13_000);
    const res = await fetch(HISTORY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemPrompt: buildPatientSystemPrompt(caseData, brief),
        question: trimmed.slice(0, 400),
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json() as { answer?: unknown };
    return typeof json.answer === 'string' && json.answer.trim() ? json.answer.trim() : null;
  } catch {
    return null;
  }
}
