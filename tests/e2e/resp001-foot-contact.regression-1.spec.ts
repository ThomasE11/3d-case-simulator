import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

test('pilot lower limbs clear the sofa front and stay on the authored plant', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(1500);
  const measureContact = () => page.evaluate(() => {
    const state = window.__r3f!.get();
    const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    body.skeleton.update();
    const floor = state.scene.getObjectByName('resp001-villa-floor') as THREE.Mesh;
    const sofa = state.scene.getObjectByName('Sofa_base') as THREE.Mesh;
    const cushion = state.scene.getObjectByName('Sofa_cushion_1') as THREE.Mesh;
    const positions = body.geometry.getAttribute('position');
    const point = state.camera.position.clone();
    const lowerLimbPoints: number[][] = [];
    const pelvisPoints: number[][] = [];
    for (let i = 0; i < positions.count; i++) {
      body.getVertexPosition(i, point);
      body.localToWorld(point);
      if (point.y > .8 && point.y < 1.05 && Math.abs(point.x + 1.1) < .16 && point.z < .1) pelvisPoints.push(point.toArray());
      // The fitted garment's lowest visible points are ankle/foot cuffs. They
      // must be in front of the sofa's front panel, never buried inside it.
      if (point.y <= .68) lowerLimbPoints.push(point.toArray());
    }
    const bounds = (mesh: THREE.Mesh) => {
      mesh.geometry.computeBoundingBox();
      const min = mesh.geometry.boundingBox!.min.clone();
      const max = mesh.geometry.boundingBox!.max.clone();
      mesh.localToWorld(min); mesh.localToWorld(max);
      return { min: min.toArray(), max: max.toArray() };
    };
    return {
      lowerLimbPoints: lowerLimbPoints.sort((a,b) => a[2]-b[2]).slice(0, 8),
      lowerLimbMinY: Math.min(...lowerLimbPoints.map(point => point[1])),
      lowerLimbMinZ: Math.min(...lowerLimbPoints.map(point => point[2])),
      pelvisPoints: pelvisPoints.sort((a,b) => a[1]-b[1]).slice(0, 8),
      floor: bounds(floor),
      sofa: bounds(sofa),
      cushion: bounds(cushion),
      root: state.scene.getObjectByName('TreatmentBayPatientRoot')?.position.toArray(),
    };
  });
  const contact = await measureContact();
  await info.attach('contact-measurements', { body: JSON.stringify(contact), contentType: 'application/json' });
  console.log('Pilot contact', contact);
  for (const side of [-1, 1]) {
    await page.evaluate(side => {
      const state = window.__r3f!.get();
      const controls = state.controls as unknown as { target: THREE.Vector3; update: () => void };
      state.camera.position.set(side * 1.1, .65, 2.5);
      controls.target.set(0, .30, .8);
      controls.update();
    }, side);
    await page.waitForTimeout(500);
    await canvas.screenshot({ path: info.outputPath(`feet-${side < 0 ? 'left' : 'right'}.png`) });
  }
  // The sofa base ends at z≈0.21. The visible lower limbs are planted just
  // beyond that front edge, so a camera orbit cannot reveal them embedded in
  // the furniture. The lowest visible cuff remains above the shared floor,
  // matching the fitted asset's authored ankle termination.
  expect(contact.lowerLimbMinZ).toBeGreaterThan(contact.sofa.max[2]);
  expect(contact.lowerLimbMinY).toBeGreaterThan(contact.floor.max[1]);
  const later = await measureContact();
  expect(later.lowerLimbMinZ).toBeCloseTo(contact.lowerLimbMinZ, 3);
  expect(later.lowerLimbMinY).toBeCloseTo(contact.lowerLimbMinY, 3);
  expect(contact.pelvisPoints).toHaveLength(8);
  for (const [x, y, z] of contact.pelvisPoints) {
    expect(x).toBeGreaterThan(contact.cushion.min[0]);
    expect(x).toBeLessThan(contact.cushion.max[0]);
    expect(z).toBeLessThan(contact.cushion.max[2] + .02);
    // The lower pelvis/upper-thigh surface sits inside the thick cushion,
    // not on its decorative top face. Keep it within that physical volume
    // while the hips remain centred over the cushion footprint.
    expect(y).toBeGreaterThan(contact.cushion.min[1] - .02);
    expect(y).toBeLessThan(contact.cushion.max[1] + .02);
  }
});
