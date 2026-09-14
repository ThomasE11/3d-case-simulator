import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ deviceScaleFactor: 2 });
test('reference shirt hem preserves its authored seated shape', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  for (const profile of ['original', 'corrected']) {
    if (profile === 'original') {
      await page.route('**/ClothingLayer.tsx*', async route => {
        const response = await route.fetch();
        const body = await response.text();
        // Keep the baseline route syntactically valid after the clean-hem
        // profile became the default. Match the complete property so a value
        // of 0.05 cannot turn into the invalid literal `0.05.05`.
        expect(body).toContain('hemDrop: 0.05');
        await route.fulfill({ response, body: body.replace('hemDrop: 0.05', 'hemDrop: 0') });
      });
    }
    await page.goto('/?devLiveCase=resp-001');
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    const canvas = page.locator('.patient-model-canvas-stage canvas');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const state = window.__r3f!.get();
      const controls = state.controls as unknown as { target: import('three').Vector3; update: () => void };
      state.camera.position.set(1.65, 1.5, 2.8);
      controls.target.set(0, .95, .6);
      controls.update();
    });
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.__r3f!.gl.getContext().isContextLost())).toBe(false);
    await canvas.screenshot({ path: info.outputPath(`shirt-hem-${profile}.png`) });
    await page.unroute('**/ClothingLayer.tsx*');
  }
  expect(errors).toEqual([]);
});
