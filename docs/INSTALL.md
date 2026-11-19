# Návod pro rodiče

Florbal Trenér je webová aplikace pro iPad. Nic se nestahuje z App Storu, nic se neodesílá ven, žádné účty.
Všechna data (hráči, XP, rekordy, karty) jsou jen v iPadu.

## 1. Instalace na iPad

1. V **Safari** otevřete adresu aplikace: **https://itsjakubmazur.github.io/florbal/**
2. Klepněte na **Sdílet** (čtverec se šipkou) → **Přidat na plochu** → **Přidat**.
3. Spouštějte ji vždy z ikony na ploše. Běží pak přes celou obrazovku a funguje i bez internetu.
4. Při prvním spuštění chvíli počkejte s připojením k Wi-Fi: aplikace si stáhne hlasy Trenéra (asi 9 MB) do iPadu.

> Chcete si ji jen prohlédnout? Přidejte za adresu `?demo`. Vytvoří se ukázkový hráč s vymyšleným jménem a trochou postupu.

## 2. První spuštění

1. **Nový hráč**: průvodce se zeptá na jméno, věk, na které straně drží hůl (leváci dostanou zrcadlená stanoviště), jak mu to jde, jak dlouho chce trénovat, kolik je doma místa, kolik má kuželů a číslo dresu.
   - **Prostor**: malý (1 × 2 m, třeba pokoj), střední (3 × 3 m), velký (3 × 5 m, chodba nebo garáž). Appka pak nabízí jen stanoviště, která se vejdou.
   - **Kužely**: stačí 2, nejvíc se využije 5. Poslouží i boty, ponožky nebo lepicí páska.
2. **Rodiče** (zámek): při prvním vstupu si vytvoříte čtyřmístný PIN. Když ho zapomenete, „Zapomněl jsem PIN“ vás pustí po vyřešení příkladu pro dospělé.
3. V Rodičích je:
   - **Zvuk**: Hlas (nahrávky Trenéra), Hlas iPadu (vestavěný český hlas zařízení), jen Pípání, nebo Ticho; zvlášť hlasitost hlasu a pípání s metronomem.
   - **Tichý trénink (byt)**: jen cviky bez ťukání míčkem, když sousedi spí.
   - **Tempo**: pomaleji / normálně / rychleji.
   - **Hráči**: úprava údajů z průvodce nebo smazání hráče.

## 3. Stanoviště

Před tréninkem Trenér hlasem i obrázkem provede postavením kuželů, krok za krokem. Pět stanovišť:

| Stanoviště | Kužely | Prostor |
|---|---|---|
| Malý prostor | 2 | malý |
| Trojúhelník | 3 | střední |
| Čtverec | 4 | střední |
| Slalom | 4 | velký |
| Cik-cak | 5 | velký |

iPad postavte opřený na zemi nebo na židli 2–3 m před hráčem, displejem k němu. Povely jsou čitelné z té vzdálenosti.
Během tréninku iPad nezhasne. Klepnutí kamkoli trénink pozastaví.

## 4. Bezpečnost

- Volný prostor kolem hráče aspoň na délku hole, křehké věci pryč.
- Hůl držet pod pasem, žádný velký nápřah, zvlášť u střelby a soubojů. Před každým soubojem appka ukáže kontrolní seznam.
- Míček jen florbalový (lehký, s otvory). iPad mimo dráhu míčku.
- Trénink začíná rozcvičkou a končí protažením, nepřeskakujte je.

## 5. Souboje a frajeřinky

- **Souboje** táta vs. syn (Gól od tyčky, KOHOUT a další). Skóre zapisuje dospělý tlačítky Trefa / Vedle, „Zpět“ opraví překlep.
- **Frajeřinky**: 18 triků po krocích. U každého kroku je řádek „Pro rodiče: kdy je krok splněný“, krok odklikává dospělý.
- **Testy dovedností**: stejný test jednou za čas, výsledek zadáte číselnou klávesnicí a appka kreslí graf zlepšení.

## 6. Záloha a nová verze

- **Záloha**: Rodiče → Záloha dat → **Uložit zálohu** (nebo **Bez fotek**, menší soubor). Uložte ji do Souborů nebo iCloudu. Při výměně iPadu nebo po smazání dat: **Obnovit ze zálohy**.
- iPad umí data webových aplikací při nedostatku místa smazat. Proto v Rodičích (Úložiště a aplikace) klepněte na **Požádat o trvalé úložiště** a jednou za čas udělejte zálohu.
- **Nová verze** se stáhne sama na pozadí. Nabídka aktualizace se ukáže až po tréninku, nikdy uprostřed. Ručně: Rodiče → Úložiště a aplikace → Aktualizovat na novou verzi.

## Řešení problémů

| Problém | Řešení |
|---|---|
| Nic nezní | Zkontrolujte tlačítko ztlumení / hlasitost iPadu a v Rodičích hlasitost hlasu. Po spuštění klepněte na obrazovku (Safari pustí zvuk až po prvním dotyku). |
| Hlas zní jinak než obvykle | V Rodiče → Zvuk je zvolený „Hlas iPadu“, nebo se nahrávky ještě nestáhly – otevřete appku jednou na Wi-Fi. |
| iPad během tréninku zhasíná | Spouštějte appku z ikony na ploše, ne z karty v Safari. |
| Chci začít znovu | Rodiče → **Smazat všechna data** (potvrzuje se dvakrát, nejde vrátit). |

## Vlastní hlas Trenéra (volitelné)

Hlášky jde namluvit vlastním hlasem, třeba tátovým:
1. Na počítači v projektu: `node scripts/gen-voices.mjs --list > hlasky.tsv` vypíše klíč a text každé hlášky (např. jen triky: `--only trick_`).
2. Namluvte hlášku Diktafonem na iPhonu a soubor pojmenujte podle klíče, např. `praise_1.m4a`.
3. Uložte do `assets/audio/voice/trener/` a pushněte (`git push`). Vlastní nahrávka má přednost před vygenerovanou, ostatní hlášky zůstanou.

