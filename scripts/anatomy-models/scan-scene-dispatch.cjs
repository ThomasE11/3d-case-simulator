// Scan the case registries for remaining scene<->dispatch consistency gaps:
// 1. authored environmentVariant vs derived environment (mismatch)
// 2. sceneImagePath present but sceneImageCaption missing
const { createRequire } = require('module');
const { resolve } = require('path');

const projectRoot = process.cwd();
const require2 = createRequire(resolve(projectRoot, 'package.json'));
const jiti = require2('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});
const casesMod = jiti('./src/data/cases.ts');
const allCases = casesMod.allCases ?? casesMod.default?.allCases ?? [];
const envMod = jiti('./src/lib/sceneEnvironment.ts');
const derive = envMod.deriveSceneEnvironment;

const envMismatch = [];
const missingCaption = [];
for (const c of allCases) {
  const authored = c.sceneInfo?.environmentVariant;
  const derived = derive ? derive(c) : null;
  if (authored && derived && authored !== derived) {
    envMismatch.push({ id: c.id, authored, derived });
  }
  if (c.sceneImagePath && !c.sceneImageCaption) {
    missingCaption.push(c.id);
  }
}
console.log('total', allCases.length);
console.log('ENV MISMATCH (authored vs derived):', envMismatch.length);
console.log(JSON.stringify(envMismatch, null, 1));
console.log('MISSING CAPTION:', missingCaption.length, missingCaption.join(', '));
