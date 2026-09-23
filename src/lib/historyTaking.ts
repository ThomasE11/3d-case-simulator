/**
 * History-taking — voice-driven SAMPLE / OPQRST conversation engine.
 *
 * Pure functions, no React. The two exports the UI cares about:
 *
 *  - classifyQuestion(text)       — maps a free-text utterance to a category
 *  - generatePatientResponse(...) — returns what the patient would say back
 *
 * The classifier uses keyword/regex matching (small set, ~100 phrases). For
 * v1 this is precise enough that students hit the right category 90%+ of
 * the time using natural phrasing. If/when we want to upgrade, this file
 * is the single seam where an LLM classifier would slot in.
 */

import type { CaseScenario } from '@/types';

export type HistoryCategory =
  // SAMPLE
  | 'signs-symptoms'
  | 'allergies'
  | 'medications'
  | 'past-medical'
  | 'last-meal'
  | 'events'
  // OPQRST — pain characterisation
  | 'opqrst-onset'
  | 'opqrst-provocation'
  | 'opqrst-quality'
  | 'opqrst-region'        // "where is the pain" — Region (the R in OPQRST/SOCRATES)
  | 'opqrst-radiation'
  | 'opqrst-severity'
  | 'opqrst-time'
  // Social / family / orientation
  | 'social'
  | 'family'
  | 'orientation'
  | 'introduction'
  | 'pain-current'
  | 'unknown';

export interface HistoryTurn {
  id: string;
  role: 'student' | 'patient' | 'system';
  text: string;
  category?: HistoryCategory;
  timestamp: number;
  /** Human-readable speaker identity for the bubble label, e.g. "Patient",
   *  "His wife", "A witness". Set by the UI so the thread shows WHO spoke. */
  speaker?: string;
}

const ABSENT_BYSTANDER_PATTERN = /\b(none|nil|nobody|no[- ]one|no bystander|unattended|alone)\b/i;

/**
 * Scene witnesses are askable when the authored bystander field names a
 * person. "None" / empty / missing stays silent — there is nobody to ask.
 */
export function sceneHasAskableBystander(caseData: CaseScenario): boolean {
  const bystanders = caseData.sceneInfo?.bystanders?.trim();
  if (!bystanders) return false;
  return !ABSENT_BYSTANDER_PATTERN.test(bystanders);
}

/** A recognised question is not evidence that its answer was obtained. */
export function historyAnswerCanBeObtained(
  caseData: CaseScenario,
  category: HistoryCategory,
  source: 'patient' | 'bystander',
): boolean {
  if (category === 'unknown') return false;
  if (source === 'bystander') {
    if (!sceneHasAskableBystander(caseData)) return false;
    if (category.startsWith('opqrst-') || category === 'pain-current') return false;
  }
  const history = caseData.history;
  if (category === 'last-meal') return Boolean(history?.lastMeal?.trim());
  if (category === 'events') return Boolean(history?.eventsLeading?.trim());
  if (category === 'allergies') return Array.isArray(history?.allergies);
  if (category === 'medications') return Array.isArray(history?.medications);
  if (category === 'past-medical') return Array.isArray(history?.medicalConditions);
  return true;
}

/**
 * Map a transcribed question to a SAMPLE/OPQRST category. Returns 'unknown'
 * when no pattern fires. Order matters — more specific patterns first.
 */
export function classifyQuestion(rawText: string): HistoryCategory {
  const t = rawText.toLowerCase().trim();
  if (!t) return 'unknown';

  // Introduction / greeting comes before everything else — students should
  // introduce themselves before asking clinical questions.
  if (/(^|\s)(hello|hi|hey|good (morning|afternoon|evening)|my name is|i'?m a paramedic|i'?m here to help)\b/.test(t)) {
    return 'introduction';
  }

  // Orientation — A&O x4 questions
  if (/(do you know (where|what|who))|what(?:'s| is) (today|the day|the date|your name)|where (are we|are you)|can you tell me (your name|where|what)/.test(t)) {
    return 'orientation';
  }

  // SAMPLE - Allergies
  if (/\ballerg(y|ies|ic)\b|react(ion)? to (any )?med|sensitive to/.test(t)) return 'allergies';

  // SAMPLE - Medications (before "past medical" — "take any tablets" overlaps).
  // \w*-suffixed stems so plurals/forms match (medications, thinners, etc.).
  if (/\bmed(ication|icine)?s?\b|\b(drugs?|tablets?|pills?|prescriptions?|blood[- ]?thinners?|anticoagulant\w*|warfarin|apixaban|rivaroxaban|aspirin|inhalers?|insulin|puffers?|gtn|nitro\w*)\b|(take|taking|on) (any |anything|something|regular )?(med\w*|tablets?|pills?|drugs?)\b/.test(t)) {
    return 'medications';
  }

  // SAMPLE - Last meal / oral intake (handles "when did you last eat", plurals/forms)
  if (/\b(last (meal|ate|eaten|eat|drink|drank|food|oral intake)|when (did|was) you.{0,14}(eat|ate|eaten|drink|drank|meal|food)|last (time you|thing you) (ate|eaten|eat|drank|drink)|eaten anything|had anything to (eat|drink)|fasting|nil by mouth|fluid intake|\bnpo\b)\b/.test(t)) {
    return 'last-meal';
  }

  // SAMPLE - Events leading up
  if (/\b(what (happened|were you doing|brought)|how (did|did this) (start|happen|begin)|before (this|it started)|leading up|tell me (what|how it)|walk me through|describe what)\b/.test(t)) {
    return 'events';
  }

  // SAMPLE - Past medical history (after events so natural questions such as
  // "what happened before this started?" are not mistaken for prior history).
  if (/\b(past medical|medical (history|problems|conditions)|ever had|been diagnosed|diabet\w*|asthma\w*|epilep\w*|high blood pressure|hypertens\w*|heart (problem|attack|disease|condition)|stroke|copd|kidney|liver|cancer|previous (admission|surgery|operation|episode)|had this before|happened before|first time|pregnan\w*|expecting|last (menstrual|period)|\blmp\b)\b|any (surgeries|operations|conditions|medical (problems|conditions|history|issues))/.test(t)) {
    return 'past-medical';
  }

  // OPQRST — order matters here too
  // Severity — usually phrased numerically
  if (/\b(scale of 10|out of 10|rate (your |the )?pain|how (bad|severe|intense)|how much (does it|pain)|severity)\b/.test(t)) {
    return 'opqrst-severity';
  }
  // Onset
  if (/\b(when did (this|it|the pain) (start|begin|happen)|how long ago|how long has|since when|first start|suddenly or gradually|sudden onset|come on (suddenly|slowly|gradually))\b/.test(t)) {
    return 'opqrst-onset';
  }
  // Provocation
  if (/\b((what )?(makes? it|made it) (worse|better)|aggravat|relieve|ease the pain|what helps|position|movement.*pain|breathing.*pain)\b/.test(t)) {
    return 'opqrst-provocation';
  }
  // Quality — "what's it like" / "describe the pain" / specific qualities.
  // NOTE: do NOT match a bare "like" — it false-fires on "I'd like to...".
  if (/\b(describe (the |your )?(pain|it)|what (does (it|the pain) feel|kind of pain|type of pain)|what'?s it (like|feel like)|feels? like|sharp|dull|crushing|burning|stabbing|tearing|aching|squeezing|pressure|tight|heavy)\b/.test(t)) {
    return 'opqrst-quality';
  }
  // Region — WHERE the pain is (distinct from radiation). Check before radiation.
  if (/\b(where (is|does|'?s) (the |it|your )?(pain|it|hurt)|where does it hurt|whereabouts|which (part|area)|point to|show me where|locali[sz]e|where exactly)\b/.test(t)) {
    return 'opqrst-region';
  }
  // Radiation — does it go/spread ELSEWHERE. Stems use \w* (NOT a trailing \b)
  // so "radiate/radiates/radiating/spreading" all match.
  if (/\b(anywhere else|radiat\w*|spread\w*|travel\w*|shoot\w*|move (to|down|up)|go(es)? (to|down|up|into|anywhere)|down (your|the) (arm|leg)|into (your |the |my )?(jaw|back|arm|leg|shoulder|neck))/.test(t)) {
    return 'opqrst-radiation';
  }
  // Time / duration
  if (/\b(how long (has|have)|constant|come(s)? and go|intermittent|continuous|how often|duration|since)\b/.test(t)) {
    return 'opqrst-time';
  }

  // Social
  if (/\b(smok(e|er|ing)|alcohol|drink|recreational|drug use|live (alone|with)|occupation|work|job)\b/.test(t)) {
    return 'social';
  }

  // Family history
  if (/\b(family (history|members)|run in (the |your )?family|parents had|mother (had|has)|father (had|has)|hereditary)\b/.test(t)) {
    return 'family';
  }

  // Current pain (asked outside of OPQRST framework)
  if (/\b(any pain|in pain|are you (sore|hurting)|pain (right )?now)\b/.test(t)) {
    return 'pain-current';
  }

  // Generic "how do you feel" → signs/symptoms / chief complaint
  if (/\b(how (do |are )?you (feel\w*|doing)|what symptoms|what are your symptoms|tell me (about )?your symptoms|what'?s wrong|what'?s (the )?problem|why (am|are we|did we) (called|here)|chief complaint|what'?s going on|how can i help|are you (ok|okay|alright|well))\b/.test(t)) {
    return 'signs-symptoms';
  }

  // Safety net — a clear question must NEVER fall through to a confused
  // "I don't understand". Natural short phrasings the structured patterns miss
  // ("pain?", "do you have any pain?", "are you hurting?", "how are you feeling?",
  // "what doesn't feel right?") are routed by keyword so the patient still answers.
  if (/\bpain\b|\bhurts?\b|\bhurting\b|\bsore\b|ach(e|es|ing)\b|tender|discomfort/.test(t)) return 'pain-current';
  if (/\bfeel\w*\b|symptom\w*|unwell|not (feeling )?right|wrong with you|what'?s up\b/.test(t)) return 'signs-symptoms';

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Response generation — keep responses short and patient-voice natural.
// Long lines feel like reading a case file; one or two sentences feel like
// a patient talking. Supertonic renders prosody well so commas, ellipses,
// and "..." pauses come out humanly.
// ---------------------------------------------------------------------------

export interface ResponseContext {
  /** Severity of patient state — drives how truncated/burdened the speech is. */
  severity: 'mild' | 'severe';
  /** True when GCS ≤ 12 — patient gives partial/slurred answers. */
  altered: boolean;
  /** True when the patient is fighting for air — answers fragment. */
  breathless?: boolean;
  /** Live self-report after treatment; zero is a valid resolved pain score. */
  painScore?: number;
  breathingImproved?: boolean;
}

function joinList(items: string[], conjunction: 'and' | 'or' = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

function formatMedication(m: { name: string; dose?: string; frequency?: string }): string {
  const parts = [m.name];
  if (m.dose) parts.push(m.dose);
  if (m.frequency) parts.push(m.frequency.toLowerCase());
  return parts.join(' ');
}

/** Pick a random variant — keeps repeated questions from sounding canned. */
function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** True if an allergy entry actually denotes NO allergy (NKDA, "none known",
 *  "nil", etc.) — so a patient with `allergies: ['None known']` doesn't claim
 *  to be "allergic to None known". */
function isNoAllergy(a: string): boolean {
  return /^(none|nil|nkda|nka|n\/?a|no known.*|none known.*|no allergies.*|not aware.*|denies.*)$/i.test(a.trim());
}
function hasRealAllergies(allergies?: string[]): string[] {
  return (allergies || []).filter(a => a && !isNoAllergy(a));
}

/**
 * Infer the patient's own words for WHERE the pain/problem is, from the
 * diagnosis and chief complaint. Region (the "R" in OPQRST) is a real exam
 * step that was previously unanswerable.
 */
function authoredClinicalFacts(caseData: CaseScenario): string[] {
  return [
    caseData.history?.eventsLeading,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    ...Object.values(caseData.abcde ?? {}).flatMap(section => section?.findings ?? []),
    ...Object.values(caseData.secondarySurvey ?? {}).flatMap(findings => findings ?? []),
    ...(caseData.expectedFindings?.keyObservations ?? []),
  ].filter((fact): fact is string => Boolean(fact));
}

/**
 * True when the authored clinical/finding TEXT carries a matching cue. Pain
 * character and provocation must only be inferred from authored text — never
 * from the diagnosis string alone (which invites fabrication of quality the
 * case never wrote). Deliberately excludes expectedFindings.mostLikelyDiagnosis.
 */
function authoredTextHasCue(caseData: CaseScenario, pattern: RegExp): boolean {
  return authoredClinicalFacts(caseData).some(fact => pattern.test(fact));
}

function inferPainRegion(caseData: CaseScenario): string {
  const hay = authoredClinicalFacts(caseData).join(' ').toLowerCase();
  const sidedRegion = hay.match(/\b(left|right)[ -](hip|leg|thigh|knee|ankle|foot|arm|shoulder|wrist|hand|flank|chest)\b/);
  if (sidedRegion) return `It’s my ${sidedRegion[1]} ${sidedRegion[2]} — right here.`;
  if (/\b(rlq|right lower quadrant)\b/.test(hay)) return `It’s low down on the right side of my abdomen.`;
  if (/\b(llq|left lower quadrant)\b/.test(hay)) return `It’s low down on the left side of my abdomen.`;
  if (/\b(epigastr|upper central abdomen)\b/.test(hay)) return `It’s high in the middle of my abdomen.`;
  if (/\b(central|centre|middle|substernal|retrosternal) (?:of (?:my|the) )?chest\b|\bbehind (?:my|the) breastbone\b/.test(hay)) return `It’s right here, in the centre of my chest.`;
  if (/chest pain|cardiac|stemi|\bmi\b|angina|pleur|pulmonary embol|pneumo/.test(hay)) return pick(['It’s right here, in my chest.', 'Here — across my chest.']);
  if (/abdom|appendic|cholecyst|pancreat|gastr|bowel|stomach/.test(hay)) return pick(['Down here, in my abdomen.', 'It’s in my abdomen — around here.']);
  if (/head|migraine|stroke|sah|meningitis/.test(hay)) return pick(['In my head.', 'All over my head, mostly the front.']);
  if (/back pain|renal|kidney|aort/.test(hay)) return pick(['In my back.', 'Round my back, on the side.']);
  if (/leg pain|hip pain|femur|pelvi|ankle|knee/.test(hay)) return pick(['My leg — here.', 'Down my leg.']);
  if (/arm pain|shoulder pain|wrist|elbow/.test(hay)) return pick(['My arm.', 'Up here, in my shoulder and arm.']);
  if (/throat|airway|neck pain/.test(hay)) return pick(['My throat — here.', 'In my neck and throat.']);
  return pick(['It’s hard to point to exactly — sort of all over.', 'Around here, mostly.']);
}

function inferPainRadiation(caseData: CaseScenario): string {
  const facts = authoredClinicalFacts(caseData);
  if (facts.some(fact => /\b(no radiation|non[- ]radiating|does(?: not|n't) radiate|stays? (?:in|at) (?:the )?(?:same|one) (?:place|spot))\b/i.test(fact))) {
    return `No — it stays in the one spot.`;
  }

  for (const fact of facts) {
    const radiation = fact.match(/\b(?:radiat(?:es?|ing|ed)|spreads?|travels?|shoots?|goes?)\s+(?:through\s+|down\s+|up\s+|into\s+|to\s+)(?:my\s+|the\s+)?([^.;,]+)/i);
    if (!radiation) continue;
    const destination = radiation[1].replace(/\b(?:with|but|and then)\b.*$/i, '').trim().toLowerCase();
    if (destination) return `Yes — it goes to my ${destination}.`;
  }

  return `No — it stays in the one spot.`;
}

/**
 * Build the patient's answer for a given history category. Returns null
 * when the patient genuinely can't or shouldn't answer (e.g. unknown
 * category with no graceful re-prompt available).
 */
export function generatePatientResponse(
  caseData: CaseScenario,
  category: HistoryCategory,
  ctx: ResponseContext,
): string | null {
  const h = caseData.history;
  const ip = caseData.initialPresentation;

  // Altered-mental-status patients answer haltingly. Rather than wiping every
  // answer to "I don't remember" (which made altered patients useless and
  // sounded like a UI bug), we keep the FACT but deliver it slowly with
  // hesitation markers — a confused patient can still often state a known
  // allergy or regular tablet. Long narrative answers (events/timeline) DO
  // degrade, because recalling a sequence is exactly what's impaired.
  const hesitate = (s: string): string => {
    if (ctx.breathless) {
      const firstClause = s.split(/[.,;]/)[0].trim();
      const body = firstClause.length > 42 ? `${firstClause.slice(0, 38).trim()}...` : firstClause;
      return pick([
        `${body}... can't... talk...`,
        `${body}... I... I can't... get a breath...`,
        `Can't... ${body.charAt(0).toLowerCase() + body.slice(1)}...`,
      ]);
    }
    if (!ctx.altered) return s;
    const opener = pick(['Mm... ', 'Uh... ', 'I think... ', 'Sorry, I... ']);
    // Lowercase the first letter so it flows after the opener — but NOT when
    // the sentence starts with the pronoun "I" ("I'm on…", "I take…").
    const body = /^I[\s']/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
    return opener + body;
  };
  const degradeNarrative = (s: string): string => {
    if (ctx.breathless) {
      // Hyperventilation / severe dyspnoea: keep the STORY in short bursts.
      // The old "Can't... talk much... <first clause>" made "what happened?"
      // unanswerable and read as a UI bug. A panic patient between breaths
      // still tells you the precipitant.
      const clauses = s.split(/[.;]/).map(c => c.trim()).filter(Boolean).slice(0, 3);
      const bursts = clauses.map(c => {
        const short = c.length > 48 ? `${c.slice(0, 44).trim()}…` : c;
        return short.charAt(0).toLowerCase() + short.slice(1);
      });
      return bursts.map((b, i) => (i === 0 ? `${b}` : `… ${b}`)).join('') + '…';
    }
    if (!ctx.altered) return s;
    const firstClause = s.split(/[.,;]/)[0].trim();
    return `Uh... ${firstClause.charAt(0).toLowerCase() + firstClause.slice(1)}... it’s all a bit of a blur, sorry.`;
  };

  const dx = String(caseData.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();

  const answer: string | null = (() => {
  switch (category) {
    case 'introduction':
      return hesitate(pick([
        `Hello... yes, I can hear you.`,
        `Hi... thank you for coming.`,
        `Oh, thank god you're here.`,
      ]));

    case 'orientation':
      if (ctx.altered) return pick([`I... I'm not sure where... what year is it?`, `Where... where am I? I feel funny.`]);
      return `Yes — I know who I am, I know where I am, and I know roughly the time. ${pick(['I feel a bit shaken though.', "I'm just not feeling right."])}`;

    case 'allergies': {
      if (!Array.isArray(h?.allergies)) return hesitate("I can't confirm my allergies right now.");
      const real = hasRealAllergies(h?.allergies);
      if (real.length === 0) {
        return hesitate(pick([`No, none that I know of.`, `No allergies, no.`, `Not that I'm aware of.`]));
      }
      return hesitate(pick([
        `Yes, I'm allergic to ${joinList(real)}.`,
        `I react to ${joinList(real)}.`,
        `Yes — ${joinList(real)}. It's on my records.`,
      ]));
    }

    case 'medications': {
      if (!Array.isArray(h?.medications)) return hesitate("I can't confirm my medications right now.");
      const meds = h?.medications || [];
      if (!meds.length) return hesitate(pick([`No, I'm not on any regular medication.`, `Nothing regular, no.`, `I don't take any tablets.`]));
      const named = meds.map(m => formatMedication(m));
      return hesitate(pick([
        `I take ${joinList(named)}.`,
        `Just my usual — ${joinList(named)}.`,
        `I'm on ${joinList(named)}.`,
      ]));
    }

    case 'past-medical': {
      if (!Array.isArray(h?.medicalConditions)) return hesitate("I can't confirm my medical history right now.");
      const conds = h?.medicalConditions || [];
      const surg = h?.surgicalHistory || [];
      const prev = h?.previousSimilarEpisodes || [];
      if (!conds.length && !surg.length && !prev.length) return hesitate(pick([`No, I've been pretty healthy.`, `Nothing really — I keep well.`, `No medical problems to speak of.`]));
      const parts: string[] = [];
      if (conds.length) parts.push(`I've got ${joinList(conds.map(c => c.toLowerCase()))}`);
      if (surg.length) parts.push(`I had ${joinList(surg.map(s => s.toLowerCase()))}`);
      if (prev.length) parts.push(`this has happened before — ${joinList(prev.map(s => s.toLowerCase()))}`);
      return hesitate(parts.join('. ') + '.');
    }

    case 'last-meal':
      // Never invent a meal/soft memory. When the case hasn't authored one,
      // an honest "I don't remember" is the clinically correct answer.
      return hesitate(h?.lastMeal
        ? pick([`I had ${h.lastMeal.toLowerCase()}.`, `Last thing I ate was ${h.lastMeal.toLowerCase()}.`])
        : pick([`I honestly can't remember when I last ate.`, `I'm not sure — I can't recall when I last had anything.`, `I couldn't tell you when I last ate, sorry.`]));

    case 'events':
      if (!h?.eventsLeading) return degradeNarrative(pick([`I'm not sure. It just... happened.`, `One minute I was fine, then this.`]));
      return degradeNarrative(h.eventsLeading);

    case 'opqrst-onset':
      if (h?.eventsLeading) {
        const m = h.eventsLeading.match(/(\d+\s*(?:minute|hour|day)s?\s*ago|\d+\s*(?:min|hr|h)\s*ago|last (?:night|week|hour)|this (?:morning|afternoon|evening))/i);
        if (m) return hesitate(`It started about ${m[0].toLowerCase()}.`);
      }
      // No authored chronology — never fabricate "half an hour ago". An honest
      // uncertain onset is correct when the case timeline isn't authored.
      return hesitate(pick([`I'm not sure exactly when it started, sorry.`, `I couldn't tell you how long ago it began.`, `I don't really remember when it came on.`]));

    case 'opqrst-provocation': {
      // Provocation/palliation only from AUTHORED text cues — never inferred
      // from the diagnosis label. If the case hasn't written what makes it
      // better or worse, the honest answer is "nothing I've tried changes it".
      const provocationFacts = authoredClinicalFacts(caseData).join(' ');
      if (authoredTextHasCue(caseData, /\bworse (?:when|on|with|if) (?:i )?(?:walk|moving|move|exert|climb|bend|breathe|breath|lie|lying|eat|cough)/i)) {
        if (/breathe|breath|inspir|cough|pleur/i.test(provocationFacts)) return hesitate(`It's worse when I breathe in deeply.`);
        if (/walk|exert|climb/i.test(provocationFacts)) return hesitate(`It got worse when I tried to walk. Nothing really makes it better.`);
        if (/lie|lying|eat/i.test(provocationFacts)) return hesitate(`It's worse when I move or lie a certain way.`);
        return hesitate(`Moving makes it much worse. Staying still helps a bit.`);
      }
      if (authoredTextHasCue(caseData, /\b(?:better|eased?|relieved?|helps?|improv\w+) (?:when|with|by|on|if|after)\b/i)
        || authoredTextHasCue(caseData, /\b(?:sitting (?:up|forward)|leaning forward|curling up|curl up|staying still|with rest)\b/i)) {
        if (/sitting (?:up|forward)|leaning forward/i.test(provocationFacts)) return hesitate(`It's easier when I sit up and lean forward.`);
        if (/curl/i.test(provocationFacts)) return hesitate(`It's worse when I move. Curling up helps a little.`);
        if (/rest|staying still/i.test(provocationFacts)) return hesitate(`Staying still helps. It eases off when I rest.`);
        return hesitate(`I found something that eases it a little.`);
      }
      return hesitate(pick([
        `I don't really know — nothing I've tried changes it much.`,
        `Hard to say — it doesn't seem to get better or worse with anything.`,
        `Nothing seems to make it better or worse, honestly.`,
      ]));
    }

    case 'opqrst-quality': {
      // Pain character comes ONLY from authored text (appearance / findings /
      // events). Never infer "crushing" or "stabbing" from the diagnosis
      // string alone — that's fabrication of what the patient reports.
      const appearance = String(ip?.appearance || '').toLowerCase();
      const qualityFacts = authoredClinicalFacts(caseData).join(' ').toLowerCase();
      if (/crushing/.test(appearance) || /\bcrushing\b/.test(qualityFacts)) return hesitate(`It's like someone's sitting on my chest. Heavy. Crushing.`);
      if (/\b(heavy|pressure|squeez(?:e|ing)|tight(ness)?|weight on)\b/.test(qualityFacts)) return hesitate(pick([`Heavy. Like a pressure, right in the middle.`, `A tight, pressing sort of feeling.`]));
      if (/\b(sharp|stabbing|stabs?|knife|pleuritic)\b/.test(qualityFacts)) return hesitate(`Sharp — a stabbing pain when I breathe in.`);
      if (/\b(burning|burn|stinging|scald)\b/.test(qualityFacts)) return hesitate(`Burning. Stinging. Really bad.`);
      if (/\b(colic|cramping|waves|comes in waves|spasm)\b/.test(qualityFacts)) return hesitate(`It comes in waves — like cramping, then it eases, then back.`);
      if (/\b(gnawing|deep ache|dull)\b/.test(qualityFacts)) return hesitate(`A deep, gnawing ache — worse than anything I've had.`);
      if (/\b(throbb\w+|pounding)\b/.test(qualityFacts)) return hesitate(`It's a throbbing, pounding sort of pain.`);
      // Truly un-authored: the patient cannot describe a character the case
      // never wrote. Honest IDK rather than an invented quality.
      return hesitate(pick([`Aching. Constant. Hard to describe.`, `A dull, heavy ache.`, `It's hard to put into words — it just hurts.`]));
    }

    case 'opqrst-region':
      return inferPainRegion(caseData);

    case 'opqrst-radiation': {
      return inferPainRadiation(caseData);
    }

    case 'opqrst-severity': {
      // Prefer the recorded pain score; else infer from severity context.
      const vitalsPain = ctx.painScore ?? caseData.vitalSignsProgression?.initial?.painScore;
      const findingPain = caseData.abcde?.disability?.findings?.join(' ').match(/(\d+)\s*\/\s*10/)?.[1];
      const num = (typeof vitalsPain === 'number' ? String(vitalsPain) : undefined) ?? findingPain;
      if (num) return `It's about ${num} out of 10.`;
      // Critical physiology is not evidence of pain. Severe asthma, stroke,
      // hypoglycaemia, and syncope must not acquire an invented 8–9/10 score
      // simply because the global response context is severe.
      const diagnosisSuggestsPain = /pain|stemi|\bmi\b|angina|infarct|fracture|appendic|colic|biliary|renal|burn|scald|trauma|injur|dissection|periton|ischaem/.test(dx);
      if (!diagnosisSuggestsPain) {
        return ctx.breathless
          ? `No pain... I just... can't get enough air.`
          : pick([`No pain as such... I just feel very unwell.`, `No — it isn't pain. Something just feels wrong.`]);
      }
      return ctx.severity === 'severe'
        ? pick([`Nine out of ten — it's the worst I've ever felt.`, `Easily an eight or nine. It's bad.`])
        : pick([`Maybe a four or five out of ten.`, `It's there but bearable — a three, four maybe.`]);
    }

    case 'opqrst-time':
      if (h?.eventsLeading) {
        const m = h.eventsLeading.match(/(\d+\s*(?:min|hour|day)s?\s*ago)/i);
        if (m) return hesitate(`Like I said — about ${m[1].toLowerCase()}, and it's been constant since.`);
      }
      // No authored time anchor — don't fabricate a duration/constant history.
      return hesitate(pick([`I'm not sure how long it's been going on, sorry.`, `I couldn't say — I've lost track of time.`, `It's hard for me to say when it started or how long it's lasted.`]));

    case 'social': {
      const s = h?.socialHistory;
      if (!s) return pick([`I'd rather not get into that right now.`, `Nothing much to tell, really.`]);
      const parts: string[] = [];
      if (s.smoking) parts.push(`I smoke — ${s.smoking}`);
      if (s.alcohol) parts.push(`I drink ${s.alcohol.toLowerCase()}`);
      if (s.occupation) parts.push(`I work as a ${s.occupation.toLowerCase()}`);
      if (!parts.length) return `Nothing really to mention.`;
      return hesitate(parts.join('. ') + '.');
    }

    case 'family': {
      const f = h?.familyHistory;
      if (!f?.conditions?.length) return pick([`Nothing major in the family that I know of.`, `No, nothing runs in the family.`]);
      return hesitate(`My family has a history of ${joinList(f.conditions.map(c => c.toLowerCase()))}.`);
    }

    case 'pain-current': {
      if (typeof ctx.painScore === 'number') {
        return hesitate(ctx.painScore === 0
          ? 'No pain at the moment.'
          : `Yes — it is about ${ctx.painScore} out of 10 now.`);
      }
      // Don't invent pain. If the case carries no real pain (e.g. syncope,
      // hypoglycaemia) the patient should say so rather than claim soreness.
      const painScore = caseData.vitalSignsProgression?.initial?.painScore;
      const dxPainful = /pain|stemi|\bmi\b|angina|infarct|fracture|appendic|colic|biliary|renal|burn|scald|trauma|injur|dissection|periton|ischaem/.test(dx);
      const noPain = (typeof painScore === 'number' && painScore <= 1)
        || (painScore === undefined && !dxPainful);
      if (noPain) {
        return hesitate(pick([
          `No, not really any pain — I just felt dizzy and faint.`,
          `No pain as such... just not right in myself.`,
          `No, no pain — more lightheaded than anything.`,
        ]));
      }
      return ctx.severity === 'severe'
        ? pick([`Yes... it's really bad.`, `Yes — it's horrible.`])
        : pick([`Yeah, I'm sore.`, `A bit, yeah.`]);
    }

    case 'signs-symptoms': {
      if (ctx.breathingImproved) return 'Breathing feels easier now. I can talk more comfortably.';
      // NEVER answer from callReason — that is the CALLER's words
      // ("Wife having panic attack, cannot breathe") and the patient would
      // never say "wife having panic attack" about themselves. Speak only
      // from what the patient can feel / how they present.
      const felt = [
        ...(ip?.sounds ?? []),
        ...(caseData.abcde?.breathing?.findings ?? []).filter(f =>
          /breath|short|tight|wheez|dizz|tingl|numb|weak|pain|nausea|faint|palpit|anxious|can'?t|cannot/i.test(f),
        ),
        ip?.appearance,
      ].filter(Boolean).join(' ');
      if (ctx.breathless) {
        return pick([
          `Can't… catch my breath… chest feels tight…`,
          `Everything's… closing in… I… can't get air…`,
          `Heart's pounding… can't… breathe… please…`,
        ]);
      }
      if (/tingl|carpopedal|spasm|hyperventilat|anxious|panic/i.test(felt + ' ' + String(ip?.generalImpression ?? ''))) {
        return pick([
          "My chest feels tight and my heart is racing. I can't get a proper breath.",
          "I feel like I can't breathe — hands are tingling, I feel like I'm going to die.",
          "Everything feels wrong. Chest tight, can't catch my breath, really scared.",
        ]);
      }
      if (/wheez|short|breath|dyspn/i.test(felt)) {
        return pick([
          "I can't get my breath. My chest feels tight.",
          'Breathing is hard work. I can only say a few words.',
        ]);
      }
      if (ip?.appearance) return `${ip.appearance.replace(/[.!?]$/, '')} — that is how I feel.`;
      return `Something's just not right — I felt it come on, and... here we are.`;
    }

    case 'unknown':
      // Generic re-prompts — randomised so it doesn't feel scripted
      return pick(PATIENT_REPROMPTS);
  }
  return null;
  })();

  if (answer == null) return null;
  // Guard: a patient never refers to themselves as "wife/husband/son of…".
  // Callers say that. Keep the voice first-person.
  const cleaned = answer
    .replace(/\b(?:my )?(?:wife|husband|son|daughter|mother|father) (?:is |was |having |has )/gi, 'I am ')
    .replace(/\bWife having\b/gi, 'I am having')
    .replace(/\bHusband (?:called|says)\b/gi, 'I');
  // OPQRST / symptom paths historically returned full sentences. Severe asthma
  // (and any breathless patient) must still fragment — Criterion 4 requires
  // broken speech, not a fluent monologue while "unable to speak in sentences".
  if (ctx.breathless && !/\.\.\./.test(cleaned)) {
    return hesitate(cleaned);
  }
  return cleaned;
}

const PATIENT_REPROMPTS = [
  `I'm not sure what you're asking — try my allergies, my medicines, what happened, or where it hurts.`,
  `Sorry, I didn't quite follow — could you ask about my pain, my medications, or what happened?`,
  `I'm not sure I understand. You could ask about my symptoms, allergies, or when this started.`,
  `Could you rephrase that? I can tell you about my pain, my tablets, or what I was doing when it started.`,
];

/**
 * If the patient is unconscious or unresponsive, collateral history may
 * still be obtainable from bystanders. Returns the bystander-given line
 * when appropriate, or null when there's no-one to ask either.
 */
export function generateCollateralResponse(
  caseData: CaseScenario,
  category: HistoryCategory,
): string | null {
  const bystanders = caseData.sceneInfo?.bystanders;
  if (!sceneHasAskableBystander(caseData)) {
    return `There's no-one here to give collateral history.`;
  }
  const who = pickCollateralVoice(bystanders!);
  const h = caseData.history;

  switch (category) {
    case 'introduction':
      return `${who} responds: "I'm just glad you're here."`;
    case 'allergies': {
      if (!Array.isArray(h?.allergies)) return `${who} cannot confirm the patient's allergies.`;
      const real = hasRealAllergies(h?.allergies);
      if (real.length === 0) return `${who} says they're not aware of any allergies.`;
      return `${who} says: "Allergic to ${joinList(real)}, as far as I know."`;
    }
    case 'medications': {
      if (!Array.isArray(h?.medications)) return `${who} cannot confirm the patient's medications.`;
      const meds = h?.medications || [];
      if (!meds.length) return `${who} says they're not on any regular medication.`;
      return `${who} lists: ${joinList(meds.map(m => formatMedication(m)))}.`;
    }
    case 'past-medical': {
      if (!Array.isArray(h?.medicalConditions)) return `${who} cannot confirm the patient's medical history.`;
      const conds = h?.medicalConditions || [];
      if (!conds.length) return `${who} says they've been generally well — no major medical problems.`;
      return `${who} says: "They've got ${joinList(conds.map(c => c.toLowerCase()))}."`;
    }
    case 'last-meal':
      return h?.lastMeal ? `${who} thinks they last ate ${h.lastMeal.toLowerCase()}.` : `${who} isn't sure when they last ate.`;
    case 'events':
      if (!h?.eventsLeading) return `${who} just says: "I came in and found them like this."`;
      return `${who} describes: "${h.eventsLeading}"`;
    case 'opqrst-onset':
      if (h?.eventsLeading) {
        const m = h.eventsLeading.match(/(\d+\s*(?:minute|hour|day)s?\s*ago|last (?:night|week|hour)|this (?:morning|afternoon|evening))/i);
        if (m) return `${who} says it started about ${m[0].toLowerCase()}.`;
      }
      return `${who} isn't sure exactly when it started.`;
    case 'opqrst-severity':
    case 'opqrst-quality':
    case 'opqrst-provocation':
    case 'opqrst-region':
    case 'opqrst-radiation':
    case 'opqrst-time':
    case 'pain-current':
      // A bystander can only report what they OBSERVED. They can never
      // characterise the patient's pain — one shared, clear refusal.
      return `${who}: "I can only tell you what I saw — I can't speak for their pain."`;
    case 'social':
      return h?.socialHistory ? `${who} confirms: ${describeSocial(h.socialHistory)}` : `${who} doesn't have details on lifestyle.`;
    case 'family':
      return h?.familyHistory?.conditions?.length ? `${who} mentions a family history of ${joinList(h.familyHistory.conditions.map(c => c.toLowerCase()))}.` : `${who} says nothing significant in the family.`;
    case 'orientation':
      return `${who} says they were last seen alert ${recentTimeHint(caseData)}.`;
    case 'signs-symptoms':
      return `${who} found them like this. Chief problem: ${caseData.dispatchInfo?.callReason || 'unwell, cannot get more from them'}.`;
    case 'unknown':
      // Never return null — the UI must not show "(no answer available)".
      // A bystander who didn't catch the question asks what the student wants
      // to know about the patient.
      return `${who}: "I'm not sure I understood — what do you want to know about them?"`;
  }
}

/**
 * Human-readable label for the collateral voice, e.g. "His wife". Exported so
 * the UI can badge bubbles with WHO is speaking. Order matters — more specific
 * relations first, generic fallthrough last.
 */
export function pickCollateralVoice(bystanders: string): string {
  const lower = bystanders.toLowerCase();
  if (/\b(wife)\b/.test(lower)) return 'His wife';
  if (/\b(husband)\b/.test(lower)) return 'Her husband';
  if (/\b(partner|fianc[ée]|girlfriend|boyfriend)\b/.test(lower)) return 'Their partner';
  if (/\b(mother|mum|mom)\b/.test(lower)) return 'The mother';
  if (/\b(father|dad)\b/.test(lower)) return 'The father';
  if (/\b(grandmother|grandmother|gran|nan)\b/.test(lower)) return 'The grandmother';
  if (/\b(grandfather|granddad|grandpa)\b/.test(lower)) return 'The grandfather';
  if (/\b(son)\b/.test(lower)) return 'The son';
  if (/\b(daughter)\b/.test(lower)) return 'The daughter';
  if (/\b(brother|sister|sibling)\b/.test(lower)) return 'A sibling';
  if (/\b(family|relative)\b/.test(lower)) return 'A family member';
  if (/\b(friend|flatmate|roommate|housemate)\b/.test(lower)) return 'A friend';
  if (/\b(neighbou?r|next[- ]door)\b/.test(lower)) return 'A neighbour';
  if (/\b(carer|caregiver|carer|nurse|support worker)\b/.test(lower)) return 'The caregiver';
  if (/\b(colleague|coworker|workmate|work colleague|manager|boss)\b/.test(lower)) return 'A colleague';
  if (/\b(passer[- ]?by|bystander|witness|onlooker|member of (?:the )?public)\b/.test(lower)) return 'A witness';
  if (/\b(cyclist|bicycle|driver|motorist|pedestrian)\b/.test(lower)) return 'A passerby';
  if (/\b(police|officer|pc\b|cop)\b/.test(lower)) return 'A police officer';
  if (/\b(security|guard)\b/.test(lower)) return 'A security guard';
  if (/\b(gp|doctor|gp receptionist|receptionist)\b/.test(lower)) return 'The GP surgery';
  return 'A bystander';
}

function describeSocial(s: NonNullable<CaseScenario['history']['socialHistory']>): string {
  const parts: string[] = [];
  if (s.smoking) parts.push(`smoking: ${s.smoking}`);
  if (s.alcohol) parts.push(`alcohol: ${s.alcohol.toLowerCase()}`);
  if (s.occupation) parts.push(`works as ${s.occupation.toLowerCase()}`);
  return parts.join(', ') || 'nothing notable';
}

function recentTimeHint(caseData: CaseScenario): string {
  const t = caseData.dispatchInfo?.timeOfDay;
  if (t) return `before ${t}`;
  return 'recently';
}

/**
 * Pretty-name a category for the conversation log "coverage" chips.
 */
export const CATEGORY_LABELS: Record<HistoryCategory, string> = {
  'signs-symptoms': 'Signs / Symptoms',
  'allergies': 'Allergies',
  'medications': 'Medications',
  'past-medical': 'Past Medical',
  'last-meal': 'Last Oral Intake',
  'events': 'Events Leading',
  'opqrst-onset': 'Onset',
  'opqrst-provocation': 'Provocation',
  'opqrst-quality': 'Quality',
  'opqrst-region': 'Region (site)',
  'opqrst-radiation': 'Radiation',
  'opqrst-severity': 'Severity',
  'opqrst-time': 'Time / Duration',
  'social': 'Social History',
  'family': 'Family History',
  'orientation': 'Orientation (A&Ox4)',
  'introduction': 'Introduction',
  'pain-current': 'Current Pain',
  'unknown': 'Unclassified',
};

/**
 * The categories used in SAMPLE scoring — the six things a paramedic
 * board will dock marks for missing. Useful for the debrief summary
 * (the rest are bonus context).
 */
export const SAMPLE_CATEGORIES: HistoryCategory[] = [
  'signs-symptoms', 'allergies', 'medications', 'past-medical', 'last-meal', 'events',
];
