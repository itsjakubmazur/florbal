# Technická specifikace v1

Zdroj pravdy pro `engineer`, `drill-designer`, `voice-audio`, `qa`. Změny schématu zapisuj do `DECISIONS.md`.

## 1. Souřadnice a strany

- Stanoviště se kreslí **shora**, jednotky v **metrech**. Počátek `(0,0)` = výchozí místo hráče („domeček“, značka H), osa `x` doprava (z pohledu hráče, který stojí čelem ke stanovišti, tedy k tabletu), osa `y` dopředu (k tabletu).
- Tablet stojí za stanovištěm, takže obrazovka ukazuje stanoviště **zrcadlově tak, jak ho hráč vidí** (vlevo na obrazovce = vlevo pro hráče). Kreslíme pohled „od hráče“ (hráč dole, tablet nahoře).
- **Držení hole** `grip`: `left` (levák, čepel vlevo od těla, forhend je vlevo) | `right` (pravák, forhend vpravo). Ve florbalu se jako „levák“ označuje hráč, který drží hůl na levé straně.
- Cviky popisujeme **relativně** stranou čepele (`fh` forhend, `bh` bekhend). Přehrávač převádí `fh/bh` na vlevo/vpravo podle `grip`. Stanoviště jsou symetrická, nebo se pro leváka zrcadlí přes osu `x` (`mirror: true`).

## 2. Stanoviště `src/content/stations.json`

```json
{
  "id": "triangle",
  "name": "Trojúhelník",
  "size": [2, 2],            // potřebný prostor v m (šířka × hloubka) včetně okolí
  "space": "medium",         // small | medium | large
  "cones": [ { "n": 1, "x": -0.8, "y": 1.2, "color": "red" }, ... ],
  "home": { "x": 0, "y": 0 },
  "setupSteps": [ { "text": "Polož červený kužel 1 metr před sebe a trochu doleva.", "highlight": [1] } ],
  "voiceSetup": "setup_triangle",
  "minCones": 3
}
```
Barvy kuželů: `red | blue | yellow | green | white` (pojmenované, appka je umí říct). Čísla 1–5. Místo kuželů lze dát boty, ponožky, lepicí pásku – návod to říká.

Povinná stanoviště: `spot` (malý prostor 1 × 2 m, cviky na místě, 2 značky), `triangle`, `square` (4 kužely), `line` (slalom 4–5 kuželů po 0,8–1 m), `zigzag` (W, 5 kuželů).

## 3. Cvik `src/content/drills.json`

```json
{
  "id": "fh-bh-front",
  "name": "Přetahování před tělem",
  "level": 1,                       // 1–5
  "minAge": 6,
  "category": "tahy",               // vedení míčku | kličky | kolem kuželů | tahy | jednoruč | reakce | koordinace bez míčku | práce nohou | kombinace
  "bladeSide": "obě",               // forhend | bekhend | obě
  "grip": "obouruč",                // obouruč | jednoruč-horní | jednoruč-dolní
  "setupId": "spot",
  "pattern": [ { "at": "fh", "blade": "fh" }, { "at": "bh", "blade": "bh" } ],
  "loop": true,                     // pattern se opakuje v tempu
  "callMode": "směr",               // zóna | směr | barva | náhodná reakce | žádný (jen tempo)
  "tempoBpm": 60,                   // úder = jeden krok patternu
  "durationSec": 30,
  "reps": null,
  "spaceNeeded": [1, 2],
  "noise": "tichý",                 // tichý | střední | hlasitý
  "equipment": ["hůl", "míček"],
  "voiceIntro": "Přetahuj míček před sebou z forhendu na bekhend. Hlava nahoře!",
  "coachingPoints": ["Kolena pokrčená", "Míček před tělem, ne u nohou", "Čepel měkce, bez ťukání"],
  "commonMistakes": ["Míček odskakuje, protože hráč tluče čepelí"],
  "progression": "fh-bh-wide",
  "regression": null,
  "safetyNotes": "Hůl pod úrovní pasu.",
  "sources": [ { "url": "https://…", "type": "metodika", "reliability": "ověřené" } ],
  "confidence": "ověřené",          // ověřené | odvozené | vlastní
  "kind": "ball",                   // ball | nobal (rozcvička, koordinace bez míčku) | stretch
  "matchLegal": true
}
```

### Kroky patternu
Každý krok = jeden úder metronomu. Pole:
- `at`: kam míček (kam se hráč/čepel posune): číslo kuželu `1`–`5` | `home` | relativní pozice u těla `fh` (stranou forhendu), `bh` (stranou bekhendu), `front` (před tělem), `back` (k nohám/za tělo), `between` (mezi nohama), `around:N` (oblouk kolem kuželu N, `dir` `cw|ccw`).
- `blade`: `fh | bh` – kterou stranou čepele se hraje v tomto kroku.
- `hand` (volitelné): `both | top | bottom` – jednoruč.
- `say` (volitelné): přepíše hlášku kroku (klíč fráze).
- `air` (volitelné, jen triky): míček je ve vzduchu (animace výskoku).
- `beats` (volitelné, výchozí 1): kolik úderů metronomu krok trvá (dlouhé přesuny mezi kužely; generátor počítá z geometrie, 0,8 m/s s míčkem).
- U `around:N` určuje `blade`, kterou stranou čepele se míček vede kolem kuželu (= na které straně těla míček je).
- `freeform: true` na úrovni cviku: kužely bez pevné trasy (Volná jízda), přehrávač ukazuje jen tempo.

### Strany a zrcadlení (doplněk podle oponentury)
- `around:N` + `dir`: pohled shora, `ccw` = míjení kuželu tak, že je kužel po levé ruce hráče jedoucího dopředu (míček jde kolem kuželu proti směru hodin), `cw` opačně. Pro leváka (`grip: left`, stanoviště `mirror: true`) přehrávač prohazuje `cw ↔ ccw` (`dirOf` v `StationView`).
- `swapLR` (src/domain/stations.js) prohazuje v návodech stanovišť slova doleva/doprava/vlevo/vpravo pro leváka. Texty cviků, triků a výzev tato slova obsahovat nesmí (hlídá `scripts/content/check-refs.mjs`) – mluví o forhendové/bekhendové straně, číslech a barvách kuželů.

Přehrávač hlásí podle `callMode`: `zóna` → „jedna“, „tři“…; `barva` → „červená“…; `směr` → „forhend“/„bekhend“ (nebo „vlevo“/„vpravo“); `náhodná reakce` → pattern se ignoruje, cíl se losuje z kuželů stanoviště, nikdy dvakrát stejný.

## 4. Výzvy, triky, testy

- `src/content/challenges.json` – souboje a trick shoty: `{ id, name, type: "tyčka|odraz|volej|cíl|žonglování|slalom|kohout|vlastní", rules, attempts, format: "pokusy|čas|do-x|série", scoring: "trefy|čas|počet", homeOnly: bool, matchLegal: bool, safety, voiceIntro, sources }`.
- `src/content/tricks.json` – strom triků: `{ id, name, card, steps: [ { id, name, howTo, criterion, voice, animation: pattern } ], matchLegal, safety, sources }`.
- `src/content/skilltests.json` – testy: `{ id, name, unit: "počet|s", durationSec?, better: "higher|lower", howTo, voiceIntro }`.

## 5. Data (IndexedDB `florbal`)

Stores: `profiles`, `history` (tréninky), `settings`, `duels` (souboje), `records` (testy), `tricks` (splněné kroky), `customChallenges`, `media` (blob fotek cílů a klipů).
Profil: `{ id, name, age, grip, level/xp, sessionLength, space, cones, jersey, theme, createdAt }`.
Export/import zálohy: jeden JSON (`florbal-zaloha-YYYY-MM-DD.json`) se všemi stores; fotky jako dataURL (volba „bez fotek“).

## 6. PWA a iPad

- `vite-plugin-pwa` (Workbox, `registerType: 'prompt'`), precache všeho (JS, CSS, SVG, fonty, audio). `maximumFileSizeToCacheInBytes` dost velké.
- Update flow: při nové verzi nenápadný pruh „Je k dispozici nová verze – aktualizovat“. Během tréninku (přehrávač, souboj) se nezobrazí a nikdy se neaktualizuje sám.
- Audio: jeden `AudioContext`, odemčení prvním `pointerdown` (přehrát tichý buffer). Metronom a pípání naplánované přes `AudioContext.currentTime` (look-ahead scheduler, 25 ms tick, 100 ms horizont), hlášky jako dekódované `AudioBuffer` (přednačtené), fallback `speechSynthesis`. Při `visibilitychange` → hidden pauza tréninku.
- Wake lock: `navigator.wakeLock.request('screen')`, znovu po `visibilitychange`; záloha tiché smyčkované video (`playsinline muted loop`) spuštěné při startu tréninku.
- `navigator.storage.persist()` při prvním spuštění; stav v Rodičích.
- Orientace: landscape primárně, portrait funkční. iPhone se nerozpadne.
- Dotyk v tréninku: tap kamkoli = pauza; ovládací prvky ≥ 88 px; text čitelný ze 3 m (název cviku ≥ 5 vh, číslo/povel ≥ 18 vh).
- Žádná síťová volání za běhu, žádná analytika.
