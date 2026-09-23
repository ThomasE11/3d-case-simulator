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

  const chairColors = await page.evaluate(() => {
    const chair = window.__r3f!.get().scene.getObjectByName('clinical-patient-seat');
    const colors: string[] = [];
    chair?.traverse(object => {
      if (object.type !== 'Mesh') return;
      const material = (object as THREE.Mesh).material;
      (Array.isArray(material) ? material : [material]).forEach(item => {
        if ('color' in item) colors.push((item as THREE.MeshStandardMaterial).color.getHexString());
      });
    });
    return colors;
  });
  expect(chairColors).toContain('47545a');
  const firstLook = await page.request.get('/scene-assets/y2-004-workshop-flash-burn-seated.png');
  expect(firstLook.ok()).toBe(true);
  expect(firstLook.headers()['content-type']).toContain('image/png');
});

test('workshop scene opens without a render boundary at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 523, height: 841 });
  await page.goto('/?devLiveCase=y2-004');
  await expect(page.getByText('StudentPanel Error')).toHaveCount(0);
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
});

test('workshop witnesses stay upright during idle motion', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=y2-004');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.waitForTimeout(700);
  const crowd = await page.evaluate(() => {
    const root = window.__r3f!.get().scene.getObjectByName('bystander-crowd');
    return root?.children.filter(child => child.type === 'Group').map(child => ({
      pitch: child.rotation.x,
      yaw: child.rotation.y,
      roll: child.rotation.z,
      heightScale: child.scale.y,
    })) ?? [];
  });
  const witnessMaterials = await page.evaluate(() => {
    const root = window.__r3f!.get().scene.getObjectByName('bystander-crowd');
    const figures = root?.children.filter(child => child.type === 'Group') ?? [];
    return figures.slice(0, 2).map(figure => {
      const names = new Set<string>();
      figure.traverse(object => {
        if (object.type !== 'Mesh') return;
        const material = (object as THREE.Mesh).material;
        (Array.isArray(material) ? material : [material]).forEach(item => names.add(item.name));
      });
      return [...names];
    });
  });
  await info.attach('witness-transforms', { body: JSON.stringify(crowd), contentType: 'application/json' });
  await page.locator('.tactical-patient-viewport').screenshot({ path: info.outputPath('upright-witnesses.png') });
  expect(crowd.length).toBeGreaterThan(0);
  expect(witnessMaterials[0].some(name => name.includes('shirt'))).toBe(true);
  expect(witnessMaterials[0].some(name => name.includes('trousers'))).toBe(true);
  for (const witness of crowd) {
    expect(Math.abs(witness.roll)).toBeLessThan(0.04);
    expect(witness.heightScale).toBeGreaterThan(0.98);
    expect(witness.heightScale).toBeLessThan(1.02);
  }
});
