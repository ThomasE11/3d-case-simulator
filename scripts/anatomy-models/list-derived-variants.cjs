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

const byVariant = {};
for (const c of allCases) {
  const v = derive(c);
  (byVariant[v] ??= []).push(c);
}
for (const v of ['heat', 'water', 'industrial', 'roadside', 'public']) {
  const list = byVariant[v] ?? [];
  console.log(`\n==== ${v} (${list.length} cases) ====`);
  for (const c of list) {
    const loc = c.dispatchInfo?.location ? ` | loc="${c.dispatchInfo.location}"` : '';
    console.log(`  ${c.id}: ${c.dispatchInfo?.callReason ?? ''}${loc}`);
  }
}
