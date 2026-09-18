import { chromium } from 'playwright';

// Final calibration: sweep foreY (horizontal adduction) + foreX (elbow
// flexion) jointly per target region, holding foreZ (twist) near the measured
// optimum. Reports the (foreX, foreY) that lands hands on each region's bone.
const caseId = process.argv[2] || 'y1-011';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const ARM_X = -1.15, ARM_Z = -0.35;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const measure = (foreX, foreY, foreZ) =>
  page.evaluate(
    ([fX, fY, fZ]) => {
      const setHandGuard = window.__setHandGuard;
      const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
      if (!setHandGuard || !r3f) return { error: 'no hook/r3f' };
      const scene = r3f.scene;
      const V3 = r3f.camera.position.constructor;
      const tmp = new V3();
      setHandGuard('neck', {
        leftArm: [-1.15, 0, -0.35],
        leftForeArm: [fX, fY, fZ],
        rightArm: [-1.15, 0, 0.35],
        rightForeArm: [fX, -fY, -fZ],
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          const bones = {};
          const want = ['Head', 'Neck', 'Spine2', 'Spine1', 'LeftHand', 'RightHand'];
          scene.traverse((o) => {
            const key = o.name.replace(/^mixamorig[: ]?/, '');
            if (want.includes(key)) { o.getWorldPosition(tmp); bones[key] = [tmp.x, tmp.y, tmp.z]; }
          });
          resolve({ bones });
        }, 120);
      });
    },
    [foreX, foreY, foreZ],
  );

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const targets = {
  neck: 'Neck',
  head: 'Head',
  choking: 'Neck',
  chest: 'Spine2',
  abdomen: 'Spine1',
};

// Read target bones once.
const first = await measure(-1.9, -1.2, 1.3);
if (first.error) { console.log(first); await browser.close(); process.exit(1); }
const T = {};
for (const [r, bone] of Object.entries(targets)) T[r] = first.bones[bone];
console.log('=== TARGETS ===', JSON.stringify(T));

const foreXs = [-1.1, -1.3, -1.5, -1.7, -1.9];
const foreYs = [-0.6, -0.9, -1.2, -1.5];
const foreZs = [0.7, 1.0, 1.3, 1.6, 1.9, 2.2, 2.5];

const best = {};
for (const fX of foreXs) {
  for (const fY of foreYs) {
    for (const fZ of foreZs) {
      const res = await measure(fX, fY, fZ);
      if (res.error || !res.bones) continue;
      const lh = res.bones.LeftHand, rh = res.bones.RightHand;
      const mid = [(lh[0] + rh[0]) / 2, (lh[1] + rh[1]) / 2, (lh[2] + rh[2]) / 2];
      for (const [region, tp] of Object.entries(T)) {
        const err = dist(mid, tp);
        if (!best[region] || err < best[region].err) {
          best[region] = { foreX: fX, foreY: fY, foreZ: fZ, err, mid, lh, rh };
        }
      }
    }
  }
}

console.log('\n=== BEST PER REGION ===');
for (const [region, b] of Object.entries(best)) {
  console.log(`${region.padEnd(8)} foreX=${b.foreX} foreY=${b.foreY} foreZ=${b.foreZ} mid=${JSON.stringify(b.mid.map((v) => +v.toFixed(3)))} err=${b.err.toFixed(3)}`);
}
console.log('\n=== VALUES ===');
for (const [region, b] of Object.entries(best)) {
  console.log(`${region}: leftForeArm: [${b.foreX}, 0, ${b.foreZ}], leftArm: [${ARM_X}, ${b.foreY}, ${ARM_Z}], rightForeArm: [${b.foreX}, 0, ${-b.foreZ}], rightArm: [${ARM_X}, ${-b.foreY}, ${-ARM_Z}]`);
}
await browser.close();
