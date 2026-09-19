#!/usr/bin/env node
// @ts-check
/**
 * Scene coherence auditor.
 *
 * audit-cases.mjs checks clinical consistency; audit-scene-assets.mjs checks
 * that every scene image exists and matches the derived 3D environment. This
 * one checks that the *scene itself* hangs together — the world the student
 * arrives into. Time of day, where the patient is lying, what hazards a scene
 * of that type must carry, and whether the authored image agrees with the
 * patient and the address.
 *
 * Usage:  node scripts/audit-scenes.mjs [--json] [--rule <id>] [--id <case-id>]
 *
 * ponytail: one flat rule list, no plugin registry — same shape as
 * audit-cases.mjs so both read the same way.
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
const { deriveSceneEnvironment } = jiti('./src/lib/sceneEnvironment.ts');
const { inferSceneImage } = jiti('./src/lib/sceneImageSelection.ts');

if (!Array.isArray(allCases) || allCases.length === 0) {
  console.error('Could not load allCases from src/data/cases.ts');
  process.exit(1);
}

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const jsonOut = args.includes('--json');
const ruleFilter = arg('--rule');
const idFilter = arg('--id');

// ---------------------------------------------------------------------------
const sceneText = (c) => [
  c.sceneInfo?.description,
  c.sceneInfo?.environment,
  c.dispatchInfo?.location,
  c.dispatchInfo?.callReason,
  c.initialPresentation?.generalImpression,
  c.initialPresentation?.position,
].filter(Boolean).join(' ').toLowerCase();

const hazardText = (c) => (c.sceneInfo?.hazards ?? []).join(' ').toLowerCase();
const slug = (c) => (c.sceneInfo?.sceneImagePath ?? '').toLowerCase();

// Emirate names, normalised so "Al Ain" in a dispatch address and "alain" in
// an asset slug compare equal.
const UAE_CITIES = ['dubai', 'abudhabi', 'sharjah', 'ajman', 'fujairah', 'alain', 'rasalkhaimah', 'ummalquwain'];
const squash = (s) => s.replace(/[^a-z]/g, '');
const cityIn = (s) => { const f = squash(s); return UAE_CITIES.filter((city) => f.includes(city)); };

// ---------------------------------------------------------------------------
const RULES = [
  {
    id: 'time-of-day-contradicts-scene',
    severity: 'WARN',
    check(c) {
      const tod = String(c.dispatchInfo?.timeOfDay ?? '').toLowerCase();
      const t = sceneText(c);
      const dayWords = /\b(?:bright sunlight|midday sun|direct sun|noon sun|blazing sun|full sun|daylight|morning sun|afternoon sun)\b/;
      const nightWords = /\b(?:darkness|pitch dark|street ?lights? (?:only|illuminate)|torch(?:light)?|after dark|night ?time|floodlit)\b/;
      if (/night|evening/.test(tod) && dayWords.test(t)) {
        return [`dispatch timeOfDay="${tod}" but scene describes daylight`];
      }
      if (/morning|afternoon|midday|day/.test(tod) && nightWords.test(t)) {
        return [`dispatch timeOfDay="${tod}" but scene describes darkness`];
      }
      return [];
    },
  },
  {
    id: 'support-surface-impossible-outdoors',
    severity: 'WARN',
    check(c) {
      const env = deriveSceneEnvironment(c);
      const surface = c.sceneInfo?.patientSupportSurface;
      if (!surface) return [];
      const outdoors = ['roadside', 'water', 'heat', 'agricultural'];
      if (outdoors.includes(env) && (surface === 'bed' || surface === 'sofa')) {
        return [`environment "${env}" but patientSupportSurface="${surface}" — indoor furniture outdoors`];
      }
      return [];
    },
  },
  {
    id: 'support-surface-contradicts-position',
    severity: 'WARN',
    check(c) {
      const surface = c.sceneInfo?.patientSupportSurface;
      if (!surface) return [];
      const pos = [c.initialPresentation?.position, c.sceneInfo?.description]
        .filter(Boolean).join(' ').toLowerCase();
      const named = { bed: /\bbed\b|mattress/, sofa: /\bsofa\b|couch|settee/, seat: /\bseat(?:ed)?\b|\bchair\b|driver|passenger/, stretcher: /\bstretcher\b|\btrolley\b/ };
      const other = Object.entries(named).filter(([k]) => k !== surface);
      // Only flag when the text explicitly names a *different* surface and never the declared one.
      if (named[surface]?.test(pos)) return [];
      const conflicting = other.filter(([, re]) => re.test(pos)).map(([k]) => k);
      if (conflicting.length) {
        return [`patientSupportSurface="${surface}" but scene text names ${conflicting.join('/')} instead`];
      }
      if (/\bfloor\b|\bground\b|\bpavement\b|\bsidewalk\b/.test(pos) && surface !== 'stretcher') {
        return [`patientSupportSurface="${surface}" but patient is described on the floor/ground`];
      }
      return [];
    },
  },
  {
    id: 'environment-missing-signature-hazard',
    severity: 'WARN',
    check(c) {
      const env = deriveSceneEnvironment(c);
      // Indoor scenes legitimately have no hazards — a living-room chest pain
      // is not a scene-safety exercise. Only the hazardous environments must
      // carry their signature risk.
      const HAZARDOUS = {
        // A roadside scene can be a genuine highway RTA OR an outdoor sports
        // pitch (y1-020 derives `roadside` through `pitch`/`field`); both are
        // exposed outdoor environments with their own signature risk, so the
        // sports-field vocabulary counts toward the roadside signature.
        roadside: /traffic|vehicle|road|oncoming|fuel|glass|highway|carriageway|kerb|debris|passing car|football|soccer|astroturf|turf|pitch|floodlight|studs|players/,
        fire: /fire|smoke|heat|flame|carbon monoxide|collapse|structural|toxic/,
        water: /water|drown|slip|wet|current|pool|submerg|tide/,
        industrial: /machin|ppe|height|fall|scaffold|electric|dust|load|crush|isolat|overhead|uneven|debris|equipment|hot surface|weld|chemical|solvent/,
        agricultural: /chemical|pesticide|machin|livestock|silo|tractor|dust/,
        heat: /heat|sun|temperature|humid|shade|dehydrat/,
      };
      const required = HAZARDOUS[env];
      if (!required) return [];
      const h = hazardText(c);
      if (!h.trim()) return [`environment "${env}" is a hazardous scene but no hazards are authored`];
      if (!required.test(h)) {
        return [`environment "${env}" but hazards never mention its signature risk — hazards: ${JSON.stringify(c.sceneInfo.hazards)}`];
      }
      return [];
    },
  },
  {
    id: 'indoor-scene-no-hazards',
    severity: 'INFO',
    check(c) {
      const env = deriveSceneEnvironment(c);
      if (!['home', 'public', 'clinic'].includes(env)) return [];
      if ((c.sceneInfo?.hazards ?? []).length) return [];
      return [`indoor scene "${env}" has an empty hazards array — scene-safety step has nothing to teach`];
    },
  },
  {
    id: 'authored-variant-overridden-by-keywords',
    severity: 'INFO',
    check(c) {
      const authored = c.sceneInfo?.environmentVariant;
      if (!authored) return [];
      const derived = deriveSceneEnvironment(c);
      if (derived !== authored) {
        return [`authored environmentVariant="${authored}" but deriveSceneEnvironment() renders "${derived}"`];
      }
      return [];
    },
  },
  {
    id: 'scene-image-gender-mismatch',
    severity: 'WARN',
    check(c) {
      const s = slug(c);
      if (!s) return [];
      const gender = String(c.patientInfo?.gender ?? '').toLowerCase();
      const slugFemale = /(?:^|[-/])female(?:[-.]|$)|(?:^|[-/])woman(?:[-.]|$)|(?:^|[-/])mother(?:[-.]|$)/.test(s);
      // "male" appears inside "female" — require a boundary that isn't preceded by "fe".
      const slugMale = /(?:^|[-/])male(?:[-.]|$)|(?:^|[-/])man(?:[-.]|$)|(?:^|[-/])father(?:[-.]|$)/.test(s);
      if (gender.startsWith('f') && slugMale && !slugFemale) return [`female patient but scene image is "${s}"`];
      if (gender.startsWith('m') && slugFemale) return [`male patient but scene image is "${s}"`];
      return [];
    },
  },
  {
    id: 'scene-image-age-mismatch',
    severity: 'WARN',
    check(c) {
      const s = slug(c);
      const age = Number(c.patientInfo?.age);
      if (!s || !Number.isFinite(age)) return [];
      const paed = /p(?:a)?ediatric|infant|child|toddler|baby|school-?age/.test(s);
      const elderly = /elderly|geriatric|senior/.test(s);
      if (paed && age >= 18) return [`age ${age} but scene image reads paediatric: "${s}"`];
      if (elderly && age < 60) return [`age ${age} but scene image reads elderly: "${s}"`];
      if (!paed && age < 13 && /\b(?:male|female|man|woman)\b/.test(s) && !/child|paed|infant/.test(s)) {
        return [`age ${age} (child) but scene image reads adult: "${s}"`];
      }
      return [];
    },
  },
  {
    id: 'scene-image-city-mismatch',
    severity: 'INFO',
    check(c) {
      const s = slug(c).replace(/[-_]/g, ' ');
      const loc = String(c.dispatchInfo?.location ?? '').toLowerCase();
      if (!s || !loc) return [];
      const inSlug = cityIn(s);
      const inLoc = cityIn(loc);
      if (inSlug.length && inLoc.length && !inSlug.some((x) => inLoc.includes(x))) {
        return [`dispatch location "${c.dispatchInfo.location}" but scene image names ${inSlug.join('/')}: "${slug(c)}"`];
      }
      return [];
    },
  },
  {
    id: 'shared-image-across-different-environments',
    severity: 'INFO',
    // Cross-case rule — handled in the aggregate pass below.
    aggregate(cases) {
      const byAsset = new Map();
      for (const c of cases) {
        const s = c.sceneInfo?.sceneImagePath;
        if (!s) continue;
        if (!byAsset.has(s)) byAsset.set(s, []);
        byAsset.get(s).push(c);
      }
      const out = [];
      for (const [asset, list] of byAsset) {
        if (list.length < 2) continue;
        const envs = new Set(list.map(deriveSceneEnvironment));
        const genders = new Set(list.map((c) => String(c.patientInfo?.gender ?? '').toLowerCase()[0]));
        if (envs.size > 1) {
          out.push({ caseId: list.map((c) => c.id).join(', '), message: `"${asset}" is reused across environments ${[...envs].join('/')}` });
        } else if (genders.size > 1) {
          out.push({ caseId: list.map((c) => c.id).join(', '), message: `"${asset}" is reused across genders ${[...genders].join('/')}` });
        }
      }
      return out;
    },
  },
  {
    id: 'extrication-without-access-issue',
    severity: 'INFO',
    check(c) {
      if (!c.sceneInfo?.extricationNeeded) return [];
      const access = c.sceneInfo?.accessIssues ?? [];
      if (!access.length) return ['extricationNeeded=true but no accessIssues authored'];
      return [];
    },
  },
  {
    id: 'bystanders-field-empty',
    severity: 'INFO',
    check(c) {
      const b = String(c.sceneInfo?.bystanders ?? '').trim();
      if (!b) return ['no bystanders authored — scene renders with nobody present'];
      return [];
    },
  },
  {
    id: 'authored-scene-image-ignored',
    severity: 'ERROR',
    // sceneInfo.sceneImagePath is authored on the case but the runtime renders
    // whatever inferSceneImage() resolves from its own id-override tables. The
    // two are kept in sync by hand, so this rule is the drift alarm: the day
    // they disagree, the case file is lying about what the student will see.
    check(c) {
      const authored = c.sceneInfo?.sceneImagePath;
      if (!authored) return [];
      const resolved = inferSceneImage(c);
      if (resolved !== authored) {
        return [`case authors "${authored}" but inferSceneImage() renders "${resolved}"`];
      }
      return [];
    },
  },
  {
    id: 'duplicate-case-id',
    severity: 'ERROR',
    aggregate(cases) {
      const seen = new Map();
      const out = [];
      for (const c of cases) {
        if (seen.has(c.id)) out.push({ caseId: c.id, message: `duplicate case id (also "${seen.get(c.id)}")` });
        else seen.set(c.id, c.title);
      }
      return out;
    },
  },
];

// ---------------------------------------------------------------------------
// ponytail: one self-check, not a test suite. Every rule that can fire gets a
// synthetic case that must trip it — so a regex edit that silently stops
// matching fails here instead of quietly passing the whole library.
if (args.includes('--self-test')) {
  const base = (over = {}) => ({
    id: 'synthetic', title: 'Synthetic', dispatchInfo: { timeOfDay: 'day', location: 'Villa in Dubai' },
    patientInfo: { age: 40, gender: 'male' }, initialPresentation: {},
    sceneInfo: { description: '', environment: '', hazards: ['x'], bystanders: 'one' },
    ...over,
  });
  const fires = (ruleId, c) => {
    const rule = RULES.find((r) => r.id === ruleId);
    const got = rule.aggregate ? rule.aggregate([c, { ...c }]) : rule.check(c);
    if (!got.length) { console.error(`✗ self-test: rule "${ruleId}" did not fire`); process.exitCode = 1; }
    else console.log(`✓ ${ruleId}`);
  };
  fires('time-of-day-contradicts-scene', base({ dispatchInfo: { timeOfDay: 'night', location: 'x' }, sceneInfo: { description: 'patient collapsed in bright sunlight', hazards: ['x'] } }));
  fires('support-surface-impossible-outdoors', base({ sceneInfo: { description: 'RTA on the highway', hazards: ['traffic'], patientSupportSurface: 'bed', environmentVariant: 'roadside' } }));
  fires('support-surface-contradicts-position', base({ initialPresentation: { position: 'supine on the sofa' }, sceneInfo: { description: 'living room', hazards: ['x'], patientSupportSurface: 'bed' } }));
  fires('environment-missing-signature-hazard', base({ sceneInfo: { description: 'RTA on the highway', hazards: ['Bystander crowd'] } }));
  fires('indoor-scene-no-hazards', base({ sceneInfo: { description: 'villa bedroom', hazards: [] } }));
  fires('scene-image-gender-mismatch', base({ patientInfo: { age: 40, gender: 'female' }, sceneInfo: { description: 'villa', hazards: ['x'], sceneImagePath: '/scene-assets/home-medical-male-dubai-apartment.png' } }));
  fires('scene-image-age-mismatch', base({ patientInfo: { age: 45, gender: 'male' }, sceneInfo: { description: 'villa', hazards: ['x'], sceneImagePath: '/scene-assets/home-pediatric-uae-family.png' } }));
  fires('scene-image-city-mismatch', base({ dispatchInfo: { timeOfDay: 'day', location: 'Villa in Abu Dhabi' }, sceneInfo: { description: 'villa', hazards: ['x'], sceneImagePath: '/scene-assets/home-medical-male-dubai-apartment.png' } }));
  fires('extrication-without-access-issue', base({ sceneInfo: { description: 'villa', hazards: ['x'], extricationNeeded: true } }));
  fires('bystanders-field-empty', base({ sceneInfo: { description: 'villa', hazards: ['x'], bystanders: '' } }));
  fires('duplicate-case-id', base());
  console.log(process.exitCode ? '\nself-test FAILED' : '\nself-test passed');
  process.exit(process.exitCode ?? 0);
}

const findings = [];
const pool = idFilter ? allCases.filter((c) => c.id === idFilter) : allCases;

for (const rule of RULES) {
  if (ruleFilter && rule.id !== ruleFilter) continue;
  if (rule.aggregate) {
    for (const f of rule.aggregate(pool)) {
      findings.push({ ruleId: rule.id, severity: rule.severity, caseId: f.caseId, title: '', message: f.message });
    }
    continue;
  }
  for (const c of pool) {
    for (const message of rule.check(c)) {
      findings.push({ ruleId: rule.id, severity: rule.severity, caseId: c.id, title: c.title, message });
    }
  }
}

if (jsonOut) {
  console.log(JSON.stringify({ scanned: pool.length, findings }, null, 2));
  process.exit(0);
}

const bySeverity = (s) => findings.filter((f) => f.severity === s).length;
console.log('\n' + '='.repeat(78));
console.log(` SCENE COHERENCE AUDIT — ${pool.length} cases scanned, ${findings.length} findings`);
console.log('='.repeat(78));
console.log(`  ERROR=${bySeverity('ERROR')}  WARN=${bySeverity('WARN')}  INFO=${bySeverity('INFO')}\n`);

const byRule = new Map();
for (const f of findings) {
  if (!byRule.has(f.ruleId)) byRule.set(f.ruleId, []);
  byRule.get(f.ruleId).push(f);
}
for (const [ruleId, list] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`▸ ${ruleId}  [${list[0].severity}] × ${list.length}`);
  for (const f of list) console.log(`    ${f.caseId}: ${f.message}`);
  console.log('');
}

process.exit(bySeverity('ERROR') > 0 ? 1 : 0);
