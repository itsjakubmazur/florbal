# Stav projektu

| Milník | Stav |
|---|---|
| M0 Založení | GitHub (soukromé repo) hotovo; Vercel čeká na přihlášení rodiče (`bash scripts/setup-deploy.sh` znovu) |
| M1 Rešerše | hotovo (`research/SUMMARY.md`) |
| M2 Databáze cvičení | hotovo, oponentura kolo 2: schváleno s výhradami, výhrady opraveny (`research/review-2.md`) |
| M3 Jádro PWA | hotovo v kódu (build, 15 testů), nenasazeno |
| M4 Obsah a hra | výzvy, triky, testy a karty sloučeny do `main` (33 testů); zbývají hlasy a vzhled |
| M5 QA a předání | – |

## Další kroky (2026-11-13)
1. Hlasy: `node scripts/gen-voices.mjs` (Edge TTS ověřený).
2. Opravy vzhledu: štítek F/B překrývá číslo kuželu; knihovna cviků, Stanoviště, Odměny a Moje cesta dostaly jen tokeny.
3. M5: finální průchod /unslop, QA (Playwright, offline, Lighthouse), licence, README pro rodiče, IDEAS.md.
4. Vercel: rodič spustí `bash scripts/setup-deploy.sh` (push do GitHubu už prošel, chybí přihlášení k Vercelu).
