# Zdroje a licence

Florbal Trenér je soukromá rodinná aplikace. Vychází z otevřeného projektu **Tréninková podložka** (Jakub Uhlíř,
https://github.com/kuba-uhlir/treninkova-podlozka, licence MIT – viz `LICENSE`). Z reference je převzat jen zdrojový kód
(architektura, router, D-pad vrstva, audio fronta, skládání tréninku, XP a odměny), žádné obrázky, fotky, loga ani hlasy.

| Co | Odkud | Licence / poznámka |
| --- | --- | --- |
| Zdrojový kód | Jakub Uhlíř (reference) + vlastní úpravy | MIT (`LICENSE`) |
| Grafika (stanoviště, hůl, míček, dres, ikona appky, odměny) | vlastní SVG kreslené kódem (`src/ui/*`, `scripts/build-icons.mjs`) | vlastní dílo |
| Ikony rozhraní | Lucide (lucide.dev), balíček `lucide-static` → `src/ui/icons.js` | ISC |
| Záložní „nezhasínat“ video (`src/core/nosleep-media.js`) | NoSleep.js 0.12.0, (c) Rich Tibbett | MIT |
| Písmo Inter | @fontsource/inter | SIL Open Font License 1.1 |
| Hlas Trenér (`assets/audio/voice/trener`, zatím negenerováno) | Microsoft Edge TTS (cs-CZ-AntoninNeural) přes `node-edge-tts` | podmínky služby ověří agent `licensing` (M4); záloha = hlas zařízení |
| Metronom, pípání, efekty | syntéza oscilátorem v Web Audio | vlastní |
| Logo FBŠ Hattrick Brno (`assets/img/club`, použití od M4) | oficiální web klubu | použito se svolením klubu, soukromá appka |
| Software | Vite, Tailwind CSS, vite-plugin-pwa, Workbox, Playwright | MIT / Apache-2.0 |
| Cviky (`src/content/drills.json`) | vlastní zpracování; zdroje u každého cviku (`sources`) | texty vlastními slovy |
