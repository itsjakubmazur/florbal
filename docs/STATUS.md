# Stav projektu

| Milník | Stav |
|---|---|
| M0 Založení | hotovo |
| M1 Rešerše | běží / viz research/ |
| M2 Databáze cvičení | čeká na drill-designer (drills.json má zatím 8 ukázkových cviků + rozcvička + protažení) |
| M3 Jádro PWA | **kód hotový** (engineer), čeká na QA na iPadu a nasazení |
| M4 Obsah a hra | – |
| M5 QA a předání | – |

## M3 – co funguje
- PWA: manifest (cs, standalone, ikony 192/512/maskable, apple-touch-icon), service worker (precache vše vč. audia), offline, update flow s pruhem (nikdy během tréninku), `vercel.json`.
- Audio pro iOS (jeden AudioContext, odemčení gestem, AudioBuffer hlášky, fronta call/phrase/urgent, TTS záloha), metronom look-ahead na hodinách audia, pauza při přechodu do pozadí.
- Wake lock (API + znovuzískání, záloha videem NoSleep).
- IndexedDB `florbal` (8 stores), `storage.persist()`, export/import zálohy v Rodičích.
- StationView: palubovka, kužely s čísly a barvami, domeček, hráč, hůl s čepelí F/B, míček, šipka, oblouky, zrcadlení pro leváka.
- 5 stanovišť s návodem na postavení (krok po kroku + hlas), přehrávač (ukázka → 3-2-1 → tempo → odpočinek → výsledek), skládání tréninku podle úrovně, prostoru, kuželů, slabší strany, tichého režimu.
- Profil (průvodce: jméno, věk, držení hole s obrázkem, úroveň, délka, prostor, kužely, dres), Rodiče (PIN, zvuk, hlasitosti, tichý trénink, tempo, vzhled, hráči, záloha, úložiště, verze).
- Florbalové hodnosti (Minipřípravka → Legenda), odměny, týdenní lišta, výzva dne.
- Testy: `npm test` (15 testů, 3 viewporty) a `node scripts/check-content.mjs` procházejí.

## Otevřené (M3)
- Ověřit na reálném iPadu: docs/QA.md „Nutno ověřit na iPadu“.
- Nasazení na Vercel + soukromé GitHub repo (vyžaduje účet rodiče).
- Hlasové soubory zatím nevygenerované (`node scripts/gen-voices.mjs`), mluví hlas zařízení.

## Další (M4)
- drill-designer: plná databáze cviků do `src/content/drills.json` (schéma SPEC + D14, validátor `scripts/check-content.mjs`).
- Souboje a frajeřinky, karty dovedností, testy dovedností, téma Hattrick, finální vzhled (designer + unslop), hlasy (voice-audio).
