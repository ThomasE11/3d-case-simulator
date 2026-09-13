import { chromium } from 'playwright';

// Proves the "synchronized" recovery loop on resp-001 (life-threatening asthma):
//   pre-treatment  SpO2 88 / RR 32  ->  cyanosis present, fast wheezy breath
//   post-treatment SpO2 98 / RR 15  ->  cyanosis cleared, slower deeper breath
//
// The visuals (cyanosis tint, breath-rate morph, ambient breath kind) are all
// derived from the SAME effectiveVitals source. CAPTURE_FORCED_SPO2 is read
// ONCE at module load, so we drive each state via a fresh page load with the
// `?spo2=` URL param rather than a post-load sessionStorage write.

const outDir = '/Users/eliastlcthomas/Projects/app/test-results';
const baseUrl = 'http://localhost:5173';

async function snapshot(spo2) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(45000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.addInitScript(() => {
      try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
    });
    await page.goto(`${baseUrl}/?devLiveCase=resp-001&capture&spo2=${spo2}`, { waitUntil: 'networkidle' });
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(9000);

    const state = await page.evaluate(() => {
      const s = window.__r3f;
      if (!s) return { found: false };
      const root = s.scene;
      let cyanosisApplied = false;
      let bodyFound = false;
      const audio = [];
      root.traverse((o) => {
        if (o.isMesh && o.userData?.cyanosisOpenTex) {
          bodyFound = true;
          const mat = Array.isArray(o.material) ? o.material[0] : o.material;
          cyanosisApplied = mat?.map === o.userData.cyanosisOpenTex;
        }
        if (o.userData?.role && String(o.userData.role).includes('breath')) {
          audio.push({ role: o.userData.role, isPlaying: o.isPlaying });
        }
      });
      return { found: true, bodyFound, cyanosisApplied, audio };
    });
    await page.screenshot({ path: `${outDir}/resp001-recovery-spo2-${spo2}.png` });
    return { spo2, ...state, errors };
  } finally {
    await browser.close();
  }
}

const pre = await snapshot(88);
const post = await snapshot(98);
console.log(JSON.stringify({ pre, post }, null, 2));
