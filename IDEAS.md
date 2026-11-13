# Nápady mimo zadání

Věci, které vyplynuly během vývoje a kontrol, ale nejsou ve verzi 1. Seřazeno podle užitku.

1. **Volba „Hlas zařízení“ v Rodiče → Zvuk.** Přepnutí z nahrávek Edge TTS na hlas iPadu bez nového buildu. Záloha pro případ,
   že by se appka sdílela dál (`LICENSES.md`, otevřený bod Edge TTS; `docs/QUESTIONS.md` bod 8).
2. **Hlas přes Azure AI Speech** (stejný hlas cs-CZ-AntoninNeural, oficiálně; bezplatná úroveň stačí na ~400 hlášek) nebo
   hlášky namluvené rodičem se stejnými názvy souborů v `assets/audio/voice/trener`.
3. **Licence v buildu:** `THIRD-PARTY.txt` do `dist/`, nebo stránka Rodiče → O appce s licencemi (OFL písma, MIT, ISC).
4. **Vlastní audit vzhledu** pro obličeje „Jak se ti to líbilo?“ po tréninku a samostatné obrazovky reakce, rozcvičky a protažení.
5. **Nové tokeny** v `src/ui/tokens.js` místo hodnot písma a mezer přímo v `m4.css` a `styles.css`.
6. **Ověřit na reálném iPadu** body ze seznamu v `docs/QA.md` (wake lock na iPadOS < 18.4, fotka v instalované appce, poslech zrcadlených návodů).
