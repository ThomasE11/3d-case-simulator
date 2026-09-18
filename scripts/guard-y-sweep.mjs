import { chromium } from 'playwright';

// Sweep the CORRECT axis for midline hand adduction: horizontal adduction via
// forearm Y rotation (and upper-arm Y as a secondary lever). Reports whether
// hands can actually reach x≈±0.15 (flanking the neck/sternum) or whether the
// rig hard-limits them outboard.
// Usage: node scripts/guard-y-sweep.mjs <caseId>
const caseId = process.argv[2] || 'y1-011';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const measure = (armX, armY, armZ, foreX, foreY, foreZ) =>
  page.evaluate(
    ([aX, aY, aZ, fX, fY, fZ]) => {
      const setHandGuard = window.__setHandGuard;
      const r3f = window.__r3f && window.__r3f.scene ? window.__r3f : null;
      if (!setHandGuard || !r3f) return { error: 'no hook/r3f' };
      const scene = r3f.scene;
      const V3 = r3f.camera.position.constructor;
      const tmp = new V3();
      setHandGuard('neck', {
        leftArm: [aX, aY, aZ],
        leftForeArm: [fX, fY, fZ],
        rightArm: [aX, -aY, -aZ],
        rightForeArm: [fX, -fY, -fZ],
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          const bones = {};
          scene.traverse((o) => {
            const key = o.name.replace(/^mixamorig[: ]?/, '');
            if (['Neck', 'Head', 'LeftHand', 'RightHand', 'LeftForeArm', 'RightForeArm', 'LeftArm', 'RightArm'].includes(key)) {
              o.getWorldPosition(tmp);
              bones[key] = [tmp.x, tmp.y, tmp.z];
            }
          });
          resolve({ bones });
        }, 120);
      });
    },
    [armX, armY, armZ, foreX, foreY, foreZ],
  );

// Baseline: confirm neck target.
const base = await measure(-1.15, 0, -0.35, -1.9, 0, 1.3);
console.log('baseline neck', JSON.stringify(base.bones.Neck));
console.log('baseline handL', JSON.stringify(base.bones.LeftHand), 'handR', JSON.stringify(base.bones.RightHand));

// Sweep forearm Y (horizontal adduction) at fixed good height.
console.log('\n=== foreY sweep (armX=-1.15 armZ=-0.35 foreX=-1.9 foreZ=1.3) ===');
for (const foreY of [0, -0.3, -0.6, -0.9, -1.2, -1.5]) {
  const r = await measure(-1.15, 0, -0.35, -1.9, foreY, 1.3);
  if (r.error) { console.log(foreY, r.error); continue; }
  const lh = r.bones.LeftHand, rh = r.bones.RightHand;
  console.log(`foreY=${foreY.toFixed(1)} handL=${lh.map((v) => +v.toFixed(3))} handR=${rh.map((v) => +v.toFixed(3))}`);
}

// Sweep upper-arm Y (horizontal adduction of the whole arm).
console.log('\n=== armY sweep (armX=-1.15 armZ=-0.35 foreX=-1.9 foreZ=1.3) ===');
for (const armY of [0, -0.3, -0.6, -0.9]) {
  const r = await measure(-1.15, armY, -0.35, -1.9, 0, 1.3);
  if (r.error) { console.log(armY, r.error); continue; }
  const lh = r.bones.LeftHand, rh = r.bones.RightHand;
  console.log(`armY=${armY.toFixed(1)} handL=${lh.map((v) => +v.toFixed(3))} handR=${rh.map((v) => +v.toFixed(3))}`);
}

await browser.close();
