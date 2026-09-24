import { expect, test } from '@playwright/test';

type AmbientSnapshot = {
  room: { playing: boolean; volume: number };
  ac: { playing: boolean; volume: number };
  patient: { playing: boolean; volume: number; position: number[]; pannerPosition: number[] };
  expectedChestPosition: number[];
  patientRootZ: number;
  contextState: string;
  listenerCount: number;
  emitterCount: number;
};

test('resp-001 ambient nodes follow mute preference and the positioned chest', async ({ page }) => {
  test.setTimeout(120_000);
  let cloudSpeechRequests = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/tts') {
      cloudSpeechRequests += 1;
    }
  });
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });

  await page.goto('/?devLiveCase=resp-001');
  await page.waitForFunction(() => window.__r3f?.scene?.getObjectByName('patient-breath'));

  const ambient = () => page.evaluate<AmbientSnapshot>(() => {
    const { scene, camera } = window.__r3f!;
    const patient = scene.getObjectByName('patient-breath') as import('three').PositionalAudio;
    const ac = scene.getObjectByName('villa-ac-hum') as import('three').PositionalAudio;
    const room = patient.parent!.children.find(child => child.type === 'Audio') as import('three').Audio;
    const patientRoot = scene.getObjectByName('TreatmentBayPatientRoot')!;
    const expectedChestPosition = patientRoot.localToWorld(patient.position.clone().set(0, 1.31, 0));
    let listenerCount = 0;
    let emitterCount = 0;
    camera.traverse(object => {
      if (object.type === 'AudioListener') listenerCount += 1;
    });
    scene.traverse(object => {
      if (object.type === 'Audio' || object.type === 'PositionalAudio') emitterCount += 1;
    });
    return {
      room: { playing: room.isPlaying, volume: room.getVolume() },
      ac: { playing: ac.isPlaying, volume: ac.getVolume() },
      patient: {
        playing: patient.isPlaying,
        volume: patient.getVolume(),
        position: patient.position.toArray(),
        pannerPosition: [
          patient.panner.positionX.value,
          patient.panner.positionY.value,
          patient.panner.positionZ.value,
        ],
      },
      expectedChestPosition: expectedChestPosition.toArray(),
      patientRootZ: patientRoot.position.z,
      contextState: patient.context.state,
      listenerCount,
      emitterCount,
    };
  });

  const initiallyMuted = await ambient();
  expect(initiallyMuted.room.playing).toBe(true);
  expect(initiallyMuted.ac.playing).toBe(true);
  expect(initiallyMuted.patient.playing).toBe(true);
  expect(initiallyMuted.room.volume).toBe(0);
  expect(initiallyMuted.ac.volume).toBe(0);
  expect(initiallyMuted.patient.volume).toBe(0);
  expect(initiallyMuted.listenerCount).toBe(1);
  expect(initiallyMuted.emitterCount).toBe(3);
  // The audio layer is a sibling of the patient root, so its emitter uses the
  // already-composed world-space chest position. The root's local z is a
  // presentation pivot (and may be negative) rather than the emitter's world
  // coordinate; the following chest-position assertions are the authoritative
  // alignment check.
  expect(initiallyMuted.patient.position[1]).toBeGreaterThan(0.8);
  // The fitted seated rig's chest is just over 1.2 m in the rev7 villa; keep
  // this as a broad human-scale guard and use the composed chest equality
  // below for the authoritative placement check.
  expect(initiallyMuted.patient.position[1]).toBeLessThan(1.35);
  initiallyMuted.patient.position.forEach((coordinate, index) => {
    expect(coordinate).toBeCloseTo(initiallyMuted.expectedChestPosition[index], 5);
    expect(initiallyMuted.patient.pannerPosition[index]).toBeCloseTo(coordinate, 5);
  });

  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: 'Enable patient voice', exact: true }).click();
  await expect.poll(async () => (await ambient()).patient.volume).toBeGreaterThan(0);
  const enabled = await ambient();
  expect(enabled.room.volume).toBeGreaterThan(0);
  expect(enabled.ac.volume).toBeGreaterThan(0);
  expect(enabled.patient.volume).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Mute patient voice', exact: true }).click();
  await expect.poll(async () => (await ambient()).patient.volume).toBe(0);
  const mutedAgain = await ambient();
  expect(mutedAgain.room.volume).toBe(0);
  expect(mutedAgain.ac.volume).toBe(0);
  expect(mutedAgain.patient.volume).toBe(0);
  expect(cloudSpeechRequests).toBe(0);
});

test('resp-001 wheeze and AC pan across the listener during an orbit', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
  });
  await page.goto('/?capture&devLiveCase=resp-001');
  await page.waitForFunction(() => {
    const scene = window.__r3f?.scene;
    return Boolean(scene?.getObjectByName('patient-breath') && scene?.getObjectByName('villa-ac-hum'));
  });

  const stereoGeometry = await page.evaluate(() => {
    const state = window.__r3f!;
    const { camera, controls, gl, scene } = state;
    const patient = scene.getObjectByName('patient-breath')!;
    const ac = scene.getObjectByName('villa-ac-hum')!;
    const Vector3 = patient.position.constructor as typeof import('three').Vector3;
    const patientWorld = patient.getWorldPosition(new Vector3());
    gl.setAnimationLoop(null);
    if (controls) controls.enabled = false;

    const relativeX = (emitter: import('three').Object3D) => {
      const world = emitter.getWorldPosition(new Vector3());
      return camera.worldToLocal(world).x;
    };
    const sample = (position: [number, number, number]) => {
      camera.position.set(...position);
      // Orbit around the authored patient plant, not the old bay origin. The
      // villa now sits at x=-1.1/z=0.08, so a fixed origin would invert the
      // apparent left/right panning even when the audio is correctly placed.
      camera.lookAt(patientWorld.x, 1.1, patientWorld.z + 0.52);
      camera.updateMatrixWorld(true);
      scene.updateMatrixWorld(true);
      return {
        patientX: relativeX(patient),
        acX: relativeX(ac),
      };
    };

    return {
      leftOrbit: sample([-2.4, 1.55, 2.2]),
      rightOrbit: sample([2.4, 1.55, 2.2]),
      patientPanningModel: (patient as import('three').PositionalAudio).panner.panningModel,
      acPanningModel: (ac as import('three').PositionalAudio).panner.panningModel,
    };
  });

  expect(stereoGeometry.patientPanningModel).toBe('HRTF');
  expect(stereoGeometry.acPanningModel).toBe('HRTF');
  expect(stereoGeometry.leftOrbit.patientX).toBeLessThan(-0.3);
  expect(stereoGeometry.rightOrbit.patientX).toBeGreaterThan(0.3);
  expect(Math.abs(stereoGeometry.leftOrbit.acX)).toBeGreaterThan(0.3);
  expect(Math.abs(stereoGeometry.rightOrbit.acX)).toBeGreaterThan(0.3);
  // The AC is far to the room's right, so both samples can remain on the
  // same side of the camera while still moving substantially across the
  // stereo field. Require the measured separation rather than a false sign
  // invariant copied from the old bay-origin layout.
  expect(Math.abs(stereoGeometry.leftOrbit.acX - stereoGeometry.rightOrbit.acX)).toBeGreaterThan(0.3);
});
