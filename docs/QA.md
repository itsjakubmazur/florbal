# QA

Nezávislé QA pro M5 a nápady z IDEAS.md 1–5 (kód psal jiný agent). Stav k 13. 11. 2026, verze 0.3.0, větev `m4-vyzvy`.

## Jak spustit
- `npm test` – Playwright, Chromium, projekty iPad na šířku (1180×820), iPad na výšku (820×1180), iPhone (390×844),
  proti `vite preview` (produkční build se service workerem). Před spuštěním ukončit starý server: `lsof -ti:4173 | xargs kill`.
- `npx playwright test -c tests/webkit.config.js` – stejné testy ve WebKitu (engine Safari), iPad na šířku a na výšku.
  Jednorázově `npx playwright install webkit`.
- `node scripts/check-content.mjs` – schéma cviků a stanovišť.

## Výsledky
| Běh | Testů | Prošlo | Přeskočeno | Poznámka |
| --- | --- | --- | --- | --- |
| Chromium (`npm test`) | 156 | 124 | 32 | z toho 4 „očekávaně padá“ (`test.fail`) = nálezy N6–N9; přeskočené jsou statické a funkční kontroly, které stačí na jednom viewportu |
| WebKit 27.2 (`-c tests/webkit.config.js`) | 104 | 76 | 28 | z toho 2 „očekávaně padá“ (N6, N7); přeskočeno: statické kontroly (jen Chromium na šířku), témata a záloha s fotkou (viz „WebKit“) |

Testy: `tests/smoke.spec.js` (M3, 5), `tests/m4.spec.js` (M4, 6), `tests/m5.spec.js` (M5, 25), `tests/ideas.spec.js` (nápady 1–5, 16);
každý × 3 viewporty. Předchozí běh před nápady (8491666): Chromium 100 prošlo / 8 přeskočeno, WebKit 62 / 10.

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
- **Offline po první návštěvě:** po instalaci SW je v precache všech **370 hlasových MP3**; offline každá jde načíst přes
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

### Nápady z IDEAS.md 1–5 (`tests/ideas.spec.js`, změny 8491666..b2ec354)
- **Hlas iPadu (`voiceMode: 'device'`)**, prošel jsem každé čtení `voiceMode`: `setVoiceMode` hodnotu ověří (neznámá → `voice`)
  a mimo `voice` utne frontu; `preloadVoices` v režimu `device` nic nenačítá; `start()` jde rovnou na `speechSynthesis`;
  `say` / `sayGroup` jde frontou jako u nahrávek (nepřekrývá se); `sfx` a metronom (`click: 'tick'`) hrají jako u Hlasu;
  pípání jen v `beeps`. Výchozí hodnota je `voice`. Testy: přepnutí v Rodičích se uloží; v tréninku jen hlas zařízení
  `cs-CZ`, žádná MP3 (už v m5); záloha s `device` po novém spuštění: v Rodičích vybraný Hlas iPadu, trénink mluví
  jen hlasem zařízení; záloha s neznámou hodnotou: appka mluví nahrávkami, bez chyb. Hned po importu: **N6**, Rodiče
  s neznámou hodnotou: **N7**.
- **Vlastní nahrávky:** blok výběru souboru z `src/core/audio.js` (RANK + smyčka) se v testu vyřízne ze zdrojáku
  a spustí v Node: `.m4a` i `.wav` vyhrají nad `.mp3` v obou pořadích, klíče se nepletou, klíč s tečkou zůstane celý.
  Glob zná `m4a`, precache (`globPatterns`) taky. `.wav` vs. `.m4a` se stejným klíčem: **N9**.
- **Generátor hlasů** (bez sítě): `--list` vypíše 370 řádků klíč–text, žádný prázdný ani `undefined`, každý klíč má MP3,
  nic se nezapíše; `--list --only trick_` filtruje; neznámý `--provider` skončí kódem 1 před generováním. Azure bez klíče:
  **N8**. Volání Azure s falešným ani skutečným klíčem jsem nespouštěl (nic se neposílalo ven), kód viz N10.
  Generátor přeskočí klíč, pro který existuje `.m4a`/`.wav` (kontrola kódu), soubor zapisuje až po úspěšné odpovědi.
- **Licence:** `dist/THIRD-PARTY.txt` obsahuje OFL (Archivo), ISC (Lucide), MIT (NoSleep s copyrightem Rich Tibbett,
  Workbox, zdrojový kód) a je v `sw.js` precache. Rodiče → O appce → Celé znění licencí funguje **offline** po instalaci SW
  (Chromium i WebKit), tlačítko text zase skryje.
- **Tokeny** (`fd4fa26`): build před a po (aeb1aad vs. fd4fa26) jsem porovnal skriptem: 21 obrazovek (hráči, domů, cviky,
  stanoviště, návod, odměny, cesta, karty, aréna, zápas, profil, triky, trik, souboje, nastavení souboje, testy, PIN,
  rodiče, návod před tréninkem, přehrávač v pauze, výsledek) × 3 viewporty, ~8 000 prvků, porovnány pozice a rozměry
  a 23 vlastností (písmo, mezery, poloměry, barvy, stíny, mřížky). Rozdíl jen 0,5 px v pozici animovaného SVG na
  obrazovce triku (animace) – **vizuálně beze změny**.
- **Obličeje po tréninku:** tři míčky s popiskem (Nebavilo mě to / Ušlo to / Bavilo mě to), dotyková plocha ≥ 64 px
  (na iPadu 165 px), `aria-pressed`, volba se uloží jako `feel` k poslednímu tréninku, bez vodorovného posunu na všech
  3 viewportech; na iPadu na šířku je otázka vedle karty hráče, nad „Domů“ a vše bez posouvání. Kontrast popisků 10,7 : 1,
  nadpisu 17 : 1 (ruční měření, obrazovka s obličeji není v `tour`, protože trénink tam končí bez odcvičeného cviku).
- **Rychlé volby:** reakce má v návodu hlavičku „Reakce na povel, N cviků“ se správným tvarem (cvik/cviky/cviků) a nenabízí
  „Jiné stanoviště“ (běžný trénink ano); protažení v přehrávači nekreslí žádný kužel, rozcvička jen kužely z cviku
  (průhlednost 0 nebo 1, nikdy 0,15).
- **Desetinná čárka:** návod na stanoviště „Na místě“ píše „1,4 × 2 m“, nikde „1.4“.

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

### N6 – Obnovení zálohy nepoužije obnovené nastavení hned (Hlas iPadu, hlasitost, vzhled) – střední
**Opraveno (2026-11-13):** `src/core/applySettings.js` použije nastavení hned po obnovení a Rodiče se překreslí s obnovenými volbami.
`restoreBackup()` (`src/storage/backup.js`) přepíše store `settings` v IndexedDB, ale `src/screens/parent.js` po
„Ano, obnovit“ zavolá jen `drawPlayers()`. Nezavolá `setVoiceMode`, `setVolume`, `applyTheme` ani nepřekreslí
panel Zvuk/Trénink. Runtime nastavení platí až po novém spuštění appky (`boot()` v `src/main.js`).
Dopad: rodič obnoví zálohu z iPadu, kde měl „Hlas iPadu“; Rodiče dál ukazují „Hlas“ a další trénink mluví nahrávkami.
Totéž hlasitost a vzhled. Kdo appku nezavře (instalovaná PWA běží dlouho), vidí v Rodičích jiné nastavení, než je uložené,
a dalším klepnutím na jinou volbu ho přepíše.
Kroky: Rodiče → Hlas → uložit zálohu s `voiceMode: 'device'` (nebo z jiného zařízení) → Obnovit ze zálohy → Ano, obnovit
→ v Rodičích je pořád vybrané „Hlas“ → Zpět → hráč → Trénink → Už stojí: hraje MP3.
Oprava: po `restoreBackup` načíst `settings.load()` a zavolat `setVoiceMode`, `setVolume` ×2, `applyTheme`; obrazovku
Rodičů překreslit (např. `go('parent', {}, { replace: true })`).
Test „import zálohy s voiceMode „device“ platí hned, bez nového spuštění (N6)“ (Chromium i WebKit). Po novém spuštění
funguje správně (test bez `test.fail`).

### N8 – `gen-voices --provider azure` bez klíče (nebo se špatným klíčem) běží hodiny a skončí „HOTOVO“ – střední
**Opraveno (2026-11-13):** chybějící klíč Azure skončí hned s kódem 1, 401/403 ukončí běh, ostatní 4xx se neopakují, nevygenerované hlášky = kód 1.
`scripts/gen-voices.mjs`: chybějící `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` se zjistí až v `azureTts()` u každé hlášky,
chyba se bere jako přechodná a opakuje 5× s čekáním 3+6+9+12+15 s. S `--force` to je ≈ 45 s na hlášku, ≈ 4,6 h na 370.
Stejně se opakují i trvalé chyby Azure (401 špatný klíč, 400 SSML, 429 kvóta). Na konci se vždy vypíše
`HOTOVO 370 hlášek` a skript skončí kódem 0, i když se nevygenerovalo nic. Soubory to nepoškodí (zápis je až po úspěchu).
Kroky: `AZURE_SPEECH_KEY= node scripts/gen-voices.mjs --provider azure --force --only num_1` – 45 s „opakuji … chybí
AZURE_SPEECH_KEY“, pak „HOTOVO“.
Oprava: ověřit proměnné hned po načtení argumentů a skončit `process.exit(1)`; 4xx kromě 429 neopakovat; počítat chyby,
vypsat je na konci a vrátit nenulový kód.
Test „gen-voices --provider azure bez klíče: hned skončí srozumitelnou chybou … (N8)“ (spustí skript bez proměnných Azure,
na síť nesáhne, po 8 s ho zabije a ověří, že MP3 zůstala beze změny).

### N7 – Neznámá hodnota `voiceMode` ze zálohy: v Rodičích není vybraná žádná volba – drobné
**Opraveno (2026-11-13):** Rodiče berou režim hlasu normalizovaný přes `applySettings()` (neznámá hodnota → „Hlas“).
Import zálohy neověřuje hodnoty nastavení; `voiceMode: 'robot'` (ruční úprava, budoucí verze s novým režimem) se uloží.
Audio se zachová správně (`setVoiceMode` spadne na `voice`), ale `parent.js` předá `seg()` surovou hodnotu, takže žádné
tlačítko „Trenér“ není zvýrazněné. Kroky: záloha s `"voiceMode": "robot"` → obnovit → znovu spustit → Rodiče.
Oprava: v `parent.js` použít `getVoiceMode()` (nebo normalizovat v `settings.load()`).
Test „import zálohy s neznámou hodnotou voiceMode: v Rodičích je vybraná volba „Hlas“ (N7)“.

### N9 – `.wav` i `.m4a` se stejným klíčem: vyhraje ten, který glob najde dřív – drobné
**Opraveno (2026-11-13):** pořadí m4a > wav > mp3; přebitá MP3 se nedává do precache (`globIgnores` ve `vite.config.js`).
`src/core/audio.js`: `RANK = { mp3: 0, wav: 1, m4a: 1 }` a porovnání `>`, takže při shodě rozhoduje pořadí z
`import.meta.glob` (abecední cesta → vždy `.m4a`, ale jen náhodou implementace). Generátor obojí respektuje. Precache
navíc obsahuje i přebitou MP3 (zbytečných pár kB na hlášku). Oprava: jednoznačné pořadí (např. `m4a: 2`) a zmínka v INSTALL.md.
Test „vlastní nahrávka: když je .wav i .m4a se stejným klíčem … (N9)“ (logika vyňatá ze zdrojáku, oba pořadí).

### N10 – Generátor hlasů: drobnosti v argumentech a SSML – drobné (nejde ověřit bez klíče Azure)
**Opraveno (2026-11-13):** `--only`/`--provider` bez hodnoty skončí chybou; SSML má `xmlns`.
- `--only` bez hodnoty (poslední argument) dá `ONLY = undefined`, tedy **všechny** hlášky; `--only --force` vezme
  `--force` jako prefix a nic nevygeneruje. S `--force` to první přegeneruje všech 370 souborů. Oprava: chybějící nebo
  `--…` hodnotu odmítnout.
- SSML pro Azure nemá `xmlns="http://www.w3.org/2001/10/synthesis"`, který dokumentace Azure uvádí ve všech
  příkladech. Bez klíče nejde ověřit, jestli ho služba vyžaduje (400). Doplnit preventivně.
- `User-Agent: florbal-trener` – v pořádku, žádné osobní údaje.

### N11 – Vlastní nahrávky: velikost písmen přípony a testy offline – drobné
**Opraveno (2026-11-13):** přípony bez ohledu na velikost písmen v appce, precache i generátoru.
- Glob `*.{mp3,wav,m4a}` i regex v `audio.js` a kontrola v generátoru rozlišují velikost písmen: `praise_1.M4A`
  (některé aplikace / přejmenování na Windows) appka nenajde a na macOS (case-insensitive FS) ji generátor
  přesto přeskočí → hláška zůstane MP3. Stačí věta v INSTALL.md („přípona malými písmeny“) nebo `i` v regexu a glob na obě varianty.
- `tests/m5.spec.js` (offline test) počítá jen `.mp3|.wav` a pevně 370 souborů; po přidání vlastních `.m4a`
  je offline nebude kontrolovat a počet bude sedět jen náhodou. Až rodič nahrávky přidá, rozšířit regex o `m4a`.

### N12 – Licence: dílčí nepřesnosti – drobné
**Opraveno (2026-11-13):** NoSleep.js a Tailwind z původních souborů LICENSE, obecný text o hlasu, `THIRD-PARTY.txt` i ve `vite dev`.
- Text NoSleep v `THIRD-PARTY.txt` je složený z MIT textu projektu s dosazeným copyrightem, ne z
  `node_modules/nosleep.js/LICENSE` (obsahově stejná MIT, ale není to doslovná kopie, kterou MIT vyžaduje „included“).
- Panel O appce i `THIRD-PARTY.txt` uvádí „Hlas Trenéra – Microsoft Edge TTS“ natvrdo; po přegenerování přes Azure
  (nebo s vlastními nahrávkami) by měl text odpovídat skutečnému zdroji.
- Tailwind (MIT) vkládá do CSS svůj preflight (modern-normalize, MIT); v seznamu není. Spíš formalita.
- Ve `vite dev` THIRD-PARTY.txt neexistuje (plugin běží jen v `generateBundle`), panel ukáže „Licence se nepodařilo načíst“. Jen vývoj.

### N3 – Levák dostane nezrcadlený návod na stanoviště (text i hlas) – blokující (pro leváka)
**Opraveno (2026-11-13):** `\b` místo U+0008 v `stations.js` i `gen-voices.mjs`, 39 zrcadlených nahrávek přegenerováno.
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
**Opraveno (2026-11-13):** wake lock drží nejvýš jeden zámek, souběžné žádosti sdílí jednu, zámek po disable se hned uvolní (`src/core/wakelock.js`).
`setPaused(false)` i `skipDrill()` v `src/screens/player.js` volají `enableWakeLock()`, a ten v `src/core/wakelock.js`
při každém volání vyžádá nový `WakeLockSentinel` a přepíše proměnnou `sentinel`, aniž by starý uvolnil. `disableWakeLock()`
po tréninku uvolní jen poslední. Každá pauza s pokračováním (a každé Přeskočit) tak nechá jeden zámek aktivní.
Navíc posluchač `release` starého zámku nastaví `sentinel = null`, i když už platí jiný.
Dopad: po tréninku s pauzou obrazovka nezhasne, dokud appka neodejde do pozadí (výsledek / domovská obrazovka svítí,
baterie). Kroky: Trénink → Už stojí → klepnout (pauza) → Pokračovat → klepnout → Konec. Test: vyžádáno 2, uvolněno 1.
Oprava: v `requestApi()` nic nedělat, když `sentinel` existuje a `!sentinel.released`; v posluchači `release` nulovat jen
vlastní instanci. Test „wake lock: pauza a Pokračovat nenechá po tréninku viset zámek (N1)“.

### N2 – 104 hlášek M4 nemá nahrávku, čte je hlas zařízení – střední
**Opraveno (2026-11-13):** generátor přidává `trick_*`, `challenge_*`, `test_*`; vygenerováno 370 z 370 hlášek.
`scripts/gen-voices.mjs` generuje jen `phrases.json`, úvody cviků a návody stanovišť. Bez MP3 je všech 72 kroků triků
(`trick_*`), 24 výzev (`challenge_*`) a 8 testů dovedností (`test_*`), celkem 104 z 370 hlášek. Appka je přečte přes
`speechSynthesis`: jiný hlas než Trenér Antonín, na iPadu bez staženého českého hlasu i s cizí výslovností a offline
podle dostupnosti hlasu. Kroky: Souboje a frajeřinky → Frajeřinky → Kolotoč → „Řekni mi to“.
Oprava: doplnit klíče do generátoru (`trick_<step.id>` = `step.voice`, `challenge_<id>` = `voiceIntro`,
`test_<id>` = `voiceIntro`) a přegenerovat. Test „hlasy: každá hláška Trenéra … má MP3 (N2)“.

### N4 – Na iPadu na výšku je povel menší, než říká SPEC – drobné
**Opraveno (2026-11-13):** `.call-big` na výšku 24 vh (≥ 148 px), SPEC upřesněn, test hlídá i iPad na výšku.
SPEC 6: povel (číslo, F/B) ≥ 18 vh. Na šířku splněno. Na výšku je písmeno F/B 16 vh (189 px, záměr `docs/DESIGN.md`,
absolutně skoro stejně velké jako na šířku) a číslo v piktogramu kuželu 11,9 vh = 140 px, tj. o 5 % menší než 148 px
na šířku. Čitelnost ze 3 m tím pravděpodobně netrpí (BRIEF: na výšku „nemusí být ideální“), ale SPEC a DESIGN se
rozcházejí – sjednotit (buď v SPEC psát v px / „jako na šířku“, nebo zvětšit `.call-big` na výšku). Bez `test.fail`
(cvik se zónami se v náhodném tréninku nemusí objevit).

### N5 – `user-scalable=no` ve viewportu – drobné
**Opraveno (2026-11-13):** `user-scalable=no` odstraněno z `index.html`.
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
13. **Hlas iPadu:** Rodiče → Trenér → Hlas iPadu. Mluví český hlas (je stažený v Nastavení → Přístupnost → Předčítání?),
    v tréninku se povely stíhají v tempu (TTS má na iPadu zpoždění 0,2–0,5 s, krátké povely se při zpoždění přeskakují),
    hraje i se ztlumeným přepínačem? (`speechSynthesis` se `audioSession` řídit nemusí). Po přepnutí zazní uvítání – WebKit
    občas zahodí `speak()` hned po `cancel()`.
14. **Vlastní nahrávka:** `.m4a` z Diktafonu (i s volbou „Bezeztrátový“ = ALAC) přehrát v appce – Safari ji musí umět
    `decodeAudioData`; Chromium v testech AAC nemusí mít, proto je přednost ověřená jen logikou výběru.
15. **Obličeje:** dítě na iPadu na stojánku trefí obličej a rozumí popiskům; karta přijde po 0,7 s / 6 s.
