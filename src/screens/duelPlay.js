// Průběh souboje: obří tlačítka „trefa / vedle“ pro každého hráče, počítání, stopky, odpočet na čas, kola, KOHOUT.
// Každé klepnutí = akce v logu (domain/duels.js replay), „Zpět“ vrátí poslední akci. Hlas Trenéra: úvod, kdo je na řadě,
// skóre, výsledek (prohra = „Odveta zítra!“, nikdy ponižující). Během souboje flag busy (žádná aktualizace) a wake lock.
import { h, btn, icon, escapeHtml } from '../ui/dom.js';
import { sayText, confirmBox } from '../ui/m4kit.js';
import { say, sayGroup, stopVoice, sfx, tone, getCtx, registerTexts } from '../core/audio.js';
import { setBusy } from '../core/pwa.js';
import { enableWakeLock, disableWakeLock } from '../core/wakelock.js';
import { FAST } from '../core/env.js';
import phrases from '../content/phrases.json';
import { replay, inputOf, attemptsFor, fmtScore, saveDuel, listDuels, isRematch, personalBest, winRounds, getChallenge } from '../domain/duels.js';
import { bump } from '../domain/activity.js';
import { XP_DUEL } from '../domain/xp.js';
import { awardOne } from '../domain/cards.js';
import { revealCard } from './cards.js';

const T = (s) => (FAST ? s * 80 : s * 1000); // ?fast=1 zrychlí odpočty v testech
const beep = (f = 880, d = 0.14) => { const c = getCtx(); if (c && c.state === 'running') tone(f, d, 0, 'square', 0.25); };

export default function duelPlay({ profileId, cfg }, { go, onBack }) {
  const el = h('section', 'screen top m4 m4-duel');
  el.dataset.test = 'duel-play';
  const log = [];
  let st = replay(cfg, log);
  let timer = null; let timing = null; // { kind: 'timed'|'stopwatch'|'round'|'countdown', t0, p, count, pen }
  let lastActive = -1; let saidLast = false; let ended = false;
  let prevDuels = [];
  listDuels().then((d) => { prevDuels = d; });
  const solo = cfg.players.length === 1;
  const crazy = cfg.challengeId === 'silena-minuta' ? phrases.groups.crazy_rule : null;
  let ruleIdx = -1;

  setBusy(true);
  enableWakeLock();
  const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
  const cleanup = () => { stopTimer(); setBusy(false); disableWakeLock(); };
  const watch = setInterval(() => { if (!el.isConnected) { clearInterval(watch); cleanup(); } }, 500);

  // ---- horní lišta ----
  const bar = h('div', 'm4-bar');
  const title = h('div', 'm4-col'); title.style.gap = '2px';
  const nameEl = h('div', 'eyebrow', escapeHtml(cfg.name));
  const turnEl = h('div', 'm4-turn'); turnEl.dataset.test = 'turn';
  title.append(nameEl, turnEl);
  const undoB = btn(`${icon('back')}Zpět o krok`, 'btn', () => undo(), { test: 'undo' });
  const quitB = btn(`${icon('x')}Konec`, 'btn', () => confirmBox('Ukončit souboj bez uložení?', 'Ukončit', () => { stopVoice(); cleanup(); go('duels', { profileId }, { replace: true }); }), { test: 'duel-quit' });
  const tools = h('div', 'm4-row'); tools.append(undoB, quitB);
  bar.append(title, tools);
  const center = h('div', 'm4-col w-full'); center.style.alignItems = 'center';
  const board = h('div', 'm4-players');
  el.append(bar, center, board);
  onBack(() => quitB.click());

  function act(a) {
    if (st.finished || ended) return;
    log.push(a);
    st = replay(cfg, log);
    feedback(a);
    paint();
  }
  function undo() {
    if (timing) { stopTimer(); timing = null; paint(); return; }
    if (!log.length) return;
    log.pop(); ended = false;
    st = replay(cfg, log);
    sfx('tap');
    paint();
  }

  function feedback(a) {
    if (a.t === 'hit') { sfx('success'); if (st.mode !== 'turns' || inputOf(cfg) === 'hitmiss') sayGroup('duel_hit', { kind: 'call' }); }
    else if (a.t === 'miss') sayGroup('duel_miss', { kind: 'call' });
    if (st.mode === 'kohout') {
      if (st.lastEvent === 'letter') say('kohout_letter', { kind: 'phrase' });
      if (st.lastEvent === 'out') say('kohout_out', { kind: 'phrase' });
      if (st.lastEvent === 'lead-ok') say('kohout_copy', { kind: 'phrase' });
    }
    if (st.mode === 'series' && !st.finished) say('duel_round', { kind: 'phrase' });
  }

  function announceTurn() {
    if (st.finished) return;
    const i = st.active;
    if (i == null || i < 0 || i === lastActive) return;
    lastActive = i;
    if (solo && st.mode !== 'kohout') return;
    const nm = cfg.players[i].name;
    if (st.mode === 'kohout') sayText(st.phase === 'lead' ? `${nm}, předveď trik!` : `${nm}, zopakuj to!`);
    else if (st.mode === 'turns') {
      const scores = st.players.map((x) => fmtScore(cfg, x.score)).join(' : ');
      const allLast = st.players.every((x, k) => attemptsFor(cfg, k) - x.results.length <= 1);
      if (allLast && !saidLast && st.players.some((x) => x.results.length)) { saidLast = true; say('duel_last', { kind: 'phrase' }); }
      sayText(st.players.some((x) => x.results.length) && cfg.scoring === 'trefy' ? `${scores}. Na řadě je ${nm}.` : `Na řadě je ${nm}.`);
    }
  }

  // ---- časovače ----
  function countdown(then) {
    timing = { kind: 'countdown', t0: performance.now() };
    let last = 4;
    stopTimer();
    say('test_get_ready', { kind: 'urgent' });
    timer = setInterval(() => {
      const n = 3 - Math.floor((performance.now() - timing.t0) / T(1));
      if (n !== last && n >= 1) { last = n; say(`countdown_${n}`, { kind: 'urgent' }); beep(880); paintCenter(String(n)); }
      if (n < 1) { stopTimer(); beep(1320, 0.25); sayGroup('go', { kind: 'urgent' }); then(); }
    }, 50);
    paintCenter('3');
  }
  function startTimed(p) {
    countdown(() => {
      timing = { kind: 'timed', t0: performance.now(), p, count: 0 };
      timer = setInterval(() => {
        const left = cfg.durationSec - (performance.now() - timing.t0) / T(1);
        if (left <= 3.05 && left > 0 && Math.ceil(left) !== timing.lastBeep) { timing.lastBeep = Math.ceil(left); beep(660, 0.08); }
        if (left <= 0) { stopTimer(); beep(440, 0.5); say('duel_time_up', { kind: 'urgent' }); const v = timing.count; timing = null; act({ t: 'val', p, v }); return; }
        paintCenter(String(Math.ceil(left)));
      }, 100);
      paint();
    });
  }
  function startStopwatch(p) {
    countdown(() => {
      timing = { kind: 'stopwatch', t0: performance.now(), p, pen: 0 };
      timer = setInterval(() => paintCenter(fmtSec((performance.now() - timing.t0) / T(1))), 100);
      paint();
    });
  }
  function stopStopwatch() {
    if (!timing || timing.kind !== 'stopwatch') return;
    stopTimer();
    const v = Math.round(((performance.now() - timing.t0) / T(1) + timing.pen) * 10) / 10;
    const p = timing.p; timing = null;
    beep(1046, 0.2);
    sayText(`${fmtSec(v).replace(',', ' celá ')}`);
    act({ t: 'val', p, v });
  }
  function startRound() {
    if (crazy) { ruleIdx = (ruleIdx + 1 + Math.floor(Math.random() * (crazy.length - 1))) % crazy.length; say(`crazy_rule_${ruleIdx + 1}`, { kind: 'urgent' }); }
    if (!cfg.roundSec) { paint(); return; }
    countdown(() => {
      timing = { kind: 'round', t0: performance.now() };
      timer = setInterval(() => {
        const left = cfg.roundSec - (performance.now() - timing.t0) / T(1);
        if (left <= 0) { stopTimer(); beep(440, 0.5); say('duel_time_up', { kind: 'urgent' }); timing = { kind: 'round-over' }; paint(); return; }
        paintCenter(String(Math.ceil(left)));
      }, 100);
      paint();
    });
  }
  const fmtSec = (s) => `${String(Math.round(s * 10) / 10).replace('.', ',')} s`;

  function paintCenter(text) {
    center.replaceChildren();
    if (text == null) return;
    const t = h('div', 'm4-timer', escapeHtml(text)); t.dataset.test = 'duel-timer';
    center.append(t);
  }

  // ---- vykreslení hráčů ----
  const bigBtn = (cls, label, fn, test, disabled = false) => {
    const b = btn(label, cls, fn, { test });
    if (disabled) b.disabled = true;
    return b;
  };

  function panel(pl, i) {
    const box = h('div', 'm4-pl');
    box.dataset.test = `player-${i}`;
    const active = st.active === i && !st.finished;
    const mode = st.mode;
    if (mode === 'turns' || mode === 'kohout') box.classList.add(active ? 'active' : 'idle');
    if (mode === 'race' && active && !solo) box.classList.add('active');
    if (pl.out) box.classList.add('out');
    const head = h('div', 'm4-pl-head');
    head.append(h('div', 'm4-pl-name', escapeHtml(pl.name)));
    const score = h('div', 'm4-pl-score', escapeHtml(mode === 'kohout' ? '' : fmtScore(cfg, mode === 'turns' && pl.score == null ? null : pl.score)));
    score.dataset.test = `score-${i}`;
    if (mode === 'turns' && pl.score == null) score.textContent = cfg.scoring === 'trefy' ? '0' : '–';
    head.append(score);
    box.append(head);

    if (mode === 'kohout') {
      const L = h('div', 'm4-letters');
      cfg.word.split('').forEach((ch, k) => L.append(h('span', k < pl.letters ? 'on' : '', ch)));
      L.dataset.test = `letters-${i}`;
      box.append(L);
    }
    if (mode === 'turns') {
      const left = attemptsFor(cfg, i) - pl.results.length;
      if (inputOf(cfg) === 'hitmiss') {
        const dots = h('div', 'm4-dots');
        for (let k = 0; k < attemptsFor(cfg, i); k++) dots.append(h('i', k < pl.results.length ? (pl.results[k] ? 'hit' : 'miss') : ''));
        box.append(dots);
      } else box.append(h('div', 'm4-pl-sub', pl.results.length ? `Pokusy: ${pl.results.map((v) => fmtScore(cfg, v)).join(', ')}` : ''));
      box.append(h('div', 'm4-pl-sub', left > 0 ? `Zbývá ${left} ${left === 1 ? 'pokus' : left < 5 ? 'pokusy' : 'pokusů'}` : 'Hotovo'));
    }
    if (mode === 'race') box.append(h('div', 'm4-pl-sub', `Do cíle: ${Math.max(0, cfg.target - pl.score)} · vedle ${pl.misses}×`));
    if (mode === 'series') box.append(h('div', 'm4-pl-sub', `Vyhraná kola (na ${winRounds(cfg)})`));
    if (st.finished) { if (st.winners.includes(i) && !solo) box.classList.add('active'); return box; }

    // ovládání
    const actBox = h('div', 'm4-act');
    if (mode === 'turns') {
      const kind = inputOf(cfg);
      const dis = !active || !!timing;
      if (kind === 'hitmiss') {
        actBox.append(bigBtn('m4-hit', `${icon('check')}Trefa`, () => act({ t: 'hit', p: i }), `hit-${i}`, dis), bigBtn('m4-miss', `${icon('x')}Vedle`, () => act({ t: 'miss', p: i }), `miss-${i}`, dis));
      } else if (kind === 'count') {
        const v = h('div', 'm4-big-num', '0'); v.dataset.test = `count-${i}`;
        actBox.classList.add('one');
        if (active) {
          let n = 0;
          const plus = bigBtn('m4-hit', `${icon('plus')}1`, () => { n++; v.textContent = String(n); sfx('tap'); }, `plus-${i}`);
          const minus = btn('−1', 'btn', () => { n = Math.max(0, n - 1); v.textContent = String(n); }, { test: `minus-${i}` });
          const ok = btn(`${icon('check')}Zapsat pokus`, 'btn-primary', () => act({ t: 'val', p: i, v: n }), { test: `commit-${i}` });
          const row = h('div', 'm4-row'); row.style.justifyContent = 'space-between'; row.append(v, minus, ok);
          actBox.append(row, plus);
        } else actBox.append(bigBtn('m4-miss', 'Čeká', () => {}, `wait-${i}`, true));
      } else if (kind === 'timed') {
        actBox.classList.add('one');
        if (active && timing && timing.kind === 'timed') {
          const v = h('div', 'm4-big-num', String(timing.count)); v.dataset.test = `count-${i}`;
          actBox.append(v, bigBtn('m4-hit', `${icon('plus')}1`, () => { timing.count++; v.textContent = String(timing.count); sfx('tap'); }, `plus-${i}`));
        } else actBox.append(bigBtn(active ? 'm4-hit' : 'm4-miss', `${icon('play')}Start ${cfg.durationSec} s`, () => startTimed(i), `start-${i}`, dis));
      } else if (kind === 'stopwatch') {
        actBox.classList.add('one');
        if (active && timing && timing.kind === 'stopwatch') {
          actBox.append(bigBtn('m4-hit', `${icon('stop')}Stop`, () => stopStopwatch(), `stop-${i}`));
          if (cfg.better === 'lower') actBox.append(btn('+2 s (shozený kužel)', 'btn', () => { timing.pen += 2; sfx('tap'); }, { test: `pen-${i}` }));
        } else actBox.append(bigBtn(active ? 'm4-hit' : 'm4-miss', `${icon('play')}Start stopek`, () => startStopwatch(i), `start-${i}`, dis));
      }
    } else if (mode === 'race') {
      actBox.append(bigBtn('m4-hit', `${icon('check')}Trefa`, () => act({ t: 'hit', p: i }), `hit-${i}`), bigBtn('m4-miss', `${icon('x')}Vedle`, () => act({ t: 'miss', p: i }), `miss-${i}`));
    } else if (mode === 'series') {
      const running = timing && timing.kind === 'round';
      actBox.classList.add('one');
      actBox.append(bigBtn('m4-hit', `${icon('trophy')}Kolo vyhrál`, () => { timing = null; act({ t: 'round', p: i }); }, `round-${i}`, running));
    } else if (mode === 'kohout') {
      if (active) {
        const lead = st.phase === 'lead';
        actBox.append(bigBtn('m4-hit', `${icon('check')}${lead ? 'Povedlo se' : 'Zopakoval'}`, () => act(lead ? { t: 'lead', ok: true } : { t: 'copy', p: i, ok: true }), `ok-${i}`),
          bigBtn('m4-miss', `${icon('x')}${lead ? 'Nepovedlo' : 'Nezopakoval'}`, () => act(lead ? { t: 'lead', ok: false } : { t: 'copy', p: i, ok: false }), `fail-${i}`));
      } else box.append(h('div', 'm4-pl-sub', pl.out ? 'Má celé slovo' : 'Kouká a čeká'));
    }
    if (actBox.childNodes.length) box.append(actBox);
    return box;
  }

  function paint() {
    undoB.style.visibility = log.length || timing ? 'visible' : 'hidden';
    if (st.finished) return finish();
    board.replaceChildren(...st.players.map(panel));
    // střed: časovač / kolo / KOHOUT
    if (!timing || timing.kind === 'round-over') {
      center.replaceChildren();
      if (st.mode === 'series') {
        const r = h('div', 'm4-col'); r.style.alignItems = 'center';
        r.append(h('div', 'm4-turn', `Kolo ${st.round + 1} z ${cfg.rounds || 3}`));
        if (crazy && ruleIdx >= 0) r.append(h('div', 'm4-note', escapeHtml(crazy[ruleIdx])));
        const row = h('div', 'm4-row'); row.style.justifyContent = 'center';
        if (cfg.roundSec || crazy) row.append(btn(`${icon('play')}${cfg.roundSec ? `Start kola (${cfg.roundSec} s)` : 'Nové pravidlo'}`, 'btn-primary', () => startRound(), { test: 'round-start' }));
        row.append(btn('Remíza v kole', 'btn', () => { timing = null; act({ t: 'round', p: -1 }); }, { test: 'round-draw' }));
        r.append(row);
        center.append(r);
      }
    }
    const a = st.active;
    if (st.mode === 'kohout') turnEl.textContent = st.phase === 'lead' ? `Předvádí: ${cfg.players[a].name}` : `Opakuje: ${cfg.players[a].name}`;
    else if (st.mode === 'turns') turnEl.textContent = solo ? 'Tvůj pokus' : `Na řadě: ${cfg.players[a].name}`;
    else if (st.mode === 'race') turnEl.textContent = `Kdo první dá ${cfg.target}`;
    else turnEl.textContent = `Na ${winRounds(cfg)} vítězná kola`;
    announceTurn();
  }

  // ---- konec ----
  function finish() {
    if (ended) return;
    ended = true; stopTimer(); timing = null;
    board.replaceChildren(...st.players.map(panel));
    center.replaceChildren();
    const res = h('div', 'm4-col'); res.style.alignItems = 'center'; res.dataset.test = 'duel-result';
    const meId = cfg.players.findIndex((x) => x.profileId === profileId);
    let line; let record = false;
    if (solo) {
      const pb = personalBest(prevDuels, cfg.challengeId, profileId);
      const sc = st.players[0].score;
      const better = cfg.scoring === 'trefy' ? 'higher' : cfg.better;
      record = sc != null && (pb == null || (better === 'lower' ? sc < pb : sc > pb));
      line = record ? (pb == null ? 'První rekord je zapsaný!' : 'Nový osobní rekord!') : `Rekord je ${fmtScore(cfg, pb)}. Příště ho dáš!`;
      if (record) say('duel_record', { kind: 'phrase' }); else say('record_beat', { kind: 'phrase' });
    } else if (st.draw) {
      line = 'Remíza!'; say('duel_draw', { kind: 'phrase' });
    } else {
      const w = cfg.players[st.winners[0]];
      line = `Vyhrává ${w.name}!`;
      sayText(line);
      if (meId >= 0 && !st.winners.includes(meId)) sayGroup('duel_rematch'); else sayGroup('duel_win');
    }
    res.append(h('div', 'title', escapeHtml(line)));
    if (!solo && meId >= 0 && !st.draw && !st.winners.includes(meId)) res.append(h('div', 'm4-strong', 'Odveta zítra! Každý souboj tě zlepšuje.'));
    const row = h('div', 'm4-row'); row.style.justifyContent = 'center';
    row.append(
      btn(`${icon('back')}Vrátit poslední`, 'btn', () => { ended = false; undo(); }, { test: 'result-undo' }),
      btn(`${icon('refresh')}Odveta`, 'btn btn-big', () => save().then(() => go('duelPlay', { profileId, cfg }, { replace: true })), { test: 'rematch' }),
      btn(`${icon('check')}Uložit a hotovo`, 'btn-primary btn-big', () => save().then(() => go('duelStats', { profileId }, { replace: true })), { auto: true, test: 'duel-done' }),
    );
    res.append(row);
    center.append(res);
    turnEl.textContent = 'Konec souboje';
    sfx('levelup');
  }

  let saving = null;
  function save() {
    if (saving) return saving;
    saving = (async () => {
      cleanup();
      const all = await listDuels();
      const rematch = isRematch(all, cfg.challengeId, profileId);
      await saveDuel(st, { rematch });
      for (const [i, pl] of cfg.players.entries()) {
        if (!pl.profileId) continue;
        const win = cfg.players.length > 1 && !st.draw && st.winners.includes(i);
        const rem = isRematch(all, cfg.challengeId, pl.profileId);
        await bump(pl.profileId, { duels: 1, wins: win ? 1 : 0, rematches: rem ? 1 : 0, kohout: cfg.type === 'kohout' ? 1 : 0 }, XP_DUEL);
      }
      const card = await awardOne(profileId, (c) => c.unlock && c.unlock.type === 'challenge');
      if (card) await revealCard(card);
    })();
    return saving;
  }

  // ---- start ----
  getChallenge(cfg.challengeId).then((ch) => {
    if (ch && ch.voiceIntro) { registerTexts({ [`challenge_${ch.id}`]: ch.voiceIntro }); }
  });
  if (solo) say('duel_solo', { kind: 'phrase' }); else say('duel_start', { kind: 'phrase' });
  if (cfg.handicap) sayText(`Hendikep: ${cfg.handicap}.`);
  paint();
  return el;
}
