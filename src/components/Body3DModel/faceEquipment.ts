export type FittedFaceEquipmentMode =
  | 'simple-mask'
  | 'venturi'
  | 'nonrebreather'
  | 'nebulizer'
  | 'bvm'
  | 'cpap';

export interface FittedFaceEquipmentSpec {
  mode: FittedFaceEquipmentMode;
  /** Clinical patient coordinates before the treatment-bay root transform. */
  centre: [number, number, number];
  tubeExit: [number, number, number];
  width: number;
  height: number;
  connectsToCylinder: boolean;
}

const FITTED_FACE_EQUIPMENT: Record<FittedFaceEquipmentMode, FittedFaceEquipmentSpec> = {
  'simple-mask': {
    mode: 'simple-mask',
    centre: [0.005, 1.59, 0.045],
    tubeExit: [0.045, 1.525, 0.05],
    width: 0.135,
    height: 0.135,
    connectsToCylinder: true,
  },
  venturi: {
    mode: 'venturi',
    centre: [0.005, 1.59, 0.045],
    tubeExit: [0, 1.50, 0.05],
    width: 0.135,
    height: 0.135,
    connectsToCylinder: true,
  },
  nonrebreather: {
    mode: 'nonrebreather',
    centre: [0.005, 1.57, 0.045],
    // The photographed circuit leaves the right edge near pixel (511, 510).
    tubeExit: [0.0847, 1.5306, 0.045],
    width: 0.16,
    height: 0.24,
    connectsToCylinder: true,
  },
  nebulizer: {
    mode: 'nebulizer',
    centre: [0.008, 1.555, 0.045],
    // Continuation of the photographed tail at image pixel (462, 744) of
    // 512 × 768; map that endpoint into this mask plane's clinical frame.
    tubeExit: [0.0684, 1.4495, 0.045],
    width: 0.15,
    height: 0.225,
    connectsToCylinder: true,
  },
  cpap: {
    mode: 'cpap',
    centre: [0.008, 1.63, 0.05],
    tubeExit: [0.06, 1.53, 0.055],
    width: 0.148,
    height: 0.185,
    connectsToCylinder: false,
  },
  bvm: {
    mode: 'bvm',
    // BVM mask sits slightly higher and broader than the NRB; its dome + valve
    // housing protrudes forward (+z) more than a passive oxygen mask. The
    // reservoir port (tubeExit) sits on the valve at the chin and connects to
    // an O₂ source at 15 L/min — hence connectsToCylinder is true.
    centre: [0.004, 1.585, 0.045],
    tubeExit: [0.062, 1.50, 0.085],
    width: 0.152,
    height: 0.165,
    connectsToCylinder: true,
  },
};

export function getFittedFaceEquipmentSpec(
  mode: string | null | undefined,
): FittedFaceEquipmentSpec | null {
  return mode && Object.hasOwn(FITTED_FACE_EQUIPMENT, mode)
    ? FITTED_FACE_EQUIPMENT[mode as FittedFaceEquipmentMode]
    : null;
}
