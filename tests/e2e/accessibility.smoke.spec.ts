import { test, expect } from '@playwright/test';

// ponytail: lightweight a11y sanity checks, no axe dependency —
// upgrade to @axe-core/playwright if a real audit is ever needed.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

test('landing page: headings, named buttons, alt text', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Start Training/i }).first()).toBeVisible();

  // At least one heading present.
  expect(await page.getByRole('heading').count()).toBeGreaterThan(0);

  // Every visible button has an accessible name.
  const unnamedButtons = await page.locator('button:visible').evaluateAll(buttons =>
    buttons.filter(
      b =>
        !(
          b.textContent?.trim() ||
          b.getAttribute('aria-label') ||
          b.getAttribute('title')
        ),
    ).length,
  );
  expect(unnamedButtons).toBe(0);

  // Every image has alt text (empty alt = decorative, acceptable).
  const missingAlt = await page.locator('img:visible').evaluateAll(imgs =>
    imgs.filter(img => img.getAttribute('alt') === null).length,
  );
  expect(missingAlt).toBe(0);
});

test('keyboard navigation reaches case selection', async ({ page }) => {
  await page.goto('/');

  // Enter student mode via keyboard.
  const start = page.getByRole('button', { name: /Start Training/i }).first();
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Choose the next patient encounter' })).toBeVisible();

  // Tab moves focus between interactive controls on the mission board.
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.tagName);
  await page.keyboard.press('Tab');
  const second = await page.evaluate(
    () => `${document.activeElement?.tagName}:${(document.activeElement as HTMLElement)?.innerText?.slice(0, 40)}`,
  );
  expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(first);
  expect(second).toBeTruthy();
});

test('mobile treatment header and monitor do not collide or clip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?devLiveCase=trauma-001&capture');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });

  const brand = page.locator('[data-student-header-brand]');
  const controls = page.locator('[data-student-header-controls]');
  await expect(brand).toBeHidden();
  await expect(controls).toBeVisible();

  const layout = await page.evaluate(() => {
    const monitor = document.querySelector('.tactical-monitor-card');
    return {
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      monitorClientWidth: monitor?.clientWidth ?? 0,
      monitorScrollWidth: monitor?.scrollWidth ?? 0,
      monitorClientHeight: monitor?.clientHeight ?? 0,
      monitorScrollHeight: monitor?.scrollHeight ?? 0,
    };
  });

  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.monitorScrollWidth).toBeLessThanOrEqual(layout.monitorClientWidth + 1);
  expect(layout.monitorScrollHeight).toBeLessThanOrEqual(layout.monitorClientHeight + 1);
});

test('laptop monitor shortcut reveals an un-stretched complete device', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1276, height: 900 });
  await page.goto('/?devLiveCase=resp-001');
  const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
  await expect(monitor).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'View bedside monitor', exact: true }).click();
  await expect.poll(() => monitor.evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  const box = (await monitor.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(768);
  expect(box.height).toBeGreaterThan(400);
  expect(box.y + box.height).toBeLessThanOrEqual(900);
  const overflow = await monitor.evaluate(el => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('laptop-bedside-monitor.png') });
});
