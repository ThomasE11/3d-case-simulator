/**
 * Pure-JS seam measurement, exported for tests and tooling.
 *
 * measure-lip-seam.mjs is an ESM CLI (it logs and exits), so this module
 * shells out to it with LIP_SEAM_JSON=1 and parses the JSON. The CLI stays
 * the source of truth for the printed table; this module is what unit and
 * e2e tests import without spawning a browser.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export interface LipSeam {
  crown: number;
  yCenter: number;
  yHalf: number;
  xMax: number;
  zMin: number;
  spanX: number;
}

const CLI = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'measure-lip-seam.mjs',
);

export function measureLipSeam(path: string): LipSeam | null {
  if (!existsSync(path)) return null;
  const { status, stdout } = spawnSync(process.execPath, [CLI, path], {
    env: { ...process.env, LIP_SEAM_JSON: '1' },
    encoding: 'utf8',
  });
  if (status !== 0) return null;
  for (const line of stdout.trim().split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try {
      const parsed = JSON.parse(trimmed) as { seam?: LipSeam | null };
      return parsed.seam ?? null;
    } catch {
      continue;
    }
  }
  return null;
}