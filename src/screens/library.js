// Knihovna: seznam stanovišť (s návodem na postavení) a seznam cviků (spuštění jednoho cviku).
import { h, btn, u, icon, header, escapeHtml } from '../ui/dom.js';
import { createStationView } from '../ui/StationView.js';
import { getProfile, SKILL_LEVELS } from '../domain/profiles.js';
import { allStations, stationFor, getStation, stationsFor } from '../domain/stations.js';
import { allDrills, singleDrillWorkout, drillKind, CALL_LABELS } from '../domain/trainer.js';
import { settings } from '../storage/index.js';

export function stationsScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'stations';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const ok = new Set(stationsFor(p.space, p.cones).map((s) => s.id));
    el.append(header('Návody na postavení', 'Stanoviště', () => back()));
    const grid = h('div', 'tiles');
    grid.style.gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${u(26)}), 1fr))`;
    for (const st0 of allStations()) {
      const st = stationFor(st0, p.grip);
      const c = btn('', `card${ok.has(st.id) ? '' : ''}`, () => go('setup', { profileId: p.id, stationId: st.id }), { test: `station-${st.id}` });
      c.style.cssText += `;display:flex;flex-direction:column;gap:${u(0.8)};opacity:${ok.has(st.id) ? 1 : 0.55}`;
      const pic = h('div', ''); pic.style.cssText = `height:${u(22)};min-height:120px;pointer-events:none`;
      const sv = createStationView({ station: st, grip: p.grip, ball: false, compact: true });
      sv.setPlayerVisible(false);
      pic.append(sv.el);
      c.append(pic, h('div', '', `<b>${st.name}</b>`), h('div', 'muted', `${st.short}, ${ok.has(st.id) ? 'vejde se ti' : 'potřebuješ víc místa nebo kuželů'}`));
      grid.append(c);
    }
    el.append(grid);
  })();
  return el;
}

export function drillsScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'drills';
  (async () => {
    const [p, s] = await Promise.all([getProfile(profileId), settings.load()]);
    if (!p) return go('profiles', {}, { replace: true });
    el.append(header('Knihovna', 'Cviky', () => back()));
    const levels = [...new Set(allDrills().map((d) => d.level))].sort();
    for (const lv of levels) {
      const list = allDrills().filter((d) => d.level === lv && drillKind(d) === 'ball');
      if (!list.length) continue;
      const sec = h('div', 'w-full flex flex-col'); sec.style.gap = u(1);
      sec.append(h('div', 'panel-title', `Úroveň ${lv}: ${SKILL_LEVELS[lv] || ''}${lv > p.level ? ' (zatím těžké)' : ''}`));
      const grid = h('div', 'tiles');
      grid.style.gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${u(30)}), 1fr))`;
      for (const d of list) {
        const st = stationFor(getStation(d.setupId), p.grip);
        const c = btn('', 'card', () => go('player', { profile: p, workout: singleDrillWorkout(d), settings: s }), { test: `drill-${d.id}` });
        c.style.cssText += `;display:flex;gap:${u(1.4)};align-items:center;text-align:left`;
        const pic = h('div', ''); pic.style.cssText = `width:${u(12)};height:${u(12)};min-width:72px;min-height:72px;flex:none;pointer-events:none`;
        const sv = createStationView({ station: st, grip: p.grip, pattern: d.pattern, compact: true });
        sv.setPlayerVisible(false);
        pic.append(sv.el);
        const t = h('div', 'flex flex-col'); t.style.gap = u(0.4);
        t.append(h('div', '', `<b>${escapeHtml(d.name)}</b>`), h('div', 'muted', `${st.name}, ${CALL_LABELS[d.callMode] || ''}, ${d.durationSec} s${d.noise === 'tichý' ? ', tichý' : ''}`));
        c.append(pic, t, h('div', 'muted', icon('play')));
        grid.append(c);
      }
      sec.append(grid); el.append(sec);
    }
  })();
  return el;
}
