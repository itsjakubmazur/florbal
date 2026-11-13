// Vygeneruje hlasové hlášky Trenéra jako MP3 (Edge TTS, cs-CZ-AntoninNeural) do assets/audio/voice/trener/<klíč>.mp3.
// Zdroje textů: src/content/phrases.json (fixed + groups), úvody cviků (drill_<id> z drills.json)
// a návody na postavení (setup_<stanoviště>_<n> ze stations.json).
// Spuštění: node scripts/gen-voices.mjs   (existující soubory přeskočí, jde opakovat; vyžaduje síť)
//   --provider azure   oficiální Azure AI Speech, stejný hlas; potřebuje AZURE_SPEECH_KEY a AZURE_SPEECH_REGION (např. westeurope)
//   --force            přegeneruje i existující MP3 (třeba po přechodu na Azure)
//   --only <prefix>    jen klíče začínající prefixem (např. --only trick_)
//   --list             nic negeneruje, vypíše tabulku klíč<TAB>text – podklad pro vlastní nahrávky
// Vlastní nahrávky: <klíč>.m4a nebo <klíč>.wav do stejné složky (např. Diktafon z iPhonu); mají přednost před MP3
// a generátor je nepřepíše.
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
const swapLR = (t) => t.replace(/\b(doleva|doprava|vlevo|vpravo)\b/gi, (w) => { const m = { doleva: 'doprava', doprava: 'doleva', vlevo: 'vpravo', vpravo: 'vlevo' }[w.toLowerCase()]; return w[0] === w[0].toUpperCase() ? m[0].toUpperCase() + m.slice(1) : m; });
for (const s of read('src/content/stations.json')) {
  s.setupSteps.forEach((st, i) => { TEXT[`${s.voiceSetup}_${i + 1}`] = st.text; });
  // zrcadlená verze pro leváky (asymetrická stanoviště, mirror: true) – stejná logika jako stationFor() v src/domain/stations.js
  if (s.mirror) s.setupSteps.forEach((st, i) => { TEXT[`${s.voiceSetup}_m_${i + 1}`] = swapLR(st.text); });
}

// M4: kroky triků, úvody výzev a testů dovedností – stejné klíče, jaké registruje appka (tricks.js, duels.js, skilltests.js)
for (const t of read('src/content/tricks.json')) for (const st of t.steps) if (st.voice) TEXT[`trick_${st.id}`] = st.voice;
for (const c of read('src/content/challenges.json')) if (c.voiceIntro) TEXT[`challenge_${c.id}`] = c.voiceIntro;
for (const t of read('src/content/skilltests.json')) if (t.voiceIntro) TEXT[`test_${t.id}`] = t.voiceIntro;

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const PROVIDER = opt('--provider') || 'edge';
const FORCE = args.includes('--force');
const ONLY = opt('--only');
if (args.includes('--list')) {
  for (const [key, text] of Object.entries(TEXT)) if (!ONLY || key.startsWith(ONLY)) console.log(`${key}\t${text.replace(/\s+/g, ' ')}`);
  process.exit(0);
}

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
async function azureTts(text, file) {
  const key = process.env.AZURE_SPEECH_KEY; const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error('chybí AZURE_SPEECH_KEY nebo AZURE_SPEECH_REGION');
  const ssml = `<speak version="1.0" xml:lang="cs-CZ"><voice name="${VOICE.voice}"><prosody rate="${VOICE.rate}" pitch="${VOICE.pitch}">${esc(text)}</prosody></voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST', body: ssml,
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'florbal-trener' },
  });
  if (!r.ok) throw new Error(`Azure ${r.status} ${(await r.text()).slice(0, 80)}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

fs.mkdirSync(OUT, { recursive: true });
if (!['edge', 'azure'].includes(PROVIDER)) { console.error('neznámý --provider (edge | azure)'); process.exit(1); }
const edge = PROVIDER === 'edge' ? new EdgeTTS({ voice: VOICE.voice, lang: 'cs-CZ', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', rate: VOICE.rate, pitch: VOICE.pitch, timeout: 20000 }) : null;
const synth = (text, file) => (edge ? edge.ttsPromise(text, file) : azureTts(text, file));
for (const [key, text] of Object.entries(TEXT)) {
  if (ONLY && !key.startsWith(ONLY)) continue;
  const file = `${OUT}/${key}.mp3`;
  if (['m4a', 'wav'].some((x) => fs.existsSync(`${OUT}/${key}.${x}`))) continue; // vlastní nahrávka má přednost
  if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 1000) continue;
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    try { await synth(text, file); ok = true; console.log('OK', key); }
    catch (e) { console.log('opakuji', key, attempt, String(e.message || e).slice(0, 60)); await new Promise((r) => setTimeout(r, 3000 * attempt)); }
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.log('HOTOVO', Object.keys(TEXT).length, 'hlášek');
