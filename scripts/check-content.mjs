// Validátor obsahu: src/content/drills.json a stations.json podle docs/SPEC.md (kap. 2–3) + phrases.json.
// Spuštění: node scripts/check-content.mjs   (exit 1 při chybě; varování exit nezmění)
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const errors = []; const warns = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const COLORS = ['red', 'blue', 'yellow', 'green', 'white'];
const SPACES = ['small', 'medium', 'large'];
const CATEGORIES = ['vedení míčku', 'kličky', 'kolem kuželů', 'tahy', 'jednoruč', 'reakce', 'koordinace bez míčku', 'práce nohou', 'kombinace'];
const BLADE_SIDES = ['forhend', 'bekhend', 'obě'];
const GRIPS = ['obouruč', 'jednoruč-horní', 'jednoruč-dolní'];
const CALL_MODES = ['zóna', 'směr', 'barva', 'náhodná reakce', 'žádný'];
const NOISE = ['tichý', 'střední', 'hlasitý'];
const CONF = ['ověřené', 'odvozené', 'vlastní'];
const KINDS = ['ball', 'nobal', 'stretch'];
const REL = ['fh', 'bh', 'front', 'back', 'between', 'home'];
const RELIABILITY = ['ověřené', 'inspirace', 'odvozené'];

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isArr = (v) => Array.isArray(v);

// ---- stanoviště ----
const stations = read('src/content/stations.json');
if (!isArr(stations)) err('stations.json', 'musí být pole');
const stById = new Map();
for (const [i, s] of (stations || []).entries()) {
  const w = `stations[${s && s.id || i}]`;
  if (!isStr(s.id)) err(w, 'chybí id');
  if (stById.has(s.id)) err(w, 'duplicitní id');
  stById.set(s.id, s);
  if (!isStr(s.name)) err(w, 'chybí name');
  if (!isArr(s.size) || s.size.length !== 2 || !s.size.every((x) => isNum(x) && x > 0)) err(w, 'size musí být [šířka, hloubka] v m');
  if (!SPACES.includes(s.space)) err(w, `space musí být ${SPACES.join('|')}`);
  if (!isArr(s.cones) || !s.cones.length) err(w, 'cones musí být neprázdné pole');
  const ns = new Set();
  for (const c of s.cones || []) {
    if (!Number.isInteger(c.n) || c.n < 1 || c.n > 5) err(w, `kužel n=${c.n} musí být 1–5`);
    if (ns.has(c.n)) err(w, `kužel ${c.n} je dvakrát`);
    ns.add(c.n);
    if (!isNum(c.x) || !isNum(c.y)) err(w, `kužel ${c.n} nemá x/y`);
    if (!COLORS.includes(c.color)) err(w, `kužel ${c.n}: barva ${c.color} není z ${COLORS.join('|')}`);
    if (isArr(s.size) && (Math.abs(c.x) > s.size[0] || c.y > s.size[1] + 0.5 || c.y < -0.5)) warn(w, `kužel ${c.n} je mimo deklarovaný prostor`);
  }
  if (!s.home || !isNum(s.home.x) || !isNum(s.home.y)) err(w, 'chybí home {x,y}');
  if (!Number.isInteger(s.minCones) || s.minCones < 1) err(w, 'minCones musí být celé číslo ≥ 1');
  else if (s.minCones < (s.cones || []).length) warn(w, `minCones (${s.minCones}) < počet kuželů (${s.cones.length})`);
  if (!isArr(s.setupSteps) || !s.setupSteps.length) err(w, 'chybí setupSteps');
  for (const [k, st] of (s.setupSteps || []).entries()) {
    if (!isStr(st.text)) err(w, `setupSteps[${k}] bez textu`);
    if (!isArr(st.highlight)) err(w, `setupSteps[${k}].highlight musí být pole`);
    else for (const n of st.highlight) if (!ns.has(n)) err(w, `setupSteps[${k}] zvýrazňuje neexistující kužel ${n}`);
  }
  if (!isStr(s.voiceSetup)) err(w, 'chybí voiceSetup');
}
for (const id of ['spot', 'triangle', 'square', 'line', 'zigzag']) if (!stById.has(id)) err('stations.json', `chybí povinné stanoviště ${id}`);

// ---- cviky ----
const drills = read('src/content/drills.json');
if (!isArr(drills)) err('drills.json', 'musí být pole');
const ids = new Set();
for (const d of drills || []) { if (ids.has(d.id)) err(`drills[${d.id}]`, 'duplicitní id'); ids.add(d.id); }
for (const [i, d] of (drills || []).entries()) {
  const w = `drills[${d && d.id || i}]`;
  if (!isStr(d.id) || !/^[a-z0-9-]+$/.test(d.id)) err(w, 'id musí být kebab-case (a-z, 0-9, -)');
  if (!isStr(d.name)) err(w, 'chybí name');
  if (!Number.isInteger(d.level) || d.level < 1 || d.level > 5) err(w, 'level musí být 1–5');
  if (!Number.isInteger(d.minAge) || d.minAge < 4 || d.minAge > 18) err(w, 'minAge musí být celé číslo 4–18');
  if (!CATEGORIES.includes(d.category)) err(w, `category „${d.category}“ není povolená`);
  if (!BLADE_SIDES.includes(d.bladeSide)) err(w, `bladeSide musí být ${BLADE_SIDES.join('|')}`);
  if (!GRIPS.includes(d.grip)) err(w, `grip musí být ${GRIPS.join('|')}`);
  const kind = d.kind || 'ball';
  if (!KINDS.includes(kind)) err(w, `kind musí být ${KINDS.join('|')}`);
  const st = stById.get(d.setupId);
  if (!st) err(w, `setupId „${d.setupId}“ neodkazuje na stanoviště`);
  if (!CALL_MODES.includes(d.callMode)) err(w, `callMode musí být ${CALL_MODES.join('|')}`);
  if (!isNum(d.tempoBpm) || d.tempoBpm < 10 || d.tempoBpm > 160) err(w, 'tempoBpm musí být 10–160');
  if (!Number.isInteger(d.durationSec) || d.durationSec < 10 || d.durationSec > 300) err(w, 'durationSec musí být 10–300');
  if (d.reps != null && !Number.isInteger(d.reps)) err(w, 'reps musí být celé číslo nebo null');
  if (!isArr(d.spaceNeeded) || d.spaceNeeded.length !== 2 || !d.spaceNeeded.every(isNum)) err(w, 'spaceNeeded musí být [m, m]');
  else if (st && (d.spaceNeeded[0] > st.size[0] + 0.01 || d.spaceNeeded[1] > st.size[1] + 0.01)) warn(w, `spaceNeeded ${d.spaceNeeded.join('×')} je větší než stanoviště ${st.id}`);
  if (!NOISE.includes(d.noise)) err(w, `noise musí být ${NOISE.join('|')}`);
  if (!isArr(d.equipment)) err(w, 'equipment musí být pole');
  if (!isStr(d.voiceIntro)) err(w, 'chybí voiceIntro');
  if (!isArr(d.coachingPoints) || d.coachingPoints.length < 1 || !d.coachingPoints.every(isStr)) err(w, 'coachingPoints musí mít aspoň 1 bod');
  else if (d.coachingPoints.length > 4) warn(w, 'coachingPoints má víc než 4 body (dítěti stačí 2–3)');
  if (!isArr(d.commonMistakes)) err(w, 'commonMistakes musí být pole');
  for (const k of ['progression', 'regression']) {
    if (d[k] == null) continue;
    if (!isStr(d[k])) err(w, `${k} musí být id nebo null`);
    else if (!ids.has(d[k])) err(w, `${k} „${d[k]}“ neexistuje`);
    else if (d[k] === d.id) err(w, `${k} odkazuje sám na sebe`);
  }
  if (typeof d.safetyNotes !== 'string') err(w, 'safetyNotes musí být text');
  if (!isArr(d.sources)) err(w, 'sources musí být pole');
  for (const [k, s] of (d.sources || []).entries()) {
    if (!isStr(s.url) || !/^https?:\/\//.test(s.url)) err(w, `sources[${k}].url není URL`);
    if (!isStr(s.type)) err(w, `sources[${k}].type chybí`);
    if (!RELIABILITY.includes(s.reliability)) err(w, `sources[${k}].reliability musí být ${RELIABILITY.join('|')}`);
  }
  if (!CONF.includes(d.confidence)) err(w, `confidence musí být ${CONF.join('|')}`);
  if (d.confidence === 'ověřené' && !(d.sources || []).length) err(w, 'confidence „ověřené“ vyžaduje zdroj');
  if (typeof d.matchLegal !== 'boolean') err(w, 'matchLegal musí být true/false');
  if (d.loop != null && typeof d.loop !== 'boolean') err(w, 'loop musí být true/false');

  // pattern
  if (!isArr(d.pattern)) { err(w, 'pattern musí být pole'); continue; }
  if (kind === 'ball' && !d.pattern.length) err(w, 'cvik s míčkem musí mít pattern');
  const cones = new Set((st && st.cones || []).map((c) => c.n));
  for (const [k, p] of d.pattern.entries()) {
    const pw = `${w}.pattern[${k}]`;
    const at = p.at;
    let m;
    if (Number.isInteger(at)) { if (!cones.has(at)) err(pw, `kužel ${at} na stanovišti ${d.setupId} není`); }
    else if (typeof at === 'string' && (m = /^around:(\d)$/.exec(at))) {
      if (!cones.has(Number(m[1]))) err(pw, `around: kužel ${m[1]} na stanovišti ${d.setupId} není`);
      if (!['cw', 'ccw'].includes(p.dir)) err(pw, 'around potřebuje dir cw|ccw');
    } else if (!REL.includes(at)) err(pw, `at „${at}“ – povoleno číslo kuželu, around:N nebo ${REL.join('|')}`);
    if (kind === 'ball' && !['fh', 'bh'].includes(p.blade)) err(pw, 'blade musí být fh|bh');
    if (p.blade != null && !['fh', 'bh'].includes(p.blade)) err(pw, 'blade musí být fh|bh');
    if (p.hand != null && !['both', 'top', 'bottom'].includes(p.hand)) err(pw, 'hand musí být both|top|bottom');
    if (p.air != null && typeof p.air !== 'boolean') err(pw, 'air musí být true/false');
  }
  if (kind === 'ball' && ['zóna', 'barva'].includes(d.callMode) && !d.pattern.some((p) => Number.isInteger(p.at) || /^around:/.test(String(p.at)))) err(w, `callMode „${d.callMode}“ potřebuje v patternu kužely`);
  if (d.callMode === 'náhodná reakce' && st && st.cones.length < 2) err(w, 'náhodná reakce potřebuje aspoň 2 kužely');
  if (kind === 'ball' && d.bladeSide === 'forhend' && d.pattern.some((p) => p.blade === 'bh')) warn(w, 'bladeSide forhend, ale pattern obsahuje bekhend');
  if (kind === 'ball' && d.bladeSide === 'bekhend' && d.pattern.some((p) => p.blade === 'fh')) warn(w, 'bladeSide bekhend, ale pattern obsahuje forhend');
}
const kinds = (k) => (drills || []).filter((d) => (d.kind || 'ball') === k).length;
if (!kinds('nobal')) err('drills.json', 'chybí rozcvička (kind nobal)');
if (!kinds('stretch')) err('drills.json', 'chybí protažení (kind stretch)');
if (!(drills || []).some((d) => (d.kind || 'ball') === 'ball' && d.noise === 'tichý' && d.setupId === 'spot')) err('drills.json', 'chybí tichý cvik pro malý prostor (spot)');

// ---- hlášky ----
const phrases = read('src/content/phrases.json');
if (!phrases.fixed || !phrases.groups) err('phrases.json', 'musí mít fixed a groups');
else {
  const need = ['num_1', 'num_2', 'num_3', 'num_4', 'num_5', ...COLORS.map((c) => `color_${c}`), 'blade_fh', 'blade_bh', 'home', 'countdown_1', 'countdown_2', 'countdown_3'];
  for (const k of need) if (!isStr(phrases.fixed[k])) err('phrases.json', `chybí fixed.${k}`);
  for (const g of ['go', 'praise', 'rest', 'pause', 'resume', 'end', 'aborted', 'welcome']) if (!isArr(phrases.groups[g]) || !phrases.groups[g].length) err('phrases.json', `chybí skupina ${g}`);
}

for (const x of warns) console.log('VAROVÁNÍ', x);
for (const x of errors) console.log('CHYBA', x);
console.log(`stanoviště: ${(stations || []).length}, cviky: ${(drills || []).length} (s míčkem ${kinds('ball')}, rozcvička ${kinds('nobal')}, protažení ${kinds('stretch')}), chyb: ${errors.length}, varování: ${warns.length}`);
process.exit(errors.length ? 1 : 0);
