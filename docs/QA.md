# QA

Nezávislé QA pro M5 (kód psal jiný agent). Stav k 13. 11. 2026, verze 0.3.0, větev `m4-vyzvy`.

## Jak spustit
- `npm test` – Playwright, Chromium, projekty iPad na šířku (1180×820), iPad na výšku (820×1180), iPhone (390×844),
  proti `vite preview` (produkční build se service workerem). Před spuštěním ukončit starý server: `lsof -ti:4173 | xargs kill`.
- `npx playwright test -c tests/webkit.config.js` – stejné testy ve WebKitu (engine Safari), iPad na šířku a na výšku.
  Jednorázově `npx playwright install webkit`.
- `node scripts/check-content.mjs` – schéma cviků a stanovišť.

## Výsledky
| Běh | Testů | Prošlo | Přeskočeno | Poznámka |
| --- | --- | --- | --- | --- |
| Chromium (`npm test`) | 102 | 94 | 8 | z toho 8 „očekávaně padá“ (`test.fail`) = nálezy N1–N3; přeskočené jsou statické kontroly a kontrast témat, které stačí na jednom viewportu |
| WebKit 27.2 (`-c tests/webkit.config.js`) | 68 | 58 | 10 | z toho 4 „očekávaně padá“ (N1, N3); přeskočeno: statické kontroly a témata (běží jen v Chromiu na šířku) a záloha s fotkou (viz „WebKit“) |

Testy: `tests/smoke.spec.js` (M3, 5), `tests/m4.spec.js` (M4, 6), `tests/m5.spec.js` (M5, 23); každý × 3 viewporty.

## Co testy pokrývají
### M3 a M4 (dřívější sady)
- hlavní obrazovky bez chyb konzole a bez vodorovného posunu, průvodce novým hráčem,
- přehrávač `?fast=1`: 2 cviky, pauza klepnutím, Přeskočit, Konec, tlačítka pauzy ≥ 88 px, simulovaný update pruh,
- záloha export/import, manifest, service worker, reload offline,
- souboj (trefy, zpět, výsledek, karta, bilance), KOHOUT, vlastní výzva, triky, test dovedností s rekordem a grafem, karty, rychlé volby.

### M5 (`tests/m5.spec.js`)
- **Všechny obrazovky** (33 stavů: úvod, hráči, domů, cviky, stanoviště, návod, odměny, cesta, profil, zápas, karty + detail,
  aréna, triky, trik, testy, test + odpočet + klávesnice, souboje, vlastní výzva, nastavení souboje, bezpečnost, souboj,
  historie, rozcvička, protažení, reakce (návod, hra, pauza), výsledek, PIN, rodiče): bez chyb konzole, bez vodorovného
  posunu, **žádný síťový požadavek mimo localhost** (zachytává se celý kontext včetně service workeru).
- **Dotykové plochy** na všech obrazovkách podle `docs/DESIGN.md`: přehrávač ≥ 88 px, obrazovky dítěte (`.kid`, `.m4`, souboj) ≥ 64 px,
  ostatní (rodiče, průvodce) ≥ 56 px. Prochází na všech 3 viewportech.
- **Kontrast** (WCAG AA, vlastní měření: text vs. skutečné pozadí předků, 4,5 : 1, velký text 3 : 1) na všech obrazovkách
  v tématu Hattrick (3 viewporty) a v tématech Neutrální a Vysoký kontrast. Bez nálezu.
- **Celý trénink** zrychleně až na výsledek „N z N cviků, Trénink dokončen“, prošly fáze ukázka → odpočet → hraj → odpočinek.
- **Čitelnost** (měřeno během celého tréninku):

  | Viewport | Název cviku | Písmeno F/B | Číslo kuželu v povelu |
  | --- | --- | --- | --- |
  | iPad na šířku | 5,6 vh | 24 vh (197 px) | 18,4 vh (151 px) |
  | iPad na výšku | 5,6 vh | 16 vh (189 px) | 11,9 vh (140 px) |
  | iPhone | 5,6 vh | 12 vh | 9,1 vh |

  Test hlídá název ≥ 5 vh, F/B ≥ 148 px (= 18 vh iPadu na šířku) na obou iPadech a číslo kuželu ≥ 18 vh na šířku. Na výšku viz N4.
- **Pozadí:** `visibilitychange → hidden` během tréninku = pauza, čas a fáze stojí, po návratu zůstává pauza.
- **Wake lock** (náhrada `navigator.wakeLock` se záznamem): zapne se se startem tréninku, po uvolnění systémem a návratu
  z pozadí se vyžádá znovu, po konci se uvolní a návratem do appky se už nezapne; totéž v souboji. Bez API se spustí
  záloha tichým videem (`playsinline muted loop`) a po tréninku zastaví. Pauza + Pokračovat: **N1**.
- **Audio fronta:** záznam všech přehraných `AudioBufferSourceNode` delších než 0,25 s – v tréninku (2 cviky, pauza
  uprostřed) se hlášky nepřekrývají a žádná nespadne na hlas zařízení. Když MP3 chybí (404, bez SW), mluví
  `speechSynthesis` s `lang = cs-CZ` a promluvy se nepřekrývají.
- **Offline po první návštěvě:** po instalaci SW je v precache všech **266 hlasových MP3**; offline každá jde načíst přes
  service worker (> 500 B) a každá 20. se dekóduje (`decodeAudioData`); offline trénink přehrává hlášky z cache
  (AudioBuffer, ne hlas zařízení). M4 obrazovky (souboje, triky, testy, karty) jdou offline.
- **Update flow se skutečným service workerem:** test spustí vlastní statický server nad `dist/`, uprostřed tréninku
  „nasadí novou verzi“ (změní `sw.js`) a vynutí kontrolu. Nová verze čeká (`registration.waiting`), pruh se neukáže,
  appka se nepřenačte. Po Konec se na výsledku ukáže „Je k dispozici nová verze“, Aktualizovat appku načte znovu
  s novým workerem. Simulovaný update během souboje a během odpočtu/měření testu dovedností: pruh se neukáže, po nich ano.
- **Záloha:** fotka (Blob ve store `media`) projde exportem jako dataURL a importem zpět jako Blob; „Bez fotek“ ji vynechá;
  soubor obsahuje všech 8 stores. Rozbitý JSON, cizí soubor a záloha z novější verze ukážou českou chybu, nenabídnou
  obnovení a data zůstanou.
- **Zrcadlení pro leváky:** na návodu trojúhelníku je u leváka kužel 1 vpravo od kuželu 2 (u praváka vlevo), prostřední
  kužel zůstává, appka načítá zrcadlené nahrávky `setup_*_m_*`. Texty návodu: **N3**.
- **Soukromí:** bez `?demo` žádný hráč a demo modul se vůbec nenačte; `createProfile({...})` s pevnými údaji je jen
  ve smyšleném demu (`src/dev/demo.js`); build neobsahuje cesty z vývojového stroje, e-maily ani zdrojové mapy.
- **Hlasy (statická kontrola):** každá hláška, kterou appka říká, má MP3: **N2**.

## Lighthouse
Proti `vite preview` (http://localhost:4173/, úvodní obrazovka), Chrome headless.

| Kategorie | Desktop (LH 12.8.2) | Mobil (LH 12.8.2) |
| --- | --- | --- |
| Výkon | 98 | 94 |
| Přístupnost | 89 | 89 |
| Doporučené postupy | 100 | 100 |
| SEO | 58 | 58 |
| PWA (LH 11.7.1, v LH 12 kategorie zrušena) | 100 | – |

- Desktop: FCP 0,4 s, LCP 0,5 s, TBT 0 ms, CLS 0, Speed Index 1,5 s, přenos 239 KiB. Mobil (simulovaný 4G): FCP 2,1 s, LCP 2,4 s, Speed Index 3,9 s.
- PWA (LH 11): installable manifest, splash screen, themed omnibox, content width, viewport, maskable ikona – vše splněno.
- Přístupnost 89: jediná chyba `meta-viewport` (`user-scalable=no`) – **N5**. Na obrazovce Hráči (`?demo&nointro`) totéž, 89.
- SEO 58: `noindex` (robots) a chybějící meta description – záměr, appka je soukromá a nemá se indexovat. Není nález.
- Drobné příležitosti výkonu: 32 KiB nepoužitého JS na úvodu, logo PNG by šlo dát jako WebP / menší (~24 KiB). Bez dopadu offline.

## Nálezy
Závažnost: **blokující** = nesmí do předání, **střední** = opravit před předáním, pokud to jde, **drobné** = kdykoli.
Testy s `test.fail()` začnou po opravě „neočekávaně procházet“ – pak `test.fail` smazat.

### N3 – Levák dostane nezrcadlený návod na stanoviště (text i hlas) – blokující (pro leváka)
`swapLR` v `src/domain/stations.js:22` má v regexu místo `\b` dva **řídicí znaky U+0008 (backspace)**:
`/␈(doleva|doprava|vlevo|vpravo)␈/gi`. Regex proto nikdy nic nenajde a `stationFor()` u leváka zrcadlí kužely,
ale texty návodu nechá beze změny. Stejná chyba je ve `scripts/gen-voices.mjs:17`, takže zrcadlené nahrávky
`setup_*_m_*.mp3` (vygenerované 13. 11., po zavedení regexu v 04c0c0f) s vysokou pravděpodobností říkají totéž co
nezrcadlené (ověřit poslechem, hashe souborů se liší jen kvůli TTS).
Dopad: obrázek ukazuje červený kužel 1 vpravo, text i Trenér říkají „jeden a půl kroku **doleva**“. Dítě postaví
stanoviště pro praváka a cviky s kuželem 1 na bekhendové straně pak vedou na špatnou stranu. Demo hráč je levák.
Kroky: `?demo&nointro` → Tonda Čepel → Stanoviště → Trojúhelník → 2× Další krok. Očekáváno „… doprava.“, je „… doleva.“
Oprava: v obou souborech nahradit znaky U+0008 skutečným `\b` (nebo `(?<!\p{L})…(?!\p{L})` s příznakem `u`, protože `\b`
v JS nezná česká písmena; tady stačí, slova začínají a končí ASCII), pak přegenerovat `setup_*_m_*`
(smazat je a spustit `node scripts/gen-voices.mjs`).
Testy: „levák: návod na stanoviště říká „doprava“ …“ a „levák: funkce zrcadlení … neobsahuje řídicí znaky“.

### N1 – Pauza a Pokračovat nechá viset wake lock – střední
`setPaused(false)` i `skipDrill()` v `src/screens/player.js` volají `enableWakeLock()`, a ten v `src/core/wakelock.js`
při každém volání vyžádá nový `WakeLockSentinel` a přepíše proměnnou `sentinel`, aniž by starý uvolnil. `disableWakeLock()`
po tréninku uvolní jen poslední. Každá pauza s pokračováním (a každé Přeskočit) tak nechá jeden zámek aktivní.
Navíc posluchač `release` starého zámku nastaví `sentinel = null`, i když už platí jiný.
Dopad: po tréninku s pauzou obrazovka nezhasne, dokud appka neodejde do pozadí (výsledek / domovská obrazovka svítí,
baterie). Kroky: Trénink → Už stojí → klepnout (pauza) → Pokračovat → klepnout → Konec. Test: vyžádáno 2, uvolněno 1.
Oprava: v `requestApi()` nic nedělat, když `sentinel` existuje a `!sentinel.released`; v posluchači `release` nulovat jen
vlastní instanci. Test „wake lock: pauza a Pokračovat nenechá po tréninku viset zámek (N1)“.

### N2 – 104 hlášek M4 nemá nahrávku, čte je hlas zařízení – střední
`scripts/gen-voices.mjs` generuje jen `phrases.json`, úvody cviků a návody stanovišť. Bez MP3 je všech 72 kroků triků
(`trick_*`), 24 výzev (`challenge_*`) a 8 testů dovedností (`test_*`), celkem 104 z 370 hlášek. Appka je přečte přes
`speechSynthesis`: jiný hlas než Trenér Antonín, na iPadu bez staženého českého hlasu i s cizí výslovností a offline
podle dostupnosti hlasu. Kroky: Souboje a frajeřinky → Frajeřinky → Kolotoč → „Řekni mi to“.
Oprava: doplnit klíče do generátoru (`trick_<step.id>` = `step.voice`, `challenge_<id>` = `voiceIntro`,
`test_<id>` = `voiceIntro`) a přegenerovat. Test „hlasy: každá hláška Trenéra … má MP3 (N2)“.

### N4 – Na iPadu na výšku je povel menší, než říká SPEC – drobné
SPEC 6: povel (číslo, F/B) ≥ 18 vh. Na šířku splněno. Na výšku je písmeno F/B 16 vh (189 px, záměr `docs/DESIGN.md`,
absolutně skoro stejně velké jako na šířku) a číslo v piktogramu kuželu 11,9 vh = 140 px, tj. o 5 % menší než 148 px
na šířku. Čitelnost ze 3 m tím pravděpodobně netrpí (BRIEF: na výšku „nemusí být ideální“), ale SPEC a DESIGN se
rozcházejí – sjednotit (buď v SPEC psát v px / „jako na šířku“, nebo zvětšit `.call-big` na výšku). Bez `test.fail`
(cvik se zónami se v náhodném tréninku nemusí objevit).

### N5 – `user-scalable=no` ve viewportu – drobné
`index.html:6`. Lighthouse to hodnotí jako chybu přístupnosti (rodič se slabším zrakem si nezvětší text v Rodičích).
Safari na iOS to od iOS 10 stejně ignoruje, efekt je hlavně v Chrome/Android. Zvážit odebrání; nechtěnému zvětšení
při klepání v tréninku brání spíš `touch-action: manipulation`.

### Bez nálezu, ale k vědomí
- Jediný síťový provoz v produkci jde na vlastní doménu: kontrola `sw.js` při návratu do appky a jednou za hodinu (mimo trénink).
- Rychlé volby Rozcvička a Protažení (`startKind` v `src/screens/quick.js`) volají přehrávač až po `await settings.load()`,
  tedy mimo synchronní část klepnutí. Na iPadOS < 18.4 závisí wake lock na videu, které potřebuje gesto – na iPadu ověřit (bod 6).
- Import zálohy „bez fotek“ smaže i fotky, které v zařízení jsou (obnovení nahrazuje vše). Potvrzovací text o fotkách nemluví.

## WebKit (Playwright WebKit 27.2)
Všechny testy prošly kromě očekávaných nálezů N1 a N3, s dvěma úpravami v testech:
- Při `page.goto` uprostřed tréninku pošle WebKit stránku do pozadí, appka ohlásí pauzu a rozběhnuté načítání MP3 se
  při unloadu zruší chybou „… due to access control checks“. Je to artefakt navigace v testu, ve WebKitu se filtruje.
- Záloha s fotkou je ve WebKitu přeskočená: Playwright WebKit běží jako soukromé okno a IndexedDB v něm neuloží Blob
  (`UnknownError: Error preparing Blob/File data`). V soukromém okně Safari to platí taky; appka chybu ukáže
  („Fotku se nepodařilo uložit“). Na iPadu ověřit v instalované appce (bod 8).

Playwright WebKit není Safari na iPadOS: chybí audio session, skutečný wake lock, instalace na plochu, správa úložiště.

## Nutno ověřit na iPadu
Chromium ani WebKit v testech nenahradí Safari na iPadOS. Na reálném iPadu (ideálně iPadOS 18.4+ i 26) ověřit:
1. **Instalace:** Safari → Sdílet → Přidat na plochu; ikona, název „Florbal“, spuštění bez lišty Safari, stavový řádek (black-translucent) nepřekrývá obsah (safe-area).
2. **Offline:** po prvním spuštění zapnout režim Letadlo, appku zavřít a znovu otevřít – musí naběhnout a přehrát trénink **hlasem Trenéra** (MP3 z precache, ne hlasem zařízení).
3. **Zvuk:** první klepnutí odemkne zvuk; metronom a pípání znějí v tempu; hlášky se nepřekrývají a neusekávají; hlasitost hlasu vs. metronomu.
4. **Ztlumení:** s ztlumeným zvukem (Ovládací centrum) – hraje metronom/hlas díky `audioSession.type = 'playback'`? Zapsat výsledek do DECISIONS D7.
5. **Pozadí:** během tréninku přepnout do jiné appky a zpět – trénink musí být v pauze, po „Pokračovat“ jede zvuk i metronom.
6. **Wake lock:** trénink 10 min bez dotyku, automatické zamykání nastavené na 2 min – obrazovka nesmí zhasnout (instalovaná appka i Safari). Zkusit i po návratu z plochy a u Rozcvičky/Protažení z domovské obrazovky. Po opravě N1: po tréninku s pauzou musí obrazovka po 2 min zase zhasnout.
7. **Update flow:** nasadit novou verzi, otevřít appku – pruh „Je k dispozici nová verze“ se ukáže na domovské obrazovce, ne během tréninku; po „Aktualizovat“ se appka načte znovu s novou verzí.
8. **Záloha:** „Uložit zálohu“ → nabídka Uložit do Souborů; „Obnovit ze zálohy“ → výběr souboru z Souborů; vlastní výzva s fotkou z kamery se uloží a po obnovení zálohy fotka zůstane.
9. **Trvalé úložiště:** stav v Rodičích (Safari obvykle u instalované appky vrací `persisted = true`). V Safari (neinstalovaném) může ITP smazat data po 7 dnech bez návštěvy – proto instalace na plochu.
10. **Čitelnost ze 3 m:** povel (číslo/F/B/barva) a timer na iPadu na stojánku 2–3 m od hráče, na šířku i na výšku (N4).
11. **Hlas zařízení:** u kroků triků a výzev (N2, dokud chybí MP3) – je v Nastavení → Přístupnost → Předčítání stažený český hlas? Bez něj iPad čte česky anglickým hlasem.
12. **Levák (po opravě N3):** poslechnout `setup_triangle_m_3` – musí říkat „doprava“.
