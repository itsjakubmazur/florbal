// „Souboje a frajeřinky“ – rozcestník klíčové sekce (BRIEF kap. 4.6): souboje, frajeřinky, testy, zápas, karty, historie.
import { h, btn, icon, header } from '../ui/dom.js';
import { scoreboard, plural } from '../ui/m4kit.js';
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
    const grid = h('div', 'm4-hub');
    // hlavní karta: tabule skóre táta vs. syn
    const board = btn('', 'card m4-board', () => go('duels', { profileId: p.id }), { test: 'arena-duels' });
    const top = h('div', 'm4-col'); top.style.gap = 'var(--sp-1)';
    top.append(h('div', 'm4-hero-title', 'Souboje'), h('div', 'muted', 'Táta vs. syn, trick shoty, KOHOUT'));
    board.append(top, h('hr', 'm4-floorline'), scoreboard(DAD_NAME, bal.dad, p.name, bal.kid),
      h('div', 'muted', bal.total ? `${plural(bal.total, 'souboj', 'souboje', 'soubojů')}${bal.draw ? `, remízy ${bal.draw}` : ''}` : 'Zatím bez souboje. Vyber výzvu a hrajte'));
    const tile = (ic, title, sub, fn, test) => btn(
      `${icon(ic)}<span class="m4-col" style="gap:var(--sp-1)"><span class="m4-section-title">${title}</span><span class="muted">${sub}</span></span>`,
      'card m4-hub-tile', fn, { test });
    const nOwned = Object.keys(ownedCards(p)).length;
    grid.append(
      board,
      tile('star', 'Frajeřinky', `${prog.doneTricks.size} z ${allTricks().length} triků`, () => go('tricks', { profileId: p.id }), 'arena-tricks'),
      tile('timer', 'Testy dovedností', 'Rekordy a graf zlepšení', () => go('skilltests', { profileId: p.id }), 'arena-tests'),
      tile('trophy', 'Zápas', 'Sám proti rekordu nebo táta vs. syn', () => go('match', { profileId: p.id }), 'arena-match'),
      tile('cards', 'Karty', `${nOwned} z ${allCards().length} v albu`, () => go('cards', { profileId: p.id }), 'arena-cards'),
    );
    el.append(grid);
    el.append(btn(`${icon('list')}Historie a síň slávy`, 'btn', () => go('duelStats', { profileId: p.id }), { test: 'arena-stats' }));
    el.lastChild.style.alignSelf = 'flex-start';
  })();
  return el;
}
