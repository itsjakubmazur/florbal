# QA

## Automatické testy (M3)
`npm test` – Playwright, Chromium, projekty iPad na šířku (1180×820), iPad na výšku (820×1180), iPhone (390×844), proti `vite preview` (produkční build se service workerem):
- hlavní obrazovky (úvod, hráči, domů, cviky, stanoviště + návod, odměny, cesta, profil, rodiče) bez chyb konzole a bez vodorovného posunu,
- průvodce novým hráčem,
- přehrávač `?fast=1`: projde 2 cviky, klepnutí kamkoli pauzuje (fáze se nehýbe), pokračování, ukončení → výsledek; pruh nové verze se během tréninku neukáže a objeví se po něm,
- záloha: export stáhne `florbal-zaloha-YYYY-MM-DD.json` se správným obsahem, import ho obnoví,
- PWA: manifest (cs, standalone, maskable ikona), service worker, reload offline.

`node scripts/check-content.mjs` – schéma cviků a stanovišť.

## Nutno ověřit na iPadu
Chromium v testech nenahradí Safari na iPadOS. Na reálném iPadu (ideálně iPadOS 18.4+ i 26) ověřit:
1. **Instalace:** Safari → Sdílet → Přidat na plochu; ikona, název „Florbal“, spuštění bez lišty Safari, stavový řádek (black-translucent) nepřekrývá obsah (safe-area).
2. **Offline:** po prvním spuštění zapnout režim Letadlo, appku zavřít a znovu otevřít – musí naběhnout a přehrát trénink.
3. **Zvuk:** první klepnutí odemkne zvuk; metronom a pípání znějí v tempu; hlas (zatím hlas zařízení, cs-CZ) se nepřekrývá a neusekává.
4. **Ztlumení:** s ztlumeným zvukem (Ovládací centrum) – hraje metronom/hlas díky `audioSession.type = 'playback'`? Zapsat výsledek do DECISIONS D7.
5. **Pozadí:** během tréninku přepnout do jiné appky a zpět – trénink musí být v pauze, po „Pokračovat“ jede zvuk i metronom.
6. **Wake lock:** trénink 10 min bez dotyku, automatické zamykání nastavené na 2 min – obrazovka nesmí zhasnout (instalovaná appka i Safari). Zkusit i po návratu z plochy.
7. **Update flow:** nasadit novou verzi, otevřít appku – pruh „Je k dispozici nová verze“ se ukáže na domovské obrazovce, ne během tréninku; po „Aktualizovat“ se appka načte znovu s novou verzí.
8. **Záloha:** „Uložit zálohu“ → nabídka Uložit do Souborů; „Obnovit ze zálohy“ → výběr souboru z Souborů.
9. **Trvalé úložiště:** stav v Rodičích (Safari obvykle u instalované appky vrací `persisted = true`).
10. **Čitelnost ze 3 m:** povel (číslo/F/B/barva) a timer na iPadu na stojánku 2–3 m od hráče, na šířku i na výšku.
