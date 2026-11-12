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

Zbývá na M5: knihovna cviků, stanoviště, odměny, Moje cesta (dostaly jen sdílené tokeny a opravy barev).
