import { describe, expect, it } from 'vitest';
import { parseBystanders } from './bystanderCount';

describe('parseBystanders', () => {
  it('returns zero for empty / None', () => {
    expect(parseBystanders('None').count).toBe(0);
    expect(parseBystanders('').count).toBe(0);
    expect(parseBystanders(undefined).count).toBe(0);
    expect(parseBystanders('none').count).toBe(0);
  });

  it('reads explicit digits and caps the render crowd', () => {
    expect(parseBystanders('Approximately 40 people: uninjured bus passengers').count).toBe(24);
    expect(parseBystanders('3 other workers with symptoms, farm supervisor').count).toBe(3);
    expect(parseBystanders('2 siblings watching').count).toBe(2);
  });

  it('reads word numbers', () => {
    expect(parseBystanders('Mother, grandmother, two siblings watching').count).toBe(2);
    expect(parseBystanders('Husband and two children').count).toBe(2);
  });

  it('counts plural nouns when no number is written', () => {
    const r = parseBystanders('Multiple co-workers, site foreman, first aid officer');
    expect(r.count).toBeGreaterThanOrEqual(2);
    expect(r.count).toBeLessThanOrEqual(24);
    expect(r.inferred).toBe(true);
  });

  it('returns one figure for a singular role', () => {
    expect(parseBystanders('Wife present, anxious').count).toBe(1);
    expect(parseBystanders('Housekeeper').count).toBe(1);
    expect(parseBystanders('Nurse present').count).toBe(1);
  });

  it('picks posture from the text', () => {
    expect(parseBystanders('Wife, kneeling beside the patient').posture).toBe('kneeling');
    expect(parseBystanders('Several colleagues, sitting on the kerb').posture).toBe('sitting');
    expect(parseBystanders('Coworkers, crouching around the machine').posture).toBe('crouching');
    expect(parseBystanders('Bystander, lying on the grass beside the bike').posture).toBe('lying');
    expect(parseBystanders('Several colleagues').posture).toBe('standing');
  });

  it('never exceeds the render cap even for a hundred', () => {
    expect(parseBystanders('One hundred onlookers').count).toBe(24);
  });

  it('produces a human label', () => {
    expect(parseBystanders('Wife').label).toBe('1 bystander');
    expect(parseBystanders('40 people').label).toBe('24 bystanders');
  });
});