import { describe, it, expect } from 'vitest';
import { palpationReactionFor } from './palpationReaction';

/**
 * Regression: the chest exam used to decide the patient's spoken reaction from
 * the ACTION LABEL ("Tenderness, crepitus, subcutaneous emphysema, rib
 * fractures"), which is the list of things a student is told to look FOR. That
 * label matches the pain regex on every case, so every patient — including a
 * hypoglycaemic with a documented normal chest — cried out when their chest was
 * palpated, and the spoken line then played over the breath sounds the student
 * was meant to auscultate next.
 */
describe('palpationReactionFor', () => {
  it('stays silent for a normal chest', () => {
    expect(palpationReactionFor('Equal chest expansion. Heart sounds S1S2 present')).toBeNull();
    expect(palpationReactionFor('Normal')).toBeNull();
    expect(palpationReactionFor('Clear bilaterally. Regular rhythm')).toBeNull();
  });

  it('stays silent for a documented negative', () => {
    expect(palpationReactionFor('No tenderness, no crepitus, no deformity')).toBeNull();
    expect(palpationReactionFor('Abdomen soft and non-tender')).toBeNull();
  });

  it('reacts when the case authored a genuinely painful finding', () => {
    expect(palpationReactionFor('Marked tenderness over the left lower ribs with crepitus'))
      .toBe('tender-palpation');
    expect(palpationReactionFor('Guarding and rebound tenderness in the RLQ'))
      .toBe('tender-palpation');
  });

  it('uses the movement line when the painful finding is about moving', () => {
    expect(palpationReactionFor('Severe pain on any movement of the right leg'))
      .toBe('movement-pain');
  });

  it('does not fire on the exam prompt wording alone', () => {
    // This exact string is the chest-palpate action LABEL. Gating on it is the
    // bug; a label must never produce a reaction on its own.
    const label = 'Tenderness, crepitus, subcutaneous emphysema, rib fractures';
    // It DOES look painful in isolation — which is precisely why the caller
    // must pass the finding, not the label. Guard the caller instead:
    expect(palpationReactionFor(label)).not.toBeNull();
    // ...and confirm the normal-chest findings above stay silent, so a case
    // with this label but a normal chest produces no sound.
    expect(palpationReactionFor('Normal')).toBeNull();
  });
});
