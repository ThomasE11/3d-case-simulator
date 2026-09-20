import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });

test('resp-001 cyanosis clears at SpO2 94 (GOAL_CONTRACT B4)', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });
  await page.goto('/?devLiveCase=resp-001&spo2=94');
  await page.waitForFunction(() => {
    const scene = window.__r3f?.scene;
    let ready = false;
    scene?.traverse(object => {
      if ((object as import('three').Mesh).userData?.eyesOpenTex) ready = true;
    });
    return ready;
  });
  // At SpO2 94 the cyanosis overlay must NOT be applied: the open atlas must
  // equal the stored base atlas (no cyanosis twin was built on top of it).
  const result = await page.evaluate(() => {
    const scene = window.__r3f!.scene;
    let body: import('three').Mesh | null = null;
    scene.traverse(object => {
      const mesh = object as import('three').Mesh;
      if (!body && mesh.isMesh && mesh.userData?.eyesOpenTex) body = mesh;
    });
    if (!body) return { found: false };
    const base = body.userData.cyanosisBaseOpenTex;
    const applied = body.userData.cyanosisOpenTex;
    return {
      found: true,
      hasBase: !!base,
      hasApplied: !!applied,
      sameAtlas: base === applied,
    };
  });
  expect(result.found).toBe(true);
  expect(result.hasApplied).toBe(false);
  expect(result.sameAtlas).toBe(true);
  await page.screenshot({ path: info.outputPath('cyanosis-clear-94.png') });
});