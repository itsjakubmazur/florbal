import fs from 'node:fs';
// Kontrola referencí a požadavků obsahu: node scripts/content/check-refs.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const J = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const MAP = { 'drill-database.json': 'research/drill-database.json' };
for (const k of ['stations', 'drills', 'tricks', 'challenges', 'skilltests', 'cards']) MAP[`content-draft/${k}.json`] = `src/content/${k}.json`;
const files = Object.keys(MAP);
const D = Object.fromEntries(files.map((f) => [f, J(MAP[f])]));
const err = []; const info = [];
const E = (m) => err.push(m);
const st = D['content-draft/stations.json'];
 const dr = D['content-draft/drills.json'];
const tr = D['content-draft/tricks.json']; const ch = D['content-draft/challenges.json'];
const te = D['content-draft/skilltests.json']; const ca = D['content-draft/cards.json']; const db = D['drill-database.json'];

// unikátní id napříč typy
// --- zakázaná slova: absolutní strany se pro leváka nezrcadlí (oponentura N-01), žádné „švihni“ (N-07)
const SIDE = /(?<!\p{L})(vlevo|vpravo|doleva|doprava|nalevo|napravo|zleva|zprava|lev[ýáéoíh]\p{L}*|prav[ýáéoíh]\p{L}*|levák\p{L}*|pravák\p{L}*)(?!\p{L})/iu;
const SWING = /švihn|švihem/iu;
const txt = (o, keys) => keys.flatMap((k) => (Array.isArray(o[k]) ? o[k] : [o[k]])).filter((x) => typeof x === 'string');
const scan = (where, list) => { for (const t of list) { if (SIDE.test(t)) E(`${where}: strana v textu „${t}“`); if (SWING.test(t)) E(`${where}: švih v textu „${t}“`); } };
const DKEYS = ['name', 'voiceIntro', 'coachingPoints', 'commonMistakes', 'safetyNotes', 'equipment'];
const all = [...dr.map((x) => x.id), ...tr.map((x) => x.id), ...tr.flatMap((t) => t.steps.map((s) => s.id)), ...ch.map((x) => x.id), ...te.map((x) => x.id), ...ca.map((x) => x.id)];
const seen = new Set(); for (const id of all) { if (seen.has(id)) E('duplicitní id ' + id); seen.add(id); }
const dbIds = new Set(); for (const d of db) { if (dbIds.has(d.id)) E('db dup ' + d.id); dbIds.add(d.id); }

// cviky
const ids = new Set(dr.map((d) => d.id));
const sentences = (t) => (t.match(/[.!?](\s|$)/g) || []).length;
for (const d of dr) {
  scan(d.id, txt(d, DKEYS));
  if (d.callMode === 'směr' && d.tempoBpm > 70) E(`${d.id} směr nad 70 BPM (${d.tempoBpm})`);
  if (['zóna', 'barva'].includes(d.callMode) && d.tempoBpm > 50) E(`${d.id} ${d.callMode} nad 50 BPM`);
  for (const p of d.pattern) if (p.beats != null && (!Number.isInteger(p.beats) || p.beats < 2)) E(`${d.id} beats`);
  if (d.confidence === 'ověřené') { const strong = d.sources.filter((x) => x.reliability === 'ověřené'); if (!(strong.length >= 2 || strong.some((x) => /metodika|VŠ práce|pravidla|svaz/.test(x.type)))) E(`${d.id} ověřené bez 2 zdrojů / metodiky`); }
  if (d.sources.some((x) => x.type === 'video' && x.reliability === 'ověřené')) E(`${d.id} video jako ověřené`);
  if (d.noise === 'tichý' && d.kind === 'ball' && !d.equipment.some((e) => /měkký|pěnov/.test(e))) E(`${d.id} tichý bez měkkého míčku`);
  if (d.progression && !ids.has(d.progression)) E(`${d.id} progression`);
  if (d.regression && !ids.has(d.regression)) E(`${d.id} regression`);
  if (sentences(d.voiceIntro) > 2) E(`${d.id} voiceIntro má ${sentences(d.voiceIntro)} vět`);
  if (d.coachingPoints.length < 2 || d.coachingPoints.length > 3) E(`${d.id} coachingPoints ${d.coachingPoints.length}`);
  if (d.kind !== 'stretch' && (d.durationSec < 20 || d.durationSec > 45)) E(`${d.id} durationSec ${d.durationSec}`);
  if (!d.sources.length) E(`${d.id} bez zdroje`);
  if (d.kind === 'ball' && !d.commonMistakes.length) E(`${d.id} bez commonMistakes`);
  if (d.noise === 'tichý' && /střel|vystřel/i.test(d.voiceIntro)) E(`${d.id} tichý se střelbou`);
  if (!/pod pas|nad pas|nad hlav|na zem|stranou|mimo|ulož/i.test(d.safetyNotes)) E(`${d.id} safety bez pravidla hole`);
  if (d.bladeSide === 'forhend' && d.pattern.some((p) => p.blade === 'bh')) E(`${d.id} fh/bh`);
  if (d.bladeSide === 'bekhend' && d.pattern.some((p) => p.blade === 'fh')) E(`${d.id} bh/fh`);
}
const cnt = (f) => dr.filter(f).length;
const req = {
  'celkem přehratelných ≥60': [dr.length, 60],
  'ball ≥ 40': [cnt((d) => d.kind === 'ball'), 40],
  'nobal ≥6': [cnt((d) => d.kind === 'nobal'), 6],
  'stretch ≥4': [cnt((d) => d.kind === 'stretch'), 4],
  'spot ≥20 (tichý)': [cnt((d) => d.setupId === 'spot' && d.noise === 'tichý' && d.kind !== 'stretch'), 20],
  'spot ball tichý': [cnt((d) => d.setupId === 'spot' && d.noise === 'tichý' && d.kind === 'ball'), 20],
  'reakce/barva ≥8': [cnt((d) => ['náhodná reakce', 'barva'].includes(d.callMode)), 8],
  'stanoviště 5': [st.length, 5], 'výzvy ≥20': [ch.length, 20], 'triky ≥12': [tr.length, 12], 'testy ≥6': [te.length, 6], 'karty ≥30': [ca.length, 30], 'db ≥150': [db.length, 150],
};
for (const [k, [v, min]] of Object.entries(req)) { info.push(`${k}: ${v}`); if (v < min) E(`nesplněno ${k}: ${v}`); }
for (let l = 1; l <= 5; l++) { const n = cnt((d) => d.level === l && d.kind === 'ball'); info.push(`úroveň ${l}: ${n}`); if (!n) E('chybí úroveň ' + l); }
for (const c of ['vedení míčku', 'kličky', 'kolem kuželů', 'tahy', 'jednoruč', 'reakce', 'práce nohou', 'kombinace']) { const n = cnt((d) => d.kind === 'ball' && d.category === c); info.push(`kat. ${c}: ${n}`); if (!n) E('chybí kategorie ' + c); }
const ball = dr.filter((d) => d.kind === 'ball');
info.push(`strana: obě ${ball.filter((d) => d.bladeSide === 'obě').length}, forhend ${ball.filter((d) => d.bladeSide === 'forhend').length}, bekhend ${ball.filter((d) => d.bladeSide === 'bekhend').length}`);
const steps = ball.flatMap((d) => d.pattern); info.push(`kroky fh ${steps.filter((p) => p.blade === 'fh').length} / bh ${steps.filter((p) => p.blade === 'bh').length}`);

// triky
const spot = st.find((s) => s.id === 'spot'); const sc = new Set(spot.cones.map((c) => c.n));
const tid = new Set(tr.map((t) => t.id));
const REL = ['fh', 'bh', 'front', 'back', 'between', 'home'];
for (const t of tr) {
  const tsc = new Set((st.find((x) => x.id === t.setupId) || spot).cones.map((c) => c.n));
  scan(t.id, [t.name, t.safety, t.matchNote, ...t.steps.flatMap((x) => [x.name, x.howTo, x.criterion, x.voice])]);
  if (!t.setupId || !Array.isArray(t.spaceNeeded) || !Array.isArray(t.equipment)) E(`${t.id} chybí setupId/spaceNeeded/equipment`);
  for (const r of t.requires) if (!tid.has(r)) E(`${t.id} requires ${r}`);
  if (t.steps.length < 3 || t.steps.length > 6) E(`${t.id} kroků ${t.steps.length}`);
  if (typeof t.matchLegal !== 'boolean') E(`${t.id} matchLegal`);
  if (!t.sources.length) E(`${t.id} bez zdroje`);
  for (const s of t.steps) {
    for (const k of ['id', 'name', 'howTo', 'criterion', 'voice']) if (!s[k]) E(`${s.id} chybí ${k}`);
    if (!Array.isArray(s.animation) || !s.animation.length) E(`${s.id} animace`);
    for (const p of s.animation) {
      const m = /^around:(\d)$/.exec(String(p.at));
      if (Number.isInteger(p.at)) { if (!tsc.has(p.at)) E(`${s.id} kužel ${p.at}`); }
      else if (m) { if (!tsc.has(+m[1]) || !['cw', 'ccw'].includes(p.dir)) E(`${s.id} around`); }
      else if (!REL.includes(p.at)) E(`${s.id} at ${p.at}`);
      if (p.blade && !['fh', 'bh'].includes(p.blade)) E(`${s.id} blade`);
    }
  }
}
// stanoviště: tablet v návodu, nic nad pas
for (const x of st) {
  if (!x.setupSteps.some((k) => /Tablet/.test(k.text))) E(`${x.id}: návod neříká, kam tablet`);
  for (const k of x.setupSteps) if (/rozpaž|nad hlav/i.test(k.text)) E(`${x.id}: hůl nahoru v návodu`);
}
if (!st.find((x) => x.id === 'spot').setupSteps.some((k) => /měkký|pěnov/.test(k.text))) E('spot: návod bez měkkého míčku');
// cykly
const req2 = Object.fromEntries(tr.map((t) => [t.id, t.requires]));
const visit = (id, stack = []) => { if (stack.includes(id)) { E('cyklus ' + stack.join('>')); return; } for (const r of req2[id] || []) visit(r, [...stack, id]); };
tr.forEach((t) => visit(t.id));
// výzvy
const TYPES = ['tyčka', 'odraz', 'volej', 'cíl', 'žonglování', 'slalom', 'kohout', 'vlastní'];
for (const c of ch) {
  scan(c.id, [c.name, c.rules, c.voiceIntro, c.safety, c.homeOnlyLine, ...(c.handicap || [])]);
  if (/brankář/i.test(c.rules + c.safety) && !/bez brankáře|brýl|mask/i.test(c.rules + c.safety)) E(`${c.id} brankář bez ochrany`);
  if (/stř[ei]l/i.test(c.rules) && /\b[12] metr/.test(c.rules)) E(`${c.id} střelba pod 3 m`);
  if (!TYPES.includes(c.type)) E(`${c.id} type`);
  if (!['pokusy', 'čas', 'do-x', 'série'].includes(c.format)) E(`${c.id} format`);
  if (!['trefy', 'čas', 'počet'].includes(c.scoring)) E(`${c.id} scoring`);
  if (c.format === 'pokusy' && !Number.isInteger(c.attempts)) E(`${c.id} attempts`);
  if (c.format === 'do-x' && !Number.isInteger(c.target)) E(`${c.id} target`);
  if (!c.matchLegal && !c.homeOnlyLine) E(`${c.id} chybí hláška`);
  if (!c.matchLegal && !/frajeřinka/.test(c.voiceIntro)) E(`${c.id} voiceIntro bez frajeřinky`);
  if (!c.sources.length || !c.safety || !c.voiceIntro || !c.rules) E(`${c.id} neúplné`);
}
for (const t of te) {
  if (!['počet', 's'].includes(t.unit) || !['higher', 'lower'].includes(t.better) || !t.howTo || !t.voiceIntro) E(`${t.id} test`);
  if (t.setupId && !st.some((s) => s.id === t.setupId)) E(`${t.id} setup`);
}
const chid = new Set(ch.map((c) => c.id)); const teid = new Set(te.map((t) => t.id));
for (const c of ca) {
  if (!['common', 'rare', 'epic', 'legend'].includes(c.rarity)) E(`${c.id} rarity`);
  const u = c.unlock;
  const ok = { drill: ids.has(u.id), trick: tid.has(u.id), test: teid.has(u.id), challenge: u.id === 'any' || chid.has(u.id), streak: Number.isInteger(u.count) }[u.type];
  if (!ok) E(`${c.id} unlock ${u.type}:${u.id}`);
}
info.push('rarity: ' + ['common', 'rare', 'epic', 'legend'].map((r) => r + ' ' + ca.filter((c) => c.rarity === r).length).join(', '));
// db
for (const d of db) { if (!d.sources.length) E(`db ${d.id} bez zdroje`); if (!d.inApp && !d.notInAppReason) E(`db ${d.id} bez důvodu`); }
// hůl nad pas zmínky v hlasových textech
const voices = [...dr.map((d) => d.voiceIntro), ...tr.flatMap((t) => t.steps.map((s) => s.voice)), ...ch.map((c) => c.voiceIntro)];
for (const v of voices) if (/nad hlavu|nad pas(?! )/.test(v) && !/ne|nikdy/.test(v)) E('podezřelý text: ' + v);
console.log(info.join('\n'));
console.log(err.length ? 'CHYBY:\n' + err.join('\n') : 'OK, žádné chyby');
process.exit(err.length ? 1 : 0);
