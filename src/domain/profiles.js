// Profily hráčů (SPEC kap. 5): { id, name, age, grip, level, xp, sessionLength, space, cones, jersey, theme, createdAt }.
import { storage, uid } from '../storage/index.js';
import { rankInfo } from './xp.js';

export const SKILL_LEVELS = { 1: 'Začátečník', 2: 'Mírně pokročilý', 3: 'Pokročilý', 4: 'Zkušený', 5: 'Mistr' };
export const MAX_SKILL = 5;
export const SESSION_LENGTHS = [5, 10, 15, 20];

export const PROFILE_DEFAULTS = { name: 'Hráč', age: 8, grip: 'right', level: 1, xp: 0, sessionLength: 10, space: 'medium', cones: 4, jersey: '', theme: null };

export const listProfiles = async () => (await storage.list('profiles')).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
export const getProfile = async (id) => { const p = await storage.get('profiles', id); return p ? { ...PROFILE_DEFAULTS, ...p } : null; };

export async function createProfile(data = {}) {
  const p = { ...PROFILE_DEFAULTS, ...data, id: uid(), xp: 0, createdAt: Date.now() };
  p.name = String(p.name || '').trim().slice(0, 20) || 'Hráč';
  await storage.put('profiles', p);
  return p;
}
export const saveProfile = (p) => storage.put('profiles', p);

export async function deleteProfile(id) {
  await storage.remove('profiles', id);
  for (const e of (await storage.list('history')).filter((x) => x.profileId === id)) await storage.remove('history', e.id);
}

export async function addHistory(profileId, entry) {
  await storage.put('history', { id: uid(), profileId, date: Date.now(), ...entry });
  const p = await getProfile(profileId);
  if (p) { p.xp = (p.xp || 0) + (entry.xp || 0); await saveProfile(p); }
}
export async function listHistory(profileId) {
  return (await storage.list('history')).filter((e) => e.profileId === profileId).sort((a, b) => b.date - a.date);
}

export const profileRank = (p) => rankInfo(p.xp || 0);
