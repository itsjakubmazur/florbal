// Generátor obsahu: node scripts/content/build.mjs → src/content/*.json + research/drill-database.json + DRILL-DATABASE.md
import fs from 'node:fs';
import { stations } from './stations.mjs';
import { drills } from './drills.mjs';
import { tricks, challenges, skilltests, cards } from './extras.mjs';
import { rows, REASONS } from './dbrows.mjs';
import { srcFor } from './sources.mjs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROOT = REPO + '/research';
const OUT = REPO + '/src/content'; // obsah appky se generuje odsud – needitovat JSON ručně
fs.mkdirSync(OUT, { recursive: true });
const w = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');

w(OUT + '/stations.json', stations);
w(OUT + '/drills.json', drills);
w(OUT + '/tricks.json', tricks);
w(OUT + '/challenges.json', challenges);
w(OUT + '/skilltests.json', skilltests);
w(OUT + '/cards.json', cards);

// ---- rešeršní databáze ----
const refs = {};
const addRef = (o, kind, id) => { (refs[o] ||= []).push(`${kind}:${id}`); };
for (const d of drills) for (const o of d.origin) addRef(o, 'drill', d.id);
for (const t of tricks) for (const o of t.origin) addRef(o, 'trick', t.id);
for (const c of challenges) for (const o of c.origin) addRef(o, 'challenge', c.id);
for (const t of skilltests) for (const o of t.origin) addRef(o, 'test', t.id);

const FOUL = new Set(['CH-04', 'CZ-11', 'CZ-12', 'CZ-13', 'CZ-38', 'T04', 'T05', 'T06', 'T18', 'C04', 'C09', 'H51', 'C17']);
const minAge = (l) => (l <= 2 ? 6 : l === 3 ? 7 : 8);
const problems = [];
const db = rows.map(([origin, name, category, level, bladeSide, grip, noise, kind, principle, reason]) => {
  const r = refs[origin] || [];
  const inApp = r.length > 0;
  if (!inApp && !reason) problems.push(`${origin}: není v appce a chybí důvod`);
  const drillRef = r.find((x) => x.startsWith('drill:'));
  const ad = drillRef ? drills.find((d) => d.id === drillRef.slice(6)) : null;
  const sources = srcFor([origin]);
  const conf = sources.some((s) => s.reliability === 'ověřené') ? 'ověřené' : 'odvozené';
  return {
    id: origin.toLowerCase(), origin, name, principle, level, minAge: minAge(level), category,
    bladeSide: bladeSide === '–' ? 'obě' : bladeSide, grip,
    setupId: ad ? ad.setupId : null, pattern: ad ? ad.pattern : null, loop: ad ? ad.loop : null,
    callMode: ad ? ad.callMode : null, tempoBpm: ad ? ad.tempoBpm : null, durationSec: ad ? ad.durationSec : null, reps: null,
    spaceNeeded: ad ? ad.spaceNeeded : null, noise, equipment: ad ? ad.equipment : [],
    voiceIntro: ad ? ad.voiceIntro : null, coachingPoints: ad ? ad.coachingPoints : [], commonMistakes: ad ? ad.commonMistakes : [],
    progression: null, regression: null,
    safetyNotes: ad ? ad.safetyNotes : (FOUL.has(origin) ? 'Míček nad koleny: jen domácí frajeřinka, v zápase faul. Hůl pod pasem.' : 'Hůl pod pasem, kolem volno.'),
    sources, confidence: conf, kind, matchLegal: !FOUL.has(origin),
    inApp, inAppAs: r, notInAppReason: inApp ? null : REASONS[reason] || reason,
  };
});
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
w(ROOT + '/drill-database.json', db);

// ---- MD ----
const esc = (s) => String(s ?? '').replace(/\|/g, '/');
const groups = [
  ['CH', 'Švýcarsko (J+S Kids, swiss unihockey)'], ['FI', 'Finsko (Salibandyliitto, Tamminen)'], ['SE', 'Švédsko (SIU, kluby)'],
  ['CZ', 'Česko (závěrečné práce, metodika ČFbU)'], ['SO', 'IFF / Special Olympics'], ['MF', 'My Floorball'],
  ['H', 'Hokej (USA Hockey, Hockey Canada, skills trenéři)'], ['T', 'Triky (sociální sítě)'], ['C', 'Výzvy a souboje (sociální sítě)'],
  ['CR', 'Doplněk: UP Olomouc, JČU, övningsbanken, My Floorball'],
];
let md = `# Databáze cvičení (rešerše)\n\nStrojová verze: \`research/drill-database.json\` (${db.length} záznamů). Přehratelné cviky pro appku: \`research/content-draft/drills.json\` (${drills.length}).\n`;
md += `Každý záznam je princip z rešerše převyprávěný vlastními slovy. \`inApp\` říká, kde je záznam v appce použitý (cvik, trik, výzva, test). U ostatních je důvod, proč zatím ne.\n\n`;
const nIn = db.filter((d) => d.inApp).length;
md += `**Souhrn:** ${db.length} záznamů, v appce použito ${nIn}, mimo appku ${db.length - nIn}. Ověřené zdroje: ${db.filter((d) => d.confidence === 'ověřené').length}.\n\n`;
md += 'Sloupce: Úr. = úroveň 1–5, Strana = strana čepele, Zápas = povolené v zápase (ano / jen doma).\n\n';
for (const [pre, title] of groups) {
  const list = db.filter((d) => d.origin.replace(/[-\d]+$/, '') === pre);
  md += `## ${title} (${list.length})\n\n| ID | Název | Kategorie | Úr. | Strana | Hluk | Zápas | Spolehl. | V appce | Princip / důvod | Zdroj |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const d of list) {
    md += `| ${d.origin} | ${esc(d.name)} | ${d.category} | ${d.level} | ${d.bladeSide} | ${d.noise} | ${d.matchLegal ? 'ano' : 'jen doma'} | ${d.confidence} | ${d.inApp ? esc(d.inAppAs.join(', ')) : 'ne'} | ${esc(d.principle)}${d.inApp ? '' : ' *Proč ne: ' + esc(d.notInAppReason) + '*'} | ${d.sources.map((s, i) => `[${i + 1}](${s.url})`).join(' ')} |\n`;
  }
  md += '\n';
}
md += `## Přehratelné cviky v appce (${drills.length})\n\n| id | Název | Druh | Úr. | Kategorie | Strana | Stanoviště | Povel | BPM | s | Hluk | Původ |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const d of drills) md += `| ${d.id} | ${esc(d.name)} | ${d.kind} | ${d.level} | ${d.category} | ${d.bladeSide} | ${d.setupId} | ${d.callMode} | ${d.tempoBpm} | ${d.durationSec} | ${d.noise} | ${d.origin.join(', ')} |\n`;
fs.writeFileSync(ROOT + '/DRILL-DATABASE.md', md);
console.log('db', db.length, 'inApp', nIn, 'drills', drills.length, 'tricks', tricks.length, 'challenges', challenges.length, 'tests', skilltests.length, 'cards', cards.length);
