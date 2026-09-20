import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

const GUARDED_CASES = [
  { id: 'y2-002', target: 'Spine2', bilateral: false, maxDistance: .36 },
  { id: 'y1-002', target: 'Spine1', bilateral: false, maxDistance: .40 },
  { id: 'y1-011', target: 'Neck', bilateral: false, maxDistance: .38 },
  { id: 'cardiac-004', target: 'Head', bilateral: false, maxDistance: .40 },
  { id: 'resp-009', target: 'Neck', bilateral: true, maxDistance: .36 },
] as const;

for (const guarded of GUARDED_CASES) {
  test(`${guarded.id} keeps the guarding hands visible on the authored region`, async ({ page }, info) => {
    await page.addInitScript(() => {
      localStorage.setItem('paramedic-studio-voice-enabled', 'false');
      sessionStorage.setItem('capturePinQuality', '1');
    });
    await page.goto(`/?devLiveCase=${guarded.id}`);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.waitForTimeout(1000);

    const measurement = await page.evaluate(({ targetName }) => {
      const state = window.__r3f!.get();
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      body.skeleton.update();
      const bone = (name: string) => body.skeleton.bones.find(item => item.name === `mixamorig${name}`)!;
      const point = state.camera.position.clone();
      const target = bone(targetName).getWorldPosition(point.clone());
      const left = bone('LeftHand').getWorldPosition(point.clone());
      const right = bone('RightHand').getWorldPosition(point.clone());
      return {
        leftDistance: left.distanceTo(target),
        rightDistance: right.distanceTo(target),
        leftAnterior: left.z - target.z,
        rightAnterior: right.z - target.z,
        sofa: !!state.scene.getObjectByName('scene-patient-support-sofa-seated'),
        chair: !!state.scene.getObjectByName('home-patient-chair'),
      };
    }, { targetName: guarded.target });

    await page.locator('.tactical-patient-viewport').screenshot({
      path: info.outputPath(`${guarded.id}-guard.png`),
    });

    expect(measurement.rightDistance).toBeLessThan(guarded.maxDistance);
    expect(measurement.rightAnterior).toBeGreaterThan(.12);
    if (guarded.bilateral) {
      expect(measurement.leftDistance).toBeLessThan(guarded.maxDistance);
      expect(measurement.leftAnterior).toBeGreaterThan(.12);
    }
    if (guarded.id === 'y2-002') {
      expect(measurement.sofa).toBe(true);
      expect(measurement.chair).toBe(false);
    }
  });
}
