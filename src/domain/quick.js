// Rychlé volby z menu: reakční režim, samostatná rozcvička a protažení. Skládají seznam cviků pro existující přehrávač.
import { allDrills, drillKind, drillCost } from './trainer.js';
import { stationsFor, getStation } from './stations.js';

const shuffle = (a, rnd = Math.random) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pack = (station, list) => ({ station, drills: list, totalSec: list.reduce((a, d) => a + drillCost(d), 0) });

export const isReaction = (d) => drillKind(d) === 'ball' && (d.callMode === 'náhodná reakce' || d.callMode === 'barva');

/**
 * Reakční režim: cviky s callMode „náhodná reakce“ nebo „barva“ na stanovišti, které hráč umí postavit.
 * Jedno stanoviště (nepřestavuje se): to s nejvíc reakčními cviky do úrovně hráče (spot jen když nic jiného).
 */
export function reactionWorkout(profile, { quiet = false, max = 5, rnd = Math.random } = {}) {
  const level = profile.level || 1;
  const allowed = stationsFor(profile.space, profile.cones).map((s) => s.id);
  const ok = (d, lv) => isReaction(d) && allowed.includes(d.setupId) && d.level <= lv && (!quiet || d.noise === 'tichý');
  let lv = level;
  let pool = allDrills().filter((d) => ok(d, lv));
  while (!pool.length && lv < 5) { lv++; pool = allDrills().filter((d) => ok(d, lv)); }
  if (!pool.length) return null;
  const by = {};
  pool.forEach((d) => { (by[d.setupId] = by[d.setupId] || []).push(d); });
  const ids = Object.keys(by).sort((a, b) => (a === 'spot') - (b === 'spot') || by[b].length - by[a].length);
  const main = ids[0];
  const list = shuffle([...by[main], ...(main !== 'spot' && by.spot ? by.spot : [])], rnd).sort((a, b) => a.level - b.level).slice(0, max);
  const warm = shuffle(allDrills().filter((d) => drillKind(d) === 'nobal' && d.setupId === 'spot' && d.level <= level && (!quiet || d.noise === 'tichý')), rnd).slice(0, 1);
  return pack(getStation(main), [...warm, ...list]);
}

/** Samostatná rozcvička (kind nobal) nebo protažení (kind stretch), cca 3–4 minuty, jen na místě (spot, nic se nestaví). */
export function kindWorkout(profile, kind, { quiet = false, targetSec = 210, rnd = Math.random } = {}) {
  const level = profile.level || 1;
  const pool = shuffle(allDrills().filter((d) => drillKind(d) === kind && d.setupId === 'spot' && (kind !== 'nobal' || d.level <= level) && (!quiet || d.noise === 'tichý')), rnd);
  const list = [];
  let t = 0;
  for (const d of pool) { if (list.length && t + drillCost(d) > targetSec) continue; list.push(d); t += drillCost(d); if (t >= targetSec) break; }
  if (!list.length) return null;
  return pack(getStation(list[0].setupId) || getStation('spot'), list);
}
