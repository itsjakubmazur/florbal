// „Souboje a frajeřinky“ – rozcestník klíčové sekce (BRIEF kap. 4.6): souboje, frajeřinky, testy, zápas, karty, historie.
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import '../ui/m4.css';
import { getProfile } from '../domain/profiles.js';
import { listDuels, balance, DAD_NAME } from '../domain/duels.js';
import { trickProgress, allTricks } from '../domain/tricks.js';
import { allCards, ownedCards } from '../domain/cards.js';

export const ARENA_TITLE = 'Souboje a frajeřinky';

export default function arena({ profileId }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'arena';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const [duels, prog] = await Promise.all([listDuels(), trickProgress(p.id)]);
    const bal = balance(duels, p.id);
    el.append(header('Výzvy, triky a souboje s tátou', ARENA_TITLE, () => back()));
    const grid = h('div', 'm4-grid');
    const tile = (ic, title, sub, fn, test, hi = false) => btn(
      `<span class="m4-trick-badge ${hi ? 'done' : 'open'}">${icon(ic)}</span><span class="m4-col" style="gap:4px"><span class="m4-section-title">${title}</span><span class="${hi ? 'm4-strong' : 'muted'}">${sub}</span></span>`,
      `card m4-trick${hi ? ' on' : ''}`, fn, { test });
    const nOwned = Object.keys(ownedCards(p)).length;
    grid.append(
      tile('swords', 'Souboje', bal.total ? `${escapeHtml(DAD_NAME)} ${bal.dad} : ${bal.kid} ${escapeHtml(p.name)}` : 'Táta vs. syn, trick shoty, KOHOUT', () => go('duels', { profileId: p.id }), 'arena-duels', true),
      tile('star', 'Frajeřinky', `${prog.doneTricks.size} z ${allTricks().length} triků`, () => go('tricks', { profileId: p.id }), 'arena-tricks', true),
      tile('timer', 'Testy dovedností', 'Rekordy a graf zlepšení', () => go('skilltests', { profileId: p.id }), 'arena-tests'),
      tile('trophy', 'Zápas', 'Sám proti rekordu nebo táta vs. syn', () => go('match', { profileId: p.id }), 'arena-match'),
      tile('cards', 'Karty', `${nOwned} z ${allCards().length} v albu`, () => go('cards', { profileId: p.id }), 'arena-cards'),
      tile('list', 'Historie a síň slávy', `${duels.length} soubojů`, () => go('duelStats', { profileId: p.id }), 'arena-stats'),
    );
    el.append(grid);
  })();
  return el;
}
