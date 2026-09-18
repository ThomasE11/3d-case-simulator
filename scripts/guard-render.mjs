import { chromium } from 'playwright';

const targets = [
  ['resp-009', 'choking', '/tmp/guard-choking.png'],
  ['cardiac-001', 'chest', '/tmp/guard-chest.png'],
  ['cardiac-004', 'head', '/tmp/guard-head.png'],
  ['y1-011', 'neck', '/tmp/guard-neck.png'],
  ['y1-002', 'abdomen', '/tmp/guard-abdomen.png'],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [caseId, region, out] of targets) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`http://localhost:5173/?devLiveCase=${encodeURIComponent(caseId)}`, { waitUntil: 'networkidle' });
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
