/**
 * Compact, first-person case brief handed to the history LLM.
 *
 * The LLM is NOT a clinical authority here — it is a phrasing layer over
 * facts this file extracts from the authored case. Everything it is allowed
 * to say has to appear in this brief, so keeping the brief honest (and small)
 * is the whole safety story.
 *
 * Pure function, no React, no network — so the contents are testable without
 * calling a model.
 */
import type { CaseScenario } from '@/types';

/** Facts the patient themselves would plausibly know about their own case. */
export function buildPatientBrief(caseData: CaseScenario): string {
  const p = caseData.patientInfo;
  const d = caseData.dispatchInfo;
  const h = caseData.history;
  const ip = caseData.initialPresentation;

  const lines: string[] = [];
  const add = (label: string, value: unknown) => {
    if (value == null) return;
    const text = Array.isArray(value) ? value.filter(Boolean).join('; ') : String(value);
    if (!text.trim()) return;
    lines.push(`${label}: ${text.trim()}`);
  };

  add('Age', p?.age);
  add('Sex', p?.gender);
  add('Occupation', p?.occupation);
  add('Where I am', d?.location);
  add('Time of day', d?.timeOfDay);
  add('Why the ambulance was called', d?.callReason);
  add('What I look like right now', ip?.generalImpression);
  add('My position', ip?.position);
  add('What happened / events leading up', h?.eventsLeading);
  add('My past medical conditions', h?.medicalConditions);
  add(
    'My regular medications',
    h?.medications?.map(m => [m.name, m.dose, m.frequency].filter(Boolean).join(' ')),
  );
  add('My allergies', h?.allergies?.length ? h.allergies : 'No known allergies');
  add('My last meal', h?.lastMeal);
  add('Past surgery', h?.surgicalHistory);
  add('Has this happened before', h?.previousSimilarEpisodes);
  add('Family history', h?.familyHistory?.conditions);
  add('I smoke', h?.socialHistory?.smoking);
  add('I drink', h?.socialHistory?.alcohol);
  add('Recreational drugs', h?.socialHistory?.drugs);
  add('Who I live with', h?.socialHistory?.livingSituation);
  add('Support at home', h?.socialHistory?.supportSystem);
  // Symptoms the patient can feel. Deliberately excludes measured vitals and
  // examination findings — a patient does not know their own SpO2.
  add('What I can feel', [
    ...(ip?.sounds ?? []),
    ...(caseData.abcde?.breathing?.findings ?? []).filter(f => /breath|short|wheez|tight|cough/i.test(f)),
  ]);

  return lines.join('\n');
}

/** The rules the model must obey. Kept beside the brief it governs. */
export function buildPatientSystemPrompt(caseData: CaseScenario, brief: string): string {
  const p = caseData.patientInfo;
  const altered = (caseData.abcde?.disability?.gcs?.total ?? 15) <= 12;
  const language = p?.language ? ` Your first language is ${p.language}, but answer in English.` : '';

  return [
    `You are a patient in a paramedic training simulation. You are ${p?.age ?? 'an adult'} years old.${language}`,
    'A student paramedic is taking your history. Answer them IN CHARACTER, first person, the way a real patient speaks.',
    '',
    'THE ONLY FACTS YOU KNOW ARE THESE:',
    brief,
    '',
    'RULES — these are absolute:',
    '1. Never invent a clinical fact. If the answer is not in the facts above, say you do not know, in character ("I\'m not sure", "Nobody\'s ever told me that").',
    '1b. Do not infer a new fact from a related one, even when it seems obvious. Being allergic to something is not proof you are near it; a medication is not proof of a diagnosis you were not told. If it is not stated above, you do not know it.',
    '2. You are the patient, not a clinician. Do not diagnose yourself, name conditions you were not told you have, quote vital signs, or use medical jargon.',
    '3. Answer only what was asked. One or two short sentences. No lists, no headings, no stage directions, no asterisks.',
    '4. If the student asks something that is not a question about you, respond as a confused patient would.',
    altered
      ? '5. You are confused and drowsy. Answer haltingly, in fragments, and be vague about the order things happened.'
      : '5. Speak plainly and naturally, the way an ordinary person describes their own symptoms.',
  ].join('\n');
}
