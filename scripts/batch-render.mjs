import { chromium } from 'playwright';

// Batch-render representative cases for every unaudited scene variant.
const targets = [
  ['y2-004', 'industrial', '/tmp/scene-industrial.png'],
  ['trauma-012', 'water', '/tmp/scene-water.png'],
  ['tox-001', 'agricultural', '/tmp/scene-agricultural.png'],
  ['burn-001', 'fire', '/tmp/scene-fire.png'],
  ['env-001', 'heat', '/tmp/scene-heat.png'],
  ['y2-002', 'home', '/tmp/scene-home.png'],
  ['y2-005', 'public', '/tmp/scene-public.png'],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [caseId, variant, out] of targets) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      const url = `http://localhost:5173/?devLiveCase=${encodeURIComponent(caseId)}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(6500);
      await page.screenshot({ path: out, fullPage: false });
      console.log('saved', caseId, '->', out);
    } catch (e) {
      console.error('FAILED', caseId, e.message);
    } finally {
      await page.close();
    }
  }
  await browser.close();
})();
