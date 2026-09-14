import { describe, expect, it } from 'vitest';

import {
  GARMENT_GLBS,
  RESP001_GARMENT_GLBS,
  shirtHemDropForSpec,
} from './ClothingLayer';

describe('resp-001 shirt-hem ownership', () => {
  it('keeps the tripod shirt on the same controlled 50 mm overlap as the generic profile', () => {
    const standardShirt = GARMENT_GLBS.find(garment => garment.name === 'scrub-top');
    const resp001Shirt = RESP001_GARMENT_GLBS.find(garment => garment.name === 'scrub-top');

    expect(standardShirt).toBeDefined();
    expect(resp001Shirt).toBeDefined();
    expect(shirtHemDropForSpec(standardShirt!)).toBeCloseTo(0.05);
    expect(shirtHemDropForSpec(resp001Shirt!)).toBeCloseTo(0.05);
  });

  it('uses a case-owned clean-hem shirt asset with the standard material contract', () => {
    const standardShirt = GARMENT_GLBS.find(garment => garment.name === 'scrub-top');
    const resp001Shirt = RESP001_GARMENT_GLBS.find(garment => garment.name === 'scrub-top');

    expect(resp001Shirt).not.toBe(standardShirt);
    expect(resp001Shirt).toMatchObject({
      url: '/models/garment-shirt-resp001.glb',
      name: standardShirt!.name,
      color: standardShirt!.color,
      offset: standardShirt!.offset,
      hemDrop: 0.05,
    });
  });
});
