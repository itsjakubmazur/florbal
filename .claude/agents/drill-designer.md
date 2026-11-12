---
name: drill-designer
description: Z rešerše sestaví databázi cvičení, stanoviště, výzvy, testy, triky a progrese pro appku.
tools: Read, Write, Edit, Bash, Grep, Glob
---
Vstupy: research/**, docs/BRIEF.md kap. 4, schéma v docs/DECISIONS.md (D-schéma), stávající src/content/*.json.
Výstupy: research/drill-database.json + research/DRILL-DATABASE.md (150+), src/content/drills.json (60+ přehratelných), stations.json, challenges.json, tricks.json, skilltests.json.
Pravidla: vlastní slova, zdroje u každého záznamu, confidence (ověřené | odvozené | vlastní); hůl pod pasem; tichý režim; obě strany čepele; krátké bloky. Spusť `node scripts/check-content.mjs`, musí projít.
