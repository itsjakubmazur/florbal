// Frajeřinky: strom triků z tricks.json (requires → odemykání), kroky odklikává rodič (BRIEF kap. 4.6 B).
// Postup: store tricks, jeden záznam na splněný krok { id: `${profileId}:${stepId}`, profileId, trickId, stepId, date }.
import tricks from '../content/tricks.json';
import challenges from '../content/challenges.json';
import { storage } from '../storage/index.js';
import { dayKey } from './extras.js';

export const allTricks = () => tricks;
export const getTrick = (id) => tricks.find((t) => t.id === id) || null;

export async function trickProgress(profileId) {
  const rows = (await storage.list('tricks')).filter((r) => r.profileId === profileId);
  const steps = new Set(rows.map((r) => r.stepId));
  const doneTricks = new Set(tricks.filter((t) => t.steps.every((s) => steps.has(s.id))).map((t) => t.id));
  return { steps, doneTricks, rows };
}

export const isTrickUnlocked = (t, prog) => (t.requires || []).every((r) => prog.doneTricks.has(r));
export const trickState = (t, prog) => (prog.doneTricks.has(t.id) ? 'done' : isTrickUnlocked(t, prog) ? 'open' : 'locked');
export const nextStep = (t, prog) => t.steps.find((s) => !prog.steps.has(s.id)) || null;
export const stepsDone = (t, prog) => t.steps.filter((s) => prog.steps.has(s.id)).length;

/** Odklikne krok. Vrací { already, trickDone } – trickDone = tímto krokem je celý trik hotový. */
export async function completeStep(profileId, trick, stepId) {
  const id = `${profileId}:${stepId}`;
  if (await storage.get('tricks', id)) return { already: true, trickDone: false };
  await storage.put('tricks', { id, profileId, trickId: trick.id, stepId, date: Date.now() });
  const prog = await trickProgress(profileId);
  return { already: false, trickDone: prog.doneTricks.has(trick.id) };
}
/** Rodič může krok odznačit (omyl). XP ani karty se tím neberou. */
export const uncompleteStep = (profileId, stepId) => storage.remove('tricks', `${profileId}:${stepId}`);

/** Úrovně stromu: hloubka podle requires (0 = bez předpokladů). */
export function treeLevels() {
  const depth = {};
  const d = (t) => {
    if (depth[t.id] != null) return depth[t.id];
    depth[t.id] = 0;
    depth[t.id] = (t.requires || []).length ? 1 + Math.max(...t.requires.map((r) => d(getTrick(r) || { id: r }))) : 0;
    return depth[t.id];
  };
  tricks.forEach(d);
  const levels = [];
  tricks.forEach((t) => { (levels[depth[t.id]] = levels[depth[t.id]] || []).push(t); });
  return levels;
}

const hash = (n) => { let x = n ^ 0x5bd1e995; x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d); x = Math.imul(x ^ (x >>> 12), 0x297a2d39); return (x ^ (x >>> 15)) >>> 0; };

/**
 * Dnešní frajeřinka: deterministicky podle data. Sudý den = další krok odemčeného triku, lichý = výzva z knihovny.
 * @returns {{kind:'step', trick, step} | {kind:'challenge', challenge}}
 */
export function dailyPick(prog, now = Date.now()) {
  const k = dayKey(now);
  const hv = hash(k);
  const open = tricks.filter((t) => trickState(t, prog) === 'open').map((t) => ({ trick: t, step: nextStep(t, prog) })).filter((x) => x.step);
  if (open.length && hv % 2 === 0) { const x = open[(hv >>> 1) % open.length]; return { kind: 'step', ...x }; }
  const pool = challenges.filter((c) => c.type !== 'kohout' && !String(c.players || '').startsWith('2') && c.noise !== 'hlasitý');
  const list = pool.length ? pool : challenges;
  return { kind: 'challenge', challenge: list[(hv >>> 1) % list.length] };
}
