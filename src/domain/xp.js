// XP a hodnosti: cesta mladého florbalisty. Hodnost se počítá z nasbíraných XP (úroveň cviků nastavuje hráč/rodič zvlášť).
// Hodnosti = cesta mladého hráče v Hattricku (research/hattrick-brand.md): přípravka → elévové → žáci → dorost → junioři
// → muži → Superliga → Hattrick legenda. Křivka: hodnost n vyžaduje celkem 30·(n−1)·n XP (2: 60, 3: 180 … 10: 2700).
// XP jsou za snahu a odvedený čas (cvik, souboj, krok triku, test), nikdy za výkon a nikdy se neubírají (SUMMARY kap. 4).
// Trénink dá typicky 60–100 XP, Hattrick legenda tedy přijde zhruba po 35 trénincích.
export const XP_PER_DRILL = 10;
export const XP_WORKOUT_BONUS = 20;

export const RANKS = [
  'Přípravka U7', 'Mladší elévové', 'Starší elévové', 'Mladší žáci', 'Starší žáci',
  'Dorost', 'Junioři', 'Muži', 'Superliga', 'Hattrick legenda',
];
// XP za aktivity mimo trénink (snaha, ne výsledek): odehraný souboj, test dovedností, splněný krok triku, celý trik
export const XP_DUEL = 10;
export const XP_TEST = 10;
export const XP_TRICK_STEP = 10;
export const XP_TRICK_DONE = 30;
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
