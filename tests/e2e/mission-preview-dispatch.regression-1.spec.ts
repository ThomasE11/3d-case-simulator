import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

// Regression: ISSUE-004 — the smart-case preview and dispatched patient differed
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
test('launches the exact case shown in the mission preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start Training/i }).first().click();

  const previewTitle = page.locator('aside h4');
  await expect(previewTitle).toBeVisible();
  const expectedTitle = (await previewTitle.textContent())?.trim();
  expect(expectedTitle).toBeTruthy();

  await page.getByRole('button', { name: /Start this case/i }).click();

  await expect(page.getByRole('heading', { name: expectedTitle!, exact: true })).toBeVisible({ timeout: 15_000 });
});
