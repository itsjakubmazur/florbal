# Otázky na rodiče

Neblokující otázky. U každé je výchozí odpověď, podle které se pokračuje.

1. **Finální název appky.** Výchozí: „Florbal Trenér“ (repo `florbal-trener`). Alternativy: „Hattrick Doma“, „Čepel“, „Florbalová stanice“.
2. **Založení GitHub repa.** Automatické vytvoření soukromého repa mi zablokovalo bezpečnostní pravidlo Claude Code. Výchozí: pracuji v lokálním gitu; jeden příkaz ke spuštění je v reportu M3.
3. **ffmpeg je rozbitý** (`brew reinstall ffmpeg` to spraví). Výchozí: bez story videa z unslopu.
4. **Vektorové logo Hattricku.** Na webu klubu je jen PNG 270×200, na velké použití (úvodní obrazovka, karty) je to málo. Pokud od klubu dostanete SVG/PDF, dejte ho do `assets/img/club/`. Výchozí: logo používám jen v menších velikostech, kde je ostré.
5. **Názvosloví trenérů Hattricku.** Klub nemá veřejnou metodiku. Pokud se zeptáte trenérů přípravky, jak říkají cvikům (např. „přetahovačka“, „osmička“), appka může mluvit stejně. Výchozí: názvy podle ČFbU a závěrečných prací.
6. **Neprozkoumané zdroje.** Zásobníky z UP Olomouc a FSpS MU (theses.cz, is.muni.cz) blokují roboty, kniha Lerchová & Třískala (Grada 2024) zakazuje automatickou analýzu. Výchozí: vynechány; pokud je stáhnete/máte, můžu je zpracovat.
7. **Svolení klubu k logu písemně.** Zadání říká, že FBŠ Hattrick Brno použití loga povolil. Máte to v e-mailu nebo zprávě? Uložte si to a napište mi, kdo a kdy svolení dal, doplním to do `LICENSES.md`. Pokud by appka měla jít i jiným dětem z klubu, je dobré se zeptat znovu: svolení „pro soukromou appku“ nemusí pokrývat šíření. Výchozí: logo zůstává, appka je jen pro rodinu.
8. **Hlas Trenéra při případném sdílení.** Hlášky jsou z neoficiální služby Microsoft Edge TTS. Pro rodinu je to v pořádku, ale kdyby se appka měla sdílet dál (klub, další rodiny), je potřeba hlas vyměnit: hlas zařízení, oficiální Azure (zdarma do limitu), nebo hlášky namluvíte sami. Výchozí: zůstává Edge TTS, appka se nesdílí.
