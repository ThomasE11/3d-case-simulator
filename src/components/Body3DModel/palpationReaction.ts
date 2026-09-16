const PAIN_FINDING = /\b(?:tender\w*|pain\w*|sore\w*|guard\w*|rigid\w*|rebound|crepitus|deform\w*|fracture\w*|swelling|unstable|bruis\w*|contusion\w*|burn\w*)\b/i;

/** Presentation only: a documented negative must not become a painful reaction.
 * Keep negated lists together ("no guarding, rigidity or rebound") but restart
 * at a contrast ("no guarding, but focal tenderness"). Ambiguous negative
 * clauses do not justify inventing a spoken complaint.
 */
/**
 * Which spoken reaction a palpation earns, if any.
 *
 * Decided by the REVEALED FINDING, never by the action's label. Labels are
 * prompts for the student ("Tenderness, crepitus, rib fractures" = the list
 * of things to look FOR), so matching them made every patient cry out on
 * every chest palpation regardless of what the case actually authored.
 */
export function palpationReactionFor(finding: string): 'movement-pain' | 'tender-palpation' | null {
  if (!hasPainfulPalpationFinding(finding)) return null;
  return /\b(?:move|moved|moving|movement|range of motion|rom|flex\w*|extend\w*|rotat\w*)\b/i.test(finding)
    ? 'movement-pain'
    : 'tender-palpation';
}

export function hasPainfulPalpationFinding(finding: string): boolean {
  return finding.split(/[.;!\n]|\b(?:but|however|yet|although|with)\b/i).some(clause => {
    const affirmative = clause
      .replace(/\b(?:non[ -]?tender\w*|pain[ -]?free|painless)\b/gi, ' ')
      .replace(/\b(?:no|not|without|denies|denied|denying|nil|negative for|free of|ruled out)\b.*$/gi, ' ')
      .replace(/\b(?:tender\w*|pain\w*|sore\w*|guard\w*|rigid\w*|rebound|crepitus|deform\w*|fracture\w*|swelling|bruis\w*|contusion\w*)\b[^,]*\b(?:absent|negative)\b/gi, ' ');
    return PAIN_FINDING.test(affirmative);
  });
}
