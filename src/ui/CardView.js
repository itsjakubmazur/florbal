// Sběratelská karta dovednosti: ilustrace kreslená kódem podle skillCategory (hůl, míček, kužely na palubovce),
// rámeček podle vzácnosti (běžná, vzácná, epická, legendární), název, popis a u zamčené karty „jak ji získat“.
// Barvy jen přes CSS proměnné (m4.css → tokens.js).
import './m4.css';
import { h, escapeHtml } from './dom.js';
import { RARITY } from '../domain/cards.js';

let uidN = 0;
const ball = (x, y, r = 11) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="var(--ball)" stroke="var(--ball-edge, var(--bg))" stroke-width="2"/>
  <circle cx="${-r * 0.4}" cy="${-r * 0.3}" r="${r * 0.18}" fill="var(--ball-hole, var(--muted))"/><circle cx="${r * 0.4}" cy="${-r * 0.3}" r="${r * 0.18}" fill="var(--ball-hole, var(--muted))"/><circle cy="${r * 0.45}" r="${r * 0.18}" fill="var(--ball-hole, var(--muted))"/></g>`;
const cone = (x, y, c = 'red', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-13 12 L0 -16 L13 12 Z" fill="var(--cone-${c})" stroke="var(--cone-edge, var(--bg))" stroke-width="2" stroke-linejoin="round"/><rect x="-17" y="10" width="34" height="6" rx="3" fill="var(--cone-${c})"/></g>`;
/** Hůl: rukojeť z (x1,y1) k čepeli v (x2,y2); čepel zahnutá na stranu dir (±1). */
const stick = (x1, y1, x2, y2, dir = 1, face = 'var(--fh)') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--stick)" stroke-width="6" stroke-linecap="round"/>
  <path d="M${x2} ${y2} q${dir * 10} 6 ${dir * 26} 2" fill="none" stroke="${face}" stroke-width="9" stroke-linecap="round"/>`;
const dash = (d, color = 'var(--m4-hi)') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="8 8" stroke-linecap="round"/>`;
const arrowHead = (x, y, a, color = 'var(--m4-hi)') => `<path d="M0 0 L-14 -8 L-14 8 Z" fill="${color}" transform="translate(${x} ${y}) rotate(${a})"/>`;
const star = (x, y, r, fill) => {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r; pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`); }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};

/** Ilustrace 200 × 150 podle kategorie dovednosti. */
export function cardArt(cat) {
  switch (cat) {
    case 'tahy': return `${dash('M50 100 L150 100')}${arrowHead(158, 100, 0)}${arrowHead(42, 100, 180)}${stick(70, 20, 66, 92, 1, 'var(--fh)')}${stick(130, 20, 134, 92, -1, 'var(--bh)')}${ball(100, 100)}`;
    case 'kolem kuželů': return `${cone(50, 70, 'red')}${cone(100, 70, 'yellow')}${cone(150, 70, 'blue')}${dash('M20 115 C40 30 60 30 75 75 S110 125 125 75 S160 20 185 80')}${ball(185, 95)}`;
    case 'vedení míčku': return `${[0, 1, 2, 3].map((i) => `<circle cx="${40 + i * 22}" cy="${108 - i * 4}" r="${3 + i}" fill="var(--m4-hi)" opacity="${0.3 + i * 0.15}"/>`).join('')}${stick(118, 24, 126, 92, 1)}${ball(150, 96)}${arrowHead(185, 92, -8)}`;
    case 'reakce': return `${cone(40, 40, 'red', 0.85)}${cone(160, 40, 'blue', 0.85)}${cone(40, 120, 'green', 0.85)}${cone(160, 120, 'yellow', 0.85)}
      <circle cx="160" cy="40" r="26" fill="none" stroke="var(--m4-hi)" stroke-width="5"/>${dash('M100 80 L145 50')}${arrowHead(148, 48, -34)}${ball(100, 82)}`;
    case 'jednoruč': return `${stick(80, 18, 112, 98, 1)}<circle cx="80" cy="18" r="11" fill="var(--player)" stroke="var(--stick)" stroke-width="3"/>${ball(146, 104)}
      <text x="40" y="70" font-size="44" font-weight="700" fill="var(--m4-hi)" font-family="var(--font)">1</text>`;
    case 'kličky': return `${cone(110, 60, 'red')}${dash('M30 115 L80 70 L130 115 L180 60')}${arrowHead(186, 54, -45)}${ball(80, 72)}`;
    case 'kombinace': return `${cone(45, 50, 'blue', 0.8)}${cone(155, 50, 'red', 0.8)}${dash('M30 120 C70 20 130 140 175 40')}${star(100, 95, 22, 'var(--m4-hi)')}${ball(170, 115)}`;
    case 'triky': return `<ellipse cx="100" cy="128" rx="22" ry="6" fill="var(--bg)" opacity=".55"/>${dash('M70 120 Q100 10 130 120', 'var(--m4-brand-hi)')}${stick(48, 30, 82, 122, 1)}${ball(100, 46, 13)}
      ${star(150, 34, 10, 'var(--m4-hi)')}${star(58, 60, 7, 'var(--m4-hi)')}${star(165, 80, 6, 'var(--m4-hi)')}`;
    case 'výzvy': return `<rect x="120" y="40" width="64" height="70" rx="4" fill="none" stroke="var(--mantinel, var(--text))" stroke-width="6"/>
      ${[0, 1, 2, 3].map((i) => `<line x1="${128 + i * 14}" y1="44" x2="${128 + i * 14}" y2="106" stroke="var(--line)" stroke-width="2"/>`).join('')}
      ${dash('M30 120 Q90 20 140 76')}${ball(146, 80)}${stick(14, 50, 34, 118, 1)}`;
    case 'vytrvalost': return `${[0, 1, 2, 3, 4, 5, 6].map((i) => star(28 + i * 24, 80, 11, i < 4 ? 'var(--m4-hi)' : 'var(--surface-2)')).join('')}
      <text x="100" y="40" text-anchor="middle" font-size="26" font-weight="700" fill="var(--text)" font-family="var(--font)">4 ze 7</text>`;
    default: return `${ball(100, 75, 18)}`;
  }
}

const rarityVar = (r) => `var(--m4-${RARITY[r] ? r : 'common'})`;

/**
 * @param {object} card karta z cards.json @param {{owned?: boolean, small?: boolean}} [o]
 * @returns {HTMLElement}
 */
export function cardView(card, { owned = true, small = false } = {}) {
  const id = `cv${uidN++}`;
  const col = rarityVar(card.rarity);
  const el = h('div', 'm4-card');
  el.dataset.card = card.id;
  el.dataset.owned = owned ? '1' : '0';
  const legend = card.rarity === 'legend';
  const name = escapeHtml(card.name);
  const desc = escapeHtml(owned ? card.description : 'Zatím zamčená karta');
  // SVG 250 × 350: rámeček (mantinel), palubovka s ilustrací, název a popis (popis přes foreignObject kvůli zalamování)
  el.innerHTML = `<svg viewBox="0 0 250 350" role="img" aria-label="${name}${owned ? '' : ' (zamčená karta)'}">
    <defs><clipPath id="${id}"><rect x="22" y="44" width="206" height="160" rx="22"/></clipPath></defs>
    <rect x="4" y="4" width="242" height="342" rx="24" fill="var(--surface)" stroke="${col}" stroke-opacity="${owned ? 1 : 0.45}" stroke-width="${legend ? 8 : card.rarity === 'common' ? 4 : 6}"/>
    ${legend ? `<rect x="13" y="13" width="224" height="324" rx="18" fill="none" stroke="${col}" stroke-width="2" opacity=".8"/>` : ''}
    <text x="24" y="32" font-size="16" font-weight="600" fill="${col}" font-family="var(--font)">${escapeHtml((RARITY[card.rarity] || RARITY.common).name)}</text>
    <g clip-path="url(#${id})">
      <rect x="22" y="44" width="206" height="160" fill="var(--floor)"/>
      <line x1="125" y1="44" x2="125" y2="204" stroke="var(--floor-line)" stroke-width="3"/>
      <circle cx="125" cy="124" r="34" fill="none" stroke="var(--floor-line)" stroke-width="3"/>
      <g transform="translate(25 49)" ${owned ? '' : 'opacity=".22"'}>${cardArt(card.skillCategory)}</g>
    </g>
    <rect x="22" y="44" width="206" height="160" rx="22" fill="none" stroke="${owned ? 'var(--mantinel, var(--line))' : 'var(--line-strong, var(--line))'}" stroke-width="4"/>
    ${owned ? '' : `<g transform="translate(125 124)"><circle r="26" fill="var(--surface-2)"/><path d="M-9 -2 v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="var(--text)" stroke-width="4"/><rect x="-13" y="-3" width="26" height="19" rx="4" fill="var(--text)"/></g>`}
    <foreignObject x="18" y="212" width="214" height="128">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:var(--font);color:var(--text);display:flex;flex-direction:column;gap:4px;height:100%;text-align:center;${small ? 'justify-content:center;padding-bottom:12px' : ''}">
        <div style="font-weight:650;font-size:${small ? (name.length > 14 ? 25 : 29) : name.length > 18 ? 20 : 23}px;line-height:1.05">${name}</div>
        ${small ? '' : `<div style="font-weight:500;font-size:15px;line-height:1.25;color:var(--m4-text-2)">${desc}</div>`}
      </div>
    </foreignObject>
  </svg>`;
  return el;
}
