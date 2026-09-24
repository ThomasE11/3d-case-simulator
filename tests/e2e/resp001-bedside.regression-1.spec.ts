import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ video: 'on' });
test.beforeEach(async ({ page }) => {
  // Layout checks must not consume provider quota; audio integration has its
  // own controlled waveform test in resp001-response.regression-1.spec.ts.
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
});

for (const width of [890, 1440]) {
  test(`resp-001 keeps patient and interview together at ${width}px`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/?devLiveCase=resp-001');
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    const dock = page.getByRole('complementary', { name: 'Bedside conversation' });
    const panel = dock.locator('[data-history-panel]');
    await expect(panel).toBeVisible();
    await panel.getByRole('textbox').fill('What happened?');
    await panel.getByRole('button', { name: 'Send question', exact: true }).click();
    await expect(panel.getByRole('log')).toContainText(/can't|breath|tight chest/i);
    await expect(panel).toContainText('SAMPLE 1/6');
    await page.waitForTimeout(800);
    const canvas = page.locator('.patient-model-canvas-stage canvas');
    const box = (await canvas.boundingBox())!;
    // The patient's entire upper-body shot stays visible while asking.
    expect(box.y).toBeGreaterThanOrEqual(-2);
    expect(box.y + box.height).toBeLessThanOrEqual(902);
    const layout = await panel.evaluate(el => ({ width: el.clientWidth, content: el.scrollWidth }));
    expect(layout.content).toBeLessThanOrEqual(layout.width + 1);
    await page.screenshot({ path: info.outputPath('bedside-interview.png') });
    await page.getByRole('tab', { name: 'Assess', exact: true }).click();
    await expect(dock.locator('[data-history-panel]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
    await expect(page.locator('.patient-first-exam-dock')).toBeVisible();
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    await expect(panel.getByRole('log')).toContainText('What happened?');
    await expect(page.locator('.patient-first-exam-dock')).toHaveCount(0);
    await expect(panel).toContainText('SAMPLE 1/6');
    await page.getByRole('tab', { name: 'Treat', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Select Non-rebreather', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('the new room and bedside dock are restricted to the reference case', async ({ page }) => {
  await page.goto('/?devLiveCase=trauma-011');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await expect(page.locator('[data-history-panel]')).toBeVisible();
  await expect(page.locator('.bedside-history-dock')).toHaveCount(0);
  await expect(page.locator('[data-bedside-conversation]')).toHaveCount(0);
});

test('the villa remains inspectable from different bedside angles above the floor', async ({ page }, info) => {
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  for (const [name, direction] of [['left', -1], ['right', 1]] as const) {
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width * .5, box.y + box.height * .55);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * (.5 + direction * .25), box.y + box.height * .65, { steps: 16 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => {
      const scene = (window as unknown as { __r3f: { scene: import('three').Scene; camera: import('three').Camera } }).__r3f;
      const head = scene.scene.getObjectByName('mixamorigHead')!;
      const projected = head.getWorldPosition(head.position.clone()).project(scene.camera);
      return { cameraY: scene.camera.position.y, headX: projected.x, headY: projected.y, dressedRoom: !!scene.scene.getObjectByName('resp-001-villa-dressing') };
    });
    expect(state.cameraY).toBeGreaterThan(0);
    expect(state.dressedRoom).toBe(true);
    expect(Math.abs(state.headX)).toBeLessThan(.9);
    expect(Math.abs(state.headY)).toBeLessThan(.9);
    await canvas.screenshot({ path: info.outputPath(`villa-${name}.png`) });
  }
});
