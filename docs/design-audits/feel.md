# „Jak se ti to líbilo?“ (obličeje na Výsledku) – unslop audit (M5, nápad 4)

Před: `img/before-feel-land.png`, `img/before-feel-port.png` · Po: `img/feel-land.png`, `img/feel-port.png`, `img/feel-phone.png`
Soubory: `src/screens/afterWorkout.js`, `src/ui/m4kit.js` (`faceSvg`), `src/ui/m4.css` (`.m4-face*`), `src/screens/result.js`, `.result-row` ve `styles.css`.

## Audit (signs.md)
- **Obličeje jako emoji sada:** modrý, žlutý a zelený smajlík. Barvy nemají v appce tento význam: modrá `--brand-hi` je
  výběr a průběh, žlutá `--cone-yellow` je kužel, zelená `--ok` je trefa v souboji. Typický „rating widget“, který by seděl
  do kterékoli appky.
- **Dvojitý kontejner:** barevný kruh v kruhu s 3 px vlasovou čarou a vlastní plochou (kruh v kruhu bez důvodu).
- **Výběr jantarově:** vybraný obličej dostal rámeček `--signal`; jantarová má na obrazovce už hvězdy a „Domů“
  a podle DESIGN.md patří jen akci a odpočtu. Výběr je jinde v appce klubová modrá (`.btn.on`, `.card.on`).
- **Bez popisku:** význam jen v `aria-label`; rodič, který se podívá přes rameno, ani dítě s nejistotou nevidí, co který znamená.
- **Pořadí a ohyb:** otázka stála pod hlavním tlačítkem „Domů“. Na iPadu na šířku byla celá pod ohybem (obrazovka 820 px,
  obsah ~1 000 px), takže hlas „Jak se ti to líbilo?“ se ptal na něco, co dítě nevidí. Na výšku a na telefonu dítě
  nejdřív narazí na „Domů“.
- Mezery a písmo v pořádku (sdílené `--sp-*`, `--fs-lead`); vykřičníky ani verzálky žádné. Rozsah: **light slop**, režim polish.

## Směr (z DESIGN.md, bez nového)
- Produkt, charakter a svět beze změny: večerní florbalová hala, hravý, sportovní, přímočarý.
- Jasná věc obrazovky zůstává: jantarové hvězdy a XP. Obličeje jsou tiché, ale z hřiště.
- Detail jen pro tuto appku: **obličej je florbalový míček** (bílý, otvory po obvodu, výraz v barvě okraje míčku),
  stejné tokeny jako míček ve `StationView` (`--ball`, `--ball-hole`, `--ball-edge`).

## Průchody
1. **Mezery:** míček a popisek ve sloupci (`--sp-3`), míčky od sebe `--sp-5`, karta hráče a otázka v jedné řadě
   `.result-row` s mezerou `--sp-5` × `--sp-7`. Žádná jednorázová hodnota.
2. **Barva:** pryč tři barevné výplně a jantarový rámeček. Míčky bílé, výběr = dvojitý prstenec `--bg` + `--brand-hi`
   (stejná řeč jako fokus a `.btn.on`), nevybrané po volbě ztlumené na 45 %. Jantarová zůstala jen hvězdám a „Domů“.
3. **Ikony:** obličeje nejsou emoji, jsou to SVG kreslené kódem; tah pusy 6 jednotek, oči 5,5, zaoblené konce.
4. **Copy:** popisky z `FEEL_LABEL` jsou vidět pod míčky („Nebavilo mě to“, „Ušlo to“, „Bavilo mě to“), bez teček
   a vykřičníků. Otázka beze změny (hlas říká totéž).
5. **Typ:** popisek `--fs-body` 500 v `--text-2`, vybraný `--text` 600. Otázka `--fs-lead` 600.
6. **Rozvržení:** otázka se přesunula nad „Domů“ – na šířku vedle karty hráče (vše se vejde na 820 px bez posunu),
   na výšku a na telefonu pod kartu. Pořadí čtení: výsledek → jak se ti to líbilo → domů.
7. **Detaily:** tlačítko = míček + popisek (dotyková plocha 165 × 220 px na iPadu, 96 px široká na telefonu ≥ 88),
   `aria-pressed` místo `aria-label`, fokus přes sdílený `[data-focusable]`. Poloměr fokusu `--r-card`.
8. **Vizuál:** míček s 10 otvory po obvodu (uvnitř obličeje nic, aby výraz četl i z dálky).
9. **Pohyb:** jen přechod prstence 140 ms a ztlumení ostatních 200 ms (`--ease`). Žádná smyčka, žádný odskok.

## Kontrola
- Žádné emoji, glow ani gradient; jedna akcentová barva výběru; data-test `feel`, `feel-1`…`feel-3` beze změny.
- Téma Kontrast: míček bílý, výraz černý; Neutrální: výběr tyrkysový `--brand-hi`.
- Template check: bílý děrovaný míček s obličejem do jiné appky nepatří.

## Sporné
- Barevné obličeje (červená–žlutá–zelená) jsou u dětských dotazníků běžné a pomáhají číst na první pohled. Tady nesou
  význam tvar pusy a popisek; když by rodiče chtěli barvu zpět, patří do výrazu (pusa), ne do plochy míčku.
