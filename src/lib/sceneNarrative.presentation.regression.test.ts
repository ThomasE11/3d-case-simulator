import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildSceneVisualBrief, getScenePresentationDescription } from './sceneNarrative';

describe('scene presentation descriptions', () => {
  it('keeps the resp-001 briefing aligned with its authored villa living-room scene', () => {
    const scenario = allCases.find(caseData => caseData.id === 'resp-001');

    expect(scenario).toBeDefined();
    expect(scenario!.sceneInfo.description).toBe(
      'Villa living room, patient seated upright on the sofa in tripod position',
    );
    expect(getScenePresentationDescription(scenario!)).toBe(
      'Villa living room, patient seated upright in tripod position',
    );
  });

  it('falls back to the protected clinical scene description for every other case', () => {
    const scenario = allCases.find(caseData => caseData.id === 'cardiac-001');

    expect(scenario).toBeDefined();
    expect(getScenePresentationDescription(scenario!)).toBe(scenario!.sceneInfo.description);
  });

  it('uses the same approved setting in downstream scene briefing cues', () => {
    const scenario = allCases.find(caseData => caseData.id === 'resp-001');
    const brief = buildSceneVisualBrief(scenario!);

    expect(brief.environmentCues).toContain('Villa living room, patient seated upright in tripod position');
    expect(brief.environmentCues.join(' ')).not.toContain('Bedroom, patient sitting on edge of bed');
  });
});
