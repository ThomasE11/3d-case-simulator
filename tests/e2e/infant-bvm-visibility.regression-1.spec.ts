import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

// Regression: ISSUE-008 — infant BVM treatment left only a floating oxygen line
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
test('infant BVM workflow leaves a visible fitted and connected device', async ({ page }) => {
  test.setTimeout(120_000);
  await page.clock.install();
  await page.goto('/?devLiveCase=cardiac-017&qa=infant-bvm-visibility');

  // The airway controls are gated behind the scene's authored breathing kit.
  // Open it first so the test exercises the same discoverable workflow as a
  // student, instead of relying on the old always-open tray.
  await page.getByRole('button', { name: 'Open Breathing kit from scene', exact: true }).click();
  await page.getByRole('button', { name: 'BVM Ventilation', exact: true }).first().click();
  const apply = page.getByRole('region', { name: 'Treatment jump bags', exact: true }).getByRole('button', { name: 'Apply', exact: true });
  await expect(apply).toBeVisible();
  await expect(apply).toBeEnabled();
  await apply.click({ force: true });

  for (const step of [
    'Prepare the infant circuit',
    'Position the airway',
    'Create an effective mask seal',
    'Deliver a test breath',
    'Set cadence and reassess',
  ]) {
    const action = page.getByRole('button', { name: `Perform: ${step}` });
    await expect(action).toBeEnabled();
    // The animated patient preview continuously changes the dialog's visual
    // bounding box; force targets the already-visible, enabled semantic button.
    await action.click({ force: true });
    await page.clock.fastForward(1_600);
  }

  await page.getByRole('button', { name: /Seal confirmed — begin timed ventilation/i }).click();
  await page.getByRole('button', { name: /20 \/ min — paediatric/i }).click();

  // Inspect the fitted device, not its duplicate status chip in the tray.
  const fittedBvm = page.getByLabel('Bag-valve-mask held with a two-handed face seal', { exact: true });
  await expect(fittedBvm).toBeVisible({ timeout: 20_000 });
  await expect(fittedBvm).toHaveAttribute('data-airway-connection', 'face');
  await expect(fittedBvm).toHaveAttribute('data-oxygen-connected', 'true');
  await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
});
