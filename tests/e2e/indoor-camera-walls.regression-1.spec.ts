import { expect, test } from '@playwright/test';

// Regression: ISSUE-025 — free orbit and the raw Posterior toggle could move
// the camera through the villa walls and show the room from outside.
test('the resp-001 camera remains inside its physical villa shell', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001&capture');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  const logRoll = page.getByRole('button', { name: 'Log Roll', exact: true });
  await expect(logRoll).toBeVisible({ timeout: 30_000 });

  const result = await page.waitForFunction(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    const controls = state?.controls;
    if (!state?.camera || !controls?.target) return null;

    // Reproduce the old escape: place the camera seven metres behind the
    // patient, then let OrbitControls reconcile its spherical constraints.
    state.camera.position.set(controls.target.x, controls.target.y, controls.target.z - 7);
    controls.update();
    const frontWall = state.scene.getObjectByName('resp001-villa-front-wall');
    const leftWall = state.scene.getObjectByName('resp001-villa-side-wall-left');
    const rightWall = state.scene.getObjectByName('resp001-villa-side-wall-right');
    const floor = state.scene.getObjectByName('resp001-villa-floor');
    const ceiling = state.scene.getObjectByName('resp001-villa-ceiling');
    if (!frontWall || !leftWall || !rightWall || !floor) return null;

    const makeVector = () => state.camera.position.clone().set(0, 0, 0);
    const frontPosition = frontWall.getWorldPosition(makeVector());
    const leftPosition = leftWall.getWorldPosition(makeVector());
    const rightPosition = rightWall.getWorldPosition(makeVector());
    const floorPosition = floor.getWorldPosition(makeVector());
    const frontHalfDepth = frontWall.geometry.parameters.depth / 2;
    const sideHalfWidth = leftWall.geometry.parameters.width / 2;
    return {
      angle: controls.getAzimuthalAngle(),
      distance: state.camera.position.distanceTo(controls.target),
      cameraX: state.camera.position.x,
      cameraY: state.camera.position.y,
      cameraZ: state.camera.position.z,
      targetZ: controls.target.z,
      frontInnerZ: frontPosition.z - frontHalfDepth,
      leftInnerX: leftPosition.x + sideHalfWidth,
      rightInnerX: rightPosition.x - sideHalfWidth,
      floorY: floorPosition.y,
      hasCeiling: Boolean(ceiling),
    };
  }, null, { timeout: 30_000 }).then(handle => handle.jsonValue());

  expect(Math.abs(result.angle)).toBeLessThanOrEqual(Math.PI / 4 + 0.001);
  expect(result.distance).toBeLessThanOrEqual(4.6 + 0.001);
  expect(result.cameraZ).toBeGreaterThan(result.targetZ);
  expect(result.cameraZ).toBeLessThan(result.frontInnerZ);
  expect(result.cameraX).toBeGreaterThan(result.leftInnerX);
  expect(result.cameraX).toBeLessThan(result.rightInnerX);
  expect(result.cameraY).toBeGreaterThan(result.floorY);
  expect(result.hasCeiling).toBe(false);

  const highOrbit = await page.evaluate(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    const controls = state.controls;
    const target = controls.target;
    state.camera.position.set(target.x, target.y + 7, target.z + 0.01);
    controls.update();
    return {
      cameraY: state.camera.position.y,
      maxPolarAngle: controls.maxPolarAngle,
      minPolarAngle: controls.minPolarAngle,
    };
  });
  expect(highOrbit.minPolarAngle).toBeCloseTo(Math.PI * 0.20, 5);
  expect(highOrbit.maxPolarAngle).toBeCloseTo(Math.PI / 2 - 0.04, 5);
  expect(highOrbit.cameraY).toBeGreaterThan(2.85);
  await expect(page.getByRole('button', { name: 'Posterior', exact: true })).toHaveCount(0);
  await expect(logRoll).toBeVisible();

  await logRoll.click();
  await page.waitForTimeout(700);
  const afterLogRoll = await page.evaluate(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    return {
      angle: state.controls.getAzimuthalAngle(),
      cameraZ: state.camera.position.z,
      targetZ: state.controls.target.z,
    };
  });
  expect(Math.abs(afterLogRoll.angle)).toBeLessThanOrEqual(Math.PI / 4 + 0.001);
  expect(afterLogRoll.cameraZ).toBeGreaterThan(afterLogRoll.targetZ);
});
