import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

test('workshop burn patient keeps both painful hands visibly apart', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=y2-004');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.locator('.tactical-patient-viewport').screenshot({
    path: info.outputPath('workshop-burn-patient.png'),
  });

  const hands = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    const position = (name: string) => body.skeleton.bones
      .find(bone => bone.name === `mixamorig${name}`)!
      .getWorldPosition(state.camera.position.clone()).toArray();
    return { left: position('LeftHand'), right: position('RightHand') };
  });
  // This scene previously crossed the wrists over the sternum in an X even
  // though the authored patient protects burned hands away from the body.
  expect(Math.abs(hands.left[0] - hands.right[0])).toBeGreaterThan(0.25);
});

test('workshop scene opens without a render boundary at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 523, height: 841 });
  await page.goto('/?devLiveCase=y2-004');
  await expect(page.getByText('StudentPanel Error')).toHaveCount(0);
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
});
