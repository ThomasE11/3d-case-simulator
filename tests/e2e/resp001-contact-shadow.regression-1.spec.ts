import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ deviceScaleFactor: 2 });
test('villa contact shadow sits on the shared floor without moving the patient', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  // Cancel entrance before holding an identical lower-body inspection angle.
  await canvas.click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(1000);
  const initial = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const controls = state.controls as unknown as { target: import('three').Vector3; update: () => void };
    state.camera.position.set(1.5, 1.15, 2.8);
    controls.target.set(0, .35, .65);
    controls.update();
    const shadow = state.scene.getObjectByName('patient-contact-shadow')!;
    const patient = state.scene.getObjectByName('Patient')!;
    return { height: shadow.position.y, patientMatrix: patient.matrixWorld.elements.slice() };
  });
  expect(initial.height).toBeCloseTo(-.05, 5);
  for (const [label, height] of [['original', -.01], ['corrected', -.05]] as const) {
    await page.evaluate(y => { window.__r3f!.scene.getObjectByName('patient-contact-shadow')!.position.y = y; }, height);
    await page.waitForTimeout(700);
    await canvas.screenshot({ path: info.outputPath(`contact-${label}.png`) });
  }
  expect(await page.evaluate(() => window.__r3f!.scene.getObjectByName('Patient')!.matrixWorld.elements)).toEqual(initial.patientMatrix);
});

test('other scenes retain their existing floor receiver', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=trauma-011');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await expect.poll(() => page.evaluate(() => !!window.__r3f!.scene.getObjectByName('patient-contact-shadow')), { timeout: 30_000 }).toBe(true);
  expect(await page.evaluate(() => window.__r3f!.scene.getObjectByName('patient-contact-shadow')!.position.y)).toBe(-.01);
});
