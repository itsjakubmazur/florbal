# Oponentura obsahu – kolo 2

Posuzovatel: `drill-reviewer` (nezávislý). Datum: 2026-11-12. Předmět je stav `src/content/*.json` po commitu 71ff7eb a navazující části `docs/SPEC.md`, `src/domain/stations.js`, `src/screens/player.js`, `scripts/content/*.mjs` a `research/drill-database.json`.

Tvrzení drill-designera jsem nepřebíral. Každý nález z kola 1 jsem ověřil přímo v datech.

## Verdikt

**Schváleno s výhradami.** Všechny 4 blokující nálezy z kola 1 jsou vyřešené. Ze 15 středních je 12 vyřešených plně a 3 částečně. Nové blokující nálezy nejsou. Před vydáním doporučuji opravit nový nález R2-01 (souboj „Udrž si míček“, střední).

## Stav nálezů z kola 1

| id | záv. (k1) | stav | ověření v datech |
|---|---|---|---|
| N-01 | B | **vyřešeno** | V `drills/tricks/challenges` už nejsou absolutní strany. Texty jsou relativní („U kuželů na bekhendové straně…“, `square-turns`: „U červeného a zeleného bekhendem…“, což po zrcadlení stále platí). Zbylé „doleva/doprava“ jsou jen v `stations.json` a ty `swapLR` převrací. `swapLR` je dál citlivý na velikost písmen, ale texty stanovišť mají jen malá písmena (viz R2-06). |
| N-02 | B | **vyřešeno** | Spot, krok 1: „Polož čepel hole na zem a pomalu s ní opiš kruh…“. Přibyl krok s tabletem (3 velké kroky před kužely, vyvýšeně). U triků je teď „volno na délku hole a ještě kousek“. Zbytek: `spot.size` / `spaceNeeded` 1,4 × 2 m neodpovídá kruhu o poloměru délky hole (R2-04, drobná). |
| N-03 | B | **vyřešeno částečně, sníženo na S** | Táta je bez hole, klečí na podložce, přikrývá dlaní, čtverec má 2,5 × 2,5 m a doporučují se brýle. Vzniklo ale nové riziko a nesplnitelné pravidlo, viz R2-01. |
| N-04 | B | **vyřešeno** | `najezdy`: branka bez brankáře (krabice nebo polštář), střelba ze 3 m po zemi, živý brankář jen s brýlemi nebo maskou. Trik `lacrosse`: „Branka bez brankáře, nikdo za brankou“. |
| N-05 | S | **vyřešeno** | 63× „měkký pěnový míček (v bytě)“ / „koberec nebo deka“ v `equipment`. Spot má krok „Cvičíš v bytě? Vezmi měkký pěnový míček…“. |
| N-06 | S | **vyřešeno** | `kopacka` má `matchLegal: true` a správnou poznámku. Žonglování: „Nízké odrazy pod koleny jsou v zápase v pořádku…“. `volej`: nadhoz mezi koleny a pasem, `matchLegal: false` a hláška „Míček nad koleny…“ jsou teď věcně správné. Zbytek viz R2-05. |
| N-07 | S | **vyřešeno** | `zorro-5`: „Teď rychleji, ale pořád nízko!“ |
| N-08 | S | **vyřešeno** | Přibylo pole `beats` (2–3) u dlouhých přesunů na `line`/`zigzag`/`square`/`triangle`. Přehrávač ho podporuje (`player.js` ř. 109–142) a `check-refs.mjs` ho validuje. Kontrolní výpočty: zigzag domů 3 údery × 2 s = 6 s na 4 m (asi 0,7 m/s), slalom domů 2 × 2 s = 4 s na 3,6 m. To je v pořádku. |
| N-09 | S | **vyřešeno** | Všechna stanoviště mají krok s tabletem („za nejvzdálenější kužel, kus stranou, výš než čepel… Nikdy ne tam, kam poběžíš“). |
| N-10 | S | **vyřešeno** | `one-hand-bottom` je vyřazený (v `drills.json` ani `cards.json` už není). Karta je přesměrovaná na `one-hand-long-bh` („Dlouhá ruka“). Neplatné `reliability: "odvozené"` se už nevyskytuje. |
| N-11 | S | **částečně** | `toe-to-toe` (90) má `callMode: "žádný"`. `fh-bh-rhythm` a `fh-bh-switch` jsou snížené na 60 BPM. **`toilet-roll` a `happy-feet` ale zůstaly na 70 BPM se `směr`** (857 ms na úder). Viz R2-03, drobná. |
| N-12 | S | **vyřešeno (pattern), definice neověřena** | Pattern `fh`/fh → `back`/bh a text „dopředu forhendem, pak čepel překlopíš a stáhneš ho zpátky bekhendem“ se shodují. Definici florbalového driblinku v Hrdličkovi se ani podruhé nepodařilo ověřit (dspace.zcu.cz vrací 503). Ověřit u trenéra Hattricku (je v QUESTIONS). |
| N-13 | S | **vyřešeno** | `fake-cone`: příjezd ke kuželu 3 na forhendu, text „ramenem naznač forhend a objeď ho bekhendem“, pattern `around:3 cw / bh` sedí (kužel po pravé ruce, míček venku na BH). Druhá polovina je zrcadlová. Pokyn ke druhé straně zůstal jen v coachingPoints („Střídej strany“), v pořádku. |
| N-14 | S | **vyřešeno** | Videa mají `inspirace` (např. `lw7rrPkh2pc`). `reach-near-far`, `circle-big`, `figure8-spot`, `toilet-roll` a `one-leg-dribble` mají teď `confidence: "odvozené"`. |
| N-15 | S | **vyřešeno** | `vrtule-1`: „Nejdřív se rozhlédni… čepel u bot, nejvýš třikrát“, howTo „hůl drž u těla“. |
| N-16 | S | **vyřešeno** | `zorro-strelec`, `lacrosse` a `chuze-cepel` mají `setupId: "line"`, `spaceNeeded` a `equipment` (10 míčků, krabice, branka). U `na-kuzel` je vybavení doplněné. |
| N-17 | S | **vyřešeno** | `reflex`: klečí vedle sebe 2 m od sebe a každý sahá po svém míčku. |
| N-18 | S | **vyřešeno** | „Táta hraje s holí na opačné straně, než je zvyklý“ / „hůl na druhou stranu těla“. |
| N-19 | S | **vyřešeno** | Všechny střelecké výzvy mají v safety tablet, branku bez brankáře a vzdálenost 3 m. `rohy` boduje jen pod páskou ve výšce kolen. |
| N-20 | D | **vyřešeno částečně** | SPEC ř. 73: `blade` u `around` = strana těla s míčkem. Význam `dir` (`ccw` = kužel po levé ruce hráče) je pořád jen v SUMMARY. Viz R2-06. |
| N-21 | D | vyřešeno | `slalom-fh-only`: „Normální slalom, ale míček vedeš celou dobu jen forhendem.“ |
| N-22 | D | vyřešeno | `circle-big` má druhou půlku opačně. `wu-stick-circles` má 8 kroků a „Na pípnutí kruž na druhou stranu“. |
| N-23 | D | vyřešeno | `triangle-combo`: 3× `front`, pak 3 → around → home (`beats: 2`). |
| N-24 | D | vyřešeno | „…na čtyři šup daleko do strany“. |
| N-25 | D | vyřešeno | `square-turns` → `triangle-combo`, `one-hand-long-bh` → `slalom-one-hand`. |
| N-26 | D | vyřešeno | `free-ride`: 20 BPM, `freeform: true`, přehrávač skryje trasu (`player.js` ř. 135). |
| N-27 | D | vyřešeno | `bhk-2` howTo i hlas „na šířku ramen“. `tunel-1` „Dozadu mezi nohama“. `zmrzlina-3` má měřitelné kritérium. |
| N-28 | D | vyřešeno | Přibyl krok `zongl` „Patnáct“. |
| N-29 | D | vyřešeno | Kroky odpovídají souřadnicím (velký krok asi 0,6 m: trojúhelník 2 kroky = 1,2 m oproti y 1,1; cik-cak „dva a půl kroku doprava od červeného“ = 1,5 m oproti 1,6). |
| N-30 | D | vyřešeno | `lacrosse-gol` má stejnou dvojvětu „Nízko je to v zápase v pořádku, vysoko…“. |
| N-31 | D | vyřešeno | `lovci-micku`: „Míčky rozhoď do rohů pokoje… Jezdi, neběhej.“ |
| N-32 | D | vyřešeno | Brýle jsou u všech triků s míčkem ve vzduchu, u `volej`, `zonglovaci-souboj` a `udrz-micek`. |
| N-33 | D | vyřešeno | „Hlava nahoře a stihneš to!“ / „Kdo to zkusí, je frajer, a bez chyby jsi mistr!“ |
| N-34 | D | **částečně** | Přibyla karta „Mistr kliček“ (`toe-drag-double`, spot, L4), kterou jde získat v bytě. `card-zigzag-master` je dál vázaná na `zigzag` (velký prostor) a bez alternativy. Akceptuji jako vědomé rozhodnutí. |
| N-35 | D | vyřešeno | DB: soubojové hry mají „Hraje se jen na míček, hůl po zemi, nikdo nemíří holí na tělo. Druhý hráč mimo dosah čepele.“ Názvy jsou „vedle forhendové/bekhendové nohy“. |
| N-36 | D | vyřešeno (neověřeno) | Odkaz na floorball.sport je nahrazený archivem `web.archive.org/web/20220816034720/…` (WebFetch archive.org neumí, existenci snímku jsem neověřil). Odkaz na milsport je odstraněný. |
| N-37 | D | vyřešeno | „Táta po každém kuželu musí tlesknout“. |

**Bilance kola 1:**

- Blokující: 4 ze 4 vyřešeno (N-03 s novým zbytkovým rizikem R2-01).
- Střední: 12 vyřešeno, 3 částečně (N-03, N-11, N-12 – definice).
- Drobné: 16 vyřešeno, 2 částečně (N-20, N-34).

## Nové nálezy (kolo 2)

| id | soubor / položka | záv. | problém | návrh |
|---|---|---|---|---|
| R2-01 | challenges.json `udrz-micek` | S | Nová verze pošle tátu přikrývat míček **dlaní na zemi**, tedy rukou i hlavou dolů přímo tam, kde pracuje čepel dítěte. Hrozí úder čepelí do prstů a do obličeje. Pravidlo „Když je táta blíž než na délku hole, Trenér řekne STOP“ appka nemůže splnit, protože nemá žádné senzory, a zároveň odporuje cíli hry (přikrýt míček jde jen zblízka). Brýle jsou jen „doporučené“. | Táta přiklopí míček **velkým plastovým kelímkem nebo kyblíkem** drženým na natažené ruce, hlavu má nahoře. Dítě: „Když táta přiklápí, hůl stop a od míčku.“ Větu o STOP od Trenéra nahradit „Kdo řekne STOP, kolo se zastaví“ (řídí hráči). Brýle pro tátu povinné, nebo varianta bez kontaktu (táta jen „zmrazí“ dítě slovem, když míček odjede dál než na délku hole). |
| R2-02 | stations.json `spot`, krok s tabletem vs. profil „Malý (1 × 2 m)“ | D | Tablet má stát „aspoň tři velké kroky před kužely“ (asi 1,8 m za kužely, tedy asi 2,5 m od hráče). V nejmenším bytě (1 × 2 m) to znamená tablet mimo vyhrazenou plochu. Je to správně a bezpečně, ale `SPACE_LABELS.small` a `spot.short` „1 × 2 m“ mohou rodiče svést k tomu, že tablet postaví u kraje plochy. | Do `short` / nápovědy napsat „1 × 2 m + místo pro tablet asi 2 m před tebou“. |
| R2-03 | drills.json `toilet-roll`, `happy-feet` | D | Zůstávají na 70 BPM s `callMode: "směr"` (zbytek N-11). | Snížit na 60 BPM, nebo `callMode: "žádný"`. Případně QA změří, jestli se hláška „forhend/bekhend“ vejde do 857 ms bez zpoždění. |
| R2-04 | tricks.json (všechny na spotu), `spaceNeeded` [1,4, 2]; `zorro-jednoruc` | D | Pokyn „volno na délku hole a ještě kousek“ (kruh o průměru asi 2,6 m) nesedí na `spaceNeeded` 1,4 × 2. `zorro-jednoruc` píše „aspoň tři metry volna“, ale je na spotu 1,4 × 2. | `spaceNeeded` u triků dát aspoň [2,4, 2,4] (`zorro-jednoruc` [3, 3]). Případně `spaceNeeded` u triků úplně vypustit a nechat jen slovní pokyn. |
| R2-05 | challenges.json `volej` | D | Nadhoz „mezi koleny a pasem“ a zároveň „hůl pod pasem“. Trefa míčku ve výšce pasu vyžaduje čepel ve výšce pasu, takže dítě se dostane na hranici pravidla. | Nadhoz „mezi koleny a půlkou stehen“. |
| R2-06 | docs/SPEC.md (kroky patternu), `src/domain/stations.js` `swapLR` | D | SPEC ř. 66 pořád říká „Každý krok = jeden úder metronomu“, i když existuje `beats`. Význam `dir` (`ccw` = kužel po levé ruce, při zrcadlení se prohazuje) ve SPEC chybí. Ř. 76 nabízí pro `směr` alternativu „vlevo/vpravo“, která by u leváka byla špatně, pokud se nezrcadlí. `swapLR` je case-sensitive (zatím neškodí). | Dopsat do SPEC. `směr` hlásit jen „forhend/bekhend“. Regex `/…/gi` se zachováním velikosti písmen. |
| R2-07 | `chuze-cepel` krok 4 | D | Stanoviště je teď `line` (4 kužely), ale text zní „slalom kolem **obou** kuželů“ (zůstalo ze spotu). | „…kolem prvních dvou kuželů“. |
| R2-08 | hlasové soubory | D (pro QA) | Změnila se řada `voiceIntro`, `voice` a `setupSteps` (spot má teď 7 kroků, ostatní stanoviště 7–9). Předgenerované WAV (`setup_*`, `setup_*_m_*`, úvody cviků) musí odpovídat novým textům, jinak hlas řekne starou verzi, např. „Rozpaž ruce s holí“. | Přegenerovat audio. QA: test, že každý text má nahrávku se shodným hashem textu. |

## Ověřené zdroje v kole 2

- `web.archive.org/web/20220816034720/https://floorball.sport/2020/11/26/presenting-freestyle-…`: nástroj archive.org nenačte, neověřeno.
- Hrdlička 2015 (dspace.zcu.cz): opět 503. Webové vyhledávání definici „florbalového driblinku“ nenašlo. Zůstává jako otevřená otázka na trenéra.
- Zdroje ověřené v kole 1 se nezměnily (17 existuje a sedí).

## Počty nových nálezů

- Blokující: 0
- Střední: 1 (R2-01)
- Drobné: 7 (R2-02 až R2-08)
