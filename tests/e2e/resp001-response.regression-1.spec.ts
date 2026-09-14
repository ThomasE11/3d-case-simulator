import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

test.use({ video: 'on', viewport: { width: 1440, height: 960 } });

async function jaw(page: Page) {
  return page.evaluate(() => {
    const scene = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f?.scene;
    const mesh = scene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    const index = mesh?.morphTargetDictionary?.viseme_open;
    return index === undefined ? -1 : mesh!.morphTargetInfluences![index];
  });
}

// A controlled sound/silence fixture tests real AudioContext -> mesh wiring,
// not provider voice quality. No clinical audio or external service required.
function speechEnvelopeWav() {
  const rate = 16000, seconds = 5;
  const out = Buffer.alloc(44 + rate * seconds * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(out.length - 44, 40);
  for (let i = 0; i < rate * seconds; i++) {
    const t = i / rate;
    const value = t >= 1 && t < 3 ? Math.sin(t * Math.PI * 2 * 180) * 8000 : 0;
    out.writeInt16LE(Math.round(value), 44 + i * 2);
  }
  return out;
}

test('patient jaw follows audible audio, not synthesis, silence or dispatch', async ({ page }, info) => {
  test.setTimeout(120_000);
  let requestedProfile: unknown;
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/tts', async route => {
    requestedProfile = route.request().postDataJSON();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'audio/wav', body: speechEnvelopeWav() });
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => jaw(page), { timeout: 30_000 }).toBe(0);
  // Speech is rendered by the corrected lip morph itself.  Do not reintroduce
  // a separately anchored dark disc: it can detach from the face and render
  // as a spurious mark over the torso at normal examination distance.
  await expect.poll(() => page.evaluate(() => (
    !window.__r3f?.get().scene.getObjectByName('resp001-mouth-cavity')
  ))).toBe(true);
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const panel = page.locator('.bedside-history-panel');
  await panel.getByRole('textbox').fill('What happened?');
  await panel.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Preparing');
  expect(await jaw(page)).toBeLessThan(.01);
  await expect(panel.getByRole('status')).toContainText('Patient speaking');
  expect(requestedProfile).toMatchObject({ role: 'patient', patientVoice: { gender: 'male' } });
  expect(await jaw(page)).toBeLessThan(.02); // first second is genuinely silent
  await expect.poll(() => jaw(page)).toBeGreaterThan(.2);
  await page.screenshot({ path: info.outputPath('patient-speaking.png') });
  await expect.poll(() => jaw(page)).toBeLessThan(.01); // closes during trailing silence
  await expect(panel.getByRole('status')).toContainText('Ready for a question');
  await page.getByRole('button', { name: 'Replay dispatch briefing', exact: true }).click();
  await page.waitForTimeout(2600); // audible section of dispatcher fixture
  expect(await jaw(page)).toBeLessThan(.01);
  await panel.getByRole('button', { name: 'Replay last answer', exact: true }).click();
  await expect.poll(() => jaw(page)).toBeGreaterThan(.2);
  await panel.getByRole('button', { name: 'Mute patient voice', exact: true }).click();
  await expect.poll(() => jaw(page)).toBeLessThan(.01);
  await expect(panel.getByRole('status')).toContainText('Voice muted');
});

async function cyanosis(page: Page) {
  return page.evaluate(() => {
    const scene = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f?.scene;
    const body = scene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    if (!body) return null;
    const material = (Array.isArray(body.material) ? body.material[0] : body.material) as THREE.MeshStandardMaterial;
    return !!body.userData.cyanosisOpenTex && (material.map === body.userData.cyanosisOpenTex || material.map === body.userData.cyanosisClosedTex);
  });
}

async function sampleBreathing(page: Page) {
  return page.evaluate(async () => {
    const clock = await import('/src/lib/breathClock.ts');
    const scene = window.__r3f!.get().scene;
    const body = scene.getObjectByName('Patient') as THREE.Mesh;
    const shoulder = (scene.getObjectByName('mixamorig:LeftShoulder') ?? scene.getObjectByName('mixamorigLeftShoulder'))!;
    const inverse = shoulder.quaternion.clone().invert();
    const relative = shoulder.quaternion.clone();
    const chestIndex = body.morphTargetDictionary!.breathe_chest_rise;
    const tripodIndex = body.morphTargetDictionary!.pose_tripod;
    const gaspIndex = body.morphTargetDictionary!.motion_gasp;
    const samples: Array<{ time: number; phase: number; rpm: number; chest: number; shoulder: number; tripod: number; gasp: number }> = [];
    const start = performance.now();
    await new Promise<void>(resolve => {
      const sample = () => {
        relative.copy(inverse).multiply(shoulder.quaternion);
        samples.push({
          time: performance.now() - start,
          phase: clock.getBreathPhase01(),
          rpm: clock.getBreathRpm(),
          chest: body.morphTargetInfluences![chestIndex],
          shoulder: 2 * Math.atan2(relative.z, relative.w),
          tripod: body.morphTargetInfluences![tripodIndex],
          gasp: body.morphTargetInfluences![gaspIndex],
        });
        if (performance.now() - start >= 12000) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    // Measure cadence from upward crossings of the *rendered chest morph*,
    // independently of the clock that is supposed to drive it. The untreated
    // patient also has intentional, irregular hypoxic gasps. Measure basal RR
    // only inside contiguous non-gasp windows; retain every raw sample and
    // record exclusions so this cannot silently hide a general motion defect.
    const basalSamples = samples.filter(sample => sample.gasp === 0);
    const chestMin = Math.min(...basalSamples.map(sample => sample.chest));
    const chestMax = Math.max(...basalSamples.map(sample => sample.chest));
    const threshold = (chestMin + chestMax) / 2;
    const crossings: Array<{ time: number; segment: number }> = [];
    let segment = 0;
    for (let i = 1; i < samples.length; i++) {
      const before = samples[i - 1], after = samples[i];
      if (before.gasp > 0 || after.gasp > 0) { segment++; continue; }
      if (before.chest < threshold && after.chest >= threshold) {
        crossings.push({ time: before.time + (after.time - before.time) * (threshold - before.chest) / (after.chest - before.chest), segment });
      }
    }
    const periods = crossings.slice(1).flatMap((crossing, i) => crossing.segment === crossings[i].segment ? [crossing.time - crossings[i].time] : []);
    const span = (key: 'chest' | 'shoulder') => Math.max(...samples.map(sample => sample[key])) - Math.min(...samples.map(sample => sample[key]));
    return {
      sampledRpm: periods.length ? periods.length * 60000 / periods.reduce((sum, period) => sum + period, 0) : null,
      chestCrossings: crossings.length,
      basalPeriods: periods.length,
      gaspSampleFraction: 1 - basalSamples.length / samples.length,
      lateGaspSamples: samples.filter(sample => sample.time >= 1000 && sample.gasp > 0).length,
      clockRpm: samples.at(-1)!.rpm,
      shoulderZExcursion: span('shoulder'),
      chestExcursion: chestMax - chestMin,
      totalChestExcursion: span('chest'),
      tripod: samples.at(-1)!.tripod,
      samples,
    };
  });
}

async function verifyFittedMask(page: Page, info: TestInfo, mode: 'nonrebreather' | 'nebulizer') {
  const inspect = () => page.evaluate(mode => {
    const state = window.__r3f!.get();
    const group = state.scene.getObjectByName(`applied-${mode}-mask`);
    if (!group) return null;
    group.updateWorldMatrix(true, true);
    const shell = group.getObjectByName(`${mode}-contoured-shell`) as THREE.Mesh | undefined;
    const exit = group.getObjectByName('pilot-mask-tube-exit');
    const face = state.scene.getObjectByName('PatientFaceAttachment');
    if (!shell || !exit || !face) return null;
    const expectedExit = state.camera.position.clone().set(...(mode === 'nonrebreather'
      ? [0.0847, 1.5306, 0.045] as const : [0.0684, 1.4495, 0.045] as const));
    face.localToWorld(expectedExit);
    shell.geometry.computeBoundingBox();
    const bounds = shell.geometry.boundingBox!;
    const planeNames: string[] = [];
    group.traverse(object => {
      if ((object as THREE.Mesh).geometry?.type === 'PlaneGeometry') planeNames.push(object.name);
    });
    return {
      planes: planeNames,
      depth: bounds.max.z - bounds.min.z,
      attachmentError: exit.getWorldPosition(state.camera.position.clone()).distanceTo(expectedExit),
      accessory: !!group.getObjectByName(mode === 'nonrebreather' ? 'nonrebreather-reservoir' : 'nebulizer-medication-cup'),
      cupWallVertices: mode === 'nebulizer'
        ? ((group.getObjectByName('nebulizer-medication-cup')?.children[0] as THREE.Mesh | undefined)?.geometry.getAttribute('position')?.count ?? 0)
        : null,
    };
  }, mode);
  await expect.poll(inspect, { timeout: 10_000 }).not.toBeNull();
  const geometry = (await inspect())!;
  expect(geometry.planes).toEqual([]);
  expect(geometry.depth).toBeGreaterThan(.035);
  expect(geometry.accessory).toBe(true);
  expect(geometry.attachmentError).toBeLessThan(.001);
  if (mode === 'nebulizer') expect(geometry.cupWallVertices).toBeGreaterThan(30);
  // Use the ordinary clinical face close-up and pointer orbit, not a forced
  // diagnostic camera. Captures prove framing; geometry checks do not prove fit.
  await page.getByRole('tab', { name: 'Assess', exact: true }).click();
  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.waitForTimeout(800);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath(`${mode}-front.png`) });
  // The eye close-up follows the head continuously. Return to ordinary orbit
  // before dragging; otherwise all three captures silently show the same view.
  await page.getByRole('button', { name: 'Back to full body', exact: true }).click();
  await page.waitForTimeout(800);
  const { x, y } = await canvas.evaluate(canvas => {
    const box = canvas.getBoundingClientRect();
    for (const fy of [.4, .6, .3, .7]) for (const fx of [.15, .85, .25, .75]) {
      const x = box.x + box.width * fx, y = box.y + box.height * fy;
      if (document.elementFromPoint(x, y) === canvas) return { x, y };
    }
    throw new Error('No unobstructed canvas point available for orbit');
  });
  for (const [label, delta] of [['left', 180], ['right', -360]] as const) {
    const beforeAngle = await page.evaluate(() => window.__r3f!.get().controls!.getAzimuthalAngle());
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + delta, y, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const afterAngle = await page.evaluate(() => window.__r3f!.get().controls!.getAzimuthalAngle());
    expect(Math.abs(afterAngle - beforeAngle)).toBeGreaterThan(.1);
    await page.screenshot({ path: info.outputPath(`${mode}-${label}.png`) });
    expect((await inspect())!.attachmentError).toBeLessThan(.001);
  }
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
}

test('deliberate measurements and respiratory care change the same patient', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.clock.install();
  await page.goto('/?devLiveCase=resp-001');
  const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
  await expect(monitor.getByText('MONITOR OFF', { exact: true })).toBeVisible();
  await expect.poll(() => cyanosis(page), { timeout: 30_000 }).toBe(true);
  await monitor.getByRole('button', { name: 'Press ON to power the monitor' }).click();
  await page.clock.fastForward(4000);
  const saturation = monitor.getByRole('button', { name: 'Measure oxygen saturation', exact: true });
  await expect(saturation).toContainText('--');
  for (const name of ['oxygen saturation', 'respiratory rate', 'heart rate']) {
    await monitor.getByRole('button', { name: `Measure ${name}`, exact: true }).click();
  }
  await page.clock.fastForward(10_000);
  await expect(saturation).not.toContainText('--');
  await expect(monitor.getByRole('button', { name: 'Measure blood glucose', exact: true })).toContainText('--');
  const untreatedBreathing = await sampleBreathing(page);
  await writeFile(info.outputPath('untreated-breathing.json'), JSON.stringify(untreatedBreathing));
  expect(untreatedBreathing.chestCrossings).toBeGreaterThanOrEqual(2);
  expect(untreatedBreathing.basalPeriods).toBeGreaterThanOrEqual(2);
  expect(untreatedBreathing.gaspSampleFraction).toBeLessThan(.25);
  expect(untreatedBreathing.sampledRpm).toBeCloseTo(32, 0);
  expect(untreatedBreathing.clockRpm).toBe(32);
  expect(untreatedBreathing.chestExcursion).toBeGreaterThan(.08);
  expect(untreatedBreathing.shoulderZExcursion).toBeGreaterThan(.004);
  expect(untreatedBreathing.tripod).toBeGreaterThan(.99);
  await page.screenshot({ path: info.outputPath('breathing-before-care.png') });
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const oxygen = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  for (const step of ['Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask', 'Set prescribed flow', 'Confirm response']) {
    await oxygen.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await oxygen.getByRole('button', { name: /Oxygen running — reassess SpO₂/i }).click();
  await page.clock.fastForward(90_000);
  await expect.poll(() => cyanosis(page)).toBe(false);
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toBeVisible();
  await expect(monitor.getByText('RR 28', { exact: true })).toBeVisible();
  const oxygenBreathing = await sampleBreathing(page);
  await writeFile(info.outputPath('oxygen-breathing.json'), JSON.stringify(oxygenBreathing));
  // Saturation improvement alone must not erase visible work of breathing.
  expect(oxygenBreathing.chestCrossings).toBeGreaterThanOrEqual(2);
  expect(oxygenBreathing.basalPeriods).toBeGreaterThanOrEqual(2);
  expect(oxygenBreathing.gaspSampleFraction).toBeLessThan(.25);
  expect(oxygenBreathing.clockRpm).toBe(28);
  expect(oxygenBreathing.sampledRpm).toBeCloseTo(28, 0);
  // The lower RR can modestly reduce the shrug, but accessory effort remains
  // active (the current RR32→28 calibration retains about 80% of excursion).
  expect(oxygenBreathing.shoulderZExcursion).toBeGreaterThan(untreatedBreathing.shoulderZExcursion * .75);
  expect(oxygenBreathing.tripod).toBeGreaterThan(.99);
  await verifyFittedMask(page, info, 'nonrebreather');
  await page.getByRole('button', { name: 'Select Nebuliser Mask', exact: true }).click();
  const nebuliser = page.getByRole('dialog', { name: 'Apply nebuliser mask', exact: true });
  for (const step of ['Assemble and connect', 'Explain and coach', 'Fit the mask', 'Start aerosol flow', 'Reassess response']) {
    await nebuliser.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await nebuliser.getByRole('button', { name: 'Aerosol flowing — reassess wheeze', exact: true }).click();
  await page.clock.fastForward(15_000);
  await expect(monitor.getByText('RR 14', { exact: true })).toBeVisible();
  const treatedBreathing = await sampleBreathing(page);
  const breathingEvidence = { untreated: untreatedBreathing, oxygen: oxygenBreathing, treated: treatedBreathing };
  const breathingEvidencePath = info.outputPath('rendered-breathing-response.json');
  await writeFile(breathingEvidencePath, JSON.stringify(breathingEvidence));
  await info.attach('rendered-breathing-response', { path: breathingEvidencePath, contentType: 'application/json' });
  expect(treatedBreathing.chestCrossings).toBeGreaterThanOrEqual(2);
  // An already-started gasp may finish its authored 0.8s pulse; it must not
  // restart once the live respiratory effort and oxygenation have recovered.
  expect(treatedBreathing.lateGaspSamples).toBe(0);
  expect(treatedBreathing.sampledRpm).toBeCloseTo(14, 0);
  expect(treatedBreathing.clockRpm).toBe(14);
  expect(treatedBreathing.shoulderZExcursion).toBeLessThan(oxygenBreathing.shoulderZExcursion * .4);
  // Restored depth is not the same as reduced effort: shallow breaths become
  // fuller while cadence and accessory recruitment fall. Do not flatten them.
  expect(treatedBreathing.chestExcursion).toBeGreaterThan(oxygenBreathing.chestExcursion * 1.5);
  expect(treatedBreathing.tripod).toBeGreaterThan(.99);
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  await expect(page.locator('[data-applied-equipment="nebulizer"]')).toBeVisible();
  await verifyFittedMask(page, info, 'nebulizer');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your question to the patient' }).fill('How do you feel?');
  await page.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Breathing feels easier now. I can talk more comfortably.');
  await page.screenshot({ path: info.outputPath('after-care.png') });
  expect(errors).toEqual([]);
});

test('other respiratory cases retain their shared fitted equipment', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-003');
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await page.getByRole('button', { name: 'Select Venturi Mask 28%', exact: true }).click();
  const procedure = page.getByRole('dialog', { name: /Apply 28% Venturi mask/i });
  for (const step of ['Select valve and connect oxygen', 'Seat the mask', 'Set prescribed flow', 'Confirm response']) {
    await procedure.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await procedure.getByRole('button', { name: /Controlled O₂ running — target 88–92%/i }).click();
  await expect.poll(() => page.evaluate(() => {
    const scene = window.__r3f?.get().scene;
    const mask = scene?.getObjectByName('applied-venturi-mask');
    let planes = 0;
    mask?.traverse(object => { if ((object as THREE.Mesh).geometry?.type === 'PlaneGeometry') planes++; });
    return { planes, pilot: !!scene?.getObjectByName('pilot-mask-tube-exit') };
  }), { timeout: 30_000 }).toEqual({ planes: 1, pilot: false });
});
