// Přehrávač tréninku (tok převzatý z reference): ukázka → 3-2-1 → cvik v tempu → odpočinek → další cvik → výsledek.
// Nově: StationView (stanoviště, hůl, míček), metronom na hodinách audia, hlas podle callMode, velký povel uprostřed,
// pauza klepnutím kamkoli, wake lock po dobu tréninku, flag busy (během tréninku žádná aktualizace appky).
// Během tréninku nejsou na obrazovce žádné drobné ovládací prvky – celá plocha je jedno tlačítko „pauza“.
import { h, btn, icon } from '../ui/dom.js';
import { createStationView } from '../ui/StationView.js';
import { CONE_COLORS } from '../ui/tokens.js';
import { say, sayGroup, stopVoice, voiceBusy, sfx, unlockAudio, preloadVoices, registerTexts, getVoiceMode } from '../core/audio.js';
import { createMetronome } from '../core/metronome.js';
import { enableWakeLock, disableWakeLock } from '../core/wakelock.js';
import { setBusy } from '../core/pwa.js';
import { TIME_SCALE, FAST } from '../core/env.js';
import { REST_SEC, PREVIEW_SEC, drillKind, isWeak } from '../domain/trainer.js';
import { getStation, stationFor, coneOf, stepCone } from '../domain/stations.js';

const PHASE_LABEL = { preview: 'Ukázka', countdown: 'Připrav se', play: 'Hraj', rest: 'Odpočinek' };

/** Kužel z boku (piktogram v povelu) – barva kuželu, volitelně číslo. */
const coneSvg = (color, n = '') => `<svg viewBox="0 0 100 100" aria-hidden="true">
  <rect x="6" y="84" width="88" height="12" rx="5" fill="var(--cone-${color})" stroke="var(--cone-edge)" stroke-width="2"/>
  <path d="M40 6 Q50 1 60 6 L82 84 H18 Z" fill="var(--cone-${color})" stroke="var(--cone-edge)" stroke-width="2" stroke-linejoin="round"/>
  ${n !== '' ? `<text x="50" y="62" text-anchor="middle" dominant-baseline="central" style="font-family:var(--font);font-stretch:78%;font-weight:700" font-size="50" fill="var(--cone-${color}-ink)">${n}</text>` : ''}
</svg>`;

export default function player({ profile, workout, settings: s = {} }, { go, onBack }) {
  const drills = workout.drills;
  const grip = profile.grip || 'right';
  const tempoMul = s.tempoMul || 1;
  const el = h('section', 'screen player');
  el.dataset.test = 'player';

  // ---- rozvržení: nahoře název a odpočet, uprostřed stanoviště + povel, dole nenápadný průběh ----
  const top = h('div', 'player-top');
  const tl = h('div', 'player-titles');
  const phaseEl = h('div', 'player-phase');
  const nameEl = h('div', 'player-name');
  tl.append(phaseEl, nameEl);
  const timerEl = h('div', 'player-timer');
  top.append(tl, timerEl);
  const bottom = h('div', 'player-bottom');
  const prog = h('div', 'player-progress');
  const segFill = drills.map(() => { const d = h('div'); const i = h('i'); d.append(i); prog.append(d); return i; });
  const countEl = h('div', 'player-count');
  bottom.append(prog, countEl);
  const main = h('div', 'player-main');
  const stage = h('div', 'player-stage');
  const callBox = h('div', 'player-call');
  const callBig = h('div', 'call-big'); callBig.dataset.test = 'call';
  const callText = h('div', 'call-text');
  const callWord = h('div', 'call-word');
  const taskEl = h('div', 'player-task');
  callText.append(callWord, taskEl);
  callBox.append(callBig, callText);
  main.append(stage, callBox);
  const cd = h('div', 'countdown');
  const cdText = h('span'); cd.append(cdText);
  el.append(top, main, bottom, cd);

  // ---- stav ----
  let idx = 0;
  let phase = 'preview';
  let elapsed = 0;           // ms ve fázi (jen když neběží pauza)
  let last = performance.now();
  let paused = false; let finished = false;
  let overlay = null;
  let sv = null; let st = null;
  let metro = null; let nextBeat = 0;
  let lastCone = null;
  let said = {};
  let done = 0;
  let playedSec = 0;

  const drill = () => drills[idx];
  const pattern = (d) => (d.pattern && d.pattern.length ? d.pattern : null);
  const T = (ms) => ms * TIME_SCALE;
  const setSeg = (frac) => segFill.forEach((f, i) => { f.style.width = `${(i < idx ? 1 : i === idx ? Math.min(1, frac) : 0) * 100}%`; });

  // texty pro TTS zálohu (úvody cviků)
  registerTexts(Object.fromEntries(drills.map((d) => [`drill_${d.id}`, d.voiceIntro])));

  function mountStation(d) {
    if (sv) sv.destroy();
    st = stationFor(getStation(d.setupId) || workout.station, grip);
    sv = createStationView({ station: st, grip, ball: drillKind(d) === 'ball', pattern: pattern(d) || [] });
    stage.replaceChildren(sv.el);
    if (drillKind(d) === 'stretch') sv.setPlayerVisible(true);
    // rozcvička a protažení: kužely, které cvik nepoužívá, se nekreslí (u protažení žádné)
    if (drillKind(d) !== 'ball') sv.showCones((pattern(d) || []).map(stepCone).filter(Boolean), { rest: 0 });
  }

  // povel: kužel (piktogram s číslem), barva (piktogram bez čísla), forhend (kruh F) / bekhend (čtverec B), domeček (H)
  function setCall(kind, value) {
    callBig.dataset.kind = 'none';
    callBig.textContent = ''; callWord.textContent = '';
    if (kind === 'cone' || kind === 'color') {
      const c = coneOf(st, value); if (!c) return;
      callBig.dataset.kind = kind;
      callBig.innerHTML = coneSvg(c.color, kind === 'cone' ? String(c.n) : '');
      callWord.textContent = kind === 'cone' ? CONE_COLORS[c.color].name : CONE_COLORS[c.color].name.toUpperCase();
    } else if (kind === 'blade') {
      callBig.dataset.kind = value === 'bh' ? 'bh' : 'fh';
      callBig.textContent = value === 'bh' ? 'B' : 'F';
      callWord.textContent = value === 'bh' ? 'BEKHEND' : 'FORHEND';
    } else if (kind === 'home') {
      callBig.dataset.kind = 'home';
      callBig.textContent = 'H'; callWord.textContent = 'domeček';
    }
    if (callBig.animate && callBig.dataset.kind !== 'none') callBig.animate([{ transform: 'scale(.9)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 140, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }

  // úder → krok patternu (kroky s `beats` > 1 zabírají víc úderů)
  const tlCache = new WeakMap();
  function timeline(pt) {
    if (tlCache.has(pt)) return tlCache.get(pt);
    const tl = [];
    pt.forEach((s, k) => { const n = Math.max(1, Math.round(s.beats || 1)); for (let b = 0; b < n; b++) tl.push({ k, first: b === 0 }); });
    tlCache.set(pt, tl);
    return tl;
  }

  // ---- jeden úder cviku ----
  function onBeat(i, glideMs, demo = false) {
    const d = drill();
    const pt = pattern(d);
    if (!pt) return;
    let step; let next;
    if (d.callMode === 'náhodná reakce') {
      // cíl se losuje z kuželů stanoviště (nikdy dvakrát stejný); každý druhý úder návrat do domečku
      if (i % 2 === 1) step = { at: 'home', blade: 'fh' };
      else {
        const opts = st.cones.map((c) => c.n).filter((n) => n !== lastCone);
        lastCone = opts[Math.floor(Math.random() * opts.length)];
        step = { at: lastCone, blade: Math.random() < 0.5 ? 'fh' : 'bh' };
      }
      next = null;
    } else {
      if (d.freeform) { sv.hideNext(); sv.highlight([]); return; } // Volná jízda: jen tempo, žádná trasa
      // krok může trvat víc úderů (`beats`, dlouhé přesuny): na jeho dalších úderech se jen pokračuje v pohybu
      const tl = timeline(pt);
      const slot = tl[i % tl.length];
      if (!slot.first) return;
      step = pt[slot.k];
      next = pt.length > 1 ? pt[(slot.k + 1) % pt.length] : null;
      glideMs = glideMs * (step.beats || 1);
    }
    sv.moveTo(step, glideMs);
    if (next) sv.showNext(next); else sv.hideNext();
    const cone = stepCone(step);
    sv.highlight(cone ? [cone] : []);
    if (drillKind(d) !== 'ball' && drillKind(d) !== 'nobal') return;
    // povel
    let key = null;
    const mode = d.callMode;
    if ((mode === 'zóna' || mode === 'náhodná reakce') && cone) { setCall('cone', cone); key = mode === 'náhodná reakce' ? `color_${coneOf(st, cone).color}` : `num_${cone}`; }
    else if (mode === 'barva' && cone) { setCall('color', cone); key = `color_${coneOf(st, cone).color}`; }
    else if (step.at === 'home' && (mode === 'zóna' || mode === 'náhodná reakce' || mode === 'barva')) { setCall('home'); key = mode === 'náhodná reakce' ? null : 'home'; }
    else if (step.blade) { setCall('blade', step.blade); if (mode === 'směr' || mode === 'zóna' || mode === 'barva') key = `blade_${step.blade}`; }
    if (demo || !key) return;
    const total = T(d.durationSec * 1000);
    const bms = 60000 / (d.tempoBpm * tempoMul);
    if (!said.almost && total - elapsed <= T(6000) && d.durationSec >= 35) { said.almost = true; sayGroup('almost'); return; }
    if (!said.praise && bms >= 1200 && elapsed / total > 0.45 && Math.random() < 0.35) { said.praise = true; sayGroup('praise'); return; }
    say(key);
  }

  // ukázka: pattern běží pomaleji, bez hlášení povelů
  let demoTimer = null;
  function startDemo(d) {
    stopDemo();
    const pt = pattern(d); if (!pt) return;
    const ms = Math.max(T(700), T(60000 / (d.tempoBpm * tempoMul)) * (d.tempoBpm > 40 ? 1.4 : 0.8));
    let i = 0;
    const tick = () => { onBeat(i++, Math.min(900, ms * 0.7), true); };
    tick();
    demoTimer = setInterval(tick, ms);
  }
  function stopDemo() { if (demoTimer) { clearInterval(demoTimer); demoTimer = null; } }

  function startMetro(fromBeat = 0) {
    const d = drill();
    if (!pattern(d)) return;
    const vm = getVoiceMode();
    const bpm = FAST ? Math.max(d.tempoBpm * tempoMul, 120) : d.tempoBpm * tempoMul;
    const glide = Math.min(1100, (60000 / bpm) * 0.6);
    metro = createMetronome({ bpm, click: vm === 'off' ? false : vm === 'beeps' ? 'beep' : 'tick', accentEvery: !d.freeform && d.callMode !== 'náhodná reakce' && timeline(pattern(d)).length > 1 ? timeline(pattern(d)).length : 0, onBeat: (i) => onBeat(i, glide) });
    metro.start(fromBeat);
  }
  function stopMetro() { if (metro) { nextBeat = metro.stop(); metro = null; } }

  function enter(p) {
    phase = p; elapsed = 0;
    el.dataset.phase = p; el.dataset.drillIndex = String(idx);
    phaseEl.textContent = PHASE_LABEL[p];
    countEl.textContent = `cvik ${idx + 1} z ${drills.length}`;
    const d = drill();
    if (p === 'preview') {
      said = {}; lastCone = null; nextBeat = 0;
      mountStation(d);
      nameEl.textContent = d.name;
      taskEl.textContent = d.voiceIntro;
      setCall('none');
      callWord.textContent = drillKind(d) === 'nobal' ? 'Rozcvička' : drillKind(d) === 'stretch' ? 'Protažení' : (isWeak(d) ? 'Slabší strana' : '');
      setSeg(0);
      preloadVoices([`drill_${d.id}`]);
      if (drillKind(d) === 'nobal' && idx === 0) say('warmup', { kind: 'phrase' });
      if (drillKind(d) === 'stretch') say('stretch', { kind: 'phrase' });
      say(`drill_${d.id}`, { kind: 'phrase', text: d.voiceIntro });
      if (isWeak(d) && drillKind(d) === 'ball') sayGroup('weak');
      startDemo(d);
    } else if (p === 'countdown') {
      stopDemo(); sv.reset(); taskEl.textContent = '';
    } else if (p === 'play') {
      taskEl.textContent = (d.coachingPoints || [])[0] || '';
      if (!pattern(d)) setCall('none');
      startMetro(0);
    } else if (p === 'rest') {
      stopMetro(); sv.hideNext(); sv.highlight([]);
      done++; playedSec += d.durationSec; sfx('success'); setSeg(1);
      const nx = drills[idx + 1];
      if (!nx) { finish(false); return; }
      nameEl.textContent = 'Odpočinek';
      setCall('none'); callWord.textContent = 'Další cvik';
      taskEl.textContent = nx.name;
      if (idx + 2 >= drills.length) sayGroup('last'); else sayGroup('rest');
    }
  }

  function flash(text) {
    cdText.textContent = text;
    if (cdText.animate) cdText.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.03)', offset: 0.3 }, { opacity: 0, transform: 'scale(1.1)' }], { duration: Math.max(300, T(950)), easing: 'ease-out', fill: 'forwards' });
  }

  let cdLast = 4;
  function step(dt) {
    elapsed += dt;
    const d = drill();
    if (phase === 'preview') {
      const pv = T(PREVIEW_SEC * 1000);
      timerEl.textContent = '';
      // odpočet začne, až dozní věta (nic se neusekne); nejvýš 9 s navíc
      if (elapsed >= pv && (FAST || !voiceBusy() || elapsed >= pv + 9000)) { cdLast = 4; enter('countdown'); }
    } else if (phase === 'countdown') {
      const n = 3 - Math.floor(elapsed / T(1000));
      if (n !== cdLast && n >= 1) { cdLast = n; flash(String(n)); say(`countdown_${n}`, { kind: 'urgent' }); timerEl.textContent = ''; }
      if (n < 1) { flash('HRAJ'); sayGroup('go', { kind: 'urgent' }); enter('play'); }
    } else if (phase === 'play') {
      const total = T(d.durationSec * 1000);
      timerEl.textContent = String(Math.max(0, Math.ceil((total - elapsed) / (1000 * TIME_SCALE))));
      setSeg(elapsed / total);
      if (elapsed >= total) enter('rest');
    } else if (phase === 'rest') {
      const total = T(REST_SEC * 1000);
      timerEl.textContent = String(Math.max(0, Math.ceil((total - elapsed) / (1000 * TIME_SCALE))));
      if (elapsed >= total) { idx++; enter('preview'); }
    }
  }

  const loop = setInterval(() => {
    const now = performance.now(); const dt = Math.min(250, now - last); last = now;
    if (!paused && !finished) step(dt);
  }, 50);

  function cleanup() {
    clearInterval(loop); stopDemo(); stopMetro(); if (sv) sv.destroy();
    document.removeEventListener('visibilitychange', onVis);
    disableWakeLock(); setBusy(false);
  }
  function finish(aborted) {
    if (finished) return; finished = true;
    cleanup();
    if (aborted) stopVoice();
    go('result', { profileId: profile.id, drillIds: drills.slice(0, done).map((d) => d.id), total: drills.length, done, aborted, durationSec: playedSec }, { replace: true });
  }

  // ---- pauza: klepnutí kamkoli ----
  function setPaused(p) {
    if (finished) return;
    paused = p;
    if (overlay) { overlay.remove(); overlay = null; }
    if (!p) {
      unlockAudio(); enableWakeLock();
      last = performance.now();
      if (phase === 'play') startMetro(nextBeat);
      if (phase === 'preview') startDemo(drill());
      sayGroup('resume', { kind: 'urgent' });
      onBack(() => setPaused(true));
      return;
    }
    stopMetro(); stopDemo(); stopVoice();
    sayGroup('pause', { kind: 'urgent' });
    overlay = h('div', 'player-overlay');
    overlay.dataset.test = 'pause-overlay';
    overlay.append(h('div', 'title', 'Pauza'));
    const row = h('div', 'pause-actions');
    const resume = btn(`${icon('play')}Pokračovat`, 'btn-primary', () => setPaused(false), { auto: true, test: 'resume' });
    const skip = btn(`${icon('skip')}Přeskočit cvik`, 'btn', () => skipDrill(), { test: 'skip' });
    const stop = btn(`${icon('stop')}Konec`, 'btn', () => finish(true), { test: 'stop' });
    row.append(resume, skip, stop);
    overlay.append(row);
    overlay.addEventListener('click', (e) => e.stopPropagation());
    overlay.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.appendChild(overlay);
    onBack(() => setPaused(false));
  }
  // přeskočit: další cvik začne ukázkou (přeskočený se nepočítá); v odpočinku jen zkrátí odpočinek
  function skipDrill() {
    if (finished) return;
    stopMetro(); stopDemo(); stopVoice();
    if (overlay) { overlay.remove(); overlay = null; }
    paused = false;
    unlockAudio(); enableWakeLock();
    last = performance.now();
    onBack(() => setPaused(true));
    if (idx + 1 >= drills.length) { finish(phase !== 'rest'); return; }
    idx++; enter('preview');
  }
  el.addEventListener('click', () => { if (!paused) setPaused(true); });
  el.tabIndex = 0;
  el.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !paused) { e.preventDefault(); setPaused(true); } });
  onBack(() => setPaused(true));

  // appka do pozadí → pauza (metronom by na iOS stejně stál a dítě by o kus přišlo)
  const onVis = () => { if (document.visibilityState === 'hidden' && !paused && !finished) setPaused(true); };
  document.addEventListener('visibilitychange', onVis);

  // ---- start ----
  setBusy(true);
  enableWakeLock();          // voláno synchronně z klepnutí, které přehrávač otevřelo (video záloha potřebuje gesto)
  el.dataset.total = String(drills.length);
  enter('preview');
  setTimeout(() => el.focus(), 0);
  return el;
}

