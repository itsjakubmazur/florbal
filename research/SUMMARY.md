# Souhrn rešerše: domácí florbal pro dítě 7–9 let

Podklady: `sources/*` (svazy CH, FI, SE, IFF, české VŠ práce, doplněk `chrome-addendum.md`), `hockey/*`, `social/*`, `apps.md`, `hattrick-brand.md`.
Databáze: `drill-database.json` / `DRILL-DATABASE.md` (233 záznamů, 156 použito v appce). Obsah appky: `src/content/` (88 cviků, 5 stanovišť, 18 triků, 24 výzev, 8 testů, 43 karet), generuje `scripts/content/build.mjs`.

## 1. Principy tréninku pro 7–9 let
| Princip | Co to znamená doma | Zdroj |
|---|---|---|
| Radost a vztah ke sportu, ne výkon | Měřítko: baví ho to a zůstane u sportu | Salibandyliitto (Säbäkipinä), SIU (Skåne), ČFbU Česká cesta U9 |
| Všestrannost před specializací | Florbal doma je doplněk. ADM: 75 % jiné sporty. Česká cesta U9: min. polovina aktivit všeobecná | USA Hockey ADM 8U, ceskyflorbal.cz/cesta-hrace |
| Hodně doteků s míčkem | Vlastní míček, malý prostor, co nejvíc opakování | SIU, J+S Kids, ADM |
| Obě strany čepele | Bekhend je rovnocenný. Cíleně „jen FH“ a „jen BH“ | J+S (test slalomu FH i BH), SOI/IFF, Hrdlička |
| Jedna i dvě ruce | Vést míček jednou i oběma rukama, jednoruč jen krátce | SOI, Salibandyliitto, Hockey Canada |
| Hlava nahoře | Split vision od 6 let, zrakovou kontrolu ubírat postupně | SIU, Martínková (přes Hrdličku), FI „Peili“ |
| Pořadí nácviku | Na místě → bez zraku → rytmus a šíře → cit → v pohybu → slalomy → se soupeřem | Martínková 2009 / ČFbU (Hrdlička), Hockey Canada |
| Hra a soutěž se sebou | Rekordy, přehlídka triků, trénink končí hrou | J+S, ADM 8U, SIU |
| Krátké bloky | Cvik 20–45 s, trénink 8–15 min | ADM, Hodl, Dangle Time |
| Chyby patří k učení | Ztráta míčku je v pořádku, častý úspěch buduje sebedůvěru | Hockey Canada, ADM, Barber |

## 2. Co trénovat a co ne
**Trénovat:** přetahování FH–BH (krátké, široké, v rytmu), vedení vedle těla FH i BH, osmičky a otočky kolem nohou a kuželů, slalomy, tah špičkou, únikový obrat, finty, jednoruč horní rukou, reakce na barvu a číslo s hlavou nahoře, postoj s pokrčenými koleny, koordinace bez míčku, cit pro míček (balanc, nabírání).

**Netrénovat nebo omezit:** teorii a taktiku, vyřazovací hry, silovou a vytrvalostní dřinu, vysoké nápřahy, dlouhé jednoruční série, kotouly a točení s holí, nestabilní podložky. Triky nad koleny jen jako označené domácí frajeřinky. Žádná denní série, která nutí trénovat přes únavu.

**Technika (shoda zdrojů):** hůl od pupíku po hrudní kost, nízký postoj, horní ruka řídí a spodní je volná, měkké tiché doteky, nohy v pohybu.

## 3. Pravidla (IFF Rules of the Game 2026)
- Hra holí, chodidlem nebo bércem nad koleny = volný úder (507.4), nad pasem = 2 min (605.3). Čepel nad pas v nápřahu nebo dohrání = volný úder (507.3).
- Skok při hře míčkem, hra hlavou, rukou a vleže jsou přestupky. Gól nohou neplatí.
- Zorro je v zápase legální pod koleny. Na trestném střílení smí míček ve vzduchu změnit směr jen jednou (508.4).
- V appce má každý cvik, trik a výzva `matchLegal`. Volej, žonglování, nakopnutí a vysoký lacrosse mají `false` a hlášku „Tohle je jen domácí frajeřinka, v zápase by to byl faul.“ Hůl pod pasem platí vždy, i doma.

## 4. Gamifikace (apps.md, Säbäkipinä)
1. Týdenní cíl 4 ze 7 dní místo denní série. Celkový počet dní jen roste.
2. XP za snahu a odvedený čas, ne za výkon. Hodnosti jdou jen nahoru.
3. Osobní rekordy a graf zlepšení, žádné žebříčky.
4. Strom triků z malých kroků, každý splnitelný za 1–3 tréninky, rodič odklikne kritérium.
5. Táta vs. syn s hendikepem (bilance kolem 50:50). Po prohře „Odveta!“ a pochvala za osobní zlepšení.
6. Odměny nečekané a kosmetické, karta nejvýš jednou po tréninku.
7. Hlas všude, konec cviku zazní, během tréninku nic ke čtení.
8. Dítě si vybírá (trénink, frajeřinka, souboj).
9. Po tréninku „jak se ti to líbilo“ (tři obličeje) podle finského Kipinämittari.
10. Pokrok je posvátný: aktualizace nesmí ubrat XP, karty ani rekordy.

## 5. Rozhodnutí v obsahu
- Stanoviště jsou kreslená pro praváka s `mirror: true`, kužel 1 je vždy na bekhendu. `around:N`: `ccw` = míjení kuželu vpravo při jízdě dopředu. Při zrcadlení se prohazuje i `dir`.
- 56 cviků na obě strany, 8 jen FH, 8 jen BH. Bekhend má 46 % kroků.
- Tichý režim: 31 cviků s míčkem na stanovišti spot, bez střelby. Střelba jen ve Výzvách, s cílem stranou od tabletu.
- Reakce: 15 cviků. Na spotu (2 kužely) se používá `barva` s nepravidelným pořadím.

## 6. Mezery
- Metodika ČFbU pro přípravky není veřejná (trenérský portál za přihlášením).
- Kniha Lerchová, Třískala (Grada 2024) nezpracována kvůli výhradě nakladatele proti automatické analýze. Manuály IFF nedostupné.
- Hattrick Brno nemá veřejnou metodiku – názvosloví ověřit u trenérů.
- Toe drag, otočka 360 a nakopnutí na čepel mají slabší florbalové zdroje (hokej, sestřihy).
- Chybí povel „stop/zmraz“ (hry Semafor, Zmrazení) – kandidát na nový `callMode`.
- Tempa u kroků `around:N` jsou odhad, ověřit s dítětem.
