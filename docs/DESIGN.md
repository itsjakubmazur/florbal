# Design system

## Směr (unslop, potvrzeno vedoucím projektu)
- **Produkt:** domácí hlasový florbalový trenér pro osmiletého hráče, který cvičí s holí u stojícího iPadu.
- **Charakter:** hravý, sportovní, přímočarý.
- **Svět:** florbalová hala večer: palubovka s čárami, bílé mantinely se zaoblenými rohy, kužely, klubový dres.
- **Signature detail:** rámeček „mantinel“: zaoblený roh hřiště a čára palubovky jako rozdělovač. Na kartách a dresu klubové barvy Hattricku.
- **Jedna jasná věc na obrazovku:** v přehrávači stanoviště s holí a míčkem, na domovské obrazovce dres hráče + „Trénink“, ve výzvách skóre.

Zdroj pravdy pro hodnoty: `src/ui/tokens.js` (CSS proměnné, přepínatelné téma) a `src/ui/styles.css` (komponenty).
Mimo tyto dva soubory se barvy nepíšou natvrdo; SVG i obrazovky používají jen `var(--…)`.

## Barvy

### Téma „Hattrick“ (výchozí)
Klubové barvy podle `research/hattrick-brand.md`: modrá `#0961AF` (web) / `#0056A2` (logo), tmavá `#0C3178`, bílá.

| Role | Proměnná | Hodnota | Použití |
| --- | --- | --- | --- |
| Pozadí | `--bg` | `#071330` | navy odvozená z `#0C3178` |
| Hlubší plocha | `--bg-2` | `#0A1838` | panely v Rodičích |
| Karta | `--surface` | `#0F2148` | karty, dlaždice |
| Zvýšená plocha | `--surface-2` | `#172D5C` | sekundární tlačítko, prázdná lišta |
| Vlasová čára | `--line` / `--line-strong` | bílá-modrá 13 % / 24 % | okraje |
| Text | `--text` / `--text-2` / `--muted` | `#F3F7FD` / `#B9C7DE` / `#9FB0CE` | tři role textu |
| Klubová barva | `--brand` (+ `--brand-ink` bílá) | `#0961AF` | dres, vybraná volba |
| Klubová světlá | `--brand-hi` | `#5AA2EC` | průběh, rámeček výběru, fokus |
| Signál | `--signal` (+ `--signal-ink`) | `#FFB81C` | hlavní tlačítko, odpočet, fáze „Hraj“, hvězdy výsledku |
| Forhend | `--fh` | `#FFB81C` | čepel, štítek F (kruh) |
| Bekhend | `--bh` | `#5CCBFF` | čepel, štítek B (čtverec) |
| Palubovka | `--floor` / `--floor-line` | `#0B2552` / bílá 9 % | stanoviště, dres na domově |
| Mantinel | `--mantinel` | `#E8EEF8` | hrazení hřiště (signature) |
| Dres | `--jersey` / `--jersey-trim` / `--jersey-num` | `#0961AF` / `#0C3178` / bílá | dres hráče |

Proč jantarová: modrá + bílá klubu potřebuje jednu teplou protiváhu pro „teď jednej“. Oranžovo-modrá dvojice je čitelná i při
nejčastějších poruchách barvocitu, a proto nese i forhend × bekhend. Forhend má stejnou barvu jako signál záměrně: je to povel.
Šipka „kam dál“ a prstenec hlášeného kuželu jsou bílé, aby se s forhendem nepletly.

### Kontrast (WCAG 2.x, spočítáno skriptem)
| Dvojice | Poměr | Požadavek |
| --- | --- | --- |
| `--text` na `--bg` | 17,1 : 1 | AA 4,5 |
| `--text-2` na `--bg` | 10,7 : 1 | AA 4,5 |
| `--muted` na `--surface-2` | 6,1 : 1 | AA 4,5 |
| `--signal-ink` na `--signal` (tlačítko) | 10,6 : 1 | AA 4,5 |
| bílá na `--brand` (vybraná volba, dres) | 6,3 : 1 | AA 4,5 |
| `--brand-hi` na `--bg` | 6,8 : 1 | AA 4,5 |
| `--fh` / `--bh` na palubovce | 8,7 / 8,2 : 1 | netextové 3 : 1 |
| `--bh-ink` na `--bh` | 10,0 : 1 | AA 4,5 |
| číslo kuželu (`#0A1430`) na červené / modré / žluté / zelené / bílé | 5,6 / 7,1 / 12,6 / 9,2 / 16,5 : 1 | AA 4,5 |
| červený / modrý kužel na palubovce | 4,6 / 5,9 : 1 | netextové 3 : 1 |

Bílé číslo na červeném (3,2) a modrém (2,8) kuželu AA nesplňovalo, proto mají všechny kužely tmavé číslo.

### Téma „Neutrální“ (pro děti z jiných klubů)
Grafitová škála (`#121315` → `#25272B`), akcent tyrkysová `#127F6D` (bílý text 4,9 : 1), světlá `#3CC4AC`. Bez loga,
dres bílý s tyrkysovým lemem. Signál, forhend a bekhend zůstávají stejné, aby se povel neměnil s tématem.

### Téma „Vysoký kontrast“
Černá, bílá, žlutá `#FFE600`, azurová `#00E5FF`. Pro světlou místnost a slunce na displeji.

### Kužely a kovy
Kužely (`CONE_COLORS`) a kovy odměn (`TIER_COLORS`) jsou ve všech tématech stejné, protože odpovídají skutečným předmětům.

## Typografie
**Archivo** (Omnibus-Type, OFL, `@fontsource-variable/archivo`), variabilní váha i šířka. Jedna rodina ve dvou šířkách:
- běžná šířka (100 %) pro rozhraní, váha 450 text, 600–650 nadpisy;
- zúžená (78 %, váha 700) pro čísla dresů, jména na domově, povely, odpočet a XP – jako číslo na dresu nebo na ukazateli skóre.

Proč ne Inter (původní): Inter nikdo nevybral, je to výchozí volba. Zúžená sportovní groteska dovolí povel „FORHEND“
a odpočet dvakrát větší na stejnou šířku, což je přesně to, co se ze 3 m čte. Načítá se jen latin + latin-ext (~180 kB, precache).

| Role | Proměnná | iPad 1180 × 820 |
| --- | --- | --- |
| Drobný popisek | `--fs-small` | 17 px |
| Text | `--fs-body` | 20 px |
| Úvodní řádek | `--fs-lead` | 25 px |
| Nadpis | `--fs-title` | 42 px |
| Display (zúžené) | `--fs-display` | 71 px |
| Trénink: fáze, počítadlo | `--fs-train-meta` | 30 px (min. 28) |
| Trénink: název cviku | `--fs-train-name` | 46 px (5,6 vh) |
| Trénink: pokyn | `--fs-train-task` | 33 px |
| Trénink: slovo povelu | `--fs-train-word` | 66 px (8 vh) |
| Trénink: odpočet | `--fs-train-timer` | 107 px (13 vh) |
| Trénink: povel (dlaždice) | `.call-big` | dlaždice 34 vh, písmeno 24 vh (na výšku 22 / 16 vh) |

Další role písma (všechny v `SCALE` v `tokens.js`, px pro iPad na šířku):

| Skupina | Proměnné |
| --- | --- |
| Rozhraní mimo škálu | `--fs-heading` 38 (text kroku stanoviště, velká dlaždice), `--fs-btn-big` 35, `--fs-input` 40, `--fs-path-dot` 33, `--fs-badge` 33, `--fs-update` 16 (lišta nové verze) |
| Čte se ze 3 m mimo přehrávač | `--fs-kid-sub` 28, `--fs-kid-text` 38, `--fs-kid-title` 42, `--fs-kid-step` 50 |
| Zúžená čísla | `--fs-numpad` 52, `--fs-stepper` 52, `--fs-record` 52, `--fs-num-m` 59, `--fs-result-line` 83, `--fs-num-l` 94, `--fs-result-star` 94, `--fs-numpad-display` 118, `--fs-score` 130, `--fs-duel-score` 130, `--fs-duel-timer` 189 |
| Přehrávač (vh) | `--fs-call` 197 (`--fs-call-port`), `--fs-train-word-port`, `--fs-train-pause` 74, `--fs-train-btn` 36, `--fs-countdown` 410, `--fs-intro` 107 (úvod) |

Pravidla: věty malým písmem, bez vykřičníků v rozhraní, bez kurzívy. Jediné verzálky jsou slova povelu (FORHEND, BEKHEND,
barva v režimu barev) – je to nápis na ukazateli, ne popisek. Čísla `tabular-nums`, desetinná čárka. Žádné „A · B · C“.

## Mezery, poloměry, dotyk
- Mřížka 4 px: `--sp-1` 4 … `--sp-8` 64. Okraj obrazovky 32 px (telefon 16 px), mezi skupinami 16–24, uvnitř skupiny 4–12.
- Poloměry: `--r-sm` 8 (den v týdnu), `--r-btn` 14 (tlačítko), `--r-card` 24 (karta), `--r-mantinel` 32 (hřiště).
- **Signature mantinel:** třída `.rink` (2 px bílé hrazení 26 %, poloměr 32) a stejný rámeček kreslený ve `StationView`.
  Používá se jen tam, kde je hřiště: stanoviště, dres na palubovce (domov), úvodní obrazovka (celá obrazovka je hřiště).
  Ostatní karty mají jen vlasovou čáru.
- Dotykové plochy: mimo trénink `--tap` 56 px, hlavní akce a vše v tréninku `--tap-big` ≥ 88 px; tlačítka pauzy ≥ 96 px
  (hlídá test `tests/smoke.spec.js`).
  Obrazovky, kde ovládá dítě (třída `.kid` nebo `.m4`: knihovna, odměny, cesta, souboje, triky, testy, karty), ≥ 64 px.

### Pojmenované rozměry (tokeny)
`styles.css` a `m4.css` nepíšou velikosti písma, mezer ani rozměrů natvrdo; vše je v `SCALE` (`src/ui/tokens.js`).
Většina hodnot je `max(minimum, calc(var(--u) * n))`: minimum drží telefon, `--u` škáluje iPad. Natvrdo v CSS zůstávají jen
tloušťky čar (1–3 px), procenta a `em` uvnitř tlačítek.

| Předpona | Význam | Proměnné |
| --- | --- | --- |
| `--sp-*` | mezery | `--sp-1`…`--sp-8`, `--sp-flow` (řádky M4, 17 px), přehrávač `--pad-train-y` 2,4 vh, `--pad-train-x` 2,4 vw, `--sp-train-tight` 0,4 vh, `--sp-train` 2 vh, `--sp-train-l` 4 vh, `--sp-train-call-port` 4 vw |
| `--r-*` | poloměry | `--r-sm`, `--r-btn`, `--r-btn-big` (= `--r-btn` + 4), `--r-btn-train` 22, `--r-card`, `--r-mantinel` |
| `--tap-*` | dotyk | `--tap` 56, `--tap-kid` 64, `--tap-numpad` 118, `--tap-big` ≥ 88, `--tap-pause` ≥ 96, `--tap-duel` 177 |
| `--icon-*` | ikony | `--icon-day` 31, `--icon-row` 35, `--icon-tile` 42, `--icon-hero` 52 |
| `--size-*` | rozměry komponent | průběh `--size-bar-s/-bar/-bar-l` 8/10/12, `--size-dot`, `--size-day`, `--size-path-dot`, `--size-badge` 83, `--size-face` 165, dlaždice `--size-tile`/`-hero-tile`/`-hub-tile`, karty a obrázky (`-player-card`, `-station-pic`, `-drill-thumb`, `-drill-card`, `-home-jersey`, `-reveal-card`), plochy (`-setup-stage`, `-stage*`, `-numpad`, `-chart`, `-check`, `-input`, `-textarea`), povel `--size-call`/`-call-port`, `--size-train-call`, loga `--size-logo-intro` 135 / `--size-logo-brand` 72 |
| `--col-*` | nejmenší šířka sloupce mřížky nebo pružné řady | `--col-tile`, `--col-m4(-s)`, `--col-reward`, `--col-station`, `--col-drill`, `--col-duel-player`, `--col-week`, `--col-challenge`, `--col-setup-stage`, `--col-setup-side` |

Varianty na výšku mají příponu `-port`: tokeny jsou inline na `:root`, takže je media query nepřepíše a pravidlo
na výšku sáhne po jiném jménu.

## Komponenty
- `.btn-primary` – jantarová plocha, navy text. Jedna na obrazovku (Trénink, Další krok, Domů, Pokračovat).
- `.btn` – zvýšená plocha + vlasová čára; `.btn.on` = vybraná volba v klubové modré s bílým textem.
- `.btn-quiet` – bez plochy (Hráči, Rodiče).
- `.btn-big` – ≥ 88 px, písmo 24+ px.
- `.card` (24 px, vlasová čára), `.card.on` (modrý nádech), `.panel` (Rodiče), `.tile` (dlaždice s ikonou).
- `.bar` – tenký průběh v `--brand-hi`.
- **Dres** (`jerseyEl` v `src/ui/dom.js`): modré tělo, navy ramena, manžety a lem, bílý výstřih, velké zúžené číslo.
  V tématu Hattrick malé logo klubu na bílé nášivce na hrudi (jen od velikosti 8 u, menší by bylo nečitelné). Logo PNG
  270 × 200 se nikde nezobrazuje šířeji než 135 px (úvod), na výběru hráče 72 px.
- **Stanoviště** (`StationView`): modrá palubovka s bílým mantinelem, metrová síť, kužely shora (podstava + vrchol, tmavé číslo),
  míček s otvory, hůl, čepel: aktivní plocha 13 jednotek v barvě strany, neaktivní 5 jednotek poloprůhledná. Štítek
  **F = kruh** v `--fh`, **B = zaoblený čtverec** v `--bh`. Hlášený kužel: bílý prstenec. Šipka „kam dál“ bílá.
- **Povel** (`.call-big` v přehrávači): forhend = jantarový kruh s „F“, bekhend = modrý čtverec s „B“, kužel = piktogram kuželu
  z boku v jeho barvě s číslem, barva = piktogram bez čísla, domeček = čárkovaný čtverec s „H“. Pod tím slovo povelu.

## Ikony
Lucide (ISC) přes `scripts/build-lucide-icons.mjs` → `src/ui/icons.js`. Čárové, tah 2 (plné jen play, stop, pauza, hvězda).
Barva = role textu (`--text-2` v dlaždicích), nikdy vlastní barva. Žádné emoji.

## Pohyb
Jedna křivka `--ease` = `cubic-bezier(0.22, 1, 0.36, 1)`, délky 140 / 200 / 360 ms. Obrazovka: krátké prolnutí.
Povel: změna 140 ms (zmenšení 0,9 → 1), odpočet: číslo naskočí a zmizí. Hvězdy a nová odměna: jemné vystoupení o 8 px.
Žádné pulzování, žádné smyčky, žádné přestřely. `prefers-reduced-motion` vše zkrátí.

## Pravidla pro obrazovky
- **Přehrávač:** nahoře fáze (Ukázka / Připrav se / Hraj / Odpočinek; „Hraj“ jantarově) a název cviku, vpravo odpočet.
  Uprostřed stanoviště (na šířku ~60 % šířky, na výšku horní část) a povel. Dole tenký průběh a „cvik 3 z 10“.
  Žádný text pod 28 px, žádné drobné ovládání. Klepnutí kamkoli = pauza → Pokračovat / Přeskočit cvik / Konec.
- **Domov:** dres na palubovce + jméno zúženým display písmem, hodnost a XP, jedno jantarové „Trénink“. Pod tím týden a výzva dne
  (různé šířky), dlaždice.
- **Výběr hráče:** logo klubu + název appky, otázka, karty s dresy, „Nový hráč“ čárkovaně, „Rodiče“ tiše.
- **Úvod:** obrazovka je hřiště (mantinel, středová čára a kruh), logo klubu do 135 px, název appky zúženým písmem.
- **Rodiče a průvodce:** stejné komponenty, klidné; jen jedna primární akce.
- Nadpis vždy první, kontext (krok, hodnost) až pod ním, bez nálepek nad nadpisem.
- **Souboje a frajeřinky:** jediný moment = tabule skóre táta : syn (`scoreboard()`, zúžená čísla, dítě jantarově, čára
  palubovky jako rozdělovač). Odpočty a skóre v průběhu zúženě ≥ 72 px, texty v průběhu ≥ 28 px. Meta údaje tichým
  textem, žádné pilulky. Jantarová jen pro hlavní akci, odpočet, rekord a splněný trik.
- **Moje cesta:** hodnosti jako trasa se spojnicí (skutečná posloupnost), aktuální zastávka v klubové modré.
- **Výsledek, „Jak se ti to líbilo?“:** tři florbalové míčky s výrazem (`faceSvg`, tokeny míčku), popisek pod každým,
  výběr prstencem v `--brand-hi`. Otázka stojí nad „Domů“: na šířku vedle karty hráče, na výšku pod ní.
- **Rozcvička a protažení:** na palubovce jen kužely, které cvik používá (protažení žádné).

## Ikona appky
`scripts/build-icons.mjs`: navy pozadí, modrá palubovka s bílým mantinelem a zaobleným rohem, bílá hůl, jantarová čepel, míček.

## Audity
`docs/design-audits/<obrazovka>.md`, snímky `docs/design-audits/img/` (`before-*` = stav M3).
