# Florbal Trenér

Domácí florbalový trénink s hlasovým Trenérem pro malého florbalistu. PWA pro iPad (Safari → Sdílet → „Přidat na plochu“), funguje offline.

Trenér hlasem a velkým povelem na obrazovce říká, kam s míčkem a kterou stranou čepele (forhend / bekhend). Appka ukazuje
stanoviště z kuželů shora, hůl a míček, hlídá tempo metronomem a za trénink dává XP, hvězdičky a odměny.

> Vychází z otevřeného projektu [Tréninková podložka](https://github.com/kuba-uhlir/treninkova-podlozka) od Jakuba Uhlíře (MIT).
> Z reference je převzatý jen kód, ne grafika ani hlasy. Licence: `LICENSE`, zdroje: `LICENSES.md`.

## Vývoj
```
npm install
npm run dev        # http://localhost:5173  (?demo = ukázkový hráč)
npm run build      # statický build do dist/ (service worker, manifest)
npm test           # Playwright (iPad na šířku i na výšku, iPhone)
npm run check      # validace drills.json / stations.json / phrases.json
```

## Nasazení
Statický web z `dist/` (`vercel.json`: build `npm run build`, výstup `dist`, hlavičky pro `sw.js` a assety). Žádné serverové funkce,
jde to přesunout na jakýkoli statický hosting.

Poprvé: `bash scripts/setup-deploy.sh` (soukromé GitHub repo + Vercel). Potom stačí `git push` do `main`.

## Pro rodiče
Instalace na iPad, první spuštění, stanoviště, bezpečnost, zálohy a řešení problémů: **[docs/INSTALL.md](docs/INSTALL.md)**.

Hlasy Trenéra se předgenerují příkazem `node scripts/gen-voices.mjs` (po změně textů v `phrases.json`, `drills.json` nebo `stations.json`;
existující soubory přeskočí). Stav projektu: `docs/STATUS.md`, nápady mimo zadání: `IDEAS.md`.
