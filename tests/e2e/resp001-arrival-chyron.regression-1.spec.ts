import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

// Regression: D3 cinematic arrival — entering the resp-001 villa scene must
// surface a broadcast lower-third chyron announcing arrival, then auto-clear
// without intercepting input. Asserts the chyron carries the authored scene
// caption (not a generic label) and never renders for a caption-less case.
test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
test('entering the resp-001 scene announces arrival via a self-clearing chyron', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });

  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);

  // The chyron appears shortly after entering the live scene (the doorway
  // dolly runs ~3.3s; the chyron is delayed ~260ms so it reads as arriving).
  const chyron = page.getByTestId('scene-arrival-chyron');
  await expect(chyron).toBeVisible({ timeout: 5_000 });

  // It must announce the authored scene — not a generic "you are here".
  await expect(chyron).toContainText('ON SCENE');
  await expect(chyron).toContainText('Villa living room — Al Ain');

  // It never blocks interaction: pointer events are disabled on the overlay.
  const pointerEvents = await chyron.evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pointerEvents).toBe('none');

  // It auto-clears after the hold window (≤ ~4.2s after it appears).
  await expect(chyron).toBeHidden({ timeout: 6_000 });
  expect(errors).toEqual([]);
});

test('no arrival chyron is shown for a scene-less clinic case', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });
  // cardiac-016 is a clinic/domestic arrest case; it has no sceneImageCaption,
  // so the chyron must never mount even though the live phase is entered.
  await page.goto('/?devLiveCase=cardiac-016');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.waitForTimeout(1_000);
  await expect(page.getByTestId('scene-arrival-chyron')).toHaveCount(0);
});
