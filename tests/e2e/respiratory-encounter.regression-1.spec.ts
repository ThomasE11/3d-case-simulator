import { expect, test, type Page } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';
import { getFittedFaceEquipmentSpec } from '../../src/components/Body3DModel/faceEquipment';

test.use({
  video: 'on',
  actionTimeout: 15_000,
  viewport: { width: 1440, height: 900 },
});

/**
 * The monitor is intentionally dark until a student powers it on and asks for
 * a measurement.  These encounter tests must preserve that clinical order
 * rather than silently relying on pre-populated vital-sign text.
 */
async function powerAndMeasureRespiratoryVitals(page: Page) {
  const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
  await expect(monitor.getByText('MONITOR OFF', { exact: true })).toBeVisible({ timeout: 30_000 });
  await monitor.getByRole('button', { name: 'Press ON to power the monitor' }).click();
  await page.clock.fastForward(4_000);
  for (const name of ['respiratory rate', 'oxygen saturation', 'heart rate']) {
    await monitor.getByRole('button', { name: `Measure ${name}`, exact: true }).click();
  }
  // Visual RR observation is deliberately a 35-second clinical assessment;
  // wait through the longer of the paired methods before asserting a value.
  await page.clock.fastForward(36_000);
  return monitor;
}

async function monitorValue(monitor: ReturnType<Page['getByRole']>, name: string) {
  const text = await monitor.getByRole('button', { name, exact: true }).innerText();
  const numbers = text.match(/\d+/g) ?? [];
  const value = Number.parseInt(numbers.at(-1) ?? '', 10);
  if (!Number.isFinite(value)) throw new Error(`Expected a measured value for ${name}, received: ${text}`);
  return value;
}

test('a loaded encounter still deteriorates when no treatment is given', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?devLiveCase=resp-001');
  const monitor = await powerAndMeasureRespiratoryVitals(page);
  await expect(monitor.getByText('RR 32', { exact: true })).toBeVisible();
  const baselineSpo2 = await monitorValue(monitor, 'Measure oxygen saturation');
  await page.clock.fastForward(30_000);
  await page.clock.fastForward(30_000);
  // SpO₂ allows a deliberate repeat measurement. RR stays visibly live after
  // its observed count, so it should worsen without inventing a second count.
  await monitor.getByRole('button', { name: 'Measure oxygen saturation', exact: true }).click();
  await page.clock.fastForward(10_000);
  expect(await monitorValue(monitor, 'Measure respiratory rate')).toBeGreaterThan(32);
  expect(await monitorValue(monitor, 'Measure oxygen saturation')).toBeLessThan(baselineSpo2);
});

async function ask(page: Page, question: string) {
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const panel = page.locator('[data-history-panel="true"]');
  await panel.getByRole('textbox').fill(question);
  await panel.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(panel.getByRole('log')).toContainText(question);
  return panel;
}

async function cyanosisPainted(page: Page) {
  return page.evaluate(() => {
    const state = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f;
    const body = state?.scene.getObjectByName('Patient') as THREE.Mesh | undefined;
    if (!body) return false;
    const material = (Array.isArray(body.material) ? body.material[0] : body.material) as THREE.MeshStandardMaterial;
    return !!body.userData.cyanosisOpenTex
      && (material.map === body.userData.cyanosisOpenTex || material.map === body.userData.cyanosisClosedTex);
  });
}

async function expectConnectedCircuit(page: Page, mode: string) {
  const spec = getFittedFaceEquipmentSpec(mode)!;
  await expect.poll(() => page.evaluate(exit => {
    const scene = (window as unknown as { __r3f: { scene: THREE.Scene } }).__r3f.scene;
    const frame = scene.getObjectByName('PatientFaceAttachment');
    const cable = scene.getObjectByName('patient-anchored-circuit') as THREE.Mesh<THREE.TubeGeometry> | undefined;
    if (!frame || !cable) return 1;
    const expected = scene.position.clone().set(...exit).applyMatrix4(frame.matrixWorld);
    return cable.geometry.parameters.path.getPoint(0).distanceTo(expected);
  }, spec.tubeExit)).toBeLessThan(0.001);
}

async function capturePatient(page: Page, path: string) {
  // The examination preset takes 460–500 ms. Inspect its settled view, not
  // the overview frame that is still visible immediately after the click.
  await page.waitForTimeout(1_000);
  await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(0.25);
  await page.screenshot({ path });
}

test('history, treatment, monitor and visible respiratory findings form one encounter', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => cyanosisPainted(page), { timeout: 30_000 }).toBe(true);

  const history = await ask(page, 'What happened?');
  const layout = await history.evaluate(el => ({ width: el.clientWidth, content: el.scrollWidth, scroll: el.scrollLeft }));
  expect(layout.content).toBeLessThanOrEqual(layout.width + 1);
  expect(layout.scroll).toBe(0);
  await expect(history.getByRole('log')).toContainText(/can't|breath|tight chest/i);
  // History comes before interventions while the patient is still capable of
  // short answers. The monitor is then powered and deliberately sampled.
  const monitor = await powerAndMeasureRespiratoryVitals(page);
  await expect(monitor.getByText('RR 32', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.getByRole('button', { name: /^Lips \(colour, cyanosis, dryness\)/ }).click();
  await expect(page.locator('.patient-first-exam-dock')).toContainText(/blue|dusky/i);
  await expect(page.getByTitle('Pain score - reassess periodically')).toHaveCount(0);
  await capturePatient(page, testInfo.outputPath('01-before-treatment.png'));
  await page.getByRole('button', { name: 'Back to full body', exact: true }).click();
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const oxygen = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  await expect(oxygen.getByRole('button', { name: /Oxygen running/ })).toHaveCount(0);
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  for (const step of ['Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask', 'Set prescribed flow', 'Confirm response']) {
    await oxygen.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await oxygen.getByRole('button', { name: /Oxygen running — reassess SpO₂/i }).click();
  // Advance treatment timers, not vitals. This also exercises the former
  // competing monitor-maintenance engine, which falsely normalised RR/HR.
  await page.clock.fastForward(90_000);
  await expect(monitor.getByText('RR 28', { exact: true })).toBeVisible();
  await expect(monitor.getByText('112', { exact: true }).first()).toBeVisible();
  await expect.poll(() => cyanosisPainted(page)).toBe(false);
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toBeVisible();
  await expectConnectedCircuit(page, 'nonrebreather');
  await ask(page, 'What is your pain out of 10?');
  await expect(history.getByRole('log')).toContainText(/no pain.*(?:can't|get a breath|enough air)/i);
  await expect(history.getByRole('log')).toContainText('What happened?');

  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.getByRole('button', { name: /^Lips \(colour, cyanosis, dryness\)/ }).click();
  await expect(page.locator('.patient-first-exam-dock')).toContainText(/pink|no visible.*cyanosis/i);
  await capturePatient(page, testInfo.outputPath('02-oxygen-face.png'));
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.44, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: 'Patient Examination— Face', exact: true })).toBeVisible();
  await capturePatient(page, testInfo.outputPath('03-oxygen-oblique.png'));
  await page.getByRole('button', { name: 'Back to full body', exact: true }).click();

  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await page.getByRole('button', { name: 'Select Nebuliser Mask', exact: true }).click();
  const nebuliser = page.getByRole('dialog', { name: 'Apply nebuliser mask', exact: true });
  for (const step of ['Assemble and connect', 'Explain and coach', 'Fit the mask', 'Start aerosol flow', 'Reassess response']) {
    await nebuliser.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await nebuliser.getByRole('button', { name: 'Aerosol flowing — reassess wheeze', exact: true }).click();
  await page.clock.fastForward(15_000);
  await expect(monitor.getByText('RR 14', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replaced Non-rebreather', exact: true })).toBeVisible();
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  await expect(page.locator('[data-applied-equipment="nebulizer"]')).toBeVisible();
  await expectConnectedCircuit(page, 'nebulizer');
  await ask(page, 'How do you feel?');
  await expect(history.getByRole('log')).toContainText('Breathing feels easier now. I can talk more comfortably.');
  await expect(history.getByRole('log')).toContainText('What happened?');
  // Return to the assessment rail deliberately; the examination controls are
  // not duplicated underneath the conversation view.
  await page.getByRole('tab', { name: 'Assess', exact: true }).click();
  await page.getByRole('button', { name: 'Look: Chest rise & colour', exact: true }).click();
  await expect(page.locator('.patient-first-exam-dock')).toContainText('Effort easing. Respiratory rate 14/min.');
  await page.getByRole('button', { name: 'Expose', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Re-dress', exact: true })).toBeVisible();
  const heading = (await page.getByRole('heading', { name: 'Patient Examination— Chest', exact: true }).boundingBox())!;
  const viewControls = (await page.getByRole('group', { name: 'Model view layer', exact: true }).boundingBox())!;
  const overlapWidth = Math.max(0, Math.min(heading.x + heading.width, viewControls.x + viewControls.width) - Math.max(heading.x, viewControls.x));
  const overlapHeight = Math.max(0, Math.min(heading.y + heading.height, viewControls.y + viewControls.height) - Math.max(heading.y, viewControls.y));
  expect(overlapWidth * overlapHeight).toBeLessThan(1);
  await capturePatient(page, testInfo.outputPath('04-reassessment.png'));
  expect(errors).toEqual([]);
});
