# Rozhodnutí

Každé netriviální rozhodnutí: co, proč, alternativy.

**D1 – Grafika jen vlastní SVG kódem.** Reference má grafiku z Gemini (vlastní dílo jejího autora, vázané na fotbalový vzhled). Nepřebíráme ji. Kužely, hůl, míček, ikony, odměny, karty, dresy kreslíme jako SVG v kódu: licenčně čisté, ostré na Retině, malé pro offline cache. Alternativa: placené generování obrázků (vyžaduje souhlas rodiče), převzetí reference (vzhled 1:1, nejasná licence).

**D2 – Vanilla JS port z reference.** Zachováváme architekturu reference (router, IndexedDB storage, audio fronta, focus vrstva), protože je malá, funkční a otestovaná na dětech. Alternativa: přepis do Reactu/Svelte (víc práce, žádný přínos pro uživatele).

**D3 – Odstraněno při startu:** Android/Capacitor, fotbalové podložky (`src/config/mats`), týmy (`teams.json`), skripty pro fotbalové assety a Gemini grafiku, web build pro file://. Fokus vrstva (`src/core/focus.js`) zůstává pro budoucí TV režim.

**D4 – ffmpeg na Macu je rozbitý** (chybí libx265). Zpracování zvuku řešíme v Node (WAV/MP3 dekodér z reference). Story video z unslopu bez ffmpeg nevznikne, pokud se ffmpeg neopraví (`brew reinstall ffmpeg`).
