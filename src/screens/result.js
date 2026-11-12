// Výsledek tréninku (port z reference): hvězdy, XP, postup k další odměně, nové odměny.
import { h, btn, u, icon, jerseyEl, escapeHtml } from '../ui/dom.js';
import { sayGroup, sfx } from '../core/audio.js';
import { XP_PER_DRILL, XP_WORKOUT_BONUS, stars, rankInfo } from '../domain/xp.js';
import { addHistory, listHistory, getProfile } from '../domain/profiles.js';
import { REWARDS, statsOf, isUnlocked, nextXpReward } from '../domain/rewards.js';
import { rewardIcon } from './rewards.js';

export default function result({ profileId, drillIds = [], total = 0, done = 0, aborted = false, durationSec = 0 }, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'result';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const complete = !aborted && done >= total;
    const xp = done * XP_PER_DRILL + (complete ? XP_WORKOUT_BONUS : 0);
    const st = done ? stars(done, total) : 0;
    const xpBefore = p.xp || 0; const xpAfter = xpBefore + xp;

    el.append(h('div', 'eyebrow', aborted ? 'Trénink ukončen' : 'Trénink dokončen'), h('div', 'title', aborted ? 'Dobrá práce' : 'Výborně<span class="accent">!</span>'));
    const starRow = h('div', 'flex'); starRow.style.gap = u(2);
    for (let i = 1; i <= 3; i++) {
      const s = h('div', '', icon(i <= st ? 'star' : 'starO'));
      s.style.cssText = `font-size:max(44px, ${u(7)});display:flex;color:${i <= st ? 'var(--accent)' : 'var(--surface-2)'};animation:pop .5s ${0.15 + i * 0.2}s backwards`;
      starRow.append(s);
    }
    const xpEl = h('div', '', `+${xp} XP`); xpEl.style.cssText = `font-weight:800;font-size:max(36px, ${u(6)});color:var(--accent)`;
    xpEl.dataset.test = 'result-xp';
    const card = h('div', 'card flex items-center'); card.style.cssText += `;cursor:default;gap:${u(2)};text-align:left`;
    card.append(jerseyEl(p, 8));
    const box = h('div', 'flex flex-col'); box.style.gap = u(0.5);
    const rk = rankInfo(xpAfter);
    box.append(h('div', '', `<b>${escapeHtml(p.name)}</b> · ${rk.name}`), h('div', 'muted', `${done} z ${total} cviků · ${Math.round(durationSec / 6) / 10} min`));
    const nx = nextXpReward(xpAfter);
    box.append(h('div', 'muted', nx ? `Další odměna: ${nx.reward.name} za ${nx.remaining} XP` : 'Všechny odměny za XP máš!'));
    card.append(box);
    const gained = h('div', 'flex flex-wrap justify-center'); gained.style.gap = u(2);
    const homeBtn = btn(`${icon('home')}Domů`, 'btn-primary btn-big', () => go('home', { profileId }, { replace: true }), { auto: true, test: 'result-home' });
    el.append(starRow, xpEl, card, gained, homeBtn);

    const hist = await listHistory(p.id);
    const before = statsOf(hist, p);
    if (done > 0) {
      const entry = { durationSec, xp, drills: drillIds, stars: st, date: Date.now() };
      const after = statsOf([entry, ...hist], { ...p, xp: xpAfter });
      const fresh = REWARDS.filter((r) => !isUnlocked(r, xpBefore, before) && isUnlocked(r, xpAfter, after));
      await addHistory(p.id, { durationSec, xp, drills: drillIds, stars: st });
      if (fresh.length) {
        setTimeout(() => {
          sfx('levelup'); sayGroup('reward');
          fresh.slice(0, 3).forEach((r) => {
            const it = h('div', 'flex items-center'); it.style.cssText = `gap:${u(1)};animation:pop .6s backwards`;
            it.append(rewardIcon(r, `max(48px, ${u(7)})`), h('div', '', `<div class="eyebrow accent-text">Nová odměna</div><b>${r.name}</b>`));
            gained.append(it);
          });
        }, 1200);
      }
    }
    if (st > 0) sayGroup(complete ? 'end' : 'aborted');
  })();
  return el;
}
