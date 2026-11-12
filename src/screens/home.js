// Domů: hráč, hodnost a postup, jedno velké tlačítko „Trénink“, týdenní lišta, výzva dne a dlaždice.
import { h, btn, u, jerseyEl, icon, escapeHtml } from '../ui/dom.js';
import { getProfile, listHistory, profileRank } from '../domain/profiles.js';
import { buildWorkout } from '../domain/trainer.js';
import { settings } from '../storage/index.js';
import { sayGroup, sfx } from '../core/audio.js';
import { nextXpReward } from '../domain/rewards.js';
import { weekOf, WEEK_GOAL, challengeOf, challengeDone, completeChallenge, CHALLENGE_XP } from '../domain/extras.js';

export default function home({ profileId }, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'home';
  el.style.gap = u(2);
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const s = await settings.load();
    const rk = profileRank(p);

    const sw = btn(`${icon('users')}Hráči`, 'btn', () => go('profiles', {}, { replace: true }));
    const topRow = h('div', 'head');
    const who = h('div', 'flex items-center'); who.style.gap = u(2);
    who.append(jerseyEl(p, 10));
    const info = h('div', 'flex flex-col'); info.style.gap = u(0.6);
    info.append(h('div', 'eyebrow', `${escapeHtml(rk.name)} · ${p.xp || 0} XP`), h('div', 'title', escapeHtml(p.name)));
    info.lastChild.style.textAlign = 'left';
    const nx = nextXpReward(p.xp || 0);
    const bar = h('div', ''); bar.style.cssText = `width:min(100%, ${u(36)});height:${u(1.1)};min-height:8px;background:var(--surface-2);border-radius:99px;overflow:hidden`;
    bar.innerHTML = `<div style="width:${Math.round((nx ? nx.progress : 1) * 100)}%;height:100%;background:var(--accent)"></div>`;
    info.append(bar, h('div', 'muted', nx ? `Další odměna: ${nx.reward.name} (za ${nx.remaining} XP)` : 'Všechny odměny za XP máš!'));
    who.append(info);
    topRow.append(who, sw);

    const start = btn(`${icon('play')}Trénink`, 'btn-primary btn-big', async () => {
      sayGroup('welcome');
      const wk = buildWorkout(p, { quiet: s.quiet });
      if (!wk.drills.length) return;
      go('setup', { profileId: p.id, workout: wk });
    }, { auto: true, test: 'start' });
    const sub = h('div', 'muted', `${p.sessionLength} min · ${s.quiet ? 'tichý trénink' : 'běžný trénink'}`);
    const quiet = btn(`${icon(s.quiet ? 'mute' : 'volume')}${s.quiet ? 'Tichý trénink: zapnuto' : 'Tichý trénink: vypnuto'}`, `btn${s.quiet ? ' on' : ''}`, async () => {
      s.quiet = !s.quiet; await settings.save({ quiet: s.quiet }); sfx('tap'); go('home', { profileId }, { replace: true });
    }, { test: 'quiet' });
    const startBox = h('div', 'flex flex-col items-center'); startBox.style.gap = u(1.2);
    startBox.append(start, sub, quiet);

    // týden + výzva dne
    const hist = await listHistory(p.id);
    const week = weekOf(hist);
    const mid = h('div', 'flex flex-wrap justify-center w-full'); mid.style.gap = u(1.6);
    const wk = h('div', 'card'); wk.style.cssText += `;cursor:default;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${u(0.8)}`;
    const nW = week.filter((d) => d.trained).length;
    const wl = h('div', ''); wl.style.cssText = `text-align:left;min-width:${u(10)}`;
    wl.innerHTML = `<div class="eyebrow">Tento týden</div><div style="font-weight:800;font-size:max(18px, ${u(2.2)})"><span class="accent-text">${nW}</span> z ${WEEK_GOAL}</div>`;
    wk.append(wl);
    week.forEach((d) => {
      const c = h('div', ''); c.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:${u(0.3)};width:max(34px, ${u(5.4)});padding:${u(0.4)} 0;border-radius:var(--r-sm);border:2px solid ${d.today ? 'var(--accent)' : 'transparent'};${d.future ? 'opacity:.45' : ''}`;
      c.innerHTML = `<div class="muted" style="font-size:max(12px, ${u(1.3)});font-weight:700">${d.label}</div><div style="font-size:max(20px, ${u(2.6)});display:flex;color:${d.trained ? 'var(--accent)' : 'var(--surface-2)'}">${icon(d.trained ? 'star' : 'starO')}</div>`;
      wk.append(c);
    });
    const ch = btn('', 'card', async () => { if (!challengeDone(p) && await completeChallenge(p)) { paintCh(); sfx('success'); sayGroup('praise'); } }, { test: 'challenge' });
    ch.style.cssText += `;text-align:left;display:flex;flex-direction:column;gap:${u(0.5)};max-width:${u(44)}`;
    const paintCh = () => {
      const dn = challengeDone(p);
      ch.classList.toggle('on', dn);
      ch.innerHTML = `<div class="eyebrow accent-text">Výzva dne · ${dn ? 'splněno' : `+${CHALLENGE_XP} XP`}</div><div style="font-weight:700;line-height:1.25">${challengeOf()}</div><div class="muted">${dn ? 'Zítra bude nová výzva' : 'Až ji splníš, klepni sem'}</div>`;
    };
    paintCh();
    mid.append(wk, ch);

    const tiles = h('div', 'tiles');
    const tile = (ic, label, fn, test) => { const b = btn(`${icon(ic)}<span>${label}</span>`, 'card tile', fn, { test }); return b; };
    tiles.append(
      tile('grid', 'Cviky', () => go('drills', { profileId: p.id }), 'tile-drills'),
      tile('map', 'Stanoviště', () => go('stations', { profileId: p.id }), 'tile-stations'),
      tile('trophy', 'Odměny', () => go('rewards', { profileId: p.id }), 'tile-rewards'),
      tile('levels', 'Moje cesta', () => go('levels', { profileId: p.id }), 'tile-levels'),
      tile('profile', 'Profil', () => go('newPlayer', { editId: p.id }), 'tile-profile'),
    );
    el.append(topRow, startBox, mid, tiles);
  })();
  return el;
}
