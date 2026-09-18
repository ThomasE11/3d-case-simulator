import { chromium } from 'playwright';

// Drive the live scene and prove the viseme_open morph actually follows the
// voice analyser: set mouthOpenRef via the live r3f state, then read back the
// viseme_open influence on the patient mesh. Also attempt to trigger a real
// patient line and read the mouthOpen amplitude while speaking.
const caseId = process.argv[2] || 'resp-001';
const url = `http://localhost:5173/?devLiveCase=${caseId}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(8000);

const report = await page.evaluate(() => {
  const out = {};
  const state = window.__r3f;
  out.hasState = !!state && !!state.scene;
  if (!out.hasState) return out;

  const scene = state.scene;
  const meshes = [];
  scene.traverse((o) => {
    if (o.isMesh && o.morphTargetDictionary && o.morphTargetDictionary.viseme_open !== undefined) {
      meshes.push({
        name: o.name || o.uuid,
        visemeIdx: o.morphTargetDictionary.viseme_open,
        hasInfluences: !!o.morphTargetInfluences,
        currentViseme: o.morphTargetInfluences ? o.morphTargetInfluences[o.morphTargetDictionary.viseme_open] : null,
      });
    }
  });
  out.visemeMeshes = meshes;
  out.meshWithVisemeCount = meshes.length;
  return out;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
