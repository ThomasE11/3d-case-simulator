#!/usr/bin/env node
/**
 * normalise-scene-intros.mjs
 *
 * The generator emits temperature/light/air as TOP-LEVEL keys on each entry,
 * but the SceneIntroduction schema nests them under sensoryCues. The first
 * 14 entries were hand-validated into the correct shape; this script folds
 * the flat keys of every entry into sensoryCues without re-running the model.
 *
 *   node scripts/normalise-scene-intros.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const genPath = resolve(__dirname, '..', 'src', 'data', 'sceneIntroductions.generated.ts');

const src = readFileSync(genPath, 'utf8');
const eq = src.indexOf('SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> =');
if (eq === -1) throw new Error('could not find export marker');
const brace = src.indexOf('{', eq);
const body = src.slice(brace).replace(/;\s*$/, '');
const data = JSON.parse(body);

let folded = 0;
for (const [id, entry] of Object.entries(data)) {
  const sc = entry.sensoryCues && typeof entry.sensoryCues === 'object' ? { ...entry.sensoryCues } : {};
  for (const k of ['temperature', 'light', 'air']) {
    if (k in entry) {
      sc[k] = entry[k];
      delete entry[k];
      folded++;
    }
  }
  entry.sensoryCues = sc;
}

const header = `/**
 * sceneIntroductions.generated.ts
 *
 * GENERATED — do not hand-edit. Produced by \`scripts/generate-scene-intros.mjs\`
 * (local Ollama model), normalised by \`scripts/normalise-scene-intros.mjs\`,
 * then reviewed. Keyed by case id, merged additively at render time.
 * Re-run the script to regenerate; it overwrites this file.
 */

import type { SceneIntroduction } from '@/lib/sceneIntroductions';

export const SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> =`;

writeFileSync(genPath, `${header} ${JSON.stringify(data, null, 2)};\n`);
console.error(`folded ${folded} flat sensory keys across ${Object.keys(data).length} entries → ${genPath}`);