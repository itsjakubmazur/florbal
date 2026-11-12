// Vygeneruje hlasové hlášky Trenéra jako MP3 (Edge TTS, cs-CZ-AntoninNeural) do assets/audio/voice/trener/<klíč>.mp3.
// Zdroje textů: src/content/phrases.json (fixed + groups), úvody cviků (drill_<id> z drills.json)
// a návody na postavení (setup_<stanoviště>_<n> ze stations.json).
// Spuštění: node scripts/gen-voices.mjs   (existující soubory přeskočí, jde opakovat; vyžaduje síť)
// Appka soubory najde sama (import.meta.glob v src/core/audio.js) a precache je přidá do offline režimu.
import { EdgeTTS } from 'node-edge-tts';
import fs from 'node:fs';

const OUT = 'assets/audio/voice/trener';
const VOICE = { voice: 'cs-CZ-AntoninNeural', rate: '-2%', pitch: '-3Hz' };
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const phrases = read('src/content/phrases.json');
const TEXT = { ...phrases.fixed };
for (const [g, list] of Object.entries(phrases.groups)) list.forEach((t, i) => { TEXT[`${g}_${i + 1}`] = t; });
for (const d of read('src/content/drills.json')) TEXT[`drill_${d.id}`] = d.voiceIntro;
const swapLR = (t) => t.replace(/(doleva|doprava|vlevo|vpravo)/gi, (w) => { const m = { doleva: 'doprava', doprava: 'doleva', vlevo: 'vpravo', vpravo: 'vlevo' }[w.toLowerCase()]; return w[0] === w[0].toUpperCase() ? m[0].toUpperCase() + m.slice(1) : m; });
for (const s of read('src/content/stations.json')) {
  s.setupSteps.forEach((st, i) => { TEXT[`${s.voiceSetup}_${i + 1}`] = st.text; });
  // zrcadlená verze pro leváky (asymetrická stanoviště, mirror: true) – stejná logika jako stationFor() v src/domain/stations.js
  if (s.mirror) s.setupSteps.forEach((st, i) => { TEXT[`${s.voiceSetup}_m_${i + 1}`] = swapLR(st.text); });
}

fs.mkdirSync(OUT, { recursive: true });
const tts = new EdgeTTS({ voice: VOICE.voice, lang: 'cs-CZ', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', rate: VOICE.rate, pitch: VOICE.pitch, timeout: 20000 });
for (const [key, text] of Object.entries(TEXT)) {
  const file = `${OUT}/${key}.mp3`;
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) continue;
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    try { await tts.ttsPromise(text, file); ok = true; console.log('OK', key); }
    catch (e) { console.log('opakuji', key, attempt, String(e.message || e).slice(0, 60)); await new Promise((r) => setTimeout(r, 3000 * attempt)); }
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.log('HOTOVO', Object.keys(TEXT).length, 'hlášek');
