import { expect, test } from '@playwright/test';

// Regression: ISSUE-026 — the selected jump bag was permanently open and
// clicking it again did nothing, so the loadout behaved like tabs, not gear.
test('jump bags physically open, close, switch, and reopen from the scene', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001');

  const breathingBag = page.locator('[data-bag-key="breathing"]');
  const airwayBag = page.locator('[data-bag-key="airway"]');
  await page.getByRole('button', { name: 'Open Breathing kit from scene' }).click();
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'open', { timeout: 30_000 });
  await expect(breathingBag).toHaveAccessibleName('Close Breathing Bag');
  await expect(page.locator('[data-equipment-inventory="true"]')).toBeVisible();

  await breathingBag.click();
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'closed');
  await expect(breathingBag).toHaveAccessibleName('Open Breathing Bag');
  await expect(page.locator('[data-equipment-inventory="true"]')).toHaveCount(0);
  await expect(page.getByPlaceholder(/Search Breathing Bag/i)).toHaveCount(0);

  await breathingBag.click();
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'open');
  await expect(page.locator('[data-equipment-inventory="true"]')).toBeVisible();

  await airwayBag.click();
  await expect(airwayBag).toHaveAttribute('data-bag-state', 'open');
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'closed');

  await page.getByRole('button', { name: 'Open Breathing kit from scene' }).click();
  await expect(breathingBag).toHaveAttribute('data-bag-state', 'open');
  await expect(airwayBag).toHaveAttribute('data-bag-state', 'closed');
});
