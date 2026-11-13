// Obrazovka nesmí zhasnout během tréninku.
// 1) Screen Wake Lock API (navigator.wakeLock.request('screen')); po návratu appky do popředí (visibilitychange)
//    a po uvolnění systémem se zámek znovu vyžádá, dokud je trénink aktivní.
// 2) Záloha: tiché smyčkované video (playsinline muted loop) – princip NoSleep.js (MIT). Spouští se, když API chybí
//    nebo request selže, a navíc na iOS/iPadOS < 18.4, kde API v nainstalované webové appce nefungovalo (WebKit #254545).
// enable() volat přímo z handleru klepnutí (video.play() potřebuje gesto).
import { mp4, webm } from './nosleep-media.js';

let wanted = false;
let sentinel = null;
let video = null;
let mode = 'none'; // 'api' | 'video' | 'both' | 'none'

export function iosVersion() {
  const ua = navigator.userAgent;
  const isIOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIOS) return null;
  const m = /Version\/(\d+)\.(\d+)/.exec(ua) || /OS (\d+)_(\d+)/.exec(ua);
  return m ? Number(m[1]) + Number(m[2]) / 100 : 0;
}
const needsVideoAlso = () => { const v = iosVersion(); return v !== null && v < 18.04; };

// Drží nejvýš jeden zámek: opakované enable (Pokračovat, Přeskočit) ho znovu nežádá, souběžné žádosti sdílí jednu
// a zámek, který dorazí až po disable, se hned uvolní (jinak by po tréninku visel a obrazovka nezhasla).
let pending = null;
function requestApi() {
  if (!('wakeLock' in navigator)) return Promise.resolve(false);
  if (sentinel && !sentinel.released) return Promise.resolve(true);
  if (pending) return pending;
  pending = (async () => {
    try {
      const s = await navigator.wakeLock.request('screen');
      if (!wanted) { s.release().catch(() => {}); return false; }
      sentinel = s;
      s.addEventListener('release', () => {
        if (sentinel === s) sentinel = null;
        if (wanted && document.visibilityState === 'visible') requestApi();
      });
      return true;
    } catch (e) { return false; } finally { pending = null; }
  })();
  return pending;
}

function startVideo() {
  if (!video) {
    video = document.createElement('video');
    video.setAttribute('title', 'Obrazovka zůstane zapnutá');
    video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.setAttribute('loop', '');
    video.muted = true; video.playsInline = true; video.loop = true;
    video.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    const add = (type, src) => { const s = document.createElement('source'); s.src = src; s.type = type; video.appendChild(s); };
    add('video/webm', webm); add('video/mp4', mp4);
    video.addEventListener('timeupdate', () => { if (video.currentTime > 0.5) video.currentTime = Math.random(); });
    document.body.appendChild(video);
  }
  const p = video.play();
  if (p && p.catch) p.catch(() => {});
}

/** Zapne „nezhasínat“. Vrací použitý režim. */
export async function enableWakeLock() {
  wanted = true;
  const iosOld = needsVideoAlso();
  if (iosOld || !('wakeLock' in navigator)) startVideo(); // synchronně v gestu
  const ok = await requestApi();
  if (!ok && !video) startVideo();
  mode = ok ? (video ? 'both' : 'api') : 'video';
  return mode;
}
export function disableWakeLock() {
  wanted = false;
  if (sentinel) { sentinel.release().catch(() => {}); sentinel = null; }
  if (video) { video.pause(); }
  mode = 'none';
}
export const wakeLockMode = () => mode;
export const wakeLockActive = () => wanted && (!!sentinel || (!!video && !video.paused));

document.addEventListener('visibilitychange', () => {
  if (!wanted || document.visibilityState !== 'visible') return;
  if (!sentinel) requestApi();
  if (video && video.paused) { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
});
