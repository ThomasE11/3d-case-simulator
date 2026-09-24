import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

// Regression: a new useTexture request in the equipment layer suspended the
// complete patient view, hiding controls and applied-equipment confirmation.
test('a slow device texture does not hide the patient or bedside controls', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 720 });
  await page.goto('/?devLiveCase=resp-001&capture');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 90_000 }).toBeGreaterThan(0.25);
  // Equipment is intentionally discoverable from the scene rather than
  // pre-opened on entry. Open the authored breathing kit before selecting the
  // device so this regression follows the same student path as the product.
  await page.getByRole('button', { name: 'Open Breathing kit from scene', exact: true }).click();
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const procedure = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  for (const step of [
    'Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask',
    'Set prescribed flow', 'Confirm response',
  ]) {
    await procedure.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  const confirm = procedure.getByRole('button', { name: /Oxygen running — reassess SpO₂/i });
  await expect(confirm).toBeEnabled();

  let assetRequested = false;
  let releaseTexture = () => {};
  const textureGate = new Promise<void>(resolve => { releaseTexture = resolve; });
  await page.route('**/equipment-assets/nonrebreather-mask-v2.webp', async route => {
    assetRequested = true;
    await textureGate;
    await route.continue();
  });

  try {
    await confirm.click();
    await expect.poll(() => assetRequested).toBe(true);
    await expect(procedure).toBeHidden();
    await expect(page.locator('.patient-model-canvas-stage')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Airway kit from scene' })).toBeVisible();
    await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(0.25);
  } finally {
    releaseTexture();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(page.getByText('Non-rebreather fitted over the nose and mouth', { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => renderedSceneFraction(page), { timeout: 10_000 }).toBeGreaterThan(0.25);
  await page.screenshot({ path: testInfo.outputPath('oxygen-patient-render.png') });
});
