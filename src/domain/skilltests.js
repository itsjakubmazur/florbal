// Testy dovedností (skilltests.json): výsledky do store records, osobní rekordy a průběh pro graf.
// Záznam: { id, profileId, testId, value (nejlepší pokus), values [pokusy], date, record (překonal předchozí rekord) }.
import tests from '../content/skilltests.json';
import { storage, uid } from '../storage/index.js';

export const allTests = () => tests;
export const getTest = (id) => tests.find((t) => t.id === id) || null;
export const isBetter = (t, a, b) => (b == null ? true : t.better === 'lower' ? a < b : a > b);
export const bestOf = (t, values) => (values.length ? (t.better === 'lower' ? Math.min(...values) : Math.max(...values)) : null);
export const fmtValue = (t, v) => (v == null ? '–' : t.unit === 's' ? `${String(Math.round(v * 10) / 10).replace('.', ',')} s` : String(v));
export const unitLabel = (t) => (t.unit === 's' ? 'sekund' : 'počet');

export async function listResults(profileId, testId) {
  return (await storage.list('records')).filter((r) => r.profileId === profileId && (!testId || r.testId === testId)).sort((a, b) => a.date - b.date);
}
export function personalRecord(t, results) {
  let best = null;
  for (const r of results) if (r.testId === t.id && isBetter(t, r.value, best)) best = r.value;
  return best;
}

/** Uloží výsledek testu. record = byl překonán dřívější rekord (první výsledek je „první rekord“, ne překonání). */
export async function saveResult(profileId, t, values) {
  const prev = personalRecord(t, await listResults(profileId, t.id));
  const value = bestOf(t, values);
  const row = { id: `rc-${uid()}`, profileId, testId: t.id, value, values, date: Date.now(), first: prev == null, record: prev != null && isBetter(t, value, prev) };
  await storage.put('records', row);
  return { row, prev };
}
