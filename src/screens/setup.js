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

    const head = header(wk ? 'Než začneme trénink' : 'Návod na postavení', `Postav ${station.name.toLowerCase()}`, () => { stopVoice(); back(); });
    const body = h('div', 'setup-body');
    const stage = h('div', 'setup-stage');
    const side = h('div', 'setup-side');
    const stepNo = h('div', 'label');
    const text = h('div', 'setup-text');
    text.dataset.test = 'setup-text';
    const meta = h('div', 'muted');
    const nav = h('div', 'setup-nav');
    side.append(stepNo, text, meta, nav);
    body.append(stage, side);
    el.append(head, body);

    let sv = null;
    const vkey = (k) => `${station.voiceSetup}${station.mirrored ? '_m' : ''}_${k}`; // levák: zrcadlený návod má vlastní nahrávky
    const mount = () => {
      sv = createStationView({ station, grip: p.grip, ball: false, compact: true });
      sv.setPlayerVisible(true);
      stage.replaceChildren(sv.el);
      registerTexts(Object.fromEntries(station.setupSteps.map((x, k) => [vkey(k + 1), x.text])));
      head.querySelector('.title').textContent = `Postav ${station.name.toLowerCase()}`;
      meta.textContent = `${station.short}, potřebuješ asi ${station.size[0]} × ${station.size[1]} m. Místo kuželů můžeš použít boty nebo ponožky.`;
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
      nav.append(btn(`${icon('volume')}Znovu`, 'btn', () => { stopVoice(); say(vkey(i + 1), { kind: 'phrase', text: stp.text }); }));
      if (!last) nav.append(btn(`Další krok${icon('right')}`, 'btn-primary btn-big', () => { i++; paint(); }, { auto: true, test: 'setup-next' }));
      else if (wk) nav.append(btn(`${icon('play')}Mám postaveno`, 'btn-primary btn-big', () => startTraining(), { auto: true, test: 'setup-done' }));
      else nav.append(btn(`${icon('check')}Hotovo`, 'btn-primary btn-big', () => { stopVoice(); back(); }, { auto: true, test: 'setup-done' }));
      if (speak) { stopVoice(); if (i === 0) say('safety', { kind: 'phrase' }); say(vkey(i + 1), { kind: 'phrase', text: stp.text }); }
    };

    const startTraining = () => {
      stopVoice();
      go('player', { profile: p, workout: wk, settings: s }, { replace: true });
    };

    if (wk) {
      // „už stojí“: přeskočit návod; „jiné stanoviště“: složit trénink pro další povolené stanoviště
      const extra = h('div', 'setup-extra');
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
