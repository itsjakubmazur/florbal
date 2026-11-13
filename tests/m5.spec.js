// Testy M5 (nezávislé QA): průchod všemi obrazovkami (konzole, vodorovný posun, síť jen localhost, dotykové plochy,
// kontrast), celý trénink zrychleně, offline včetně hlasových MP3 z precache, update flow se skutečným service workerem,
// wake lock, audio fronta (hlasy se nepřekrývají, záloha na hlas zařízení), záloha s fotkou a chybným souborem,
// zrcadlení pro leváky, čitelnost povelu, žádná data dítěte v kódu.
// Nálezy jsou v docs/QA.md (N1, N2 …); testy, které chybu ukazují, mají test.fail() s odkazem na nález.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname, '..');
const T = (page, id) => page.locator(`[data-test="${id}"]`).first();

function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  // WebKit: odchod ze stránky (page.goto) uprostřed tréninku pošle appku do pozadí, ta ohlásí pauzu a rozběhnuté
  // načítání MP3 se při unloadu zruší hláškou „… due to access control checks“. Jen artefakt navigace v testu.
  const unloadAbort = (m) => page.context().browser()?.browserType().name() === 'webkit' && /\.mp3 due to access control checks/.test(m);
  page.on('pageerror', (e) => { if (!unloadAbort(e.message)) errors.push(`pageerror: ${e.message}`); });
  return errors;
}
/** Všechny požadavky, které neodcházejí na localhost (data:, blob: jsou lokální). */
function watchExternal(context) {
  const ext = [];
  const check = (url) => { if (!/^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|data:|blob:|about:)/.test(url)) ext.push(url); };
  context.on('request', (r) => check(r.url()));
  return ext;
}
async function hScroll(page) {
  return page.evaluate(() => {
    const s = document.querySelector('#app > .screen');
    return Math.max(document.documentElement.scrollWidth - window.innerWidth, s ? s.scrollWidth - s.clientWidth : 0);
  });
}

/** Dotykové plochy podle docs/DESIGN.md: trénink (přehrávač) ≥ 88 px, obrazovky dítěte (.kid/.m4, včetně souboje) ≥ 64 px,
 *  jinde (rodiče, průvodce) ≥ 56 px. */
async function smallTargets(page) {
  return page.evaluate(() => {
    const scr = document.querySelector('#app > .screen');
    if (!scr) return [];
    const training = scr.matches('.player');
    const kid = scr.matches('.kid, .m4');
    const min = training ? 88 : kid ? 64 : 56;
    const out = [];
    for (const e of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]')) {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || e.closest('[aria-hidden="true"]')) continue;
      if (e.closest('.update-bar')) continue;
      const m = Math.min(r.width, r.height);
      if (m + 0.5 < min) out.push(`${(e.dataset.test || e.textContent.trim().slice(0, 24) || e.tagName)} ${Math.round(r.width)}×${Math.round(r.height)} (min ${min})`);
    }
    return out;
  });
}

/** Kontrast textu (WCAG 2.1): ≥ 4,5 : 1, velký text (≥ 24 px nebo ≥ 18,66 px tučně) ≥ 3 : 1. Pozadí = první neprůhledné
 *  pozadí předka (průhledné vrstvy se míchají). Prvky s obrázkem/gradientem v pozadí se přeskočí. */
async function lowContrast(page) {
  return page.evaluate(() => {
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
    function bgOf(el) {
      const layers = [];
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/^url\(/.test(cs.backgroundImage) && e !== document.body && e !== document.documentElement) return null;
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      }
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
      return bg;
    }
    const out = [];
    let checked = 0;
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el) || el.closest('svg')) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5 || r.bottom < 0 || r.top > innerHeight * 3) continue;
      let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
      if (o < 0.5) continue; // animace / záměrně skryté
      const fg = parse(cs.color); const bg = bgOf(el);
      if (!fg || !bg) continue;
      const f = blend(fg, bg);
      const L1 = lum(f); const L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      checked++;
      if (ratio + 0.01 < need) out.push(`"${n.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1 (min ${need}, ${Math.round(size)} px)`);
    }
    window.__contrastChecked = (window.__contrastChecked || 0) + checked;
    return out;
  });
}

/**
 * Projde všechny obrazovky appky (M3 i M4) s ukázkovým hráčem a na každé zavolá check(label).
 * ?fast=1 zrychlí časované fáze; trénink se jen spustí a pauzne (celý průchod má vlastní test).
 */
async function tour(page, check) {
  await page.goto('./?demo');
  await T(page, 'intro').waitFor();
  await check('intro');
  await T(page, 'profiles').waitFor({ timeout: 10000 });
  await check('profiles');
  await page.goto('./?demo&fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await expect(T(page, 'daily-trick')).toContainText('Dnešní frajeřinka');
  await check('home');
  const fromHome = async (tile, name, extra) => {
    await T(page, tile).click(); await T(page, name).waitFor(); await page.waitForTimeout(200);
    await check(name);
    if (extra) await extra();
    await page.goto('./?fast=1'); await page.locator('[data-test="profile-card"]').first().click(); await T(page, 'home').waitFor();
  };
  await fromHome('tile-drills', 'drills');
  await fromHome('tile-stations', 'stations', async () => {
    await T(page, 'station-zigzag').click(); await T(page, 'setup').waitFor(); await check('setup (návod)');
  });
  await fromHome('tile-rewards', 'rewards');
  await fromHome('tile-levels', 'levels');
  await fromHome('tile-profile', 'new-player');
  await fromHome('tile-match', 'match');
  await fromHome('tile-cards', 'cards', async () => {
    await T(page, 'card-card-zorro').click(); await T(page, 'card-detail').waitFor(); await check('card-detail');
  });
  await fromHome('tile-arena', 'arena', async () => {
    await T(page, 'arena-tricks').click(); await T(page, 'tricks').waitFor(); await check('tricks');
    await T(page, 'trick-kolotoc').click(); await T(page, 'trick').waitFor(); await check('trick');
    await T(page, 'back').click(); await T(page, 'back').click(); await T(page, 'arena').waitFor();
    await T(page, 'arena-tests').click(); await T(page, 'skilltests').waitFor(); await check('skilltests');
    await T(page, 'test-test-drag-20').click(); await T(page, 'skilltest').waitFor(); await check('skilltest');
    await T(page, 'test-start').click(); await T(page, 'test-timer').waitFor(); await check('skilltest (odpočet)');
    await T(page, 'numpad-ok').waitFor({ timeout: 15000 }); await check('skilltest (klávesnice)');
    await T(page, 'back').click(); await T(page, 'skilltests').waitFor();
    await T(page, 'back').click(); await T(page, 'arena').waitFor();
    await T(page, 'arena-duels').click(); await T(page, 'duels').waitFor(); await check('duels');
    await T(page, 'custom-new').click(); await T(page, 'custom-form').waitFor(); await check('custom-form');
    await T(page, 'back').click(); await T(page, 'duels').waitFor();
    await T(page, 'ch-tycka').click(); await T(page, 'duel-setup').waitFor(); await check('duel-setup');
    await T(page, 'duel-start').click(); await T(page, 'duel-safety').waitFor(); await check('duel-safety');
    await T(page, 'safety-ok').click(); await T(page, 'duel-play').waitFor(); await check('duel-play');
    await T(page, 'duel-quit').click(); await T(page, 'confirm-yes').click(); await T(page, 'duels').waitFor();
    await T(page, 'duel-stats').click(); await T(page, 'duel-stats').waitFor(); await check('duel-stats');
  });
  // rozcvička, reakce a protažení přes přehrávač
  for (const [tile, label] of [['tile-warmup', 'player (rozcvička)'], ['tile-stretch', 'player (protažení)']]) {
    await T(page, tile).click(); await T(page, 'player').waitFor(); await page.waitForTimeout(300);
    await check(label);
    await page.goto('./?fast=1'); await page.locator('[data-test="profile-card"]').first().click(); await T(page, 'home').waitFor();
  }
  await T(page, 'tile-reaction').click(); await T(page, 'setup').waitFor(); await check('setup (reakce)');
  await T(page, 'setup-skip').click(); await T(page, 'player').waitFor();
  await expect(T(page, 'player')).toHaveAttribute('data-phase', 'play', { timeout: 15000 });
  await check('player (reakce, hraj)');
  await page.mouse.click(200, 300); await T(page, 'pause-overlay').waitFor(); await check('player (pauza)');
  await T(page, 'stop').click(); await T(page, 'result').waitFor(); await page.waitForTimeout(300); await check('result');
  // rodiče
  await page.goto('./?fast=1');
  await T(page, 'parent').click();
  await page.locator('[data-test="set-pin"], [data-test="pin"]').first().waitFor();
  const fresh = await T(page, 'set-pin').count();
  await check(fresh ? 'set-pin' : 'pin');
  for (let k = 0; k < (fresh ? 2 : 1); k++) for (const d of '1234') await T(page, `key-${d}`).click();
  await T(page, 'parent').waitFor(); await page.waitForTimeout(200); await check('parent');
}

test('všechny obrazovky: bez chyb konzole, bez vodorovného posunu, nic neodchází mimo localhost', async ({ page, context }) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  const ext = watchExternal(context);
  const scroll = [];
  const visited = [];
  await tour(page, async (label) => { visited.push(label); const s = await hScroll(page); if (s > 1) scroll.push(`${label}: ${s} px`); });
  expect(visited.length).toBeGreaterThanOrEqual(30);
  expect(scroll, 'vodorovný posun').toEqual([]);
  expect(ext, 'požadavky mimo localhost').toEqual([]);
  expect(errors).toEqual([]);
});

test('dotykové plochy na všech obrazovkách (trénink ≥ 88 px, dítě ≥ 64 px, jinde ≥ 56 px)', async ({ page }) => {
  test.setTimeout(150_000);
  const bad = [];
  await tour(page, async (label) => { for (const b of await smallTargets(page)) bad.push(`${label}: ${b}`); });
  if (bad.length) console.log(`[${test.info().project.name}] malé dotykové plochy:\n  ${bad.join('\n  ')}`);
  expect(bad).toEqual([]);
});

test('kontrast textu na všech obrazovkách (WCAG AA)', async ({ page }) => {
  test.setTimeout(150_000);
  const bad = [];
  let checked = 0;
  await tour(page, async (label) => {
    for (const b of await lowContrast(page)) bad.push(`${label}: ${b}`);
    checked += await page.evaluate(() => { const n = window.__contrastChecked || 0; window.__contrastChecked = 0; return n; });
  });
  expect(checked, 'počet zkontrolovaných textů').toBeGreaterThan(300);
  if (bad.length) console.log(`[${test.info().project.name}] nízký kontrast:\n  ${bad.join('\n  ')}`);
  expect(bad).toEqual([]);
});

for (const theme of ['Neutrální', 'Vysoký kontrast']) {
  test(`kontrast textu v tématu ${theme} (WCAG AA)`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'ipad-landscape', 'barvy témat nezávisí na rozměru, stačí jeden viewport');
    test.setTimeout(150_000);
    await page.goto('./?nointro');
    await T(page, 'parent').click(); await T(page, 'set-pin').waitFor();
    for (let k = 0; k < 2; k++) for (const d of '1234') await T(page, `key-${d}`).click();
    await T(page, 'parent').waitFor();
    await page.getByRole('button', { name: theme, exact: true }).click();
    await page.waitForTimeout(300);
    const bad = []; const bgs = new Set();
    await tour(page, async (label) => {
      bgs.add((await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg'))).trim().toLowerCase());
      for (const b of await lowContrast(page)) bad.push(`${label}: ${b}`);
    });
    expect([...bgs], 'téma platí na všech obrazovkách').toEqual([theme === 'Neutrální' ? '#121315' : '#000000']);
    if (bad.length) console.log(`[${theme}] nízký kontrast:\n  ${bad.join('\n  ')}`);
    expect(bad).toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Přehrávač: celý trénink zrychleně, čitelnost povelu, pauza při odchodu appky do pozadí
// ---------------------------------------------------------------------------------------------------------------

/** Ve stránce: přepínatelný document.visibilityState (Playwright neumí appku poslat do pozadí). */
const VISIBILITY_STUB = () => {
  window.__vis = 'visible';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => window.__vis });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__vis === 'hidden' });
  window.__setVis = (v) => { window.__vis = v; document.dispatchEvent(new Event('visibilitychange')); };
};

async function startWorkout(page, extra = '') {
  await page.goto(`./?demo&fast=1${extra}`);
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await T(page, 'start').click();
  await T(page, 'setup').waitFor();
  await T(page, 'setup-skip').click();
  await T(page, 'player').waitFor();
}

test('přehrávač projde celým tréninkem zrychleně a výsledek započítá všechny cviky', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = watchErrors(page);
  await startWorkout(page);
  const pl = T(page, 'player');
  const total = Number(await pl.getAttribute('data-total'));
  expect(total).toBeGreaterThanOrEqual(5);
  // čitelnost ze 3 m (SPEC 6): název cviku ≥ 5 vh, povel (písmeno F/B, číslo kuželu) ≥ 18 vh; měří se průběžně
  const seen = { name: [], letter: [], cone: [] };
  const phases = new Set();
  const t0 = Date.now();
  while (Date.now() - t0 < 200_000) {
    if (await T(page, 'result').count()) break;
    const m = await page.evaluate(() => {
      const vh = innerHeight / 100;
      const p = document.querySelector('[data-test="player"]'); if (!p) return null;
      const name = document.querySelector('.player-name');
      const cb = document.querySelector('.call-big');
      const out = { phase: p.dataset.phase, idx: p.dataset.drillIndex, name: name && name.textContent && p.dataset.phase === 'preview' ? parseFloat(getComputedStyle(name).fontSize) / vh : null };
      if (cb && getComputedStyle(cb).display !== 'none') {
        if (cb.dataset.kind === 'fh' || cb.dataset.kind === 'bh') out.letter = parseFloat(getComputedStyle(cb).fontSize) / vh;
        const t = cb.querySelector('svg text');
        if (t && t.textContent && !cb.getAnimations().length) out.cone = t.getBoundingClientRect().height / vh;
      }
      return out;
    });
    if (m) {
      phases.add(m.phase);
      if (m.name) seen.name.push(m.name);
      if (m.letter) seen.letter.push(m.letter);
      if (m.cone) seen.cone.push(m.cone);
    }
    await page.waitForTimeout(150);
  }
  await T(page, 'result').waitFor({ timeout: 5000 });
  await expect(T(page, 'result')).toContainText(`${total} z ${total} cviků`);
  await expect(T(page, 'result')).toContainText('Trénink dokončen');
  expect([...phases]).toEqual(expect.arrayContaining(['preview', 'countdown', 'play', 'rest']));
  const min = (a) => (a.length ? Math.min(...a) : null);
  test.info().annotations.push({ type: 'čitelnost', description: `název ${min(seen.name)?.toFixed(1)} vh, písmeno ${min(seen.letter)?.toFixed(1)} vh, číslo kuželu ${min(seen.cone)?.toFixed(1)} vh` });
  console.log(`[${test.info().project.name}] čitelnost: název ${min(seen.name)?.toFixed(1)} vh, písmeno F/B ${min(seen.letter)?.toFixed(1)} vh, číslo kuželu ${min(seen.cone)?.toFixed(1)} vh`);
  expect(seen.name.length).toBeGreaterThan(0);
  expect(min(seen.name), 'název cviku ≥ 5 vh').toBeGreaterThanOrEqual(5);
  // povel F/B: SPEC 18 vh platí pro iPad na šířku (148 px); na výšku se drží stejná absolutní velikost (DESIGN: 16 vh)
  const vh = page.viewportSize().height / 100;
  if (seen.letter.length && test.info().project.name.startsWith('ipad')) expect(min(seen.letter) * vh, 'povel F/B ≥ 148 px (18 vh iPadu na šířku)').toBeGreaterThanOrEqual(147);
  // číslo v piktogramu kuželu (měřeno mimo nástupovou animaci): na šířku ≥ 18 vh, na výšku stejná absolutní velikost (N4, opraveno)
  if (seen.cone.length && test.info().project.name === 'ipad-landscape') expect(min(seen.cone), 'číslo kuželu ≥ 18 vh').toBeGreaterThanOrEqual(18);
  if (seen.cone.length && test.info().project.name === 'ipad-portrait') expect(min(seen.cone) * vh, 'číslo kuželu ≥ 148 px').toBeGreaterThanOrEqual(147);
  expect(errors).toEqual([]);
});

test('appka do pozadí během tréninku → pauza; v pauze se čas nehýbe', async ({ page }) => {
  await page.addInitScript(VISIBILITY_STUB);
  const errors = watchErrors(page);
  await startWorkout(page);
  const pl = T(page, 'player');
  await expect(pl).toHaveAttribute('data-phase', /countdown|play/, { timeout: 15000 });
  await page.evaluate(() => window.__setVis('hidden'));
  await expect(T(page, 'pause-overlay')).toBeVisible();
  const ph = await pl.getAttribute('data-phase');
  const timer = await page.locator('.player-timer').textContent();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__setVis('visible'));
  await page.waitForTimeout(500);
  expect(await pl.getAttribute('data-phase')).toBe(ph);
  expect(await page.locator('.player-timer').textContent()).toBe(timer);
  await expect(T(page, 'pause-overlay')).toBeVisible(); // po návratu zůstává pauza, dítě klepne Pokračovat
  await T(page, 'resume').click();
  await expect(T(page, 'pause-overlay')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Wake lock
// ---------------------------------------------------------------------------------------------------------------

/** Ve stránce: náhrada navigator.wakeLock, která zapisuje požadavky a uvolnění do window.__wl. */
const WAKELOCK_STUB = () => {
  window.__wl = { requests: 0, releases: 0, active: 0, sentinels: [] };
  const fake = {
    request: async (type) => {
      if (type !== 'screen') throw new Error('typ');
      window.__wl.requests++; window.__wl.active++;
      const ls = [];
      const s = {
        released: false, type,
        addEventListener: (ev, fn) => { if (ev === 'release') ls.push(fn); },
        release: async () => { if (s.released) return; s.released = true; window.__wl.releases++; window.__wl.active--; ls.forEach((f) => f()); },
        _systemRelease: () => { if (s.released) return; s.released = true; window.__wl.active--; ls.forEach((f) => f()); },
      };
      window.__wl.sentinels.push(s);
      return s;
    },
  };
  Object.defineProperty(Navigator.prototype, 'wakeLock', { configurable: true, get: () => fake });
};
const wl = (page) => page.evaluate(() => ({ requests: window.__wl.requests, releases: window.__wl.releases, active: window.__wl.active }));

test('wake lock: zapne se s tréninkem, obnoví po návratu z pozadí a uvolní po konci; totéž v souboji', async ({ page }) => {
  await page.addInitScript(WAKELOCK_STUB);
  await page.addInitScript(VISIBILITY_STUB);
  const errors = watchErrors(page);
  await startWorkout(page);
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(1);
  // systém zámek uvolní při odchodu do pozadí; po návratu ho appka musí znovu vyžádat
  await page.evaluate(() => { window.__setVis('hidden'); window.__wl.sentinels.at(-1)._systemRelease(); });
  expect((await wl(page)).active).toBe(0);
  await page.evaluate(() => window.__setVis('visible'));
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(1);
  await T(page, 'stop').click(); // appka je po návratu v pauze, rovnou Konec
  await T(page, 'result').waitFor();
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(0);
  // po tréninku se zámek nesmí znovu zapnout návratem do appky
  await page.evaluate(() => { window.__setVis('hidden'); window.__setVis('visible'); });
  await page.waitForTimeout(300);
  expect((await wl(page)).active).toBe(0);
  // souboj
  await page.goto('./?fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-arena').click(); await T(page, 'arena-duels').click(); await T(page, 'ch-tycka').click();
  await T(page, 'duel-start').click(); await T(page, 'safety-ok').click(); await T(page, 'duel-play').waitFor();
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(1);
  await T(page, 'duel-quit').click(); await T(page, 'confirm-yes').click(); await T(page, 'duels').waitFor();
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(0);
  expect(errors).toEqual([]);
});

test('wake lock: pauza a Pokračovat nenechá po tréninku viset zámek (N1)', async ({ page }) => {
  await page.addInitScript(WAKELOCK_STUB);
  await startWorkout(page);
  await expect.poll(() => wl(page).then((w) => w.active)).toBe(1);
  await page.mouse.click(200, 300); await T(page, 'resume').click();
  await page.mouse.click(200, 300); await T(page, 'stop').click();
  await T(page, 'result').waitFor();
  await page.waitForTimeout(500);
  const w = await wl(page);
  expect(w.active, `po tréninku drží appka ${w.active} zámek (vyžádáno ${w.requests}, uvolněno ${w.releases})`).toBe(0);
});

test('wake lock bez API: záloha tichým videem (playsinline, muted, loop) se spustí a po tréninku zastaví', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'wakeLock', { configurable: true, get: () => undefined }); delete Navigator.prototype.wakeLock; });
  const errors = watchErrors(page);
  await startWorkout(page);
  const v = page.locator('video[playsinline][loop]');
  await expect(v).toHaveCount(1);
  await expect.poll(() => v.evaluate((e) => e.muted && !e.paused)).toBe(true);
  await page.mouse.click(200, 300);
  await T(page, 'stop').click();
  await T(page, 'result').waitFor();
  await expect.poll(() => v.evaluate((e) => e.paused)).toBe(true);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Audio fronta: hlasy se nepřekrývají, záloha na hlas zařízení
// ---------------------------------------------------------------------------------------------------------------

/** Ve stránce: zapisuje přehrané hlasové buffery (AudioBufferSourceNode delší než 0,25 s) a promluvy speechSynthesis. */
const AUDIO_SPY = () => {
  window.__voice = [];
  const st = AudioBufferSourceNode.prototype.start; const sp = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (this.buffer && this.buffer.duration > 0.25) { this.__rec = { t: this.context.currentTime, end: this.context.currentTime + this.buffer.duration, dur: this.buffer.duration }; window.__voice.push(this.__rec); }
    return st.apply(this, a);
  };
  AudioBufferSourceNode.prototype.stop = function (...a) { if (this.__rec) this.__rec.end = Math.min(this.__rec.end, this.context.currentTime); return sp.apply(this, a); };
  // speechSynthesis: promluva „trvá“ 600 ms, pak onend
  window.__tts = []; let cur = null;
  const fin = (u) => { if (u.__done) return; u.__done = true; const r = window.__tts.find((x) => x.u === u); if (r) r.end = performance.now(); if (cur === u) cur = null; u.onend && u.onend(); };
  const fake = {
    speak(u) { if (!u.text.trim()) return; window.__tts.push({ u, text: u.text, lang: u.lang, t: performance.now(), overlap: !!cur }); cur = u; setTimeout(() => fin(u), 600); },
    cancel() { if (cur) fin(cur); }, getVoices: () => [], addEventListener() {}, speaking: false, pending: false,
  };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => fake });
};
const overlaps = (list) => {
  const s = [...list].sort((a, b) => a.t - b.t); const bad = [];
  for (let i = 1; i < s.length; i++) if (s[i].t < s[i - 1].end - 0.03) bad.push(`${s[i - 1].t.toFixed(2)}–${s[i - 1].end.toFixed(2)} × ${s[i].t.toFixed(2)}`);
  return bad;
};

test('audio: hlášky z MP3 se v tréninku nepřekrývají a nepadají na hlas zařízení', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(AUDIO_SPY);
  const errors = watchErrors(page);
  await startWorkout(page);
  const pl = T(page, 'player');
  // dva cviky naplno: pauza a pokračování uprostřed (pauza hlášku explicitně utne, to je v pořádku)
  await expect(pl).toHaveAttribute('data-phase', 'play', { timeout: 20000 });
  await page.mouse.click(200, 300); await page.waitForTimeout(400); await T(page, 'resume').click();
  await expect(pl).toHaveAttribute('data-drill-index', /^[2-9]/, { timeout: 60_000 });
  const v = await page.evaluate(() => window.__voice);
  const tts = await page.evaluate(() => window.__tts.map((x) => x.text));
  expect(v.length, 'přehrané hlasové MP3').toBeGreaterThanOrEqual(5);
  expect(overlaps(v), 'překrývající se hlášky').toEqual([]);
  expect(tts, 'hlas zařízení (záloha) v tréninku').toEqual([]);
  expect(errors).toEqual([]);
});

test('audio: když MP3 chybí, mluví hlas zařízení česky a promluvy se nepřekrývají', async ({ browser }, testInfo) => {
  test.setTimeout(90_000);
  const context = await browser.newContext({ ...testInfo.project.use, baseURL: 'http://localhost:4173/', serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.route(/\/assets\/.*\.(mp3|wav)(\?.*)?$/, (r) => r.fulfill({ status: 404, body: '' }));
  await page.addInitScript(AUDIO_SPY);
  const errors = watchErrors(page);
  await startWorkout(page);
  await expect(T(page, 'player')).toHaveAttribute('data-drill-index', /^[1-9]/, { timeout: 60_000 });
  const tts = await page.evaluate(() => window.__tts.map(({ text, lang, overlap }) => ({ text, lang, overlap })));
  const v = await page.evaluate(() => window.__voice);
  expect(v, 'žádné MP3 se nepřehrálo').toEqual([]);
  expect(tts.length).toBeGreaterThanOrEqual(3);
  expect(tts.every((x) => x.lang === 'cs-CZ')).toBe(true);
  expect(tts.filter((x) => x.overlap), 'promluva začala, když jiná ještě zněla').toEqual([]);
  expect(tts.some((x) => /[ěščřžýáíéů]/i.test(x.text))).toBe(true);
  // 404 na MP3 se v konzoli objeví jako chyba načtení zdroje – to je záměr testu
  expect(errors.filter((e) => !/404|Failed to load resource/.test(e))).toEqual([]);
  await context.close();
});

// ---------------------------------------------------------------------------------------------------------------
// Offline po první návštěvě (service worker, precache včetně všech hlasových MP3)
// ---------------------------------------------------------------------------------------------------------------

const VOICE_FILES = fs.readdirSync(path.join(ROOT, 'assets/audio/voice/trener')).filter((f) => /\.(mp3|wav)$/.test(f));

async function installSW(page) {
  await page.goto('./?demo&nointro');
  await T(page, 'profiles').waitFor();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  // precache je hotový, až je aktivní worker a v cache jsou všechny soubory (hlasy jsou největší část)
  await page.waitForFunction(async (n) => {
    let c = 0; for (const k of await caches.keys()) c += (await (await caches.open(k)).keys()).filter((r) => /\.(mp3|wav)/.test(r.url)).length;
    return c >= n;
  }, VOICE_FILES.length, { timeout: 60_000, polling: 500 });
  await page.reload(); // clientsClaim: false → stránku začne řídit worker až po novém načtení
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}

test('offline: po první návštěvě naběhne bez sítě, všechny hlasové MP3 jsou v precache a trénink mluví z cache', async ({ page, context }) => {
  test.setTimeout(150_000);
  expect(VOICE_FILES.length).toBe(370); // fráze, cviky, návody stanovišť (i zrcadlené), triky, výzvy, testy
  await page.addInitScript(AUDIO_SPY);
  const errors = watchErrors(page);
  await installSW(page);
  await context.setOffline(true);
  await page.reload();
  await T(page, 'profiles').waitFor();
  // každý hlasový soubor jde načíst offline přes service worker a dekódovat
  const res = await page.evaluate(async () => {
    const urls = [];
    for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) if (/\.(mp3|wav)/.test(r.url)) urls.push(r.url);
    const ac = new AudioContext();
    let ok = 0; let decoded = 0; const bad = [];
    for (const [i, u] of urls.entries()) {
      try {
        const r = await fetch(u); const ab = await r.arrayBuffer();
        if (r.ok && ab.byteLength > 500) ok++; else bad.push(u);
        if (i % 20 === 0) { await ac.decodeAudioData(ab); decoded++; }
      } catch (e) { bad.push(`${u}: ${e.message}`); }
    }
    return { n: urls.length, ok, decoded, bad };
  });
  expect(res.bad).toEqual([]);
  expect(res.n).toBe(VOICE_FILES.length);
  expect(res.ok).toBe(VOICE_FILES.length);
  expect(res.decoded).toBeGreaterThan(10);
  // trénink offline: hlášky jdou z precache (AudioBuffer), ne z hlasu zařízení
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await T(page, 'start').click(); await T(page, 'setup-skip').click();
  await expect(T(page, 'player')).toHaveAttribute('data-phase', 'play', { timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.__voice.length), { timeout: 15000 }).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(() => window.__tts.length)).toBe(0);
  await context.setOffline(false);
  expect(errors.filter((e) => !/ERR_INTERNET_DISCONNECTED/.test(e))).toEqual([]);
});

test('offline: M4 obrazovky (souboje, triky, testy, karty) fungují bez sítě', async ({ page, context }) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  await installSW(page);
  await context.setOffline(true);
  await page.goto('./?fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await T(page, 'tile-arena').click(); await T(page, 'arena').waitFor();
  for (const [b, s] of [['arena-duels', 'duels'], ['arena-tricks', 'tricks'], ['arena-tests', 'skilltests'], ['arena-cards', 'cards']]) {
    await T(page, b).click(); await T(page, s).waitFor(); await T(page, 'back').click(); await T(page, 'arena').waitFor();
  }
  await context.setOffline(false);
  expect(errors.filter((e) => !/ERR_INTERNET_DISCONNECTED/.test(e))).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Update flow se skutečným service workerem: nová verze se během tréninku nenainstaluje ani neukáže
// ---------------------------------------------------------------------------------------------------------------

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.ico': 'image/x-icon' };
/** Statický server nad dist/, kde jde „nasadit novou verzi“ (změní se obsah sw.js). */
function distServer() {
  const dist = path.join(ROOT, 'dist');
  const state = { version: 1 };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(dist, p);
    if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(f);
    if (p === '/sw.js' && state.version > 1) body = Buffer.concat([body, Buffer.from(`\n// nová verze ${state.version}\n`)]);
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(body);
  });
  return new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve({ url: `http://localhost:${srv.address().port}/`, state, close: () => new Promise((r) => srv.close(r)) })));
}

test('update flow (skutečný SW): nová verze během tréninku čeká, pruh se ukáže až po něm a Aktualizovat ji nasadí', async ({ browser }, testInfo) => {
  test.setTimeout(150_000);
  const srv = await distServer();
  const context = await browser.newContext({ ...testInfo.project.use, baseURL: srv.url });
  const page = await context.newPage();
  const errors = watchErrors(page);
  try {
    await page.goto('./?demo&nointro');
    await T(page, 'profiles').waitFor();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const swBefore = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).active.scriptURL);
    // trénink běží
    await page.goto('./?fast=1');
    await page.locator('[data-test="profile-card"]').first().click();
    await T(page, 'start').click(); await T(page, 'setup-skip').click();
    await T(page, 'player').waitFor();
    // nasazení nové verze a kontrola aktualizací (appka ji dělá při návratu do popředí a jednou za hodinu)
    srv.state.version = 2;
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting, null, { timeout: 60_000 });
    await page.waitForTimeout(1500);
    await expect(T(page, 'update-bar')).toHaveCount(0);
    expect(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting), 'nová verze se nesmí aktivovat sama').toBe(true);
    await expect(T(page, 'player')).toBeVisible(); // žádný reload uprostřed tréninku
    // konec tréninku → pruh
    await page.mouse.click(200, 300); await T(page, 'stop').click();
    await T(page, 'result').waitFor();
    await expect(T(page, 'update-bar')).toBeVisible();
    await expect(T(page, 'update-bar')).toContainText('nová verze');
    // Aktualizovat → reload s novým workerem, pruh zmizí
    await Promise.all([page.waitForEvent('load', { timeout: 30_000 }), T(page, 'update-bar').locator('button', { hasText: 'Aktualizovat' }).click()]);
    await page.waitForFunction(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && !r.waiting && !!navigator.serviceWorker.controller; }, null, { timeout: 30_000 });
    await expect(T(page, 'update-bar')).toHaveCount(0);
    expect(swBefore).toContain('sw.js');
  } finally {
    await context.close();
    await srv.close();
  }
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Záloha: fotka přežije export/import, „bez fotek“, chybný soubor nic nesmaže
// ---------------------------------------------------------------------------------------------------------------

async function enterParent(page) {
  await T(page, 'parent').click();
  await T(page, 'set-pin').waitFor();
  for (let k = 0; k < 2; k++) for (const d of '1234') await T(page, `key-${d}`).click();
  await T(page, 'parent').waitFor();
}
const idb = (page, fn, arg) => page.evaluate(([src, a]) => new Promise((res, rej) => {
  const r = indexedDB.open('florbal');
  r.onsuccess = () => { try { Promise.resolve(new Function('db', 'arg', src)(r.result, a)).then(res, rej); } catch (e) { rej(e); } };
  r.onerror = () => rej(r.error);
}), [fn, arg]);

test('záloha: fotka (Blob) projde exportem a importem, „Bez fotek“ ji vynechá, všechny stores jsou v souboru', async ({ page, browserName }, testInfo) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit běží jako soukromé okno: IndexedDB v něm neumí uložit Blob (UnknownError), viz docs/QA.md');
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro');
  await T(page, 'profiles').waitFor();
  // fotka 1×1 PNG v media + vlastní výzva, která na ni odkazuje
  await idb(page, `return new Promise((res) => {
    const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
    const tx = db.transaction(['media', 'customChallenges'], 'readwrite');
    tx.objectStore('media').put({ id: 'ph-test', kind: 'photo', mime: 'image/png', blob: new Blob([png], { type: 'image/png' }), w: 1, h: 1, createdAt: 1 });
    tx.objectStore('customChallenges').put({ id: 'cc-test', name: 'Testovací výzva', rules: 'Pravidla', format: 'pokusy', scoring: 'trefy', photoTarget: 'ph-test' });
    tx.oncomplete = () => res(true);
    tx.onerror = () => res('chyba IndexedDB: ' + (tx.error && tx.error.message));
  })`).then((r) => expect(r).toBe(true));
  await enterParent(page);
  const [d1] = await Promise.all([page.waitForEvent('download'), T(page, 'export').click()]);
  const full = testInfo.outputPath('full.json'); await d1.saveAs(full);
  const [d2] = await Promise.all([page.waitForEvent('download'), T(page, 'export-nomedia').click()]);
  const lite = testInfo.outputPath('lite.json'); await d2.saveAs(lite);
  const F = JSON.parse(fs.readFileSync(full, 'utf8')); const L = JSON.parse(fs.readFileSync(lite, 'utf8'));
  expect(Object.keys(F.data).sort()).toEqual(['customChallenges', 'duels', 'history', 'media', 'profiles', 'records', 'settings', 'tricks']);
  expect(F.data.media).toHaveLength(1);
  expect(F.data.media[0].blob).toMatch(/^data:image\/png;base64,/);
  expect(L.data.media).toEqual([]);
  expect(L.withMedia).toBe(false);
  // smazat vše a obnovit plnou zálohu → fotka je zase Blob
  await idb(page, `return new Promise((res) => { const names = [...db.objectStoreNames]; const tx = db.transaction(names, 'readwrite'); names.forEach((n) => tx.objectStore(n).clear()); tx.oncomplete = () => res(true); })`);
  const [ch] = await Promise.all([page.waitForEvent('filechooser'), T(page, 'import').click()]);
  await ch.setFiles(full);
  await T(page, 'import-confirm').click();
  await expect(T(page, 'backup-msg')).toContainText('obnovená');
  const m = await idb(page, `return new Promise((res) => { const g = db.transaction('media').objectStore('media').get('ph-test'); g.onsuccess = async () => { const r = g.result; res(r && { isBlob: r.blob instanceof Blob, size: r.blob.size, type: r.blob.type, extra: '_blob' in r }); }; })`);
  expect(m).toEqual({ isBlob: true, size: 70, type: 'image/png', extra: false });
  expect(errors).toEqual([]);
});

test('záloha: chybný nebo cizí soubor ukáže českou chybu a data nesmaže', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro');
  await T(page, 'profiles').waitFor();
  await enterParent(page);
  const cases = [
    ['rozbita.json', '{ tohle není json', 'nejde přečíst'],
    ['cizi.json', JSON.stringify({ app: 'jina-appka', data: {} }), 'Tohle není záloha Florbal Trenéra'],
    ['novejsi.json', JSON.stringify({ app: 'florbal-trener', format: 99, data: {} }), 'novější verze'],
  ];
  for (const [name, body, msg] of cases) {
    const f = testInfo.outputPath(name); fs.writeFileSync(f, body);
    const [ch] = await Promise.all([page.waitForEvent('filechooser'), T(page, 'import').click()]);
    await ch.setFiles(f);
    await expect(T(page, 'backup-msg')).toContainText(msg);
    await expect(T(page, 'import-confirm')).toHaveCount(0);
  }
  await page.goto('./?nointro');
  await expect(page.getByText('Tonda Čepel')).toBeVisible();
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Zrcadlení pro leváky
// ---------------------------------------------------------------------------------------------------------------

async function addPlayer(page, name, grip) {
  await page.goto('./?nointro');
  await T(page, 'new-player').click();
  await T(page, 'name-input').fill(name);
  await T(page, 'wizard-next').click();
  await T(page, 'wizard-next').click();
  await T(page, `grip-${grip}`).click();
  for (let i = 0; i < 5; i++) await T(page, 'wizard-next').click();
  await T(page, 'wizard-done').click();
  await T(page, 'home').waitFor();
}
/** Návod na trojúhelník: x-pozice kuželů na obrazovce, text 3. kroku a klíč nahrávky, kterou appka načetla. */
async function triangleFor(page, playerName) {
  const voiceReq = [];
  const onReq = (r) => { const m = /setup_triangle(_m)?_\d+/.exec(r.url()); if (m) voiceReq.push(m[0]); };
  page.on('request', onReq);
  await page.goto('./?nointro');
  await page.locator('[data-test="profile-card"]', { hasText: playerName }).click();
  await T(page, 'tile-stations').click();
  await T(page, 'station-triangle').click();
  await T(page, 'setup').waitFor();
  await T(page, 'setup-next').click(); await T(page, 'setup-next').click();
  await page.waitForTimeout(400);
  const xs = await page.evaluate(() => {
    const sv = document.querySelector('[data-test="setup"] [data-test="station-view"]');
    const x = (n) => { const r = sv.querySelector(`[data-cone="${n}"]`).getBoundingClientRect(); return r.left + r.width / 2; };
    return { c1: x(1), c2: x(2), c3: x(3) };
  });
  const text = await T(page, 'setup-text').textContent();
  page.off('request', onReq);
  return { ...xs, text, voiceReq };
}

test('levák: stanoviště se zrcadlí (kužely vyměněné stranou, zrcadlená nahrávka _m)', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro'); await T(page, 'profiles').waitFor(); // Tonda Čepel = levák
  await addPlayer(page, 'Pravák Test', 'right');
  const R = await triangleFor(page, 'Pravák Test');
  const L = await triangleFor(page, 'Tonda Čepel');
  expect(R.c1, 'pravák: červený kužel 1 vlevo od modrého 2').toBeLessThan(R.c2);
  expect(L.c1, 'levák: kužel 1 vpravo od kuželu 2').toBeGreaterThan(L.c2);
  expect(Math.abs(L.c3 - R.c3)).toBeLessThan(2); // prostřední kužel zůstává uprostřed
  expect(R.voiceReq.every((k) => !k.includes('_m_'))).toBe(true);
  expect(L.voiceReq.length).toBeGreaterThan(0);
  expect(L.voiceReq.every((k) => k.includes('_m_'))).toBe(true);
  expect(errors).toEqual([]);
});

test('levák: návod na stanoviště říká „doprava“ tam, kde pravák má „doleva“ (N3)', async ({ page }) => {
  await page.goto('./?demo&nointro'); await T(page, 'profiles').waitFor();
  await addPlayer(page, 'Pravák Test', 'right');
  const R = await triangleFor(page, 'Pravák Test');
  const L = await triangleFor(page, 'Tonda Čepel');
  expect(R.text).toContain('doleva');
  expect(L.text, 'levák má červený kužel vpravo, text ho posílá doleva').toContain('doprava');
  expect(L.text).not.toContain('doleva');
});

test('levák: funkce zrcadlení v kódu i v generátoru hlasů neobsahuje řídicí znaky (N3)', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'ipad-landscape', 'statická kontrola, stačí jednou');
  const bad = [];
  for (const f of ['src/domain/stations.js', 'scripts/gen-voices.mjs']) {
    fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((l, i) => { if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(l)) bad.push(`${f}:${i + 1}`); });
  }
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Soukromí: žádná data dítěte natvrdo, demo jen na ?demo
// ---------------------------------------------------------------------------------------------------------------

test('soukromí: bez ?demo žádný hráč, demo modul se nenačte, build neobsahuje cesty ani e-maily', async ({ page }) => {
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto('./?nointro');
  await T(page, 'profiles').waitFor();
  await page.waitForTimeout(300);
  await expect(page.locator('[data-test="profile-card"]')).toHaveCount(0);
  expect(reqs.filter((u) => /demo-.*\.js/.test(u)), 'demo modul bez ?demo').toEqual([]);
  const profiles = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('florbal'); r.onsuccess = () => { const g = r.result.transaction('profiles').objectStore('profiles').getAll(); g.onsuccess = () => res(g.result.length); }; }));
  expect(profiles).toBe(0);
  // build: žádné absolutní cesty z vývojového stroje, e-maily ani zdrojové mapy
  const files = fs.readdirSync(path.join(ROOT, 'dist/assets')).filter((f) => /\.(js|css|html)$/.test(f)).map((f) => path.join(ROOT, 'dist/assets', f));
  files.push(path.join(ROOT, 'dist/index.html'), path.join(ROOT, 'dist/sw.js'));
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    expect(s, f).not.toMatch(/\/Users\/|\/home\/[a-z]/);
    expect(s, f).not.toMatch(/[\w.+-]+@(gmail|seznam|email|centrum|icloud|outlook)\.[a-z]+/i);
  }
  expect(fs.readdirSync(path.join(ROOT, 'dist/assets')).filter((f) => f.endsWith('.map'))).toEqual([]);
  // jediné místo s natvrdo zadaným hráčem je smyšlené demo
  const hits = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name) && /createProfile\(\{/.test(fs.readFileSync(p, 'utf8'))) hits.push(path.relative(ROOT, p)); } };
  walk(path.join(ROOT, 'src'));
  expect(hits).toEqual(['src/dev/demo.js']);
});

// ---------------------------------------------------------------------------------------------------------------
// Update pruh během souboje a testu dovedností
// ---------------------------------------------------------------------------------------------------------------

test('update pruh se neukáže během souboje ani během měření testu, po nich ano', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./?demo&fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-arena').click(); await T(page, 'arena-duels').click(); await T(page, 'ch-tycka').click();
  await T(page, 'duel-start').click(); await T(page, 'safety-ok').click(); await T(page, 'duel-play').waitFor();
  await page.evaluate(() => window.__florbalTest.simulateUpdate());
  await expect(T(page, 'update-bar')).toHaveCount(0);
  expect(await page.evaluate(() => window.__florbalTest.isBusy())).toBe(true);
  await T(page, 'duel-quit').click(); await T(page, 'confirm-yes').click(); await T(page, 'duels').waitFor();
  await expect(T(page, 'update-bar')).toBeVisible();
  // test dovedností: během odpočtu a měření ne
  await page.goto('./?fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await page.evaluate(() => window.__florbalTest.simulateUpdate());
  await T(page, 'tile-tests').click(); await T(page, 'test-test-drag-20').click(); await T(page, 'skilltest').waitFor();
  await expect(T(page, 'update-bar')).toBeVisible();
  await T(page, 'test-start').click(); await T(page, 'test-timer').waitFor();
  await expect(T(page, 'update-bar')).toHaveCount(0);
  await T(page, 'numpad-ok').waitFor({ timeout: 15000 });
  await expect(T(page, 'update-bar')).toBeVisible(); // měření skončilo, zadávání výsledku už není „trénink“
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// Obsah: každá hláška Trenéra má nahrávku (jinak mluví hlas zařízení jiným hlasem)
// ---------------------------------------------------------------------------------------------------------------

test('hlasy: každá hláška Trenéra (fráze, cviky, návody, triky, výzvy, testy) má MP3 (N2)', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'ipad-landscape', 'statická kontrola obsahu, stačí jednou');
  const files = new Set(VOICE_FILES.map((f) => f.replace(/\.(mp3|wav)$/, '')));
  const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content', f), 'utf8'));
  const keys = [];
  const ph = read('phrases.json');
  keys.push(...Object.keys(ph.fixed));
  for (const [g, l] of Object.entries(ph.groups)) l.forEach((_, i) => keys.push(`${g}_${i + 1}`));
  for (const d of read('drills.json')) keys.push(`drill_${d.id}`);
  for (const s of read('stations.json')) s.setupSteps.forEach((_, i) => { keys.push(`${s.voiceSetup}_${i + 1}`); if (s.mirror) keys.push(`${s.voiceSetup}_m_${i + 1}`); });
  for (const t of read('tricks.json')) for (const s of t.steps) keys.push(`trick_${s.id}`);
  for (const c of read('challenges.json')) if (c.voiceIntro) keys.push(`challenge_${c.id}`);
  for (const t of read('skilltests.json')) keys.push(`test_${t.id}`);
  const missing = keys.filter((k) => !files.has(k));
  console.log(`hlášky bez MP3: ${missing.length} z ${keys.length} (${missing.slice(0, 6).join(', ')} …)`);
  expect(missing).toEqual([]);
});
