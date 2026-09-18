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
const ids = ['env-001','y1-004','cardiac-014','trauma-012','trauma-010'];
for (const id of ids) {
  const c = allCases.find(x => x.id === id);
  console.log(`\n==== ${id} ====`);
  console.log('callReason:', c.dispatchInfo?.callReason);
  console.log('environment:', JSON.stringify(c.sceneInfo?.environment));
  console.log('description:', JSON.stringify(c.sceneInfo?.description));
  console.log('environmentVariant:', c.sceneInfo?.environmentVariant);
}
