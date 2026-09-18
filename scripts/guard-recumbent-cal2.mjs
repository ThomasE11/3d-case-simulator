import { chromium } from 'playwright';

// Corrected recumbent guard calibration. The first pass minimised only the
// hand-MIDPOINT distance to the target bone, which a symmetric-but-splayed pose
// satisfies trivially (midpoint x≈0 even when hands sit at x=±0.4 on the
// flanks). Vision caught it: "arms at sides, not guarding the belly".
//
// This sweep minimises a COMBINED error — height error PLUS lateral hand
// spread — so it prefers hands that actually converge on the body midline over
// the guarded anatomy. Sweeps arm Y (shoulder adduction) and forearm X/Y/Z
// (elbow flexion + internal rotation) which is the axis set that can bring a
// supine patient's hands across the torso.
//
// Usage: node scripts/guard-recumbent-cal2.mjs <caseId> <region>
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
  const read = () => {
    const out = {};
    scene.traverse((o) => {
      const key = o.name.replace(/^mixamorig[: ]?/, '');
      if (['Spine2', 'Spine1', 'LeftHand', 'RightHand'].includes(key)) {
        o.getWorldPosition(tmp);
        out[key] = [tmp.x, tmp.y, tmp.z];
      }
    });
    return out;
  };

  setHandGuard('recumbent', reg, { leftArm: [0,0,0], leftForeArm: [0,0,0], rightArm: [0,0,0], rightForeArm: [0,0,0] });
  await nextFrame();
  const zero = read();
  const targetKey = reg === 'chest' ? 'Spine2' : 'Spine1';
  const T = zero[targetKey];

  // Coarse + fine grids. ax = arm X (shoulder sagittal), ay = arm Y (adduction),
  // az = arm Z (internal/external rotation), fx/fy/fz = forearm.
  const armYs  = [0, 0.4, 0.8, 1.2, -0.4, -0.8, -1.2];
  const armZs  = [0, 0.6, -0.6];
  const armXs  = [0, -0.4, -0.8];
  const foreXs = [0, -0.6, -1.2, -1.8];
  const foreYs = [0, 0.8, 1.6, -0.8, -1.6];
  const foreZs = [0, 0.8, -0.8];

  // Combined error: height error (midpoint vs target Y) + lateral spread
  // penalty (how far apart the hands are). Spread weight tuned so a hand that
  // sits on the flank (x≈0.4) is heavily penalised vs one near the midline.
  const spreadWeight = 4.0;

  let best = null;
  for (const ax of armXs) {
    for (const ay of armYs) {
      for (const az of armZs) {
        for (const fx of foreXs) {
          for (const fy of foreYs) {
            for (const fz of foreZs) {
              setHandGuard('recumbent', reg, {
                leftArm: [ax, ay, az], leftForeArm: [fx, fy, fz],
                rightArm: [ax, -ay, -az], rightForeArm: [fx, -fy, -fz],
              });
              await nextFrame();
              const b = read();
              const lh = b.LeftHand, rh = b.RightHand;
              const mid = [(lh[0]+rh[0])/2, (lh[1]+rh[1])/2, (lh[2]+rh[2])/2];
              const heightErr = Math.abs(mid[1] - T[1]);
              const spread = Math.abs(lh[0] - rh[0]); // full left-right gap
              const err = heightErr + spreadWeight * spread;
              if (!best || err < best.err) {
                best = { ax, ay, az, fx, fy, fz, err, heightErr, spread, mid, lh, rh };
              }
            }
          }
        }
      }
    }
  }
  return { zeroHands: { lh: zero.LeftHand, rh: zero.RightHand }, target: T, targetKey, best };
}, region);

if (result.error) { console.log(result); await browser.close(); process.exit(1); }
console.log('=== TARGET', result.targetKey, JSON.stringify(result.target));
console.log('=== ZERO HANDS', JSON.stringify(result.zeroHands));
console.log('=== BEST', JSON.stringify(result.best, null, 2));
const b = result.best;
console.log(`\n${region}: leftArm: [${b.ax}, ${b.ay}, ${b.az}], leftForeArm: [${b.fx}, ${b.fy}, ${b.fz}], rightArm: [${b.ax}, ${-b.ay}, ${-b.az}], rightForeArm: [${b.fx}, ${-b.fy}, ${-b.fz}]`);
await browser.close();
