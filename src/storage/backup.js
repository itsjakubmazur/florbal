// Záloha dat: export všech stores do jednoho JSON souboru (florbal-zaloha-YYYY-MM-DD.json) a import zpět.
// Fotky a klipy (store media, Blob) se ukládají jako dataURL; volba „bez fotek“ je vynechá.
import { storage, STORES, DB_VERSION } from './index.js';

export const BACKUP_APP = 'florbal-trener';
export const BACKUP_FORMAT = 1;

const blobToDataUrl = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
const dataUrlToBlob = async (u) => (await fetch(u)).blob();

export async function buildBackup({ withMedia = true } = {}) {
  const data = {};
  for (const s of STORES) {
    if (s === 'media' && !withMedia) { data[s] = []; continue; }
    const rows = await storage.list(s);
    if (s === 'media') {
      data[s] = [];
      for (const r of rows) data[s].push({ ...r, blob: r.blob instanceof Blob ? await blobToDataUrl(r.blob) : r.blob, _blob: r.blob instanceof Blob });
    } else data[s] = rows;
  }
  return { app: BACKUP_APP, format: BACKUP_FORMAT, dbVersion: DB_VERSION, version: __APP_VERSION__, createdAt: new Date().toISOString(), withMedia, data };
}

export const backupFileName = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `florbal-zaloha-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
};

/** Stáhne zálohu jako soubor (Blob + <a download>). Na iPadu Safari nabídne „Uložit do Souborů“. */
export async function downloadBackup(opts) {
  const backup = await buildBackup(opts);
  const blob = new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = backupFileName(); a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return { name: a.download, size: blob.size };
}

/** Ověří soubor zálohy; vrací souhrn nebo vyhodí chybu s českou zprávou. */
export function parseBackup(text) {
  let b;
  try { b = JSON.parse(text); } catch (e) { throw new Error('Soubor není platná záloha (nejde přečíst).'); }
  if (!b || b.app !== BACKUP_APP || !b.data || typeof b.data !== 'object') throw new Error('Tohle není záloha Florbal Trenéra.');
  if (b.format > BACKUP_FORMAT) throw new Error('Záloha je z novější verze appky. Nejdřív appku aktualizuj.');
  const counts = {};
  for (const s of STORES) { const rows = b.data[s] || []; if (!Array.isArray(rows)) throw new Error(`Poškozená záloha (${s}).`); counts[s] = rows.length; }
  return { backup: b, counts };
}

/** Nahradí všechna data obsahem zálohy. */
export async function restoreBackup(backup) {
  for (const s of STORES) {
    await storage.clearStore(s);
    for (const row of backup.data[s] || []) {
      if (!row || row.id == null) continue;
      if (s === 'media' && row._blob && typeof row.blob === 'string') {
        const { _blob, ...rest } = row;
        await storage.put(s, { ...rest, blob: await dataUrlToBlob(row.blob) });
      } else await storage.put(s, row);
    }
  }
}

/** Otevře výběr souboru (<input type=file>) a vrátí jeho text, nebo null. */
export function pickFileText() {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.style.display = 'none';
    inp.dataset.test = 'import-input';
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0];
      inp.remove();
      resolve(f ? await f.text() : null);
    });
    document.body.appendChild(inp);
    inp.click();
  });
}
