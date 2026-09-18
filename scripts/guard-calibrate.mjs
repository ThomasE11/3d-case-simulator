import { chromium } from 'playwright';

// Parametric hand-guard calibration: applies the FULL arm-pose chain
// (rest -> armRelaxation -> guard adjustments) for a given set of rotation
// values, then reports the resulting hand/head/neck world positions so the
// values can be tuned to land the hands on the guarded region.
//
// Usage: node scripts/guard-calibrate.mjs <caseId> <armX> <armZ> <foreArmX> <foreArmZ>
//   e.g. node scripts/guard-calibrate.mjs y1-011 -1.15 -0.35 -1.55 1.3

const caseId = process.argv[2] || 'y1-011';
const armX = parseFloat(process.argv[3] ?? '-1.15');
const armZ = parseFloat(process.argv[4] ?? '-0.35');
const foreArmX = parseFloat(process.argv[5] ?? '-1.55');
const foreArmZ = parseFloat(process.argv[6] ?? '1.3');

const url = `http://localhost:5173/?devLiveCase=${caseId}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

const report = await page.evaluate(({ armX, armZ, foreArmX, foreArmZ }) => {
  const r3f = window.__r3f;
  if (!r3f || !r3f.scene) return { hasR3f: false };
  const scene = r3f.scene;
  const V3 = r3f.camera.position.constructor;

  const find = (n) => scene.getObjectByName(n) ?? scene.getObjectByName(n.replace(/:/g, '')) ?? null;
  const bones = {
    leftArm: find('mixamorig:LeftArm'),
    leftForeArm: find('mixamorig:LeftForeArm'),
    rightArm: find('mixamorig:RightArm'),
    rightForeArm: find('mixamorig:RightForeArm'),
  };

  const world = (o) => { const t = new V3(); o.getWorldPosition(t); return [t.x, t.y, t.z].map(v => +v.toFixed(3)); };

  const head = find('mixamorig:Head');
  const neck = find('mixamorig:Neck');
  const chest = find('mixamorig:Spine2');

  // Save rest quaternions for arm + forearm bones.
  const rest = {};
  for (const [k, b] of Object.entries(bones)) if (b) rest[k] = b.quaternion.clone();

  // Arm relaxation for seated mobility (patientArmRestRadians('seated') = 0.72).
  const armRelaxation = 0.72;

  // Apply the full chain for the guard pose.
  for (const b of [bones.leftArm, bones.rightArm]) {
    if (!b) continue;
    b.quaternion.copy(rest[Object.keys(rest).find(k => bones[k] === b)]);
    b.rotateX(armRelaxation);       // base seated rest drop
    b.rotateX(armX);                // guard arm flexion
    b.rotateZ(b === bones.leftArm ? armZ : -armZ);  // guard adduction (mirrored)
  }
  for (const b of [bones.leftForeArm, bones.rightForeArm]) {
    if (!b) continue;
    b.quaternion.copy(rest[Object.keys(rest).find(k => bones[k] === b)]);
    b.rotateX(foreArmX);
    b.rotateZ(b === bones.leftForeArm ? foreArmZ : -foreArmZ);
  }
  scene.updateMatrixWorld(true);

  const out = {
    head: head ? world(head) : null,
    neck: neck ? world(neck) : null,
    chest: chest ? world(chest) : null,
    leftHand: world(find('mixamorig:LeftHand')),
    rightHand: world(find('mixamorig:RightHand')),
  };
  return { hasR3f: true, bones: out };
}, { armX, armZ, foreArmX, foreArmZ });

console.log(JSON.stringify(report, null, 2));
await browser.close();
