import { expect, test } from '@playwright/test';

/**
 * Regression: a SEATED patient dispatched onto a bed or sofa must render the
 * seated furniture variant (backrest + edge seat), not the recumbent slab.
 * This pins the dead-code wiring fix where `seated` was only ever true for the
 * 'seat' surface and never reached `ScenePatientSupport`.
 */
const SEATED_CASES: Array<[string, string]> = [
  ['y2-003', 'scene-patient-support-sofa-seated'], // stroke, sitting on sofa
  // y2-007 uses its authored bedroom GLB; the old procedural bed variant is
  // intentionally absent so the seated patient sits on IntBed01's edge.
  ['y2-007', 'archetype-y2-007-od-bedroom'],
];

for (const [caseId, variantName] of SEATED_CASES) {
  test(`seated patient renders the ${variantName} support variant`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    });
    await page.goto(`/?devLiveCase=${caseId}`);
    await page.waitForFunction(() => (window as any).__r3f?.get?.()?.scene, null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const result = await page.evaluate((name) => {
      const state = (window as any).__r3f!.get();
      const seated = state.scene.getObjectByName(name);
      const recumbent = state.scene.getObjectByName(
        name.includes('sofa') ? 'scene-patient-support-sofa' : 'scene-patient-support-bed',
      );
      return {
        seatedPresent: !!seated,
        recumbentPresent: !!recumbent,
        bedPresent: name.includes('archetype-y2-007') ? !!state.scene.getObjectByName('IntBed01') : undefined,
      };
    }, variantName);
    expect(result.seatedPresent).toBe(true);
    expect(result.recumbentPresent).toBe(false);
    if (caseId === 'y2-007') expect(result.bedPresent).toBe(true);
  });
}

test('recumbent patient on a bed keeps the recumbent support variant', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });
  await page.goto('/?devLiveCase=cardiac-007');
  await page.waitForFunction(() => (window as any).__r3f?.get?.()?.scene, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const result = await page.evaluate(() => {
    const state = (window as any).__r3f!.get();
    return {
      recumbentPresent: !!state.scene.getObjectByName('scene-patient-support-bed'),
      seatedPresent: !!state.scene.getObjectByName('scene-patient-support-bed-seated'),
    };
  });
  expect(result.recumbentPresent).toBe(true);
  expect(result.seatedPresent).toBe(false);
});
