import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:5173';
fs.mkdirSync('probe-out', { recursive: true });

const cases = process.argv.slice(2);
const targets = cases.length ? cases : ['y2-007', 'trauma-008', 'resp-001'];

const browser = await chromium.launch();
for (const target of targets) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto(`${BASE}/?capture&devLiveCase=${target}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);

  const dump = await page.evaluate(() => {
    const r3f = window.__r3f;
    if (!r3f?.scene || !r3f?.camera) return { error: 'no __r3f' };
    const interesting = [];
    r3f.scene.traverse(o => {
      if (o.name && /sedan|car_|CarSedan|bed|IntBed|int_bed|archetype|wrecked|asthma_|villa|desk|nightstand|bathtub|toilet|Bumper/i.test(o.name)) {
        interesting.push(o.name);
      }
    });
    const report = [];
    r3f.scene.traverse(obj => {
      if (!obj.name) return;
      if (!/sedan|car_|CarSedan|bed|IntBed|int_bed|archetype|wrecked|asthma_|desk|Nightstand|bathtub|toilet|Bumper/i.test(obj.name)) return;
      let minY = null, maxY = null, minX = null, maxX = null, minZ = null, maxZ = null;
      let meshCount = 0;
      obj.traverse(child => {
        if (!child.isMesh || child.visible === false) return;
        const geom = child.geometry;
        if (!geom) return;
        if (!geom.boundingBox) geom.computeBoundingBox?.();
        const bb = geom.boundingBox;
        if (!bb) return;
        meshCount += 1;
        const e = child.matrixWorld.elements;
        const corners = [
          [bb.min.x, bb.min.y, bb.min.z],
          [bb.min.x, bb.min.y, bb.max.z],
          [bb.min.x, bb.max.y, bb.min.z],
          [bb.min.x, bb.max.y, bb.max.z],
          [bb.max.x, bb.min.y, bb.min.z],
          [bb.max.x, bb.min.y, bb.max.z],
          [bb.max.x, bb.max.y, bb.min.z],
          [bb.max.x, bb.max.y, bb.max.z],
        ];
        for (const [x, y, z] of corners) {
          const wx = e[0] * x + e[4] * y + e[8] * z + e[12];
          const wy = e[1] * x + e[5] * y + e[9] * z + e[13];
          const wz = e[2] * x + e[6] * y + e[10] * z + e[14];
          minY = minY == null ? wy : Math.min(minY, wy);
          maxY = maxY == null ? wy : Math.max(maxY, wy);
          minX = minX == null ? wx : Math.min(minX, wx);
          maxX = maxX == null ? wx : Math.max(maxX, wx);
          minZ = minZ == null ? wz : Math.min(minZ, wz);
          maxZ = maxZ == null ? wz : Math.max(maxZ, wz);
        }
      });
      const e = obj.matrixWorld.elements;
      report.push({
        name: obj.name,
        type: obj.type,
        meshCount,
        worldPos: [Number(e[12].toFixed(2)), Number(e[13].toFixed(2)), Number(e[14].toFixed(2))],
        box: minY == null ? null : {
          min: [Number(minX.toFixed(2)), Number(minY.toFixed(2)), Number(minZ.toFixed(2))],
          max: [Number(maxX.toFixed(2)), Number(maxY.toFixed(2)), Number(maxZ.toFixed(2))],
        },
      });
    });
    const cam = r3f.camera;
    return {
      camera: { pos: [cam.position.x, cam.position.y, cam.position.z], fov: cam.fov },
      interesting,
      report,
    };
  });

  fs.writeFileSync(`probe-out/probe-${target}-r3f.json`, JSON.stringify(dump, null, 2));
  console.log(target, dump.error || `cam=${JSON.stringify(dump.camera)} items=${dump.report?.length}`);
  if (dump.report) {
    for (const row of dump.report) {
      console.log(' ', row.name, 'meshes', row.meshCount, 'box', JSON.stringify(row.box), 'pos', JSON.stringify(row.worldPos));
    }
  }

  await page.evaluate(() => {
    const r3f = window.__r3f;
    if (!r3f?.camera || !r3f?.gl || !r3f?.scene) return;
    r3f.gl.setAnimationLoop(null);
    r3f.camera.position.set(0.6, 2.6, 5.2);
    r3f.camera.lookAt(0, 0.7, 0);
    r3f.camera.updateProjectionMatrix();
    r3f.gl.render(r3f.scene, r3f.camera);
  });
  await page.waitForTimeout(200);

  const stage = page.locator('.patient-model-canvas-stage canvas').first();
  if (await stage.count()) {
    await stage.screenshot({ path: `probe-out/probe-${target}-wide.png` });
  }
  await page.screenshot({ path: `probe-out/probe-${target}-full3.png` });
  if (errors.length) console.log(target, 'errors', errors.slice(0, 5));
  await page.close();
}
await browser.close();
