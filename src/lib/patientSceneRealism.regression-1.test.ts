import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  deriveNeurologicalWeakSide,
  patientPlantOffsetForSupport,
} from './patientStaging';

function scenario(partial: Partial<CaseScenario>): CaseScenario {
  return partial as CaseScenario;
}

describe('patient scene realism regressions', () => {
  it('derives the anatomical weak side from current clinical findings', () => {
    expect(deriveNeurologicalWeakSide(scenario({
      initialPresentation: {
        generalImpression: 'Obvious right-sided facial droop and slurred speech',
        position: 'Seated upright in armchair',
        appearance: 'Alert, frustrated, unable to lift right arm',
        consciousness: 'Alert',
      },
      abcde: {
        disability: { findings: ['Right facial droop', 'Right arm drift'] },
      } as CaseScenario['abcde'],
    }))).toBe('right');

    expect(deriveNeurologicalWeakSide(scenario({
      initialPresentation: {
        generalImpression: 'Alert but with obvious left-sided weakness',
        position: 'Sitting on sofa, leaning to left',
        appearance: 'Facial droop on left side',
        consciousness: 'Alert',
      },
      secondarySurvey: {
        extremities: ['Left arm: decreased tone, weak grip (0/5 strength)', 'Right side normal'],
        neurological: ['Left hemiparesis — upper limb greater than lower limb'],
      } as CaseScenario['secondarySurvey'],
    }))).toBe('left');
  });

  it('does not infer a deforming pose from facial asymmetry alone or bilateral wording', () => {
    expect(deriveNeurologicalWeakSide(scenario({
      initialPresentation: {
        generalImpression: 'Left facial droop',
        position: 'Standing',
        appearance: 'No limb weakness described',
        consciousness: 'Alert',
      },
    }))).toBeNull();

    expect(deriveNeurologicalWeakSide(scenario({
      secondarySurvey: {
        extremities: ['Generalised bilateral weakness'],
      } as CaseScenario['secondarySurvey'],
    }))).toBeNull();
  });

  it('moves seated chair and sofa patients clear of the backrest without altering beds', () => {
    expect(patientPlantOffsetForSupport('seat', 'seated')).toEqual({ z: 0.98 });
    expect(patientPlantOffsetForSupport('sofa', 'seated')).toEqual({ z: 0.98 });
    expect(patientPlantOffsetForSupport('bed', 'seated')).toBeUndefined();
    expect(patientPlantOffsetForSupport('sofa', 'recumbent')).toBeUndefined();
  });
});
