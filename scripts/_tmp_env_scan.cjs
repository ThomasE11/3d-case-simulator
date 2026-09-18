const { createRequire } = require('module');
const { resolve } = require('path');
const projectRoot = process.cwd();
const require2 = createRequire(resolve(projectRoot, 'package.json'));
const jiti = require2('jiti')(projectRoot, { interopDefault: true, alias: { '@': resolve(projectRoot, 'src') }, esmResolve: true });
const casesMod = jiti('./src/data/cases.ts');
const allCases = casesMod.allCases ?? casesMod.default?.allCases ?? [];
const envMod = jiti('./src/lib/sceneEnvironment.ts');
const derive = envMod.deriveSceneEnvironment;
let mismatches = [];
for (const c of allCases) {
  const authored = c.sceneInfo?.environmentVariant;
  const derived = derive ? derive(c) : null;
  if (authored && derived && authored !== derived) {
    mismatches.push({ id: c.id, authored, derived });
  }
  if (!authored) {
    mismatches.push({ id: c.id, authored: null, derived });
  }
}
console.log('total', allCases.length, 'noAuthoredOrMismatch', mismatches.length);
console.log(JSON.stringify(mismatches.slice(0, 60), null, 1));
