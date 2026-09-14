import { expect, test } from '@playwright/test';

// Regression: ISSUE-002 — trauma-011 described a right-hand amputation while
// the patient model retained an intact hand.
// Found by /qa on 2026-09-15
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-09-15.md
test('trauma-011 renders a bone-parented right-hand stump', async ({ page }) => {
  await page.goto('/?devLiveCase=trauma-011&treatmentAudit=1');
  await page.waitForFunction(() => window.__r3f?.scene?.getObjectByName('traumatic-right-hand-stump'));

  const presentation = await page.evaluate(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    const patient = state.scene.getObjectByName('Patient');
    let handScale: number | null = null;
    patient.traverse((node) => {
      if (!node.isSkinnedMesh || handScale != null) return;
      const hand = node.skeleton.bones.find((bone) => bone.name === 'mixamorigRightHand');
      if (hand) handScale = hand.scale.x;
    });
    return {
      stump: Boolean(state.scene.getObjectByName('traumatic-right-hand-stump')),
      woundFace: Boolean(state.scene.getObjectByName('traumatic-right-hand-wound-face')),
      handScale,
    };
  });

  expect(presentation.stump).toBe(true);
  expect(presentation.woundFace).toBe(true);
  expect(presentation.handScale).toBeLessThan(0.01);
});
