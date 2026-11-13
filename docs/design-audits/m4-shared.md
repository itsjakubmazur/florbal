# M4 – sdílené vrstvy (`src/ui/m4.css`, `m4kit.js`, `CardView.js`) – unslop audit

Platí pro všechny obrazovky Souboje a frajeřinky. Rozsah: heavy slop ve stejných vrstvách jako M3 před auditem,
proto nejdřív průchody přes sdílené CSS a komponenty, pak po obrazovkách (viz jednotlivé audity).

## Nálezy
- Typo: váha 800 všude (`.m4-section-title`, `.m4-big-num`, `.m4-pl-name`, `.m4-hit`, numpad, stepper, tagy),
  záporné prostrkání −0,04 em u čísel, čísla v běžné šířce místo zúžené „ukazatelové“ z DESIGN.md.
- Komponenty: pilulky `.m4-tag` (poloměr 99 px, 700) na každé kartě, „Moje“ v jantarové; poznámka `.m4-note`
  s barevným levým pruhem (šablonový callout).
- Pohyb: `.m4-glow` (drop-shadow záře, 2 smyčky) a otočení karty s přestřelem `cubic-bezier(.2,.8,.3,1.2)`.
- Mezery: `calc(var(--u) * 0.6 | 1.4 | 1.6)` a `6px`, `4px` napevno mimo škálu.
- CardView: popisek vzácnosti VERZÁLKAMI s prostrkáním, název 800, u zamčených karet plně bílý mantinel – album
  44 zamčených karet zářilo; drobný popis 14 px na kartě ~190 px širokou nečitelný.
- Graf: popisky os 700.
- Dotyk: `--tap` 56 px i na obrazovkách pro dítě.

## Co změněno
1. Mezery: `--sp-*` místo `u()` zlomků a pixelů; karty `--sp-5`.
2. Barva: tagy pryč, meta řádek `.m4-meta` tichým textem, „jen doma“ v `--danger`; poznámka = `--bg-2` + vlasová čára,
   ikona v barvě textu (u varování v `--danger`).
3. Ikony: ve všech poznámkách ikona před textem v jedné ose (`flex`, `gap --sp-3`).
4. Text: viz obrazovky (vykřičníky, „·“).
5. Typo: nadpisy 600–650; čísla (skóre, odpočet, rekordy, stepper, numpad) zúžené Archivo 700, `tabular-nums`, bez
   záporného prostrkání. Na kartě vzácnost větou („Běžná“), název 650.
6. Layout: nové `.m4-hub`, `.m4-setup`, `.m4-check`, tabule skóre `.m4-score` (`scoreboard()` v `m4kit.js`).
7. Detaily: zamčená karta s tlumeným rámem (45 %) a mantinelem v `--line-strong`; malá karta v albu jen název 25–29 px,
   popis v detailu. `.m4-steps .cur` místo inline `outline`.
8. Vizuál: jediný moment sekce = tabule skóre táta : syn (zúžená čísla na palubovce, čára palubovky jako rozdělovač).
9. Pohyb: záře odstraněna; otočení karty 700 ms na `--ease` bez přestřelu (jediný orchestrovaný moment), přechody
   panelů hráčů na `--t-mid`/`--ease`.

Dotyk: na `.m4` a `.kid` obrazovkách tlačítka ≥ 64 px (`styles.css`), velká tlačítka `.btn-big` ≥ 88 px beze změny.
