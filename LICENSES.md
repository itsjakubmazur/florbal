# Zdroje a licence

Florbal Trenér je rodinná aplikace. Od 19. 11. 2026 je kód ve **veřejném** repu `itsjakubmazur/florbal` a appka na GitHub Pages
(`robots.txt` Disallow; viz `docs/DECISIONS.md` D23). Rodič tím vědomě zveřejnil i hlas Trenéra (bod 1) a logo klubu (bod 2),
rizika níže proto už nejsou hypotetická. Vychází z otevřeného projektu **Tréninková podložka**
(Jakub Uhlíř, https://github.com/kuba-uhlir/treninkova-podlozka, licence MIT, viz `LICENSE`). Z reference je převzat jen
zdrojový kód (architektura, router, D-pad vrstva, audio fronta, skládání tréninku, XP a odměny). Obrázky, fotky, loga ani
hlasy z ní převzaté nejsou.

Poslední kontrola: 13. 11. 2026 (M5). Stav značek: **OK** = bez výhrad, **pozor** = funguje, ale má podmínku nebo riziko
(viz „Otevřené body“), **nejasné** = právně nevyjasněno.

## Co je v appce (jde do buildu `dist/`)

| Co | Odkud | Licence / poznámka | Stav |
| --- | --- | --- | --- |
| Zdrojový kód | Jakub Uhlíř (reference) + vlastní úpravy | MIT (`LICENSE`) | OK |
| Grafika: stanoviště, hůl, míček, dres, odměny, karty (`src/ui/*`) | vlastní SVG kreslené kódem | vlastní dílo | OK |
| Ikona appky a favicon (`public/favicon.svg`, `apple-touch-icon.png`, `pwa-*.png`) | vlastní SVG ze `scripts/build-icons.mjs` (navy pozadí, palubovka, míček, čepel), PNG rasterizované z něj | vlastní dílo; logo klubu v ikoně není | OK |
| Ikony rozhraní (`src/ui/icons.js`) | Lucide (lucide.dev), balíček `lucide-static` 1.72.0, výběr ~45 ikon generuje `scripts/build-lucide-icons.mjs` | ISC; hlavička s licencí je v souboru, minifikace ji z buildu odstraní (bod 5) | OK |
| Záložní „nezhasínat“ video (`src/core/nosleep-media.js`) | NoSleep.js 0.12.0 (`src/media.js`), (c) Rich Tibbett | MIT; uvedeno v hlavičce souboru | OK |
| Písmo Archivo Variable (woff2, latin + latin-ext, `src/ui/styles.css`) | Omnibus-Type, balíček `@fontsource-variable/archivo` 5.3.0 | SIL Open Font License 1.1; písmo se v buildu šíří jako soubor, OFL chce u kopie i text licence (bod 5) | pozor |
| Hlas Trenéra (`assets/audio/voice/trener`, **370 MP3**, vygenerováno 13. 11. 2026 (266 v `9d024b1`, 104 hlášek M4 a přegenerované zrcadlené návody v `d09f4d3`)) | Microsoft Edge TTS (Read Aloud), hlas cs-CZ-AntoninNeural, přes `node-edge-tts` 1.2.12 (MIT) a `scripts/gen-voices.mjs` | Neoficiální rozhraní, Microsoft k němu nevydal licenci (bod 1). Pro soukromé rodinné použití je riziko nízké, při zveřejnění nepoužitelné. Záloha: hlas zařízení (`speechSynthesis`, cs-CZ) | nejasné |
| Metronom, pípání, efekty | syntéza oscilátorem ve Web Audio (`src/core/metronome.js`, `tone()` v `src/core/audio.js`) | vlastní | OK |
| Logo FBŠ Hattrick Brno (`assets/img/club/hattrick-logo.png` 270×200, `hattrick-logo-icon-152.png` 152×152) | oficiální web klubu (https://hattrick.eoscms.cz/webimages/club_logo_filename_20230711_172955.png, viz `research/hattrick-brand.md`) | Logo FBŠ Hattrick Brno, použito se svolením klubu, soukromá appka. Ochranná známka a dílo klubu, není pod volnou licencí. Svolení je ústní nebo neuvedené, písemný doklad v repu není (bod 2) | pozor |
| Runtime PWA (service worker, `virtual:pwa-register`) | Workbox 7.x a `workbox-window` 7.4.1 přes `vite-plugin-pwa` 1.3.0 | MIT | OK |
| Cviky (`src/content/drills.json`, 87 cviků) | vlastní zpracování; každý cvik má `sources` (URL, typ, spolehlivost) | Texty jsou vlastními slovy (kontrola v bodě 4). Metody a cviky jako takové nejsou chráněné, chráněné je jen konkrétní znění | OK |
| Triky, výzvy, testy dovedností (`tricks.json` 18, `challenges.json` 24, `skilltests.json` 8) | vlastní zpracování; zdroje v `sources` | vlastní slova; názvy triků („Zorro“, „Lacrosse“, „Háček (toe drag)“) jsou obecné florbalové termíny | OK |
| Hlášky, stanoviště, karty (`phrases.json`, `stations.json`, `cards.json`) | vlastní texty | vlastní dílo | OK |

## Jen pro vývoj (do appky se nedostane)

Kontrola 13. 11. 2026 přes `node_modules/**/package.json` (414 balíčků včetně vnořených, nic se neinstalovalo):

| Licence | Počet | Poznámka |
| --- | --- | --- |
| MIT | 360 | mimo jiné Vite 5.4.21, Tailwind CSS 3.4.19, PostCSS, Autoprefixer, vite-plugin-pwa, Workbox, Rollup, node-edge-tts, nosleep.js |
| ISC | 24 | mimo jiné lucide-static |
| Apache-2.0 | 10 | Playwright 1.65.0 (`@playwright/test`, `playwright`, `playwright-core`), ejs, jake, `@trickfilm400/rollup-plugin-off-main-thread` a další |
| BlueOak-1.0.0 | 8 | glob, minimatch, lru-cache, jackspeak a další (permisivní) |
| BSD-3-Clause | 5 | source-map, source-map-js, serialize-javascript, fast-uri |
| BSD-2-Clause | 4 | terser, esutils, regjsparser, stringify-object |
| CC-BY-4.0 | 1 | `caniuse-lite` (data pro Autoprefixer/Browserslist, jen při buildu) |
| MIT OR CC0-1.0 | 1 | type-fest |
| OFL-1.1 | 1 | `@fontsource-variable/archivo` (jediná produkční závislost, viz výše) |

Žádná copyleftová (GPL/LGPL/AGPL) ani neznámá licence. Prohlížeče, které stahuje Playwright, mají vlastní podmínky, ale slouží
jen k testům na vývojovém počítači.

Ostatní nástroje v repu:

| Co | Licence / poznámka |
| --- | --- |
| Skill `unslop` (`.claude/skills/unslop`, včetně ukázkových `.webp` v `references/refs`) | CC BY 4.0, Damir Sokolovsky (@heydamir), uvedení autora je v `CLAUDE.md` a `SKILL.md`; jen nástroj pro návrh, do appky nejde |
| Snímky obrazovky (`docs/design-audits/img/*.png`) | vlastní snímky appky (obsahují logo klubu, platí bod 2); jen dokumentace |
| `reference/` (klon Tréninkové podložky) | MIT, v `.gitignore`, jen ke čtení |
| `research/` | vlastní poznámky a výpisky; citace jen krátké a s odkazem na zdroj |

## Otevřené body

### 1. Hlas Trenéra z Edge TTS (nejasné, pro rodinu nízké riziko)

**Jak to funguje:** `node-edge-tts` se připojuje ke stejné online službě, kterou používá funkce „Předčítat nahlas“
v prohlížeči Microsoft Edge (WebSocket, ověření Sec-MS-GEC). Nejde o veřejné API. Microsoft k němu nevydal žádnou dokumentaci,
licenci ani podmínky, které by výslovně dovolovaly použití mimo Edge nebo ukládání výstupu do souborů. Licence MIT balíčku
`node-edge-tts` se týká jen kódu klienta, ne hlasu ani služby.

**Co říkají podmínky Microsoftu:**
- Microsoft Services Agreement (zveřejněno 30. 7. 2026, účinné od 30. 9. 2026, https://www.microsoft.com/en-us/servicesagreement)
  mimo jiné zakazuje obcházet omezení přístupu ke službám (§3.a.vi), emulovat nebo dělat reverzní inženýrství služeb (§8.b.ii)
  a u AI služeb automatizovaně z nich vytahovat data (§14.s.iii). Klient, který napodobuje Edge, se těmto bodům blíží.
  Výslovná zmínka o Read Aloud tam není.
- Microsoft na dotaz k edge-tts (Microsoft Q&A, 10/2024,
  https://learn.microsoft.com/en-us/answers/questions/2088770/are-opensource-edge-tts-free-for-commercial-use) odpovídá,
  že komerční použití jejich služeb bez předplatného Azure „může porušovat podmínky“, a odkazuje na Azure AI Speech.
  Soukromé použití výslovně nezakazuje ani nepovoluje.
- Hlas cs-CZ-AntoninNeural je stejný hlas, jaký nabízí placená služba Azure AI Speech. Tam podmínky Azure výstup k použití
  v aplikaci výslovně dovolují.

**Riziko teď (soukromá rodinná appka):** nízké. Jde o 266 krátkých hlášek vygenerovaných jednou, bez peněz, bez dalšího
šíření a bez vydávání se za někoho jiného. Nejhorší realistický scénář je, že Microsoft rozhraní zablokuje nebo změní
a `gen-voices.mjs` přestane fungovat. Už vygenerované soubory v appce dál fungují. Malá výhrada: produkční URL na Vercelu
je bez ochrany (D17), takže MP3 jsou technicky dostupné z internetu každému, kdo zná adresu. Nesdílí se a neindexují.

**Co by se změnilo při zveřejnění** (veřejný odkaz, klub, jiné rodiny, App Store, veřejné repo s MP3): riziko by bylo vysoké.
Šíření výstupu neoficiální služby třetím osobám nemá žádný právní základ a u čehokoli placeného nebo „pro klub“ by šlo podle
Microsoftu o porušení podmínek. Před zveřejněním je potřeba jedna z možností:
1. **Hlas zařízení** (už v appce je): smazat `assets/audio/voice/trener/*.mp3` a přebuildit. Appka podle `import.meta.glob`
   pozná, že soubory chybí, a mluví `speechSynthesis` (cs-CZ, český hlas systému iPadu). Nic se nešíří, žádné riziko,
   horší kvalita a tempo povelů.
2. **Azure AI Speech** (oficiálně): stejný hlas cs-CZ-AntoninNeural přes vlastní klíč Azure. Bezplatná úroveň F0 má
   0,5 mil. znaků měsíčně, což 266 hlášek s rezervou pokryje. `gen-voices.mjs` stačí přepsat na REST API Azure
   a soubory vygenerovat znovu.
3. **Vlastní nahrávky** (rodič namluví hlášky): nejlepší právní i rodinná varianta, soubory se stejnými jmény
   (`<klíč>.mp3`) jen nahradí současné.

**Vyřešeno (13. 11. 2026):** Rodiče → Zvuk → **Hlas iPadu** přepne na vestavěný hlas zařízení bez nového buildu (nahrávky
se nepoužijí). Pro sdílení appky dál: buď smazat MP3 a přebuildit, nebo je přegenerovat oficiálně přes Azure AI Speech
(`AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope node scripts/gen-voices.mjs --provider azure --force`), nebo namluvit
vlastní (`node scripts/gen-voices.mjs --list` vypíše klíče a texty; `<klíč>.m4a` z Diktafonu má přednost před MP3).

### 2. Logo FBŠ Hattrick Brno (pozor)

Logo je chráněné dílo a označení klubu, není pod volnou licencí. Podle zadání (`docs/BRIEF.md`) klub použití povolil
a appka je soukromá. Písemný doklad svolení (e-mail, zpráva) ale v repu ani v dokumentech není.
- **Návrh:** svolení si uložit (stačí e-mail nebo snímek zprávy, mimo repo nebo do `docs/` bez osobních údajů) a zapsat
  sem, kdo a kdy ho dal. Otázka je v `docs/QUESTIONS.md`.
- Svolení „pro soukromou appku“ se nemusí vztahovat na veřejné šíření. Při zveřejnění (bod 1) je potřeba se klubu zeptat
  znovu, nebo logo nahradit neutrálním tématem. Logo je jen v `assets/img/club` a v tématu Hattrick, ikona appky ho neobsahuje.

### 3. Zdroje cvičení: plné znění a videa (OK, jen poznámka)

Cviky odkazují na 60 různých URL zdrojů: metodiky svazů (ČFbU přes diplomovou práci M. Hrdličky, Swiss Unihockey, mobilesport.ch,
Innebandy.se, Salibandyliitto, Hockey Canada, USA Hockey ADM, Special Olympics), závěrečné práce, videa YouTube a stránky
výrobců (My Floorball, HockeyShot). Videa a stránky výrobců jsou jen „inspirace“ (`reliability`). Převzatý je nápad cviku,
ne text, obraz ani zvuk. Žádný zdroj se do appky nestahuje ani nevkládá, v appce jsou jen URL.

### 4. Kontrola „vlastními slovy“ (OK)

- Automaticky: hledání shodných úseků o 7 a více slovech mezi texty 87 cviků (`voiceIntro`, `coachingPoints`,
  `commonMistakes`, `progression`, `regression`, `safetyNotes`) a výpisky v `research/sources/*.md`: **0 shod**.
  Výpisky jsou ale jen shrnutí, ne plné texty zdrojů.
- Ručně, namátkou 10 cviků (`wu-quick-feet`, `wu-react-run`, `stretch-calm`, `fh-bh-switch`, `heel-rescue`, `heads-up-spot`,
  `triangle-loop-fh`, `triangle-combo`, `free-ride`, `zigzag-color`): texty jsou krátké, oslovují dítě a mluví o vlastních
  stanovištích a barvách kuželů appky. U cizojazyčných zdrojů (EN/DE/SV/FI) doslovné převzetí nepřichází v úvahu.
  U jediného delšího českého zdroje (Hrdlička 2015, 25 cviků) se texty liší stylem i obsahem (tablet, Trenér, kužely appky).
  Bez nálezu.

### 5. Licenční texty v buildu (OK, vyřešeno 13. 11. 2026)

OFL 1.1 (Archivo), MIT (NoSleep.js, Workbox) a ISC (Lucide) chtějí, aby kopie obsahovala upozornění na autorská práva
a licenci. Ve zdrojácích to je, minifikovaný build `dist/` hlavičky odstraní a soubor s licencí písma se nekopíruje.
Pro soukromou appku je riziko zanedbatelné. **Návrh:** při buildu kopírovat do `dist/` soubor `THIRD-PARTY.txt` s texty
licencí (OFL z `node_modules/@fontsource-variable/archivo/LICENSE`, MIT a ISC) nebo je ukázat v Rodičích → O appce.
Kódu se to netýká, jen buildu.

**Vyřešeno:** build vkládá do `dist/` soubor `THIRD-PARTY.txt` (plugin `thirdParty()` ve `vite.config.js`: MIT projektu,
OFL Archivo, ISC Lucide, MIT NoSleep.js a Workbox). Je v precache a appka ho ukazuje v Rodiče → O appce → Celé znění licencí.
