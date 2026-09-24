import { test, expect } from '@playwright/test';

async function openPilotHazardSweep(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Start Training/i }).first().click();
  await page.getByRole('button', { name: '4th Year', exact: true }).click();
  await page.getByRole('button', { name: /Condition practice.*Search a diagnosis/i }).click();
  await page.getByPlaceholder('STEMI, asthma, pneumothorax, anaphylaxis...').fill('Atrial Fibrillation with Rapid Ventricular Response');
  await page.getByRole('button', { name: /Atrial Fibrillation with Rapid Ventricular Response.*1 case/i }).click();
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await expect(page.getByText('Scene Hazards & PPE', { exact: true })).toBeVisible();
}

async function openOrganophosphateHazardSweep(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Start Training/i }).first().click();
  await page.getByRole('button', { name: '4th Year', exact: true }).click();
  await page.getByRole('button', { name: /Condition practice.*Search a diagnosis/i }).click();
  await page.getByPlaceholder('STEMI, asthma, pneumothorax, anaphylaxis...').fill('Organophosphate');
  await page.getByRole('button', { name: 'Organophosphate poisoning 1 case', exact: true }).click();
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await expect(page.getByText('Scene Hazards & PPE', { exact: true })).toBeVisible();
}

test('clear scene keeps the photograph unobscured and requires a deliberate sweep', async ({ page }) => {
  await openPilotHazardSweep(page);

  const scene = page.getByText('Hazard scan', { exact: true }).locator('..');
  await expect(scene.getByText('Patient', { exact: true })).toHaveCount(0);
  await expect(scene.getByText('No obvious hazards visible', { exact: true })).toBeVisible();

  const cinematicPhase = page.getByTestId('cinematic-phase');
  const narration = cinematicPhase.getByRole('button', { name: 'Disable voice narration' });
  await expect(narration).toHaveAttribute('aria-pressed', 'true');
  await narration.click();
  await expect(cinematicPhase.getByRole('button', { name: 'Enable voice narration' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Enable voice narration' })).toHaveCount(2);

  const clearSweep = page.getByRole('button', { name: 'No obvious hazards after visual sweep' });
  await expect(clearSweep).toHaveAttribute('aria-pressed', 'false');
  await clearSweep.click();
  await expect(clearSweep).toHaveAttribute('aria-pressed', 'true');

  const decision = page.getByText('Commit your scene safety decision', { exact: true }).locator('..');
  const safe = decision.getByRole('button', { name: /Scene is safe/i });
  const unsafe = decision.getByRole('button', { name: /Scene is unsafe/i });
  await expect(safe).toHaveAttribute('aria-pressed', 'false');
  await expect(unsafe).toHaveAttribute('aria-pressed', 'false');

  const enterScene = page.getByRole('button', { name: /^Enter Scene/ });
  await expect(enterScene).toBeDisabled();
  await expect(enterScene).toHaveClass(/bg-slate-100/);

  await safe.click();
  await expect(safe).toHaveAttribute('aria-pressed', 'true');
  await expect(enterScene).toBeDisabled();
  const requiredPpe = page.getByRole('button', { name: /Required/i });
  for (let index = 0; index < await requiredPpe.count(); index += 1) {
    const control = requiredPpe.nth(index);
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(enterScene).toBeEnabled();
  await expect(enterScene).toHaveClass(/bg-green-600/);
});

test('hazardous scenes require every authored hotspot before entry', async ({ page }) => {
  await openOrganophosphateHazardSweep(page);

  const enterScene = page.getByRole('button', { name: /^Enter Scene/ });
  const safe = page.getByRole('button', { name: /Scene is safe/i });
  const chemical = page.getByRole('button', { name: /Identify hazard: CHEMICAL CONTAMINATION/i }).first();
  const exposedWorkers = page.getByRole('button', { name: /Identify hazard: Other workers potentially affected/i }).first();

  await expect(chemical).toHaveAttribute('aria-pressed', 'false');
  await expect(exposedWorkers).toHaveAttribute('aria-pressed', 'false');
  await chemical.click();
  await expect(page.getByRole('button', { name: /Acknowledged: CHEMICAL CONTAMINATION/i }).first()).toHaveAttribute('aria-pressed', 'true');

  await safe.click();
  const requiredPpe = ['Gloves', 'Surgical mask'];
  for (const ppe of requiredPpe) {
    const control = page.getByRole('button', { name: new RegExp(`${ppe}.*Required`, 'i') });
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await control.click();
  }
  await expect(page.getByRole('status')).toHaveText(/Acknowledge the remaining hazards/);
  await expect(enterScene).toBeDisabled();

  const remainingHazards = page.getByRole('button', { name: /^Identify hazard:/i });
  while (await remainingHazards.count()) {
    await remainingHazards.first().click();
  }
  // Once every visible hotspot is acknowledged, the student may declare the
  // scene safe after donning the required PPE; the hazard has been mitigated,
  // not silently ignored.
  await expect(enterScene).toBeEnabled();

  for (const ppe of requiredPpe) {
    await expect(page.getByRole('button', { name: new RegExp(`${ppe}.*Required`, 'i') })).toHaveAttribute('aria-pressed', 'true');
  }
  const unsafe = page.getByRole('button', { name: /Scene is unsafe/i });
  await unsafe.click();
  await expect(unsafe).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status')).toHaveText('Request at least one additional resource.');
  await expect(enterScene).toBeDisabled();
  await page.getByRole('button', { name: 'HazMat', exact: true }).click();
  await expect(enterScene).toBeEnabled();
});
