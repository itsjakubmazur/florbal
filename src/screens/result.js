// Výsledek tréninku (port z reference): hvězdy, XP, postup k další odměně, nové odměny.
import { h, btn, u, icon, jerseyEl, escapeHtml } from '../ui/dom.js';
import { sayGroup, sfx } from '../core/audio.js';
import { XP_PER_DRILL, XP_WORKOUT_BONUS, stars, rankInfo } from '../domain/xp.js';
import { addHistory, listHistory, getProfile } from '../domain/profiles.js';
import { REWARDS, statsOf, isUnlocked, nextXpReward } from '../domain/rewards.js';
import { rewardIcon } from './rewards.js';
import { afterWorkout } from './afterWorkout.js';

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

    el.append(h('div', 'title', aborted ? 'Dobrá práce' : 'Výborně'), h('div', 'lead muted', aborted ? 'Trénink ukončen dřív' : 'Trénink dokončen'));
    const starRow = h('div', 'result-stars');
    for (let i = 1; i <= 3; i++) {
      const s = h('div', `result-star${i <= st ? ' on' : ''}`, icon(i <= st ? 'star' : 'starO'));
      s.style.animationDelay = `${80 + i * 60}ms`;
      starRow.append(s);
    }
    const xpEl = h('div', 'result-xp', `+${xp} XP`);
    xpEl.dataset.test = 'result-xp';
    const card = h('div', 'card result-card');
    card.append(jerseyEl(p, 9));
    const box = h('div', 'result-card-text');
    const rk = rankInfo(xpAfter);
    box.append(h('div', 'lead', `<b>${escapeHtml(p.name)}</b>, ${rk.name}`), h('div', 'label', `${done} z ${total} cviků, ${String(Math.round(durationSec / 6) / 10).replace('.', ',')} min`));
    const nx = nextXpReward(xpAfter);
    box.append(h('div', 'label', nx ? `Další odměna: ${nx.reward.name} za ${nx.remaining} XP` : 'Všechny odměny za XP máš'));
    card.append(box);
    const gained = h('div', 'result-gained');
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
            const it = h('div', 'result-reward');
            it.append(rewardIcon(r, `max(56px, ${u(7)})`), h('div', '', `<div class="label">Nová odměna</div><div class="lead"><b>${r.name}</b></div>`));
            gained.append(it);
          });
        }, 1200);
      }
    }
    if (st > 0) sayGroup(complete ? 'end' : 'aborted');
    afterWorkout(el, p.id, { done }); // M4: „Jak se ti to líbilo?“ + nejvýš 1 nová karta
  })();
  return el;
}
