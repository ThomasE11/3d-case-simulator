import { chromium } from 'playwright';

// General scene introspection: camera + every NAMED group/mesh with world position.
// Usage: node scripts/scene-dump.mjs <caseId>
const caseId = process.argv[2] || 'y1-011';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const report = await page.evaluate(() => {
  const out = {};
  const win = window;
  const r3f = win.__r3f && win.__r3f.scene ? win.__r3f : null;
  out.hasR3f = !!r3f;
  if (!r3f) return out;
  const scene = r3f.scene;
  const camera = r3f.camera;

  out.camera = {
    position: camera.position.toArray().map((v) => +v.toFixed(2)),
    fov: camera.fov,
    aspect: camera.aspect,
  };
  // what the camera is looking at (world direction)
  const Vector3 = camera.position.constructor;
  const camDir = new Vector3();
  camera.getWorldDirection(camDir);
  out.cameraLookDirection = camDir.toArray().map((v) => +v.toFixed(2));

  // every named object with world position
  const named = [];
  const tmp = new Vector3();
  scene.traverse((o) => {
    if (!o.name) return;
    o.getWorldPosition(tmp);
    named.push({
      name: o.name,
      pos: [tmp.x, tmp.y, tmp.z].map((v) => +v.toFixed(2)),
      visible: o.visible,
      kind: o.isMesh ? 'mesh' : o.isGroup ? 'group' : o.type,
    });
  });
  // collapse duplicates
  const byName = {};
  for (const n of named) {
    (byName[n.name] = byName[n.name] || []).push(n);
  }
  out.namedGroups = byName;
  out.namedCount = named.length;

  let meshCount = 0;
  scene.traverse((o) => { if (o.isMesh) meshCount++; });
  out.meshCount = meshCount;
  return out;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
