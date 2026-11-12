// Album sběratelských karet (počet, mřížka, detail) a odhalení nové karty (krátká animace + hlas).
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import { overlay } from '../ui/m4kit.js';
import { cardView } from '../ui/CardView.js';
import { say, sfx } from '../core/audio.js';
import { getProfile } from '../domain/profiles.js';
import { allCards, ownedCards, RARITY, unlockText } from '../domain/cards.js';

/** Odhalení nové karty. Vrací Promise, která se splní po zavření. */
export function revealCard(card) {
  return new Promise((resolve) => {
    if (!card) { resolve(); return; }
    const cv = cardView(card, { owned: true });
    cv.classList.add('m4-reveal', 'm4-glow');
    const o = overlay([h('div', 'eyebrow', 'Nová karta do alba'), cv], { test: 'card-reveal', onClose: resolve });
    o.el.append(btn(`${icon('check')}Super!`, 'btn-primary btn-big', () => o.close(), { auto: true, test: 'card-reveal-ok' }));
    sfx('levelup');
    say('card_new', { kind: 'phrase' });
  });
}

export default function cardsScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'cards';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const own = ownedCards(p);
    const all = allCards();
    const n = all.filter((c) => own[c.id]).length;
    const head = header('Sběratelské karty dovedností', `Album <span style="color:var(--m4-hi)">${n} z ${all.length}</span>`, () => back());
    head.querySelector('.title').dataset.test = 'album-count';
    el.append(head);
    const order = Object.keys(RARITY);
    for (const r of order) {
      const list = all.filter((c) => c.rarity === r);
      if (!list.length) continue;
      el.append(h('div', 'eyebrow w-full', `${RARITY[r].name} · ${list.filter((c) => own[c.id]).length} z ${list.length}`));
      const g = h('div', 'm4-grid small');
      for (const c of list) {
        const b = btn('', 'card', () => detail(c), { test: `card-${c.id}` });
        b.style.padding = '6px';
        b.append(cardView(c, { owned: !!own[c.id], small: true }));
        g.append(b);
      }
      el.append(g);
    }
    const detail = (c) => {
      const owned = !!own[c.id];
      const cv = cardView(c, { owned });
      const info = h('div', 'm4-col'); info.style.alignItems = 'center';
      info.append(h('div', 'muted', owned ? `Získáno ${new Date(own[c.id]).toLocaleDateString('cs-CZ')}` : `Jak ji získat: ${escapeHtml(unlockText(c))}`));
      const o = overlay([cv, info], { test: 'card-detail' });
      o.el.append(btn('Zavřít', 'btn btn-big', () => o.close(), { auto: true, test: 'card-close' }));
    };
  })();
  return el;
}
