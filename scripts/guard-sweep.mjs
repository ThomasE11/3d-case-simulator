import { chromium } from 'playwright';

// Calibrate the hand-guard arm rotations empirically against live bone
// positions. Loads the neck case, then sweeps upper-arm adduction (armZ) and
// forearm inward-sweep (foreZ) while armX/foreX stay fixed, reporting the
// hand-vs-target distance so the closest combo can be locked in.
// Usage: node scripts/guard-sweep.mjs <caseId> <region>
const caseId = process.argv[2] || 'y1-011';
const region = process.argv[3] || 'neck';

// Fixed flexion terms (from the current NECK_GUARD_ADJUSTMENTS baseline).
const ARM_X = -1.15;
const FORE_X = -1.55;

// Sweep ranges.
const armZs = [-0.2, -0.4, -0.6, -0.8, -1.0];
const foreZs = [0.8, 1.1, 1.4, 1.7, 2.0];

const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

// Ground-truth target positions (reported once before the sweep).
const measure = (armZ, foreZ) =>
  page.evaluate(
    ([aZ, fZ]) => {
      const setHandGuard = (window).__setHandGuard;
      if (!setHandGuard) return { error: 'no hook' };
      const make = (armZv, foreZv) => ({
        leftArm: [-1.15, 0, armZv],
        leftForeArm: [-1.55, 0, foreZv],
        rightArm: [-1.15, 0, -armZv],
        rightForeArm: [-1.55, 0, -foreZv],
      });
      setHandGuard('neck', make(aZ, fZ));
      // Let a few frames settle, then read world positions.
      return new Promise((resolve) => {
        setTimeout(() => {
          const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
          if (!r3f) return resolve({ error: 'no r3f' });
          const scene = r3f.scene;
          const V3 = r3f.camera.position.constructor;
          const tmp = new V3();
          const bones = {};
          const wanted = ['mixamorigNeck', 'mixamorigHead', 'mixamorigSpine2', 'mixamorigLeftHand', 'mixamorigRightHand'];
          scene.traverse((o) => {
            const key = o.name.replace(/^mixamorig[: ]?/, '');
            if (wanted.includes(o.name) || wanted.includes(key)) {
              o.getWorldPosition(tmp);
              bones[key] = [tmp.x, tmp.y, tmp.z];
            }
          });
          resolve({ bones });
        }, 120);
      });
    },
    [armZ, foreZ],
  );

const baseline = await page.evaluate(() => {
  const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
  if (!r3f) return null;
  const scene = r3f.scene;
  const V3 = r3f.camera.position.constructor;
  const tmp = new V3();
  const bones = {};
  const wanted = ['mixamorigNeck', 'mixamorigHead', 'mixamorigSpine2', 'mixamorigSpine', 'mixamorigHips', 'mixamorigSpine1'];
  scene.traverse((o) => {
    const key = o.name.replace(/^mixamorig[: ]?/, '');
    if (wanted.includes(o.name) || wanted.includes(key)) {
      o.getWorldPosition(tmp);
      bones[key] = [tmp.x, tmp.y, tmp.z];
    }
  });
  return bones;
});

console.log('=== TARGET BONES ===');
console.log(JSON.stringify(baseline, null, 2));

const target = baseline?.Neck || baseline?.mixamorigNeck || [0, 1.29, 0.645];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

console.log(`\n=== SWEEP (armX=${ARM_X}, foreX=${FORE_X}) target=${JSON.stringify(target)} ===`);
let best = null;
for (const armZ of armZs) {
  for (const foreZ of foreZs) {
    const res = await measure(armZ, foreZ);
    if (res.error || !res.bones) {
      console.log(`armZ=${armZ} foreZ=${foreZ} -> ${res.error}`);
      continue;
    }
    const lh = res.bones.LeftHand || res.bones.mixamorigLeftHand;
    const rh = res.bones.RightHand || res.bones.mixamorigRightHand;
    const d = (dist(lh, target) + dist(rh, target)) / 2;
    console.log(`armZ=${armZ.toFixed(1)} foreZ=${foreZ.toFixed(1)} handL=${JSON.stringify(lh)} handR=${JSON.stringify(rh)} err=${d.toFixed(3)}`);
    if (!best || d < best.err) best = { armZ, foreZ, err: d, lh, rh };
  }
}
console.log('\n=== BEST ===');
console.log(JSON.stringify(best, null, 2));
await browser.close();
