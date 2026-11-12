// Sběratelské karty dovedností (cards.json). Získané karty jsou v profilu p.cards = { [cardId]: datum }.
// Odemknutí podle unlock: drill (cvik dokončen N×, výchozí 1×), trick (celý trik), test (překonaný rekord),
// challenge (played / win / rematch), streak (týdenní cíl splněn N×).
// Pravidlo SUMMARY kap. 4: nejvýš jedna nová karta po tréninku nebo souboji; zbylé počkají na příště.
import cards from '../content/cards.json';
import { storage } from '../storage/index.js';
import { getProfile, saveProfile, listHistory } from './profiles.js';
import { weeksMet } from './rewards.js';
import { trickProgress, getTrick } from './tricks.js';
import { getDrill } from './trainer.js';
import { getTest } from './skilltests.js';
import { libraryChallenge } from './duels.js';

export const allCards = () => cards;
export const getCard = (id) => cards.find((c) => c.id === id) || null;
export const RARITY = {
  common: { name: 'Běžná', order: 0 },
  rare: { name: 'Vzácná', order: 1 },
  epic: { name: 'Epická', order: 2 },
  legend: { name: 'Legendární', order: 3 },
};
export const ownedCards = (p) => (p && p.cards) || {};

/** Kontext pro vyhodnocení (historie, triky, rekordy, souboje hráče). */
export async function cardContext(profileId) {
  const [history, prog, records, duels] = await Promise.all([
    listHistory(profileId), trickProgress(profileId),
    storage.list('records').then((r) => r.filter((x) => x.profileId === profileId)),
    storage.list('duels').then((r) => r.filter((d) => d.players.some((p) => p.profileId === profileId))),
  ]);
  const drillCount = {};
  for (const e of history) for (const id of e.drills || []) drillCount[id] = (drillCount[id] || 0) + 1;
  return { history, prog, records, duels, drillCount, weeks: weeksMet(history), profileId };
}

export function isEarned(card, ctx) {
  const u = card.unlock || {};
  switch (u.type) {
    case 'drill': return (ctx.drillCount[u.id] || 0) >= (u.count || 1);
    case 'trick': return ctx.prog.doneTricks.has(u.id);
    case 'test': return ctx.records.some((r) => r.testId === u.id && r.record);
    case 'challenge': {
      const mine = ctx.duels.filter((d) => u.id === 'any' || d.challengeId === u.id);
      if (u.event === 'rematch') return mine.some((d) => d.rematch);
      if (u.event === 'win') return mine.some((d) => { const i = d.players.findIndex((p) => p.profileId === ctx.profileId); return d.players.length > 1 && !d.draw && d.winners.includes(i); });
      return mine.length > 0;
    }
    case 'streak': return ctx.weeks >= (u.count || 1);
    default: return false;
  }
}

/** Jak kartu získat – věta pro album. */
export function unlockText(card) {
  const u = card.unlock || {};
  const nm = (x) => (x ? ` „${x.name}“` : '');
  if (u.type === 'drill') return `Dokonči cvik${nm(getDrill(u.id))}${u.count > 1 ? ` ${u.count}×` : ''}.`;
  if (u.type === 'trick') return `Nauč se trik${nm(getTrick(u.id))} ve Frajeřinkách.`;
  if (u.type === 'test') return `Překonej svůj rekord v testu${nm(getTest(u.id))}.`;
  if (u.type === 'challenge') {
    const c = u.id === 'any' ? null : libraryChallenge(u.id);
    return u.event === 'win' ? `Vyhraj souboj${nm(c)}.` : u.event === 'rematch' ? 'Po prohře si dej odvetu.' : `Zahraj si souboj${nm(c)}.`;
  }
  if (u.type === 'streak') return `Splň týdenní cíl ${u.count > 1 ? `${u.count}×` : 'jednou'}.`;
  return '';
}

/**
 * Udělí nejvýš jednu novou kartu. @param {string} profileId @param {(card)=>boolean} [filter]
 * @returns {Promise<object|null>} karta nebo null
 */
export async function awardOne(profileId, filter = () => true) {
  const p = await getProfile(profileId);
  if (!p) return null;
  const ctx = await cardContext(profileId);
  const own = ownedCards(p);
  const card = cards.find((c) => !own[c.id] && filter(c) && isEarned(c, ctx));
  if (!card) return null;
  p.cards = { ...own, [card.id]: Date.now() };
  await saveProfile(p);
  return card;
}
