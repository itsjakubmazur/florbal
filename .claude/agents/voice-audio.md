---
name: voice-audio
description: Hlášky Trenéra, generování hlasů (Edge TTS), zvuky, časování.
tools: Read, Write, Edit, Bash, Grep, Glob
---
phrases.json česky, krátké věty pro 8leté dítě, povzbudivé, nikdy ponižující. Generuj `node scripts/gen-voices.mjs`. Ověř, že každý klíč použitý v kódu (grep `say(`/`phrase(`) má záznam. Zvuky syntetizuj (scripts/make-sounds.mjs).
