// Drobné DOM helpery pro obrazovky. Barvy jen přes CSS proměnné z tokens.js.
import { ICONS } from './icons.js';

export function h(tag, cls = '', html = '', attrs = {}) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

/** Ikona z Lucide (ISC), generuje scripts/build-lucide-icons.mjs. */
export const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/** Tlačítko (dotyk + D-pad fokus pro budoucí TV). Label může obsahovat ikonu. */
export function btn(label, cls, onClick, { auto = false, test } = {}) {
  const b = h('button', cls, label, { 'data-focusable': '', tabindex: '0', type: 'button' });
  if (auto) b.setAttribute('data-autofocus', '');
  if (test) b.dataset.test = test;
  b.addEventListener('click', (e) => { e.stopPropagation(); onClick && onClick(e); });
  return b;
}

export const u = (n) => `calc(var(--u) * ${n})`;

/** Záhlaví obrazovky: nadpis vlevo, tlačítko Zpět vpravo. */
export function header(eyebrow, titleHtml, onBack, backLabel = 'Zpět') {
  const head = h('div', 'head');
  const t = h('div', 'flex flex-col');
  t.style.gap = u(0.4);
  if (eyebrow) t.append(h('div', 'eyebrow', eyebrow));
  t.append(h('div', 'title', titleHtml));
  head.append(t);
  if (onBack) head.append(btn(`${icon('back')}${backLabel}`, 'btn', onBack, { test: 'back' }));
  return head;
}

/** Segmentová volba: [[value, label], …]. */
export function seg(opts, cur, onSet, { test } = {}) {
  const box = h('div', 'seg');
  if (test) box.dataset.test = test;
  const bs = [];
  const mark = (v) => bs.forEach(([x, b]) => b.classList.toggle('on', x === v));
  opts.forEach(([v, text]) => {
    const b = btn(text, 'btn', async () => { await onSet(v); mark(v); });
    b.dataset.value = String(v);
    bs.push([v, b]); box.append(b);
  });
  mark(cur);
  return box;
}

/** Popisek nad ovládacím prvkem. */
export function field(label, control) {
  const r = h('div', 'flex flex-col');
  r.style.gap = u(0.6);
  r.append(h('div', 'field-label', label), control);
  return r;
}

// ---- dres: florbalový dres s číslem (barvy z tématu, ať jde snadno přebarvit) ----
let jid = 0;
const BODY = 'M31 10 L13 21 L4 43 L20 51 L25 44 L25 91 Q50 97 75 91 L75 44 L80 51 L96 43 L87 21 L69 10 Q50 24 31 10 Z';
export function jerseyEl(p, size = 12) {
  const id = `jy${jid++}`;
  const label = String(p.jersey || (p.name || '').trim().charAt(0) || '').toUpperCase().slice(0, 2);
  const el = h('div', 'shrink-0');
  el.style.cssText = `width:${u(size)};height:${u(size)};min-width:40px;min-height:40px`;
  el.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs>
    <g clip-path="url(#${id})"><rect width="100" height="100" fill="var(--accent)"/>
      <path d="M0 62 L100 40 L100 52 L0 74 Z" fill="var(--accent-2)"/></g>
    <path d="M31 10 Q50 24 69 10" fill="none" stroke="var(--bg)" stroke-width="4" stroke-linecap="round"/>
    <text x="50" y="62" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="${label.length > 1 ? 30 : 36}" fill="var(--accent-ink)">${escapeHtml(label)}</text>
  </svg>`;
  return el;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
