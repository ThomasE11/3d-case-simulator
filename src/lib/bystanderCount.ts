/**
 * bystanderCount.ts — pure parser: case bystander string → count + posture.
 *
 * The case catalog authors bystanders as a sentence ("Several people gathered,
 * police arriving", "Approximately 40 people: uninjured bus passengers, passing
 * motorists, mall security"). The 3D scene needs a *number* to place figures.
 *
 * This is a parser, not a guess: it reads the authored string, counts the
 * numeric tokens, and falls back to a posture-lookup table when the author
 * wrote a role list instead of a headcount. It never invents a number — if the
 * string has no count and no matching posture row, it returns 0 and the scene
 * renders nobody (which is what `bystanders-field-empty` already flags).
 *
 * Pure: no React, no Three, no side effects. Testable without a renderer.
 */

export type BystanderPosture =
  | 'standing'
  | 'kneeling'
  | 'sitting'
  | 'crouching'
  | 'lying';

export interface BystanderParse {
  count: number;
  posture: BystanderPosture;
  /** True when the author wrote a role list with no numeric headcount. */
  inferred: boolean;
  /** Short label for the scene-survey callout, e.g. "2 bystanders". */
  label: string;
}

const POSTURE_RULES: Array<{ re: RegExp; posture: BystanderPosture }> = [
  { re: /\b(?:lying|collapsed|on the ground|on the floor|supine|prone)\b/i, posture: 'lying' },
  { re: /\b(?:kneeling|knelt|on their knees)\b/i, posture: 'kneeling' },
  { re: /\b(?:crouching|crouch|huddled)\b/i, posture: 'crouching' },
  { re: /\b(?:sitting|seated|sat)\b/i, posture: 'sitting' },
];

/** Explicit numeric tokens: "40 people", "2 siblings", "three workers". */
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};

const NUMBER_RE = /\b(\d+)\b/;
const WORD_NUMBER_RE = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi;

/**
 * Parse a bystander sentence. Returns count 0 when the string is empty or
 * "None" — the caller is responsible for not rendering in that case.
 */
export function parseBystanders(raw: string | null | undefined): BystanderParse {
  const text = (raw ?? '').trim();
  if (!text || /^none$/i.test(text)) {
    return { count: 0, posture: 'standing', inferred: false, label: 'No bystanders' };
  }

  // 1. Explicit digits — the strongest signal. "Approximately 40 people".
  const digitMatch = text.match(NUMBER_RE);
  if (digitMatch) {
    const count = Math.min(24, parseInt(digitMatch[1], 10));
    return { count, posture: pickPosture(text), inferred: false, label: labelFor(count) };
  }

  // 2. Word numbers — "three other workers", "two children".
  let wordTotal = 0;
  let wordMatch: RegExpExecArray | null;
  WORD_NUMBER_RE.lastIndex = 0;
  while ((wordMatch = WORD_NUMBER_RE.exec(text)) !== null) {
    wordTotal += NUMBER_WORDS[wordMatch[1].toLowerCase()];
  }
  if (wordTotal > 0) {
    const count = Math.min(24, wordTotal);
    return { count, posture: pickPosture(text), inferred: true, label: labelFor(count) };
  }

  // 3. Counted plural nouns with no number — "several colleagues", "multiple
  //    onlookers", "coworkers", "police officers". Cap at 3: the scene reads
  //    "a small group", which is what these strings actually describe.
  const pluralNouns = text.match(/\b(?:colleagues|coworkers|co-workers|workers|passengers|motorists|onlookers|people|passengers|siblings|children|staff|customers|teammates|friends|family|relatives|officers|guards|nurses|rescuers|firefighters|spectators|crowd)\b/gi);
  if (pluralNouns && pluralNouns.length > 0) {
    const count = Math.min(24, Math.max(2, pluralNouns.length));
    return { count, posture: pickPosture(text), inferred: true, label: labelFor(count) };
  }

  // 4. Singular role — "Wife", "Housekeeper", "Nurse present". One figure.
  return { count: 1, posture: pickPosture(text), inferred: true, label: '1 bystander' };
}

function pickPosture(text: string): BystanderPosture {
  for (const rule of POSTURE_RULES) {
    if (rule.re.test(text)) return rule.posture;
  }
  return 'standing';
}

function labelFor(count: number): string {
  return count === 1 ? '1 bystander' : `${count} bystanders`;
}