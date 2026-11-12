// Audio pro iOS/iPadOS: jeden AudioContext pro všechno (hlas, metronom, pípání, efekty).
//
// Odemčení: iOS pustí zvuk až po gestu. installAudioUnlock() při prvním pointerdown/touchend/keydown vytvoří
// (nebo obnoví) AudioContext, přehraje tichý buffer a nastaví navigator.audioSession.type = 'playback'
// (iOS 17+: Web Audio pak hraje i se ztlumeným přepínačem; viz docs/DECISIONS.md).
//
// Hlášky: předgenerované soubory assets/audio/voice/trener/<klíč>.mp3|wav (Edge TTS, scripts/gen-voices.mjs),
// načtené přes fetch + decodeAudioData do AudioBuffer a uložené v cache. Chybí-li soubor, mluví speechSynthesis (cs-CZ).
//
// Fronta (převzato z reference, „nikdy neusekávat hlášku“): v jednu chvíli zní jedna hláška.
//   call   – krátký povel (číslo, barva, forhend): když něco zní, přeskočí se
//   phrase – věta: počká ve frontě na konec (max. 2 čekající)
//   urgent – odpočet, „hraj“, pauza: předběhne frontu, ale nic nepřeruší
// Nic se nepřerušuje kromě explicitního stopVoice().
import phrases from '../content/phrases.json';

const FILES = {};
const found = import.meta.glob('../../assets/audio/voice/trener/*.{mp3,wav}', { query: '?url', import: 'default', eager: true });
for (const [path, url] of Object.entries(found)) FILES[path.split('/').pop().replace(/\.(mp3|wav)$/, '')] = url;

const TEXT = { ...phrases.fixed };
const GROUPS = {};
for (const [g, list] of Object.entries(phrases.groups)) {
  GROUPS[g] = list.map((_, i) => `${g}_${i + 1}`);
  list.forEach((t, i) => { TEXT[`${g}_${i + 1}`] = t; });
}
/** Texty mimo phrases.json (úvody cviků, návody na stanoviště) – klíč → text pro TTS zálohu. */
export const registerTexts = (map) => Object.assign(TEXT, map);
export const hasVoiceFile = (key) => !!FILES[key];
export const voiceFileCount = () => Object.keys(FILES).length;

// ---- AudioContext ----
let ctx = null;
let master = null;
let voiceGain = null;
let beepGain = null;
const vol = { voice: 1, beep: 0.7 };

export function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.connect(ctx.destination);
    voiceGain = ctx.createGain(); voiceGain.gain.value = vol.voice; voiceGain.connect(master);
    beepGain = ctx.createGain(); beepGain.gain.value = vol.beep; beepGain.connect(master);
  } catch (e) { ctx = null; }
  return ctx;
}
export const audioRunning = () => !!ctx && ctx.state === 'running';
export const beepOut = () => (getCtx(), beepGain);

/** Odemkne zvuk – volat z handleru gesta. Bezpečné volat opakovaně. */
export function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* starší iOS */ }
  const c = getCtx();
  if (!c) return;
  if (c.state !== 'running') c.resume().catch(() => {});
  try { // tichý buffer: na iOS „probudí“ výstup
    const b = c.createBuffer(1, 1, 22050);
    const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
  } catch (e) { /* bez zvuku */ }
  if (!unlockedTts && 'speechSynthesis' in window) {
    unlockedTts = true;
    try { const u0 = new SpeechSynthesisUtterance(' '); u0.volume = 0; speechSynthesis.speak(u0); } catch (e) { /* bez TTS */ }
  }
}
let unlockedTts = false;
export function installAudioUnlock() {
  const h = () => unlockAudio();
  ['pointerdown', 'touchend', 'keydown'].forEach((ev) => window.addEventListener(ev, h, { capture: true, passive: true }));
}
export const suspendAudio = () => { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); };

export const setVolume = (ch, v) => {
  vol[ch] = Math.min(1, Math.max(0, Number(v) || 0));
  if (ch === 'voice' && voiceGain) voiceGain.gain.value = vol.voice;
  if (ch === 'beep' && beepGain) beepGain.gain.value = vol.beep;
};
export const getVolume = (ch) => vol[ch];

// ---- režim: 'voice' = Trenér mluví, 'beeps' = jen pípání, 'off' = ticho ----
let voiceMode = 'voice';
export const setVoiceMode = (m) => { voiceMode = ['voice', 'beeps', 'off'].includes(m) ? m : 'voice'; if (voiceMode !== 'voice') stopVoice(); };
export const getVoiceMode = () => voiceMode;

/** Krátký tón na AudioContextu. when = absolutní čas audia (nebo 0 = hned). */
export function tone(freq, dur, when = 0, type = 'sine', gain = 0.5) {
  const c = getCtx();
  if (!c || c.state !== 'running') return;
  const t0 = Math.max(c.currentTime, when || c.currentTime);
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(beepGain); o.start(t0); o.stop(t0 + dur + 0.02);
}

const CALL_TONE = { red: 440, blue: 523, yellow: 587, green: 659, white: 784 };
function beepFor(key) {
  let m;
  if ((m = /^num_(\d)$/.exec(key))) tone(392 + Number(m[1]) * 66, 0.16, 0, 'triangle');
  else if ((m = /^color_(\w+)$/.exec(key))) tone(CALL_TONE[m[1]] || 600, 0.16, 0, 'triangle');
  else if (key === 'blade_fh') tone(880, 0.12, 0, 'triangle');
  else if (key === 'blade_bh') tone(523, 0.12, 0, 'triangle');
  else if (/^countdown_/.test(key)) tone(880, 0.14, 0, 'square', 0.25);
  else if (/^go_/.test(key)) { tone(1046, 0.14, 0, 'square', 0.25); const c = getCtx(); if (c) tone(1568, 0.3, c.currentTime + 0.14, 'square', 0.25); }
  else if (/^pause_/.test(key)) tone(440, 0.2);
  else if (/^resume_/.test(key)) tone(660, 0.2);
}

/** Zvukové efekty – syntetizované, bez souborů. */
export function sfx(name) {
  if (voiceMode === 'off') return;
  const c = getCtx(); if (!c || c.state !== 'running') return;
  const t = c.currentTime;
  if (name === 'success') { tone(784, 0.12, t, 'sine', 0.4); tone(1175, 0.22, t + 0.1, 'sine', 0.4); }
  else if (name === 'levelup') [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, t + i * 0.11, 'triangle', 0.35));
  else if (name === 'tap') tone(660, 0.06, t, 'sine', 0.25);
}

// ---- načítání hlášek ----
const buffers = new Map(); // key -> Promise<AudioBuffer|null>
function loadBuffer(key) {
  if (!FILES[key]) return Promise.resolve(null);
  if (buffers.has(key)) return buffers.get(key);
  const c = getCtx();
  if (!c) return Promise.resolve(null);
  const p = fetch(FILES[key])
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((ab) => (ab ? new Promise((res, rej) => c.decodeAudioData(ab, res, rej)) : null))
    .catch(() => null);
  buffers.set(key, p);
  return p;
}
/** Přednačte hlášky (např. všechny povely cviku před startem). */
export function preloadVoices(keys) { if (voiceMode === 'voice') keys.forEach((k) => loadBuffer(k)); }
export const preloadCommon = () => preloadVoices(Object.keys(TEXT).filter((k) => /^(num_|color_|blade_|countdown_|go_)/.test(k)));

// ---- fronta hlášek ----
let cur = null;
let tokenN = 0;
let queue = [];
let gapTimer = null;
let lastEnd = 0;
const GAP = 120;

function pump(delay) {
  if (gapTimer || cur || !queue.length) return;
  gapTimer = setTimeout(() => { gapTimer = null; if (!cur && queue.length) { const it = queue.shift(); start(it); } }, delay);
}
function release(token) {
  if (!cur || cur.token !== token) return;
  cur = null; lastEnd = performance.now();
  if (queue.length) pump(queue[0].kind === 'urgent' ? 60 : GAP);
}

let czVoice;
function pickVoice() {
  if (czVoice !== undefined || !('speechSynthesis' in window)) return czVoice;
  const vs = speechSynthesis.getVoices().filter((v) => /^cs/i.test(v.lang));
  if (vs.length) czVoice = vs.find((v) => /zuzana|antonin|iveta/i.test(v.name)) || vs[0];
  return czVoice;
}
if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { czVoice = undefined; });

function speak(text, token) {
  if (!('speechSynthesis' in window) || !text || vol.voice === 0) { release(token); return; }
  const ut = new SpeechSynthesisUtterance(text);
  ut.lang = 'cs-CZ'; ut.volume = vol.voice; ut.rate = 1; ut.pitch = 1;
  const v = pickVoice(); if (v) ut.voice = v;
  ut.onend = () => release(token); ut.onerror = () => release(token);
  try { speechSynthesis.speak(ut); } catch (e) { release(token); return; }
  setTimeout(() => release(token), Math.min(9000, text.length * 85 + 900)); // pojistka (někde onend nepřijde)
}

function start({ key, kind, text }) {
  const token = ++tokenN;
  cur = { token, kind, src: null };
  const fallbackText = text || TEXT[key];
  if (!FILES[key]) { speak(fallbackText, token); return; }
  loadBuffer(key).then((buf) => {
    if (!cur || cur.token !== token) return;
    const c = getCtx();
    if (!buf || !c || c.state !== 'running') { speak(fallbackText, token); return; }
    const s = c.createBufferSource(); s.buffer = buf; s.connect(voiceGain);
    s.onended = () => release(token);
    cur.src = s; s.start();
    setTimeout(() => release(token), buf.duration * 1000 + 1500); // pojistka
  });
}

/** Hláška podle klíče; opts.kind = call|phrase|urgent, opts.text = text pro TTS, když klíč nemá soubor ani text. */
export function say(key, opts = {}) {
  if (voiceMode === 'beeps') { beepFor(key); return; }
  if (voiceMode === 'off' || vol.voice === 0) return;
  const kind = opts.kind || 'call';
  const item = { key, kind, text: opts.text };
  if (cur || gapTimer) {
    if (kind === 'phrase') { queue.push(item); if (queue.length > 2) queue.shift(); }
    else if (kind === 'urgent') queue.unshift(item);
    return; // call se přeskočí
  }
  const since = performance.now() - lastEnd;
  if (kind !== 'call' && lastEnd && since < GAP) { queue.push(item); pump(kind === 'urgent' ? 60 : GAP - since); return; }
  start(item);
}

const lastPick = {};
/** Náhodná varianta ze skupiny (nikdy 2× po sobě stejná). */
export function sayGroup(group, opts = {}) {
  const list = GROUPS[group];
  if (!list || !list.length) return;
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastPick[group]);
  lastPick[group] = i;
  say(list[i], { kind: 'phrase', ...opts });
}
export const voiceBusy = () => !!cur || !!gapTimer || queue.length > 0;
export function stopVoice() {
  queue = []; if (gapTimer) { clearTimeout(gapTimer); gapTimer = null; }
  const c = cur; cur = null;
  if (c && c.src) { try { c.src.stop(); } catch (e) { /* už skončil */ } }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
export const textOf = (key) => TEXT[key];
