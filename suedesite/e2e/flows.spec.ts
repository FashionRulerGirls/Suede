import { test, expect } from '@playwright/test';
import { boot, go, trackPageErrors } from './helpers';

/* Core interactions on the critical paths. Guest/mock data path. */

test('global search overlay opens and accepts input', async ({ page }) => {
  const errors = trackPageErrors(page);
  await boot(page);
  await page.getByRole('button', { name: 'Search' }).first().click();
  const input = page.getByPlaceholder('Search brands, members, reviews, inquiries');
  await expect(input).toBeVisible();
  await input.fill('a');
  // overlay should show either results or a graceful empty message — never crash
  await page.waitForTimeout(300);
  expect(errors, errors.join(' | ')).toHaveLength(0);
});

test('apply form blocks empty submit with validation', async ({ page }) => {
  await boot(page);
  await go(page, 'apply');
  await page.getByRole('button', { name: /submit application/i }).click();
  await expect(page.getByText(/please complete the following/i)).toBeVisible();
});

test('suggest-a-brand submit is disabled until a name is entered', async ({ page }) => {
  await boot(page);
  await go(page, 'suggest');
  const submit = page.getByRole('button', { name: /^submit$/i });
  await expect(submit).toBeDisabled();
  await page.getByPlaceholder(/OSA/i).first().fill('Test Brand');
  await expect(submit).toBeEnabled();
});

test('newsletter rejects an invalid email', async ({ page }) => {
  await boot(page);
  await go(page, 'landing');
  const email = page.getByPlaceholder('Email Address').first();
  await email.fill('not-an-email');
  await email.press('Enter');
  await expect(page.getByText(/valid email address/i)).toBeVisible();
});

test('signed-in profile shows the member’s own view', async ({ page }) => {
  const errors = trackPageErrors(page);
  await boot(page);
  await go(page, 'yourprofile', { authed: true, seed: true });
  // profile screen has feed tabs / stats — just assert it rendered richly
  const text = (await page.locator('body').innerText()).toLowerCase();
  expect(text).toContain('reviews');
  expect(errors, errors.join(' | ')).toHaveLength(0);
});
