import { chromium } from 'playwright';

// Screenshot a specific case's 3D patient presentation via the devLiveCase
// dev route. Loads the case directly, waits for the Three.js scene + entrance
// dolly to settle, then captures the full viewport.

const caseId = process.argv[2];
const out = process.argv[3] || '/tmp/case.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const url = `http://localhost:5173/?devLiveCase=${encodeURIComponent(caseId)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  // Three.js scene + patient model + entrance dolly mount time.
  await page.waitForTimeout(6000);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved', out);
  await browser.close();
})();
