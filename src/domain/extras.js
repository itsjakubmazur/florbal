// Týdenní lišta a výzva dne (port z reference, florbalový obsah).
import { saveProfile } from './profiles.js';

export const dayKey = (t) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
export const WEEK_GOAL = 4; // týdenní cíl 4 ze 7 dní místo denní série (SUMMARY kap. 4)

export function weekOf(history, now = Date.now()) {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday); day.setDate(monday.getDate() + i);
    const key = dayKey(day);
    const list = history.filter((e) => dayKey(e.date) === key);
    days.push({ label: DAYS[i], num: day.getDate(), trained: list.length > 0, today: key === dayKey(now), future: day > d });
  }
  return days;
}

// Výzva dne – zatím krátký seznam; plné výzvy a souboje přinese M4 (challenges.json).
export const CHALLENGES = [
  'Udrž míček 20 sekund jen forhendem, ať ti neuteče',
  '10× přetáhni míček z forhendu na bekhend bez chyby',
  'Objeď kužel 5× forhendem a 5× bekhendem',
  'Veď míček mezi dvěma botami a nedotkni se jich',
  'Zkus 15 sekund vést míček a dívat se přitom na tátu nebo mámu',
  'Nauč někoho doma jeden cvik z appky',
  '5× zastav míček čepelí na místě, kam ukáže rodič',
  'Udělej 10 přetažení jen bekhendem',
];
export const CHALLENGE_XP = 15;
export const challengeOf = (now = Date.now()) => CHALLENGES[dayKey(now) % CHALLENGES.length];
export const challengeDone = (p, now = Date.now()) => p.challengeDay === dayKey(now);
export async function completeChallenge(p) {
  if (challengeDone(p)) return false;
  p.challengeDay = dayKey(Date.now()); p.xp = (p.xp || 0) + CHALLENGE_XP; p.challengeCount = (p.challengeCount || 0) + 1;
  await saveProfile(p); return true;
}
