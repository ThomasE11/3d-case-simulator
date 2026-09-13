import { describe, it, expect } from 'vitest';
import { sceneArrivalCopy } from './sceneArrival';
import type { CaseScenario } from '@/types';

const baseCase = {
  title: 'Life-Threatening Asthma Attack',
  dispatchInfo: {
    callReason: 'Son cannot breathe',
    timeOfDay: 'evening' as const,
    location: 'Villa in Al Ain',
    callerInfo: 'Mother',
  },
} as unknown as CaseScenario;

describe('sceneArrivalCopy', () => {
  it('announces arrival for a scene-visualised case', () => {
    const copy = sceneArrivalCopy({
      ...baseCase,
      sceneInfo: {
        description: 'Bedroom',
        hazards: [],
        bystanders: 'Parents',
        environment: 'Dusty',
        sceneImageCaption: 'Villa living room — Al Ain',
      },
    } as CaseScenario);
    expect(copy).toEqual({
      kicker: 'ON SCENE',
      title: 'Villa living room — Al Ain',
      sub: 'Villa in Al Ain',
    });
  });

  it('omits the sub line when location matches the caption', () => {
    const copy = sceneArrivalCopy({
      ...baseCase,
      dispatchInfo: { ...baseCase.dispatchInfo, location: 'Villa living room — Al Ain' },
      sceneInfo: {
        description: 'x',
        hazards: [],
        bystanders: 'y',
        environment: 'z',
        sceneImageCaption: 'Villa living room — Al Ain',
      },
    } as CaseScenario);
    expect(copy?.sub).toBeUndefined();
    expect(copy?.title).toBe('Villa living room — Al Ain');
  });

  it('returns null when the case has no scene caption', () => {
    expect(
      sceneArrivalCopy({
        ...baseCase,
        sceneInfo: { description: 'x', hazards: [], bystanders: 'y', environment: 'z' },
      } as CaseScenario),
    ).toBeNull();
  });

  it('returns null for a null / undefined case', () => {
    expect(sceneArrivalCopy(null)).toBeNull();
    expect(sceneArrivalCopy(undefined)).toBeNull();
  });
});
