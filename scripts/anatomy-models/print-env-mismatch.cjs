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
const ids = ['cardiac-013','resp-010','trauma-008','trauma-009','trauma-011','burn-002','y1-020','y2-004'];
for (const id of ids) {
  const c = allCases.find(x => x.id === id);
  if (!c) { console.log(`\n${id}: NOT FOUND`); continue; }
  console.log(`\n==== ${id} ====`);
  console.log('callReason:', JSON.stringify(c.dispatchInfo?.callReason));
  console.log('position:', c.initialPresentation?.position);
  console.log('sceneInfo:', JSON.stringify(c.sceneInfo));
  console.log('sceneImagePath:', c.sceneImagePath);
  console.log('sceneImageCaption:', c.sceneImageCaption);
  console.log('category/subcat:', c.category, '/', c.subcategory);
}
