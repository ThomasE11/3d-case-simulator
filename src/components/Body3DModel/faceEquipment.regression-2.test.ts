import { describe, expect, it } from 'vitest';

import { getFittedFaceEquipmentSpec } from './faceEquipment';

// Regression: ISSUE-024 — only the NRB was attached to the patient head;
// other fitted masks remained camera-facing HTML billboards.
// Found by the continuing /qa realism audit on 2026-09-04.
describe('fitted respiratory face equipment', () => {
  it.each(['simple-mask', 'venturi', 'nonrebreather', 'nebulizer', 'cpap', 'bvm'])(
    'defines patient-space geometry for %s',
    mode => {
      const spec = getFittedFaceEquipmentSpec(mode);

      expect(spec).not.toBeNull();
      expect(spec?.centre[1]).toBeGreaterThan(1.5);
      expect(spec?.centre[2]).toBeLessThan(0.2);
      expect(spec?.width).toBeGreaterThan(0.12);
      expect(spec?.height).toBeGreaterThan(0.12);
    },
  );

  it('does not classify held or invasive circuits as fitted mask planes', () => {
    expect(getFittedFaceEquipmentSpec('ventilator')).toBeNull();
    expect(getFittedFaceEquipmentSpec('nasal')).toBeNull();
  });

  it('classifies BVM as a fitted face plane that connects to oxygen', () => {
    const bvm = getFittedFaceEquipmentSpec('bvm');
    expect(bvm).not.toBeNull();
    // A BVM reservoir is driven from an O₂ source at 15 L/min.
    expect(bvm?.connectsToCylinder).toBe(true);
  });

  it('routes low/high-flow masks to oxygen while CPAP remains a pressure circuit', () => {
    expect(getFittedFaceEquipmentSpec('simple-mask')?.connectsToCylinder).toBe(true);
    expect(getFittedFaceEquipmentSpec('venturi')?.connectsToCylinder).toBe(true);
    expect(getFittedFaceEquipmentSpec('nonrebreather')?.connectsToCylinder).toBe(true);
    expect(getFittedFaceEquipmentSpec('nebulizer')?.connectsToCylinder).toBe(true);
    expect(getFittedFaceEquipmentSpec('cpap')?.connectsToCylinder).toBe(false);
  });
});
