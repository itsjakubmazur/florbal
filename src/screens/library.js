// Knihovna: seznam stanovišť (s návodem na postavení) a seznam cviků (spuštění jednoho cviku).
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import { createStationView } from '../ui/StationView.js';
import { getProfile, SKILL_LEVELS } from '../domain/profiles.js';
import { allStations, stationFor, getStation, stationsFor } from '../domain/stations.js';
import { allDrills, singleDrillWorkout, drillKind, CALL_LABELS } from '../domain/trainer.js';
import { settings } from '../storage/index.js';

export function stationsScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top kid');
  el.dataset.test = 'stations';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const ok = new Set(stationsFor(p.space, p.cones).map((s) => s.id));
    el.append(header('Jak postavit kužely', 'Stanoviště', () => back()));
    const grid = h('div', 'station-grid');
    for (const st0 of allStations()) {
      const st = stationFor(st0, p.grip);
      const fits = ok.has(st.id);
      const c = btn('', `card station-card${fits ? '' : ' no'}`, () => go('setup', { profileId: p.id, stationId: st.id }), { test: `station-${st.id}` });
      const pic = h('div', 'station-pic');
      const sv = createStationView({ station: st, grip: p.grip, ball: false, compact: true });
      sv.setPlayerVisible(false);
      pic.append(sv.el);
      const t = h('div', 'station-text');
      t.append(h('div', 'station-name', escapeHtml(st.name)), h('div', 'muted small', escapeHtml(st.short)),
        h('div', 'station-fit', fits ? `${icon('check')}Vejde se ti` : 'Potřebuješ víc místa nebo kuželů'));
      c.append(pic, t);
      grid.append(c);
    }
    el.append(grid);
  })();
  return el;
}

const lower = (s) => (s && !/^\p{Lu}{2}/u.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export function drillsScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top kid');
  el.dataset.test = 'drills';
  (async () => {
    const [p, s] = await Promise.all([getProfile(profileId), settings.load()]);
    if (!p) return go('profiles', {}, { replace: true });
    el.append(header('Klepni a cvič jeden cvik', 'Cviky', () => back()));
    const levels = [...new Set(allDrills().map((d) => d.level))].sort();
    for (const lv of levels) {
      const list = allDrills().filter((d) => d.level === lv && drillKind(d) === 'ball');
      if (!list.length) continue;
      const hard = lv > p.level;
      const sec = h('div', 'section');
      sec.append(h('div', 'section-title', `Úroveň ${lv}: ${SKILL_LEVELS[lv] || ''}${hard ? '<span class="muted">, zatím těžké</span>' : ''}`));
      const grid = h('div', 'lib-grid');
      for (const d of list) {
        const st = stationFor(getStation(d.setupId), p.grip);
        const c = btn('', `card drill-card${hard ? ' hard' : ''}`, () => go('player', { profile: p, workout: singleDrillWorkout(d), settings: s }), { test: `drill-${d.id}` });
        const pic = h('div', 'drill-thumb');
        const sv = createStationView({ station: st, grip: p.grip, pattern: d.pattern, compact: true });
        sv.setPlayerVisible(false);
        pic.append(sv.el);
        const t = h('div', '');
        const meta = [st.name, lower(CALL_LABELS[d.callMode] || ''), `${d.durationSec} s`, d.noise === 'tichý' ? 'tichý' : ''].filter(Boolean).join(', ');
        t.append(h('div', 'drill-name', escapeHtml(d.name)), h('div', 'drill-meta', escapeHtml(meta)));
        c.innerHTML = '';
        c.append(pic, t);
        c.insertAdjacentHTML('beforeend', icon('play'));
        grid.append(c);
      }
      sec.append(grid); el.append(sec);
    }
  })();
  return el;
}
