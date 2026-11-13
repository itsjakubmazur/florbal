# Moje cesta (hodnosti) – unslop audit (M5)

Před: `img/before-levels-land.png` · Po: `img/levels-land.png`, `img/levels-port.png`

## Směr
DESIGN.md. Hodnosti jsou skutečná posloupnost (Přípravka U7 → Hattrick legenda), proto číslování a spojnice dávají smysl.
Moment: trasa s aktuální zastávkou v klubové modré.

## Nálezy
- Mřížka 5 × 2 stejných karet: „SaaS kit“, cesta se nečte jako cesta, pořadí se láme po řádcích.
- Nadpis = název hodnosti, kontext „Cesta mladého florbalisty“ – dlaždice na domově se ale jmenuje „Moje cesta“.
- Budoucí hodnosti `opacity .5` celé karty; tučné 700 číslo v kruhu; lišta postupu inline stylem.
- Chyběla informace „kolik zbývá“.

## Co změněno
1. Mezery: řádky stejné výšky (≥ 72 px), krok 4 px.
2. Barva: dosažené zastávky obrys `--brand-hi` s fajfkou, aktuální plná `--brand`, budoucí `--surface-2` + `--muted` text.
3. Ikony: fajfka jen u dosažených.
4. Text: nadpis „Moje cesta“, kontext „Hodnost 3 z 10, 210 XP“; u aktuální „Do další hodnosti 150 XP“.
5. Typo: čísla zastávek zúženým Archivem (jako dres), názvy `--fs-lead`.
6. Layout: trasa se spojnicí (`ol`, `aria-current="step"`), na šířku dvě kolony 1–5 a 6–10, na výšku jedna.
7. Detaily: XP zarovnané vpravo v jednom sloupci, lišta postupu `.bar`.
8–9. Bez nového vizuálu, bez pohybu.
