# Rozbor existujících appek a gamifikace pro děti

Agent: `research-apps` · Datum: 2026-11-12 · Cíl: co převzít a čemu se vyhnout v PWA „Florbalový trenér“ (8letý hráč, hlasový Trenér, gamifikace, souboje táta vs. syn, strom triků, testy s rekordy, nic neměří).

**Metoda a omezení:** webové vyhledávání, stránky v App Store, recenze (Trustpilot, Common Sense Media, oborové weby) a odborné články nebo jejich shrnutí. Appky jsem sám neinstaloval. Hodnocení v obchodech a Trustpilot jsou samovýběrové a anekdotické. U některých „appek“ ze zadání se ukázalo, že jde jen o hardware nebo že appka neexistuje. To je v tabulce uvedeno výslovně, aby se na tom dál nestavělo.

---

## 1. Tabulka appek

### 1a. Florbal

| Název | Platforma | Co dělá | Režimy | Gamifikace | Co funguje | Co ne | URL |
|---|---|---|---|---|---|---|---|
| **My Floorball** (Sport Revolution, LV) – appka k pomůckám Skiller / Passer / Target | iOS, iPad, Android; zdarma | Doprovod k fyzickým pomůckám: Skiller (rám pro stickhandling a reakci), Passer (odrazová deska na přihrávky, 2 hráči), Target (terče do rohů branky). Appka skládá domácí trénink. | Vlastní trénink, reakce, periferní vidění (podle popisu) | V popisu žádná | Jediná větší „domácí florbalová“ appka. Česky. Cílí na reakci, hlavu nahoře a periferní vidění. To je přesně naše mezera, kterou pokryjeme reakčním režimem. | Poslední aktualizace 2019, jen 3 hodnocení, věkový rating 16+ (kvůli webu). Bez pomůcek má malou hodnotu. Žádná motivace pro děti. | https://apps.apple.com/us/app/id949358436 · https://fitness-gaming.com/news/fitness-and-sports/my-floorball-training-aids-improve-key-floorball-skills.html |
| **Floorball Drills** | iPhone; zdarma + IAP | 40+ animovaných cvičení s kroky a coaching body | Knihovna cvičení | Žádná | Animace a krátké coaching body (inspirace pro náš SVG pohled shora) | Pro trenéry a dospělé, ne pro dítě. Bez hlasu, bez tempa. | https://apps.apple.com/app/id6761059343 |
| **Coachen** | iPad, iPhone; IAP | Nástroj pro florbalové trenéry: tvorba cvičení, 3D animace, sdílení | Plánovač | Žádná | Kvalitní vizualizace cvičení | Týmový nástroj, nic pro domácí trénink dítěte | https://apps.apple.com/app/id6744722011 |
| **IFF Events** (IFF) | iOS, Android | Výsledky, rozpisy, novinky z MS | – | – | – | **IFF nemá tréninkovou appku.** Pro nás je irelevantní. | https://floorball.sport/2021/11/24/mobile-app-for-world-floorball-championships-launched |
| „Floorball Coach“ | – | Appka tohoto jména dohledatelná není. Nejbližší jsou Coachen a obecné taktické tabule (Coach Board). | – | – | – | Mezera v rešerši | https://apps.apple.com/app/id1555645807 |

**Závěr pro florbal:** na trhu **neexistuje** florbalová appka pro děti s hlasovým trenérem a gamifikací. Konkurence je buď hardware s mrtvou appkou, nebo trenérské nástroje.

### 1b. Hokej (stickhandling)

| Název | Platforma | Co dělá | Režimy | Gamifikace | Co funguje | Co ne | URL |
|---|---|---|---|---|---|---|---|
| **Dangle Time** (Jeremy Rupke / How To Hockey) | iPhone; 0,99 USD + balíčky po 0,99 | Stickhandling cvičení s videem (i zpomaleným). Interval 20 s práce / 10 s pauza, nastavitelný. | Balíčky (Toe Drags, Challenges, 2 Pucks, Footwork…) | Celkový nacvičený čas povyšuje hodnosti (od „Duster“ po „All-Star“), sdílení s kamarády | Hodnosti za **odvedený čas**, ne za výkon, takže nikdo „neprohrává“. Krátké intervaly. Recenzenti chválí přezdívky a hodnosti. | Recenzenti chtějí **zvukový signál konce cviku** („nemusím koukat na telefon“), víc pokynů k chybám, zpomalené přehrání | https://apps.apple.com/app/id1093211911 |
| **Level Up Hockey** | iOS; 19,99 USD/měs | 150+ cvičení (stickhandling, střelba, dryland), kurikulum podle úrovně | Kurikulum, týmové výzvy od trenéra | Body, **týdenní žebříček podle věku**, streak dní v řadě, „pucks and stars“ odemykají obsah | Dobrá struktura: úroveň → odemčení. Týdenní reset žebříčku. | Drahé předplatné. Žebříček proti cizím dětem (pro 8 let rizikové, viz kap. 2). Zatím bez hodnocení. | https://apps.apple.com/app/id6761783450 |
| **SuperDeker** (+ deska) | iOS, Android; IAP/předplatné | Deska se senzory: světla ukazují, kam s pukem. 11+ herních režimů, „Rookie“ režimy pro malé. | Reakce na světlo, na čas, Rookie | Skóre, rekordy | **Reakční princip „rozsvítí se cíl, dojeď tam“** je přesně náš reakční režim, jen bez senzorů | Appka „glitchy“, odpojování desky. Část her za předplatným. Hodnocení v obchodě 2,9. | https://apps.apple.com/ca/app/superdeker-app/id1562871862 · https://superdeker.zendesk.com/hc/en-us/sections/9950483309211-SUPERDEKER-APP |
| **Hockey IntelliGym** (spolupráce s USA Hockey) | Windows/Mac/iPad; předplatné | Kognitivní trénink „hockey IQ“ formou videohry | Herní sezení | Herní progrese | Kognitivní a reakční prvek | Podle výrobce až od PeeWee (11+) se 2 lety praxe. **Nezávislé recenze chybí**, efekty uvádí jen výrobce. Žádný pohyb. | https://intelligym.com/support/hockey-faq · https://www.intelligym.com/ |
| **HockeyShot** | web/blog | Programy „Train at Home“, „Shoot to Score“, 30denní výzva přesnosti, 5denní Instagram challenge | Vícedenní výzvy | Soutěž o ceny přes Instagram | Formát „N-denní výzva“ s jasným koncem | **Samostatná appka nenalezena.** Jde o e-shop s blogem. | https://hockeyshot.com/pages/training-programs · https://hockeyshot.com/pages/5-day-train-at-home-challenge |
| **Bauer Reactor / Sniper's Edge (SweetHands)** | hardware | Stickhandlingové trenažéry (Bauer Digital Reactor počítá doteky) | – | Bauer: rekordy na displeji | Okamžitá zpětná vazba počtu | **Appku nemají** (Sniper's Edge vůbec, Bauer jen displej na pomůcce) | https://eu.bauer.com/products/bauer-digital-reactor-stick-handling-trainer · https://snipersedgehockey.com/products/sweethands-hockey-stickhandling-trainer |
| **HockeyTracker** | Apple Watch; předplatné | Statistiky střídání a tepu ze zápasu | – | – | Hloubka statistik | Pro starší hráče. Recenzenti si stěžují, že **nevidí vývoj v čase, jen jednotlivá sezení**. Poučení pro nás: rekordy ukázat jako graf zlepšení. | https://apps.apple.com/us/app/hockeytracker/id1297971760 |
| **Hockey Native / Quick Hands Hockey** | iOS; předplatné | Stickhandling s kamerou nebo sledováním | Arcade režimy | Žebříčky, rankingy | – | Kamera, předplatné, globální žebříčky | https://mwm.ai/apps/hockey-native/6763365735 · https://mwm.ai/apps/quick-hands-hockey/6757571816 |

### 1c. Fotbal a basketbal pro děti

| Název | Platforma | Co dělá | Režimy | Gamifikace | Co funguje | Co ne | URL |
|---|---|---|---|---|---|---|---|
| **FPRO** (podložka + appka) – nejbližší obdoba referenční „Tréninkové podložky“ | iOS, Android, tablet; předplatné | Podložka s čísly a šipkami, appka vede cvičení „ball mastery“ | Programy, video návody | XP, trofeje, žebříčky, streak | Recenzent FourFourTwo s 9letým testerem: dítě „vstalo z gauče“. Dítě baví progrese a odměny. Mapa na podložce = jasný cíl. | Trustpilot: načítání, zamčené účty, **složité nastavení pro více dětí**, a hlavně „**update vymazal synovi streak**“ (frustrace) | https://www.fourfourtwo.com/products-kit/fpro-app-training-program-and-pro-kit-review-get-your-kids-exercising-without-leaving-their-tablet-with-this-great-app-and-equipment · https://uk.trustpilot.com/review/fpro.shop |
| **DribbleUp** (chytrý míč) | iOS, Android; předplatné | Kamera sleduje míč, virtuální trenér vede lekci | Třídy, drily | Skóre, žebříčky, rekordy | Pro 8–14leté začátečníky vhodné. Vedený formát „trenér na obrazovce“ funguje. | Tracking selhává (světlo, prostor, **u dětí pod 10 let**). **Předplatné nebylo jasně uvedeno před koupí.** Trustpilot 3,5. | https://dribbleup.com/soccer · https://ch.trustpilot.com/review/dribbleup.com · https://digitaltrends.com/cool-tech/dribbleup-review |
| **Techne Futbol** (Yael Averbuch) | iOS, Android; až ~48 USD/měs | Denní plány technických cvičení s videem, bodování | Denní plán, fundamentals | Skóre | Struktura „co dnes trénovat“ | Spíš pro 12+, drahé, zmínky o chybách | https://simplifaster.com/articles/ball-mastery-techne-futbol/ · https://justuseapp.com/en/app/1298569303/techne-futbol/reviews |
| **Beyond** | – | Fotbalová appka toho jména pro děti nedohledána. Obdoba: DRIBLR (podložka + progrese), Anytime Soccer Training (video pro rodiče a děti). | – | – | – | Mezera v rešerši | https://play.google.com/store/apps/details?id=com.driblr.app |
| **Footbonaut** (BVB/Hoffenheim) | stroj, ne appka | Klec, která vystřelí míč a rozsvítí cílovou branku | Reakce + přihrávka | Skóre, čas | Princip „signál → reakce → cíl“, který převezmeme bez techniky jako hlas a barva | Není spotřebitelská appka | (obecně známé, bez appky) |
| **HomeCourt** (NEX Team) | iOS; zdarma/předpl. | Kamera iPhonu počítá koše a dribling, drily vedené hráči NBA/WNBA, **audio hodnocení v reálném čase** | Drily, výzvy, rodinné souboje | Skóre, výzvy s rodinou a kamarády | Hlasová zpětná vazba během cviku. Výzvy rodina vs. kamarádi. Rodič: děti dělaly „nudný“ dribling, který dřív vynechávaly. | Kamera a výpočetní nároky, problémy s uloženým videem | https://apps.apple.com/us/app/homecourt-basketball-training/id1258520424 · https://www.sportsbusinessdaily.com/Daily/Issues/2019/03/12/Technology/shot-tracking-homecourt-app-training-drills-feedback-basketball.aspx |

### 1d. Obecná gamifikace pro děti

| Název | Platforma | Co dělá | Gamifikace | Co funguje | Co ne | URL |
|---|---|---|---|---|---|---|
| **Duolingo** | všude | Jazyky | Streak, streak freeze (až 2), ligy, XP, maskot s připomínkami | Data Duolinga: animace prodloužení streaku +1,7 % retence po 7 dnech. Dvě freeze +0,38 % DAU **bez nárůstu volných dnů**. Výslovně uznávají, že rigidní pravidla demotivují a „slack“ pomáhá. | Kritika: úzkost dětí ze ztráty streaku, „guilt marketing“ maskota (děti plakaly), „performativní učení“ (držet číslo, ne učit se). Hlavní appka je podle průvodců pro 5–8 let moc soutěživá. | https://blog.duolingo.com/how-duolingo-streak-builds-habit · https://screenwiseapp.com/guides/duolingo-streaks-and-anxiety-in-kids · https://designbuddy.substack.com/p/is-duolingo-unethical |
| **Khan Academy Kids** | iOS, Android; zdarma | Předškolní a 1.–2. třída | Odměny za dokončení: oblečky postavičkám, odznaky do sbírky | Bez reklam, bez nákupů, bez pay-to-win, bez časovačů, klidné vizuály. Common Sense hodnotí vysoko. | Do 8 let, starší dítě může vnímat jako „pro malé“ | https://www.commonsensemedia.org/app-reviews/khan-academy-kids · https://apps.apple.com/us/app/khan-academy-kids/id1378467217 |
| **Prodigy** (matematika) | web, iOS | RPG souboje s matematikou | Avatary, mazlíčci, prémiové členství | Dětem se hra líbí | **Stížnost k FTC (2021):** prémie se nabízí přímo dětem a vznikají „dvě třídy dětí“. Common Sense kritizuje agresivní členství a frustrující mechaniku. Paywall i na změnu ročníku. | https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02 · https://www.commonsensemedia.org/app-reviews/prodigy-kids-math-game |

---

## 2. Co u 8letých funguje a co ne

### Funguje

1. **Hodnotit snahu a postup, ne talent.** Mueller a Dweck (1998): děti chválené za inteligenci po neúspěchu dřív vzdávaly, méně je to bavilo, volily lehčí úlohy a častěji lhaly o skóre. U dětí chválených za snahu to neplatilo. → Trenér chválí „makal jsi“, „zlepšil ses o 3“, nikdy „jsi talent“.
   https://www.columbia.edu/cu/psychology/courses/3615/Readings/Mueller_Dweck.pdf
2. **Mistrovské klima (srovnání se sebou samým).** U 9–13letých basketbalistů vedlo mistrovské klima k růstu orientace na zvládnutí úkolu. Zvládnutí úkolu souvisí s radostí, zájmem a vytrváním. Trenéry jde naučit takové klima vytvářet.
   https://researchportal.bath.ac.uk/en/publications/effects-of-a-motivational-climate-intervention-for-coaches-on-cha/ · https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5717397/
3. **Osobní rekordy místo žebříčků.** Ruble: mezi 7. a 9. rokem se rodí srovnávání s vrstevníky a dítě ho začíná používat k sebehodnocení. 7–8leté ale ještě víc řeší „zvládám to, co se ode mě čeká“ než pořadí. Soutěžní systémy s málo vítězi vedou k nespokojenosti se sebou. → Srovnávat s vlastním minulým výkonem.
   https://www.frontiersin.org/articles/10.3389/fpsyg.2015.01036/pdf · https://crisp.org.uiowa.edu/sites/crisp.org.uiowa.edu/files/2020-04/crisp10_12.pdf
4. **Co děti na sportu baví (FUN MAPS, Visek):** hlavně snaha, fair play a pozitivní trenér. **Výhra je až na 40. místě**, „swag“ úplně na konci. Kluci víc oceňují **kopírování triků profíků** a zlepšování dovedností. → Strom triků a frajeřinky jsou správná sázka.
   https://shareprogram.gwu.edu/new-study-dispels-myths-about-what-makes-youth-sports-fun-kids · https://sciencedaily.com/releases/2019/11/191114100903.htm
5. **Autonomie, kompetence a sounáležitost (SDT).** Odchod dětí ze sportu souvisí s nízkým pocitem kompetence, autonomie a sounáležitosti. Autonomii podporující trenér zvyšuje radost a snižuje úmysl skončit. → Dát dítěti volbu (který trik, kterou výzvu), viditelný pokrok a hraní s tátou.
   https://www.sciencegate.app/document/10.1017/s1138741600002341 · https://e-space.mmu.ac.uk/633180/1/Elsborg_et_al_European_Journal_of_Sport_Science_2022_e2041100_Accepted_manuscript_.pdf
6. **Rodič jako spoluhráč.** Studie s exergames: zapojení rodiče zlepšuje účinek i vztah rodič–dítě. Staiano: zapojení rodiče bylo „klíčové“. Rodiny spíš soutěžily ve stylu „porovnat se“ než „rozdrtit se“. Důkazy jsou slibné, ale tenké.
   https://hrmars.com/ijarbss/article/view/23039 · https://www.heart.org/en/news/2018/09/11/get-your-exergame-on-to-make-screen-time-more-active · https://arxiv.org/pdf/2105.10731
7. **Gamifikace pohybu má malý, ale reálný efekt.** Metaanalýza RCT (2025, děti a dospívající): MVPA SMD 0,15, efekt trvá i po skončení. Celkový počet kroků se ale nezlepšil. Motivace slábne, když dítě přestane bavit samotná hra. → Obsah (triky, souboje) musí táhnout víc než body.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC12445784/ · https://trepo.tuni.fi/bitstream/10024/117608/2/Gamification_of_physical_activity_2019.pdf
8. **Krátké intervaly a hlasový signál.** Dangle Time (20/10 s) a hlasové hodnocení v HomeCourt. Uživatelé si výslovně žádají zvukový konec cviku, aby nemuseli koukat na displej.
9. **Kosmetické odměny a sbírky bez nákupů** (Khan Kids): oblečky, odznaky, nic za peníze.

### Nefunguje / škodí

1. **Hmotné a očekávané odměny podmíněné výkonem** podkopávají vnitřní motivaci, u školních dětí nejvíc. Slovní pochvala a **nečekané** odměny tento efekt nemají (Deci, Koestner, Ryan).
   https://journals.sagepub.com/doi/10.3102/00346543071001001 · https://www.chicagobooth.edu/review/short-term-rewards-dont-sap-long-term-motivation
2. **Rigidní streak „všechno nebo nic“** a vyčítavé připomínky vyvolávají úzkost a „hraní na číslo“. Duolingo samo přiznává, že pravidlo bez tolerance demotivuje. Lally (2010): jeden vynechaný den tvorbu návyku prakticky nenarušil.
   https://screenwiseapp.com/guides/duolingo-streaks-and-anxiety-in-kids · https://bps.org.uk/research-digest/how-form-habit
3. **Ztráta pokroku po aktualizaci** (FPRO: „update zabil streak“) dítě zdrtí. → Data se nesmí ztratit (persist + záloha) a streak se nesmí přepočítat novou logikou.
4. **Globální žebříčky proti cizím dětem** demotivují slabší a připomínají jim nedostatečnost.
   https://arxiv.org/pdf/2305.08346 · https://universityxp.com/research/2023/11/30/exploring-the-inner-workings-of-the-leaderboard-for-use-in-educational-contexts
5. **Paywall a prodej přímo dítěti** (Prodigy, DribbleUp, SuperDeker): frustrace a pocit nespravedlnosti. U nás odpadá, ale platí i pro „odemykání“: odemykat se má postupem, ne čekáním ani náhodou.
6. **Technika, která selhává** (kamera DribbleUp u dětí pod 10, glitchy SuperDeker). Náš přístup „nic neměří, číslo zadá rodič“ je správně robustní.
7. **Příliš textu a dospělácké UI** (Floorball Drills, Coachen, IntelliGym od 11 let). Pro 8leté musí všechno říct hlas.
8. **Složité nastavení pro víc hráčů** (FPRO). Táta vs. syn musí jít spustit na 2 klepnutí.

---

## 3. Patnáct doporučení pro naši appku

1. **Streak bez stresu: „týdenní lišta“ místo nekonečné série.** Hlavní je týdenní cíl (např. 4 z 7 dní = hvězda týdne), ne počet dní v řadě. Série dní ať je jen vedlejší údaj. Každý týden se začíná znovu, takže prohraný týden nic nebere. (Duolingo slack, Lally)
2. **Automatické „volné dny“.** 1–2 dny v týdnu (víkend, turnaj, nemoc) streak nepřeruší a dítě nic neplatí. Rodič může v sekci Rodiče označit „odpočinek / zápas / nemoc“. Trenér řekne: „Odpočinek je taky trénink.“ Žádné vyčítavé notifikace, appka nikdy nepíše „ztratíš sérii“.
3. **Série se nikdy „nevynuluje“ na nulu bez zbytku.** Kromě aktuální série zobrazovat i „nejdelší série“ a „dnů celkem“. Celkové číslo (jako DangleTime) jen roste a dítě o ně nemůže přijít.
4. **Prohra v souboji = „Odveta!“ s konkrétním pozitivem.** Trenér nikdy neřekne „prohrál jsi“, ale „Táta vyhrál o fous! Dal jsi 4 trefy, to je tvoje nejlepší skóre, odveta zítra?“ Po každém souboji vyzdvihnout osobní zlepšení prohrávajícího. Žádné smutné zvuky ani červená obrazovka.
5. **Handicap pro tátu.** Souboje mají volitelný „hendikep“ (táta slabší rukou nebo bekhendem, víc pokusů pro syna, menší cíl pro tátu), aby byla bilance kolem 50:50. Výhry, které dítě dostává „zadarmo“, odhalí, prohry pořád dokola zabijí motivaci. Appka může hendikep navrhnout podle bilance.
6. **Celková bilance táta vs. syn s „nejlepším výkonem“ obou** a týmovou kooperativní výzvou („spolu dáme 50 trefy tento týden“). Kromě soupeření i spolupráce. Rodiny chtějí porovnávat, ne drtit.
7. **Hodnocení jen vůči sobě.** Testy dovedností ukazují osobní rekord a graf zlepšení (HockeyTracker lekce). Žádný žebříček proti jiným dětem a žádné věkové normy. Formulace: „O 3 víc než minule!“ Pokud se dítě nezlepší, Trenér řekne: „Tvůj rekord pořád platí, dnes rozjezd.“
8. **XP za snahu a odvedený čas, ne za výkon.** XP přibývá za odcvičené minuty, dokončený trénink a pokus o trik. Rekordy a splněné kroky triků dávají odznaky, ne „víc XP“. Hodnosti (přípravka → elévové → … → Superliga) jdou jen nahoru, jako DangleTime.
9. **Odměny ať jsou hlavně nečekané a kosmetické.** Žádné „za 10 tréninků dostaneš…“ jako smlouva. Spíš překvapení: náhodný bonus, karta po tréninku, nový dres nebo barva čepele. Nic, co dítě „dluží“. Rodič nemá v appce vázat skutečné odměny (sladkosti, peníze) na výkon. Do README pro rodiče dát doporučení „chvalte snahu, ne výsledek“. (Deci a kol.)
10. **Chvála procesu ve hláškách.** V `phrases.json` mít sadu pochval typu „makal jsi“, „hlava nahoře, super“, „bekhend už jede líp“, nikdy „jsi génius / talent“. Prohra a chyba = informace („zkus pomaleji“). (Mueller a Dweck)
11. **Strom triků jako hlavní tahák s jasnými, malými kroky.** Kluci chtějí „kopírovat triky profíků“ (FUN MAPS). Každý krok má hlasové kritérium („udržíš míček 5 s“), rodič ho jedním klepnutím odklikne a krok hned dostane oslavu (animace, zvuk, karta). Kroky by měly jít splnit za 1–3 tréninky, aby byl pokrok vidět každý týden.
12. **Volba pro dítě (autonomie).** Na začátku tréninku nechat vybrat ze 2–3 možností („Dnes frajeřinka, souboj, nebo trénink od Trenéra?“), u výzvy dne nabídnout „jinou“. Dítě si vybírá i vzhled (dres, číslo). (SDT)
13. **Reakční režim podle SuperDeker a Footbonautu, ale bez senzorů:** Trenér zavolá barvu nebo číslo kuželu, obrazovka se rozsvítí v barvě kuželu (čitelné ze 3 m). Úroveň zvyšuje tempo, ne počet chyb. Skóre si nepočítá appka, rodič maximálně zadá „trefy“.
14. **Krátké bloky a hlas všude.** Cvik 20–45 s, pauza 10–15 s, výzva dne 1–3 minuty. Konec cviku a výsledek vždy hlasem a zvukovým signálem (Dangle Time lekce), během tréninku žádný text k přečtení. Celý trénink 10–15 minut s viditelným ukazatelem „ještě 2 cviky“.
15. **Pokrok je posvátný.** Nikdy neměnit pravidla tak, aby zpětně ubrala XP, sérii nebo karty (FPRO lekce). Migrace dat při aktualizaci testovat. Žádné časově omezené odměny, které „propadnou“ (FOMO). Připomínku zálohy dát rodiči, ne dítěti.

### Bonus: čemu se vyhnout (checklist pro designera a QA)
- Žádný maskot nebo Trenér, který vyčítá, je smutný nebo „pláče“ kvůli vynechanému dni.
- Žádné odpočty „poslední šance“, žádné propadající odměny.
- Žádná loot-box náhoda, kterou by šlo opakovat „ještě jednou“ (karty náhodně jen 1× po tréninku).
- Žádné červené „PROHRA“, žádné porovnání s cizími dětmi.
- Souboj jde spustit nejvýš na 2 klepnutí, počítadlo „trefa / vedle“ je ovladatelné jednou rukou.

---

## 4. Mezery v rešerši
- HockeyShot, Bauer a Sniper's Edge nemají samostatnou tréninkovou appku (jen hardware nebo e-shop). „Floorball Coach“ a fotbalová „Beyond“ nejsou dohledatelné.
- Appky jsem neinstaloval. Popis vychází z obchodů a recenzí. Plný text metaanalýzy (PMC12445784) byl za captchou, čísla jsou z abstraktu.
- Výzkum rodiče jako spoluhráče je zatím tenký (malé studie, pilotní data).
