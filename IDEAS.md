# Nápady mimo zadání

Věci, které vyplynuly během vývoje a kontrol (M5, 13. 11. 2026).

| # | Nápad | Stav |
|---|---|---|
| 1 | **Volba „Hlas iPadu“ v Rodiče → Zvuk**: přepnutí z nahrávek Edge TTS na vestavěný hlas zařízení bez nového buildu (záloha, kdyby se appka sdílela dál; `LICENSES.md`, `docs/QUESTIONS.md` bod 8). | hotovo |
| 2 | **Jiný zdroj hlasu**: oficiální Azure AI Speech se stejným hlasem (`gen-voices.mjs --provider azure --force`, klíč v `AZURE_SPEECH_KEY`) nebo vlastní nahrávky rodiče (`<klíč>.m4a`, mají přednost; seznam přes `--list`). Návod v `docs/INSTALL.md`. | hotovo; Azure neověřen proti skutečnému účtu |
| 3 | **Licence v buildu**: `THIRD-PARTY.txt` do `dist/` a Rodiče → O appce s celým zněním (i offline). | hotovo |
| 4 | **Vlastní audit vzhledu** pro obličeje „Jak se ti to líbilo?“ po tréninku a obrazovky reakce, rozcvičky a protažení. | viz `docs/design-audits/README.md` |
| 5 | **Tokeny** v `src/ui/tokens.js` místo hodnot písma a mezer přímo v `m4.css` a `styles.css`. | viz `docs/DESIGN.md` |
| 6 | **Ověřit na reálném iPadu** body ze seznamu v `docs/QA.md` (wake lock na iPadOS < 18.4, fotka v instalované appce, poslech zrcadlených návodů, Hlas iPadu). | čeká na rodiče a nasazení |
