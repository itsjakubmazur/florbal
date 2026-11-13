// Testy M4: souboj od začátku do konce s trefami, vlastní výzva bez fotky, odkliknutí kroku triku,
// test dovedností s rekordem a grafem, album karet, rychlé volby z domovské obrazovky. Běží pro všechny 3 viewporty.
import { test, expect } from '@playwright/test';

function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}
const T = (page, id) => page.locator(`[data-test="${id}"]`).first();
async function noHorizontalScroll(page, label) {
  const r = await page.evaluate(() => {
    const s = document.querySelector('#app > .screen');
    return { doc: document.documentElement.scrollWidth - window.innerWidth, screen: s ? s.scrollWidth - s.clientWidth : 0 };
  });
  expect(r.doc, `${label}: dokument je širší než okno`).toBeLessThanOrEqual(1);
  expect(r.screen, `${label}: obrazovka má vodorovný posun`).toBeLessThanOrEqual(1);
}
async function openArena(page) {
  await page.goto('./?demo&fast=1');
  await T(page, 'profiles').waitFor();
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await expect(T(page, 'daily-trick')).toContainText('Dnešní frajeřinka');
  await T(page, 'tile-arena').click();
  await T(page, 'arena').waitFor();
  await noHorizontalScroll(page, 'arena');
}

test('souboj táta vs. syn: trefy, zpět, výsledek, karta, historie a bilance', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-duels').click();
  await T(page, 'duels').waitFor();
  await noHorizontalScroll(page, 'duels');
  await T(page, 'ch-tycka').click();
  await T(page, 'duel-setup').waitFor();
  await noHorizontalScroll(page, 'duel-setup');
  for (let i = 0; i < 8; i++) await T(page, 'attempts-minus').click();
  await expect(T(page, 'attempts')).toContainText('2');
  await T(page, 'duel-start').click();
  await T(page, 'duel-safety').waitFor();
  await T(page, 'safety-ok').click();
  await T(page, 'duel-play').waitFor();
  await noHorizontalScroll(page, 'duel-play');
  await expect(T(page, 'turn')).toContainText('Táta');
  // Táta trefa → zpět → vedle
  await T(page, 'hit-0').click();
  await expect(T(page, 'score-0')).toHaveText('1');
  await T(page, 'undo').click();
  await expect(T(page, 'score-0')).toHaveText('0');
  await expect(T(page, 'hit-1')).toBeDisabled();
  await T(page, 'miss-0').click();
  await expect(T(page, 'turn')).toContainText('Tonda');
  await T(page, 'hit-1').click();
  await T(page, 'hit-0').click();
  await T(page, 'hit-1').click();
  await T(page, 'duel-result').waitFor();
  await expect(T(page, 'duel-result')).toContainText('Vyhrává Tonda Čepel');
  await expect(T(page, 'score-1')).toHaveText('2');
  await T(page, 'duel-done').click();
  await T(page, 'card-reveal').waitFor();
  await expect(T(page, 'card-reveal')).toContainText('Tyčkař');
  await T(page, 'card-reveal-ok').click();
  await T(page, 'duel-stats').waitFor();
  await expect(T(page, 'balance')).toContainText('0');
  await expect(T(page, 'balance')).toContainText('1');
  await expect(page.locator('[data-test="duel-row"]')).toHaveCount(1);
  await page.locator('[data-test="stats-tab"] [data-value="fame"]').click();
  await expect(T(page, 'fame-row')).toContainText('Gól od tyčky');
  await noHorizontalScroll(page, 'duel-stats');
  expect(errors).toEqual([]);
});

test('KOHOUT: písmena, celé slovo prohrává', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-duels').click();
  await T(page, 'ch-kohout').click();
  await T(page, 'duel-setup').waitFor();
  await page.locator('[data-test="word"] [data-value="KOZA"]').click();
  await T(page, 'duel-start').click();
  await T(page, 'safety-ok').click();
  await T(page, 'duel-play').waitFor();
  // Táta předvede, syn nezopakuje → písmeno; syn pak nepředvede → zase Táta. 4 písmena = KOZA
  for (let k = 0; k < 4; k++) {
    await expect(T(page, 'turn')).toContainText('Předvádí: Táta');
    await T(page, 'ok-0').click();
    await expect(T(page, 'turn')).toContainText('Opakuje');
    await T(page, 'fail-1').click();
    if (k < 3) { await expect(T(page, 'letters-1')).toBeVisible(); await T(page, 'fail-1').click(); }
  }
  await T(page, 'duel-result').waitFor();
  await expect(T(page, 'duel-result')).toContainText('Vyhrává Táta');
  await expect(T(page, 'duel-result')).toContainText('Odveta');
  expect(errors).toEqual([]);
});

test('vlastní výzva bez fotky: uložení, nastavení a sám proti rekordu', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-duels').click();
  await T(page, 'custom-new').click();
  await T(page, 'custom-form').waitFor();
  await noHorizontalScroll(page, 'custom-form');
  await T(page, 'cc-name').fill('Trefa do koše');
  await T(page, 'cc-rules').fill('Ze tří metrů do koše na prádlo.');
  await page.locator('[data-test="cc-format"] [data-value="do-x"]').click();
  await T(page, 'cc-save').click();
  await T(page, 'duel-setup').waitFor();
  await expect(page.locator('.title').first()).toContainText('Trefa do koše');
  await T(page, 'back').click();
  await T(page, 'duels').waitFor();
  await expect(page.getByText('Trefa do koše')).toBeVisible();
  // sám proti rekordu (Zápas)
  await page.goto('./?fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-match').click();
  await T(page, 'match').waitFor();
  await T(page, 'match-solo').click();
  await T(page, 'duels').waitFor();
  await page.getByText('Trefa do koše').click();
  await T(page, 'duel-setup').waitFor();
  await T(page, 'target-minus').click();
  await T(page, 'target-minus').click();
  await T(page, 'duel-start').click();
  await T(page, 'safety-ok').click();
  await T(page, 'hit-0').click();
  await T(page, 'duel-result').waitFor();
  await expect(T(page, 'duel-result')).toContainText('rekord');
  expect(errors).toEqual([]);
});

test('frajeřinky: odkliknutí kroku triku, postup a zamčený trik', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-tricks').click();
  await T(page, 'tricks').waitFor();
  await noHorizontalScroll(page, 'tricks');
  await expect(T(page, 'trick-zorro')).toHaveAttribute('data-state', 'locked');
  await T(page, 'trick-kolotoc').click();
  await T(page, 'trick').waitFor();
  await expect(T(page, 'station-view')).toBeVisible();
  const c1 = await T(page, 'criterion').textContent();
  await T(page, 'step-done').click();
  await expect(T(page, 'criterion')).not.toHaveText(c1);
  await noHorizontalScroll(page, 'trick');
  await T(page, 'back').click();
  await T(page, 'tricks').waitFor();
  await expect(T(page, 'trick-kolotoc')).toContainText('1/');
  expect(errors).toEqual([]);
});

test('test dovedností: odpočet, číselná klávesnice, rekord, graf a karta', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-tests').click();
  await T(page, 'skilltests').waitFor();
  await noHorizontalScroll(page, 'skilltests');
  await T(page, 'test-test-drag-20').click();
  await T(page, 'skilltest').waitFor();
  const run = async (digits) => {
    await T(page, 'test-start').click();
    await T(page, 'numpad-ok').waitFor({ timeout: 15000 });
    for (const d of digits) await T(page, `num-${d}`).click();
    await expect(T(page, 'numpad-display')).toHaveText(digits);
    await T(page, 'numpad-ok').click();
    await T(page, 'test-save').click();
    await T(page, 'test-result').waitFor();
  };
  await run('12');
  await expect(T(page, 'test-result')).toContainText('První rekord');
  await expect(T(page, 'test-record')).toHaveText('12');
  await T(page, 'test-again').click();
  await run('15');
  await expect(T(page, 'test-result')).toContainText('Nový rekord');
  await T(page, 'card-reveal').waitFor();
  await T(page, 'card-reveal-ok').click();
  await expect(T(page, 'test-record')).toHaveText('15');
  await expect(page.locator('[data-test="chart"] svg circle')).toHaveCount(2);
  await noHorizontalScroll(page, 'skilltest');
  expect(errors).toEqual([]);
});

test('album karet, detail karty a rychlé volby (rozcvička, reakce)', async ({ page }) => {
  const errors = watchErrors(page);
  await openArena(page);
  await T(page, 'arena-cards').click();
  await T(page, 'cards').waitFor();
  await expect(T(page, 'album-count')).toContainText(/0 z \d+/);
  await noHorizontalScroll(page, 'cards');
  await T(page, 'card-card-zorro').click();
  await T(page, 'card-detail').waitFor();
  await expect(T(page, 'card-detail')).toContainText('Jak ji získat');
  await T(page, 'card-close').click();
  await T(page, 'back').click();
  await T(page, 'back').click();
  await T(page, 'home').waitFor();
  await T(page, 'tile-warmup').click();
  await T(page, 'player').waitFor();
  await page.goto('./?fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-reaction').click();
  await T(page, 'setup').waitFor();
  expect(errors).toEqual([]);
});
