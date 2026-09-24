import { describe, expect, it } from 'vitest';
import {
  deriveSeatStyle,
  deriveStandingStance,
  SEAT_STYLE_IDS,
  seatStyleForId,
  seatStyleSeed,
} from './patientSeatStyle';

describe('patientSeatStyle', () => {
  it('is deterministic per case id', () => {
    const a = deriveSeatStyle({ caseId: 'resp-001', mobility: 'seated', posture: 'seated' });
    const b = deriveSeatStyle({ caseId: 'resp-001', mobility: 'seated', posture: 'seated' });
    expect(a).toBe(b);
    expect(seatStyleSeed('resp-001')).toBe(seatStyleSeed('resp-001'));
  });

  it('spreads different cases across the style pool', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    const styles = new Set(ids.map(id => deriveSeatStyle({
      caseId: id, mobility: 'seated', posture: 'seated',
    })));
    expect(styles.size).toBeGreaterThan(2);
  });

  it('keeps young children closed and quiet', () => {
    expect(deriveSeatStyle({
      caseId: 'zzz', mobility: 'seated', posture: 'seated', ageYears: 3,
    })).toBe('closed_quiet');
  });

  it('does not fight an explicit hand guard', () => {
    expect(deriveSeatStyle({
      caseId: 'x', mobility: 'seated', posture: 'seated', handGuardRegion: 'chest',
    })).toBe('attentive');
  });

  it('does not huddle every patient merely because they lean against a wall', () => {
    const wallSit = deriveSeatStyle({
      caseId: 'y2-004', mobility: 'seated', posture: 'seated',
      position: 'Sitting upright against wall, holding hands away from body',
    });
    expect(wallSit).not.toBe('huddle_knees');
    expect(deriveSeatStyle({
      caseId: 'library', mobility: 'seated', posture: 'seated',
      position: 'Sitting on floor against wall with knees drawn up',
    })).toBe('huddle_knees');
  });

  it('keeps a semi-recumbent ground patient supported rather than curled into a huddle', () => {
    const style = deriveSeatStyle({
      caseId: 'resp-010', mobility: 'seated', posture: 'seated',
      position: 'Semi-recumbent on ground, propped against wall',
    });
    expect(style).not.toBe('huddle_knees');
  });

  it('leaves tripod to its authored lean', () => {
    expect(deriveSeatStyle({
      caseId: 'anything', mobility: 'seated', posture: 'tripod',
    })).toBe('attentive');
  });

  it('every style has complete bone offsets', () => {
    for (const id of SEAT_STYLE_IDS) {
      const s = seatStyleForId(id);
      expect(s.leftArm).toHaveLength(3);
      expect(s.rightLeg).toHaveLength(3);
      expect(Number.isFinite(s.spine)).toBe(true);
      expect(Number.isFinite(s.spineYaw)).toBe(true);
    }
  });

  it('standing stance varies but stays subtle', () => {
    const a = deriveStandingStance('case-a');
    const b = deriveStandingStance('case-b-longer');
    expect(Math.abs(a.hipShift)).toBeLessThan(0.1);
    expect(Math.abs(a.spineYaw)).toBeLessThan(0.2);
    // Not required to differ, but the generator must stay finite and tiny.
    expect(Number.isFinite(b.headYaw)).toBe(true);
    expect(Math.abs(b.headYaw)).toBeLessThan(0.3);
  });
});
