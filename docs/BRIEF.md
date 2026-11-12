# Zadání: Florbalový trenér – domácí trénink s hlasovým trenérem pro malého florbalistu (PWA pro iPad)

Jsi vedoucí projektu (orchestrátor) malého, dobře zavedeného vývojového studia. Tvým úkolem je dodat hotovou, otestovanou a nasazenou aplikaci. Pracuješ **autonomně**: deleguješ práci na subagenty, sám rozhoduješ, sám kontroluješ kvalitu a uživatele (Jakub, otec) nezatěžuješ průběžnými otázkami. Výsledek má působit, jako by ho dodala firma, ne jako prototyp.

Komunikuj se mnou česky. Kód, názvy souborů a identifikátory anglicky, veškerý obsah aplikace (texty, hlášky, cviky) česky.

---

## 1. Kontext a cíl

- Můj syn (8 let, 3. třída) hraje florbal za **FBŠ Hattrick Brno**. Chci mu dát doma stejně skvělý nástroj, jaký vznikl pro malé fotbalisty.
- **Hrozně ho baví výzvy a souboje.** Doma si dáváme challenge typu „kdo dá víc gólů od tyčky / od kusu nábytku / z voleje ze vzduchu“ a snaží se naučit stickhandlingové frajeřinky, které ve florbalu jdou (např. **Zorro**). Tohle musí být v appce jedna z hlavních věcí, ne doplněk (viz kap. 4.6).
- **Referenční projekt:** https://github.com/kuba-uhlir/treninkova-podlozka (licence kódu MIT). Fotbalová tréninková podložka pro děti: hlasový „Trenér“ v tempu hlásí, kam s míčem, appka ukazuje cvik na nakreslené podložce, dítě sbírá XP, odměny, sběratelské karty a hvězdičky v týdenní liště. Nic neměří (žádná kamera ani senzory), je to hlasový trenér s metronomem a gamifikací.
- **Cíl:** florbalová obdoba, ve které se místo nohou a podložky trénuje **práce s holí a míčkem** (vedení forhendem a bekhendem, kličky, vedení kolem kuželů, tahání, jednoruč, reakce s hlavou nahoře) na **stanovišti z kuželů nebo značek na podlaze**, které si dítě samo postaví.

### Co víme z rozboru referenčního repa (ověř si to sám)
- Vanilla JS (asi 4 200 řádků), Vite 5, Tailwind 3, IndexedDB, Capacitor 6 (Android/Android TV), GitHub Pages workflow.
- Struktura: `src/screens` (domů, přehrávač, zápas, karty, odměny, rodiče…), `src/ui` (MatView = SVG podložka, CardView, ikony, avatary), `src/domain` (trainer, xp, rewards, profiles, extras), `src/config` (podložky jako JSON, týmy), `src/content` (drills.json, phrases.json, cards.json, facts.json, players.json), `src/core` (router, D-pad focus, audio fronta „nikdy neusekávat hlášku“), `scripts` (Edge TTS generování hlasů, ořez, build grafiky, screenshoty).
- Cvik = JSON: `id, name, level (1–4), durationSec, tempoBpm, pattern [zóny], foot, info, call ("direction"), type (ball/jump/step)`.
- Trénink se skládá váženým losem podle levelu a dominantní nohy (slabší strana dostane max. ~20 %).
- Hlasy: `node-edge-tts`, hlas `cs-CZ-AntoninNeural`, předgenerované WAV. Když soubor chybí, mluví TTS zařízení.
- Licence assetů v `LICENSES.md`: fotky z Wikimedia Commons, loga klubů jako ochranné známky, hlas jako Edge TTS. Autor sám upozorňuje na osobnostní práva u žijících hráčů.

---

## 2. Platforma: PWA pro iPad (rozhodnuto)

Primární zařízení je **iPad v Safari, nainstalovaný na plochu („Přidat na plochu“)**. Žádná nativní appka, žádný Xcode, žádný App Store.

Povinné požadavky:
1. **Offline-first.** Service worker (doporučuji `vite-plugin-pwa` / Workbox) přednačte všechny assety včetně hlasových souborů. Po první instalaci musí appka fungovat bez internetu.
2. **Aktualizace bez mé práce.** Repo je **soukromé**, appka je pro naši rodinu a veřejně se nešíří. Hosting: **Vercel** (napojený na soukromé GitHub repo, nová verze se nasadí pushnutím do `main`). Konfiguraci napiš tak, aby šlo snadno přejít jinam (statický build, žádná závislost na Vercel funkcích). Pokud nejsem ve Vercel CLI přihlášený nebo propojení repa vyžaduje můj účet, připrav vše a v reportu M3 mi napiš přesně jeden krok, který mám udělat. Zvaž zapnutí ochrany nasazení (Deployment Protection), ale ověř, že nerozbije instalaci PWA na iPadu. Pokud ano, nech URL jen nesdílenou. V appce se zobrazí nenápadné „Je k dispozici nová verze – aktualizovat“ a nikdy se neaktualizuje uprostřed tréninku.
3. **Zvuk na iOS.** Odemkni audio po prvním klepnutí. Pro tempo a pípání používej Web Audio API (přesné časování), hlasové hlášky přednačti. Otestuj chování s ztlumeným zvukem a při přechodu appky do pozadí.
4. **Obrazovka nesmí zhasnout během tréninku.** Použij Screen Wake Lock API. Ověř podporu v instalované webové appce na aktuálním iPadOS (dřívější verze měly chyby) a implementuj záložní řešení (např. tiše smyčkované video).
5. **Data dítěte nesmí zmizet.** Volej `navigator.storage.persist()` a přidej v sekci Rodiče **export/import zálohy** (JSON soubor). iOS umí data webu smazat.
6. **Orientace:** hlavně na šířku (iPad na stojánku nebo opřený u zdi 2–3 m od hráče). Na výšku musí appka fungovat také, ale nemusí být ideální.
7. **Ovládání pro dítě s holí v ruce:** obří dotykové plochy, pauza klepnutím kamkoli na obrazovku, žádné drobné prvky během tréninku. Vše podstatné se dá přečíst ze 3 metrů a nic nevyžaduje umět číst (hlas všechno řekne).
8. **TV nechávám otevřenou.** Nemaž D-pad/focus vrstvu z reference, jen ji v první verzi nepoužívej. Rozvržení dělej responzivně, aby šlo později přidat 10-foot režim nebo obal přes Capacitor. Capacitor ani Android build ve v1 **nedělej**.
9. Kontroluj i iPhone (menší displej), ať se appka aspoň nerozpadne.

---

## 3. Jak pracuješ: firma se subagenty

### 3.1 Struktura týmu
Na začátku vytvoř definice subagentů v `.claude/agents/` (jeden `.md` soubor na roli, s jasným popisem, nástroji a výstupy). Doporučené role, které můžeš upravit, pokud to dává smysl:

| Role | Úkol | Výstup |
|---|---|---|
| `research-methodology` | Oficiální metodiky, svazy, knihy, banky cvičení (CZ i zahraničí) | `research/sources/*.md` |
| `research-social` | Trenérské a hráčské profily na YouTube, Instagramu, TikToku, Facebooku | `research/social/*.md` |
| `research-hockey` | Hokejový stickhandling (dryland) přenositelný na florbal | `research/hockey/*.md` |
| `research-apps` | Existující tréninkové appky a gamifikace pro děti (co funguje, co ne) | `research/apps.md` |
| `drill-designer` | Z rešerše sestaví databázi cvičení, levely, progrese, výzvy | `content/`, `research/drill-database.*` |
| `drill-reviewer` | **Nezávislý oponent.** Neviděl tvorbu, posuzuje bezpečnost, vhodnost pro 8 let, proveditelnost doma, správnost techniky a zdroje | `research/review-*.md` |
| `engineer` | Implementace (port z reference, PWA, přehrávač, vykreslení hole) | kód |
| `designer` | Vizuální styl, ikony, odměny, karty, avatary | `assets/`, `docs/DESIGN.md` |
| `voice-audio` | Hlášky, generování hlasů, zvuky, časování | `content/phrases.json`, `assets/audio` |
| `qa` | Testy (Playwright, iPad viewport, offline, wake lock, audio), kontrola obsahu | `docs/QA.md` |
| `licensing` | Kontrola licencí všech assetů a zdrojů | `LICENSES.md` |

### 3.2 Pravidla práce
- **Paralelizuj.** Rešeršní agenty pouštěj současně, každý s jasně vymezeným územím, aby se nepřekrývali. Implementační úlohy, které na sobě nezávisí, dávej paralelně do oddělených git worktrees.
- **Každý agent dostane úplné zadání** (kontext, vstupy, formát výstupu, kritéria hotovosti), protože nevidí tuhle konverzaci.
- **Nikdo nekontroluje sám sebe.** Obsah kontroluje `drill-reviewer`, kód a funkčnost `qa`. Výstup agenta ber jako návrh, který ověříš, ne jako hotovou věc.
- **Řízení projektu je v souborech:**
  - `docs/STATUS.md`: co je hotové, co běží, co je další (průběžně aktualizovat),
  - `docs/DECISIONS.md`: každé netriviální rozhodnutí jedním odstavcem (co, proč, alternativy),
  - `docs/QUESTIONS.md`: otázky na mě (viz níže).
- **Commituj často**, s výstižnými zprávami v češtině, do vlastního repa. Push do vlastního repa a nasazení na Vercel smíš dělat sám.

### 3.3 Kdy se mě ptát (a kdy ne)
- **Neptej se** na nic, co můžeš rozumně rozhodnout sám (technologie, struktura, design, výběr cviků, texty, pořadí práce). Rozhodni, zapiš do `DECISIONS.md` a pokračuj.
- Otázky, které nejsou blokující, sbírej do `docs/QUESTIONS.md` a pošli mi je **najednou na konci milníku**, s výchozí odpovědí, podle které mezitím pokračuješ.
- **Zastav se a zeptej se jen** u nevratných nebo citlivých kroků: placená služba nebo účet, smazání čehokoli mimo projekt, zveřejnění čehokoli (repo i appka zůstávají soukromé), změna viditelnosti repa.
- Na konci každého milníku mi pošli **krátký report** (5–10 řádků): co je hotové, co to umí, odkaz na nasazenou verzi, otevřené otázky.

---

## 4. Rešerše a databáze cvičení (nejdůležitější část)

Kvalita cvičení je to, co odliší skvělou appku od hračky. Investuj do rešerše vážně.

### 4.1 Kde hledat (výchozí seznam, rozšiř podle zjištění)
**Česko a Slovensko**
- Český florbal (ČFbU): metodické materiály, trenérské vzdělávání, materiály pro mládež a přípravky, zásobníky cvičení, videa svazu.
- Kniha „Florbalový trénink dětí“ (zásobník cvičení a her pro 6–15 let) a další české publikace o florbalu dětí.
- Metodiky a videa českých klubů s dobrou prací s mládeží (včetně Hattrick Brno, pokud něco veřejného mají), materiály FTVS UK a FSpS MU (diplomové a bakalářské práce o florbalových dovednostech dětí bývají veřejně dostupné a obsahují zásobníky cvičení).
- Slovenský zväz florbalu.

**Zahraničí (florbalové velmoci)**
- Švédsko: Svenska Innebandyförbundet (metodika pro děti, „innebandy för barn“, materiály ke skills).
- Finsko: Salibandyliitto (koučovací materiály, skills pro juniory).
- Švýcarsko: swiss unihockey, včetně materiálů J+S (Jugend+Sport) pro unihockey.
- IFF (International Floorball Federation): koučovací materiály.
- Výrobci s tréninkovým obsahem (Unihoc, Salming, Zone, Fat Pipe, Exel…) a jejich videa.
- Existující florbalové tréninkové pomůcky a appky (např. My Floorball: Skiller, Passer, Target), jaké cviky a režimy nabízejí.

**Hokej (dryland stickhandling, dobře přenositelný)**
- Hokejové svazy (Hockey Canada, USA Hockey ADM), Český hokej, obsahově silní tvůrci stickhandlingu (např. Pavel Barber), domácí tréninkové programy s kužely a „dangle“ pomůckami.
- U každého cviku z hokeje posuď přenositelnost: florbalová hůl je lehčí a nesmí jít nad výšku pasu, míček skáče jinak než puk a ve florbalu se hraje oběma stranami čepele.

**Sociální sítě**
- Najdi populární české i zahraniční **trenéry a hráče**, kteří publikují skills a individuální tréninky (YouTube, Instagram, TikTok, Facebook). Seznam profilů nedostaneš, objev je sám: hledej podle témat (floorball skills, floorball stickhandling, innebandy teknik, salibandy tekniikka, unihockey Technik, florbal trénink doma, florbalové kličky) a podle známých reprezentantů a skills tvůrců.
- U každého profilu zapiš: jméno nebo handle, platformu, jazyk, typ obsahu, odhad dosahu, kvalitu, co je převzatelné.
- **Technické poznámky:** Instagram, TikTok a Facebook se často nedají stáhnout přes WebFetch. Zkus Claude in Chrome, pokud je v session dostupné. Pro YouTube můžeš na mém Macu použít `yt-dlp` **jen pro metadata a titulky** (`--skip-download --write-auto-subs --write-description`), videa nestahuj. Co se nedá dosáhnout, zapiš jako mezeru v rešerši a nezasekávej se na tom.

### 4.2 Pravidla rešerše
- **Nekopíruj** cizí texty, videa ani obrázky. Z každého zdroje si vezmi princip cviku a napiš ho vlastními slovy. Ke každému cviku ulož URL zdrojů.
- Odděl **ověřené** (oficiální metodika, uznávaný trenér, více nezávislých zdrojů) od **inspirace** (jednotlivé virální video). Pro dítě (8 let) mají přednost ověřené zdroje a principy ze svazových metodik pro tuto věkovou kategorii.
- Zjisti a zapiš i **co se v tomto věku má a nemá trénovat** (důraz na koordinaci, hru, obě strany čepele, hlavu nahoře, krátké bloky, nepřetěžovat).

### 4.3 Databáze cvičení
Výstupy:
1. **Rešeršní databáze** `research/drill-database.json` (a čitelná verze `research/DRILL-DATABASE.md`): **cíl 150+ cvičení**, včetně těch, které se do appky nehodí (pro budoucí rozšíření).
2. **Herní cvičení** v `src/content/drills.json`: **cíl 60+ cvičení** převedených na stanoviště a tempo, která appka umí přehrát.

Navržené schéma (rozšiř podle potřeby a zdůvodni v `DECISIONS.md`):
```
id, name (cs), level (1–4 nebo více), minAge, category
  (vedení míčku | kličky | kolem kuželů | tahy | jednoruč | reakce | koordinace bez míčku | práce nohou | kombinace),
bladeSide (forhend | bekhend | obě), grip (obouruč | jednoruč-horní | jednoruč-dolní),
setupId (které stanoviště), pattern (zóny / sekvence), callMode (zóna | směr | barva | náhodná reakce),
tempoBpm, durationSec, reps?, spaceNeeded (m × m), noise (tichý | střední | hlasitý),
equipment (kužely, míčky, lepicí páska, švihadlo…), voiceIntro (věta Trenéra), coachingPoints (2–3 krátké body),
commonMistakes, progression (id těžší varianty), regression (id lehčí varianty),
safetyNotes, sources [{url, type, reliability}], confidence (ověřené | odvozené | vlastní)
```

### 4.4 Stanoviště místo podložky
Pro florbal neexistuje ustálená číslovaná podložka, proto si appka nadefinuje **vlastní stanoviště**:
- 3–5 rozložení (např. „trojúhelník“, „čtverec 4 kužely“, „řada/slalom“, „W/cik-cak“, „malý prostor 1 × 2 m“) s rozměry v metrech, číslováním a barvami kuželů.
- Ke každému **obrázkový návod na postavení** („polož kužel 1 sem, kužel 2 metr doprava…“) a hlasový průvodce.
- Režim **„malý prostor / tichý trénink“**: cviky na místě, měkký nebo tichý míček, bez střelby. To je důležité kvůli bytu, viz níže.
- Pravidlo bezpečnosti v appce: hůl vždy pod úrovní pasu, kolem volný prostor, tablet mimo dosah čepele.

### 4.5 Výzvy a režimy
- **Výzva dne** (krátká, 1–3 minuty) a **týdenní výzva** s hvězdičkami jako v referenci.
- **Testy dovedností:** např. počet přetažení forhend/bekhend za 30 s nebo slalom na čas. Počítá rodič nebo dítě a zadá číslo, appka ukládá osobní rekordy a ukazuje zlepšení v grafu.
- **Reakční režim (nový oproti referenci):** appka náhodně hlásí nebo rozsvěcuje číslo či barvu kuželu a dítě tam musí míček dovést. Trénuje hru s hlavou nahoře a periferní vidění.
- **Zápas:** sám proti rekordu, nebo dva hráči střídavě (táta vs. syn).
- Progrese: odemykání těžších cviků, výběr podle úrovně, slabší strana čepele dostává menší, ale stálý podíl (analogie slabší nohy v referenci).

### 4.6 Domácí souboje a frajeřinky (klíčová funkce)
Syna nejvíc motivují výzvy, souboje s tátou a učení triků. Udělej z toho samostatnou, výraznou sekci appky (pracovně „Výzvy“ nebo „Frajeřinky“, název vymysli).

**A) Souboje a trick shoty**
- Typy výzev: **gól od tyčky**, **gól odrazem od předmětu** (nábytek, zeď, krabice: appka nechá cíl a „mantinel“ pojmenovat a vyfotit), **volej ze vzduchu**, trefa do cíle (rohy branky, kelímek, krabice), počet doteků nebo žonglů bez spadnutí, slalom na čas, „KOHOUT“ (jeden předvede trik, druhý musí zopakovat, kdo nezopakuje, dostane písmeno).
- Formáty: **táta vs. syn** (i více hráčů na jednom zařízení), N pokusů na hráče, na čas, do prvního, kdo dá X, série.
- Počítání: velká tlačítka „trefa / vedle“ pro každého hráče, ovladatelná rodičem jednou rukou. Výsledky, rekordy, historie soubojů, celková bilance „táta vs. syn“ a „síň slávy“ nejlepších výkonů.
- **Knihovna výzev:** hotové výzvy z rešerše (trick shot challenge od florbalových a hokejových tvůrců), ale hlavně **vlastní výzvy**: dítě nebo rodič si vytvoří novou výzvu (název, pravidla, počet pokusů, fotka cíle) a hraje ji opakovaně.
- Volitelně **nahrání pokusu kamerou iPadu** (krátký klip uložený jen v zařízení, „nejlepší góly“). Ověř podporu `MediaRecorder` v instalované PWA na iPadu a limity úložiště. Pokud to nepůjde spolehlivě, dej to do `IDEAS.md`.

**B) Frajeřinky a triky (stickhandling skills)**
- Rešeršní tým cíleně zmapuje **florbalové triky a kličky**: Zorro (a jeho varianty), nabírání míčku na čepel, žonglování na čepeli, vedení míčku na čepeli ve vzduchu, protahování mezi nohama, kličky typu „toe drag“, obtáčky a další, včetně toho, co dělají známí florbaloví skills hráči a tvůrci.
- Každý trik rozlož na **progresi kroků** („strom dovedností“: např. Zorro = držení míčku na čepeli → otočka čepele s míčkem → chůze s míčkem na čepeli → nabrání z pohybu → zakončení). Každý krok má hlasový návod, animaci, kritérium splnění („udržíš míček na čepeli 5 s“) a rodič ho odklikne jako splněný.
- Odemčené triky se propojí se sběratelskými kartami a odměnami („Mistr Zorra“).
- **Pravidla a bezpečnost:** u každé výzvy a triku uveď, jestli je povolený i v zápase. Ve florbalu se nesmí hrát holí ani míčkem nad úrovní kolen a hůl nesmí jít nad pás. Domácí trick shoty jako volej mimo pravidla jsou v pořádku, ale appka to dítěti hravě řekne („tohle je jen domácí frajeřinka, v zápase by to byl faul“) a připomene bezpečnost: nikdo v dosahu hole, hůl pod pasem, křehké věci pryč.

**C) Motivace**
- Denní nebo týdenní **náhodná výzva** („Dnešní frajeřinka“), série dní v řadě, odznaky za souboje, „trenérská hláška“ po výhře i prohře (prohra = „odveta zítra!“, nikdy ponižující).
- Vše hlasem Trenéra, aby to fungovalo i bez čtení.

---

## 5. Aplikace: co převzít, co předělat

Začni **zkopírováním zdrojového kódu reference** do nového repa jako výchozího bodu. Zachovej MIT copyright notice původního autora (Jakub Uhlíř) v `LICENSE` a zmínku v README. Referenci naklonuj do `reference/` (v `.gitignore`) a čti ji odtamtud.

**Převzít a upravit:** router, profily hráčů, rodičovskou sekci s PINem, XP a levely (přejmenuj hodnosti na florbalové), odměny, týdenní lištu, výzvu dne, audio frontu, přehrávač (ukázka → 3-2-1 → tempo → pauza → další cvik), skládání tréninku váženým losem, karty jako UI, screenshot a voice skripty.

**Odstranit:** všechny fotbalové assety (fotky hráčů, loga klubů, fotbalové podložky, fotbalové hlášky a texty), Capacitor a Android část (v1), cokoliv fotbalově specifického.

**Postavit nově:**
- **Vykreslení stanoviště a hole** (náhrada `MatView`): SVG pohled shora, kužely s čísly a barvami, míček, **čepel hole** ukazující forhend nebo bekhend a směr pohybu, šipka „kam dál“. Animace musí být čitelná ze 3 metrů.
- **Nastavení hráče:** jméno, věk, **držení hole (levé/pravé)**, úroveň, preferovaná délka tréninku, dostupný prostor (malý/střední/velký) a výbava (počet kuželů).
- **Skládání tréninku** podle prostoru a výbavy, nejen podle úrovně.
- **Rozcvička** (krátká, koordinace bez míčku) a závěrečné protažení.
- **Karty:** florbalová obdoba sběratelských karet. Výchozí koncept, pokud nenajdeš lepší: **karty dovedností a kliček** (ilustrace + popis + „odemkneš splněním cviku“) a k tomu legendy florbalu **jen tam, kde existuje licenčně čistá fotka** (Wikimedia Commons s uvedením autora), jinak ilustrace bez fotky. Loga cizích klubů nepoužívej. Výjimkou je Hattrick, viz kap. 5.2.
- **Hlas:** nové hlášky v `phrases.json` (oslovení, povely pro forhend, bekhend, směry, čísla, barvy, pochvaly, motivace), vygenerované stejně jako v referenci. Ověř podmínky použití TTS služby a zapiš je do `LICENSES.md`. Záloha: Web Speech API zařízení.
- **Vizuální styl:** vlastní, florbalový, pro 8leté dítě, tmavé pozadí a výrazný akcent (inspiruj se kvalitou reference, ale nekopíruj její vzhled 1:1). Ikony a odměny generuj nebo kresli tak, aby šly licenčně použít, a zapiš původ.

### 5.1 Design: skilly jsou povinné
Finální vzhled všeho (obrazovky, přehrávač, stanoviště, karty, odměny, ikony, onboarding, rodičovská sekce, README screenshoty) **nesmí vypadat jako vibecoded AI výstup**. Proto:

1. **Propracované design skilly.** V M0 zjisti, jaké design skilly a pluginy máš v Claude Code k dispozici (např. Anthropic `frontend-design` a další design a UI skilly z oficiálního marketplace). Chybějící kvalitní skilly doinstaluj do projektu (`.claude/skills/`) a zapiš je do `CLAUDE.md`. Agent `designer` je **musí** načíst a řídit se jimi při každém finálním návrhu vzhledu, ne až dodatečně. Výsledný design system (barvy, typografie, spacing, komponenty, pohyb) zapiš do `docs/DESIGN.md`.
2. **unslop** (https://github.com/heydamir/unslop) nainstaluj do projektu:
   ```
   git clone https://github.com/heydamir/unslop /tmp/unslop
   mkdir -p .claude/skills && cp -r /tmp/unslop/skills/unslop .claude/skills/
   npm install -D playwright && npx playwright install chromium
   ```
   Spusť `/unslop` na **každou hlavní obrazovku** po jejím dokončení (minimálně v M4 a znovu jako finální průchod v M5): audit → směr → průchody (spacing, barvy, ikony, texty, typografie, layout, detaily, vizuály, pohyb). Výsledky auditů ukládej do `docs/design-audits/`.
   - Krok „směr“ (charakter a signature detail) chce potvrzení. **Potvrzuješ ho ty jako vedoucí projektu**, ne já. Zvol směr, který sedí na florbal a osmileté dítě, zapiš ho do `DECISIONS.md` a pokračuj.
   - **Placené generování obrázků** (fal, Replicate, OpenAI, Higgsfield) je placená služba, tedy jeden z případů, kdy se mě musíš zeptat. Bez mého souhlasu ho nepoužívej.
   - Pokud máš ffmpeg, nech si z unslopu udělat i krátké „story video“ před a po. Přilož ho k finálnímu reportu.
3. Pořadí: design skilly určí systém a návrh, unslop ho pročistí a dodá charakter, `qa` ověří čitelnost ze 3 m a velikost dotykových ploch na iPadu.

### 5.2 Hattrick Brno jako součást identity appky
Spojitost s klubem FBŠ Hattrick Brno se má appkou přirozeně prolínat, aby to byla „jeho“ appka:
- **Klubové barvy** jako základ barevného systému (výchozí téma „Hattrick“). Barvy zjisti z oficiálního webu a materiálů klubu (logo, dresy), nehádej je. Ověř kontrast a čitelnost ze 3 m. Případně přidej i neutrální téma pro ostatní děti.
- **Dres hráče** v klubových barvách s jeho číslem, klubové motivy v odměnách a hodnostech (např. „Hattrick legenda“), úvodní obrazovka a hlášky Trenéra („Jako v Hattricku!“), hodnosti podle cesty mladého hráče (přípravka → elévové → … → Superliga).
- **Logo Hattricku používej naplno.** Klub nám k propagaci používání loga povolil a appka je soukromá. Stáhni oficiální logo z webu klubu (nejlépe vektor, jinak co nejvyšší rozlišení), dej ho do repa (`assets/img/club/`) a použij ho na úvodní obrazovce, dresu, odměnách, kartách a hodnostech. V `LICENSES.md` uveď: „logo FBŠ Hattrick Brno, použito se svolením klubu, soukromá appka“.
- Nepoužívej fotky ani jména konkrétních hráčů Hattricku bez souhlasu.

**Soukromí:** všechna data jen v zařízení, žádná analytika, žádné účty. I když je appka soukromá, URL na Vercelu je dostupná každému, kdo ji zná. Proto v kódu ani v buildu nesmí být natvrdo jméno mého syna (zadává se v appce). Demo hráč (`?demo`) má smyšlené jméno.

---

## 6. Milníky

**M0 – Založení (bez otázek)**
Nové **soukromé** repo `itsjakubmazur/florbal-trener` (pracovní název, finální navrhni v QUESTIONS), struktura, `.claude/agents/`, `CLAUDE.md` pro projekt (konvence, příkazy, struktura), `docs/STATUS.md`, `DECISIONS.md`, `QUESTIONS.md`, klon reference, technický rozbor reference v `docs/REFERENCE-ANALYSIS.md`, instalace design skillů a unslopu (kap. 5.1).

**M1 – Rešerše (paralelně)**
Všichni rešeršní agenti současně. Výstup: zdroje, profily ze sociálních sítí, hokejový přenos, rozbor appek, souhrn principů tréninku dětí v `research/SUMMARY.md`.
→ krátký report, pokračuj bez čekání.

**M2 – Databáze cvičení a výzev**
`drill-designer` sestaví databázi, `drill-reviewer` ji nezávisle posoudí, opravy se zapracují. Stanoviště, výzvy, testy dovedností, progrese.
→ krátký report s ukázkou 10 nejlepších cviků, pokračuj bez čekání.

**M3 – Jádro appky jako PWA**
Port z reference, odstranění fotbalu, PWA (manifest, ikony, service worker, offline, update flow, wake lock, persist storage, export/import), nové vykreslení stanoviště a hole, přehrávač s novými cviky, nastavení hráče. Nasazení na Vercel.
→ report s odkazem, abych to mohl otevřít na iPadu.

**M4 – Obsah a hra**
Hlasy, výzvy, testy dovedností, reakční režim, zápas, **souboje a frajeřinky (kap. 4.6)**, téma Hattrick (kap. 5.2), odměny, karty, rozcvička, grafika, návody na postavení stanovišť. Finální vzhled podle design skillů a `/unslop` na každou hlavní obrazovku.

**M5 – QA a předání**
Finální průchod `/unslop` přes celou appku, Playwright testy (iPad landscape a portrait, iPhone), test offline režimu po instalaci, Lighthouse PWA audit, kontrola audia a časování, obsahová kontrola všech cviků (texty, hlášky, sedí animace s popisem?), licence, screenshoty, README pro rodiče (jak nainstalovat na iPad, jak postavit stanoviště, bezpečnost). Finální report + seznam nápadů do další verze v `IDEAS.md` (včetně možnosti TV režimu).

---

## 7. Definice hotovo (v1)

- [ ] Appka běží z Vercelu (soukromé repo), jde nainstalovat na plochu iPadu a funguje offline.
- [ ] Při tréninku nezhasne obrazovka, zvuk funguje po prvním klepnutí, hlášky se neusekávají a tempo nedriftuje.
- [ ] 60+ přehratelných cviků ve 4+ úrovních, každý s hlasovým úvodem, animací, coaching body a zdrojem. Rešeršní databáze má 150+ záznamů.
- [ ] 3–5 stanovišť s návodem na postavení, režim pro malý prostor.
- [ ] Výzva dne, týdenní lišta, testy dovedností s rekordy, reakční režim, zápas, odměny, karty.
- [ ] Sekce soubojů a frajeřinek: trick shot výzvy (tyčka, odraz od předmětu, volej, cíle, KOHOUT), táta vs. syn s historií a síní slávy, vlastní výzvy, strom triků (Zorro a další) s progresí kroků.
- [ ] Téma Hattrick (ověřené klubové barvy, dres, hodnosti), oficiální logo klubu v appce.
- [ ] Nastavení: držení hole, úroveň, délka, prostor, výbava, hlas/pípání/ticho, PIN pro rodiče, export/import zálohy.
- [ ] `drill-reviewer` schválil obsah (bezpečnost, věk, proveditelnost), `qa` schválil funkčnost.
- [ ] Všechny obrazovky prošly design skilly a finálním průchodem `/unslop`, audity jsou v `docs/design-audits/`.
- [ ] `LICENSES.md` pokrývá každý asset a zdroj, v appce není nic s nejasnou licencí.
- [ ] README, `docs/STATUS.md`, `DECISIONS.md`, `IDEAS.md` jsou aktuální.

Začni M0 hned a jeď dál. Hlas se mi na konci každého milníku.
