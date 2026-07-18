import { defineConfig, devices } from '@playwright/test';

/* Suede smoke-test config. Runs against a local dev server, using the
   Chromium that's pre-installed in this environment (no browser download).
   The container can't reach Supabase, so the app runs in its guest/mock
   fallback — perfect for verifying every screen renders and the core
   navigation/forms work without crashing. */

const CHROMIUM =
  process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3210',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: CHROMIUM },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        // iPhone 13 defaults to WebKit, but we only have Chromium here — keep
        // the mobile viewport/UA/touch emulation and run it on Chromium.
        defaultBrowserType: 'chromium',
        launchOptions: { executablePath: CHROMIUM, args: ['--no-sandbox'] },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3210',
    url: 'http://localhost:3210',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
