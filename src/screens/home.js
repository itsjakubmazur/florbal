// Domů: hráč, hodnost a postup, jedno velké tlačítko „Trénink“, týdenní lišta, výzva dne a dlaždice.
import { h, btn, u, jerseyEl, icon, escapeHtml } from '../ui/dom.js';
import { getProfile, listHistory, profileRank } from '../domain/profiles.js';
import { buildWorkout } from '../domain/trainer.js';
import { settings } from '../storage/index.js';
import { sayGroup, sfx } from '../core/audio.js';
import { nextXpReward } from '../domain/rewards.js';
import { weekOf, WEEK_GOAL, challengeOf, challengeDone, completeChallenge, CHALLENGE_XP } from '../domain/extras.js';
import { m4HomeTiles } from './quick.js';

export default function home({ profileId }, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'home';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const s = await settings.load();
    const rk = profileRank(p);

    // hrdina obrazovky: dres na palubovce (mantinel) + jméno, hodnost, postup a jedno velké tlačítko Trénink
    const hero = h('div', 'home-hero');
    const pitch = h('div', 'home-jersey rink');
    pitch.append(jerseyEl(p, 22));
    const info = h('div', 'home-info');
    const nameRow = h('div', 'home-name-row');
    nameRow.append(h('div', 'home-name', escapeHtml(p.name)), btn(`${icon('users')}Hráči`, 'btn btn-quiet', () => go('profiles', {}, { replace: true }), { test: 'switch-player' }));
    const nx = nextXpReward(p.xp || 0);
    const bar = h('div', 'bar'); bar.innerHTML = `<i style="width:${Math.round((nx ? nx.progress : 1) * 100)}%"></i>`;
    const rankLine = h('div', 'lead', `${escapeHtml(rk.name)}, ${p.xp || 0} XP`);
    const nextLine = h('div', 'label', nx ? `Další odměna: ${nx.reward.name} za ${nx.remaining} XP` : 'Všechny odměny za XP máš');

    const start = btn(`${icon('play')}Trénink`, 'btn-primary btn-big', async () => {
      sayGroup('welcome');
      const wk = buildWorkout(p, { quiet: s.quiet });
      if (!wk.drills.length) return;
      go('setup', { profileId: p.id, workout: wk });
    }, { auto: true, test: 'start' });
    const quiet = btn(`${icon(s.quiet ? 'mute' : 'volume')}${s.quiet ? 'Tichý trénink: zapnuto' : 'Tichý trénink: vypnuto'}`, `btn${s.quiet ? ' on' : ''}`, async () => {
      s.quiet = !s.quiet; await settings.save({ quiet: s.quiet }); sfx('tap'); go('home', { profileId }, { replace: true });
    }, { test: 'quiet' });
    const actions = h('div', 'home-actions');
    actions.append(start, quiet);
    info.append(nameRow, rankLine, bar, nextLine, actions, h('div', 'label', `${p.sessionLength} minut, ${s.quiet ? 'jen tiché cviky' : 'všechny cviky'}`));
    hero.append(pitch, info);

    // týden + výzva dne
    const hist = await listHistory(p.id);
    const week = weekOf(hist);
    const mid = h('div', 'home-mid');
    const wk = h('div', 'card home-week'); wk.style.cursor = 'default';
    const nW = week.filter((d) => d.trained).length;
    const wl = h('div', 'home-week-sum');
    wl.innerHTML = `<div class="label">Tento týden</div><div class="home-week-n">${nW} z ${WEEK_GOAL}</div>`;
    const days = h('div', 'home-days');
    week.forEach((d) => {
      const c = h('div', `home-day${d.today ? ' today' : ''}${d.future ? ' future' : ''}${d.trained ? ' done' : ''}`);
      c.innerHTML = `<div class="label">${d.label}</div>${icon(d.trained ? 'star' : 'starO')}`;
      days.append(c);
    });
    wk.append(wl, days);
    const ch = btn('', 'card home-challenge', async () => { if (!challengeDone(p) && await completeChallenge(p)) { paintCh(); sfx('success'); sayGroup('praise'); } }, { test: 'challenge' });
    const paintCh = () => {
      const dn = challengeDone(p);
      ch.classList.toggle('on', dn);
      ch.innerHTML = `<div class="label">${dn ? 'Výzva dne splněna' : `Výzva dne, +${CHALLENGE_XP} XP`}</div><div class="home-challenge-text">${challengeOf()}</div><div class="label muted">${dn ? 'Zítra bude nová výzva' : 'Až ji splníš, klepni sem'}</div>`;
    };
    paintCh();
    mid.append(wk, ch);

    const tiles = h('div', 'tiles');
    const tile = (ic, label, fn, test) => { const b = btn(`${icon(ic)}<span>${label}</span>`, 'card tile', fn, { test }); return b; };
    tiles.append(
      ...m4HomeTiles(p, go), // M4: Souboje a frajeřinky + Dnešní frajeřinka + rychlé volby
      tile('grid', 'Cviky', () => go('drills', { profileId: p.id }), 'tile-drills'),
      tile('map', 'Stanoviště', () => go('stations', { profileId: p.id }), 'tile-stations'),
      tile('trophy', 'Odměny', () => go('rewards', { profileId: p.id }), 'tile-rewards'),
      tile('levels', 'Moje cesta', () => go('levels', { profileId: p.id }), 'tile-levels'),
      tile('profile', 'Profil', () => go('newPlayer', { editId: p.id }), 'tile-profile'),
    );
    el.append(hero, mid, tiles);
  })();
  return el;
}
