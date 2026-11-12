// Počitadla aktivit mimo trénink (souboje, triky, testy) uložená v profilu jako p.m4.
// Slouží odměnám (rewards.js) a kartám (cards.js). XP se jen přičítají, nikdy neubírají (SUMMARY kap. 4).
import { getProfile, saveProfile } from './profiles.js';

export const M4_KEYS = ['duels', 'wins', 'rematches', 'kohout', 'custom', 'steps', 'tricks', 'tests', 'records'];

export function m4Stats(p = {}) {
  const m = (p && p.m4) || {};
  return Object.fromEntries(M4_KEYS.map((k) => [k, m[k] || 0]));
}

/**
 * Přičte počitadla a XP hráči. @param {string} profileId @param {Record<string, number>} add @param {number} [xp]
 * @returns {Promise<object|null>} aktualizovaný profil
 */
export async function bump(profileId, add = {}, xp = 0) {
  const p = await getProfile(profileId);
  if (!p) return null;
  p.m4 = { ...(p.m4 || {}) };
  for (const [k, v] of Object.entries(add)) p.m4[k] = (p.m4[k] || 0) + Math.max(0, v || 0);
  p.xp = (p.xp || 0) + Math.max(0, xp || 0);
  await saveProfile(p);
  return p;
}
