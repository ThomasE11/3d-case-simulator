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
const ids = ['cardiac-013','trauma-008','y1-020'];
for (const id of ids) {
  const c = allCases.find(x => x.id === id);
  console.log(`\n==== ${id} ====  derived=${derive(c)}  authored=${c.sceneInfo?.environmentVariant}`);
  console.log('title:', c.title);
  console.log('subcategory:', c.subcategory);
  console.log('location:', JSON.stringify(c.dispatchInfo?.location));
}
