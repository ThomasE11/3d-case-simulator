import { test, expect } from '@playwright/test';

/**
 * Smoke test for the full student case flow:
 * landing → case select → briefing → scene survey → treatment bay →
 * apply treatment → transport wizard → debrief.
 *
 * Selectors are text/role-based (resilient to styling churn).
 */

test.beforeEach(async ({ page }) => {
  // Skip the onboarding tour — same mechanism the app itself uses.
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

test('full case flow: landing → treatment → debrief', async ({ page }) => {
  // ── Landing page ──
  await page.goto('/');
  const start = page.getByRole('button', { name: /Start Training/i }).first();
  await expect(start).toBeVisible();
  await start.click();

  // ── Case selection (mission board) ──
  await expect(page.getByRole('heading', { name: 'Choose the next patient encounter' })).toBeVisible();
  // Choose a repeatable respiratory encounter, not an arbitrary smart case:
  // blindly applying the first airway item can correctly trigger a warning.
  await page.getByRole('button', { name: '4th Year', exact: true }).click();
  await page.getByRole('button', { name: /Condition practice.*Search a diagnosis/i }).click();
  await page.getByPlaceholder('STEMI, asthma, pneumothorax, anaphylaxis...').fill('Life-threatening asthma');
  await page.getByRole('button', { name: /Life-threatening asthma.*1 case/i }).click();

  // ── Briefing ──
  const beginSurvey = page.getByRole('button', { name: /Begin Scene Survey/i });
  await expect(beginSurvey).toBeVisible({ timeout: 15_000 });
  await beginSurvey.click();

  // ── Scene survey: approach → hazards → enter ──
  await page.getByRole('button', { name: /^Next$/ }).click();
  const authoredHazards = page.getByRole('button', { name: /^Identify hazard:/i });
  for (let index = 0; index < await authoredHazards.count(); index += 1) {
    await authoredHazards.nth(index).click();
  }
  const noHazards = page.getByRole('button', { name: /No obvious hazards after visual sweep/i });
  if (await noHazards.count()) await noHazards.click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  for (const ppe of ['Gloves', 'N95 respirator']) {
    const control = page.getByRole('button', { name: new RegExp(`${ppe}.*Required`, 'i') });
    if (await control.count() && await control.getAttribute('aria-pressed') !== 'true') await control.click();
  }
  await page.getByRole('button', { name: /Enter Scene/i }).click();

  // ── Treatment bay: 3D canvas + monitor ──
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole('button', { name: /power the monitor|Monitor is on/i }),
  ).toBeVisible();

  // ── Apply oxygen through the real hands-on procedure ──
  await page.getByRole('button', { name: 'Open Breathing kit from scene' }).click();
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const oxygen = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  for (const step of ['Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask', 'Set prescribed flow', 'Confirm response']) {
    await oxygen.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await oxygen.getByRole('button', { name: /Oxygen running — reassess SpO₂/i }).click();
  await expect(page.getByRole('button', { name: 'Connected Non-rebreather', exact: true })).toBeVisible();
  await expect(page.getByText(/Live care feed/i)).toBeVisible();

  // ── End case: transport & handover wizard ──
  await page.getByRole('button', { name: 'Transport', exact: true }).click();
  await page.getByRole('button', { name: /Lights & Sirens/i }).click();
  await page.getByRole('button', { name: /Sitting|Upright|Semi.recumbent/i }).first().click();
  await page.getByRole('button', { name: /Yes — Pre-Alert/i }).click();
  await page.getByRole('button', { name: /Nearest ED/i }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /Other \/ Undifferentiated/i }).click();
  await page.getByRole('button', { name: /Confirm & End Case/i }).click();

  // ── Debrief: session summary with a score ──
  await expect(page.getByText('Case Complete')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/^\d+%$/).first()).toBeVisible();
});
