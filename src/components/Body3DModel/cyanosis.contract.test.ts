import { describe, it, expect } from 'vitest';
import { deriveCyanosisLocalStrength } from './skinTint';

/**
 * GOAL_CONTRACT.md criterion B4 (item 6):
 * "Cyanosis: lips/nailbeds tint dusky at SpO2 85, clear at 94."
 *
 * This test explicitly asserts the contract requirement with the exact values
 * stated in the acceptance criteria. The broader unit tests in skinTint.test.ts
 * remain as regression guards; this test exists solely to prove B4.
 */
describe('GOAL_CONTRACT B4: SpO2-driven cyanosis', () => {
  it('clears at SpO2 94 (contract: "clear at 94")', () => {
    const strength = deriveCyanosisLocalStrength({ spo2: 94 });
    expect(strength).toBe(0);
  });

  it('tints dusky at SpO2 85 (contract: "dusky at 85")', () => {
    const strength = deriveCyanosisLocalStrength({ spo2: 85 });
    expect(strength).toBe(0.7);
  });

  it('remains clear above 94', () => {
    expect(deriveCyanosisLocalStrength({ spo2: 95 })).toBe(0);
    expect(deriveCyanosisLocalStrength({ spo2: 98 })).toBe(0);
    expect(deriveCyanosisLocalStrength({ spo2: 100 })).toBe(0);
  });

  it('deepens progressively below 85', () => {
    const at84 = deriveCyanosisLocalStrength({ spo2: 84 });
    const at80 = deriveCyanosisLocalStrength({ spo2: 80 });
    const at70 = deriveCyanosisLocalStrength({ spo2: 70 });
    expect(at84).toBeGreaterThan(0.7);
    expect(at80).toBeGreaterThan(at84);
    expect(at70).toBeGreaterThan(at80);
    expect(at70).toBeLessThanOrEqual(0.9);
  });

  it('uses scenario cyanosis only when no live SpO2 is present', () => {
    expect(deriveCyanosisLocalStrength(undefined, undefined, 0.8)).toBeGreaterThan(0);
    expect(deriveCyanosisLocalStrength({ spo2: 96 }, null, 0.8)).toBe(0);
  });
});
