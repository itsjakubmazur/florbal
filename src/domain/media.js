// Fotky cílů a „mantinelů“ vlastních výzev (store media, Blob). Jen v zařízení, nic se neodesílá.
// Fotka z kamery iPadu (<input type=file accept=image/* capture=environment>) se zmenší na delší stranu ~800 px (JPEG).
import { storage, uid } from '../storage/index.js';

export const PHOTO_MAX = 800;

async function decode(file) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { /* starší Safari: přes <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

/** Zmenší obrázek na delší stranu max. PHOTO_MAX px a vrátí JPEG Blob. */
export async function resizeImage(file, max = PHOTO_MAX) {
  const img = await decode(file);
  const w0 = img.width || img.naturalWidth; const h0 = img.height || img.naturalHeight;
  const k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)); const h = Math.max(1, Math.round(h0 * k));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  if (img.close) img.close();
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.82));
  return { blob: blob || file, w, h };
}

/** Uloží fotku do store media a vrátí její id. */
export async function savePhoto(file) {
  const { blob, w, h } = await resizeImage(file);
  const id = `ph-${uid()}`;
  await storage.put('media', { id, kind: 'photo', mime: blob.type || 'image/jpeg', blob, w, h, createdAt: Date.now() });
  return id;
}

export const removeMedia = (id) => (id ? storage.remove('media', id) : null);

const urls = new Map();
/** objectURL fotky (cache po dobu běhu appky); null, když fotka není (např. záloha bez fotek). */
export async function mediaUrl(id) {
  if (!id) return null;
  if (urls.has(id)) return urls.get(id);
  const m = await storage.get('media', id);
  if (!m || !(m.blob instanceof Blob)) return null;
  const u = URL.createObjectURL(m.blob);
  urls.set(id, u);
  return u;
}

/** Otevře kameru / výběr fotky. Vrací File nebo null. */
export function pickPhoto() {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.setAttribute('capture', 'environment');
    inp.style.display = 'none';
    inp.dataset.test = 'photo-input';
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; inp.remove(); resolve(f || null); });
    document.body.appendChild(inp);
    inp.click();
  });
}
