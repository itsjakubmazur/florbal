// Update flow PWA (vite-plugin-pwa, registerType 'prompt').
// Nová verze se stáhne na pozadí, ale aktivuje se až klepnutím na pruh „Je k dispozici nová verze – aktualizovat“.
// Během tréninku nebo souboje (setBusy(true)) se pruh nezobrazí a appka se nikdy neaktualizuje sama.
let updateSW = null;
let needRefresh = false;
let busy = false;
let dismissed = false;
let bar = null;

export function setBusy(v) {
  busy = !!v;
  if (busy) hideBar(); else if (needRefresh && !dismissed) showBar();
}
export const isBusy = () => busy;
export const updateAvailable = () => needRefresh;

function hideBar() { if (bar) { bar.remove(); bar = null; } }
function showBar() {
  if (busy || bar || !needRefresh) return;
  bar = document.createElement('div');
  bar.className = 'update-bar';
  bar.setAttribute('role', 'status');
  bar.dataset.test = 'update-bar';
  const t = document.createElement('span'); t.textContent = 'Je k dispozici nová verze';
  const go = document.createElement('button'); go.type = 'button'; go.textContent = 'Aktualizovat';
  go.addEventListener('click', (e) => { e.stopPropagation(); applyUpdate(); });
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = 'Později'; x.setAttribute('aria-label', 'Později');
  x.addEventListener('click', (e) => { e.stopPropagation(); dismissed = true; hideBar(); });
  bar.append(t, go, x);
  document.body.appendChild(bar);
}
export function applyUpdate() {
  if (busy) return; // nikdy uprostřed tréninku
  hideBar();
  if (updateSW) updateSW(true); else location.reload();
}

export async function initPwa() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() { needRefresh = true; dismissed = false; showBar(); },
      onOfflineReady() { /* appka je připravená offline – nic neukazujeme */ },
      onRegisteredSW(_url, reg) {
        // kontrola nové verze při návratu do appky a jednou za hodinu
        if (!reg) return;
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !busy) reg.update().catch(() => {}); });
        setInterval(() => { if (!busy) reg.update().catch(() => {}); }, 60 * 60 * 1000);
      },
    });
  } catch (e) { /* bez service workeru appka běží dál */ }
}

/** Pro testy: simulace nové verze. */
export function _simulateUpdate() { needRefresh = true; dismissed = false; showBar(); }
