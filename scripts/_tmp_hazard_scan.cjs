const { createRequire } = require('module');
const { resolve } = require('path');
const projectRoot = process.cwd();
const require2 = createRequire(resolve(projectRoot, 'package.json'));
const jiti = require2('jiti')(projectRoot, { interopDefault: true, alias: { '@': resolve(projectRoot, 'src') }, esmResolve: true });
const casesMod = jiti('./src/data/cases.ts');
const allCases = casesMod.allCases ?? casesMod.default?.allCases ?? [];
const safety = jiti('./src/lib/sceneSafety.ts');
let withHazards = 0, withPpe = 0, total = allCases.length;
const samples = [];
for (const c of allCases) {
  const hz = safety.visibleSceneHazards(c);
  const ppe = safety.mandatoryScenePpe(c);
  if (hz.length > 0) withHazards++;
  if (ppe.length > 1) withPpe++;
  if (hz.length > 0) samples.push({ id: c.id, hz, ppe });
}
console.log('total', total, 'withHazards', withHazards, 'withPpe>1', withPpe);
console.log(JSON.stringify(samples, null, 1));
