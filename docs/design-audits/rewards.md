# Odměny – unslop audit (M5)

Před: `img/before-rewards-land.png` · Po: `img/rewards-land.png`, `img/rewards-port.png`

## Směr
DESIGN.md. Moment: kov odměny (`--tier-*`, skutečné kovy) – jediná barva na obrazovce.

## Nálezy
- Dvojí zvýraznění: získaná odměna měla kovový kruh i modrou kartu `card.on` – nic nevyniklo.
- Nadpis „Odměny 5 z 46“ míchal název a číslo; kontext „210 XP, 3 tréninků“ (špatné skloňování).
- Postup jen jako „210 / 300 XP“ – osmiletý čte lomítko hůř než lištu.
- Inline styly a `u(0.6)` mezery, `max(44px, …)` ikona menší než u výsledku.

## Co změněno
1. Mezery na `--sp-*`, karty jednotné výšky v mřížce.
2. Barva: karta vždy tichá (`--surface`), barvu nese jen kov; zamčená odměna má tlumenou ikonu.
3. Ikony: beze změny sady (Lucide), velikost 56 px+.
4. Text: nadpis „Odměny“, kontext „Máš 5 z 46, 210 XP a 3 tréninky“ (skloňování), sekce „Za XP, 2 z 8“.
5. Typo: název 600, čísla `--fs-small` tlumeně.
6–7. Postup: tenká lišta `.bar` v `--brand-hi` + „210 z 300 XP“; získané „Získáno“ v `--text-2`.
8–9. Bez nového vizuálu a pohybu.
