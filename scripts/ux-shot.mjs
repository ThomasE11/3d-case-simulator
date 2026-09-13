import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const out = process.argv[3] || '/tmp/view.png';
const scrollY = Number(process.argv[4] || 0);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  // Let the R3F hero scene mount + first frames render, and framer-motion
  // entrance animations settle.
  await page.waitForTimeout(4500);
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved', out);
  await browser.close();
})();
