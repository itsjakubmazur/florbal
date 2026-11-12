// XP a hodnosti: cesta mladého florbalisty. Hodnost se počítá z nasbíraných XP (úroveň cviků nastavuje hráč/rodič zvlášť).
// Křivka: hodnost n vyžaduje celkem 30·(n−1)·n XP (2: 60, 3: 180, 4: 360, 5: 600 … 11: 3300).
// Trénink dá typicky 60–100 XP, Legenda tedy přijde zhruba po 40 trénincích (při 3 týdně za 3–4 měsíce).
export const XP_PER_DRILL = 10;
export const XP_WORKOUT_BONUS = 20;

export const RANKS = [
  'Minipřípravka', 'Přípravka', 'Elévové', 'Mladší žáci', 'Starší žáci', 'Dorost',
  'Junioři', 'Muži', 'Superliga', 'Reprezentace', 'Legenda',
];
export const MAX_RANK = RANKS.length;
export const rankName = (n) => RANKS[Math.min(Math.max(n, 1), RANKS.length) - 1];
export const xpForRank = (n) => 30 * (n - 1) * n;

export function rankInfo(xp = 0) {
  let rank = 1;
  while (rank < MAX_RANK && xp >= xpForRank(rank + 1)) rank++;
  const base = xpForRank(rank);
  const next = rank >= MAX_RANK ? base : xpForRank(rank + 1);
  return { rank, name: rankName(rank), base, next, progress: next === base ? 1 : Math.min(1, (xp - base) / (next - base)), maxed: rank >= MAX_RANK };
}

export const stars = (done, total) => (done >= total ? 3 : done >= total * 0.6 ? 2 : 1);
