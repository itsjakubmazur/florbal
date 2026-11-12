// IndexedDB 'florbal' (SPEC kap. 5). Jednoduché async rozhraní: get, put, remove, list, clear.
// Stores: profiles, history, settings, duels, records, tricks, customChallenges, media.
export const DB = 'florbal';
export const DB_VERSION = 1;
export const STORES = ['profiles', 'history', 'settings', 'duels', 'records', 'tricks', 'customChallenges', 'media'];
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, DB_VERSION);
    r.onupgradeneeded = () => {
      for (const s of STORES) if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s, { keyPath: 'id' });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => { dbp = null; reject(r.error); };
  });
  return dbp;
}
const run = async (store, mode, fn) => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const storage = {
  get: (store, id) => run(store, 'readonly', (s) => s.get(id)),
  put: (store, obj) => run(store, 'readwrite', (s) => s.put(obj)),
  remove: (store, id) => run(store, 'readwrite', (s) => s.delete(id)),
  list: (store) => run(store, 'readonly', (s) => s.getAll()),
  clearStore: (store) => run(store, 'readwrite', (s) => s.clear()),
  async clear() { for (const s of STORES) await this.clearStore(s); },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const settings = {
  defaults: {
    pin: '', pinCustom: false,
    voiceMode: 'voice', volVoice: 1, volBeep: 0.7,
    quiet: false,        // tichý trénink (byt): jen cviky s noise „tichý“
    tempoMul: 1,
    theme: 'noc',
  },
  async load() { return { ...this.defaults, ...((await storage.get('settings', 'main')) || {}) }; },
  async save(patch) { const cur = await this.load(); await storage.put('settings', { ...cur, ...patch, id: 'main' }); },
};

// ---- trvalé úložiště: iOS umí data webu smazat, persist() to omezí ----
export async function requestPersist() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (e) { return null; }
}
export async function persistStatus() {
  try {
    const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null;
    const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
    return { persisted, usage: est ? est.usage : null, quota: est ? est.quota : null };
  } catch (e) { return { persisted: null, usage: null, quota: null }; }
}
