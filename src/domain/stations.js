// Stanoviště a geometrie (SPEC kap. 1–3). Jednotky metry, (0,0) = domeček, x doprava z pohledu hráče, y dopředu k tabletu.
import stations from '../content/stations.json';

export const allStations = () => stations;
export const getStation = (id) => stations.find((s) => s.id === id) || null;

/** Které stanoviště se vejde do jakého prostoru. */
export const SPACE_STATIONS = {
  small: ['spot'],
  medium: ['spot', 'triangle', 'square'],
  large: ['spot', 'triangle', 'square', 'line', 'zigzag'],
};
export const SPACE_LABELS = { small: 'Malý (1 × 2 m)', medium: 'Střední (3 × 3 m)', large: 'Velký (3 × 5 m)' };

/** Stanoviště použitelná pro daný prostor a počet kuželů. */
export const stationsFor = (space = 'medium', cones = 4) =>
  (SPACE_STATIONS[space] || SPACE_STATIONS.medium).map(getStation).filter((s) => s && s.minCones <= cones);

/** +1 pravák (forhend vpravo), −1 levák (forhend vlevo). */
export const sideSign = (grip) => (grip === 'left' ? -1 : 1);

const swapLR = (t) => t.replace(/doleva|doprava|vlevo|vpravo/g, (w) => ({ doleva: 'doprava', doprava: 'doleva', vlevo: 'vpravo', vpravo: 'vlevo' }[w]));

/** Stanoviště pro daného hráče: asymetrická (mirror: true) se pro leváka zrcadlí přes osu y (x → −x) i s návodem. */
export function stationFor(station, grip = 'right') {
  if (!station) return null;
  if (!station.mirror || grip !== 'left') return { ...station, mirrored: false };
  return {
    ...station,
    mirrored: true,
    cones: station.cones.map((c) => ({ ...c, x: -c.x })),
    setupSteps: station.setupSteps.map((s) => ({ ...s, text: swapLR(s.text) })),
  };
}

export const coneOf = (st, n) => st.cones.find((c) => c.n === Number(n)) || null;

/** Relativní pozice míčku u těla hráče stojícího v domečku. */
export function relPoint(at, s) {
  switch (at) {
    case 'fh': return { x: s * 0.48, y: 0.45 };
    case 'bh': return { x: -s * 0.48, y: 0.45 };
    case 'front': return { x: 0, y: 0.72 };
    case 'back': return { x: s * 0.1, y: 0.12 };
    case 'between': return { x: 0, y: 0.02 };
    default: return null;
  }
}
export const isRelative = (at) => ['fh', 'bh', 'front', 'back', 'between'].includes(at);
export const parseAround = (at) => { const m = /^around:(\d)$/.exec(String(at)); return m ? Number(m[1]) : null; };

/** Cíl kroku: kužel n → míček těsně před kuželem (ze strany domečku); home → před domečkem. */
export function targetPoint(at, st, s) {
  if (isRelative(at)) return relPoint(at, s);
  if (at === 'home' || at == null) return { x: 0, y: 0.45 };
  const c = coneOf(st, at);
  if (!c) return { x: 0, y: 0.45 };
  const dx = st.home.x - c.x; const dy = st.home.y - c.y; const d = Math.hypot(dx, dy) || 1;
  return { x: c.x + (dx / d) * 0.32, y: c.y + (dy / d) * 0.32 };
}

/** Kužel, ke kterému krok míří (pro hlášení čísla/barvy). */
export const stepCone = (step) => {
  if (!step) return null;
  const a = parseAround(step.at);
  if (a) return a;
  return typeof step.at === 'number' || /^\d$/.test(String(step.at)) ? Number(step.at) : null;
};
