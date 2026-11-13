// Testy dovedností: seznam s osobními rekordy, test s odpočtem / stopkami (hlas + pípání Web Audio),
// rodič zadá číslo velkou číselnou klávesnicí, osobní rekord a graf zlepšení (SVG).
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import { numpad, lineChart } from '../ui/m4kit.js';
import { say, sayGroup, stopVoice, sfx, tone, getCtx, registerTexts } from '../core/audio.js';
import { setBusy } from '../core/pwa.js';
import { enableWakeLock, disableWakeLock } from '../core/wakelock.js';
import { FAST } from '../core/env.js';
import { getProfile } from '../domain/profiles.js';
import { allTests, getTest, listResults, personalRecord, saveResult, fmtValue } from '../domain/skilltests.js';
import { getStation } from '../domain/stations.js';
import { bump } from '../domain/activity.js';
import { XP_TEST } from '../domain/xp.js';
import { awardOne } from '../domain/cards.js';
import { revealCard } from './cards.js';

const T = (s) => (FAST ? s * 80 : s * 1000);
const beep = (f = 880, d = 0.14) => { const c = getCtx(); if (c && c.state === 'running') tone(f, d, 0, 'square', 0.25); };

export function skillTestsScreen({ profileId, solo = false }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'skilltests';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const res = await listResults(p.id);
    el.append(header(solo ? 'Zápas: sám proti rekordu' : 'Rekordy a zlepšení', 'Testy dovedností', () => back()));
    const g = h('div', 'm4-grid');
    for (const t of allTests()) {
      const pr = personalRecord(t, res);
      const n = res.filter((r) => r.testId === t.id).length;
      const b = btn('', 'card m4-item', () => go('skilltest', { profileId: p.id, testId: t.id }), { test: `test-${t.id}` });
      b.innerHTML = `<div class="m4-row" style="gap:6px"><span class="m4-tag">${t.durationSec ? `${t.durationSec} s` : t.unit === 's' ? 'stopky' : 'počet'}</span>${getStation(t.setupId) ? `<span class="m4-tag">${escapeHtml(getStation(t.setupId).name)}</span>` : ''}</div>
        <b class="m4-section-title">${escapeHtml(t.name)}</b>
        <div>${pr == null ? '<span class="muted">Zatím bez rekordu</span>' : `Rekord: <b style="color:var(--m4-hi)">${escapeHtml(fmtValue(t, pr))}</b> <span class="muted">· ${n}× měřeno</span>`}</div>`;
      g.append(b);
    }
    el.append(g);
  })();
  return el;
}

export function skillTestScreen({ profileId, testId }, { go, back, onBack }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'skilltest';
  let timer = null;
  const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
  const watch = setInterval(() => { if (!el.isConnected) { clearInterval(watch); stopTimer(); setBusy(false); disableWakeLock(); } }, 500);
  (async () => {
    const p = await getProfile(profileId);
    const t = getTest(testId);
    if (!p || !t) return go('profiles', {}, { replace: true });
    let results = await listResults(p.id, t.id);
    const attempts = t.attempts || 1;
    let values = [];
    el.append(header(`${attempts > 1 ? `${attempts} pokusy, platí nejlepší` : 'Jeden pokus'}${t.better === 'lower' ? ' · méně je lépe' : ''}`, escapeHtml(t.name), () => { stopVoice(); stopTimer(); back(); }));
    const split = h('div', 'm4-split');
    const left = h('div', 'm4-col'); const right = h('div', 'm4-col'); right.style.alignItems = 'center';
    split.append(left, right); el.append(split);
    registerTexts({ [`test_${t.id}`]: t.voiceIntro });

    const paintLeft = () => {
      const pr = personalRecord(t, results);
      left.replaceChildren(
        h('div', 'm4-strong', escapeHtml(t.howTo)),
        h('div', 'muted', `Potřebuješ: ${escapeHtml((t.equipment || []).join(', '))}`),
        h('div', 'm4-note', pr == null ? 'Zatím žádný rekord. První měření bude tvůj rekord.' : `Osobní rekord: <b data-test="test-record">${escapeHtml(fmtValue(t, pr))}</b>`),
        h('div', 'eyebrow', 'Zlepšení'),
        lineChart(results.map((r) => ({ value: r.value, date: r.date })), { better: t.better, fmt: (v) => fmtValue(t, v).replace(' s', '') }),
      );
    };
    paintLeft();

    const status = () => h('div', 'eyebrow', `Pokus ${Math.min(values.length + 1, attempts)} z ${attempts}${values.length ? ` · zatím: ${values.map((v) => fmtValue(t, v)).join(', ')}` : ''}`);

    const ready = () => {
      stopTimer();
      right.replaceChildren(status());
      right.append(btn(`${icon('play')}${values.length ? 'Další pokus' : 'Start testu'}`, 'btn-primary btn-big', () => run(), { auto: true, test: 'test-start' }));
      if (values.length) right.append(btn(`${icon('check')}Stačí, uložit`, 'btn btn-big', () => finish(), { test: 'test-save' }));
    };

    const countdown = (then) => {
      right.replaceChildren(status());
      const big = h('div', 'm4-timer', '3'); big.dataset.test = 'test-timer';
      right.append(big);
      say('test_get_ready', { kind: 'urgent' });
      const t0 = performance.now(); let last = 4;
      timer = setInterval(() => {
        const n = 3 - Math.floor((performance.now() - t0) / T(1));
        if (n !== last && n >= 1) { last = n; big.textContent = String(n); say(`countdown_${n}`, { kind: 'urgent' }); beep(880); }
        if (n < 1) { stopTimer(); beep(1320, 0.25); sayGroup('go', { kind: 'urgent' }); then(big); }
      }, 50);
    };

    const enter = (initial = '') => {
      stopTimer(); setBusy(false);
      right.replaceChildren(status(), h('div', 'm4-section-title', t.unit === 's' ? 'Kolik sekund?' : 'Kolik to bylo?'));
      right.append(numpad({ decimal: t.unit === 's', initial, onOk: (v) => { values.push(v); sfx('tap'); if (values.length >= attempts) finish(); else ready(); } }));
      say('test_enter', { kind: 'phrase' });
    };

    const run = () => {
      setBusy(true); enableWakeLock();
      if (t.durationSec) {
        countdown((big) => {
          const t0 = performance.now(); let lastBeep = 0;
          timer = setInterval(() => {
            const left = t.durationSec - (performance.now() - t0) / T(1);
            if (left <= 3.05 && left > 0 && Math.ceil(left) !== lastBeep) { lastBeep = Math.ceil(left); beep(660, 0.08); }
            if (left <= 0) { stopTimer(); beep(440, 0.5); say('duel_time_up', { kind: 'urgent' }); enter(); return; }
            big.textContent = String(Math.ceil(left));
          }, 100);
        });
      } else if (t.unit === 's') {
        countdown((big) => {
          const t0 = performance.now();
          const sec = () => (performance.now() - t0) / T(1);
          timer = setInterval(() => { big.textContent = fmtValue(t, sec()); }, 100);
          right.append(btn(`${icon('stop')}Stop`, 'm4-hit', () => { const v = Math.round(sec() * 10) / 10; beep(1046, 0.2); enter(String(v).replace('.', ',')); }, { auto: true, test: 'test-stop' }));
          right.lastChild.style.width = '100%';
        });
      } else enter();
    };

    const finish = async () => {
      stopTimer(); setBusy(false); disableWakeLock();
      const prev = personalRecord(t, results);
      const { row } = await saveResult(p.id, t, values);
      results = await listResults(p.id, t.id);
      await bump(p.id, { tests: 1, records: row.record ? 1 : 0 }, XP_TEST);
      right.replaceChildren();
      const box = h('div', 'm4-col'); box.style.alignItems = 'center'; box.dataset.test = 'test-result';
      box.append(h('div', 'eyebrow', 'Výsledek'), h('div', 'm4-big-num', escapeHtml(fmtValue(t, row.value))));
      if (row.record) { box.append(h('div', 'title', 'Nový rekord!')); say('test_record', { kind: 'phrase' }); sfx('levelup'); }
      else if (row.first) { box.append(h('div', 'm4-section-title', 'První rekord je zapsaný')); say('test_first', { kind: 'phrase' }); }
      else {
        const close = t.better === 'lower' ? row.value <= prev * 1.1 : row.value >= prev * 0.9;
        box.append(h('div', 'm4-section-title', close ? 'Rekord je blízko!' : `Rekord zůstává ${fmtValue(t, prev)}`));
        if (close) say('test_close', { kind: 'phrase' }); else sayGroup('praise');
      }
      box.append(h('div', 'muted', `+${XP_TEST} XP za snahu`));
      const row2 = h('div', 'm4-row'); row2.style.justifyContent = 'center';
      row2.append(btn(`${icon('refresh')}Znovu`, 'btn btn-big', () => { values = []; ready(); }, { test: 'test-again' }), btn(`${icon('check')}Hotovo`, 'btn-primary btn-big', () => back(), { auto: true, test: 'test-done' }));
      box.append(row2);
      right.append(box);
      values = [];
      paintLeft();
      if (row.record) { const card = await awardOne(p.id, (c) => c.unlock && c.unlock.type === 'test'); if (card) await revealCard(card); }
    };

    onBack(() => { stopVoice(); stopTimer(); back(); });
    say(`test_${t.id}`, { kind: 'phrase', text: t.voiceIntro });
    ready();
  })();
  return el;
}
