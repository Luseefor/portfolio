import { defineConfig } from '@playwright/test';

// Isolated port avoids the other checkout on 3000 and the HEAD preview on 3001.
// Override locally with PLAYWRIGHT_PORT if 3100 is taken.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

// Local machines may lack the bundled Chromium and have Google Chrome instead.
// Set PLAYWRIGHT_CHROME_CHANNEL=chrome or PLAYWRIGHT_USE_INSTALLED_CHROME=1 to use it.
// CI always uses the bundled Chromium installed by `npx playwright install`.
const chromeChannel =
  process.env.PLAYWRIGHT_CHROME_CHANNEL ??
  (process.env.PLAYWRIGHT_USE_INSTALLED_CHROME ? 'chrome' : undefined);

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalTimeout: 10 * 60 * 1000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    ...(chromeChannel ? { channel: chromeChannel } : {}),
  },
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
