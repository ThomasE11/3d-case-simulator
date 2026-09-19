import { describe, it, expect } from 'vitest';
import { spriteKindFor, hashInjury, vertexMatchesRegion, woundRotationFor } from './WoundLayer';

describe('spriteKindFor', () => {
  it('maps the field-reported case: surgical wound, red and draining', () => {
    expect(spriteKindFor({ kind: 'wound', label: 'Surgical wound', detail: 'Surgical wound, red and draining pus' }))
      .toBe('infected-incision');
  });
  it('clean surgical incision', () => {
    expect(spriteKindFor({ kind: 'wound', label: 'Incision', detail: 'Healing surgical incision, sutures intact' }))
      .toBe('surgical-incision');
  });
  it('generic wound falls back to laceration; abrasions detected from text', () => {
    expect(spriteKindFor({ kind: 'wound', label: 'Wound', detail: 'Deep cut to the forearm' })).toBe('laceration');
    expect(spriteKindFor({ kind: 'bleeding', label: 'Road rash', detail: 'Extensive road rash to the flank' })).toBe('abrasion');
    expect(spriteKindFor({ kind: 'bleeding', label: 'Bleeding', detail: 'Active bleeding from scalp' })).toBe('active-bleeding');
  });
  it('burns and bruises map directly; shape findings produce no decal', () => {
    expect(spriteKindFor({ kind: 'burn', label: 'Burn', detail: 'Partial thickness burn' })).toBe('burn');
    expect(spriteKindFor({ kind: 'bruising', label: 'Bruise', detail: 'Flank bruising' })).toBe('bruise');
    expect(spriteKindFor({ kind: 'deformity', label: 'Deformity', detail: 'Angulated forearm' })).toBeNull();
    expect(spriteKindFor({ kind: 'distension', label: 'JVD', detail: 'Distended neck veins' })).toBeNull();
    expect(spriteKindFor({ kind: 'swelling', label: 'Swelling', detail: 'Ankle swelling' })).toBeNull();
  });
});

describe('hashInjury', () => {
  it('is deterministic and spreads distinct ids', () => {
    expect(hashInjury('chest-wound-1')).toBe(hashInjury('chest-wound-1'));
    expect(hashInjury('chest-wound-1')).not.toBe(hashInjury('chest-wound-2'));
    expect(hashInjury('a')).toBeGreaterThanOrEqual(0);
  });
});

describe('woundRotationFor', () => {
  it('keeps surgical incisions aligned vertically while other wounds remain deterministic', () => {
    expect(woundRotationFor('infected-incision', 123)).toBe(Math.PI / 2);
    expect(woundRotationFor('surgical-incision', 987)).toBe(Math.PI / 2);
    expect(woundRotationFor('laceration', 123)).toBe(woundRotationFor('laceration', 123));
  });
});

describe('urticaria decals', () => {
  it('routes a rash injury to the urticaria sprite', () => {
    expect(spriteKindFor({ kind: 'rash', label: 'Urticaria', detail: 'Raised weals' }))
      .toBe('urticaria');
  });

  it('still treats road rash as an abrasion, not urticaria', () => {
    expect(spriteKindFor({ kind: 'bleeding', label: 'Road rash', detail: 'Graze to forearm' }))
      .toBe('abrasion');
  });
});

describe('soot decals', () => {
  it('routes a soot injury to the soot sprite', () => {
    expect(spriteKindFor({ kind: 'soot', label: 'Soot', detail: 'Around nose and mouth' }))
      .toBe('soot');
  });
});

describe('vertexMatchesRegion laterality', () => {
  it('keeps a left-chest vertex and rejects the right hemithorax', () => {
    expect(vertexMatchesRegion(0.06, 1.27, 0.12, 'chest', 'left')).toBe(true);
    expect(vertexMatchesRegion(-0.06, 1.27, 0.12, 'chest', 'left')).toBe(false);
    expect(vertexMatchesRegion(-0.06, 1.27, 0.12, 'chest', 'right')).toBe(true);
    expect(vertexMatchesRegion(0.06, 1.27, 0.12, 'chest', 'right')).toBe(false);
  });

  it('does not drop a midline vertex when laterality is omitted', () => {
    expect(vertexMatchesRegion(0, 1.27, 0.12, 'chest')).toBe(true);
  });
});
