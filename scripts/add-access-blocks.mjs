#!/usr/bin/env node
// add-access-blocks.mjs — fill in the access/extrication block for indoor
// scenes whose generated arrival layer has nothing to teach the survey step.
//
// Reuses the same Ollama grounding rules as generate-scene-intros.mjs but
// never rewrites arrivalNarrative / sensoryCues / bystanderDetail. Skips
// entries that already carry a real access block.
//
// Usage: node scripts/add-access-blocks.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, { interopDefault: true, alias: { '@': resolve(projectRoot, 'src') }, esmResolve: true });
const { allCases } = jiti('./src/data/cases.ts');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'hermes-qwen3.5:4b';

const genPath = resolve(__dirname, '..', 'src', 'data', 'sceneIntroductions.generated.ts');
const src = readFileSync(genPath, 'utf8');
const data = JSON.parse(src.slice(src.indexOf('{', src.indexOf('SCENE_INTRODUCTIONS')), src.lastIndexOf('}') + 1));

const TARGETS = ["resp-001","neuro-003","metab-002","ruleout-001","cardiac-017","cardiac-ecg-001","resp-007","resp-011","metab-003","ped-002","y1-003","y1-007","y1-008","y1-013","y1-021","y2-002","y2-005","y2-006","asthma-mild-001"];

const SYSTEM = `You are an EMS clinical educator. Given a scene arrival narrative, return ONLY the access/extrication block that the scene implies — real physical obstacles a paramedic must navigate, grounded strictly in the narrative. Never invent furniture, vehicles, or bystanders not described.

Return ONE JSON object with exactly these keys:
{"accessIssues":["<0-3 short obstacle strings>"],"extricationNeeded":<true|false>,"note":"<one short sentence, or ''>"}

Rules:
- accessIssues: obstacles like "limited working space", "furniture restricting access", "body fluids requiring BSI", "agitated bystander controlling access", "narrow doorway", "uneven flooring", "patient on floor requiring lift", "staff/bystander managing access", "environmental irritant present (dust, smoke, chemicals)", "shared space with other patients", "security/clinic staff controlling entry". Empty array ONLY when the scene is a genuinely open, unobstructed space with no bystander and no environmental factor — a clinic examination room with a nurse standing nearby or dust in the air is NOT that.
- extricationNeeded: true only if the patient literally cannot be left where they are (on the floor, in a narrow space, requiring carry/step).
- note: one short navigational sentence, or ''.
- Do NOT mention furniture materials, do NOT invent a means of arrival, do NOT name specific furniture pieces unless the narrative names them.`;

async function chat(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, stream: false, format: 'json', think: false,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      options: { temperature: 0.3, num_ctx: 4096 } }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return (await res.json()).message.content;
}
function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('No JSON in: ' + text.slice(0, 120));
  return JSON.parse(cleaned.slice(s, e + 1));
}
function isPlaceholder(s) {
  return /^(none|no hazards?|none identified|n\/a)$/i.test(String(s).trim());
}

const caseById = new Map(allCases.map(c => [c.id, c]));

async function main() {
  let done = 0;
  for (const id of TARGETS) {
    const entry = data[id];
    if (!entry) { console.error(`✗ ${id}: no intro entry`); continue; }
    const existing = entry.accessExtrication;
    const hasRealIssues = existing && Array.isArray(existing.accessIssues)
      && existing.accessIssues.some(s => !isPlaceholder(s));
    if (hasRealIssues) { console.error(`- ${id}: already has real access issues, skipping`); continue; }
    if (existing) entry.accessExtrication = undefined;
    const c = caseById.get(id);
    const prompt = `Scene arrival narrative for ${id} (${c?.title}):\n"${entry.arrivalNarrative}"\n\nBystanders: ${entry.bystanderDetail || 'none described'}`;
    try {
      const parsed = parseJson(await chat(prompt));
      const cleaned = (Array.isArray(parsed.accessIssues) ? parsed.accessIssues : [])
        .map(s => String(s).trim())
        .filter(s => s.length > 0 && !isPlaceholder(s));
      entry.accessExtrication = {
        accessIssues: cleaned,
        extricationNeeded: Boolean(parsed.extricationNeeded),
        note: typeof parsed.note === 'string' ? parsed.note.trim() : '',
      };
      done++;
      console.error(`✓ ${id}: ${JSON.stringify(entry.accessExtrication)}`);
    } catch (err) {
      console.error(`✗ ${id}: ${err.message}`);
    }
  }

  const header = src.slice(0, src.indexOf('export const SCENE_INTRODUCTIONS'));
  writeFileSync(genPath, `${header}export const SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> = ${JSON.stringify(data, null, 2)};\n`);
  console.error(`\nWrote ${Object.keys(data).length} intros (${done} gained access blocks) → ${genPath}`);
}
main().catch(err => { console.error('FATAL', err.message); process.exit(1); });