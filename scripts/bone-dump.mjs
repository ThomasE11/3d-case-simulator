import { chromium } from 'playwright';

// Report bone world positions for the hand/forearm/head/neck chain so the
// neck-guard pose can be calibrated against the live skinned mesh.
// Usage: node scripts/bone-dump.mjs <caseId>
const caseId = process.argv[2] || 'y1-011';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const report = await page.evaluate(() => {
  const win = window;
  const r3f = win.__r3f && win.__r3f.scene ? win.__r3f : null;
  if (!r3f) return { hasR3f: false };
  const scene = r3f.scene;
  const Vector3 = r3f.camera.position.constructor;

  const targets = [
    'mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2',
    'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
    'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
    'mixamorigLeftShoulder', 'mixamorigRightShoulder',
  ];
  const out = {};
  const tmp = new Vector3();
  scene.traverse((o) => {
    if (!o.name) return;
    const key = o.name.replace(/^mixamorig[:\s]?/, '');
    if (targets.includes(o.name) || (key && targets.includes(key))) {
      o.getWorldPosition(tmp);
      out[key || o.name] = [tmp.x, tmp.y, tmp.z].map((v) => +v.toFixed(3));
    }
  });
  return { hasR3f: true, bones: out };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
