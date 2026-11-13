# Rychlé volby z domova: Reakce, Rozcvička, Protažení – unslop audit (M5, nápad 4)

Před: `img/before-quick-reaction-land.png`, `img/before-quick-warmup-land.png`, `img/before-quick-stretch-land.png`
Po: `img/quick-reaction-land.png` / `-port.png`, `img/quick-warmup-land.png` / `-port.png`, `img/quick-stretch-land.png` / `-port.png`
Soubory: `src/screens/quick.js`, `src/domain/quick.js`, `src/screens/setup.js`, `src/screens/player.js`, `src/ui/StationView.js`.

Volby nemají vlastní obrazovku: **Reakce** vede na Postav stanoviště s reakčním tréninkem, **Rozcvička** a **Protažení**
rovnou do přehrávače (stanoviště „Malý prostor“, nic se nestaví). Audit proto hodnotí, jak tyto dvě sdílené obrazovky
vypadají v daném režimu. Dlaždice na domově (`m4HomeTiles`) jsou tiché `.tile` jako ostatní a nálezy nemají.

## Audit (signs.md)
- **Reakce, kontext nepatří režimu:** pod nadpisem „Postav trojúhelník“ stálo „Než začneme trénink“, stejně jako
  u běžného tréninku. Dítě ani rodič nevidí, že jde o reakce a kolik jich bude.
- **Reakce, „Jiné stanoviště“ rozbíjí režim:** tlačítko skládalo `buildWorkout` – běžný trénink místo reakcí.
  Reakce si stanoviště vybírá sama (to s nejvíc reakčními cviky), takže druhá volba nemá co nabídnout.
- **Desetinná tečka:** „potřebuješ asi 2.6 × 2.8 m“ (DESIGN.md: desetinná čárka). Platí pro všechna stanoviště.
- **Rozcvička a protažení, kužely navíc:** na palubovce svítily kužely 1 a 2 ve plných barvách, i když protažení
  žádný kužel nepoužívá a většina rozcvičky taky ne. Barevné kužely jsou na přehrávači nejsilnější signál („běž sem“),
  tady posílaly dítě nikam.
- Typ, mezery, barvy a povel v přehrávači jsou ze sdílených tříd (audit `player.md`, `setup.md`); bez dalších nálezů.
  Rozsah: **light slop**, polish.

## Směr (z DESIGN.md)
Beze změny. Jasná věc přehrávače zůstává stanoviště s holí; v rozcvičce a protažení na něm má být jen to, co cvik
opravdu používá. Žádný nový detail.

## Průchody
1. **Mezery:** beze změny; v `quick.js` inline `gap:4px` → `var(--sp-1)`.
2. **Barva:** nepoužité kužely v rozcvičce a protažení se nekreslí (`showCones(použité, { rest: 0 })`); kužely,
   které cvik používá (např. „Rychlé nohičky“ 1 a 2), zůstávají. Barevný signál tak znamená vždy „tam běž“.
3. **Ikony:** beze změny (blesk, východ slunce, měsíc v dlaždicích jsou čárové Lucide v `--text-2`).
4. **Copy:** kontext reakce „Reakce na povel, 6 cviků“ (správné skloňování 1 cvik / 2–4 cviky / 5 cviků);
   rozměry stanoviště s desetinnou čárkou „2,6 × 2,8 m“.
5. **Typ:** beze změny.
6. **Rozvržení:** v reakci zmizelo „Jiné stanoviště“; v řadě nad stanovištěm zůstává jen „Už stojí, trénovat“.
7. **Detaily:** režim nese trénink (`workout.mode` = `reaction` / `nobal` / `stretch`), obrazovky se podle něj řídí
   místo hádání ze seznamu cviků.
8. **Vizuál:** palubovka v protažení = mantinel, domeček a hráč s holí, nic dalšího.
9. **Pohyb:** beze změny.

## Sporné
- „Jiné stanoviště“ v reakci je skryté, ne přepracované. Kdyby rodiče chtěli reakce i na jiném stanovišti,
  `reactionWorkout` potřebuje volbu `stationId` (ne všechna stanoviště mají reakční cviky).
