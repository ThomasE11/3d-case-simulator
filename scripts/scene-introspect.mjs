import { chromium } from 'playwright';

// Introspect the live Three.js scene for a given case: camera position + FOV,
// and whether the public-office furniture groups are present with world positions.
const caseId = process.argv[2] || 'y2-005';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const report = await page.evaluate(() => {
  const out = {};
  const findR3f = (() => {
    // The app sets window.__r3f = state in onCreated (DEV only).
    const win = window;
    if (win.__r3f && win.__r3f.scene) return win.__r3f;
    return null;
  })();
  out.hasR3f = !!findR3f;
  if (!findR3f) return out;
  const scene = findR3f.scene;
  const camera = findR3f.camera;

  out.camera = {
    position: camera.position.toArray(),
    fov: camera.fov,
    aspect: camera.aspect,
    near: camera.near,
    far: camera.far,
  };

  // Collect scene graph node names + world positions for our furniture + walls
  const groups = {};
  scene.traverse((o) => {
    const n = o.name || '';
    if (
      /public-office|public-filing|public-plant|public-side-wall|public-mullion|public-patient|clinical-patient-seat|storefront/i.test(n)
    ) {
      groups[n] = groups[n] || [];
      groups[n].push({
        pos: [o.position.x, o.position.y, o.position.z].map((v) => +v.toFixed(2)),
        visible: o.visible,
        isMesh: !!o.isMesh,
        isGroup: !!o.isGroup,
      });
    }
  });
  out.groups = groups;

  // Count total meshes in scene
  let meshCount = 0;
  scene.traverse((o) => {
    if (o.isMesh) meshCount++;
  });
  out.meshCount = meshCount;
  return out;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
