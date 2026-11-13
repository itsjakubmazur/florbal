// WebKit (engine Safari) – kouřový běh stejných testů: `npx playwright test -c tests/webkit.config.js`.
// Není součástí `npm test`: Playwright WebKit není Safari na iPadOS (jiné API wake locku, audio session, instalace PWA),
// ale odhalí rozdíly v enginu (CSS, IndexedDB, service worker, Web Audio). Výsledky v docs/QA.md.
import base from '../playwright.config.js';

const touch = { hasTouch: true, isMobile: false };
export default {
  ...base,
  testDir: '.',
  testIgnore: ['webkit.config.js'],
  use: { ...base.use, browserName: 'webkit', launchOptions: {} },
  projects: [
    { name: 'webkit-ipad-landscape', use: { viewport: { width: 1180, height: 820 }, ...touch } },
    { name: 'webkit-ipad-portrait', use: { viewport: { width: 820, height: 1180 }, ...touch } },
  ],
  webServer: { ...base.webServer, cwd: '..' },
};
