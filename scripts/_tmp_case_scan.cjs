const { createRequire } = require('module');
const { resolve } = require('path');
const projectRoot = process.cwd();
const require2 = createRequire(resolve(projectRoot, 'package.json'));
const jiti = require2('jiti')(projectRoot, { interopDefault: true, alias: { '@': resolve(projectRoot, 'src') }, esmResolve: true });
const casesMod = jiti('./src/data/cases.ts');
const allCases = casesMod.allCases ?? casesMod.default?.allCases ?? [];
for (const id of ['y1-011','y1-018','y1-023','cardiac-008','cardiac-015','y1-016','litfl-003','litfl-010','y2-006']) {
  const c = allCases.find(x => x.id === id);
  if (!c) { console.log(id, 'NOT FOUND'); continue; }
  console.log('====', id, '====');
  console.log('position:', c.initialPresentation?.position);
  console.log('sceneInfo:', JSON.stringify(c.sceneInfo));
  console.log('category/subcat:', c.category, '/', c.subcategory);
  console.log('unconscious:', JSON.stringify(c.initialPresentation?.unconscious ?? c.initialPresentation?.conscious ?? null));
}
