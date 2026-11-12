# Technický rozbor reference (Tréninková podložka, Jakub Uhlíř, MIT)

Zdroj: `reference/` (klon https://github.com/kuba-uhlir/treninkova-podlozka). Vanilla JS (~4,4 tis. řádků), Vite 5, Tailwind 3,
IndexedDB, Capacitor 6 (Android/Android TV), hlasy z Edge TTS.

## Moduly
| Vrstva | Soubory | Co dělá |
|---|---|---|
| core | `router.js` | zásobník obrazovek, `go(name, params, {replace})`, `back()`; obrazovka = funkce vracející DOM prvek |
| core | `focus.js` | prostorová navigace D-padem (TV), `onBack` handler; dotyk jde přes běžné `click` |
| core | `audio.js` | hlášky (HTMLAudio, předgenerované WAV), fronta „nikdy neusekávat“, TTS záloha, efekty, hudba, režim hlas/pípání/ticho |
| storage | `index.js` | IndexedDB `fotbal` (profiles, history, settings), async `get/put/remove/list/clear`, `settings.load/save` |
| domain | `trainer.js` | vážený los cviků (úroveň, dominantní noha, slabší ≤ 20 %), tempo podle levelu, `beatMs` |
| domain | `xp.js`, `rewards.js`, `extras.js`, `profiles.js` | XP a 12 hodností, ~70 odměn ze statistik historie, týdenní lišta, výzva dne, rozcvička, karty (balíček po tréninku) |
| config | `mats.js`, `teams.json` | podložky (SVG cesty, zóny 1–6), týmy s barvami a logy |
| ui | `MatView.js` (~500 ř.), `CardView`, `dom.js`, `theme.js`, `faces.js` | SVG podložka s chodidly a míčem, karty hráčů (rámečky z obrázků), dresy, téma podle týmu |
| screens | intro, profiles, newPlayer, home, drills, player, result, warmup, match, cards, rewards, levels, parent, about | obrazovky |
| scripts | gen-voices, trim-voices, make-sounds, build-art, fetch-cards… | Edge TTS, ořez WAV, syntéza efektů, Gemini grafika, fotky z Commons |

## Tok dat
Profil (IndexedDB) → `home` → `buildWorkout(min, level, mat, difficulty, hand)` → (`warmup`) → `player` → `result`
(`addHistory`, XP do profilu, `statsOf(history)` → nově odemčené odměny, balíček karet) → `home`.
Nastavení (PIN, hlasitost, režim hlasu, tempo, délka) v `settings` store pod `id: 'main'`.

## Přehrávač
Fáze `preview` (ukázka 2× pattern, min. 6 s, čeká na dozvučení věty max. +7 s) → `countdown` (3-2-1, `urgent`) → `play`
(úder = `60000 / (bpm × tempoMul)`, každý úder zvýrazní zónu a nahlásí ji) → `rest` (15 s) → další cvik → `result`.
Časování: `setInterval(80 ms)` s `dt` z `performance.now()` – úder se pozná dělením uplynulého času, takže nedriftuje celkově,
ale jednotlivé údery mají jitter až 80 ms a pípání jde přes HTMLAudio (na iOS nepřesné). OK = pauza, Back = menu.

## Audio fronta
Jedna hláška najednou (`cur`), fronta `queue` (max. 2 věty), mezera 120 ms. `call` se přeskočí, když něco zní; `phrase` čeká;
`urgent` předběhne frontu. Konec hlášky = událost `ended` (+ pojistka 15 s). Délka WAV = délka řeči (ořez skriptem).

## XP a odměny
10 XP za cvik + 20 za celý trénink, hvězdy podle podílu dokončených cviků. Level nastavuje rodič, XP jen odemyká odměny.
Odměny = `{unit, need}` nad statistikami (tréninky, série dnů, minuty, cviky, slabší noha, karty, výzvy).

## Co přebíráme / měníme / mažeme
| | |
|---|---|
| **Přebíráme** | router, focus (nevolaný, pro TV), princip audio fronty, PIN rodičů, skládání váženým losem, XP/odměny/týden/výzva dne, struktura obrazovek |
| **Měníme** | audio → jeden `AudioContext` + `AudioBuffer` (iOS), metronom look-ahead na hodinách audia; přehrávač → StationView, callMode, pauza tapem, wake lock; IndexedDB `florbal` s 8 stores + záloha JSON; trénink podle prostoru, výbavy a strany čepele; hodnosti florbalové a podle XP; vzhled přes tokeny (CSS proměnné) |
| **Mažeme** | Capacitor/Android, podložky (`mats`), týmy a loga, fotky hráčů a karty, fotbalové hlášky a texty, Gemini grafika (`img/art`), zápas na podložce (M4 postaví florbalové souboje), skripty pro fotbalové assety |
