import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto('http://localhost:5173/?devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

const shot = async (name, influence) => {
  const dataUrl = await page.evaluate((infl) => {
    const state = window.__r3f;
    const { gl, scene, camera } = state;
    const V = scene.position.constructor;
    gl.setAnimationLoop(null);
    if (state.controls) state.controls.enabled = false;
    scene.traverse((o) => {
      if (!o.isMesh || !o.morphTargetDictionary || !o.morphTargetInfluences) return;
      const idx = o.morphTargetDictionary['viseme_open'];
      if (idx !== undefined) o.morphTargetInfluences[idx] = infl;
    });
    camera.position.set(0, 1.30, 1.55);
    camera.up.set(0, 1, 0);
    camera.lookAt(new V(0, 1.28, 0.88));
    camera.fov = 14;
    camera.aspect = gl.domElement.width / gl.domElement.height;
    camera.updateProjectionMatrix();
    gl.render(scene, camera);
    return gl.domElement.toDataURL('image/png');
  }, influence);
  writeFileSync(`test-results/goal-contract/_jaw-${name}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
};

await shot('closed', 0.0);
await shot('open', 1.0);
console.log('done');
await browser.close();
