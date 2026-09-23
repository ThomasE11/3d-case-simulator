/**
 * Case kit → attachable device map.
 *
 * Every case either lists `equipmentNeeded` (free-text kit) or names devices
 * in the management pathway / checklist. Students must be able to put those
 * devices ON the patient. This module turns the free text into the same
 * device-family flags the 3D bay already knows how to render, so a case that
 * says "Combat Application Tourniquet" and a case that says "tourniquet
 * application" both light up the limb bleed-control visual when applied.
 */

export type DeviceFamilyId =
  | 'oxygen'
  | 'iv'
  | 'defib'
  | 'bleed'
  | 'airway'
  | 'immobil'
  | 'warming'
  | 'glucose';

export interface DeviceFamilySpec {
  id: DeviceFamilyId;
  label: string;
  /** Matches kit lines, management prose, and treatment ids. */
  match: RegExp;
  /** Treatment-id fragments that should light the visual when applied. */
  treatmentFragments: string[];
}

export const DEVICE_FAMILIES: readonly DeviceFamilySpec[] = [
  {
    id: 'oxygen',
    label: 'Oxygen / BVM / nebuliser',
    match: /oxygen|non[- ]?rebreather|nasal cannula|simple mask|nebuli|cpap|bag[- ]valve|bvm|ventilat|reservoir/i,
    treatmentFragments: ['oxygen', 'nonrebreather', 'nasal_cannula', 'simple_mask', 'nebuli', 'cpap', 'bvm', 'ventilat'],
  },
  {
    id: 'iv',
    label: 'IV / IO access',
    match: /\biv\b|cannul|intra[- ]?osseous|\bio\b|fluid|saline|dextrose|infusion|syringe/i,
    treatmentFragments: ['iv_access', 'iv_cannula', 'fluids_', 'io_', 'intraosseous', '_iv', 'infusion'],
  },
  {
    id: 'defib',
    label: 'Defibrillator / pads',
    match: /defib|aed|shock|cardiovert|\bpads\b|paddles/i,
    treatmentFragments: ['defib', 'shock', 'cardiovert', 'pads', 'aed'],
  },
  {
    id: 'bleed',
    label: 'Bleed control',
    match: /tourniquet|\bcat\b|pressure (?:dressing|bandage)|haemostatic|hemostatic|quikclot|celox|chest seal|wound pack|direct pressure|cling film|gauze/i,
    treatmentFragments: ['tourniquet', 'bleeding_control', 'pressure_dressing', 'haemostatic', 'hemostatic', 'chest_seal', 'wound_pack', 'direct_pressure'],
  },
  {
    id: 'airway',
    label: 'Airway device',
    match: /intubat|laryngoscope|\bopa\b|\bnpa\b|oropharyngeal|nasopharyngeal|cric|\bett\b|endotracheal|suction|yankauer|magill/i,
    treatmentFragments: ['intubat', 'opa_', 'npa_', 'cric', 'surgical_cric', 'orogastric', 'suction'],
  },
  {
    id: 'immobil',
    label: 'Immobilisation',
    match: /spinal board|scoop|vacuum mattress|\bked\b|cervical collar|c-?collar|head blocks|splint|pelvic binder|immobilis|immobiliz/i,
    treatmentFragments: ['spinal_board', 'scoop', 'vacuum_mattress', 'ked', 'cervical_collar', 'c-collar', 'head_blocks', 'splint', 'pelvic_binder', 'immobilis'],
  },
  {
    id: 'warming',
    label: 'Warming / cooling',
    match: /warming blanket|warming|hypotherm|active cooling|targeted temp/i,
    treatmentFragments: ['warming_blanket', 'active_cooling', 'targeted_temp'],
  },
  {
    id: 'glucose',
    label: 'Glucose / naloxone kit',
    match: /glucose|dextrose|glucagon|naloxone|glucometer|blood glucose meter/i,
    treatmentFragments: ['glucose', 'dextrose', 'glucagon', 'naloxone'],
  },
];

export function deviceFamiliesInText(...parts: Array<string | null | undefined>): DeviceFamilyId[] {
  const hay = parts.filter(Boolean).join('\n');
  return DEVICE_FAMILIES.filter(f => f.match.test(hay)).map(f => f.id);
}

/**
 * Device families this case expects to put on the patient, from kit + pathway
 * + checklist. Used by the kit bay (pre-highlight) and the realism audit.
 */
export function deriveExpectedDevices(caseData: {
  equipmentNeeded?: string[] | null;
  managementPathway?: { immediate?: string[]; definitive?: string[] } | null;
  studentChecklist?: Array<{ description?: string }> | null;
}): DeviceFamilyId[] {
  const parts: string[] = [
    ...(caseData.equipmentNeeded ?? []),
    ...(caseData.managementPathway?.immediate ?? []),
    ...(caseData.managementPathway?.definitive ?? []),
    ...(caseData.studentChecklist ?? []).map(s => s.description ?? ''),
  ];
  return deviceFamiliesInText(...parts);
}

/** Treatment-id → families it should light (mirrors Body3D equipment state). */
export function deviceFamiliesForTreatmentId(treatmentId: string): DeviceFamilyId[] {
  const id = treatmentId.toLowerCase();
  return DEVICE_FAMILIES.filter(f =>
    f.treatmentFragments.some(frag => id.includes(frag.toLowerCase())),
  ).map(f => f.id);
}

/** True when applying `treatmentId` should produce a visible device on the body. */
export function treatmentAttachesDevice(treatmentId: string): boolean {
  return deviceFamiliesForTreatmentId(treatmentId).length > 0;
}


/** Universal fit / reassess copy for a device family, used when a scenario
 *  has no anchor of its own. Keeps "put the device on the patient" honest. */
export function fallbackDeviceAnchor(family: DeviceFamilyId): {
  treatmentIdFragments: string[];
  region: 'face' | 'mouth' | 'nose' | 'neck' | 'chest' | 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg' | 'pelvis' | 'posterior' | 'scene';
  appearance: string;
  fitRule: string;
  shouldNotBlock: string[];
  reassess: string[];
} {
  const spec = DEVICE_FAMILIES.find(f => f.id === family);
  const fragments = spec?.treatmentFragments ?? [family];
  switch (family) {
    case 'oxygen':
      return {
        treatmentIdFragments: fragments,
        region: 'face',
        appearance: 'Oxygen / ventilation device sits on the face with tubing routed clear of the eyes.',
        fitRule: 'Seal over nose and mouth; do not cover the eyes or block eye assessment.',
        shouldNotBlock: ['eye assessment', 'mouth inspect'],
        reassess: ['RR', 'SpO2', 'work of breathing', 'chest rise'],
      };
    case 'iv':
      return {
        treatmentIdFragments: fragments,
        region: 'left-arm',
        appearance: 'Cannula and transparent dressing on forearm or hand; line attached when fluids or drugs run.',
        fitRule: 'Keep the site visible for inspection; do not bury it under clothing.',
        shouldNotBlock: ['radial pulse', 'limb inspection'],
        reassess: ['site', 'BP', 'fluid rate', 'distal perfusion'],
      };
    case 'defib':
      return {
        treatmentIdFragments: fragments,
        region: 'chest',
        appearance: 'Defib pads anterior-lateral with leads trailing to the monitor.',
        fitRule: 'Pads must not cover the whole exam chest or hide wounds.',
        shouldNotBlock: ['chest auscultation', 'wound assessment'],
        reassess: ['rhythm', 'pulse', 'skin'],
      };
    case 'bleed':
      return {
        treatmentIdFragments: fragments,
        region: 'left-leg',
        appearance: 'Pressure dressing / tourniquet / packing at the bleeding site.',
        fitRule: 'Device sits on the wound, not on uninjured skin.',
        shouldNotBlock: ['distal pulse'],
        reassess: ['bleeding', 'distal pulse', 'shock trend'],
      };
    case 'airway':
      return {
        treatmentIdFragments: fragments,
        region: 'mouth',
        appearance: 'Airway adjunct or tube in situ; suction ready if secretions or vomit.',
        fitRule: 'Do not block the mouth inspect action once the airway is secured.',
        shouldNotBlock: ['mouth inspect'],
        reassess: ['airway patency', 'chest rise', 'EtCO2', 'vomiting'],
      };
    case 'immobil':
      return {
        treatmentIdFragments: fragments,
        region: 'neck',
        appearance: 'Collar / board / splint / binder applied to the injured region.',
        fitRule: 'Device must not hide the injury it is immobilising.',
        shouldNotBlock: ['wound assessment'],
        reassess: ['distal pulse', 'neurovascular check', 'pain'],
      };
    case 'warming':
      return {
        treatmentIdFragments: fragments,
        region: 'chest',
        appearance: 'Warming or cooling blanket over the torso.',
        fitRule: 'Keep face and chest exam accessible under the blanket edge.',
        shouldNotBlock: ['chest auscultation', 'face assessment'],
        reassess: ['temperature', 'shivering', 'core temp trend'],
      };
    case 'glucose':
      return {
        treatmentIdFragments: fragments,
        region: 'right-arm',
        appearance: 'Glucose / naloxone kit at the bedside; IV or IM route used as indicated.',
        fitRule: 'Medication is documented; no bulky device on the body unless a line is running.',
        shouldNotBlock: ['radial pulse'],
        reassess: ['BGL', 'GCS', 'RR', 'pupils'],
      };
  }
}
