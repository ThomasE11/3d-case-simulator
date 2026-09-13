import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { getTreatmentBayTransform } from '@/components/Body3DModel/BodyMesh';
import {
  derivePatientPosture,
  deriveScenePatientStage,
  patientLivePositionPresentation,
} from './patientStaging';

function scenario(position: string, callReason = 'Emergency call'): CaseScenario {
  return {
    initialPresentation: { generalImpression: '', position, appearance: '' },
    dispatchInfo: { callReason },
  } as unknown as CaseScenario;
}

describe('recovery-position staging regression', () => {
  it('recognises explicit lateral positions and newly covered ground locations', () => {
    const poolPatient = scenario('Lying on the left lateral side on the pool deck');
    const stairPatient = scenario('Curled on her side at base of the steps');

    expect(deriveScenePatientStage(poolPatient)).toBe('floor');
    expect(deriveScenePatientStage(stairPatient)).toBe('floor');
    expect(derivePatientPosture(poolPatient, { mobility: 'recumbent' })).toBe('recovery');
    expect(derivePatientPosture(stairPatient, { mobility: 'recumbent' })).toBe('recovery');
  });

  it('uses a grounded partial side-roll instead of the floating 90-degree pose', () => {
    const stretcher = getTreatmentBayTransform('stretcher', 'recovery', 'recumbent', 1);
    const floor = getTreatmentBayTransform('floor', 'recovery', 'recumbent', 1);

    expect(stretcher.rotation).toEqual([-Math.PI / 2, expect.closeTo(75 * Math.PI / 180), 0]);
    expect(stretcher.position[1]).toBeCloseTo(0.5025 + 0.332);
    expect(floor.position[1]).toBeCloseTo(-0.05 + 0.332);
  });

  it('leaves the established supine transform unchanged', () => {
    const supine = getTreatmentBayTransform('stretcher', 'supine', 'recumbent', 1);

    expect(supine.rotation).toEqual([-Math.PI / 2, 0, 0]);
    // Back rests on the 0.5025 m stretcher sheet: root = support + posterior depth.
    expect(supine.position[1]).toBeCloseTo(0.5025 + 0.256);
  });

  it('reports the recovery support surface truthfully', () => {
    const patient = scenario('Lying on right lateral side');

    expect(patientLivePositionPresentation(patient, {
      stage: 'floor', mobility: 'recumbent', posture: 'recovery',
    }).key).toBe('recoveryFloor');
    expect(patientLivePositionPresentation(patient, {
      stage: 'stretcher', mobility: 'recumbent', posture: 'recovery',
    }).key).toBe('recoveryStretcher');
  });
});
