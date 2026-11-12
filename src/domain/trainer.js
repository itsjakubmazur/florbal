// Skládání tréninku (port váženého losu z reference, rozšířený o prostor, výbavu a strany čepele).
//
// 1) Stanoviště: z prostoru (small/medium/large) a počtu kuželů vyjdou povolená stanoviště. Na trénink se postaví
//    JEDNO hlavní (dítě nebude uprostřed tréninku přestavovat); cviky „spot“ (na místě) jdou u každého stanoviště.
// 2) Úroveň: cviky do úrovně hráče; lehčí mají vyšší váhu (začátečník dostane víc jistoty), úroveň hráče plnou.
// 3) Slabší strana (bekhend, jednoruč): menší, ale stálý podíl – aspoň 1 cvik (od 4 cviků), nejvýš ~25 %.
//    Analogie slabší nohy z reference (tam max ~20 %).
// 4) Rozcvička (kind nobal) na začátku, protažení (kind stretch) na konci.
// 5) Tichý režim: jen cviky s noise „tichý“.
import drills from '../content/drills.json';
import { stationsFor, getStation } from './stations.js';

export const allDrills = () => drills;
export const getDrill = (id) => drills.find((d) => d.id === id) || null;
export const REST_SEC = 15;
export const PREVIEW_SEC = 6;
export const WEAK_MAX = 0.25;

export const isWeak = (d) => d.bladeSide === 'bekhend' || String(d.grip || '').startsWith('jednoruč');
export const drillKind = (d) => d.kind || 'ball';
export const drillCost = (d) => d.durationSec + REST_SEC + PREVIEW_SEC + 3;
export const beatMs = (d, mul = 1) => Math.round(60000 / (d.tempoBpm * mul));

const usable = (d, stationIds, quiet) => stationIds.includes(d.setupId) && (!quiet || d.noise === 'tichý');

/** Vážený los bez vracení (klíč = náhoda^(1/váha)). */
const weightedOrder = (list, weight, rnd = Math.random) => list
  .map((d) => ({ d, k: Math.pow(rnd(), 1 / Math.max(0.01, weight(d))) }))
  .sort((a, b) => b.k - a.k).map((x) => x.d);

/** Vybere hlavní stanoviště: preferované, pokud je povolené a má cviky; jinak losem podle počtu cviků. */
export function pickStation(profile, { quiet = false, preferred = null, rnd = Math.random } = {}) {
  const allowed = stationsFor(profile.space, profile.cones);
  const maxLevel = profile.level || 1;
  const count = (st) => drills.filter((d) => drillKind(d) === 'ball' && d.level <= maxLevel && usable(d, [st.id], quiet)).length;
  const cands = allowed.filter((st) => count(st) > 0);
  if (!cands.length) return allowed[0] || getStation('spot');
  if (preferred && cands.some((c) => c.id === preferred)) return getStation(preferred);
  const main = cands.filter((c) => c.id !== 'spot');
  const pool = main.length ? main : cands;
  return weightedOrder(pool, (st) => count(st), rnd)[0];
}

/**
 * Sestaví trénink.
 * @returns {{ station, drills: object[], totalSec: number }}
 */
export function buildWorkout(profile, { quiet = false, stationId = null, rnd = Math.random } = {}) {
  const station = stationId ? getStation(stationId) : pickStation(profile, { quiet, rnd });
  const ids = [...new Set([station.id, 'spot'])];
  const level = Math.max(1, Math.min(5, profile.level || 1));
  const target = (profile.sessionLength || 10) * 60;

  const warm = weightedOrder(drills.filter((d) => drillKind(d) === 'nobal' && d.level <= level && usable(d, ids, quiet)), () => 1, rnd);
  const stretch = weightedOrder(drills.filter((d) => drillKind(d) === 'stretch' && usable(d, ids, quiet)), () => 1, rnd);
  const ball = drills.filter((d) => drillKind(d) === 'ball' && d.level <= level && usable(d, ids, quiet));

  const head = warm.slice(0, target >= 600 ? 2 : 1);
  const tail = stretch.slice(0, 1);
  let budget = target - [...head, ...tail].reduce((a, d) => a + drillCost(d), 0);

  // váha: úroveň hráče 1, každá úroveň níž o 0,15 méně (min 0,4); cviky pro hlavní stanoviště mírně preferované
  const weight = (d) => Math.max(0.4, 1 - (level - d.level) * 0.15) * (d.setupId === station.id ? 1.3 : 1);
  const strong = weightedOrder(ball.filter((d) => !isWeak(d)), weight, rnd);
  const weak = weightedOrder(ball.filter(isWeak), weight, rnd);

  const list = [];
  let wi = 0; let si = 0; let weakN = 0;
  const fits = (d) => drillCost(d) <= budget || list.length < 2;
  const MAX = 16;
  while (list.length < MAX && (si < strong.length || wi < weak.length)) {
    const n = list.length + 1;
    const needWeak = weak.length > wi && (weakN + 1) / n <= WEAK_MAX + 1e-9 && ((n >= 4 && weakN === 0) || n % 4 === 0);
    let d = null;
    if (needWeak) { d = weak[wi++]; weakN++; }
    else if (si < strong.length) d = strong[si++];
    else if (weak.length > wi && (weakN + 1) / n <= WEAK_MAX + 1e-9) { d = weak[wi++]; weakN++; }
    else break;
    if (!fits(d)) break;
    list.push(d); budget -= drillCost(d);
    if (budget <= 0) break;
  }
  // stálý podíl: od 4 cviků aspoň jeden na slabší stranu (nahradí poslední silný)
  if (list.length >= 4 && weakN === 0 && weak.length) {
    const idx = list.length - 1; list[idx] = weak[0];
  }
  // krátké tréninky: když se nic nevejde, dej aspoň jeden cvik
  if (!list.length && ball.length) list.push(weightedOrder(ball, weight, rnd)[0]);
  // pořadí: od lehčích k těžším (rozjezd), na stejné úrovni náhodně
  list.sort((a, b) => a.level - b.level);
  const out = [...head, ...list, ...tail];
  return { station, drills: out, totalSec: out.reduce((a, d) => a + drillCost(d), 0) };
}

/** Trénink z jednoho vybraného cviku (knihovna cviků). */
export function singleDrillWorkout(drill) {
  return { station: getStation(drill.setupId), drills: [drill], totalSec: drillCost(drill) };
}

export const CALL_LABELS = { 'zóna': 'Čísla', 'barva': 'Barvy', 'směr': 'Forhend / bekhend', 'náhodná reakce': 'Reakce', 'žádný': 'Jen tempo' };
