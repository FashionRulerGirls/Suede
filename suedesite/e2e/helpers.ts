import { Page, expect } from '@playwright/test';

/* Boot the SPA and wait for the in-app test hook (window.__suedeTest) that
   App.tsx exposes: go(route, seed?), seedAll(), setAuthed(bool). */
export async function boot(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => !!(window as any).__suedeTest, null, { timeout: 20_000 });
}

export async function go(
  page: Page,
  route: string,
  opts: { authed?: boolean; seed?: boolean } = {},
) {
  await page.evaluate(
    ({ route, authed, seed }) => {
      const t = (window as any).__suedeTest;
      if (authed !== undefined) t.setAuthed(authed);
      if (seed) t.seedAll();
      t.go(route);
    },
    { route, authed: opts.authed, seed: opts.seed },
  );
  // let React commit
  await page.waitForTimeout(250);
}

/* Attach an uncaught-exception collector. Uncaught errors (not console noise)
   are treated as hard failures. */
export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

/* A rendered screen should have real content and not be showing a React
   error-boundary / crash. */
export async function expectRendered(page: Page) {
  const text = (await page.locator('body').innerText()).trim();
  expect(text.length, 'screen should render visible text').toBeGreaterThan(20);
  expect(text.toLowerCase()).not.toContain('application error');
  expect(text.toLowerCase()).not.toContain('unhandled runtime error');
}
