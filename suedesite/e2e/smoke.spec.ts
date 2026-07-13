import { test } from '@playwright/test';
import { boot, go, trackPageErrors, expectRendered } from './helpers';

/* Every screen should render without an uncaught exception, as a guest and
   (for signed-in screens) in the authed demo state. The container has no
   Supabase, so this exercises the guest/mock fallback path. */

const PUBLIC_ROUTES = [
  'landing', 'capsule', 'lookbook', 'collective', 'brand', 'review', 'member',
  'inquiry', 'about', 'privacy', 'terms', 'suggest', 'apply', 'brandsignin',
  'signin', 'createaccount', 'forgot', 'verify', 'reset', 'quiz', 'consult',
];

const AUTHED_ROUTES = [
  'yourprofile', 'notifications', 'editprofile', 'createreview', 'createinquiry',
];

test.describe('every screen renders (guest)', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`guest: ${route}`, async ({ page }) => {
      const errors = trackPageErrors(page);
      await boot(page);
      await go(page, route, { seed: true });
      await expectRendered(page);
      if (errors.length) throw new Error(`Uncaught error on "${route}": ${errors.join(' | ')}`);
    });
  }
});

test.describe('every screen renders (signed-in)', () => {
  for (const route of AUTHED_ROUTES) {
    test(`authed: ${route}`, async ({ page }) => {
      const errors = trackPageErrors(page);
      await boot(page);
      await go(page, route, { authed: true, seed: true });
      await expectRendered(page);
      if (errors.length) throw new Error(`Uncaught error on "${route}": ${errors.join(' | ')}`);
    });
  }
});
