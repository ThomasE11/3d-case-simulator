import { expect, test } from '@playwright/test';

test('male patient keeps a male voice when his wife is present', async ({ page }) => {
  const requests: Array<Record<string, unknown>> = [];
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/tts', route => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ status: 503, body: 'Test fallback' });
  });

  await page.goto('/?devLiveCase=cardiac-001');
  await page.getByRole('tab', { name: 'History', exact: true }).click();

  const panel = page.getByRole('main');
  await expect(page.getByText('History Taking — Ask the Patient')).toBeVisible();
  await page.getByRole('textbox', { name: 'Your question to the patient' }).fill('What happened?');
  await page.getByRole('button', { name: 'Send question', exact: true }).click();

  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]).toMatchObject({
    role: 'patient',
    patientVoice: { gender: 'male' },
  });

  await page.getByRole('button', { name: 'Bystander', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your question to the bystander' }).fill('What did you see?');
  await page.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(panel).toContainText(/His wife/i);
  await page.waitForTimeout(750);
  expect(requests).toHaveLength(1);
});
