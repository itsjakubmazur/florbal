// QA nápadů z IDEAS.md 1–5 (nezávislé QA, kód psal jiný agent): Hlas iPadu (voiceMode 'device') včetně importu zálohy,
// přednost vlastních nahrávek .m4a/.wav před MP3, generátor hlasů (--list, --only, --provider, Azure bez klíče),
// licence offline (Rodiče → O appce), obličeje po tréninku, rychlé volby (reakce, rozcvička, protažení), desetinná čárka.
// Nálezy jsou v docs/QA.md (N6 …); testy, které chybu ukazují, mají test.fail() s odkazem na nález.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const T = (page, id) => page.locator(`[data-test="${id}"]`).first();
/** Funkční testy (ne rozložení) stačí na jednom viewportu v každém enginu. */
const onlyLandscape = (testInfo) => test.skip(!/ipad-landscape$/.test(testInfo.project.name), 'funkční test, stačí iPad na šířku');
/** Statické kontroly (Node, bez prohlížeče) jen jednou. */
const onlyOnce = (testInfo) => test.skip(testInfo.project.name !== 'ipad-landscape', 'statická kontrola, stačí jednou');

function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  const unloadAbort = (m) => page.context().browser()?.browserType().name() === 'webkit' && /\.mp3 due to access control checks/.test(m);
  page.on('pageerror', (e) => { if (!unloadAbort(e.message)) errors.push(`pageerror: ${e.message}`); });
  return errors;
}
async function hScroll(page) {
  return page.evaluate(() => {
    const s = document.querySelector('#app > .screen');
    return Math.max(document.documentElement.scrollWidth - window.innerWidth, s ? s.scrollWidth - s.clientWidth : 0);
  });
}
async function enterParent(page) {
  await T(page, 'parent').click();
  await page.locator('[data-test="set-pin"], [data-test="pin"]').first().waitFor();
  const fresh = await T(page, 'set-pin').count();
  for (let k = 0; k < (fresh ? 2 : 1); k++) for (const d of '1234') await T(page, `key-${d}`).click();
  await T(page, 'parent').waitFor();
}
const idb = (page, src) => page.evaluate((s) => new Promise((res, rej) => {
  const r = indexedDB.open('florbal');
  r.onsuccess = () => { try { Promise.resolve(new Function('db', s)(r.result)).then(res, rej); } catch (e) { rej(e); } };
  r.onerror = () => rej(r.error);
}), src);
const storedVoiceMode = (page) => idb(page, `return new Promise((ok) => { const g = db.transaction('settings').objectStore('settings').get('main'); g.onsuccess = () => ok(g.result && g.result.voiceMode); g.onerror = () => ok(null); });`);

/** Ve stránce: záznam přehraných hlasových bufferů (> 0,25 s) a promluv speechSynthesis (stejné jako v m5.spec.js). */
const AUDIO_SPY = () => {
  window.__voice = [];
  const st = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (this.buffer && this.buffer.duration > 0.25) window.__voice.push({ t: this.context.currentTime, dur: this.buffer.duration });
    return st.apply(this, a);
  };
  window.__tts = []; let cur = null;
  const fin = (u) => { if (u.__done) return; u.__done = true; if (cur === u) cur = null; u.onend && u.onend(); };
  const fake = {
    speak(u) { if (!u.text.trim()) return; window.__tts.push({ text: u.text, lang: u.lang }); cur = u; setTimeout(() => fin(u), 600); },
    cancel() { if (cur) fin(cur); }, getVoices: () => [], addEventListener() {}, speaking: false, pending: false,
  };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => fake });
};

/** Z obrazovky Rodiče (po importu, bez reloadu) zpět na hráče a spustit trénink jen navigací v appce. */
async function workoutInApp(page) {
  await T(page, 'back').click();
  await T(page, 'profiles').waitFor();
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await T(page, 'start').click(); await T(page, 'setup').waitFor();
  await T(page, 'setup-skip').click();
  await expect(T(page, 'player')).toHaveAttribute('data-phase', 'play', { timeout: 20_000 });
  await page.waitForTimeout(2500);
}

/** Export zálohy, úprava nastavení a import zpět (vše v Rodičích). Vrací cestu k upravenému souboru. */
async function importWithSettings(page, testInfo, patch) {
  const [d] = await Promise.all([page.waitForEvent('download'), T(page, 'export-nomedia').click()]);
  const file = testInfo.outputPath('zaloha.json'); await d.saveAs(file);
  const b = JSON.parse(fs.readFileSync(file, 'utf8'));
  const main = b.data.settings.find((s) => s.id === 'main') || { id: 'main' };
  Object.assign(main, patch);
  b.data.settings = [main, ...b.data.settings.filter((s) => s.id !== 'main')];
  fs.writeFileSync(file, JSON.stringify(b));
  const [ch] = await Promise.all([page.waitForEvent('filechooser'), T(page, 'import').click()]);
  await ch.setFiles(file);
  await T(page, 'import-confirm').click();
  await expect(T(page, 'backup-msg')).toContainText('obnovená');
  return file;
}

// ---------------------------------------------------------------------------------------------------------------
// IDEAS 1: Hlas iPadu a import zálohy
// ---------------------------------------------------------------------------------------------------------------

test('import zálohy s voiceMode „device“: po novém spuštění appky je vybraný Hlas iPadu a trénink mluví jen hlasem zařízení', async ({ page }, testInfo) => {
  onlyLandscape(testInfo);
  test.setTimeout(90_000);
  await page.addInitScript(AUDIO_SPY);
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro&fast=1');
  await enterParent(page);
  await importWithSettings(page, testInfo, { voiceMode: 'device' });
  expect(await storedVoiceMode(page)).toBe('device');
  await page.goto('./?nointro&fast=1');
  await enterParent(page);
  await expect(page.locator('[data-test="voice-mode"] [data-value="device"]')).toHaveClass(/\bon\b/);
  await expect(page.locator('[data-test="voice-mode"] .on')).toHaveCount(1);
  await workoutInApp(page);
  expect(await page.evaluate(() => window.__voice), 'žádná nahrávka Trenéra').toEqual([]);
  const tts = await page.evaluate(() => window.__tts);
  expect(tts.length).toBeGreaterThanOrEqual(2);
  expect(tts.every((x) => x.lang === 'cs-CZ')).toBe(true);
  expect(errors).toEqual([]);
});

test('import zálohy s voiceMode „device“ platí hned, bez nového spuštění (N6)', async ({ page }, testInfo) => {
  onlyLandscape(testInfo);
  test.setTimeout(90_000);
  await page.addInitScript(AUDIO_SPY);
  await page.goto('./?demo&nointro&fast=1');
  await enterParent(page);
  await importWithSettings(page, testInfo, { voiceMode: 'device' });
  await expect.soft(page.locator('[data-test="voice-mode"] [data-value="device"]'), 'Rodiče ukazují obnovenou volbu').toHaveClass(/\bon\b/, { timeout: 2000 });
  await workoutInApp(page);
  expect(await page.evaluate(() => window.__voice), 'po importu „Hlas iPadu“ nemá hrát nahrávka').toEqual([]);
});

test('import zálohy s neznámou hodnotou voiceMode: appka spadne na „Hlas“ (nahrávky), nic nespadne', async ({ page }, testInfo) => {
  onlyLandscape(testInfo);
  test.setTimeout(90_000);
  await page.addInitScript(AUDIO_SPY);
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro&fast=1');
  await enterParent(page);
  await importWithSettings(page, testInfo, { voiceMode: 'robot' });
  await page.goto('./?nointro&fast=1');
  await enterParent(page);
  await workoutInApp(page);
  await expect.poll(() => page.evaluate(() => window.__voice.length), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => window.__tts.length), 'hlas zařízení').toBe(0);
  expect(errors).toEqual([]);
});

test('import zálohy s neznámou hodnotou voiceMode: v Rodičích je vybraná volba „Hlas“ (N7)', async ({ page }, testInfo) => {
  onlyLandscape(testInfo);
  await page.goto('./?demo&nointro&fast=1');
  await enterParent(page);
  await importWithSettings(page, testInfo, { voiceMode: 'robot' });
  await page.goto('./?nointro&fast=1');
  await enterParent(page);
  await expect(page.locator('[data-test="voice-mode"] .on')).toHaveCount(1, { timeout: 2000 });
  await expect(page.locator('[data-test="voice-mode"] [data-value="voice"]')).toHaveClass(/\bon\b/);
});

test('Hlas iPadu: výchozí nastavení je „Hlas“, přepnutí na Hlas iPadu a zpět se uloží', async ({ page }, testInfo) => {
  onlyLandscape(testInfo);
  const errors = watchErrors(page);
  await page.goto('./?nointro');
  await enterParent(page);
  await expect(page.locator('[data-test="voice-mode"] [data-value="voice"]')).toHaveClass(/\bon\b/);
  await expect(page.locator('[data-test="voice-mode"] [data-value="device"]')).toHaveText('Hlas iPadu');
  await page.locator('[data-test="voice-mode"] [data-value="device"]').click();
  await expect.poll(() => storedVoiceMode(page)).toBe('device');
  await page.locator('[data-test="voice-mode"] [data-value="voice"]').click();
  await expect.poll(() => storedVoiceMode(page)).toBe('voice');
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------
// IDEAS 2: vlastní nahrávky mají přednost před MP3 (logika výběru z src/core/audio.js, spuštěná v Node)
// ---------------------------------------------------------------------------------------------------------------

/** Vytáhne ze src/core/audio.js blok výběru souboru (RANK … smyčka) a vrátí funkci found → FILES. */
function pickerFromSource() {
  const src = fs.readFileSync(path.join(ROOT, 'src/core/audio.js'), 'utf8');
  const m = /const RANK[\s\S]*?\nfor \(const \[path, url\] of Object\.entries\(found\)\) \{[\s\S]*?\n\}\n/.exec(src);
  if (!m) throw new Error('blok výběru nahrávky v audio.js nenalezen');
  // eslint-disable-next-line no-new-func
  return new Function('found', `const FILES = {};\n${m[0]}\nreturn FILES;`);
}
const P = '../../assets/audio/voice/trener/';

test('vlastní nahrávka: .m4a i .wav mají přednost před vygenerovanou MP3 bez ohledu na pořadí', ({}, testInfo) => {
  onlyOnce(testInfo);
  const pick = pickerFromSource();
  expect(pick({ [`${P}num_1.mp3`]: 'mp3', [`${P}num_1.m4a`]: 'm4a' }).num_1).toBe('m4a');
  expect(pick({ [`${P}num_1.m4a`]: 'm4a', [`${P}num_1.mp3`]: 'mp3' }).num_1).toBe('m4a');
  expect(pick({ [`${P}num_1.mp3`]: 'mp3', [`${P}num_1.wav`]: 'wav' }).num_1).toBe('wav');
  expect(pick({ [`${P}num_1.wav`]: 'wav', [`${P}num_1.mp3`]: 'mp3' }).num_1).toBe('wav');
  expect(pick({ [`${P}num_1.mp3`]: 'mp3' }).num_1).toBe('mp3');
  // ostatní klíče se nepletou, klíč s tečkou a podtržítky zůstane celý
  const f = pick({ [`${P}a.mp3`]: 'a', [`${P}b.m4a`]: 'b', [`${P}setup_triangle_m_3.mp3`]: 'x', [`${P}setup_triangle_m_3.m4a`]: 'y', [`${P}x.y.mp3`]: 'xy' });
  expect(f).toEqual({ a: 'a', b: 'b', setup_triangle_m_3: 'y', 'x.y': 'xy' });
  // glob v audio.js i precache ve vite.config.js znají m4a
  expect(fs.readFileSync(path.join(ROOT, 'src/core/audio.js'), 'utf8')).toMatch(/import\.meta\.glob\('[^']*\*\.\{mp3,wav,m4a[,A-Z0-9]*\}'/);
  expect(fs.readFileSync(path.join(ROOT, 'vite.config.js'), 'utf8')).toMatch(/globPatterns:[^\n]*\bm4a\b/);
});

test('vlastní nahrávka: když je .wav i .m4a se stejným klíčem, výběr nezávisí na pořadí souborů (N9)', ({}, testInfo) => {
  onlyOnce(testInfo);
  const pick = pickerFromSource();
  const a = pick({ [`${P}num_1.wav`]: 'wav', [`${P}num_1.m4a`]: 'm4a' }).num_1;
  const b = pick({ [`${P}num_1.m4a`]: 'm4a', [`${P}num_1.wav`]: 'wav' }).num_1;
  expect(a).toBe(b);
  expect(a, 'm4a (Diktafon) má přednost před wav').toBe('m4a');
  // přípona velkými písmeny (QA N11)
  expect(pick({ [`${P}num_1.mp3`]: 'mp3', [`${P}num_1.M4A`]: 'M4A' }).num_1).toBe('M4A');
});

// ---------------------------------------------------------------------------------------------------------------
// IDEAS 2: generátor hlasů (bez sítě: --list, neznámý provider, Azure bez klíče)
// ---------------------------------------------------------------------------------------------------------------

const noAzureEnv = () => { const e = { ...process.env }; delete e.AZURE_SPEECH_KEY; delete e.AZURE_SPEECH_REGION; return e; };
const gen = (args, timeout = 15_000) => spawnSync(process.execPath, ['scripts/gen-voices.mjs', ...args], { cwd: ROOT, env: noAzureEnv(), encoding: 'utf8', timeout });

test('gen-voices --list: tabulka klíč–text pro všechny hlášky, --only filtruje, nic negeneruje', ({}, testInfo) => {
  onlyOnce(testInfo);
  const dir = path.join(ROOT, 'assets/audio/voice/trener');
  const before = fs.readdirSync(dir).map((f) => `${f}:${fs.statSync(path.join(dir, f)).mtimeMs}`).sort();
  const r = gen(['--list']);
  expect(r.status, r.stderr).toBe(0);
  const rows = r.stdout.trim().split('\n').map((l) => l.split('\t'));
  expect(rows.length).toBe(370);
  expect(rows.filter((x) => x.length !== 2 || !x[0] || !x[1].trim() || /undefined|\n/.test(x[1])), 'řádky bez textu').toEqual([]);
  expect(new Set(rows.map((x) => x[0])).size).toBe(rows.length);
  const mp3 = new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, '')));
  expect(rows.filter(([k]) => !mp3.has(k)).map(([k]) => k), 'klíč z --list bez MP3').toEqual([]);
  const only = gen(['--list', '--only', 'trick_']);
  const keys = only.stdout.trim().split('\n').map((l) => l.split('\t')[0]);
  expect(keys.length).toBeGreaterThan(10);
  expect(keys.every((k) => k.startsWith('trick_'))).toBe(true);
  const after = fs.readdirSync(dir).map((f) => `${f}:${fs.statSync(path.join(dir, f)).mtimeMs}`).sort();
  expect(after).toEqual(before);
});

test('gen-voices: neznámý --provider skončí chybou dřív, než cokoli generuje', ({}, testInfo) => {
  onlyOnce(testInfo);
  const r = gen(['--provider', 'google', '--only', 'num_1']);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain('neznámý --provider');
  expect(r.stdout).not.toMatch(/^OK /m);
});

test('gen-voices --provider azure bez klíče: hned skončí srozumitelnou chybou a nesahá na soubory (N8)', ({}, testInfo) => {
  onlyOnce(testInfo);
  test.setTimeout(30_000);
  const file = path.join(ROOT, 'assets/audio/voice/trener/num_1.mp3');
  const m0 = fs.statSync(file).mtimeMs;
  const t0 = Date.now();
  const r = gen(['--provider', 'azure', '--force', '--only', 'num_1'], 8000);
  expect(fs.statSync(file).mtimeMs, 'MP3 se nesmí přepsat').toBe(m0);
  expect(r.signal, 'skript neskončil sám (zabit po 8 s)').toBeNull();
  expect(Date.now() - t0).toBeLessThan(5000);
  expect(r.status).not.toBe(0);
  expect(`${r.stdout}${r.stderr}`).toContain('AZURE_SPEECH_KEY');
});

// ---------------------------------------------------------------------------------------------------------------
// IDEAS 3: licence offline
// ---------------------------------------------------------------------------------------------------------------

test('O appce: celé znění licencí jde zobrazit offline (THIRD-PARTY.txt z precache)', async ({ page, context }, testInfo) => {
  onlyLandscape(testInfo);
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro');
  await T(page, 'profiles').waitFor();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(async () => {
    for (const k of await caches.keys()) if ((await (await caches.open(k)).keys()).some((r) => /THIRD-PARTY\.txt/.test(r.url))) return true;
    return false;
  }, null, { timeout: 60_000, polling: 500 });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await T(page, 'profiles').waitFor();
  await enterParent(page);
  await T(page, 'show-licenses').click();
  const txt = T(page, 'licenses-text');
  await expect(txt).toBeVisible();
  await expect(txt).toContainText('SIL Open Font License');
  await expect(txt).toContainText('ISC');
  await expect(txt).toContainText('Workbox');
  await expect(txt).not.toContainText('nepodařilo');
  await T(page, 'show-licenses').click();
  await expect(txt).toBeHidden();
  await context.setOffline(false);
  expect(errors.filter((e) => !/ERR_INTERNET_DISCONNECTED/.test(e))).toEqual([]);
});

test('THIRD-PARTY.txt v buildu: všechny licence z LICENSES.md, NoSleep s copyrightem', ({}, testInfo) => {
  onlyOnce(testInfo);
  const f = path.join(ROOT, 'dist/THIRD-PARTY.txt');
  test.skip(!fs.existsSync(f), 'chybí dist/ (npm run build)');
  const t = fs.readFileSync(f, 'utf8');
  for (const s of ['SIL Open Font License', 'Lucide', 'ISC', 'NoSleep.js', 'Rich Tibbett', 'Workbox', 'Jakub Uhlíř', 'Edge TTS']) expect(t).toContain(s);
  expect(t).not.toContain('__COPY__');
  expect(fs.readFileSync(path.join(ROOT, 'dist/sw.js'), 'utf8')).toContain('THIRD-PARTY.txt');
});

// ---------------------------------------------------------------------------------------------------------------
// IDEAS 4–5: obličeje po tréninku, rychlé volby, desetinná čárka (všechny viewporty)
// ---------------------------------------------------------------------------------------------------------------

test('po tréninku: tři obličeje-míčky s popiskem, velké, volba se uloží do historie, bez vodorovného posunu', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro&fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'home').waitFor();
  await T(page, 'start').click(); await T(page, 'setup-skip').click();
  await expect(T(page, 'player')).toHaveAttribute('data-drill-index', /^[1-9]/, { timeout: 60_000 });
  await page.mouse.click(200, 300); await T(page, 'stop').click();
  await T(page, 'result').waitFor();
  await T(page, 'feel').waitFor();
  const faces = page.locator('[data-test="feel"] .m4-face');
  await expect(faces).toHaveCount(3);
  await expect(faces).toHaveText(['Nebavilo mě to', 'Ušlo to', 'Bavilo mě to']);
  for (let k = 0; k < 3; k++) {
    const b = await faces.nth(k).boundingBox();
    expect(Math.min(b.width, b.height), `obličej ${k + 1}: dotyková plocha`).toBeGreaterThanOrEqual(64);
    await expect(faces.nth(k)).toHaveAttribute('aria-pressed', 'false');
  }
  if (testInfo.project.name.endsWith('ipad-landscape')) {
    // audit: na šířku je otázka vedle karty hráče a nad „Domů“, vše bez posouvání
    const home = await T(page, 'result-home').boundingBox(); const feel = await T(page, 'feel').boundingBox();
    expect(feel.y + feel.height).toBeLessThanOrEqual(home.y + 1);
    expect(home.y + home.height).toBeLessThanOrEqual(820);
  }
  expect(await hScroll(page), 'výsledek: vodorovný posun').toBeLessThanOrEqual(1);
  await T(page, 'feel-3').click();
  await expect(T(page, 'feel-3')).toHaveAttribute('aria-pressed', 'true');
  await expect(T(page, 'feel-1')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => idb(page, `return new Promise((ok) => { const g = db.transaction('history').objectStore('history').getAll(); g.onsuccess = () => ok(g.result.sort((a, b) => b.date - a.date)[0].feel); });`)).toBe(3);
  expect(errors).toEqual([]);
});

test('reakce: hlavička „Reakce na povel, N cviků“, bez „Jiné stanoviště“; běžný trénink ho nabízí', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./?demo&nointro&fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-reaction').click();
  await T(page, 'setup').waitFor();
  await expect(T(page, 'setup')).toContainText(/Reakce na povel, \d+ (cvik|cviky|cviků)\b/);
  const txt = await T(page, 'setup').innerText();
  const n = Number(/Reakce na povel, (\d+)/.exec(txt)[1]);
  const word = n === 1 ? 'cvik' : n <= 4 ? 'cviky' : 'cviků';
  expect(txt).toContain(`Reakce na povel, ${n} ${word}`);
  await expect(T(page, 'setup-other')).toHaveCount(0);
  await expect(T(page, 'setup-skip')).toBeVisible();
  expect(await hScroll(page)).toBeLessThanOrEqual(1);
  await page.goto('./?fast=1&nointro');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'start').click(); await T(page, 'setup').waitFor();
  await expect(T(page, 'setup')).toContainText('Než začneme trénink');
  await expect(T(page, 'setup-other')).toBeVisible();
  expect(errors).toEqual([]);
});

test('rozcvička a protažení: nepoužité kužely se v přehrávači nekreslí (u protažení žádné)', async ({ page }) => {
  const errors = watchErrors(page);
  for (const [tile, expectNone] of [['tile-stretch', true], ['tile-warmup', false]]) {
    await page.goto('./?demo&nointro&fast=1');
    await page.locator('[data-test="profile-card"]').first().click();
    await T(page, tile).click();
    await T(page, 'player').waitFor();
    await page.locator('[data-test="player"] [data-test="station-view"]').waitFor();
    const op = await page.locator('[data-test="player"] [data-cone]').evaluateAll((gs) => gs.map((g) => g.getAttribute('opacity')));
    expect(op.filter((o) => o !== '0' && o !== '1'), `${tile}: poloprůhledné kužely`).toEqual([]);
    if (expectNone) expect(op.filter((o) => o !== '0'), `${tile}: viditelné kužely`).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('návod na stanoviště: rozměry s desetinnou čárkou („1,4 × 2 m“)', async ({ page }) => {
  await page.goto('./?demo&nointro&fast=1');
  await page.locator('[data-test="profile-card"]').first().click();
  await T(page, 'tile-stations').click();
  await T(page, 'station-spot').click();
  await T(page, 'setup').waitFor();
  await expect(T(page, 'setup')).toContainText('1,4 × 2 m');
  await expect(T(page, 'setup')).not.toContainText(/\d\.\d × /);
});
