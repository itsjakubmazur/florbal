// Vitrína odměn a „Moje cesta“ (hodnosti podle XP).
import { h, btn, u, icon, header } from '../ui/dom.js';
import { getProfile, listHistory } from '../domain/profiles.js';
import { REWARDS, CATEGORIES, UNIT_LABEL, TIERS, statsOf, isUnlocked, rewardProgress } from '../domain/rewards.js';
import { RANKS, xpForRank, rankInfo } from '../domain/xp.js';

/** Ikona odměny: kruh v barvě kovu s ikonou Lucide (dočasně, finální grafiku dodá designer). */
export function rewardIcon(r, size, { locked = false } = {}) {
  const t = TIERS[r.tier] || TIERS.bronze;
  const el = h('div', '');
  el.style.cssText = `width:${size};height:${size};flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;` +
    `background:${locked ? 'var(--surface-2)' : t.color};color:${locked ? 'var(--muted)' : '#14161C'};font-size:calc(${size} * .5);${locked ? 'opacity:.5' : ''}`;
  el.innerHTML = icon(r.kind);
  return el;
}

export default function rewards({ profileId }, { go, back }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'rewards';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const st = statsOf(await listHistory(p.id), p);
    const xp = p.xp || 0;
    const got = REWARDS.filter((r) => isUnlocked(r, xp, st)).length;
    el.append(header(`${xp} XP · ${st.trainings} tréninků`, `Odměny <span class="accent">${got} z ${REWARDS.length}</span>`, () => back()));
    for (const cat of CATEGORIES) {
      const list = REWARDS.filter((r) => r.cat === cat.id);
      const sec = h('div', 'w-full flex flex-col'); sec.style.gap = u(1);
      sec.append(h('div', 'eyebrow', `${cat.name} · ${list.filter((r) => isUnlocked(r, xp, st)).length} z ${list.length}`));
      const grid = h('div', 'tiles'); grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(max(120px, ${u(15)}), 1fr))`;
      for (const r of list) {
        const on = isUnlocked(r, xp, st);
        const pr = rewardProgress(r, xp, st);
        const c = h('div', `card${on ? ' on' : ''}`); c.style.cssText += `;cursor:default;display:flex;flex-direction:column;align-items:center;gap:${u(0.6)}`;
        c.append(rewardIcon(r, `max(44px, ${u(6)})`, { locked: !on }), h('div', '', `<b>${r.name}</b>`), h('div', 'muted', on ? 'Získáno' : `${Math.min(pr.value, pr.need)} / ${pr.need} ${UNIT_LABEL[r.unit] || ''}`));
        grid.append(c);
      }
      sec.append(grid); el.append(sec);
    }
  })();
  return el;
}

export function levels({ profileId }, { go, back }) {
  const el = h('section', 'screen top');
  el.dataset.test = 'levels';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const rk = rankInfo(p.xp || 0);
    el.append(header('Cesta mladého florbalisty', `${rk.name}`, () => back()));
    const grid = h('div', 'tiles'); grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(max(130px, ${u(17)}), 1fr))`;
    RANKS.forEach((name, i) => {
      const n = i + 1; const cur = n === rk.rank; const reached = n < rk.rank;
      const c = h('div', `card${cur ? ' on' : ''}`); c.style.cssText += `;cursor:default;display:flex;flex-direction:column;align-items:center;gap:${u(0.5)};opacity:${n > rk.rank ? 0.5 : 1}`;
      const badge = h('div', '', reached ? icon('check') : String(n));
      badge.style.cssText = `width:max(44px, ${u(6)});height:max(44px, ${u(6)});border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:max(20px, ${u(2.6)});` +
        (cur ? 'background:var(--accent);color:var(--accent-ink)' : reached ? 'border:3px solid var(--accent);color:var(--accent)' : 'border:2px dashed var(--line)');
      c.append(badge, h('div', '', `<b>${name}</b>`), h('div', 'muted', n === 1 ? 'start' : `${xpForRank(n)} XP`));
      if (cur && !rk.maxed) { const bar = h('div', ''); bar.style.cssText = 'width:80%;height:8px;border-radius:99px;background:var(--surface-2);overflow:hidden'; bar.innerHTML = `<div style="width:${Math.round(rk.progress * 100)}%;height:100%;background:var(--accent)"></div>`; c.append(bar); }
      grid.append(c);
    });
    el.append(grid);
  })();
  return el;
}
