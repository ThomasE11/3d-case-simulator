import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

/**
 * Regression: a recumbent (supine) patient resting on a bed must sit ON the
 * support surface, not float above it. The rig-origin→posterior depth was
 * historically mis-calibrated (~0.48 m assumed vs ~0.256 m actual), which left
 * every supine patient hovering ~0.22 m above the stretcher/bed/floor.
 */
test('supine patient back contacts the bed (no float)', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=cardiac-007');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.waitForTimeout(1500);

  const measure = () =>
    page.evaluate(() => {
      const state = window.__r3f!.get();
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      body.skeleton.update();
      const positions = body.geometry.getAttribute('position');
      const point = state.camera.position.clone();
      let backMinY = Infinity;
      for (let i = 0; i < positions.count; i++) {
        body.getVertexPosition(i, point);
        body.localToWorld(point);
        // Restrict to the torso/limb posterior (|x| < .55) to ignore any
        // raised arms; the lowest such point is the back contact.
        if (Math.abs(point.x) > .55) continue;
        backMinY = Math.min(backMinY, point.y);
      }

      // Bed support plane = highest bed surface excluding the headboard
      // (headboard local position.y ≈ .73, far above the sheet at .503).
      const bed = state.scene.getObjectByName('scene-patient-support-bed') as THREE.Group;
      let supportTop = -Infinity;
      bed.traverse(o => {
        if (!(o as THREE.Mesh).isMesh) return;
        const mesh = o as THREE.Mesh;
        if (mesh.position.y > .6) return; // headboard
        const geo = mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const max = geo.boundingBox!.max.clone();
        mesh.localToWorld(max);
        supportTop = Math.max(supportTop, max.y);
      });
      return { backMinY, supportTop };
    });

  const contact = await measure();
  await info.attach('bed-contact-measurements', {
    body: JSON.stringify(contact),
    contentType: 'application/json',
  });
  console.log('Bed contact', contact);

  const gap = contact.backMinY - contact.supportTop;
  // No float: the back may sink a few mm into the sheet/mattress but must not
  // hover more than ~2 cm above it.
  expect(gap).toBeLessThan(.02);
  expect(gap).toBeGreaterThan(-.03);
});
