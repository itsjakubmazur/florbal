# Audio – hlas Trenéra, metronom, pípání

## Hlášky
- Texty: `src/content/phrases.json` (`fixed` = povely a jednotlivé věty, `groups` = skupiny s variantami, losují se, nikdy 2× po sobě stejná),
  úvody cviků (`drill_<id>` = `voiceIntro` z `drills.json`) a návody na postavení (`setup_<stanoviště>_<n>` ze `stations.json`).
- Soubory: `assets/audio/voice/trener/<klíč>.mp3` (nebo `.wav`), generuje `node scripts/gen-voices.mjs` (Edge TTS, cs-CZ-AntoninNeural).
- Appka je najde sama (`import.meta.glob` v `src/core/audio.js`), načte přes `fetch` + `decodeAudioData` do `AudioBuffer` a přehrává
  přes jeden `AudioContext`. Service worker je přednačte do offline cache.
- Chybí-li soubor, mluví hlas zařízení (`speechSynthesis`, cs-CZ).
- Doporučení pro nahrávky: krátké povely (`num_*`, `color_*`, `blade_*`, `countdown_*`) bez ticha na začátku a na konci (max. ~0,5 s),
  aby šly za sebou v tempu.

## Fronta (nikdy neusekávat hlášku)
- **call** (čísla, barvy, forhend/bekhend): když zrovna něco zní, přeskočí se.
- **phrase** (věty): počká ve frontě (max. 2 čekající).
- **urgent** (odpočet, „hraj“, pauza): předběhne frontu, ale nic nepřeruší.

## Metronom a pípání
Syntetizované oscilátorem (`src/core/metronome.js`, `tone()` v `audio.js`), žádné soubory. Režim Rodiče → Zvuk: Hlas / Pípání / Ticho.
