// Kouřové testy M3: obrazovky se vykreslí bez chyb konzole, žádný vodorovný posun, přehrávač projde zrychleně
// 2 cviky, klepnutí pauzuje, update pruh se během tréninku neukáže, export/import zálohy, PWA manifest a offline.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

/** Sbírá chyby konzole a výjimky stránky; na konci testu musí být prázdné. */
function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}
async function noHorizontalScroll(page, label) {
  const r = await page.evaluate(() => {
    const s = document.querySelector('#app > .screen');
    return { doc: document.documentElement.scrollWidth - window.innerWidth, screen: s ? s.scrollWidth - s.clientWidth : 0 };
  });
  expect(r.doc, `${label}: dokument je širší než okno`).toBeLessThanOrEqual(1);
  expect(r.screen, `${label}: obrazovka má vodorovný posun`).toBeLessThanOrEqual(1);
}
const screen = (page, name) => page.locator(`[data-test="${name}"]`).first();
async function openDemoHome(page, extra = '') {
  await page.goto(`./?demo&nointro${extra}`);
  await screen(page, 'profiles').waitFor();
  await page.locator('[data-test="profile-card"]').first().click();
  await screen(page, 'home').waitFor();
  await expect(page.locator('[data-test="start"]')).toBeVisible();
}
async function enterParent(page) {
  await page.locator('[data-test="parent"]').click();
  await screen(page, 'set-pin').waitFor();
  for (let k = 0; k < 2; k++) for (const d of '1234') await page.locator(`[data-test="key-${d}"]`).click();
  await screen(page, 'parent').waitFor();
}

test('hlavní obrazovky se vykreslí bez chyb a bez vodorovného posunu', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await screen(page, 'intro').waitFor();
  await screen(page, 'profiles').waitFor({ timeout: 8000 });
  await page.goto('./?demo&nointro');
  await screen(page, 'profiles').waitFor();
  await noHorizontalScroll(page, 'profiles');
  await page.locator('[data-test="profile-card"]').first().click();
  await screen(page, 'home').waitFor();
  await expect(page.getByText('Tonda Čepel')).toBeVisible();
  await noHorizontalScroll(page, 'home');
  for (const [tile, name] of [['tile-drills', 'drills'], ['tile-stations', 'stations'], ['tile-rewards', 'rewards'], ['tile-levels', 'levels']]) {
    await page.locator(`[data-test="${tile}"]`).click();
    await screen(page, name).waitFor();
    await page.waitForTimeout(150);
    await noHorizontalScroll(page, name);
    await page.locator('[data-test="back"]').first().click();
    await screen(page, 'home').waitFor();
  }
  // návod na postavení stanoviště
  await page.locator('[data-test="tile-stations"]').click();
  await page.locator('[data-test="station-triangle"]').click();
  await screen(page, 'setup').waitFor();
  await expect(page.locator('[data-test="station-view"]')).toBeVisible();
  const t1 = await page.locator('[data-test="setup-text"]').textContent();
  await page.locator('[data-test="setup-next"]').click();
  await expect(page.locator('[data-test="setup-text"]')).not.toHaveText(t1);
  await noHorizontalScroll(page, 'setup');
  // profil (průvodce v režimu úprav)
  await page.goto('./?demo&nointro');
  await page.locator('[data-test="profile-card"]').first().click();
  await page.locator('[data-test="tile-profile"]').click();
  await screen(page, 'new-player').waitFor();
  await noHorizontalScroll(page, 'profil');
  // rodiče
  await page.goto('./?nointro');
  await enterParent(page);
  await page.waitForTimeout(200);
  await noHorizontalScroll(page, 'parent');
  await expect(page.locator('[data-test="persist-status"]')).toContainText('Trvalé úložiště');
  expect(errors).toEqual([]);
});

test('nový hráč: průvodce vytvoří profil a vede na domovskou obrazovku', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./?nointro');
  await page.locator('[data-test="new-player"]').click();
  await page.locator('[data-test="name-input"]').fill('Testík');
  await page.locator('[data-test="wizard-next"]').click();       // věk
  await page.locator('[data-test="opt-age"] [data-value="9"]').click();
  await page.locator('[data-test="wizard-next"]').click();       // držení hole
  await page.locator('[data-test="grip-left"]').click();
  for (let i = 0; i < 5; i++) await page.locator('[data-test="wizard-next"]').click(); // → úroveň, délka, prostor, kužely, dres
  await page.locator('[data-test="jersey-input"]').fill('7');
  await page.locator('[data-test="wizard-done"]').click();
  await screen(page, 'home').waitFor();
  await expect(page.getByText('Testík')).toBeVisible();
  expect(errors).toEqual([]);
});

test('přehrávač: zrychleně projde 2 cviky, klepnutí pauzuje, update pruh čeká na konec tréninku', async ({ page }) => {
  const errors = watchErrors(page);
  await openDemoHome(page, '&fast=1');
  await page.locator('[data-test="start"]').click();
  await screen(page, 'setup').waitFor();
  await page.locator('[data-test="setup-skip"]').click();
  const pl = screen(page, 'player');
  await pl.waitFor();
  await expect(page.locator('[data-test="station-view"]')).toBeVisible();
  // nová verze během tréninku: pruh se neukáže
  await page.evaluate(() => window.__florbalTest.simulateUpdate());
  await expect(page.locator('[data-test="update-bar"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__florbalTest.isBusy())).toBe(true);
  // klepnutí kamkoli = pauza
  await expect(pl).toHaveAttribute('data-phase', /preview|countdown|play/);
  await page.mouse.click(200, 300);
  await expect(page.locator('[data-test="pause-overlay"]')).toBeVisible();
  const phaseAtPause = await pl.getAttribute('data-phase');
  const idxAtPause = await pl.getAttribute('data-drill-index');
  await page.waitForTimeout(1500);
  expect(await pl.getAttribute('data-phase')).toBe(phaseAtPause);
  expect(await pl.getAttribute('data-drill-index')).toBe(idxAtPause);
  await page.locator('[data-test="resume"]').click();
  await expect(page.locator('[data-test="pause-overlay"]')).toHaveCount(0);
  // projde 2 cviky (index 2 = třetí cvik)
  await expect(pl).toHaveAttribute('data-drill-index', /^[2-9]/, { timeout: 40_000 });
  await noHorizontalScroll(page, 'player');
  // ukončit → výsledek; pruh nové verze se ukáže až teď
  await page.mouse.click(200, 300);
  await page.locator('[data-test="stop"]').click();
  await screen(page, 'result').waitFor();
  await expect(page.locator('[data-test="result-xp"]')).toHaveText(/^\+[1-9]\d* XP$/);
  await expect(page.locator('[data-test="update-bar"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('záloha: export vytvoří JSON soubor a import ho načte zpět', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro');
  await screen(page, 'profiles').waitFor();
  await enterParent(page);
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-test="export"]').click()]);
  expect(download.suggestedFilename()).toMatch(/^florbal-zaloha-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath('zaloha.json');
  await download.saveAs(file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(data.app).toBe('florbal-trener');
  expect(data.data.profiles.map((p) => p.name)).toContain('Tonda Čepel');
  expect(data.data.history.length).toBeGreaterThan(0);
  // import: nejdřív smazat data, pak obnovit ze souboru
  await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('florbal'); r.onsuccess = () => { const tx = r.result.transaction(['profiles', 'history'], 'readwrite'); tx.objectStore('profiles').clear(); tx.objectStore('history').clear(); tx.oncomplete = res; }; }));
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-test="import"]').click()]);
  await chooser.setFiles(file);
  await page.locator('[data-test="import-confirm"]').click();
  await expect(page.locator('[data-test="backup-msg"]')).toContainText('obnovená');
  await page.goto('./?nointro');
  await expect(page.getByText('Tonda Čepel')).toBeVisible();
  expect(errors).toEqual([]);
});

test('PWA: manifest, service worker a běh offline', async ({ page, context }) => {
  const errors = watchErrors(page);
  const res = await page.request.get('./manifest.webmanifest');
  expect(res.ok()).toBeTruthy();
  const mf = await res.json();
  expect(mf.name).toBe('Florbal Trenér');
  expect(mf.lang).toBe('cs');
  expect(mf.display).toBe('standalone');
  expect(mf.icons.some((i) => i.purpose === 'maskable')).toBeTruthy();
  await page.goto('./?nointro');
  await screen(page, 'profiles').waitFor();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(async () => (await caches.keys()).length > 0 && (await (await caches.open((await caches.keys())[0])).keys()).length > 10);
  await context.setOffline(true);
  await page.reload();
  await screen(page, 'profiles').waitFor();
  await context.setOffline(false);
  expect(errors.filter((e) => !/ERR_INTERNET_DISCONNECTED/.test(e))).toEqual([]);
});
