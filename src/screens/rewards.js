// Vitrína odměn a „Moje cesta“ (hodnosti podle XP).
import { h, u, icon, header } from '../ui/dom.js';
import { getProfile, listHistory } from '../domain/profiles.js';
import { REWARDS, CATEGORIES, UNIT_LABEL, TIERS, statsOf, isUnlocked, rewardProgress } from '../domain/rewards.js';
import { RANKS, xpForRank, rankInfo } from '../domain/xp.js';

/** Ikona odměny: kruh v barvě kovu (tokens.js TIER_COLORS) s ikonou Lucide. */
export function rewardIcon(r, size, { locked = false } = {}) {
  const el = h('div', '');
  el.style.cssText = `width:${size};height:${size};flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;` +
    `background:${locked ? 'var(--surface-2)' : `var(--tier-${r.tier in TIERS ? r.tier : 'bronze'})`};color:${locked ? 'var(--muted)' : 'var(--tier-ink)'};font-size:calc(${size} * .5);${locked ? 'opacity:.5' : ''}`;
  el.innerHTML = icon(r.kind);
  return el;
}

export default function rewards({ profileId }, { go, back }) {
  const el = h('section', 'screen top kid');
  el.dataset.test = 'rewards';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const st = statsOf(await listHistory(p.id), p);
    const xp = p.xp || 0;
    const got = REWARDS.filter((r) => isUnlocked(r, xp, st)).length;
    el.append(header(`Máš ${got} z ${REWARDS.length}, ${xp} XP a ${st.trainings} ${st.trainings === 1 ? 'trénink' : st.trainings > 1 && st.trainings < 5 ? 'tréninky' : 'tréninků'}`, 'Odměny', () => back()));
    for (const cat of CATEGORIES) {
      const list = REWARDS.filter((r) => r.cat === cat.id);
      const sec = h('div', 'section');
      sec.append(h('div', 'section-title', `${cat.name}<span class="muted">, ${list.filter((r) => isUnlocked(r, xp, st)).length} z ${list.length}</span>`));
      const grid = h('div', 'reward-grid');
      for (const r of list) {
        const on = isUnlocked(r, xp, st);
        const pr = rewardProgress(r, xp, st);
        const c = h('div', `card reward-card${on ? ' got' : ''}`);
        c.append(rewardIcon(r, `max(56px, ${u(6.4)})`, { locked: !on }), h('div', 'reward-name', r.name));
        if (on) c.append(h('div', 'reward-num', 'Získáno'));
        else {
          const v = Math.min(pr.value, pr.need);
          const bar = h('div', 'bar', `<i style="width:${Math.round((v / pr.need) * 100)}%"></i>`);
          c.append(bar, h('div', 'reward-num', `${v} z ${pr.need} ${UNIT_LABEL[r.unit] || ''}`.trim()));
        }
        grid.append(c);
      }
      sec.append(grid); el.append(sec);
    }
  })();
  return el;
}

export function levels({ profileId }, { go, back }) {
  const el = h('section', 'screen top kid');
  el.dataset.test = 'levels';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const xp = p.xp || 0;
    const rk = rankInfo(xp);
    el.append(header(`Hodnost ${rk.rank} z ${RANKS.length}, ${xp} XP`, 'Moje cesta', () => back()));
    const path = h('ol', 'path');
    path.setAttribute('aria-label', 'Hodnosti');
    path.style.cssText = 'list-style:none;margin:0;padding:0';
    RANKS.forEach((name, i) => {
      const n = i + 1; const cur = n === rk.rank; const reached = n < rk.rank;
      const cls = ['path-step', cur ? 'cur' : reached ? 'reached' : 'future', n === 1 ? 'first' : '', n === RANKS.length ? 'last' : ''].filter(Boolean).join(' ');
      const li = h('li', cls);
      if (cur) li.setAttribute('aria-current', 'step');
      // na šířku dvě kolony (1–5, 6–10): čára končí i začíná na zlomu
      if (n === 5) li.classList.add('col-end');
      if (n === 6) li.classList.add('col-start');
      li.append(h('div', 'path-dot', reached ? icon('check') : String(n)));
      if (cur) {
        const info = h('div', 'path-cur-info');
        info.append(h('div', 'path-name', name));
        if (!rk.maxed) info.append(h('div', 'bar', `<i style="width:${Math.round(rk.progress * 100)}%"></i>`), h('div', 'path-xp', `Do další hodnosti ${rk.next - xp} XP`));
        else info.append(h('div', 'path-xp', 'Nejvyšší hodnost'));
        info.lastChild.style.textAlign = 'left';
        li.append(info);
      } else li.append(h('div', 'path-name', name));
      li.append(h('div', 'path-xp', n === 1 ? 'start' : `${xpForRank(n)} XP`));
      path.append(li);
    });
    el.append(path);
  })();
  return el;
}
