# Knihovna: Cviky a Stanoviště – unslop audit (M5)

Před: `img/before-drills-land.png`, `img/before-stations-land.png` · Po: `img/drills-land.png`, `img/drills-port.png`,
`img/stations-land.png`, `img/stations-port.png`

Rozsah: střední slop (dostaly jen sdílené tokeny). Plný postup v 9 průchodech, směr převzatý z `docs/DESIGN.md`.

## Směr
- Produkt, charakter, svět a signature podle DESIGN.md (hala večer, palubovka, mantinel).
- Moment obrazovky: náhled stanoviště (`StationView`) na palubovce. Vše kolem je tiché.

## Nálezy
- Rozvržení: Cviky ve třech úzkých sloupcích, název cviku se lámal do 3–4 řádků vedle náhledu, meta text 4 řádky.
- Text: „Trojúhelník, Čísla, 40 s“ – velké písmeno uprostřed výčtu; kontext „Knihovna“ nic neříká.
- Stanoviště: nevhodné stanoviště mělo `opacity .55` na celé kartě, takže ztlumený byl i text s důvodem.
- Stanoviště: vše na střed, „vejde se ti“ jen přilepené za čárkou; mrtvý kód `ok ? '' : ''`.
- Mezery: inline `gap: u(0.8)`, `u(1.4)` mimo mřížku 4 px.

## Co změněno
1. Mezery: karty na `--sp-*` (4 px mřížka), náhled vnořený s poloměrem `--r-card − --sp-3`.
2. Barva: náhled na `--floor`; u stanoviště, které se nevejde, se tlumí jen obrázek, text zůstává čitelný.
3. Ikony: přehrávání v `--text-2`, u stanoviště fajfka v `--brand-hi` jen u „Vejde se ti“.
4. Text: „Klepni a cvič jeden cvik“, „Jak postavit kužely“; režim povelu malým písmem („čísla, 40 s, tichý“);
   „, zatím těžké“ tlumeně u vyšší úrovně.
5. Typo: název cviku `--fs-lead` 600, meta `--fs-small`.
6. Layout: Cviky ve dvou sloupcích (na výšku jeden), řádek náhled – text – ikona; Stanoviště zarovnaná vlevo.
7–9. Detaily, vizuál, pohyb: beze změny pohybu, náhled zůstává jediným barevným prvkem karty.

Dotyk: celé karty ≥ 96 px. Bez vodorovného posunu (iPad obě orientace, iPhone obě orientace).
