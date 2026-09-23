#!/usr/bin/env node
// @ts-check
/**
 * Case realism auditor — every case, three contracts:
 *   1. Patient simulation  — a matched realism scenario, at least one visible
 *                            sign, and a staging/mobility that the body can render.
 *   2. Environment         — an environment variant + support surface the 3D
 *                            bay can actually stand up (chair/sofa/floor/bed).
 *   3. Device attachment   — treatments the case expects can land on the
 *                            patient: oxygen, IV, pads, bleed control, airway,
 *                            immobilisation all have visual anchors.
 *
 * Usage:  node scripts/audit-case-realism.mjs [--json] [--id <case-id>]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

const { allCases } = jiti('./src/data/cases.ts');
const { matchRealismScenarios, deriveRealismScenarioState } = jiti('./src/lib/patientRealismScenarios.ts');
const { derivePatientVisualState } = jiti('./src/lib/patientVisualState.ts');
const { deriveRealismDirectorState } = jiti('./src/lib/patientRealismDirector.ts');
const { deriveSceneEnvironment } = jiti('./src/lib/sceneEnvironment.ts');
const {
  derivePatientMobility,
  derivePatientPosture,
  deriveScenePatientStage,
  derivePatientSupportSurface,
  patientPlantOffsetForSupport,
} = jiti('./src/lib/patientStaging.ts');
const { deriveSeatStyle } = jiti('./src/lib/patientSeatStyle.ts');
const { deriveExpectedDevices, deviceFamiliesForTreatmentId, DEVICE_FAMILIES: FAM_SPECS } = jiti('./src/lib/deviceAttachment.ts');

const DEVICE_ALIAS_IDS = {
  oxygen: ['oxygen_mask', 'oxygen_nonrebreather', 'nasal_cannula', 'nebulizer', 'bvm', 'cpap'],
  iv: ['iv_access', 'iv_cannula', 'fluids_500ml', 'io_access'],
  defib: ['defibrillation', 'defib_pads'],
  bleed: ['tourniquet', 'bleeding_control', 'pressure_dressing', 'chest_seal'],
  airway: ['opa_insert', 'intubation', 'suction', 'surgical_cric'],
  immobil: ['cervical_collar', 'spinal_board', 'pelvic_binder', 'splint'],
  warming: ['warming_blanket', 'active_cooling'],
  glucose: ['glucose_10g', 'dextrose_10', 'naloxone_04mg'],
};
function famMatches(fragment, famId) {
  return deviceFamiliesForTreatmentId(fragment).includes(famId);
}

const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const idFilter = args.includes('--id') ? args[args.indexOf('--id') + 1] : undefined;

/** Treatments that MUST show up on the body when applied. */
const DEVICE_FAMILIES = [
  { id: 'oxygen', match: /oxygen|nonrebreather|nasal_cannula|simple_mask|nebuli|cpap|bvm|ventilat/i, need: 'oxygen/BVM face device' },
  { id: 'iv', match: /iv_access|iv_cannula|fluids_|_iv$|io_access|intraosseous/i, need: 'IV/IO access' },
  { id: 'defib', match: /defib|shock|cardiovert|pads/i, need: 'defib pads' },
  { id: 'bleed', match: /tourniquet|bleeding_control|pressure_dressing|haemostatic|hemostatic|chest_seal|wound_pack/i, need: 'bleed-control device' },
  { id: 'airway', match: /intubat|opA|npA|cric|surgical_airway|ett/i, need: 'airway device' },
  { id: 'immobil', match: /spinal_board|scoop|vacuum_mattress|ked|cervical_collar|c-collar|splint|pelvic_binder/i, need: 'immobilisation device' },
];

function treatmentIds(c) {
  const out = new Set();
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node !== 'object') return;
    if (typeof node.id === 'string' && typeof node.name === 'string') out.add(node.id);
    // protocol step treatmentId fields
    if (typeof node.treatmentId === 'string') out.add(node.treatmentId);
    Object.values(node).forEach(walk);
  };
  walk(c.managementPathway);
  walk(c.expectedFindings);
  walk(c.scoring);
  walk(c.treatments);
  return [...out];
}

function equipmentStateFlags(appliedIds) {
  // Mirror Body3DModel/buildTreatmentEquipmentState coverage at audit time.
  const joined = appliedIds.join(' | ').toLowerCase();
  return {
    oxygen: DEVICE_FAMILIES[0].match.test(joined),
    iv: DEVICE_FAMILIES[1].match.test(joined),
    defib: DEVICE_FAMILIES[2].match.test(joined),
    bleed: DEVICE_FAMILIES[3].match.test(joined),
    airway: DEVICE_FAMILIES[4].match.test(joined),
    immobil: DEVICE_FAMILIES[5].match.test(joined),
  };
}

const rows = [];
for (const c of allCases) {
  if (idFilter && c.id !== idFilter) continue;
  const findings = [];

  // --- Patient simulation ---
  const scenarios = matchRealismScenarios(c);
  if (scenarios.length === 0) {
    findings.push({ severity: 'ERROR', rule: 'no-realism-scenario', detail: 'case matches no realism scenario — patient presents blank' });
  }
  let visual = { skinEffects: [], woundOverlays: [], eyeEffects: { kind: 'normal' }, vomitRisk: false };
  try {
    const director = deriveRealismDirectorState({
      caseData: c,
      vitals: c.vitalSignsProgression?.initial ?? null,
      appliedTreatmentIds: [],
    });
    visual = derivePatientVisualState(director);
    const signs =
      visual.skinEffects.length +
      visual.woundOverlays.length +
      (visual.eyeEffects.kind !== 'normal' ? 1 : 0) +
      (visual.facialDroop > 0 ? 1 : 0) +
      (visual.breathingEffort > 0 ? 1 : 0);
    if (signs === 0 && scenarios.length > 0) {
      findings.push({ severity: 'WARN', rule: 'no-visible-sign', detail: 'scenario matched but first-look patient shows no sign' });
    }
  } catch (e) {
    findings.push({ severity: 'ERROR', rule: 'visual-derive-failed', detail: String(e && e.message ? e.message : e) });
  }

  const unconscious = /unresponsive|unconscious|GCS.?3|GCS.?4|GCS.?5|GCS.?6|GCS.?7|GCS.?8/i.test(
    `${c.initialPresentation?.consciousness ?? ''} ${c.initialPresentation?.generalImpression ?? ''}`,
  );
  const mobility = derivePatientMobility(c, unconscious);
  const posture = derivePatientPosture(c, { mobility, unconscious, respiration: c.abcde?.breathing?.rate ?? null });
  const stage = deriveScenePatientStage(c);
  const support = derivePatientSupportSurface(c, { stage, mobility, loadedOnStretcher: false });
  const plant = patientPlantOffsetForSupport(support, mobility);
  const seatStyle = deriveSeatStyle({
    caseId: c.id,
    mobility,
    posture,
    ageYears: c.patientInfo?.age,
  });
  if (mobility === 'seated' && !posture) {
    findings.push({ severity: 'ERROR', rule: 'seated-without-posture', detail: 'seated mobility but no renderable posture morph' });
  }
  if (mobility === 'seated' && support === 'seat' && !plant) {
    findings.push({ severity: 'WARN', rule: 'seat-without-plant', detail: 'seat support but no plant offset — risk of legs in furniture' });
  }

  // --- Environment ---
  const variant = deriveSceneEnvironment(c);
  if (!variant) {
    findings.push({ severity: 'ERROR', rule: 'no-environment', detail: 'no environment variant' });
  }
  const hasSceneText = Boolean(
    c.sceneInfo?.description || c.sceneInfo?.environment || c.dispatchInfo?.location,
  );
  if (!hasSceneText) {
    findings.push({ severity: 'WARN', rule: 'thin-scene-text', detail: 'little authored scene prose for staging/props' });
  }

  // --- Device attachment ---
  // Expectations come from kit + pathway + checklist (free text), not from
  // treatment ids already applied — those start empty on a fresh case.
  const expectedDevices = deriveExpectedDevices(c);
  const scenarioAnchors = scenarios.flatMap(s => s.equipmentAnchors ?? []);
  for (const fam of expectedDevices) {
    // The 3D bay lights a device when its treatment id is applied. We only
    // require that SOME applyable id exists for this family (alias map).
    const applyable = DEVICE_ALIAS_IDS[fam]?.length > 0;
    const anchored = scenarioAnchors.some(a =>
      (a.treatmentIdFragments ?? []).some(f => famMatches(f, fam)),
    );
    if (!applyable) {
      findings.push({
        severity: 'ERROR',
        rule: 'device-unattachable',
        detail: `case expects ${fam} but no treatment id can attach it`,
      });
    } else if (!anchored) {
      findings.push({
        severity: 'WARN',
        rule: 'device-no-scenario-anchor',
        detail: `case expects ${fam}; visual exists via equipment state but scenario has no anchor (fit/reassess copy missing)`,
      });
    }
  }

  rows.push({
    id: c.id,
    title: c.title,
    family: scenarios[0]?.id ?? '—',
    variant,
    mobility,
    posture,
    support,
    seatStyle,
    signs: (visual.skinEffects?.length ?? 0) + (visual.woundOverlays?.length ?? 0)
      + (visual.eyeEffects && visual.eyeEffects.kind !== 'normal' ? 1 : 0)
      + ((visual.facialDroop ?? 0) > 0 ? 1 : 0)
      + ((visual.breathingEffort ?? 0) > 0 ? 1 : 0),
    devices: expectedDevices,
    findings,
  });
}

const errors = rows.flatMap(r => r.findings.filter(f => f.severity === 'ERROR').map(f => ({ id: r.id, ...f })));
const warns = rows.flatMap(r => r.findings.filter(f => f.severity === 'WARN').map(f => ({ id: r.id, ...f })));

if (jsonOut) {
  console.log(JSON.stringify({ rows, errors, warns }, null, 2));
} else {
  console.log(`\n CASE REALISM AUDIT — ${rows.length} cases scanned`);
  console.log(`  ERROR=${errors.length}  WARN=${warns.length}\n`);
  for (const r of rows) {
    const mark = r.findings.some(f => f.severity === 'ERROR') ? '✗'
      : r.findings.length ? '!' : '✓';
    const dev = r.devices.length ? r.devices.join(',') : '—';
    console.log(`${mark} ${r.id.padEnd(14)} ${String(r.variant).padEnd(12)} ${String(r.mobility).padEnd(10)} ${String(r.posture ?? '—').padEnd(12)} signs=${r.signs} dev=${dev}`);
    for (const f of r.findings) {
      console.log(`    [${f.severity}] ${f.rule}: ${f.detail}`);
    }
  }
  console.log('\nRules:');
  const counts = {};
  for (const f of [...errors, ...warns]) counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  for (const [rule, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${n}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
