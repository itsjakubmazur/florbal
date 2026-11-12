// Souboje a trick shoty (BRIEF kap. 4.6 A, SPEC kap. 4).
// Výzvy: knihovna (challenges.json) + vlastní (store customChallenges). Výsledky soubojů: store duels.
//
// Souboj je čistý stavový automat: stav = replay(cfg, log). Každé klepnutí rodiče je akce v logu,
// „zpět“ = odebrat poslední akci a přepočítat. Režimy podle formátu:
//   turns  – „pokusy“ a „čas“: hráči se střídají, každý má N pokusů (trefa/vedle, počet, stopky, počítání na čas)
//   race   – „do-x“: kdo první dá X trefa
//   series – „série“: kola, rodič klepne, kdo kolo vyhrál; vyhrává, kdo má víc než půlku kol
//   kohout – KOHOUT: jeden předvede trik, ostatní opakují, kdo nezopakuje, dostane písmeno
import challenges from '../content/challenges.json';
import { storage, uid } from '../storage/index.js';
import { removeMedia } from './media.js';

export const FORMATS = { 'pokusy': 'Pokusy', 'čas': 'Na čas', 'do-x': 'Do X trefa', 'série': 'Série kol' };
export const FORMAT_HELP = {
  'pokusy': 'Každý má stejný počet pokusů a střídáte se.',
  'čas': 'Každý hraje sám na čas, ostatní počítají.',
  'do-x': 'Vyhrává, kdo první dá daný počet.',
  'série': 'Hraje se na kola, vyhrává, kdo vyhraje víc kol.',
};
export const SCORINGS = { trefy: 'Trefa / vedle', 'počet': 'Počítáme kusy', 'čas': 'Stopky' };
export const KOHOUT_WORDS = ['KOHOUT', 'KOZA'];
export const DAD_NAME = 'Táta';

export const libraryChallenges = () => challenges;
export const libraryChallenge = (id) => challenges.find((c) => c.id === id) || null;

// ---- vlastní výzvy ----
export const listCustom = async () => (await storage.list('customChallenges')).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
export async function saveCustom(c) {
  const row = {
    id: c.id || `cc-${uid()}`, custom: true, type: 'vlastní', createdAt: c.createdAt || Date.now(),
    name: String(c.name || '').trim().slice(0, 40) || 'Moje výzva',
    rules: String(c.rules || '').trim().slice(0, 400),
    format: FORMATS[c.format] ? c.format : 'pokusy',
    scoring: SCORINGS[c.scoring] ? c.scoring : 'trefy',
    attempts: clampInt(c.attempts, 1, 30, 5), target: clampInt(c.target, 1, 30, 3), durationSec: clampInt(c.durationSec, 5, 600, 30),
    better: c.better === 'lower' ? 'lower' : 'higher',
    homeOnly: !!c.homeOnly, matchLegal: !c.homeOnly,
    targetName: String(c.targetName || '').trim().slice(0, 40), wallName: String(c.wallName || '').trim().slice(0, 40),
    targetPhoto: c.targetPhoto || null, wallPhoto: c.wallPhoto || null,
    handicap: [], players: '1-4',
  };
  await storage.put('customChallenges', row);
  return row;
}
export async function deleteCustom(id) {
  const c = await storage.get('customChallenges', id);
  if (c) { await removeMedia(c.targetPhoto); await removeMedia(c.wallPhoto); }
  await storage.remove('customChallenges', id);
}
export async function getChallenge(id) {
  return libraryChallenge(id) || (await storage.get('customChallenges', id)) || null;
}
function clampInt(v, min, max, def) { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; }

export const HOME_ONLY_LINE = 'Tohle je jen domácí frajeřinka, v zápase by to byl faul.';
export const homeOnlyLine = (ch) => (ch && (ch.matchLegal === false || ch.homeOnly) ? (ch.homeOnlyLine || HOME_ONLY_LINE) : null);

/** Kdo vyhrává: u stopek se slalom měří „kratší je lepší“, výdrž „delší je lepší“. */
export const betterOf = (ch) => ch.better || (ch.scoring === 'čas' && (ch.type === 'slalom' || ch.format === 'čas') ? 'lower' : 'higher');
/** Jak se sčítají pokusy: stopky a „počítá se nejlepší“ = nejlepší pokus, jinak součet. */
export const aggregateOf = (ch) => ch.aggregate || (ch.scoring === 'čas' || /počítá se nejlepší/i.test(ch.rules || '') ? 'best' : 'sum');

export function modeOf(cfg) {
  if (cfg.type === 'kohout') return 'kohout';
  if (cfg.format === 'do-x') return 'race';
  if (cfg.format === 'série') return 'series';
  return 'turns';
}
/** Jak se zadává pokus v režimu turns. */
export function inputOf(cfg) {
  if (cfg.scoring === 'čas') return 'stopwatch';
  if (cfg.format === 'čas') return 'timed';
  if (cfg.scoring === 'trefy') return 'hitmiss';
  return 'count';
}

/** Účinek hendikepu na počet pokusů: „Táta má o 2 pokusy méně“, „Syn má žolíka: jeden pokus navíc“. */
export function handicapDelta(text, player) {
  if (!text) return 0;
  const less = /o (\d+) pokus\w* méně/i.exec(text);
  if (less && player.role === 'dad') return -Number(less[1]);
  if (/pokus navíc/i.test(text) && player.role !== 'dad') return 1;
  return 0;
}

/** Výchozí nastavení souboje pro výzvu. */
export function defaultConfig(ch, players = []) {
  const format = ch.type === 'kohout' ? 'série' : ch.format || 'pokusy';
  const rounds = format === 'série' ? (ch.attempts || 3) : null;
  return {
    challengeId: ch.id, custom: !!ch.custom, name: ch.name, type: ch.type || 'vlastní',
    format, scoring: ch.scoring || 'trefy', better: betterOf(ch), aggregate: aggregateOf(ch),
    attempts: ch.attempts || 5, target: ch.target || 3,
    durationSec: ch.durationSec && format === 'čas' ? ch.durationSec : (format === 'čas' ? 30 : null),
    rounds, roundSec: format === 'série' && ch.durationSec ? Math.round(ch.durationSec / rounds) : null,
    word: KOHOUT_WORDS[0], handicap: null, players,
  };
}

export const attemptsFor = (cfg, i) => (cfg.format === 'čas' ? 1 : Math.max(1, (cfg.attempts || 1) + handicapDelta(cfg.handicap, cfg.players[i])));
export const winRounds = (cfg) => Math.floor((cfg.rounds || 3) / 2) + 1;

function aggregate(cfg, results) {
  if (!results.length) return null;
  if (cfg.scoring === 'trefy') return results.reduce((a, v) => a + v, 0);
  if (cfg.aggregate === 'best') return cfg.better === 'lower' ? Math.min(...results) : Math.max(...results);
  return Math.round(results.reduce((a, v) => a + v, 0) * 10) / 10;
}

/** Přepočítá stav souboje z logu akcí. */
export function replay(cfg, log = []) {
  const mode = modeOf(cfg);
  const n = cfg.players.length;
  const ps = cfg.players.map((p) => ({ ...p, results: [], hits: 0, misses: 0, score: 0, letters: 0, roundWins: 0, out: false }));
  const st = { mode, cfg, players: ps, active: 0, finished: false, round: 0, phase: 'lead', leader: 0, queue: [], lastEvent: null };
  const alive = () => ps.map((p, i) => i).filter((i) => !ps[i].out);
  const nextAlive = (from) => { for (let k = 1; k <= n; k++) { const i = (from + k) % n; if (!ps[i].out) return i; } return from; };

  for (const a of log) {
    const p = ps[a.p];
    if (mode === 'turns') {
      if (!p) continue;
      if (a.t === 'hit') { p.results.push(1); p.hits++; } else if (a.t === 'miss') { p.results.push(0); p.misses++; } else if (a.t === 'val') p.results.push(Number(a.v) || 0);
      st.lastEvent = a.t;
    } else if (mode === 'race') {
      if (!p) continue;
      if (a.t === 'hit') { p.hits++; p.score++; } else if (a.t === 'miss') p.misses++;
      st.lastEvent = a.t;
    } else if (mode === 'series') {
      st.round++;
      if (a.t === 'round' && ps[a.p]) ps[a.p].roundWins++;
      st.lastEvent = a.p >= 0 ? 'round' : 'draw';
    } else if (mode === 'kohout') {
      if (a.t === 'lead') {
        if (!a.ok) { st.leader = nextAlive(st.leader); st.lastEvent = 'lead-fail'; } else {
          st.phase = 'copy';
          st.queue = alive().filter((i) => i !== st.leader).sort((x, y) => ((x - st.leader + n) % n) - ((y - st.leader + n) % n));
          st.lastEvent = 'lead-ok';
        }
      } else if (a.t === 'copy' && p) {
        if (!a.ok) { p.letters++; if (p.letters >= cfg.word.length) p.out = true; st.lastEvent = p.out ? 'out' : 'letter'; } else st.lastEvent = 'copied';
        st.queue = st.queue.filter((i) => i !== a.p);
        if (!st.queue.length || alive().length <= 1) { st.phase = 'lead'; st.queue = []; st.leader = nextAlive(st.leader); st.round++; }
      }
    }
  }

  if (mode === 'turns') {
    ps.forEach((p) => { p.score = aggregate(cfg, p.results); });
    let best = -1;
    ps.forEach((p, i) => { if (p.results.length < attemptsFor(cfg, i) && (best < 0 || p.results.length < ps[best].results.length)) best = i; });
    st.active = best; st.finished = best < 0;
  } else if (mode === 'race') {
    st.active = log.length % n;
    st.finished = ps.some((p) => p.score >= cfg.target);
  } else if (mode === 'series') {
    st.finished = ps.some((p) => p.roundWins >= winRounds(cfg)) || st.round >= (cfg.rounds || 3);
    ps.forEach((p) => { p.score = p.roundWins; });
  } else if (mode === 'kohout') {
    ps.forEach((p) => { p.score = p.letters; });
    st.active = st.phase === 'copy' ? st.queue[0] : st.leader;
    st.finished = alive().length <= (n > 1 ? 1 : 0);
  }
  st.winners = st.finished ? winnersOf(st) : [];
  st.draw = st.finished && n > 1 && st.winners.length !== 1;
  return st;
}

function winnersOf(st) {
  const ps = st.players;
  if (st.mode === 'kohout') return ps.map((p, i) => i).filter((i) => !ps[i].out);
  const better = st.mode === 'turns' && st.cfg.scoring !== 'trefy' ? st.cfg.better : 'higher';
  const vals = ps.map((p) => (p.score == null ? null : p.score));
  const valid = vals.filter((v) => v != null);
  if (!valid.length) return [];
  const top = better === 'lower' ? Math.min(...valid) : Math.max(...valid);
  return vals.map((v, i) => (v === top ? i : -1)).filter((i) => i >= 0);
}

/** Text skóre: stopky „12,4 s“, KOHOUT písmena, jinak číslo. */
export function fmtScore(cfg, v, letters = 0) {
  if (cfg.type === 'kohout') return letters ? cfg.word.slice(0, letters) : '–';
  if (v == null) return '–';
  if (cfg.scoring === 'čas' && cfg.format !== 'série') return `${String(Math.round(v * 10) / 10).replace('.', ',')} s`;
  return String(v);
}

// ---- uložení a statistiky ----
export async function saveDuel(state, { rematch = false } = {}) {
  const c = state.cfg;
  const row = {
    id: `du-${uid()}`, date: Date.now(), challengeId: c.challengeId, custom: !!c.custom, name: c.name, type: c.type,
    format: c.format, scoring: c.scoring, better: c.better, word: c.word, handicap: c.handicap || null,
    players: state.players.map((p) => ({ name: p.name, role: p.role, profileId: p.profileId || null, score: p.score, results: p.results, letters: p.letters, roundWins: p.roundWins })),
    winners: state.winners, draw: state.draw, rematch,
  };
  await storage.put('duels', row);
  return row;
}
export const listDuels = async () => (await storage.list('duels')).sort((a, b) => b.date - a.date);

const lostBy = (d, profileId) => {
  const i = d.players.findIndex((p) => p.profileId === profileId);
  return i >= 0 && d.players.length > 1 && !d.draw && !d.winners.includes(i);
};
/** Odveta = souboj stejné výzvy po prohře hráče (předchozí souboj této výzvy hráč prohrál). */
export function isRematch(duels, challengeId, profileId) {
  const prev = duels.filter((d) => d.challengeId === challengeId && d.players.some((p) => p.profileId === profileId)).sort((a, b) => b.date - a.date)[0];
  return !!prev && lostBy(prev, profileId);
}

/** Bilance táta vs. hráč z profilu. */
export function balance(duels, profileId) {
  const r = { dad: 0, kid: 0, draw: 0, total: 0 };
  for (const d of duels) {
    const di = d.players.findIndex((p) => p.role === 'dad');
    const ki = d.players.findIndex((p) => p.profileId === profileId);
    if (di < 0 || ki < 0) continue;
    r.total++;
    if (d.draw && d.winners.includes(di) && d.winners.includes(ki)) r.draw++;
    else if (d.winners.includes(ki) && !d.winners.includes(di)) r.kid++;
    else if (d.winners.includes(di) && !d.winners.includes(ki)) r.dad++;
    else r.draw++;
  }
  return r;
}

const betterVal = (better, a, b) => (b == null ? true : better === 'lower' ? a < b : a > b);
/** Síň slávy: nejlepší výkon v každé výzvě (KOHOUT: kdo má nejvíc výher). */
export function hallOfFame(duels) {
  const by = new Map();
  for (const d of [...duels].sort((a, b) => a.date - b.date)) {
    if (!by.has(d.challengeId)) by.set(d.challengeId, { challengeId: d.challengeId, name: d.name, type: d.type, scoring: d.scoring, format: d.format, word: d.word, better: d.better, best: null, played: 0, wins: {} });
    const e = by.get(d.challengeId);
    e.played++;
    d.winners.forEach((i) => { if (d.players.length > 1 && !d.draw) { const nm = d.players[i].name; e.wins[nm] = (e.wins[nm] || 0) + 1; } });
    if (d.type === 'kohout' || d.format === 'série') continue;
    const better = d.scoring === 'trefy' ? 'higher' : d.better;
    for (const p of d.players) {
      if (p.score == null) continue;
      if (!e.best || betterVal(better, p.score, e.best.score)) e.best = { name: p.name, score: p.score, date: d.date, profileId: p.profileId };
    }
  }
  return [...by.values()].sort((a, b) => b.played - a.played);
}

/** Osobní rekord hráče ve výzvě (pro „sám proti rekordu“). */
export function personalBest(duels, challengeId, profileId) {
  let best = null;
  for (const d of duels) {
    if (d.challengeId !== challengeId || d.type === 'kohout' || d.format === 'série') continue;
    const better = d.scoring === 'trefy' ? 'higher' : d.better;
    for (const p of d.players) if (p.profileId === profileId && p.score != null && betterVal(better, p.score, best)) best = p.score;
  }
  return best;
}
