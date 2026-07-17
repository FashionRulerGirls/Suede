import { test, expect } from '@playwright/test';
import { boot } from './helpers';

// A brand name on a Lookbook review card should navigate to that brand's page.
test('Lookbook brand name opens the brand page', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    const t = (window as any).__suedeTest;
    t.seedAll();
    t.go('lookbook', { lookbookTab: 'reviews' });
  });
  await page.waitForTimeout(500);
  const wordmark = page.locator('.sd-reviewcard .sd-rc-brand').first();
  await wordmark.scrollIntoViewIfNeeded();
  await wordmark.click();
  await page.waitForTimeout(400);
  const text = await page.locator('body').innerText();
  expect(text).toMatch(/Back to The Capsule|Swipe to learn more/i);
});
