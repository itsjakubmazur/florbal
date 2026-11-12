// Odměny (port z reference): odemykají se za XP, tréninky, pravidelnost a dovednosti.
// Florbalové jednotky: slabší strana (bekhend/jednoruč), reakce, kolem kuželů, rozcvičky.
import { allDrills, isWeak, drillKind } from './trainer.js';

export const TIERS = {
  bronze: { name: 'Bronzová' },
  silver: { name: 'Stříbrná' },
  gold: { name: 'Zlatá' },
  diamond: { name: 'Diamantová' },
};
export const CATEGORIES = [
  { id: 'xp', name: 'Za XP' },
  { id: 'trainings', name: 'Za tréninky' },
  { id: 'streak', name: 'Za pravidelnost' },
  { id: 'skill', name: 'Za dovednosti' },
  { id: 'daily', name: 'Za výzvy a rozcvičku' },
];

const R = (id, cat, name, kind, tier, unit, need, desc) => ({ id, cat, name, kind, tier, unit, need, desc });
export const REWARDS = [
  R('xp-20', 'xp', 'První krůček', 'medal', 'bronze', 'xp', 20, '20 XP'),
  R('xp-100', 'xp', 'Bronzová medaile', 'medal', 'bronze', 'xp', 100, '100 XP'),
  R('xp-300', 'xp', 'Stříbrná medaile', 'medal', 'silver', 'xp', 300, '300 XP'),
  R('xp-600', 'xp', 'Zlatá medaile', 'medal', 'gold', 'xp', 600, '600 XP'),
  R('xp-1000', 'xp', 'Bronzový pohár', 'trophy', 'bronze', 'xp', 1000, '1000 XP'),
  R('xp-1600', 'xp', 'Stříbrný pohár', 'trophy', 'silver', 'xp', 1600, '1600 XP'),
  R('xp-2400', 'xp', 'Zlatý pohár', 'trophy', 'gold', 'xp', 2400, '2400 XP'),
  R('xp-3300', 'xp', 'Zlatá hůl', 'star', 'diamond', 'xp', 3300, '3300 XP'),
  R('tr-1', 'trainings', 'První trénink', 'medal', 'bronze', 'trainings', 1, 'Dokonči první trénink'),
  R('tr-3', 'trainings', 'Třikrát na hřišti', 'medal', 'bronze', 'trainings', 3, '3 tréninky'),
  R('tr-10', 'trainings', 'Deset tréninků', 'medal', 'silver', 'trainings', 10, '10 tréninků'),
  R('tr-25', 'trainings', 'Pětadvacítka', 'trophy', 'gold', 'trainings', 25, '25 tréninků'),
  R('tr-50', 'trainings', 'Padesátka', 'crown', 'diamond', 'trainings', 50, '50 tréninků'),
  R('strk-2', 'streak', 'Dva dny v řadě', 'flame', 'bronze', 'streak', 2, 'Trénuj 2 dny po sobě'),
  R('strk-3', 'streak', 'Tři dny v řadě', 'flame', 'silver', 'streak', 3, 'Trénuj 3 dny po sobě'),
  R('strk-7', 'streak', 'Týden v řadě', 'flame', 'gold', 'streak', 7, 'Trénuj 7 dní po sobě'),
  R('min-60', 'streak', 'Hodina s holí', 'clock', 'silver', 'minutes', 60, '60 minut cvičení'),
  R('min-300', 'streak', 'Pět hodin s holí', 'clock', 'gold', 'minutes', 300, '300 minut cvičení'),
  R('days-10', 'streak', 'Deset různých dnů', 'shield', 'silver', 'days', 10, 'Trénuj v 10 různých dnech'),
  R('st-1', 'skill', 'Tři hvězdy', 'star', 'gold', 'stars3', 1, 'Trénink se 3 hvězdami'),
  R('weak-5', 'skill', 'Bekhend se probouzí', 'zap', 'bronze', 'weak', 5, '5 cviků na slabší stranu'),
  R('weak-20', 'skill', 'Obě strany čepele', 'zap', 'silver', 'weak', 20, '20 cviků na slabší stranu'),
  R('weak-50', 'skill', 'Bekhend jako forhend', 'zap', 'gold', 'weak', 50, '50 cviků na slabší stranu'),
  R('react-5', 'skill', 'Hlava nahoře', 'zap', 'silver', 'reaction', 5, '5 reakčních cviků'),
  R('cone-10', 'skill', 'Kolem kuželů', 'shield', 'silver', 'around', 10, '10 cviků kolem kuželů'),
  R('l3-1', 'skill', 'Pokročilý cvik', 'shield', 'silver', 'l3', 1, 'Cvik úrovně 3'),
  R('drl-10', 'skill', 'Zvědavec', 'shield', 'bronze', 'drills', 10, '10 různých cviků'),
  R('ch-1', 'daily', 'Výzva splněna', 'flame', 'bronze', 'challenges', 1, 'Splň první výzvu dne'),
  R('ch-7', 'daily', 'Týden výzev', 'flame', 'silver', 'challenges', 7, '7 výzev dne'),
  R('wu-5', 'daily', 'Zahřátý', 'sunrise', 'bronze', 'warmups', 5, '5 rozcviček'),
  R('wu-20', 'daily', 'Vždy rozcvičený', 'sunrise', 'silver', 'warmups', 20, '20 rozcviček'),
];
export const UNIT_LABEL = {
  xp: 'XP', trainings: 'tréninků', stars3: '× 3 hvězdy', streak: 'dnů v řadě', days: 'různých dnů', minutes: 'minut',
  drills: 'různých cviků', l3: 'cviků úrovně 3+', weak: 'cviků na slabší stranu', reaction: 'reakčních cviků', around: 'cviků kolem kuželů',
  challenges: 'výzev', warmups: 'rozcviček',
};

const DRILLS = Object.fromEntries(allDrills().map((d) => [d.id, d]));
const dayKey = (t) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const dayNum = (key) => Math.round(new Date(Math.floor(key / 10000), Math.floor((key % 10000) / 100) - 1, key % 100).getTime() / 86400000);

export function statsOf(history, p = {}) {
  const keys = [...new Set(history.map((e) => dayKey(e.date)))].map(dayNum).sort((a, b) => a - b);
  let streak = keys.length ? 1 : 0; let run = 1;
  for (let i = 1; i < keys.length; i++) { run = keys[i] === keys[i - 1] + 1 ? run + 1 : 1; streak = Math.max(streak, run); }
  const seen = new Set(); let l3 = 0; let weak = 0; let reaction = 0; let around = 0; let warmups = 0;
  for (const e of history) {
    let warmed = false;
    for (const id of e.drills || []) {
      const d = DRILLS[id]; if (!d) continue;
      if (drillKind(d) === 'nobal') { warmed = true; continue; }
      if (drillKind(d) !== 'ball') continue;
      seen.add(id);
      if (d.level >= 3) l3++;
      if (isWeak(d)) weak++;
      if (d.callMode === 'náhodná reakce' || d.category === 'reakce') reaction++;
      if ((d.pattern || []).some((s) => /^around:/.test(String(s.at)))) around++;
    }
    if (warmed) warmups++;
  }
  return {
    trainings: history.length, stars3: history.filter((e) => e.stars === 3).length, streak, days: keys.length,
    minutes: Math.round(history.reduce((a, e) => a + (e.durationSec || 0), 0) / 60),
    drills: seen.size, l3, weak, reaction, around, warmups, challenges: p.challengeCount || 0,
  };
}

const valueOf = (r, xp, st) => (r.unit === 'xp' ? xp : (st[r.unit] || 0));
export const isUnlocked = (r, xp, st) => valueOf(r, xp, st) >= r.need;
export const rewardProgress = (r, xp, st) => ({ value: valueOf(r, xp, st), need: r.need });

export function nextXpReward(xp) {
  const list = REWARDS.filter((r) => r.unit === 'xp').sort((a, b) => a.need - b.need);
  const next = list.find((r) => r.need > xp);
  if (!next) return null;
  const prevNeed = list.filter((r) => r.need <= xp).map((r) => r.need).pop() || 0;
  return { reward: next, remaining: next.need - xp, progress: (xp - prevNeed) / (next.need - prevNeed) };
}
