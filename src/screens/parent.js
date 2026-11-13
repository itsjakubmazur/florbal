// Rodiče: PIN (převzato z reference), zvuk, trénink, hráči, záloha (export/import), úložiště, vzhled, verze appky.
import { h, btn, u, icon, header, seg, field, escapeHtml, jerseyEl } from '../ui/dom.js';
import { settings, storage, persistStatus, requestPersist } from '../storage/index.js';
import { downloadBackup, parseBackup, restoreBackup, pickFileText } from '../storage/backup.js';
import { listProfiles, deleteProfile } from '../domain/profiles.js';
import { setVolume, setVoiceMode, say, sayGroup, voiceFileCount, unlockAudio } from '../core/audio.js';
import { THEMES, applyTheme } from '../ui/tokens.js';
import { APP_VERSION, BUILD_TIME } from '../core/env.js';
import { updateAvailable, applyUpdate } from '../core/pwa.js';
import { wakeLockMode } from '../core/wakelock.js';

export const pinOf = (s) => (s.pinCustom && s.pin ? s.pin : null);

function keypad(onKey, extra) {
  const grid = h('div', 'grid');
  grid.style.cssText += `;grid-template-columns:repeat(3, var(--tap-big));gap:${u(1.2)}`;
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', extra].forEach((d) => {
    const b = btn(d, 'btn', () => onKey(d), { test: `key-${d}` });
    b.style.minHeight = 'var(--tap)'; b.style.fontSize = `max(22px, ${u(3)})`;
    grid.append(b);
  });
  return grid;
}
const dotsEl = () => { const d = h('div', ''); d.style.cssText = `font-weight:700;font-size:max(30px, ${u(4)});letter-spacing:.3em`; return d; };

export function pinScreen({ next }, { go, back }) {
  const el = h('section', 'screen');
  el.dataset.test = 'pin';
  settings.load().then((s0) => { if (!pinOf(s0)) go('setPin', { next, from: 'first' }, { replace: true }); });
  el.append(h('div', 'title', 'Zadej PIN'), h('div', 'label', 'Nastavení pro rodiče'));
  let val = '';
  const dots = dotsEl();
  const draw = (msg) => { dots.textContent = msg || ('●'.repeat(val.length) + '○'.repeat(4 - val.length)); };
  draw();
  const press = async (d) => {
    if (d === '↩') { back(); return; }
    if (d === '⌫') val = val.slice(0, -1); else if (val.length < 4) val += d;
    draw();
    if (val.length === 4) {
      const s = await settings.load();
      if (val === pinOf(s)) go(next, {}, { replace: true });
      else { val = ''; draw('Špatně'); setTimeout(() => draw(), 800); }
    }
  };
  el.append(dots, keypad(press, '↩'), btn('Zapomněl jsem PIN', 'btn', () => go('pinReset', { next })));
  return el;
}

// Zapomenutý PIN: kontrolní příklad, který osmileté dítě z hlavy nespočítá
export function pinResetScreen({ next }, { go, back }) {
  const el = h('section', 'screen');
  el.append(h('div', 'title', 'Zapomenutý PIN'), h('div', 'label', 'Jen pro dospělé'));
  const q = h('div', 'title'); const ans = dotsEl(); const msg = h('div', 'muted', 'Odpověz správně a nastavíš nový PIN.');
  let a = 0; let b = 0; let val = '';
  const ask = () => { a = 13 + Math.floor(Math.random() * 7); b = 7 + Math.floor(Math.random() * 3); val = ''; q.textContent = `${a} × ${b} = ?`; ans.textContent = '…'; };
  ask();
  const press = (d) => {
    if (d === '✓') { if (Number(val) === a * b) go('setPin', { next, from: 'reset' }, { replace: true }); else { msg.textContent = 'To není správně, zkus nový příklad.'; ask(); } return; }
    if (d === '⌫') val = val.slice(0, -1); else if (val.length < 3) val += d;
    ans.textContent = val || '…';
  };
  el.append(q, ans, keypad(press, '✓'), msg, btn('Zpět', 'btn', () => back()));
  return el;
}

export function setPinScreen({ next = 'parent', from = 'settings' }, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'set-pin';
  el.append(h('div', 'title', 'Vytvoř si PIN'), h('div', 'label', from === 'first' ? 'První vstup pro rodiče' : 'Nový PIN'));
  const sub = h('div', 'muted');
  let first = ''; let val = '';
  const dots = dotsEl();
  const draw = (m) => { dots.textContent = m || ('●'.repeat(val.length) + '○'.repeat(4 - val.length)); };
  const setStep = () => { sub.textContent = first ? 'Zadej PIN ještě jednou pro kontrolu.' : 'Čtyřmístný PIN chrání nastavení pro rodiče. Neprozraď ho dětem.'; };
  draw(); setStep();
  const press = async (d) => {
    if (d === '✕') { go(from === 'settings' ? 'parent' : 'profiles', {}, { replace: true }); return; }
    if (d === '⌫') val = val.slice(0, -1); else if (val.length < 4) val += d;
    draw();
    if (val.length < 4) return;
    if (!first) { first = val; val = ''; draw(); setStep(); return; }
    if (val === first) { await settings.save({ pin: val, pinCustom: true }); draw('Uloženo'); setTimeout(() => go(next, {}, { replace: true }), 500); }
    else { first = ''; val = ''; draw('Nesedí'); setTimeout(() => { draw(); setStep(); }, 900); }
  };
  el.append(dots, sub, keypad(press, '✕'));
  return el;
}

const panel = (title) => { const p = h('div', 'panel'); p.append(h('div', 'panel-title', title)); return p; };
const fmtMB = (b) => (b == null ? '?' : `${(b / 1048576).toFixed(1).replace(".", ",")} MB`);

function volumeCtl(get, set) {
  const box = h('div', 'flex items-center'); box.style.gap = u(1);
  const val = h('div', '', ''); val.style.cssText = `min-width:4ch;text-align:center;font-weight:700`;
  const paint = () => { val.textContent = `${Math.round(get() * 100)} %`; };
  box.append(btn('−', 'btn', () => { set(-0.1); paint(); }), val, btn('+', 'btn', () => { set(0.1); paint(); }));
  paint();
  return box;
}

export default function parent(_p, { go }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'parent';
  (async () => {
    const s = await settings.load();
    el.append(header('Nastavení', 'Rodiče', () => go('profiles', {}, { replace: true })));
    const grid = h('div', 'w-full'); grid.style.cssText = `display:grid;grid-template-columns:repeat(auto-fit, minmax(min(100%, ${u(44)}), 1fr));gap:${u(2)}`;

    // Zvuk
    const pSound = panel('Zvuk');
    pSound.append(field('Trenér', seg([['voice', 'Hlas'], ['device', 'Hlas iPadu'], ['beeps', 'Pípání'], ['off', 'Ticho']], s.voiceMode, async (v) => {
      unlockAudio(); await settings.save({ voiceMode: v }); setVoiceMode(v);
      if (v === 'voice' || v === 'device') sayGroup('welcome'); if (v === 'beeps') say('num_2');
    }, { test: 'voice-mode' })));
    const vol = (key, ch) => volumeCtl(() => s[key], (d) => { s[key] = Math.min(1, Math.max(0, Math.round((s[key] + d) * 10) / 10)); setVolume(ch, s[key]); settings.save({ [key]: s[key] }); });
    pSound.append(field('Hlasitost hlasu', vol('volVoice', 'voice')), field('Hlasitost pípání a metronomu', vol('volBeep', 'beep')));
    pSound.append(h('div', 'muted', `Hlas = nahrávky Trenéra (${voiceFileCount()} hlášek), Hlas iPadu = vestavěný český hlas zařízení. Na iPadu zvuk hraje i se ztlumeným přepínačem (iPadOS 17+), hlasitost řídí tlačítka.`));

    // Trénink
    const pTrain = panel('Trénink');
    pTrain.append(field('Tichý trénink (byt)', seg([[false, 'Vypnuto'], [true, 'Jen tiché cviky']], !!s.quiet, (v) => settings.save({ quiet: v }), { test: 'quiet-mode' })));
    pTrain.append(field('Tempo', seg([[0.8, 'Pomaleji'], [1, 'Normálně'], [1.15, 'Rychleji']], s.tempoMul, (v) => settings.save({ tempoMul: v }))));
    pTrain.append(field('Vzhled', seg(Object.entries(THEMES).map(([k, t]) => [k, t.label]), s.theme, async (v) => { await settings.save({ theme: v }); applyTheme(v); })));

    // Hráči
    const pPlayers = panel('Hráči');
    const plist = h('div', 'flex flex-col'); plist.style.gap = u(1);
    const drawPlayers = async () => {
      plist.replaceChildren();
      const list = await listProfiles();
      if (!list.length) plist.append(h('div', 'muted', 'Zatím žádný hráč.'));
      for (const p of list) {
        const r = h('div', 'flex items-center flex-wrap'); r.style.gap = u(1.2);
        const nm = h('div', '', `<b>${escapeHtml(p.name)}</b><div class="label">${p.age} let, ${p.grip === 'left' ? 'levák' : 'pravák'}, úroveň ${p.level}, ${p.xp || 0} XP</div>`); nm.style.flex = '1';
        const del = btn(`${icon('trash')}Smazat`, 'btn danger', async () => {
          if (del.dataset.sure) { await deleteProfile(p.id); drawPlayers(); return; }
          del.dataset.sure = '1'; del.innerHTML = 'Opravdu smazat?';
        });
        r.append(jerseyEl(p, 6), nm, btn(`${icon('edit')}Upravit`, 'btn', () => go('newPlayer', { editId: p.id })), del);
        plist.append(r);
      }
    };
    await drawPlayers();
    pPlayers.append(plist);

    // Záloha
    const pBackup = panel('Záloha dat');
    const bMsg = h('div', 'muted', 'iPad umí data webových appek při nedostatku místa smazat. Zálohu si ulož do Souborů nebo pošli e-mailem.');
    bMsg.dataset.test = 'backup-msg';
    const rowB = h('div', 'flex flex-wrap'); rowB.style.gap = u(1);
    rowB.append(
      btn(`${icon('download')}Uložit zálohu`, 'btn-primary', async () => { const r = await downloadBackup({ withMedia: true }); bMsg.textContent = `Záloha ${r.name} je připravená (${Math.ceil(r.size / 1024)} kB).`; }, { test: 'export' }),
      btn(`${icon('download')}Bez fotek`, 'btn', async () => { const r = await downloadBackup({ withMedia: false }); bMsg.textContent = `Záloha ${r.name} (bez fotek) je připravená.`; }, { test: 'export-nomedia' }),
    );
    const imp = btn(`${icon('upload')}Obnovit ze zálohy`, 'btn', async () => {
      const text = await pickFileText();
      if (!text) return;
      try {
        const { backup, counts } = parseBackup(text);
        bMsg.innerHTML = `Záloha z ${new Date(backup.createdAt).toLocaleString('cs-CZ')}: ${counts.profiles} hráčů, ${counts.history} tréninků. <b>Obnovení nahradí všechna současná data.</b>`;
        const ok = btn(`${icon('check')}Ano, obnovit`, 'btn-primary', async () => { await restoreBackup(backup); bMsg.textContent = 'Hotovo, data jsou obnovená.'; ok.remove(); drawPlayers(); }, { test: 'import-confirm' });
        rowB.append(ok);
      } catch (e) { bMsg.textContent = e.message; }
    }, { test: 'import' });
    rowB.append(imp);
    pBackup.append(rowB, bMsg);

    // Úložiště a appka
    const pApp = panel('Úložiště a aplikace');
    const stInfo = h('div', 'muted'); stInfo.dataset.test = 'persist-status';
    const paintSt = async () => {
      const ps = await persistStatus();
      stInfo.innerHTML = `Trvalé úložiště: <b>${ps.persisted === true ? 'zapnuté' : ps.persisted === false ? 'nepotvrzené' : 'nezjištěno'}</b>, využito ${fmtMB(ps.usage)} z ${fmtMB(ps.quota)}`;
    };
    await paintSt();
    pApp.append(stInfo, btn('Požádat o trvalé úložiště', 'btn', async () => { await requestPersist(); paintSt(); }));
    pApp.append(h('div', 'muted', `Verze ${APP_VERSION}${BUILD_TIME ? `, sestaveno ${new Date(BUILD_TIME).toLocaleString('cs-CZ')}` : ''}, obrazovka při tréninku: ${wakeLockMode() === 'none' ? 'wake lock při startu tréninku' : wakeLockMode()}`));
    if (updateAvailable()) pApp.append(btn(`${icon('refresh')}Aktualizovat na novou verzi`, 'btn-primary', () => applyUpdate()));
    pApp.append(btn('Změnit PIN', 'btn', () => go('setPin', { next: 'parent', from: 'settings' })));
    const wipe = btn(`${icon('warn')}Smazat všechna data`, 'btn danger', async () => {
      if (wipe.dataset.sure) { await storage.clear(); go('profiles', {}, { replace: true }); return; }
      wipe.dataset.sure = '1'; wipe.innerHTML = 'Opravdu? Nejde vrátit. Klepni znovu.';
    });
    pApp.append(wipe);

    // O appce: licence součástí (IDEAS 3); celé znění z THIRD-PARTY.txt (v precache, jde i offline)
    const pAbout = panel('O appce');
    pAbout.dataset.test = 'about';
    pAbout.append(h('div', 'muted', 'Florbal Trenér je soukromá rodinná appka. Data zůstávají jen v tomto zařízení, nic se neodesílá. Vychází z otevřeného projektu Tréninková podložka (Jakub Uhlíř, licence MIT).'));
    const lic = h('ul', 'muted'); lic.style.cssText = `margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:${u(0.4)}`;
    for (const t of ['Písmo Archivo – SIL Open Font License 1.1', 'Ikony Lucide – ISC', 'NoSleep.js, Workbox – MIT', 'Hlas Trenéra – Microsoft Edge TTS, jen pro soukromé použití', 'Grafika, metronom a zvuky – vlastní']) lic.append(h('li', '', t));
    const full = h('pre', 'muted'); full.dataset.test = 'licenses-text';
    full.style.cssText = `display:none;white-space:pre-wrap;font-size:13px;line-height:1.4;max-height:50vh;overflow:auto;margin:0;padding:${u(1)};border-radius:12px;background:var(--surface-2)`;
    const showLic = btn('Celé znění licencí', 'btn', async () => {
      if (full.style.display === 'none') {
        if (!full.textContent) { try { const r = await fetch('./THIRD-PARTY.txt'); full.textContent = r.ok ? await r.text() : 'Licence se nepodařilo načíst.'; } catch (e) { full.textContent = 'Licence se nepodařilo načíst.'; } }
        full.style.display = ''; showLic.textContent = 'Skrýt licence';
      } else { full.style.display = 'none'; showLic.textContent = 'Celé znění licencí'; }
    }, { test: 'show-licenses' });
    pAbout.append(lic, showLic, full);

    grid.append(pSound, pTrain, pBackup, pApp, pPlayers, pAbout);
    el.append(grid);
  })();
  return el;
}
