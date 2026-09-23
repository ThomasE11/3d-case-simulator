import { describe, expect, it } from 'vitest';
import {
  deriveExpectedDevices,
  deviceFamiliesForTreatmentId,
  treatmentAttachesDevice,
} from './deviceAttachment';

describe('deviceAttachment', () => {
  it('maps free-text kit to device families', () => {
    const fams = deriveExpectedDevices({
      equipmentNeeded: [
        'High-flow oxygen with nebulizer capability',
        'IV cannulation kit (18G)',
        'Combat Application Tourniquet (CAT)',
        'Bag-valve-mask with reservoir',
      ],
    });
    expect(fams).toEqual(expect.arrayContaining(['oxygen', 'iv', 'bleed']));
  });

  it('reads devices out of the management pathway when kit is missing', () => {
    const fams = deriveExpectedDevices({
      managementPathway: {
        immediate: ['Manual in-line stabilisation of C-spine', 'Apply cervical collar', 'High-flow oxygen 15L'],
      },
    });
    expect(fams).toEqual(expect.arrayContaining(['immobil', 'oxygen']));
  });

  it('knows which treatment ids attach a visible device', () => {
    expect(treatmentAttachesDevice('iv_access')).toBe(true);
    expect(treatmentAttachesDevice('tourniquet')).toBe(true);
    expect(treatmentAttachesDevice('oxygen_nonrebreather')).toBe(true);
    expect(treatmentAttachesDevice('aspirin')).toBe(false);
    expect(treatmentAttachesDevice('reassurance')).toBe(false);
  });

  it('aliases land on the same visual family', () => {
    expect(deviceFamiliesForTreatmentId('iv_cannula')).toContain('iv');
    expect(deviceFamiliesForTreatmentId('fluids_500ml')).toContain('iv');
    expect(deviceFamiliesForTreatmentId('opa_insert')).toContain('airway');
    expect(deviceFamiliesForTreatmentId('ventilated_chest_seal')).toContain('bleed');
  });
});
