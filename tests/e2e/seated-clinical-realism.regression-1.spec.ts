import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

type CaseCheck = {
  id: string;
  weakSide: 'left' | 'right' | null;
  minimumPosteriorZ: number;
};

const CASES: CaseCheck[] = [
  { id: 'y1-016', weakSide: 'right', minimumPosteriorZ: 0.59 },
  { id: 'y2-003', weakSide: 'left', minimumPosteriorZ: 0.59 },
  // The authored bedroom bed is already calibrated and must not be pushed
  // forwards by the chair/sofa correction.
  { id: 'y2-007', weakSide: null, minimumPosteriorZ: 0.53 },
];

for (const caseCheck of CASES) {
  test(`${caseCheck.id} keeps support contact and its authored motor presentation`, async ({ page }, info) => {
    await page.addInitScript(() => {
      localStorage.setItem('paramedic-studio-voice-enabled', 'false');
      sessionStorage.setItem('capturePinQuality', '1');
    });
    await page.goto(`/?devLiveCase=${caseCheck.id}`);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.waitForTimeout(1200);

    const measurement = await page.evaluate(() => {
      const state = window.__r3f!.get();
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      body.skeleton.update();
      const positions = body.geometry.getAttribute('position');
      const point = state.camera.position.clone();
      let posteriorZ = Infinity;
      for (let i = 0; i < positions.count; i++) {
        body.getVertexPosition(i, point);
        body.localToWorld(point);
        posteriorZ = Math.min(posteriorZ, point.z);
      }

      const bonePosition = (side: 'Left' | 'Right') => {
        const bone = body.skeleton.bones.find(item => item.name === `mixamorig${side}Hand`)!;
        return bone.getWorldPosition(state.camera.position.clone()).toArray();
      };
      return {
        posteriorZ,
        leftHand: bonePosition('Left'),
        rightHand: bonePosition('Right'),
      };
    });

    await info.attach('patient-contact-and-pose', {
      body: JSON.stringify(measurement),
      contentType: 'application/json',
    });
    await page.locator('.tactical-patient-viewport').screenshot({
      path: info.outputPath(`${caseCheck.id}-patient-support-front.png`),
    });

    await page.evaluate(() => {
      const state = window.__r3f!.get();
      const controls = state.controls!;
      state.camera.position.set(
        controls.target.x + 2.7,
        controls.target.y + 0.45,
        controls.target.z + 0.05,
      );
      controls.update();
    });
    await page.waitForTimeout(250);
    await page.locator('.tactical-patient-viewport').screenshot({
      path: info.outputPath(`${caseCheck.id}-patient-support-side.png`),
    });

    expect(measurement.posteriorZ).toBeGreaterThan(caseCheck.minimumPosteriorZ);
    if (caseCheck.weakSide) {
      // A FAST-positive patient must not retain the perfectly mirrored neutral
      // hand pose. A 5 cm vertical difference remains readable at overview.
      const handHeightDifference = Math.abs(measurement.leftHand[1] - measurement.rightHand[1]);
      expect(handHeightDifference).toBeGreaterThan(0.05);
    }
  });
}
