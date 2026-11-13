# Souboje (seznam, nastavení, bezpečnost, průběh, historie, vlastní výzva) – unslop audit

Před: `img/before-duels-land.png`, `before-duelSetup-land.png`, `before-duelSafety-land.png`, `before-duelPlay-land.png`,
`before-duelStats-land.png` · Po: stejné názvy bez `before-`, `-land` i `-port`. Sdílené: [m4-shared.md](m4-shared.md).

## Směr
DESIGN.md. Moment: skóre hráčů (průběh) a tabule bilance (historie). Průběh souboje se hraje: čitelnost ze 3 m.

## Nálezy
- Seznam: pilulky „Pokusy“ / „Jen doma“ / „Moje“ nad každým nadpisem (nálepky nad nadpisem), jantarové primární
  tlačítko „Vlastní výzva“ soupeřilo s výběrem výzvy, sekce jako drobné eyebrow.
- Nastavení: „Začít souboj“ až pod přehybem (na šířku vpravo dole), placeholder „Další hráč (jméno)“ 40 px tučně,
  pravidla 800.
- Bezpečnost: čtyři poznámky s pruhem a tučným textem, věty s tečkou.
- Průběh: skóre a jméno 800 s −0,04 em, „Zbývá 9 pokusů“ ~17 px (ze 3 m nečitelné), tečky trefa/vedle 14 px.
- Výsledek: „Vyhrává Tonda Čepel!“, „Remíza!“, „Odveta zítra! …“, „Nový osobní rekord!“.
- Historie: „Táta 3 · Tonda 5“, „Odveta · Vyhrál …“ jako pilulka, rekord v síni slávy jantarově, „3× hráno · nejvíc výher:“.

## Co změněno
- Seznam: název nahoře, pod ním tichý meta řádek („Pokusy, jen doma“), sekce `--fs-lead`; „Vlastní výzva“ jako `.btn`.
- Nastavení: mřížka `.m4-setup` – na šířku vlevo pravidla a hned pod nimi „Začít souboj“, vpravo hráči a formát;
  na výšku start až pod volbami. Vstupy `--fs-lead` 500, placeholder tlumeně. Rekord v poznámce s pohárem.
- Bezpečnost: kontrolní seznam `.m4-check` (ikona + krátká věta bez tečky, `--fs-lead`), kontext = název výzvy.
- Průběh: jméno 28 px+, skóre zúžené 72–90 px, „Zbývá …“ 22–28 px, tečky 20 px, Trefa/Vedle zúžené 36 px+
  (tlačítka ≥ 112 px). Výsledek `.m4-result-line` zúženým písmem bez vykřičníku.
- Historie: tabule bilance stejná jako na rozcestníku; řádky „Táta 3, Tonda 5“, „Odveta, vyhrál …“; síň slávy
  bez jantarové, „Hráno 3×, nejvíc výher má …“.
- Vlastní výzva: popisky polí `field-label`, „Smazat fotku“ místo dvojznačného „Bez fotky“ na tlačítku.

Hlasové hlášky (`sayText`) se nezměnily.
