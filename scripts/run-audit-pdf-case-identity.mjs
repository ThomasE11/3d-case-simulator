#!/usr/bin/env node
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

jiti('./scripts/audit-pdf-case-identity.ts');
