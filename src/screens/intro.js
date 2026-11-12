// Úvodní obrazovka: celá obrazovka je hřiště (mantinel se zaobleným rohem, středová čára a kruh),
// uprostřed logo klubu (téma Hattrick) a název appky. Klepnutím přeskočit (a zároveň odemknout zvuk).
import { h, clubLogo } from '../ui/dom.js';
import { themeHasClub } from '../ui/tokens.js';

/** Značka appky bez klubu: čepel a míček (stejný motiv jako ikona appky). */
export const appMark = () => `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
  <path d="M34 10 L68 76" stroke="var(--stick)" stroke-width="9" stroke-linecap="round"/>
  <path d="M68 76 C73 88 86 94 104 91" stroke="var(--fh)" stroke-width="13" fill="none" stroke-linecap="round"/>
  <circle cx="58" cy="94" r="15" fill="var(--ball)"/>
  <circle cx="58" cy="94" r="3" fill="var(--ball-hole)"/><circle cx="51" cy="88" r="3" fill="var(--ball-hole)"/><circle cx="65" cy="88" r="3" fill="var(--ball-hole)"/></svg>`;

export default function intro(_p, { go }) {
  const el = h('section', 'screen intro');
  el.dataset.test = 'intro';
  el.style.cursor = 'pointer';
  const rink = h('div', 'intro-rink');
  rink.innerHTML = `<svg width="100%" height="100%" aria-hidden="true"><line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--floor-line)" stroke-width="3"/>
    <circle cx="50%" cy="50%" style="r:min(24vh, 30vw)" fill="none" stroke="var(--floor-line)" stroke-width="3"/></svg>`;
  const mark = h('div', 'intro-mark');
  if (themeHasClub()) mark.innerHTML = `<img src="${clubLogo}" alt="FBŠ Hattrick Brno" width="270" height="200">`;
  else mark.innerHTML = appMark();
  const word = h('div', 'intro-word', 'Florbal Trenér');
  const sub = h('div', 'lead muted', 'Klepni a jdeme na to');
  el.append(rink, mark, word, sub);
  let done = false;
  const finish = () => { if (done) return; done = true; clearTimeout(t); go('profiles', {}, { replace: true }); };
  if (mark.animate) {
    [mark, word, sub].forEach((n, i) => n.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: 80 + i * 60, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
  }
  const t = setTimeout(finish, 2400);
  el.addEventListener('click', finish);
  return el;
}
