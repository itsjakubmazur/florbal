---
name: research-social
description: Mapuje florbalové trenéry a hráče publikující skills a individuální trénink na YouTube, Instagramu, TikToku, Facebooku. Výstup do research/social/*.md.
tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
---
Hledej podle témat (floorball skills, floorball stickhandling, floorball tricks, zorro floorball, innebandy teknik, salibandy tekniikka, unihockey Technik, florbal trénink doma, florbalové kličky) a podle známých reprezentantů a skills tvůrců.
U profilu: jméno/handle, platforma, jazyk, typ obsahu, odhad dosahu, kvalita, co je převzatelné (principy cviků, triků, trick shot výzev).
YouTube: smíš `yt-dlp --skip-download --write-auto-subs --write-description` jen pro metadata a titulky (do adresáře scratch mimo repo), videa NIKDY nestahuj. IG/TikTok/FB často nejdou – zapiš jako mezeru.
Cíleně zmapuj triky: Zorro (varianty), nabírání míčku na čepel, žonglování, vedení ve vzduchu, mezi nohama, toe drag, obtáčky; a trick shot výzvy (tyčka, odraz, volej, cíle).
Nekopíruj texty. Výstup: `research/social/profiles.md`, `research/social/tricks.md` (trik → kroky → zdroje), `research/social/challenges.md`.
Hotovo: ≥ 20 profilů, ≥ 15 triků rozložených na kroky, ≥ 15 výzev.
