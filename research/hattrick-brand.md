# FBŠ Hattrick Brno – vizuální identita (rešerše 2026-11-12)

## Zdroje
- Oficiální web: https://www.hattrick-brno.cz/ (`hattrick-brno.cz` existuje; `hattrick.cz` patří jinému subjektu, vrací 403; `fbshattrick.cz`, `hattrickbrno.cz` neexistují)
- Wikipedie cs: https://cs.wikipedia.org/wiki/FB%C5%A0_Hattrick_Brno (klub založen 1999, sponzorský název „FBŠ Hummel Hattrick Brno“, muži v Superlize od 2025/26)
- Profil ČFbU: https://www.ceskyflorbal.cz/club/detail/overview/844 (za Cloudflare challenge, curlem nečitelné)
- Sociální sítě: https://www.facebook.com/hattrickbrno, https://www.instagram.com/hattrickbrno/, Flickr `hattrickbrno`
- Fanshop: florbal.com (výrobce Hummel) – „Hattrick T-Shirt Blue/Black“, „Hattrick Hood Black“, „Hattrick Beanie“

## Logo
- Původní URL (obrázek klubového loga v hlavičce webu, CMS EOS):
  https://hattrick.eoscms.cz/webimages/club_logo_filename_20230711_172955.png
- Varianta ikony: https://www.hattrick-brno.cz/apple-touch-icon.png
- SVG verze nikde veřejně není (sprite.svg na webu obsahuje jen UI ikony, na Commons logo není).
- Uložené soubory:
  - `assets/img/club/hattrick-logo.png` – PNG 270×200, RGBA (průhledné pozadí), největší dostupná verze
  - `assets/img/club/hattrick-logo-icon-152.png` – PNG 152×152, RGBA, stejné logo na čtvercovém plátně
- Popis: štít (erb) v modré, nahoře nápis „CZECH FLOORBALL TEAM“, uprostřed florbalový míček s kloboukem (westernový klobouk), přes štít stuha „FBŠ HATTRICK BRNO“, dole „EST. 1999“.
- Rozlišení je nízké – pro velké použití (splash) požádat klub o vektorovou verzi.

## Barvy (HEX + původ)
| Role | HEX | Původ |
|---|---|---|
| Primární modrá (logo) | `#0056A2` | logo PNG – nejčastější neprůhledná barva (10 844 px), štít + stuha |
| Tmavě modrá / navy (logo) | `#0C3178` | logo PNG – 4 990 px, obrysy a tmavé plochy štítu |
| Bílá (logo) | `#FFFFFF` | logo PNG – 8 507 px, nápisy, míček, klobouk |
| Světle šedá (logo) | `#D8D9DA` | logo PNG – 2 529 px, stínování míčku/klobouku |
| Primární modrá (web) | `#0961AF` | styles.css – `.bg-primary`, `.bg-navbg` (rgb 9 97 175), hlavní lišta webu |
| Tmavá modrá (web) | `#084983` | styles.css – rgb(8 73 131), hover/tmavší odstín |
| Světle modrá (web) | `#B3CEE6` | styles.css – `.bg-primarylight` |
| Tmavě šedá (web) | `#2D2D2D` | styles.css – `.bg-footerbg`, `.bg-subnavbg` |
| Pozadí sekcí (web) | `#F3F3F3` | styles.css – rgb(243 243 243) |

Barvy byly vyčteny pomocí `magick … txt:` (počet pixelů s plnou neprůhledností) a z výskytů v `styles.css`. Web používá o něco světlejší modrou (#0961AF) než logo (#0056A2); jde o tentýž klubový odstín modré. Klubové barvy = **modrá + bílá** (doplňková tmavě modrá).

## Dresy
Zdroj: fotky ze Superligy na Wikimedia Commons (Tatran – Hattrick 2025, SKV – Hattrick play-down 2026), obě z venkovních zápasů; výrobce dresů Hummel (chevrony na rukávech, Hummel = generální partner).
- **Modrá sada:** modrý dres (s Hummel chevrony), modré trenýrky, bílé štulpny – nasazena proti Tatranu (soupeř v červené).
- **Bílá sada:** bílý dres s modrými prvky, modré trenýrky, bílé štulpny – nasazena proti SKV (soupeř v černo-žluté).
- Který komplet je oficiálně „domácí“ a který „venkovní“, se z dostupných zdrojů nepodařilo ověřit (obě fotky jsou z hřišť soupeřů). HEX barvy dresů z fotek neuvádím (osvětlení haly je zkresluje) – pro appku použít barvy loga.

## Cesta mladého hráče v klubu
Názvy podle menu „Družstva“ na webu klubu (klub používá věkové označení U-kategorií ČFbU). Stránky ČFbU jsou za Cloudflare ochranou, takže je nešlo ověřit přímo; názvy kategorií odpovídají ČFbU (přípravka, mladší/starší elévové, mladší/starší žáci, dorostenci, junioři, muži).

| Krok | Kategorie (ČFbU) | Družstvo Hattricku |
|---|---|---|
| 0 | předškoláci | projekt „SEVER SPORTUJE!“ – první rok 1 trénink týdně zdarma |
| 1 | U7 přípravka | U7 PŘÍPRAVKA LESNÁ, U7 PŘÍPRAVKA KRPOLE (+ ZŠ Vejrostova Bystrc U9/U11) |
| 2 | U9 mladší elévové | U9 MLADŠÍ ELÉVOVÉ |
| 3 | U11 starší elévové | U11 STARŠÍ ELÉVOVÉ |
| 4 | U13 mladší žáci | U13 MLADŠÍ ŽÁCI |
| 5 | U15 starší žáci | U15 STARŠÍ ŽÁCI (mistři ČR 2024) |
| 6 | U17 dorostenci | U19/17 ELITE / U19/17 HOBBY (společné družstvo) |
| 7 | U19 junioři | U19/17 ELITE / U19/17 HOBBY |
| 8 | muži | MUŽI „B“ + „C“ → MUŽI „A“ (Superliga) |

Pozn.: kategorie „minipřípravka“ se na webu klubu nevyskytuje (nejmladší jsou U7 přípravky a předškoláci v projektu Sever sportuje). Klub zdůrazňuje odchovance – v postupovém zápase do Superligy 2025 bylo 9 hráčů základní sestavy odchovanci z klubové přípravky.

## Heslo / motto
Oficiální motto nebylo nalezeno. Na webu se objevuje náborová výzva „Přidej se k Hattricku!“ (meta description) a v historii klubu fanouškovský chorál „Superligoví, superligoví, už jsme zase superligoví!“ (postup 2025). Domácí hala: Hummel Arena Lesná / hala Hattrick (Brno-Lesná).
