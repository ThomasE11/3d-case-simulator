import { chromium } from 'playwright';

// Render the two supine recumbent-guard cases at the treatment-bay close-up
// so the calibrated hand positions can be vision-verified against the case
// prose (supine STEMI clutching chest; ectopic guarding abdomen).
const targets = [
  ['cardiac-007', 'chest', '/tmp/rec-guard-chest.png'],
  ['y2-005', 'abdomen', '/tmp/rec-guard-abdomen.png'],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [cid, label, out] of targets) {
  await page.goto(`http://localhost:5173/?devLiveCase=${cid}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(7000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const go = btns.find((b) => /enter scene|arrive|begin|start assessment|continue|next/i.test(b.textContent || ''));
    if (go) go.click();
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: out });
  console.log(`saved ${out}`);
}

await browser.close();
