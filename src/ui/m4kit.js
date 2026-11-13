// Drobné komponenty pro M4 obrazovky: stepper, číselná klávesnice, graf, obličeje, překryv, hlas s dynamickým textem.
// Barvy jen přes CSS proměnné (m4.css → tokens.js).
import './m4.css';
import { h, btn, icon, escapeHtml } from './dom.js';
import { say } from '../core/audio.js';

/** Hláška s textem, který nemá nahrávku (jména hráčů, skóre): mluví TTS zařízení. */
let dyn = 0;
export const sayText = (text, kind = 'phrase') => { if (text) say(`dyn_${++dyn}`, { kind, text }); };

/** Stepper − hodnota + (velká tlačítka). */
export function stepper(value, { min = 1, max = 99, step = 1, fmt = (v) => String(v), onChange, test } = {}) {
  let v = value;
  const box = h('div', 'm4-stepper');
  if (test) box.dataset.test = test;
  const val = h('div', 'v', fmt(v));
  const set = (n) => { v = Math.min(max, Math.max(min, n)); val.textContent = fmt(v); onChange && onChange(v); };
  box.append(btn('−', 'btn', () => set(v - step), { test: test ? `${test}-minus` : undefined }), val, btn('+', 'btn', () => set(v + step), { test: test ? `${test}-plus` : undefined }));
  box.get = () => v;
  return box;
}

/**
 * Velká číselná klávesnice pro rodiče. @param {{decimal?: boolean, onOk:(n:number)=>void, okLabel?: string}} o
 */
export function numpad({ decimal = false, onOk, okLabel = 'Zapsat', initial = '' } = {}) {
  let s = initial;
  const wrap = h('div', 'm4-col'); wrap.style.alignItems = 'center';
  const disp = h('div', 'm4-numpad-display', s || '0'); disp.dataset.test = 'numpad-display';
  const pad = h('div', 'm4-numpad');
  const paint = () => { disp.textContent = s || '0'; ok.disabled = !s; ok.style.opacity = s ? 1 : 0.4; };
  const press = (k) => {
    if (k === 'del') s = s.slice(0, -1);
    else if (k === ',') { if (decimal && !s.includes(',')) s = (s || '0') + ','; }
    else if (s.length < 5) s = s === '0' ? k : s + k;
    paint();
  };
  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', decimal ? ',' : '', '0', 'del']) {
    if (!k) { pad.append(h('div')); continue; }
    pad.append(btn(k === 'del' ? '⌫' : k, 'btn', () => press(k), { test: `num-${k === ',' ? 'comma' : k}` }));
  }
  const ok = btn(`${icon('check')}${okLabel}`, 'btn-primary btn-big', () => { if (s) onOk(Number(s.replace(',', '.'))); }, { test: 'numpad-ok' });
  wrap.append(disp, pad, ok);
  paint();
  return wrap;
}

/**
 * Jednoduchý čárový graf (SVG): body = [{ value, date, record }]. better 'lower' → osa obrácená (nahoru = lépe).
 */
export function lineChart(points, { better = 'higher', fmt = (v) => String(v) } = {}) {
  const box = h('div', 'm4-chart');
  box.dataset.test = 'chart';
  if (points.length < 2) { box.append(h('div', 'muted', points.length ? 'Graf se ukáže po druhém měření.' : 'Zatím žádné měření.')); return box; }
  const W = 600; const H = 260; const L = 56; const R = 20; const T = 20; const B = 40;
  const vs = points.map((p) => p.value);
  let lo = Math.min(...vs); let hi = Math.max(...vs);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const x = (i) => L + (i * (W - L - R)) / (points.length - 1);
  const yv = (v) => { const k = (v - lo) / (hi - lo); return better === 'lower' ? T + k * (H - T - B) : H - B - k * (H - T - B); };
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${yv(p.value).toFixed(1)}`).join(' ');
  const bestV = better === 'lower' ? Math.min(...vs) : Math.max(...vs);
  const grid = [0, 0.5, 1].map((k) => lo + (hi - lo) * k);
  const dates = [0, points.length - 1].map((i) => ({ i, t: new Date(points[i].date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) }));
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graf zlepšení">
    ${grid.map((g) => `<line x1="${L}" x2="${W - R}" y1="${yv(g)}" y2="${yv(g)}" stroke="var(--line)" stroke-width="1.5"/>
      <text x="${L - 10}" y="${yv(g) + 6}" text-anchor="end" font-size="18" font-weight="500" fill="var(--muted)">${escapeHtml(fmt(Math.round(g * 10) / 10))}</text>`).join('')}
    <path d="${path}" fill="none" stroke="var(--m4-brand-hi)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    ${points.map((p, i) => `<circle cx="${x(i)}" cy="${yv(p.value)}" r="${p.value === bestV ? 11 : 7}" fill="${p.value === bestV ? 'var(--m4-hi)' : 'var(--m4-brand-hi)'}" stroke="var(--bg)" stroke-width="3"/>`).join('')}
    ${dates.map((d) => `<text x="${x(d.i)}" y="${H - 10}" text-anchor="${d.i ? 'end' : 'start'}" font-size="18" font-weight="500" fill="var(--muted)">${d.t}</text>`).join('')}
    <text x="${W - R}" y="${T + 4}" text-anchor="end" font-size="16" font-weight="500" fill="var(--muted)">${better === 'lower' ? 'nahoře = rychlejší' : 'nahoře = víc'}</text>
  </svg>`;
  return box;
}

/** Obličej (SVG) jako florbalový míček: bílý, s otvory po obvodu, výraz kreslí barva okraje míčku.
 *  1 = nebavilo, 2 = ušlo to, 3 = bavilo. Význam nese tvar pusy a popisek, ne barva. */
export function faceSvg(n) {
  const mouth = n === 3 ? 'M33 60 Q50 76 67 60' : n === 2 ? 'M35 65 L65 65' : 'M33 70 Q50 56 67 70';
  const holes = Array.from({ length: 10 }, (_, k) => {
    const a = (k / 10) * Math.PI * 2 + Math.PI / 10;
    return `<circle cx="${(50 + Math.cos(a) * 37).toFixed(1)}" cy="${(50 + Math.sin(a) * 37).toFixed(1)}" r="3.2" fill="var(--ball-hole)"/>`;
  }).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="var(--ball)" stroke="var(--ball-edge)" stroke-width="2"/>${holes}
    <circle cx="38" cy="42" r="5.5" fill="var(--ball-edge)"/><circle cx="62" cy="42" r="5.5" fill="var(--ball-edge)"/>
    <path d="${mouth}" fill="none" stroke="var(--ball-edge)" stroke-width="6" stroke-linecap="round"/></svg>`;
}
export const FEEL_LABEL = { 1: 'Nebavilo mě to', 2: 'Ušlo to', 3: 'Bavilo mě to' };

/** Celoobrazovkový překryv; zavře se klepnutím na tlačítko. Vrací { el, close }. */
export function overlay(children, { onClose, test } = {}) {
  const el = h('div', 'm4-overlay');
  if (test) el.dataset.test = test;
  el.append(...children);
  const close = () => { el.remove(); onClose && onClose(); };
  el.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(el);
  return { el, close };
}

/** Ano/ne potvrzení (rodič). */
export function confirmBox(text, yesLabel, onYes) {
  const o = overlay([h('div', 'title', escapeHtml(text))], { test: 'confirm' });
  const row = h('div', 'm4-row'); row.style.justifyContent = 'center';
  row.append(btn(`${icon('check')}${yesLabel}`, 'btn-primary btn-big', () => { o.close(); onYes(); }, { test: 'confirm-yes' }), btn('Zpět', 'btn btn-big', () => o.close(), { test: 'confirm-no' }));
  o.el.append(row);
  return o;
}

/** Tabule skóre táta vs. syn (zúžená čísla jako na ukazateli v hale). Dítě vpravo, jeho číslo jantarově. */
export function scoreboard(leftName, left, rightName, right) {
  const el = h('div', 'm4-score');
  el.innerHTML = `<div class="m4-score-side"><div class="m4-score-n">${left}</div><div class="m4-score-name">${escapeHtml(leftName)}</div></div>
    <div class="m4-score-colon" aria-hidden="true">:</div>
    <div class="m4-score-side r"><div class="m4-score-n kid">${right}</div><div class="m4-score-name">${escapeHtml(rightName)}</div></div>`;
  el.setAttribute('aria-label', `${leftName} ${left}, ${rightName} ${right}`);
  return el;
}

/** Skloňování počtu: plural(3, 'souboj', 'souboje', 'soubojů'). */
export const plural = (n, one, few, many) => `${n} ${n === 1 ? one : n > 1 && n < 5 ? few : many}`;
