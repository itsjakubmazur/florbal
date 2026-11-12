// Drobné DOM helpery pro obrazovky. Barvy jen přes CSS proměnné z tokens.js.
import { ICONS } from './icons.js';
import { themeHasClub } from './tokens.js';
import clubLogo from '../../assets/img/club/hattrick-logo.png';

export { clubLogo };

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

/** Záhlaví obrazovky: nadpis vlevo (pod ním volitelně krátký kontext), tlačítko Zpět vpravo. */
export function header(context, titleHtml, onBack, backLabel = 'Zpět') {
  const head = h('div', 'head');
  const t = h('div', 'flex flex-col');
  t.style.gap = 'var(--sp-1)';
  t.append(h('div', 'title', titleHtml));
  if (context) t.append(h('div', 'label', context));
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

// ---- dres: florbalový dres s číslem v barvách tématu; v klubovém tématu (Hattrick) s logem klubu na hrudi ----
let jid = 0;
const BODY = 'M31 10 L13 21 L4 43 L20 51 L25 44 L25 91 Q50 97 75 91 L75 44 L80 51 L96 43 L87 21 L69 10 Q50 24 31 10 Z';
/** @param {object} p profil ({ jersey, name }) @param {number} size velikost v jednotkách --u @param {{logo?: boolean}} [o] */
export function jerseyEl(p, size = 12, { logo = size >= 8 } = {}) {
  const id = `jy${jid++}`;
  const label = String(p.jersey || (p.name || '').trim().charAt(0) || '').toUpperCase().slice(0, 2);
  const club = logo && themeHasClub();
  const el = h('div', 'jersey shrink-0');
  el.style.cssText = `width:${u(size)};height:${u(size)};min-width:44px;min-height:44px`;
  el.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs>
    <g clip-path="url(#${id})">
      <rect width="100" height="100" fill="var(--jersey)"/>
      <path d="M0 0 H100 V24 Q50 31 0 24 Z" fill="var(--jersey-trim)"/>
      <path d="M0 37 L22 50 L20 54 L0 42 Z M100 37 L78 50 L80 54 L100 42 Z" fill="var(--jersey-trim)"/>
      <rect x="0" y="86" width="100" height="14" fill="var(--jersey-trim)"/>
    </g>
    <path d="M37 11 L50 25 L63 11" fill="none" stroke="var(--jersey-num)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${club ? `<rect x="56" y="31" width="19" height="15" rx="4" fill="var(--patch)"/><image href="${clubLogo}" x="57" y="32" width="17" height="12.6" preserveAspectRatio="xMidYMid meet"/>` : ''}
    <text x="50" y="${club ? 80 : 74}" text-anchor="middle" style="font-family:var(--font);font-stretch:78%;font-weight:700" font-size="${label.length > 1 ? (club ? 30 : 36) : (club ? 34 : 40)}"
      fill="var(--jersey-num)" stroke="var(--jersey-num-edge)" stroke-width="1.6" paint-order="stroke">${escapeHtml(label)}</text>
  </svg>`;
  return el;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
