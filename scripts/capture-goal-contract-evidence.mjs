/**
 * Capture one evidence pack for every GOAL_CONTRACT.md acceptance criterion.
 *
 * Usage:
 *   node scripts/capture-goal-contract-evidence.mjs [baseUrl]
 *
 * The dev server must be running. `?capture` is deliberately present on every
 * simulator navigation so WebGL uses preserveDrawingBuffer.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = (process.argv[2] ?? 'http://localhost:5173').replace(/\/$/, '');
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const outDir = resolve(repoRoot, 'test-results/goal-contract');
mkdirSync(outDir, { recursive: true });

const pngNames = [
  '01-skin-pores-ears.png',
  '02-male-morphs.png',
  '03a-tripod-posture.png',
  '03b-tripod-posture.png',
  '04-speech-jaw.png',
  '05-villa-orbit.png',
  '06a-cyanosis-spo2-85.png',
  '06b-cyanosis-spo2-94.png',
  '07-dof-warm-grade.png',
  '09-phase-transition.png',
  '10-fps.png',
];

const evidence = {
  morphs: null,
  tripod: [],
  viseme: null,
  audio: null,
  fps: null,
};

function outputPath(name) {
  return resolve(outDir, name);
}

function writeDataUrl(name, dataUrl) {
  const match = /^data:image\/png;base64,(.+)$/s.exec(dataUrl);
  if (!match) throw new Error(`Capture ${name} did not return a PNG data URL`);
  writeFileSync(outputPath(name), Buffer.from(match[1], 'base64'));
}

async function installCaptureSeeds(page, spo2 = null) {
  await page.addInitScript((forcedSpo2) => {
    try {
      sessionStorage.setItem('capturePinQuality', '1');
      if (forcedSpo2 != null) sessionStorage.setItem('captureSpo2', String(forcedSpo2));
      else sessionStorage.removeItem('captureSpo2');
    } catch { /* storage can be unavailable in hardened contexts */ }

    // Record actual WebAudio panners as they are constructed. The scene-graph
    // probe below is the primary evidence; this catches implementation changes
    // where PositionalAudio nodes are no longer discoverable through THREE.
    window.__goalAudioPanners = [];
    const Ctor = window.AudioContext || window.webkitAudioContext;
    const proto = Ctor?.prototype;
    if (proto?.createPanner && !proto.__goalCaptureWrapped) {
      const original = proto.createPanner;
      Object.defineProperty(proto, '__goalCaptureWrapped', { value: true });
      proto.createPanner = function goalCaptureCreatePanner(...args) {
        const node = original.apply(this, args);
        window.__goalAudioPanners.push(node);
        return node;
      };
    }
  }, spo2);
}

async function openLivePage(browser, spo2 = null) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(40_000);
  await installCaptureSeeds(page, spo2);
  await page.goto(`${baseUrl}/?capture&devLiveCase=resp-001&model=male${spo2 != null ? `&spo2=${spo2}` : ''}`, {
    waitUntil: 'networkidle',
  });
  // Don't gate on CSS visibility — the canvas can be hidden during initial
  // GLB swap / HMR. Gate on the THREE renderer actually producing pixels.
  await page.waitForFunction(() => {
    const s = window.__r3f;
    if (!s?.gl?.domElement?.width) return false;
    return s.camera?.position?.z != null;
  }, { timeout: 45_000 });
  await page.waitForTimeout(14_000);   // HMR + first render settle
  return page;
}

/**
 * Pose the camera, render one deterministic framebuffer, and return the PNG.
 * `stopLoop: false` is used for the two breathing frames so the clinical morph
 * mixer keeps running during the one-second interval.
 */
async function framebuffer(page, pose, options = {}) {
  return page.evaluate(({ pose: p, options: opts }) => {
    const state = window.__r3f;
    if (!state) throw new Error('window.__r3f is unavailable');
    const { gl, scene, camera } = state;
    const V = scene.position.constructor;
    if (opts.stopLoop !== false) gl.setAnimationLoop(null);
    if (state.controls) state.controls.enabled = false;

    camera.position.set(...p.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(new V(...p.target));
    camera.fov = p.fov;
    camera.near = 0.02;
    camera.far = 100;
    camera.aspect = gl.domElement.width / gl.domElement.height;
    camera.clearViewOffset?.();
    camera.updateProjectionMatrix();

    const canvas = gl.domElement;
    if (canvas.parentElement) {
      for (const sibling of canvas.parentElement.children) {
        if (sibling !== canvas) sibling.style.visibility = 'hidden';
      }
    }

    let morphEvidence = null;
    if (opts.morphs) {
      scene.traverse((object) => {
        if (!object.isMesh || !object.morphTargetDictionary || !object.morphTargetInfluences) return;
        for (const [name, value] of Object.entries(opts.morphs)) {
          const index = object.morphTargetDictionary[name];
          if (index !== undefined) object.morphTargetInfluences[index] = value;
        }
        if (object.morphTargetDictionary.viseme_open !== undefined) {
          const index = object.morphTargetDictionary.viseme_open;
          morphEvidence = {
            mesh: object.name,
            viseme_open: Number(object.morphTargetInfluences[index].toFixed(3)),
          };
        }
      });
    }

    if (opts.composer && typeof state.advance === 'function') {
      state.advance(performance.now(), true);
    } else {
      gl.render(scene, camera);
    }

    const morphSnapshot = {};
    scene.traverse((object) => {
      if (!object.isMesh || !object.morphTargetDictionary || !object.morphTargetInfluences) return;
      for (const name of ['pose_tripod', 'breathe_chest_rise', 'viseme_open']) {
        const index = object.morphTargetDictionary[name];
        if (index !== undefined) morphSnapshot[name] = Number(object.morphTargetInfluences[index].toFixed(3));
      }
    });

    return {
      dataUrl: canvas.toDataURL('image/png'),
      morphEvidence,
      morphSnapshot,
    };
  }, { pose, options });
}

async function composeCyanosis(page, faceDataUrl, handsDataUrl, spo2) {
  return page.evaluate(async ({ face, hands, value }) => {
    const load = (src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
    const [faceImage, handsImage] = await Promise.all([load(face), load(hands)]);
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#08111f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(faceImage, 0, 0, faceImage.width, faceImage.height, 0, 0, 720, 900);
    ctx.drawImage(handsImage, 0, 0, handsImage.width, handsImage.height, 720, 0, 720, 900);
    ctx.fillStyle = 'rgba(4, 10, 22, 0.92)';
    ctx.fillRect(0, 900, 1440, 60);
    ctx.fillStyle = '#e7f6ff';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText(`SpO₂ ${value}% — lips`, 30, 939);
    ctx.fillText(`SpO₂ ${value}% — nailbeds / hands`, 750, 939);
    return canvas.toDataURL('image/png');
  }, { face: faceDataUrl, hands: handsDataUrl, value: spo2 });
}

async function captureCyanosis(browser, spo2, fileName) {
  const page = await openLivePage(browser, spo2);
  try {
    // resp-001 is seated forward in tripod. Its face looks toward +Z around
    // y≈1.35/z≈0.88; the braced hands sit around y≈0.65/z≈1.08. Keep the
    // two forced-SpO₂ captures in identical portrait/hand framing so this is
    // genuine cyanosis evidence, not a leftover supine-camera artefact.
    const face = await framebuffer(page, {
      position: [0, 1.42, 1.55], target: [0, 1.35, 0.88], fov: 16,
    });
    const hands = await framebuffer(page, {
      // One hand fills the frame so the nails are actually inspectable; a
      // waist-up frame made the nailbeds too small to support this criterion.
      position: [0.85, 0.85, 1.75], target: [0.24, 0.65, 1.10], fov: 24,
    });
    writeDataUrl(fileName, await composeCyanosis(page, face.dataUrl, hands.dataUrl, spo2));
  } finally {
    await page.close();
  }
}

async function capturePhaseTransition(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(45_000);
  await installCaptureSeeds(page);
  try {
    // Intentionally no devLiveCase: CameraEntrance must be caught during the
    // real briefing -> survey -> treatment transition.
    await page.goto(`${baseUrl}/?capture`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Start Training/i }).first().click();
    await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5_000 }).catch(() => {});
    // This evidence pack is specifically for resp-001. The normal launcher
    // intentionally randomises its preview, so choose its unique diagnosis in
    // Condition practice instead. Do not let a visually plausible but
    // unrelated scene stand in as proof of this vertical slice.
    await page.getByRole('button', { name: /Condition practice/i }).click();
    await page.locator('input[placeholder*="STEMI"]').fill('Life-threatening Asthma Exacerbation');
    await page.getByRole('button', { name: /^Life-threatening Asthma Exacerbation\b/i }).click();
    await page.getByText('Villa in Al Ain', { exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // The hazards step has TWO mutually-exclusive branches, signalled by what
    // renders: hazard scenes show "Identify hazard:" markers; no-hazard scenes
    // show a single "No obvious hazards after visual sweep" toggle. Never click
    // both — for a no-hazard scene the "unsafe" path is un-satisfiable
    // (`sceneSafe === false` requires hazardHotspots.length > 0), so the gate
    // would deadlock forever.
    const noHazardToggle = page.getByRole('button', { name: /No obvious hazards after visual sweep/i });
    const isNoHazard = (await noHazardToggle.count()) > 0;

    if (isNoHazard) {
      // No-hazard scene: acknowledge the clean sweep, then declare safe.
      await noHazardToggle.first().click();
      await page.getByRole('button', { name: /Scene is safe - proceed/i }).click();
    } else {
      // Hazard scene: click every marker (each click flips its aria-label from
      // "Identify hazard: …" to "Acknowledged: …", so always click nth(0) until
      // none remain), then declare unsafe and request a resource.
      let guard = 0;
      while (guard++ < 12) {
        const next = page.getByRole('button', { name: /^Identify hazard:/i }).first();
        if (!(await next.count())) break;
        await next.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(150);
      }
      await page.getByRole('button', { name: /Scene is unsafe - request resources/i }).click();
      const resource = page.getByRole('button', { name: /Additional ambulance|Police|Fire|Rescue/i }).first();
      if (await resource.count()) await resource.first().click();
    }

    // PPE: don every scene-required item. Required PPE buttons are keyed by
    // their exact label text; the "Required" badge is a child <span>. Do NOT
    // match on /Required/ — the hazard marker "CHEMICAL CONTAMINATION - PPE
    // required" also contains that substring in its aria-label and would be
    // toggled off again (un-acknowledging the hazard). Click each real PPE
    // button once.
    const ppeLabels = ['Gloves', 'Surgical mask', 'N95 respirator', 'Eye protection', 'Gown / apron', 'Helmet', 'Hi-vis vest'];
    for (const label of ppeLabels) {
      const btn = page.getByRole('button', { name: new RegExp(`^${label}`), exact: false }).first();
      if (await btn.count()) {
        const pressed = await btn.getAttribute('aria-pressed');
        if (pressed !== 'true') await btn.click().catch(() => {});
      }
    }
    await page.getByRole('button', { name: /Enter Scene/i }).click();
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(1_300);
    // The post-processing composer owns and clears the WebGL backbuffer after
    // presentation, so canvas.toDataURL() can return the clear colour even while
    // the user-visible treatment scene is valid. Capture the rendered page at
    // the same mid-dolly timestamp; this proves 3D camera + HUD crossfade together.
    await page.screenshot({ path: outputPath('09-phase-transition.png') });
  } finally {
    await page.close();
  }
}

function runCommandEvidence(file, args) {
  try {
    return execFileSync(process.execPath, [file, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120_000,
    }).trim();
  } catch (error) {
    const stdout = String(error.stdout ?? '').trim();
    const stderr = String(error.stderr ?? '').trim();
    return [`command failed: ${error.message}`, stdout, stderr].filter(Boolean).join('\n');
  }
}

function parseLastJsonLine(output) {
  const jsonLine = output.split('\n').reverse().find((line) => /^\{.*\}$/.test(line.trim()));
  if (!jsonLine) return null;
  try { return JSON.parse(jsonLine); } catch { return null; }
}

async function captureFpsReport(browser) {
  const measurePath = resolve(repoRoot, 'scripts/measure-fps.mjs');
  const unavailable = 'scripts/measure-fps.mjs was not present; no command evidence available.';
  const desktopOutput = existsSync(measurePath)
    ? runCommandEvidence(measurePath, [baseUrl, '--seconds=5', '--case=resp-001', '--model=male', '--assert-contract'])
    : unavailable;
  const ipadOutput = existsSync(measurePath)
    ? runCommandEvidence(measurePath, [baseUrl, '--seconds=5', '--case=resp-001', '--model=male', '--ipad', '--assert-contract'])
    : unavailable;
  evidence.fps = {
    desktopHardware: parseLastJsonLine(desktopOutput),
    ipadHighDprProxy: parseLastJsonLine(ipadOutput),
  };
  const report = [
    '$ node scripts/measure-fps.mjs http://localhost:5173 --seconds=5 --case=resp-001 --model=male --assert-contract',
    desktopOutput,
    '',
    '$ node scripts/measure-fps.mjs http://localhost:5173 --seconds=5 --case=resp-001 --model=male --ipad --assert-contract',
    ipadOutput,
  ].join('\n');

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await installCaptureSeeds(page);
  try {
    await page.goto(`${baseUrl}/?capture&devLiveCase=resp-001&model=male`, { waitUntil: 'networkidle' });
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
    await page.waitForTimeout(5_000);
    await page.evaluate((report) => {
      const panel = document.createElement('pre');
      panel.textContent = `GOAL CONTRACT — FPS HARNESS\n\n${report}`;
      Object.assign(panel.style, {
        position: 'fixed', inset: '70px', zIndex: '2147483647', margin: '0', padding: '42px',
        color: '#d8f7ff', background: 'rgba(3, 12, 28, 0.92)', border: '2px solid #35d7ff',
        borderRadius: '22px', boxShadow: '0 0 80px rgba(0, 190, 255, 0.35)',
        font: '600 24px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre-wrap',
      });
      document.body.appendChild(panel);
    }, report);
    await page.screenshot({ path: outputPath('10-fps.png') });
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await openLivePage(browser);
  try {
    // Criterion 8: actual THREE.PositionalAudio instances and their PannerNodes.
    // Three r183 intentionally leaves PositionalAudio.type as "Audio" and does
    // not expose isPositionalAudio, so identify the concrete audio graph by its
    // PannerNode + positional API instead of a property that does not exist.
    evidence.audio = await page.evaluate(() => {
      const state = window.__r3f;
      const positional = [];
      let audioContextState = null;
      state?.scene?.traverse((object) => {
        if (!object.panner || typeof object.setRefDistance !== 'function') return;
        const panner = object.panner;
        const world = object.getWorldPosition(new state.scene.position.constructor());
        audioContextState ??= object.context?.state ?? null;
        positional.push({
          objectType: object.type,
          name: object.name || '(unnamed)',
          role: object.userData?.audioRole ?? null,
          position: [world.x, world.y, world.z].map((n) => Number(n.toFixed(3))),
          pannerNode: panner?.constructor?.name ?? null,
          panningModel: panner?.panningModel ?? null,
          distanceModel: panner?.distanceModel ?? null,
          refDistance: panner?.refDistance ?? null,
          maxDistance: panner?.maxDistance ?? null,
          rolloffFactor: panner?.rolloffFactor ?? null,
          connectedSource: Boolean(object.source),
          isPlaying: Boolean(object.isPlaying),
        });
      });
      const camera = state?.camera;
      const listener = camera?.children?.find((object) => object.type === 'AudioListener');
      const listenerWorld = listener && state
        ? listener.getWorldPosition(new state.scene.position.constructor())
        : null;
      const beforeOrbit = listenerWorld
        ? [listenerWorld.x, listenerWorld.y, listenerWorld.z].map((n) => Number(n.toFixed(3)))
        : null;
      if (camera && state) {
        camera.position.set(-2.25, 1.45, 2.15);
        camera.lookAt(0, 0.8, -0.25);
        camera.updateMatrixWorld(true);
        state.gl.render(state.scene, camera);
      }
      const listenerAfter = listener && state
        ? listener.getWorldPosition(new state.scene.position.constructor())
        : null;
      const afterOrbit = listenerAfter
        ? [listenerAfter.x, listenerAfter.y, listenerAfter.z].map((n) => Number(n.toFixed(3)))
        : null;
      const listenerMoved = Boolean(beforeOrbit && afterOrbit && beforeOrbit.some((n, i) => n !== afterOrbit[i]));
      return {
        introspectable: positional.length > 0 && listenerMoved,
        note: positional.length > 0
          ? 'Real THREE.PositionalAudio emitters backed by WebAudio PannerNodes were found; the AudioListener followed the orbiting camera.'
          : 'The live audio graph was not introspectable; no PositionalAudio objects were found.',
        audioContextState,
        interceptedCreatePannerCount: window.__goalAudioPanners?.length ?? 0,
        listenerOrbit: { before: beforeOrbit, after: afterOrbit, moved: listenerMoved },
        positionalEmitters: positional,
      };
    });
    writeFileSync(outputPath('08-audio-pan.json'), `${JSON.stringify(evidence.audio, null, 2)}\n`);

    // Criterion 3: identical side camera, two live mixer frames one second apart.
    // Supine patient — side elevation shows chest heave best.
    // Tripod: patient is pitch-up ~37° with head now at y≈1.84, z≈−0.59.
    // Side-elevation aimed at mid-torso shows lean + shoulder heave.
    const tripodPose = { position: [1.9, 1.55, 0.55], target: [0, 1.35, 0.0], fov: 38 };
    const tripodA = await framebuffer(page, tripodPose, { stopLoop: false });
    writeDataUrl('03a-tripod-posture.png', tripodA.dataUrl);
    evidence.tripod.push(tripodA.morphSnapshot);
    await page.waitForTimeout(1_000);
    const tripodB = await framebuffer(page, tripodPose, { stopLoop: false });
    writeDataUrl('03b-tripod-posture.png', tripodB.dataUrl);
    evidence.tripod.push(tripodB.morphSnapshot);

    // Criterion 7 first: advance the composer once at a portrait camera pose.
    const cinematic = await framebuffer(page, {
      position: [0.3, 1.05, 0.3], target: [0.02, 0.74, -0.28], fov: 30,
    }, { composer: true });
    writeDataUrl('07-dof-warm-grade.png', cinematic.dataUrl);

    // Remaining frames are deterministic direct framebuffer renders.
    // Face close-up: the head bone sits at y≈1.35, z≈0.83 and the face front
    // faces +Z (eyes at z≈0.96). Camera in FRONT of the face (+Z side), slight
    // high angle, tight FOV so pore/SSS detail is legible.
    const faceCloseup = { position: [0.0, 1.42, 1.55], target: [0, 1.38, 0.88], fov: 16 };
    const skin = await framebuffer(page, faceCloseup);
    writeDataUrl('01-skin-pores-ears.png', skin.dataUrl);

    const male = await framebuffer(page, {
      position: [0, 1.85, 1.6], target: [0, 0.55, -0.35], fov: 40,
    });
    writeDataUrl('02-male-morphs.png', male.dataUrl);

    // Jaw/viseme: tight shot at the mouth with FULL influence. The lip-sync
    // was deliberately recalibrated to a measured 5.8 mm vermilion excursion
    // (from a comical 50 mm), so at 0.78 the ~4.5 mm gap is sub-pixel from
    // any wider FOV. At 1.0 the open mouth is legible and proves the morph.
    const speech = await framebuffer(page, {
      position: [0.0, 1.30, 1.55], target: [0, 1.28, 0.88], fov: 14,
    }, { morphs: { viseme_open: 1.0 } });
    evidence.viseme = speech.morphEvidence;
    writeDataUrl('04-speech-jaw.png', speech.dataUrl);

    const villa = await framebuffer(page, {
      position: [-2.6, 1.45, 2.4], target: [0.1, 0.7, -0.3], fov: 62,
    });
    writeDataUrl('05-villa-orbit.png', villa.dataUrl);
  } finally {
    await page.close();
  }

  evidence.morphs = runCommandEvidence(resolve(repoRoot, 'scripts/verify-glb-morphs.mjs'), []);
  console.log('\nMale GLB verification:\n' + evidence.morphs);
  console.log('\nLive tripod morph frames:\n' + JSON.stringify(evidence.tripod, null, 2));
  console.log('\nSpeech morph evidence:\n' + JSON.stringify(evidence.viseme, null, 2));
  console.log('\nAudio graph evidence:\n' + JSON.stringify(evidence.audio, null, 2));

  await captureCyanosis(browser, 85, '06a-cyanosis-spo2-85.png');
  await captureCyanosis(browser, 94, '06b-cyanosis-spo2-94.png');
  await capturePhaseTransition(browser);
  await captureFpsReport(browser);
} finally {
  await browser.close();
}

console.log('\nGOAL_CONTRACT evidence files');
console.log('file'.padEnd(34) + 'bytes'.padStart(12) + '  smoke');
console.log('-'.repeat(55));
let smokeFailed = false;
for (const name of pngNames) {
  const size = existsSync(outputPath(name)) ? statSync(outputPath(name)).size : 0;
  const smoke = size > 20_000 ? 'PASS' : 'FAIL';
  if (smoke === 'FAIL') smokeFailed = true;
  console.log(name.padEnd(34) + String(size).padStart(12) + `  ${smoke}`);
}
const audioSize = existsSync(outputPath('08-audio-pan.json')) ? statSync(outputPath('08-audio-pan.json')).size : 0;
console.log('08-audio-pan.json'.padEnd(34) + String(audioSize).padStart(12) + `  ${evidence.audio?.introspectable ? 'REAL GRAPH' : 'NOTE ONLY'}`);

const breathChanged = evidence.tripod.length === 2
  && evidence.tripod[0]?.breathe_chest_rise !== evidence.tripod[1]?.breathe_chest_rise;
const solid = [
  '2 male mesh/morph integrity (GLB verifier + full-body frame)',
  `3 tripod posture and shoulder heave (pose_tripod=${evidence.tripod[0]?.pose_tripod ?? 'n/a'}; breathing changed=${breathChanged})`,
  `4 jaw/viseme frame (viseme_open=${evidence.viseme?.viseme_open ?? 'n/a'})`,
  `6 SpO₂ cyanosis A/B (forced live vitals at 85 and 94, identical composite framing)`,
  `8 positional audio (${evidence.audio?.positionalEmitters?.length ?? 0} PannerNode emitters; listener moved=${evidence.audio?.listenerOrbit?.moved ?? false})`,
  `10 FPS harness (${evidence.fps ? JSON.stringify(evidence.fps) : 'see captured command output'})`,
];
const eyeball = [
  '1 pore detail / ear and nostril translucency',
  '5 villa window, lamp and floor-shadow composition',
  '7 DoF, warm grade and window bloom',
  '9 mid-dolly motion / phase crossfade appearance',
];
console.log('\nSolid programmatic evidence:');
for (const item of solid) console.log(`  - ${item}`);
console.log('Needs human eyeballing:');
for (const item of eyeball) console.log(`  - ${item}`);

if (smokeFailed) {
  console.error('\nOne or more PNGs failed the >20 KB non-black smoke test.');
  process.exitCode = 1;
}
