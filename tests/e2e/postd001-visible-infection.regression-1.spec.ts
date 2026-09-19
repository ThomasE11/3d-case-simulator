import { expect, test } from '@playwright/test';

test('post-operative infection is visible before and during abdominal inspection', async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.goto('/?devLiveCase=postd-001');

  const dressing = page.locator('[data-preexisting-dressing="infected-incision"]');
  await expect(dressing).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Flushing', { exact: true })).toBeVisible();
  await expect(page.getByText(/warm facial and upper-body flushing/i)).toBeVisible();
  await page.screenshot({ path: info.outputPath('postd001-overview-dressing.png') });

  await page.getByRole('button', { name: 'Examine Abdomen', exact: true }).click();
  await page.getByRole('button', { name: 'Expose', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect (distension, bruising, wounds)', exact: true }).click();

  await expect(dressing).toBeHidden();
  const wound = page.locator('.focused-wound-callout[data-wound-kind="infected-incision"]');
  await expect(wound).toBeVisible();
  await expect(wound).toHaveAttribute('aria-label', 'Infected surgical wound');
  await expect(page.getByText(/Midline incision.*Cellulitis 5cm around wound.*Seropurulent drainage/i)).toBeVisible();
  await page.screenshot({ path: info.outputPath('postd001-exposed-infected-incision.png') });
});
