import { defineConfig } from '@playwright/test';

// Testy běží proti produkčnímu buildu (vite preview), tedy i se service workerem.
// Projekty: iPad na šířku, iPad na výšku, iPhone. Chromium (WebKit pro reálné chování iOS: docs/QA.md).
const touch = { hasTouch: true, isMobile: false };
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    browserName: 'chromium',
    locale: 'cs-CZ',
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'ipad-landscape', use: { viewport: { width: 1180, height: 820 }, ...touch } },
    { name: 'ipad-portrait', use: { viewport: { width: 820, height: 1180 }, ...touch } },
    { name: 'iphone', use: { viewport: { width: 390, height: 844 }, ...touch, isMobile: true, deviceScaleFactor: 3 } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
