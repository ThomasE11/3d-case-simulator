import { expect, test } from '@playwright/test';

// Regression: the COPD pathway prescribed 24–28% controlled oxygen but the
// bag only offered generic/high-concentration masks and recommended an NRB.
test('COPD starts with a 28% Venturi pathway and teaches its fixed-performance setup', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?devLiveCase=resp-003');

  const breathingBag = page.locator('[data-bag-key="breathing"]');
  // Gear is intentionally closed on entry: spot the scene kit, then open it
  // before selecting the device, just as a student would at the bedside.
  await page.getByRole('button', { name: 'Open Breathing kit from scene' }).click();
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'open', { timeout: 30_000 });
  await expect(page.locator('[data-equipment-inventory="true"]')).toContainText('Venturi Mask 28%');

  const venturiCard = page.locator('[data-treatment-id="oxygen_venturi"]');
  const nrbCard = page.locator('[data-treatment-id="oxygen_nonrebreather"]');
  await expect(venturiCard).toContainText('Suggested');
  await expect(venturiCard).toContainText('SpO₂ 88–92%');
  await expect(nrbCard).not.toContainText('Suggested');

  await page.getByRole('button', { name: 'Select Venturi Mask 28%' }).click();

  const procedure = page.getByRole('dialog', { name: /Apply 28% Venturi mask/i });
  await expect(procedure).toBeVisible();
  await expect(procedure).toContainText('prescribed Venturi valve');
  await expect(procedure).toContainText('entrainment ports unobstructed');
  await expect(procedure).toContainText('do not estimate FiO₂ by turning the flow down');

  for (const step of [
    'Select valve and connect oxygen',
    'Seat the mask',
    'Set prescribed flow',
    'Confirm response',
  ]) {
    const action = procedure.getByRole('button', { name: `Perform: ${step}` });
    await expect(action).toBeEnabled();
    if (step === 'Confirm response') {
      await expect(procedure).toContainText('do not chase a normal 98% saturation');
    }
    await action.click();
  }

  await procedure.getByRole('button', { name: /Controlled O₂ running — target 88–92%/i }).click();
  await expect(procedure).toBeHidden();
  await expect(
    page.locator(
      '[data-applied-equipment="venturi"]'
        + '[data-airway-connection="face"]'
        + '[data-patient-anchored="true"]',
    ),
  ).toBeVisible();
  await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
});
