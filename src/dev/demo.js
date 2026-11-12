// ?demo vytvoří smyšleného ukázkového hráče „Tonda Čepel“ s trochou postupu. Nic nemaže: když už hráči existují, nedělá nic.
import { listProfiles, createProfile, addHistory } from '../domain/profiles.js';
import { storage } from '../storage/index.js';

export const DEMO_NAME = 'Tonda Čepel';

export async function ensureDemoPlayer() {
  if ((await listProfiles()).length) return null;
  const p = await createProfile({ name: DEMO_NAME, age: 8, grip: 'left', level: 2, jersey: '17', sessionLength: 10, space: 'medium', cones: 4 });
  for (let i = 0; i < 3; i++) await addHistory(p.id, { durationSec: 480, xp: 70, drills: ['wu-quick-feet', 'fh-bh-front', 'fh-push-cones', 'bh-only-front', 'stretch-end'], stars: 3 - (i % 2) });
  const hist = await storage.list('history');
  for (const [i, e] of hist.entries()) { e.date = Date.now() - (hist.length - 1 - i) * 2 * 86400000; await storage.put('history', e); }
  return p;
}
