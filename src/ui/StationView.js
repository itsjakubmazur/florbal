// StationView – SVG pohled shora na stanoviště (náhrada MatView z reference). SPEC kap. 1–3.
// Hráč stojí dole (domeček), tablet je nahoře; vlevo na obrazovce = vlevo pro hráče.
// Kreslí: palubovku (jemné čáry), kužely s čísly v barvách, domeček, hráče, hůl s čepelí (forhend/bekhend),
// míček, šipku „kam dál“ a oblouky kolem kuželů. Animace míčku a čepele mezi kroky patternu se spouští
// z úderů metronomu (moveTo s délkou přechodu), takže je svázaná s časem audia.
// Barvy jen přes CSS proměnné (tokens.js).
import { CONE_COLORS } from './tokens.js';
import { sideSign, targetPoint, isRelative, parseAround, coneOf } from '../domain/stations.js';

const S = 100; // 1 m = 100 jednotek SVG
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const X = (x) => x * S;
const Y = (y) => -y * S; // dopředu = nahoru
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * @param {object} o
 * @param {object} o.station  stanoviště (už zrcadlené přes stationFor)
 * @param {'left'|'right'} o.grip
 * @param {boolean} [o.ball=true] kreslit míček (cviky bez míčku false)
 * @param {object[]} [o.pattern] kroky cviku (pro vodicí oblouky a čáry)
 */
export function createStationView({ station, grip = 'right', ball = true, pattern = [], compact = false }) {
  const s = sideSign(grip);
  // levák = zrcadlový obraz praváka: i směr objíždění kuželu se zrcadlí
  const dirOf = (d) => (s < 0 ? (d === 'cw' ? 'ccw' : 'cw') : d);
  const xs = [...station.cones.map((c) => c.x), station.home.x, -0.9, 0.9];
  const ys = [...station.cones.map((c) => c.y), station.home.y - 0.45, 0.9];
  const pad = 0.45;
  const minX = Math.min(...xs) - pad; const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad; const maxY = Math.max(...ys) + pad;
  const svg = el('svg', { viewBox: `${X(minX)} ${Y(maxY)} ${X(maxX - minX)} ${(maxY - minY) * S}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': `Stanoviště ${station.name}` });
  svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible';
  svg.dataset.test = 'station-view';

  // palubovka
  const floor = el('g', {}, svg);
  el('rect', { x: X(minX) + 4, y: Y(maxY) + 4, width: X(maxX - minX) - 8, height: (maxY - minY) * S - 8, rx: 18, fill: 'var(--floor)', stroke: 'var(--floor-line)', 'stroke-width': 3 }, floor);
  for (let gx = Math.ceil(minX * 2) / 2; gx < maxX; gx += 0.5) el('line', { x1: X(gx), x2: X(gx), y1: Y(maxY) + 8, y2: Y(minY) - 8, stroke: 'var(--floor-line)', 'stroke-width': 1.5 }, floor);
  for (let gy = Math.ceil(minY * 2) / 2; gy < maxY; gy += 0.5) el('line', { y1: Y(gy), y2: Y(gy), x1: X(minX) + 8, x2: X(maxX) - 8, stroke: 'var(--floor-line)', 'stroke-width': 1.5 }, floor);

  // vodicí čáry a oblouky patternu
  const guides = el('g', { fill: 'none', stroke: 'var(--muted)', 'stroke-width': 3, 'stroke-dasharray': '8 10', opacity: 0.55 }, svg);
  let prev = targetPoint('home', station, s);
  for (const st of pattern || []) {
    const n = parseAround(st.at);
    if (n) {
      const c = coneOf(station, n);
      if (c) {
        const r = 0.36;
        const sweep = dirOf(st.dir) === 'cw' ? 1 : 0; // v SVG (y dolů) je „cw“ z pohledu shora po směru hodin
        const a0 = Math.atan2(prev.y - c.y, prev.x - c.x);
        const p0 = { x: c.x + Math.cos(a0) * r, y: c.y + Math.sin(a0) * r };
        const p1 = { x: c.x - Math.cos(a0) * r, y: c.y - Math.sin(a0) * r };
        el('path', { d: `M${X(p0.x)} ${Y(p0.y)} A${r * S} ${r * S} 0 0 ${sweep} ${X(p1.x)} ${Y(p1.y)}` }, guides);
        prev = p1;
      }
    } else if (!isRelative(st.at)) {
      const t = targetPoint(st.at, station, s);
      el('line', { x1: X(prev.x), y1: Y(prev.y), x2: X(t.x), y2: Y(t.y) }, guides);
      prev = t;
    }
  }

  // domeček
  const home = el('g', { transform: `translate(${X(station.home.x)} ${Y(station.home.y)})` }, svg);
  el('rect', { x: -34, y: -34, width: 68, height: 68, rx: 12, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 4, 'stroke-dasharray': '10 8' }, home);

  // kužely
  const coneEls = new Map();
  for (const c of station.cones) {
    const col = CONE_COLORS[c.color] || CONE_COLORS.white;
    const g = el('g', { transform: `translate(${X(c.x)} ${Y(c.y)})` }, svg);
    g.dataset.cone = c.n;
    const ring = el('circle', { r: 31, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 7, opacity: 0 }, g);
    el('circle', { r: 22, fill: `var(--cone-${c.color})`, stroke: 'rgba(0,0,0,.35)', 'stroke-width': 3 }, g);
    const t = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', y: 1, 'font-family': 'Inter, sans-serif', 'font-weight': 800, 'font-size': 30, fill: col.ink }, g);
    t.textContent = c.n;
    coneEls.set(c.n, { g, ring });
  }

  // šipka „kam dál“
  const defs = el('defs', {}, svg);
  const mk = el('marker', { id: `arr${Math.random().toString(36).slice(2, 7)}`, viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'var(--accent)' }, mk);
  const arrow = el('path', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 7, 'stroke-linecap': 'round', 'marker-end': `url(#${mk.id})`, opacity: 0 }, svg);

  // hráč, hůl, míček
  const player = el('g', {}, svg);
  el('ellipse', { rx: 26, ry: 15, fill: 'var(--player)' }, player);
  el('circle', { r: 11, cy: -2, fill: 'var(--text)', opacity: 0.85 }, player);
  const shaft = el('line', { stroke: 'var(--stick)', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
  const blade = el('g', {}, svg);
  const bladeFh = el('path', { fill: 'none', stroke: 'var(--fh)', 'stroke-width': 7, 'stroke-linecap': 'round' }, blade); // konkávní strana = forhend
  const bladeBh = el('path', { fill: 'none', stroke: 'var(--bh)', 'stroke-width': 7, 'stroke-linecap': 'round' }, blade); // konvexní strana = bekhend
  const ballG = el('g', {}, svg);
  el('circle', { r: 10, fill: 'var(--ball)', stroke: 'rgba(0,0,0,.45)', 'stroke-width': 2 }, ballG);
  const badge = el('g', {}, svg);
  const badgeC = el('circle', { r: 19, fill: 'var(--fh)' }, badge);
  const badgeT = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', y: 1, 'font-family': 'Inter, sans-serif', 'font-weight': 800, 'font-size': 24, fill: 'var(--fh-ink)' }, badge);
  if (!ball) { ballG.style.display = 'none'; badge.style.display = 'none'; }
  if (compact) badge.style.display = 'none';

  // ---- stav a kreslení ----
  const st = { ball: targetPoint('home', station, s), face: 'fh', relative: true, player: { x: station.home.x, y: station.home.y } };
  let anim = 0;
  const playerFor = (b, relative) => (relative ? { x: station.home.x, y: station.home.y } : { x: b.x - s * 0.26, y: b.y - 0.34 });

  function draw(b, p, face) {
    ballG.setAttribute('transform', `translate(${X(b.x)} ${Y(b.y)})`);
    player.setAttribute('transform', `translate(${X(p.x)} ${Y(p.y)})`);
    // čepel: forhend = čepel na forhendové straně míčku, konkávní stranou k míčku; bekhend = na druhé straně, konvexní stranou k míčku.
    // Konkávní strana míří vždy k −s (u praváka doleva) – orientace čepele je daná držením hole.
    const side = face === 'fh' ? s : -s;
    const bx = b.x + side * 0.13; const by = b.y;
    const L = 0.16; const bulge = 0.07;
    const curve = (off) => `M${X(bx + off)} ${Y(by - L)} Q${X(bx + off + s * bulge * 2)} ${Y(by)} ${X(bx + off)} ${Y(by + L)}`;
    bladeFh.setAttribute('d', curve(-s * 0.025));
    bladeBh.setAttribute('d', curve(s * 0.025));
    const active = face === 'fh' ? bladeFh : bladeBh;
    bladeFh.setAttribute('opacity', face === 'fh' ? 1 : 0.35);
    bladeBh.setAttribute('opacity', face === 'bh' ? 1 : 0.35);
    active.parentNode.appendChild(active);
    const hands = { x: p.x + s * 0.18, y: p.y + 0.06 };
    shaft.setAttribute('x1', X(hands.x)); shaft.setAttribute('y1', Y(hands.y));
    shaft.setAttribute('x2', X(bx + s * 0.05)); shaft.setAttribute('y2', Y(by - L * 0.9));
    const bx2 = b.x + side * 0.38;
    badge.setAttribute('transform', `translate(${X(bx2)} ${Y(by + 0.08)})`);
    badgeC.setAttribute('fill', face === 'fh' ? 'var(--fh)' : 'var(--bh)');
    badgeT.setAttribute('fill', face === 'fh' ? 'var(--fh-ink)' : 'var(--bh-ink)');
    badgeT.textContent = face === 'fh' ? 'F' : 'B';
  }
  draw(st.ball, st.player, st.face);

  /** Dráha míčku pro krok: přímka, nebo půloblouk kolem kuželu. */
  function pathFor(step, from) {
    const n = parseAround(step.at);
    if (n) {
      const c = coneOf(station, n);
      if (c) {
        const r = 0.36;
        const a0 = Math.atan2(from.y - c.y, from.x - c.x);
        const dirSign = dirOf(step.dir) === 'cw' ? -1 : 1; // ve světových souřadnicích (y nahoru) je cw záporný úhel
        const start = { x: c.x + Math.cos(a0) * r, y: c.y + Math.sin(a0) * r };
        return (t) => {
          if (t < 0.25) { const k = t / 0.25; return { x: from.x + (start.x - from.x) * k, y: from.y + (start.y - from.y) * k }; }
          const k = (t - 0.25) / 0.75; const a = a0 + dirSign * Math.PI * k;
          return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r };
        };
      }
    }
    const to = targetPoint(step.at, station, s);
    return (t) => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
  }

  const api = {
    el: svg,
    /** Přesune míček/hráče na krok patternu za ms milisekund (start = teď). */
    moveTo(step, ms = 400) {
      cancelAnimationFrame(anim);
      const from = { ...st.ball };
      const fromP = { ...st.player };
      const path = pathFor(step, from);
      const relative = isRelative(step.at);
      st.face = step.blade === 'bh' ? 'bh' : 'fh';
      const end = path(1);
      const endP = playerFor(end, relative);
      const t0 = performance.now();
      const frame = (now) => {
        const k = Math.min(1, (now - t0) / Math.max(1, ms));
        const e = ease(k);
        const b = path(e);
        const p = { x: fromP.x + (endP.x - fromP.x) * e, y: fromP.y + (endP.y - fromP.y) * e };
        st.ball = b; st.player = p;
        draw(b, p, st.face);
        if (k < 1) anim = requestAnimationFrame(frame);
      };
      anim = requestAnimationFrame(frame);
    },
    /** Šipka z aktuálního cíle k dalšímu kroku. */
    showNext(step) {
      if (!step) { arrow.setAttribute('opacity', 0); return; }
      const n = parseAround(step.at);
      const to = n ? (() => { const c = coneOf(station, n); return c ? { x: c.x, y: c.y - 0.42 } : targetPoint('home', station, s); })() : targetPoint(step.at, station, s);
      const from = st.ball;
      const d = Math.hypot(to.x - from.x, to.y - from.y);
      if (d < 0.3) { arrow.setAttribute('opacity', 0); return; }
      const k0 = 0.18 / d; const k1 = 1 - 0.14 / d;
      const a = { x: from.x + (to.x - from.x) * k0, y: from.y + (to.y - from.y) * k0 };
      const b = { x: from.x + (to.x - from.x) * k1, y: from.y + (to.y - from.y) * k1 };
      arrow.setAttribute('d', `M${X(a.x)} ${Y(a.y)} L${X(b.x)} ${Y(b.y)}`);
      arrow.setAttribute('opacity', 0.9);
    },
    hideNext() { arrow.setAttribute('opacity', 0); },
    /** Zvýrazní kužely (návod na postavení, hlášený kužel). */
    highlight(ns = []) {
      const set = new Set((ns || []).map(Number));
      for (const [n, { ring }] of coneEls) ring.setAttribute('opacity', set.has(n) ? 1 : 0);
    },
    /** Při stavění: kužely, které ještě nejsou položené, jsou průhledné. */
    showCones(ns) {
      const set = ns ? new Set(ns.map(Number)) : null;
      for (const [n, { g }] of coneEls) g.setAttribute('opacity', !set || set.has(n) ? 1 : 0.15);
    },
    setPlayerVisible(v) { [player, shaft, blade, ballG, badge].forEach((n) => { n.style.display = v ? '' : 'none'; }); if (v && !ball) { ballG.style.display = 'none'; badge.style.display = 'none'; } },
    reset() {
      cancelAnimationFrame(anim);
      st.ball = targetPoint('home', station, s); st.player = { x: station.home.x, y: station.home.y }; st.face = 'fh';
      draw(st.ball, st.player, st.face); arrow.setAttribute('opacity', 0); api.highlight([]);
    },
    destroy() { cancelAnimationFrame(anim); },
    get face() { return st.face; },
  };
  return api;
}
