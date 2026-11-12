// „Postav stanoviště“: návod krok po kroku (StationView + zvýrazněný kužel) a hlas Trenéra.
// Z domovské obrazovky vede před tréninkem (workout), nebo samostatně z nabídky Stanoviště.
import { h, btn, icon, header, u } from '../ui/dom.js';
import { createStationView } from '../ui/StationView.js';
import { say, stopVoice, registerTexts } from '../core/audio.js';
import { getProfile } from '../domain/profiles.js';
import { stationFor, getStation, stationsFor, allStations } from '../domain/stations.js';
import { buildWorkout } from '../domain/trainer.js';
import { settings } from '../storage/index.js';

export default function setup({ profileId, stationId, workout = null }, { go, back }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'setup';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const s = await settings.load();
    let wk = workout;
    let station = stationFor(getStation(wk ? wk.station.id : stationId) || allStations()[0], p.grip);
    let i = 0;

    const head = header(wk ? 'Než začneme' : 'Stanoviště', `Postav <span class="accent">${station.name.toLowerCase()}</span>`, () => { stopVoice(); back(); });
    const body = h('div', 'w-full flex flex-wrap items-stretch justify-center');
    body.style.cssText += `;flex:1;min-height:0;gap:${u(3)}`;
    const stage = h('div', ''); stage.style.cssText = `flex:1.3 1 ${u(40)};min-height:${u(30)};max-height:100%;min-width:0`;
    const side = h('div', 'flex flex-col justify-center'); side.style.cssText = `flex:1 1 ${u(36)};gap:${u(2)};min-width:0`;
    const stepNo = h('div', 'eyebrow');
    const text = h('div', ''); text.style.cssText = `font-weight:800;font-size:max(22px, ${u(3.4)});line-height:1.2`;
    text.dataset.test = 'setup-text';
    const meta = h('div', 'muted');
    const nav = h('div', 'flex flex-wrap'); nav.style.gap = u(1.4);
    side.append(stepNo, text, meta, nav);
    body.append(stage, side);
    el.append(head, body);

    let sv = null;
    const mount = () => {
      sv = createStationView({ station, grip: p.grip, ball: false, compact: true });
      sv.setPlayerVisible(true);
      stage.replaceChildren(sv.el);
      registerTexts(Object.fromEntries(station.setupSteps.map((x, k) => [`${station.voiceSetup}_${k + 1}`, x.text])));
      head.querySelector('.title').innerHTML = `Postav <span class="accent">${station.name.toLowerCase()}</span>`;
      meta.textContent = `${station.short} · potřebuješ asi ${station.size[0]} × ${station.size[1]} m. Místo kuželů můžeš použít boty nebo ponožky.`;
    };

    const paint = (speak = true) => {
      const steps = station.setupSteps;
      const stp = steps[i];
      const placed = new Set();
      steps.slice(0, i + 1).forEach((x) => x.highlight.forEach((n) => placed.add(n)));
      sv.showCones([...placed]);
      sv.highlight(stp.highlight);
      stepNo.textContent = `Krok ${i + 1} z ${steps.length}`;
      text.textContent = stp.text;
      nav.replaceChildren();
      const last = i === steps.length - 1;
      if (i > 0) nav.append(btn(`${icon('back')}Zpět`, 'btn', () => { i--; paint(); }));
      nav.append(btn(`${icon('volume')}Znovu`, 'btn', () => { stopVoice(); say(`${station.voiceSetup}_${i + 1}`, { kind: 'phrase', text: stp.text }); }));
      if (!last) nav.append(btn(`Další krok${icon('right')}`, 'btn-primary btn-big', () => { i++; paint(); }, { auto: true, test: 'setup-next' }));
      else if (wk) nav.append(btn(`${icon('play')}Mám postaveno`, 'btn-primary btn-big', () => startTraining(), { auto: true, test: 'setup-done' }));
      else nav.append(btn(`${icon('check')}Hotovo`, 'btn-primary btn-big', () => { stopVoice(); back(); }, { auto: true, test: 'setup-done' }));
      if (speak) { stopVoice(); if (i === 0) say('safety', { kind: 'phrase' }); say(`${station.voiceSetup}_${i + 1}`, { kind: 'phrase', text: stp.text }); }
    };

    const startTraining = () => {
      stopVoice();
      go('player', { profile: p, workout: wk, settings: s }, { replace: true });
    };

    if (wk) {
      // „už stojí“: přeskočit návod; „jiné stanoviště“: složit trénink pro další povolené stanoviště
      const extra = h('div', 'flex flex-wrap w-full'); extra.style.gap = u(1.4);
      extra.append(btn(`${icon('play')}Už stojí, trénovat`, 'btn', () => startTraining(), { test: 'setup-skip' }));
      const others = stationsFor(p.space, p.cones);
      if (others.length > 1) {
        extra.append(btn(`${icon('refresh')}Jiné stanoviště`, 'btn', () => {
          const k = others.findIndex((x) => x.id === station.id);
          const nx = others[(k + 1) % others.length];
          wk = buildWorkout(p, { quiet: s.quiet, stationId: nx.id });
          station = stationFor(wk.station, p.grip); i = 0; mount(); paint();
        }, { test: 'setup-other' }));
      }
      el.insertBefore(extra, body);
    }
    mount(); paint();
  })();
  return el;
}
