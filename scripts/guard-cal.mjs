import { chromium } from 'playwright';

// Full-grid hand-guard calibration. Sweeps elbow flexion (foreX) and inward
// sweep (foreZ) over a grid, reads live hand world positions, and reports the
// closest combo for EACH guarded region's target bone.
// Usage: node scripts/guard-cal.mjs <caseId>
const caseId = process.argv[2] || 'y1-011';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const ARM_X = -1.15;   // upper-arm flexion (fixed)
const ARM_Z = -0.35;   // upper-arm adduction (fixed, from neck calibration)

const foreXs = [-1.1, -1.3, -1.5, -1.7, -1.9];
const foreZs = [0.7, 1.0, 1.3, 1.6, 1.9, 2.2, 2.5];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

// Target regions (name -> bone to measure against)
const targets = {
  head: 'mixamorigHead',
  neck: 'mixamorigNeck',
  chest: 'mixamorigSpine2',
  abdomen: 'mixamorigSpine1',
  choking: 'mixamorigNeck',
};

// Read target bone positions + hand positions after applying a (foreX, foreZ).
const measure = (foreX, foreZ) =>
  page.evaluate(
    ([fX, fZ, aX, aZ]) => {
      const setHandGuard = window.__setHandGuard;
      const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
      if (!setHandGuard || !r3f) return { error: 'no hook/r3f' };
      const V3 = r3f.camera.position.constructor;
      const tmp = new V3();
      const scene = r3f.scene;
      const read = (names) => {
        const out = {};
        scene.traverse((o) => {
          const key = o.name.replace(/^mixamorig[: ]?/, '');
          if (names.includes(key)) { o.getWorldPosition(tmp); out[key] = [tmp.x, tmp.y, tmp.z]; }
        });
        return out;
      };
      // Apply via the hook for the 'neck' slot (all regions share the same
      // arm-chain transforms; we only calibrate the chain geometry here).
      setHandGuard('neck', {
        leftArm: [aX, 0, aZ],
        leftForeArm: [fX, 0, fZ],
        rightArm: [aX, 0, -aZ],
        rightForeArm: [fX, 0, -fZ],
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          const bones = read(['Head', 'Neck', 'Spine2', 'Spine1', 'LeftHand', 'RightHand']);
          resolve({ bones });
        }, 120);
      });
    },
    [foreX, foreZ, ARM_X, ARM_Z],
  );

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Read baseline targets once (any measurement includes them).
const first = await measure(foreXs[0], foreZs[0]);
if (first.error || !first.bones) { console.log('ERROR', first); await browser.close(); process.exit(1); }
const T = {};
for (const [region, bone] of Object.entries(targets)) {
  const key = bone.replace('mixamorig', '');
  T[region] = first.bones[key];
}
console.log('=== TARGETS ===');
for (const [r, p] of Object.entries(T)) console.log(`  ${r.padEnd(8)} ${JSON.stringify(p)}`);

// Grid sweep, tracking best per region.
const best = {};
for (const foreX of foreXs) {
  for (const foreZ of foreZs) {
    const res = await measure(foreX, foreZ);
    if (res.error || !res.bones) continue;
    const lh = res.bones.LeftHand, rh = res.bones.RightHand;
    const mid = [(lh[0] + rh[0]) / 2, (lh[1] + rh[1]) / 2, (lh[2] + rh[2]) / 2];
    for (const [region, tp] of Object.entries(T)) {
      const err = dist(mid, tp);
      if (!best[region] || err < best[region].err) {
        best[region] = { foreX, foreZ, err, mid, lh, rh };
      }
    }
  }
}

console.log('\n=== BEST PER REGION ===');
for (const [region, b] of Object.entries(best)) {
  console.log(`${region.padEnd(8)} foreX=${b.foreX} foreZ=${b.foreZ} mid=${JSON.stringify(b.mid.map((v) => +v.toFixed(3)))} err=${b.err.toFixed(3)}`);
}
console.log('\n=== RECOMMENDED VALUES (paste into HAND_GUARD_ADJUSTMENTS) ===');
for (const [region, b] of Object.entries(best)) {
  console.log(`${region}: { leftArm: [${ARM_X}, 0, ${ARM_Z}], leftForeArm: [${b.foreX}, 0, ${b.foreZ}], rightArm: [${ARM_X}, 0, ${-ARM_Z}], rightForeArm: [${b.foreX}, 0, ${-b.foreZ}] }`);
}
await browser.close();
