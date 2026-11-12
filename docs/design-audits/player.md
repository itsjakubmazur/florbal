# Přehrávač – unslop audit (M4)

Před: `img/before-player-play2-land.png`, `img/before-player-play1-port.png`, `img/before-player-pause-land.png`
Po: `img/player-play1-land.png`, `img/player-play2-land.png`, `img/player-play1-port.png`, `img/player-preview-port.png`, `img/player-pause-land.png`

## Nálezy (signs.md)
- Barva: limetka na povelu, šipce, prstenci kuželu i průběhu – všechno svítí stejně, nic nevede; svět haly chybí (šedá plocha).
- Barva: forhend × bekhend se liší jen odstínem, tvar štítku stejný (kruh). Bílé číslo na modrém kuželu 2,8 : 1.
- Typo: 800 všude, záporné prostrkání na všem; meta řetězec „Hraj! · cvik 3 z 9“ (vykřičník, tečka-oddělovač), 22–24 px text
  pod pravidlem 28 px.
- Layout: stanoviště zabírá ~45 % plochy, povel menší než by šlo; na šířku prázdný pás nad stanovištěm.
- Detail: palubovka jako šedá mřížka 0,5 m – připomíná graf, ne hřiště. Míček 10 jednotek, čepel tenká.
- Komponenty: pauza má jen 2 tlačítka (chybí přeskočit), text „Ukončit“.
- Pohyb: změna povelu se zmenšením z 0,82 (výrazný skok); pulse keyframe v CSS (nepoužitý).

## Co změněno
- Stanoviště je hřiště: modrá palubovka, bílý mantinel se zaobleným rohem (signature), síť po 1 m. Kužely shora větší (r 26),
  tmavá čísla 38 jednotek (AA na všech barvách), bílý prstenec hlášeného kuželu, bílá šipka „kam dál“.
- Míček r 13 s otvory, hůl 8, čepel aktivní stranou 13 v barvě strany, druhá strana tenká. Štítek **F = jantarový kruh**,
  **B = modrý čtverec** – odlišné barvou i tvarem.
- Povel ≥ 18 vh: dlaždice 34 vh (na výšku 22 vh) – kruh F / čtverec B / piktogram kuželu s číslem / čárkovaný domeček;
  slovo FORHEND / BEKHEND / barva zúženým písmem 8 vh. Název cviku 5,6 vh, odpočet 13 vh, vše ostatní ≥ 28 px.
- Fáze samostatně („Hraj“ jantarově), počítadlo „cvik 3 z 10“ dole vedle tenkého průběhu.
- Pauza (klepnutí kamkoli zůstává): Pokračovat (jantarová) / Přeskočit cvik / Konec, výška ≥ 96 px; test hlídá ≥ 88 px
  a že Přeskočit posune cvik. Logika metronomu, hlasu a fází beze změny.
- Pohyb: povel 140 ms (0,9 → 1), odpočet beze změny, pulse odstraněn.

## Zbývá
- Ověřit na iPadu ze 3 m (QA): hlavně slalom (5 m hloubky) na šířku, kde je kužel ~60 px.
- Odpočinek nemá vlastní obsah (jen „Další cvik“ + název) – v M5 zvážit náhled dalšího stanoviště.
