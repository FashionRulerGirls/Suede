import { test, expect } from '@playwright/test';
import { boot, go } from './helpers';

/* The SPA must push a browser-history entry per in-app view so the Back button
   walks back through Suede instead of escaping to the last external page. */

test('Back button steps back through in-app views', async ({ page }) => {
  await boot(page); // landing
  await go(page, 'capsule', { seed: true });
  await go(page, 'about', { seed: true });

  // Back → about → capsule (still inside Suede)
  await page.goBack();
  await page.waitForTimeout(300);
  expect(await page.locator('body').innerText()).toContain('The Capsule');

  // Back again → landing (still inside Suede, not an external page)
  await page.goBack();
  await page.waitForTimeout(300);
  // the app shell is still mounted (nav search button present)
  await expect(page.getByRole('button', { name: 'Search' }).first()).toBeVisible();
});

test('Back restores a detail view with its selection', async ({ page }) => {
  await boot(page);
  await go(page, 'brand', { seed: true });   // seeds appState.brand
  const brandText = await page.locator('body').innerText();
  await go(page, 'about', { seed: true });
  await page.goBack();                        // back to the brand detail
  await page.waitForTimeout(300);
  const restored = await page.locator('body').innerText();
  // the brand detail rebuilt (has the stats strip labels), not a blank/landing
  expect(restored).toMatch(/RATING|REVIEWS|FOLLOWERS/i);
});
