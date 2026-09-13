#!/usr/bin/env node
/**
 * generate-scene-intros.mjs
 *
 * Credit-free scene-introduction enrichment via local Ollama models.
 * For each target case, asks the on-device Qwen model to write the
 * "you had to be there" arrival layer — first-person paramedic arrival
 * narrative plus sensory cues — grounded strictly in the case facts.
 *
 * Case facts are loaded programmatically from src/data/cases.ts via jiti
 * (the same loader audit-cases.mjs uses), so there is NO hand-copied data
 * and the script scales to any number of cases.
 *
 * Output is an ADDITIVE overlay (never mutates cases.ts / additionalCases.ts /
 * firstYearCases.ts). Keyed by case id, merged at render time.
 *
 * Usage:
 *   node scripts/generate-scene-intros.mjs                    # all cases lacking an intro
 *   node scripts/generate-scene-intros.mjs --case trauma-001  # one case
 *   node scripts/generate-scene-intros.mjs --category trauma  # by category
 *   node scripts/generate-scene-intros.mjs --limit 8          # first N (by priority)
 *
 * Env:
 *   OLLAMA_MODEL  (default: hermes-qwen3.5:9b)
 *   OLLAMA_URL    (default: http://127.0.0.1:11434)
 *   OLLAMA_TIMEOUT_MS (default: 300000)
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'hermes-qwen3.5:9b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 300000);

// --- Load all cases (jiti handles @/* alias + TS/ESM) ---
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});
const mod = jiti('./src/data/cases.ts');
const allCases = mod.allCases ?? mod.default?.allCases ?? [];
if (!Array.isArray(allCases) || allCases.length === 0) {
  console.error('Could not load allCases from src/data/cases.ts');
  process.exit(1);
}

// --- Priority order: highest-value scene archetypes first, then by category ---
const CATEGORY_PRIORITY = ['trauma', 'environmental', 'general', 'respiratory', 'cardiac', 'neuro', 'metabolic', 'psychiatric', 'obstetric', 'pediatric', 'toxicology', 'burns', 'multi'];
const PRIORITY_BY_CATEGORY = new Map(CATEGORY_PRIORITY.map((c, i) => [c, i]));

// --- Argument parsing ---
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const flag = (k) => args.includes(k);
const onlyCase = arg('--case');
const onlyCategory = arg('--category');
const limit = arg('--limit') ? Number(arg('--limit')) : null;
const force = flag('--force'); // regenerate even if an intro already exists

// --- Build the fact summary the model is grounded in ---
function caseFacts(c) {
  const dp = c.dispatchInfo || {};
  const pi = c.patientInfo || {};
  const si = c.sceneInfo || {};
  const ip = c.initialPresentation || {};
  const expo = c.abcde?.exposure || {};
  const hist = c.history || {};

  const gender = String(pi.gender || '').toLowerCase();
  const age = pi.age ?? 'adult';
  const consciousness = ip.consciousness || (c.abcde?.disability?.avpu === 'U' ? 'unresponsive' : 'unknown');
  const gcs = c.abcde?.disability?.gcs?.total;

  const patient = [
    `${age}-year-old`,
    gender.includes('female') ? 'female' : gender.includes('male') ? 'male' : '',
    ip.generalImpression ? `— ${ip.generalImpression}` : '',
    gcs != null ? `, GCS ${gcs}` : '',
    consciousness ? `, ${consciousness}` : '',
  ].filter(Boolean).join(' ');

  const dispatch = [
    dp.callReason,
    dp.location ? `— ${dp.location}` : '',
    dp.timeOfDay ? `(${dp.timeOfDay})` : '',
    dp.callerInfo ? `caller: ${dp.callerInfo}` : '',
  ].filter(Boolean).join(' ');

  const scene = [
    si.description,
    si.environment,
    si.environmentVariant ? `[variant: ${si.environmentVariant}]` : '',
    si.bystanders ? `bystanders: ${si.bystanders}` : '',
  ].filter(Boolean).join('; ');

  const hazards = Array.isArray(si.hazards) ? si.hazards : [];

  const injuries = [
    ip.appearance,
    expo.findings ? (Array.isArray(expo.findings) ? expo.findings.join(', ') : expo.findings) : '',
    hist.eventsLeading ? `events: ${hist.eventsLeading}` : '',
  ].filter(Boolean).join('; ');

  const variant = si.environmentVariant || '';

  return { patient, dispatch, scene, hazards, injuries, variant };
}

const SYSTEM = `You are an EMS clinical educator writing the sensory "arrival" layer for a simulation scenario. You ground every detail in the case facts provided — never invent injuries, vitals, or outcomes. Write in plain, vivid, first-person-paramedic British English. No jargon padding. Each answer is a single flat JSON object with the exact keys given. Do not wrap in markdown fences. Do not add keys.`;

function buildPrompt(c, f) {
  return `Case: ${c.title}
Patient: ${f.patient}
Dispatch: ${f.dispatch}
Scene: ${f.scene}
Hazards: ${f.hazards.join('; ')}
Injuries: ${f.injuries}

Return ONE JSON object with these keys only:
{
  "arrivalNarrative": "<3-4 sentences, first-person paramedic arriving on scene — what you see, hear, smell the moment you step out. Grounded in the facts above.>",
  "sensoryCues": {
    "sounds": ["<2-4 sound cues SPECIFIC to this exact scene and location. A quiet apartment has AC hum, a ticking clock, muffled traffic from a distant street — NOT 'highway roar'. A poolside villa has water lapping, pool pump, birds. A roadside has traffic rumble, idling engines, distant siren. Match the location.>"],
    "smells": ["<1-3 short smell cues, or empty array if none clinically plausible>"],
    "temperature": "<short phrase, e.g. '38°C heat radiating off the asphalt'>",
    "light": "<short phrase, e.g. 'harsh afternoon sun, deep shadows'>",
    "air": "<short phrase, e.g. 'still, hot, exhaust-stained air'>"
  },
  "accessExtrication": {
    "accessIssues": ["<0-3 real access problems implied by the scene>"],
    "extricationNeeded": <true|false>,
    "note": "<one short sentence, or '' if none>"
  },
  "bystanderDetail": "<1-2 sentences on bystander micro-behaviour grounded in the facts.>"
}`;
}

async function chat(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      options: { temperature: 0.7, num_ctx: 8192 },
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return (await res.json()).message.content;
}

function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in model output');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function renderTsModule(data) {
  const header = `/**
 * sceneIntroductions.generated.ts
 *
 * GENERATED — do not hand-edit. Produced by \`scripts/generate-scene-intros.mjs\`
 * (local Ollama model), then reviewed. Keyed by case id, merged additively at
 * render time. Re-run the script to regenerate; it overwrites this file.
 */

import type { SceneIntroduction } from '@/lib/sceneIntroductions';

export const SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> =`;
  return `${header} ${JSON.stringify(data, null, 2)};\n`;
}

async function main() {
  // Load existing generated intros (to skip already-done cases unless --force).
  const genPath = join(__dirname, '..', 'src', 'data', 'sceneIntroductions.generated.ts');
  const existing = flag('--no-skip')
    ? {}
    : readExistingGenerated(genPath);

  // Build target list.
  let targets = allCases.filter((c) => c.id && c.title);
  if (onlyCase) targets = targets.filter((c) => c.id === onlyCase);
  if (onlyCategory) targets = targets.filter((c) => String(c.category).toLowerCase() === onlyCategory.toLowerCase());
  if (!force) targets = targets.filter((c) => !existing[c.id]);

  // Sort by category priority, then by priority/complexity so the most
  // instructive scenes (critical trauma, arrests) go first.
  targets.sort((a, b) => {
    const pa = PRIORITY_BY_CATEGORY.get(String(a.category).toLowerCase()) ?? 99;
    const pb = PRIORITY_BY_CATEGORY.get(String(b.category).toLowerCase()) ?? 99;
    if (pa !== pb) return pa - pb;
    const sev = { critical: 0, high: 1, moderate: 2, low: 3, routine: 4 };
    const sa = sev[String(a.priority).toLowerCase()] ?? 2;
    const sb = sev[String(b.priority).toLowerCase()] ?? 2;
    return sa - sb;
  });

  if (limit != null && Number.isFinite(limit)) targets = targets.slice(0, limit);

  console.error(`Loaded ${allCases.length} cases; ${targets.length} to generate (model: ${MODEL}).`);

  const out = { ...existing };
  let done = 0;
  for (const c of targets) {
    const f = caseFacts(c);
    console.error(`→ ${c.id}: ${c.title} (${c.category})`);
    try {
      const raw = await chat(buildPrompt(c, f));
      out[c.id] = parseJson(raw);
      done++;
      console.error(`   ✓ ${c.id}`);
    } catch (err) {
      console.error(`   ✗ ${c.id}: ${err.message}`);
    }
  }

  const outPath = join(__dirname, '..', 'src', 'data', 'sceneIntroductions.generated.ts');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderTsModule(out) + '\n');
  console.error(`\nWrote ${Object.keys(out).length} total intro(s) (${done} new) → ${outPath}`);
  console.log(JSON.stringify(out, null, 2));
}

/**
 * Extract the object literal from the generated .ts file (the value after
 * "= "). Returns {} if the file doesn't exist or can't be parsed.
 */
function readExistingGenerated(genPath) {
  if (!existsSync(genPath)) return {};
  try {
    const src = readFileSync(genPath, 'utf8');
    const eq = src.indexOf('SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> =');
    if (eq === -1) return {};
    const brace = src.indexOf('{', eq);
    if (brace === -1) return {};
    // Find the matching closing brace + optional semicolon.
    const body = src.slice(brace);
    // The file ends with `};\n` — strip the trailing `;\n` then parse.
    const trimmed = body.replace(/;\s*$/, '');
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
