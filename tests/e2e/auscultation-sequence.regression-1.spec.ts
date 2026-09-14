import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

function silentWav() {
  const rate = 8_000;
  const out = Buffer.alloc(44 + rate * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(out.length - 44, 40);
  return out;
}

test('auscultation gives consent once and remains quiet while contact moves', async ({ page }) => {
  test.setTimeout(45_000);
  const spoken: unknown[] = [];
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'true'));
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/tts', async route => {
    spoken.push(route.request().postDataJSON());
    await route.fulfill({ contentType: 'audio/wav', body: silentWav() });
  });
  await page.goto('/?devLiveCase=resp-001');
  await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
  await page.getByRole('button', { name: 'Expose', exact: true }).click();
  const dock = page.locator('.patient-first-exam-dock');
  await dock.getByRole('button', { name: 'Listen', exact: true }).click();
  await dock.getByRole('button', { name: /Auscultate apices, mid-zones, bases/ }).click();

  await expect.poll(() => spoken.length).toBe(1);
  expect(spoken[0]).toMatchObject({
    text: 'You can go ahead and listen to my chest.',
    role: 'patient',
  });
  // Two full 4-second sites have elapsed. The stethoscope may move, but the
  // patient must not talk over subsequent listening positions.
  await page.waitForTimeout(8_500);
  expect(spoken).toHaveLength(1);
});

for (const exam of ['lungs', 'heart'] as const) {
  test(`${exam} audio and skin contact visit every promised site once`, async ({ page }, info) => {
    test.setTimeout(70_000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
    // Observe actual playback calls without replacing audio or patient state.
    await page.route('**/src/data/clinicalSounds.ts*', async route => {
      const response = await route.fetch();
      let body = await response.text();
      for (const name of ['playBreathSound', 'playHeartSound']) {
        body = body.replace(new RegExp(`function ${name}\\(([^)]*)\\)\\s*\\{`),
          match => `${match}\n(window.__auscultationAudio ??= []).push({kind: '${name}', sound: soundType, duration: durationMs, time: performance.now()});`);
      }
      await route.fulfill({ response, body });
    });
    await page.goto('/?devLiveCase=resp-001');
    await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
    await page.getByRole('button', { name: 'Expose', exact: true }).click();
    const dock = page.locator('.patient-first-exam-dock');
    await dock.getByRole('button', { name: 'Listen', exact: true }).click();
    await dock.getByRole('button', { name: exam === 'lungs' ? /Auscultate apices, mid-zones, bases/ : /Auscultate heart sounds at four points/ }).click();
    const result = await page.evaluate(async duration => {
      const state = window.__r3f!.get();
      const patient = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      const Raycaster = state.raycaster.constructor as typeof THREE.Raycaster;
      const ray = new Raycaster(); ray.far = .08;
      const visits: Array<{site: string; time: number; gap: number | null; position: number[]; progress: number}> = [];
      const captures: Record<string, string> = {};
      let previous = '';
      const start = performance.now();
      await new Promise<void>(resolve => {
        const sample = () => {
          const tool = state.scene.getObjectByName('assessment-contact-tool');
          const site = tool?.userData.site as string | undefined;
          if (site && site !== previous) {
            previous = site;
            state.gl.render(state.scene, state.camera);
            const disc = tool!.getObjectByName('assessment-stethoscope')!.children[0];
            const point = state.camera.position.clone().set(0, -.005, 0); disc.localToWorld(point);
            const normal = state.camera.position.clone().set(0, 1, 0).transformDirection(disc.matrixWorld);
            patient.computeBoundingSphere(); patient.computeBoundingBox();
            ray.set(point.clone().addScaledVector(normal, .04), normal.clone().negate());
            const hits: THREE.Intersection[] = [];
            Object.getPrototypeOf(patient).raycast.call(patient, ray, hits);
            hits.sort((a, b) => a.distance - b.distance);
            const bar = document.querySelector<HTMLElement>('.patient-first-target-chip.is-selected .bg-cyan-300');
            visits.push({site, time: performance.now(), gap: hits[0] ? point.clone().sub(hits[0].point).dot(normal) : null, position: point.toArray(), progress: bar ? Number.parseFloat(bar.style.width) / 100 : -1});
            captures[site] = state.gl.domElement.toDataURL('image/png');
          }
          if (performance.now() - start > duration) resolve(); else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      return { visits, captures, audio: (window as unknown as {__auscultationAudio: Array<{kind: string; sound: string; duration: number; time: number}>}).__auscultationAudio ?? [] };
    }, exam === 'lungs' ? 25_000 : 13_000);
    await writeFile(info.outputPath('sequence.json'), JSON.stringify({...result, captures: undefined}, null, 2));
    for (const [site, data] of Object.entries(result.captures)) {
      await writeFile(info.outputPath(`${site.replaceAll(/[^a-z0-9]/gi, '-')}.png`), Buffer.from(data.split(',')[1], 'base64'));
    }
    const expected = exam === 'lungs'
      ? ['R upper zone', 'L upper zone', 'R mid-zone', 'L mid-zone', 'R lower zone', 'L lower zone']
      : ['Aortic area', 'Pulmonic area', 'Tricuspid area', 'Mitral / apex'];
    expect(result.visits.map(visit => visit.site)).toEqual(expected);
    expect(result.audio).toHaveLength(expected.length);
    for (const [i, visit] of result.visits.entries()) {
      expect(visit.gap).not.toBeNull();
      expect(visit.gap).toBeGreaterThan(-.001);
      expect(visit.gap).toBeLessThan(.0015);
      expect(Math.abs(visit.time - result.audio[i].time)).toBeLessThan(350);
      expect(visit.progress).toBeGreaterThanOrEqual(i / expected.length - .01);
      expect(visit.progress).toBeLessThan((i + 1) / expected.length);
    }
    await expect(dock.locator('.patient-first-target-chip.is-selected .bg-cyan-300')).toHaveCount(0);
    // A completed tour stays finished. An interrupted/restarted one must not
    // leave the former delayed second-side callback running behind the exam.
    await dock.getByRole('button', { name: exam === 'lungs' ? /Auscultate apices, mid-zones, bases/ : /Auscultate heart sounds at four points/ }).click();
    await page.waitForTimeout(500);
    await dock.getByRole('button', { name: exam === 'lungs' ? /Auscultate apices, mid-zones, bases/ : /Auscultate heart sounds at four points/ }).click();
    await page.waitForTimeout(500);
    await dock.getByRole('button', { name: 'Palpate', exact: true }).click();
    await expect(page.getByTestId('assessment-contact-label')).toHaveCount(0);
    const audioCount = () => page.evaluate(() => (window as unknown as {__auscultationAudio: unknown[]}).__auscultationAudio.length);
    const count = await audioCount();
    await page.waitForTimeout(4500);
    expect(await audioCount()).toBe(count);
    await dock.getByRole('button', { name: 'Listen', exact: true }).click();
    await dock.getByRole('button', { name: exam === 'lungs' ? /Auscultate apices, mid-zones, bases/ : /Auscultate heart sounds at four points/ }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    const closedCount = await audioCount();
    await page.waitForTimeout(4500);
    expect(await audioCount()).toBe(closedCount);
    await expect(page.getByTestId('assessment-contact-label')).toHaveCount(0);
  });
}
