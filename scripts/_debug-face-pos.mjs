import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto('http://localhost:5173/?devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

const result = await page.evaluate(() => {
  const state = window.__r3f;
  if (!state) return { err: 'no __r3f' };
  const { scene } = state;
  scene.updateMatrixWorld(true);
  const V = scene.position.constructor;
  const out = [];
  scene.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    const n = (o.name || '').toLowerCase();
    if (!/eye|brow|nose|lips|jaw|ear|mouth|head|face|piloteyelid/.test(n)) return;
    let geo = o.geometry;
    if (!geo) return;
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    const center = new V();
    const c = geo.boundingSphere.center.clone();
    // bounding sphere center is in local space; get world via matrixWorld
    const worldCenter = c.applyMatrix4(o.matrixWorld);
    const r = geo.boundingSphere.radius;
    out.push({
      name: o.name || '(unnamed)',
      type: o.type,
      worldCenter: { x: +worldCenter.x.toFixed(3), y: +worldCenter.y.toFixed(3), z: +worldCenter.z.toFixed(3) },
      radius: +r.toFixed(3),
    });
  });
  return out;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
