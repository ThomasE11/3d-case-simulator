import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto('http://localhost:5173/?devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

const result = await page.evaluate(() => {
  const state = window.__r3f;
  if (!state) return { err: 'no __r3f' };
  const { scene } = state;
  const out = [];
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh && !o.isObject3D) return;
    const name = (o.name || '').toLowerCase();
    const isHead = /head|face|skull|neck|cranium/.test(name);
    const isSkinned = o.isSkinnedMesh;
    if (!isHead && !isSkinned) return;
    const box = o.geometry && o.geometry.boundingBox ? o.geometry.boundingBox : null;
    // compute world position via bone or object
    let worldPos = null;
    if (o.isBone || o.isObject3D) {
      const v = o.getWorldPosition(new state.scene.position.constructor());
      worldPos = { x: +v.x.toFixed(3), y: +v.y.toFixed(3), z: +v.z.toFixed(3) };
    }
    out.push({ name: o.name || '(unnamed)', type: o.type, worldPos, isSkinned });
  });
  // Also find bones named Head specifically
  const bones = [];
  scene.traverse((o) => {
    if (o.isBone) {
      const n = (o.name || '').toLowerCase();
      if (/head|neck|jaw/.test(n)) {
        const v = o.getWorldPosition(new state.scene.position.constructor());
        bones.push({ name: o.name, x: +v.x.toFixed(3), y: +v.y.toFixed(3), z: +v.z.toFixed(3) });
      }
    }
  });
  return { meshes: out.slice(0, 40), headBones: bones };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
