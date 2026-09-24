import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ viewport: { width: 1440, height: 960 } });

const NON_REBREATHER_STEPS = [
  'Connect oxygen tubing',
  'Pre-inflate reservoir',
  'Seat the mask',
  'Set prescribed flow',
  'Confirm response',
];

const NEBULISER_STEPS = [
  'Assemble and connect',
  'Explain and coach',
  'Fit the mask',
  'Start aerosol flow',
  'Reassess response',
];

async function performProcedure(
  page: Page,
  selector: string,
  dialogName: RegExp | string,
  steps: string[],
  completionName: RegExp | string,
) {
  await page.getByRole('button', { name: selector, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: dialogName, exact: typeof dialogName === 'string' });
  for (const step of steps) {
    await dialog.getByRole('button', { name: `Perform: ${step}`, exact: true }).click();
  }
  await dialog.getByRole('button', { name: completionName, exact: typeof completionName === 'string' }).click();
}

async function measurePilotOxygenGrounding(page: Page) {
  return page.evaluate(() => {
    const state = window.__r3f?.get();
    const scene = state?.scene;
    // Rev-7's villa dressing uses the shared floor as its contact surface;
    // the earlier pilot rug is no longer mounted in this scene.
    const floor = scene?.getObjectByName('resp001-villa-floor') as THREE.Mesh | undefined;
    const cylinder = scene?.getObjectByName('active-oxygen-cylinder') as THREE.Group | undefined;
    const circuit = scene?.getObjectByName('patient-anchored-circuit') as THREE.Mesh<THREE.TubeGeometry> | undefined;
    const regulator = cylinder?.children.find(child => (
      (child as THREE.Mesh).geometry?.type === 'TorusGeometry'
    ));
    if (!state || !floor?.isMesh || !cylinder || !circuit?.isMesh || !regulator) return null;

    scene.updateMatrixWorld(true);
    const point = state.camera.position.clone();
    const floorPositions = floor.geometry.getAttribute('position');
    let floorTop = -Infinity;
    for (let vertex = 0; vertex < floorPositions.count; vertex += 1) {
      point.fromBufferAttribute(floorPositions, vertex);
      floor.localToWorld(point);
      floorTop = Math.max(floorTop, point.y);
    }

    let cylinderBottom = Infinity;
    cylinder.traverse((object) => {
      const mesh = object as THREE.Mesh;
      const positions = mesh.geometry?.getAttribute('position');
      if (!mesh.isMesh || !positions) return;
      for (let vertex = 0; vertex < positions.count; vertex += 1) {
        point.fromBufferAttribute(positions, vertex);
        mesh.localToWorld(point);
        cylinderBottom = Math.min(cylinderBottom, point.y);
      }
    });

    const circuitEnd = circuit.geometry.parameters.path.getPoint(1);
    circuit.localToWorld(circuitEnd);
    const regulatorCentre = regulator.getWorldPosition(point);
    const baseNdc = cylinder.localToWorld(state.camera.position.clone().set(0, 0, 0)).project(state.camera);
    let cylinderCount = 0;
    scene.traverse(object => { if (object.name === 'active-oxygen-cylinder') cylinderCount += 1; });
    return {
      cylinderBottom,
      floorTop,
      groundGap: cylinderBottom - floorTop,
      circuitRegulatorError: circuitEnd.distanceTo(regulatorCentre),
      cylinderCount,
      cylinderGroupY: cylinder.position.y,
      baseNdc: baseNdc.toArray(),
    };
  });
}

async function expectGroundedPilotCylinder(page: Page, info: TestInfo, label: string) {
  await expect.poll(() => measurePilotOxygenGrounding(page), { timeout: 30_000 }).not.toBeNull();
  const measurement = (await measurePilotOxygenGrounding(page))!;
  await info.attach(`${label}-oxygen-grounding`, {
    body: JSON.stringify(measurement, null, 2),
    contentType: 'application/json',
  });
  expect(measurement.cylinderCount).toBe(1);
  expect(measurement.groundGap).toBeGreaterThanOrEqual(-0.002);
  expect(measurement.groundGap).toBeLessThanOrEqual(0.002);
  expect(measurement.circuitRegulatorError).toBeLessThan(0.001);
  return measurement;
}

test('resp-001 oxygen cylinder stands on the villa floor through NRB and nebuliser replacement', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(0.25);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.click({ position: { x: 20, y: 20 } });
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();

  await performProcedure(
    page,
    'Select Non-rebreather',
    /Apply non-rebreather mask/i,
    NON_REBREATHER_STEPS,
    /Oxygen running — reassess SpO₂/i,
  );
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toBeVisible();
  await expect.poll(() => measurePilotOxygenGrounding(page), { timeout: 30_000 }).not.toBeNull();

  // Hold a normal bedside oblique that includes the cylinder base and floor.
  // The values remain within the production orbit limits; no limits are relaxed.
  await page.evaluate(() => {
    const state = window.__r3f!.get();
    state.camera.position.set(1.5, 1.15, 2.8);
    state.controls!.target.set(0.18, 0.36, 0.70);
    state.controls!.update();
  });
  await page.waitForTimeout(600);
  const framedNrb = (await measurePilotOxygenGrounding(page))!;
  expect(Math.abs(framedNrb.baseNdc[0])).toBeLessThan(0.95);
  expect(Math.abs(framedNrb.baseNdc[1])).toBeLessThan(0.95);
  await canvas.screenshot({ path: info.outputPath('nonrebreather-cylinder-grounding.png') });
  // Capture the red/green visual evidence before the quantitative contact
  // assertion so a buried-cylinder regression still leaves an inspectable frame.
  const nrb = await expectGroundedPilotCylinder(page, info, 'nonrebreather');

  await performProcedure(
    page,
    'Select Nebuliser Mask',
    'Apply nebuliser mask',
    NEBULISER_STEPS,
    'Aerosol flowing — reassess wheeze',
  );
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  await expect(page.locator('[data-applied-equipment="nebulizer"]')).toBeVisible();
  const nebuliser = await expectGroundedPilotCylinder(page, info, 'nebulizer');
  expect(nebuliser.floorTop).toBeCloseTo(nrb.floorTop, 5);
  expect(nebuliser.cylinderBottom).toBeCloseTo(nrb.cylinderBottom, 5);
  await page.waitForTimeout(600);
  await canvas.screenshot({ path: info.outputPath('nebulizer-cylinder-grounding.png') });
});

test('resp-003 retains the shared-floor oxygen cylinder baseline', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-003');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(0.25);
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await performProcedure(
    page,
    'Select Venturi Mask 28%',
    /Apply 28% Venturi mask/i,
    ['Select valve and connect oxygen', 'Seat the mask', 'Set prescribed flow', 'Confirm response'],
    /Controlled O₂ running — target 88–92%/i,
  );
  await expect.poll(() => page.evaluate(() => {
    const cylinder = window.__r3f?.get().scene.getObjectByName('active-oxygen-cylinder');
    return cylinder?.position.y ?? null;
  }), { timeout: 30_000 }).toBeCloseTo(-0.045, 5);
});
