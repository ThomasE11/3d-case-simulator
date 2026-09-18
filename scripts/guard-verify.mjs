import { chromium } from 'playwright';

// Render the guard-region cases at the treatment bay (phase-3 close-up) so the
// recalibrated hand positions can be vision-verified against case prose.
const targets = [
  ['resp-009', 'choking', '/tmp/g2-choking.png'],
  ['cardiac-001', 'chest', '/tmp/g2-chest.png'],
  ['y1-011', 'neck', '/tmp/g2-neck.png'],
  ['cardiac-004', 'head', '/tmp/g2-head.png'],
  ['trauma-007', 'abdomen', '/tmp/g2-abdomen.png'],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [cid, label, out] of targets) {
  await page.goto(`http://localhost:5173/?devLiveCase=${cid}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(7000);
  // Advance to the treatment bay / assessment phase where the patient is in frame.
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
