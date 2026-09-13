import { chromium } from 'playwright';

const outDir = '/Users/eliastlcthomas/Projects/app/test-results';
const baseUrl = process.env.APP_URL ?? 'http://localhost:5173';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(40000);
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(`${baseUrl}/?devLiveCase=cardiac-002&capture`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);

// Enter the TREAT tab — interventions (incl. BVM) live there, not in ASSESS.
const treatTab = page.getByRole('tab', { name: /TREAT/i }).first();
if (await treatTab.isVisible({ timeout: 3000 }).catch(() => false)) {
  await treatTab.click();
} else {
  await page.getByRole('button', { name: /^TREAT$/i }).first().click();
}
await page.waitForTimeout(1500);

// Apply BVM ventilation (cardiac-002 has a BVM Ventilation priority action).
await page.getByRole('button', { name: 'BVM Ventilation', exact: true }).click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: /^Apply$/i }).first().click();
await page.waitForTimeout(2000);

// Drive the procedure dialog: click each "Perform:" step until completion.
const dialog = page.getByRole('dialog').last();
for (let steps = 0; steps < 10; steps++) {
  const perform = dialog.getByRole('button', { name: /^Perform:/i }).first();
  if (!await perform.isVisible({ timeout: 500 }).catch(() => false)) break;
  const label = (await perform.textContent())?.trim();
  await perform.click();
  // Wait for the step to advance.
  let advanced = false;
  for (let a = 0; a < 60; a++) {
    await page.waitForTimeout(100);
    const next = dialog.getByRole('button', { name: /^Perform:/i }).first();
    if (await next.isVisible().catch(() => false)) {
      if ((await next.textContent())?.trim() !== label) { advanced = true; break; }
    } else if (await dialog.getByRole('button', { name: /ventilation|documented|monitor|reassess/i }).last().isVisible().catch(() => false)) {
      advanced = true; break;
    }
  }
  if (!advanced) break;
}
const finish = dialog.getByRole('button', { name: /ventilation|documented|monitor|reassess/i }).last();
await finish.waitFor({ timeout: 15000 }).catch(() => {});
await finish.click().catch(() => {});
await page.waitForTimeout(1000);

// Ventilation rate dialog if present.
const rateDialog = page.getByRole('dialog').filter({ hasText: 'BVM ventilation rate' }).last();
if (await rateDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
  await rateDialog.getByRole('button', { name: /10 \/ min — arrest/i }).click().catch(() => {});
  await page.waitForTimeout(700);
}

// Verify the 3D fitted BVM group is present in the R3F scene (not the HTML billboard).
const scene = await page.evaluate(() => {
  const state = window.__r3f;
  if (!state) return { found: false, reason: 'no __r3f' };
  const root = state.scene;
  let bvmGroup = null;
  let harnessPresent = false;
  root.traverse(o => {
    if (!bvmGroup && o.name === 'applied-bvm-mask') bvmGroup = {
      position: o.position.toArray(),
      scale: o.scale.toArray(),
      childCount: o.children.length,
    };
    // A BVM must NOT be strapped; the harness strap group should be absent.
    if (!harnessPresent && /harness|strap/i.test(o.name)) harnessPresent = true;
  });
  return { found: !!bvmGroup, bvmGroup, harnessPresent };
});

await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/bvm-fitted-face-verified.png` });
await page.getByRole('button', { name: 'Examine Face' }).click().catch(() => {});
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outDir}/bvm-face-closeup-verified.png` });

await browser.close();

console.log(JSON.stringify({ scene, errors }, null, 2));

const ok = scene.found && !scene.harnessPresent && errors.length === 0;
console.log(ok ? 'PASS: fitted 3D BVM rendered, no harness, no console errors'
              : 'FAIL: see JSON above');
process.exitCode = ok ? 0 : 1;
