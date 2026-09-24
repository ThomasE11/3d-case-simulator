#!/usr/bin/env node
// @ts-check
/**
 * Case alignment auditor — is what the student HEARS / READS / SEES the same
 * as what the case MEANS?
 *
 * Flags misleading pairings that have already bitten us in the field:
 *   - "No wheeze" text that still played a wheeze (fixed in clinicalSounds)
 *   - panic/hyperventilation cases whose auscultation implies asthma
 *   - position copy that the 3D pose cannot honour ("knees drawn up")
 *   - diagnosis vs management that treat the wrong system
 *   - speech that cannot answer "what happened"
 *
 * Usage:  node scripts/audit-case-alignment.mjs [--json] [--id <case-id>]
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
const { getInitialSounds, reconcileLungsWithFindings } = jiti('./src/data/clinicalSounds.ts');
const { derivePatientMobility, derivePatientPosture, deriveSeatStyle } = jiti('./src/lib/patientStaging.ts');
const { deriveSeatStyle: seatStyle } = jiti('./src/lib/patientSeatStyle.ts');

const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const idFilter = args.includes('--id') ? args[args.indexOf('--id') + 1] : undefined;

const rows = [];
for (const c of allCases) {
  if (idFilter && c.id !== idFilter) continue;
  const findings = [];
  const dx = String(c.expectedFindings?.mostLikelyDiagnosis ?? '').toLowerCase();
  const breathFindings = [
    ...(c.abcde?.breathing?.findings ?? []),
    ...(c.secondarySurvey?.chest ?? []),
  ].join(' | ');
  const allFindings = [
    ...Object.values(c.abcde ?? {}).flatMap(v => (v && typeof v === 'object' && 'findings' in v) ? (v.findings ?? []) : []),
    ...(c.secondarySurvey?.chest ?? []),
  ].join(' ');
  const position = c.initialPresentation?.position ?? '';
  const appearance = [c.initialPresentation?.appearance, c.initialPresentation?.generalImpression].filter(Boolean).join(' ');

  // --- 1. Sounds vs authored findings (the panic-wheeze class of bug) ---
  const sounds = reconcileLungsWithFindings(
    getInitialSounds(c.category, c.subcategory, allFindings.split(' | ').filter(Boolean)),
    allFindings,
  );
  const playsWheeze = [sounds.leftLung, sounds.rightLung].some(s => s === 'wheeze');
  const saysNoWheeze = /\b(?:no|without|clear of|absent)\s+wheez/i.test(breathFindings);
  const saysClearLungs = /clear (?:lung|breath)|no (?:wheeze|crackle|adventitious)/i.test(breathFindings);
  const dxIsAsthma = /asthma|copd|bronchospasm|bronchiolitis/i.test(dx);
  const dxIsPanic = /panic|anxiety|hyperventilat/i.test(dx);

  if (playsWheeze && saysNoWheeze) {
    findings.push({ severity: 'ERROR', rule: 'sound-contradicts-findings', detail: 'plays wheeze but findings say "No wheeze"' });
  }
  const saysPositiveWheeze = /wheez/i.test(breathFindings.replace(/\b(?:no|without|nil|denies)\s+(?:[\w/]+\s+){0,2}wheez[^,.;]*/gi, ''));
  if (playsWheeze && saysClearLungs && !dxIsAsthma && !saysPositiveWheeze) {
    findings.push({ severity: 'ERROR', rule: 'wheeze-on-clear-lungs', detail: 'wheeze audio on a clear-lung case — students will treat asthma' });
  }
  if (dxIsPanic && playsWheeze) {
    findings.push({ severity: 'ERROR', rule: 'panic-with-wheeze', detail: 'panic/hyperventilation diagnosis but auscultation plays wheeze' });
  }
  if (dxIsPanic && !/tingl|carpopedal|spasm|hyperventilat/i.test(allFindings + appearance)) {
    findings.push({ severity: 'WARN', rule: 'panic-missing-classic-signs', detail: 'panic dx without tingling / carpopedal spasm / hyperventilation cues' });
  }

  // --- 2. Position copy vs renderable pose ---
  const mobility = derivePatientMobility(c, false);
  const posture = derivePatientPosture(c, { mobility, respiration: c.abcde?.breathing?.rate ?? null });
  const style = seatStyle({
    caseId: c.id,
    mobility,
    posture,
    ageYears: c.patientInfo?.age,
    position,
  });
  // A supported semi-recumbent patient may be on the ground and propped
  // against a wall without being curled into a knee-huddle. Only explicit
  // sitting/floor or knees-drawn language asks for the huddle morph.
  const wantsKneesUp = /knees (?:drawn |up|tucked|to chest)/i.test(position)
    || (/sitting on (?:the )?floor/i.test(position) && !/supine|lying|semi[- ]recumbent/i.test(position));
  if (wantsKneesUp && style !== 'huddle_knees') {
    findings.push({ severity: 'ERROR', rule: 'pose-ignores-dispatch', detail: `position "${position}" but seat style is ${style}` });
  }
  if (/leaning forward/i.test(position) && style === 'slouch') {
    findings.push({ severity: 'WARN', rule: 'lean-renders-as-slouch', detail: 'dispatch says leaning forward but style slouches back' });
  }

  // --- 3. Diagnosis vs management system mismatch ---
  const mgmt = [...(c.managementPathway?.immediate ?? []), ...(c.managementPathway?.definitive ?? [])].join(' | ').toLowerCase();
  if (dxIsPanic && /salbutamol|nebuli|bronchodilator|adrenaline 1:1000/i.test(mgmt)) {
    findings.push({ severity: 'ERROR', rule: 'dx-mgmt-mismatch', detail: 'panic dx but management is asthma / anaphylaxis' });
  }
  if (dxIsAsthma && /reassurance only|breathing coaching only/i.test(mgmt) && !/oxygen|salbutamol|nebuli/i.test(mgmt)) {
    findings.push({ severity: 'WARN', rule: 'asthma-under-treated', detail: 'asthma dx without bronchodilator / oxygen in pathway' });
  }

  // --- 4. Speech / dialogue can answer "what happened" ---
  if (!c.history?.eventsLeading?.trim()) {
    findings.push({ severity: 'WARN', rule: 'no-events-story', detail: 'no eventsLeading — "what happened" has nothing to say' });
  }

  // --- 5. Pain score present but nothing that should move it ---
  const pain = c.vitalSignsProgression?.initial?.painScore;
  if (typeof pain === 'number' && pain >= 4 && !/pain|analges|morphine|paracetamol|ibuprofen|entonox|gtn|reassur|breathing coach/i.test(mgmt)) {
    findings.push({ severity: 'WARN', rule: 'pain-never-moves', detail: `pain ${pain} but no analgesia / reassurance in pathway` });
  }

  rows.push({ id: c.id, title: c.title, dx: c.expectedFindings?.mostLikelyDiagnosis ?? '—', style, posture, mobility, playsWheeze, findings });
}

const errors = rows.flatMap(r => r.findings.filter(f => f.severity === 'ERROR').map(f => ({ id: r.id, ...f })));
const warns = rows.flatMap(r => r.findings.filter(f => f.severity === 'WARN').map(f => ({ id: r.id, ...f })));

if (jsonOut) {
  console.log(JSON.stringify({ rows, errors, warns }, null, 2));
} else {
  console.log(`\n CASE ALIGNMENT AUDIT — ${rows.length} cases`);
  console.log(`  ERROR=${errors.length}  WARN=${warns.length}\n`);
  for (const r of rows) {
    const mark = r.findings.some(f => f.severity === 'ERROR') ? '✗' : r.findings.length ? '!' : '✓';
    console.log(`${mark} ${r.id.padEnd(14)} ${String(r.style).padEnd(14)} wheeze=${r.playsWheeze ? 'Y' : 'n'}  ${String(r.dx).slice(0, 42)}`);
    for (const f of r.findings) console.log(`    [${f.severity}] ${f.rule}: ${f.detail}`);
  }
  const counts = {};
  for (const f of [...errors, ...warns]) counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  console.log('\nRules:');
  for (const [rule, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${n}`);
  }
}
process.exit(errors.length > 0 ? 1 : 0);
