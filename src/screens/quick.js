// Rychlé volby a zápas: reakční režim, samostatná rozcvička a protažení (přes existující přehrávač),
// „Zápas“ = sám proti rekordu (test nebo výzva) nebo táta vs. syn střídavě (souboj). Dlaždice pro domovskou obrazovku.
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import '../ui/m4.css';
import { say } from '../core/audio.js';
import { settings } from '../storage/index.js';
import { getProfile } from '../domain/profiles.js';
import { reactionWorkout, kindWorkout } from '../domain/quick.js';
import { trickProgress, dailyPick } from '../domain/tricks.js';
import { ARENA_TITLE } from './arena.js';

export async function startReaction(p, go) {
  const s = await settings.load();
  const wk = reactionWorkout(p, { quiet: s.quiet });
  if (!wk) return false;
  say('reaction_intro', { kind: 'phrase' });
  go('setup', { profileId: p.id, workout: wk });
  return true;
}
export async function startKind(p, kind, go) {
  const s = await settings.load();
  const wk = kindWorkout(p, kind, { quiet: s.quiet });
  if (!wk) return false;
  say(kind === 'nobal' ? 'warmup_only' : 'stretch_only', { kind: 'phrase' });
  go('player', { profile: p, workout: wk, settings: s });
  return true;
}

/** Zápas: dvě velké volby. */
export function matchScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen m4');
  el.dataset.test = 'match';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    el.append(header('Zápas', 'Proti komu hraješ?', () => back()));
    const g = h('div', 'm4-grid');
    const big = (ic, t, s, fn, test) => btn(`${icon(ic)}<span class="m4-col" style="gap:4px"><span class="t">${t}</span><span class="s">${s}</span></span>`, 'card m4-hero-tile', fn, { test });
    g.append(
      big('timer', 'Sám proti rekordu: test', 'Přetahování, slalom, žonglování…', () => go('skilltests', { profileId: p.id, solo: true }), 'match-test'),
      big('star', 'Sám proti rekordu: výzva', 'Trick shot, porazíš svůj nejlepší výkon?', () => go('duels', { profileId: p.id, solo: true }), 'match-solo'),
      big('swords', 'Táta vs. syn', 'Střídáte se, Trenér počítá a hlásí', () => go('duels', { profileId: p.id }), 'match-duel'),
    );
    el.append(g);
    say('record_beat', { kind: 'phrase' });
  })();
  return el;
}

/** Blok na domovskou obrazovku (přes celou šířku mřížky dlaždic) + dlaždice rychlých voleb. */
export function m4HomeTiles(p, go) {
  const block = h('div', 'm4-home m4');
  const hero = btn(`${icon('swords')}<span class="m4-col" style="gap:4px"><span class="t">${ARENA_TITLE}</span><span class="s">Souboje s tátou, triky, testy a karty</span></span>`, 'card m4-hero-tile', () => go('arena', { profileId: p.id }), { test: 'tile-arena' });
  const daily = btn('', 'card m4-daily', () => {}, { test: 'daily-trick' });
  daily.innerHTML = '<div class="eyebrow">Dnešní frajeřinka</div>';
  block.append(hero, daily);
  trickProgress(p.id).then((prog) => {
    const pick = dailyPick(prog);
    if (pick.kind === 'step') {
      daily.innerHTML = `<div class="eyebrow">Dnešní frajeřinka · ${escapeHtml(pick.trick.name)}</div><b class="m4-section-title">${escapeHtml(pick.step.name)}</b><div class="muted">${escapeHtml(pick.step.criterion)}</div>`;
      daily.onclick = (e) => { e.stopPropagation(); say('daily_trick', { kind: 'phrase' }); go('trick', { profileId: p.id, trickId: pick.trick.id, stepIdx: pick.trick.steps.indexOf(pick.step) }); };
    } else {
      daily.innerHTML = `<div class="eyebrow">Dnešní frajeřinka · výzva</div><b class="m4-section-title">${escapeHtml(pick.challenge.name)}</b><div class="muted">${escapeHtml(pick.challenge.rules.slice(0, 90))}${pick.challenge.rules.length > 90 ? '…' : ''}</div>`;
      daily.onclick = (e) => { e.stopPropagation(); say('daily_trick', { kind: 'phrase' }); go('duelSetup', { profileId: p.id, challengeId: pick.challenge.id }); };
    }
  }).catch(() => {});
  const tile = (ic, label, fn, test) => btn(`${icon(ic)}<span>${label}</span>`, 'card tile', fn, { test });
  return [
    block,
    tile('zap', 'Reakce', () => startReaction(p, go), 'tile-reaction'),
    tile('sunrise', 'Rozcvička', () => startKind(p, 'nobal', go), 'tile-warmup'),
    tile('moon', 'Protažení', () => startKind(p, 'stretch', go), 'tile-stretch'),
    tile('crown', 'Zápas', () => go('match', { profileId: p.id }), 'tile-match'),
    tile('timer', 'Testy', () => go('skilltests', { profileId: p.id }), 'tile-tests'),
    tile('cards', 'Karty', () => go('cards', { profileId: p.id }), 'tile-cards'),
  ];
}
