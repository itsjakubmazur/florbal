# Design audity (unslop)

Postup: `.claude/skills/unslop/SKILL.md` + `references/signs.md`. Směr je potvrzený v `docs/DESIGN.md` (krok „směr“ bez čekání).
Snímky: `img/<obrazovka>-land.png` (1180 × 820) a `-port.png` (820 × 1180), `?demo`, produkční build (`vite preview`).
`img/before-*` = stav na konci M3 (limetka × azurová, Inter). Rozsah M4 základ: všechny hlavní obrazovky měly „heavy slop“
ve stejných vrstvách (barva bez světa, tučné 800 nadpisy, zvýrazněné slovo v nadpisu, nálepky nad nadpisy, „A · B“ řetězce,
vykřičníky), proto proběhl plný postup v 9 průchodech přes sdílené tokeny a komponenty a pak úpravy po obrazovkách.

| Obrazovka | Audit |
| --- | --- |
| Úvod | [intro.md](intro.md) |
| Výběr hráče | [profiles.md](profiles.md) |
| Domov | [home.md](home.md) |
| Postav stanoviště | [setup.md](setup.md) |
| Přehrávač | [player.md](player.md) |
| Výsledek | [result.md](result.md) |
| Nastavení hráče | [newPlayer.md](newPlayer.md) |
| Rodiče | [parent.md](parent.md) |
| Cviky a Stanoviště | [library.md](library.md) |
| Odměny | [rewards.md](rewards.md) |
| Moje cesta | [levels.md](levels.md) |
| M4: sdílené vrstvy (m4.css, karty, graf) | [m4-shared.md](m4-shared.md) |
| Souboje a frajeřinky (rozcestník) | [arena.md](arena.md) |
| Souboje: seznam, nastavení, bezpečnost, průběh, historie, vlastní výzva | [duels.md](duels.md) |
| Frajeřinky: strom a krok triku | [tricks.md](tricks.md) |
| Testy dovedností | [skilltests.md](skilltests.md) |
| Album karet a odhalení karty | [cards.md](cards.md) |
| Zápas | [match.md](match.md) |

Druhé kolo (M5): knihovna, stanoviště, odměny, Moje cesta a obrazovky M4. `img/before-*` u nich = stav na konci M4.
Reakce, samostatná rozcvička a protažení nemají vlastní obrazovku (používají Postav stanoviště a Přehrávač).
Obličeje „Jak se ti to líbilo?“ na Výsledku dostaly jen sdílené mezery z `m4.css`; vlastní audit nemají.
