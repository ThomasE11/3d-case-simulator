import { chromium } from 'playwright';

// Calibrate the RECUMBENT hand guard by sweeping arm/forearm Euler angles
// entirely inside the browser (single evaluate), awaiting one animation frame
// per combo so the frame loop actually applies the rotation before reading.
// Usage: node scripts/guard-recumbent-cal.mjs <caseId> <region>
const caseId = process.argv[2] || 'cardiac-007';
const region = process.argv[3] || 'chest';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const result = await page.evaluate(async (reg) => {
  const setHandGuard = window.__setHandGuard;
  const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
  if (!setHandGuard || !r3f) return { error: 'no hook/r3f' };
  const scene = r3f.scene;
  const V3 = r3f.camera.position.constructor;
  const tmp = new V3();

  const nextFrame = () => new Promise((r) => setTimeout(() => r(null), 24));
  const bones = () => {
    const out = {};
    scene.traverse((o) => {
      const key = o.name.replace(/^mixamorig[: ]?/, '');
      if (['Spine2', 'Spine1', 'Neck', 'Head', 'LeftHand', 'RightHand', 'LeftForeArm', 'LeftArm'].includes(key)) {
        o.getWorldPosition(tmp);
        out[key] = [tmp.x, tmp.y, tmp.z];
      }
    });
    return out;
  };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  setHandGuard('recumbent', reg, { leftArm: [0,0,0], leftForeArm: [0,0,0], rightArm: [0,0,0], rightForeArm: [0,0,0] });
  await nextFrame();
  const zero = bones();
  const targetKey = reg === 'chest' ? 'Spine2' : 'Spine1';
  const T = zero[targetKey];
  const zeroHands = { lh: zero.LeftHand, rh: zero.RightHand };

  const armXs = [0, -0.3, -0.6, -0.9, -1.2, -1.5];
  const armYs = [0, 0.3, 0.6, -0.3, -0.6];
  const foreXs = [0, -0.4, -0.8, -1.2, -1.6, -2.0];
  const foreYs = [0, 0.4, 0.8, -0.4, -0.8, -1.2];

  let best = null;
  for (const ax of armXs) {
    for (const ay of armYs) {
      for (const fx of foreXs) {
        for (const fy of foreYs) {
          setHandGuard('recumbent', reg, {
            leftArm: [ax, ay, 0], leftForeArm: [fx, fy, 0],
            rightArm: [ax, -ay, 0], rightForeArm: [fx, -fy, 0],
          });
          await nextFrame();
          const b = bones();
          const lh = b.LeftHand, rh = b.RightHand;
          const mid = [(lh[0] + rh[0]) / 2, (lh[1] + rh[1]) / 2, (lh[2] + rh[2]) / 2];
          const err = dist(mid, T);
          if (!best || err < best.err) best = { ax, ay, fx, fy, err, mid, lh, rh };
        }
      }
    }
  }
  return { zeroHands, target: T, targetKey, best };
}, region);

if (result.error) { console.log(result); await browser.close(); process.exit(1); }
console.log('=== TARGET', result.targetKey, JSON.stringify(result.target));
console.log('=== ZERO HANDS', JSON.stringify(result.zeroHands));
console.log('=== BEST', JSON.stringify(result.best, null, 2));
const b = result.best;
console.log(`\n${region}: leftArm: [${b.ax}, ${b.ay}, 0], leftForeArm: [${b.fx}, ${b.fy}, 0], rightArm: [${b.ax}, ${-b.ay}, 0], rightForeArm: [${b.fx}, ${-b.fy}, 0]`);
await browser.close();
