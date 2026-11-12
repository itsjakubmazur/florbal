# Florbal Trenér – pokyny pro Claude Code

Domácí florbalový trénink s hlasovým Trenérem pro dítě (8 let). PWA pro iPad (Safari, „Přidat na plochu“), offline-first.
Zadání: `docs/BRIEF.md`. Stav: `docs/STATUS.md`. Rozhodnutí: `docs/DECISIONS.md`. Otázky na rodiče: `docs/QUESTIONS.md`.

## Konvence
- Kód, soubory, identifikátory anglicky. Veškerý obsah appky (texty, hlášky, cviky) česky. Commity česky.
- Vanilla JS (ES moduly), Vite 5, Tailwind 3, IndexedDB (`src/storage`). Žádný framework.
- Grafika = vlastní SVG kreslené kódem (`src/ui/*`). Žádné cizí obrázky bez záznamu v `LICENSES.md`.
- Žádná data dítěte natvrdo v kódu (jméno syna se zadává v appce). Demo hráč `?demo` má smyšlené jméno.
- Nic se neodesílá ven: žádná analytika, žádné účty.
- Nikdo nekontroluje sám sebe: obsah `drill-reviewer`, kód `qa`.

## Příkazy
- `npm run dev` – vývoj (http://localhost:5173)
- `npm run build` – statický build do `dist/` (PWA, service worker)
- `npm run preview` – náhled buildu
- `npm test` – Playwright testy (iPad landscape/portrait, iPhone)
- `node scripts/gen-voices.mjs` – předgeneruje hlášky (Edge TTS, cs-CZ-AntoninNeural)
- `node scripts/check-content.mjs` – validace drills.json / phrases.json

## Struktura
- `src/core` router, focus (D-pad, ve v1 nepoužitý), audio fronta, metronom (Web Audio), wakeLock, pwa (update flow)
- `src/domain` trainer (skládání tréninku), xp, rewards, profiles, challenges, tricks, tests
- `src/screens` obrazovky; `src/ui` komponenty (StationView = SVG stanoviště a hůl)
- `src/content` drills.json, stations.json, challenges.json, tricks.json, phrases.json, cards.json
- `research/` rešerše a databáze cvičení; `docs/` řízení projektu
- `reference/` klon referenčního repa (gitignore, jen ke čtení)

## Design skilly (povinné pro každý finální návrh vzhledu)
- `frontend-design:frontend-design` (Anthropic plugin, nainstalovaný globálně)
- `unslop` (`.claude/skills/unslop`, CC BY 4.0, Damir Sokolovsky) – audit → směr → 9 průchodů; audity do `docs/design-audits/`
- Design system: `docs/DESIGN.md`
