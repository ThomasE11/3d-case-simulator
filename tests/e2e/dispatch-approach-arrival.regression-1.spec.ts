import { expect, test, type Page } from '@playwright/test';

async function openArrivalSurvey(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
    window.localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Start Training/i }).first().click();
  await page.getByRole('button', { name: '4th Year', exact: true }).click();
  await page.getByRole('button', { name: /Condition practice.*Search a diagnosis/i }).click();
  await page.getByPlaceholder('STEMI, asthma, pneumothorax, anaphylaxis...').fill('Life-threatening asthma');
  await page.getByRole('button', { name: /Life-threatening asthma.*1 case/i }).click();
}

test('dispatch fields lead into a non-blocking crew-to-patient arrival beat', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openArrivalSurvey(page);

  for (const field of ['location', 'time', 'caller', 'priority']) {
    await expect(page.getByTestId(`dispatch-field-${field}`)).toBeVisible();
  }

  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await expect(page.getByTestId('dispatch-approach-dispatch')).toBeVisible();
  await expect(page.getByText('Dispatch acknowledged', { exact: true })).toBeVisible();

  await expect(page.getByTestId('dispatch-approach-approach')).toBeVisible({ timeout: 3_000 });
  await expect(page.locator('.paramedic-arrival-crew')).toBeVisible();
  await expect(page.getByText('Crew approaching', { exact: true })).toBeVisible();

  // The beat is presentational only: it must not prevent the learner from
  // continuing directly into the hazard sweep.
  await page.getByRole('button', { name: /^Next$/ }).click();
  await expect(page.getByText('Scene Hazards & PPE', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('skips straight to the patient-first-look state without a walking overlay', async ({ page }) => {
    await openArrivalSurvey(page);
    await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
    await expect(page.getByTestId('dispatch-approach-patient')).toBeVisible();
    await expect(page.getByText('Patient first look', { exact: true })).toBeVisible();
    await expect(page.locator('.paramedic-arrival-crew')).toHaveCount(0);
  });
});
