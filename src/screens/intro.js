// Úvodní obrazovka: krátká animace nápisu, klepnutím přeskočit (a zároveň odemknout zvuk).
import { h, u } from '../ui/dom.js';

export default function intro(_p, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'intro';
  el.style.cursor = 'pointer';
  const logo = h('div', '');
  logo.style.cssText = `width:max(120px, ${u(22)});height:max(120px, ${u(22)})`;
  logo.innerHTML = `<svg viewBox="0 0 512 512" width="100%" height="100%" aria-hidden="true">
    <path d="M150 70 L300 330" stroke="var(--accent-2)" stroke-width="30" stroke-linecap="round"/>
    <path d="M300 330 C 318 368, 360 392, 420 384 L 428 418 C 350 432, 288 404, 266 352 Z" fill="var(--accent)"/>
    <circle cx="250" cy="392" r="62" fill="var(--ball)"/></svg>`;
  const word = h('div', 'title', 'Florbal <span class="accent">Trenér</span>');
  word.style.fontSize = `max(40px, ${u(9)})`;
  const sub = h('div', 'muted', 'Klepni a jdeme na to');
  el.append(logo, word, sub);
  let done = false;
  const finish = () => { if (done) return; done = true; clearTimeout(t); go('profiles', {}, { replace: true }); };
  if (logo.animate) {
    logo.animate([{ transform: 'translateY(30px) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
    word.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 250, fill: 'backwards' });
  }
  const t = setTimeout(finish, 2200);
  el.addEventListener('click', finish);
  return el;
}
