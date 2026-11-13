// Po tréninku (napojeno z result.js jedním voláním): „Jak se ti to líbilo?“ – tři velké obličeje (uloží se k tréninku
// do historie jako feel 1–3, podle finského Kipinämittari) a nejvýš jedna nová karta (SUMMARY kap. 4).
import { h, btn } from '../ui/dom.js';
import { faceSvg, FEEL_LABEL } from '../ui/m4kit.js';
import { say } from '../core/audio.js';
import { storage } from '../storage/index.js';
import { listHistory } from '../domain/profiles.js';
import { awardOne } from '../domain/cards.js';
import { revealCard } from './cards.js';

/**
 * @param {HTMLElement} screen místo na obrazovce výsledku (blok se připojí na konec; result.js: řada vedle karty hráče)
 * @param {string} profileId
 * @param {{done?: number}} [o] počet odcvičených cviků (0 = nic se neuložilo, nic se neptáme)
 */
export async function afterWorkout(screen, profileId, { done = 0 } = {}) {
  if (!done) return;
  const hist = await listHistory(profileId);
  const entry = hist[0];
  if (!entry || Date.now() - entry.date > 10 * 60 * 1000) return;
  const box = h('div', 'm4 m4-feel');
  box.dataset.test = 'feel';
  box.append(h('div', 'm4-section-title', 'Jak se ti to líbilo?'));
  const row = h('div', 'm4-faces');
  const faces = [1, 2, 3].map((n) => {
    const b = btn(`<span class="m4-face-ball">${faceSvg(n)}</span><span class="m4-face-label">${FEEL_LABEL[n]}</span>`, 'm4-face', async () => {
      faces.forEach((f, k) => { f.classList.toggle('on', k + 1 === n); f.setAttribute('aria-pressed', String(k + 1 === n)); });
      row.classList.add('chosen');
      await storage.put('history', { ...entry, feel: n });
      say('feel_thanks', { kind: 'phrase' });
      if (!shown) { shown = true; setTimeout(giveCard, 700); }
    }, { test: `feel-${n}` });
    b.setAttribute('aria-pressed', 'false');
    return b;
  });
  let shown = false;
  row.append(...faces);
  box.append(row);
  screen.append(box);
  setTimeout(() => say('feel_ask', { kind: 'phrase' }), 2200);
  const giveCard = async () => {
    const card = await awardOne(profileId, (c) => c.unlock && ['drill', 'streak'].includes(c.unlock.type));
    if (card) await revealCard(card);
  };
  // karta přijde i bez odpovědi, jen o chvíli později
  setTimeout(() => { if (!shown && screen.isConnected) { shown = true; giveCard(); } }, 6000);
}
