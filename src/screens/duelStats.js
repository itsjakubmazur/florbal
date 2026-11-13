// Historie soubojů, celková bilance „táta vs. syn“ a síň slávy (nejlepší výkon v každé výzvě).
import { h, btn, header, seg, escapeHtml } from '../ui/dom.js';
import '../ui/m4.css';
import { getProfile } from '../domain/profiles.js';
import { listDuels, balance, hallOfFame, fmtScore, DAD_NAME } from '../domain/duels.js';

const dt = (t) => new Date(t).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
const cfgOf = (d) => ({ type: d.type, scoring: d.scoring, format: d.format, word: d.word || 'KOHOUT' });

export default function duelStats({ profileId, tab = 'history' }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'duel-stats';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const duels = await listDuels();
    el.append(header('Souboje', 'Historie a síň slávy', () => back()));

    // bilance táta vs. syn
    const b = balance(duels, p.id);
    const bal = h('div', 'card w-full'); bal.style.cursor = 'default';
    bal.dataset.test = 'balance';
    bal.innerHTML = `<div class="eyebrow">Celková bilance</div>
      <div class="m4-row" style="justify-content:center;gap:calc(var(--u)*3)">
        <div class="m4-col" style="align-items:center;gap:2px"><div class="m4-big-num">${b.dad}</div><div class="m4-strong">${escapeHtml(DAD_NAME)}</div></div>
        <div class="m4-big-num muted">:</div>
        <div class="m4-col" style="align-items:center;gap:2px"><div class="m4-big-num" style="color:var(--m4-hi)">${b.kid}</div><div class="m4-strong">${escapeHtml(p.name)}</div></div>
      </div>
      <div class="muted">${b.total ? `${b.total} soubojů${b.draw ? `, ${b.draw}× remíza` : ''}` : 'Zatím žádný souboj táta vs. syn'}</div>`;
    el.append(bal);

    const body = h('div', 'm4-col w-full');
    const paint = (t) => {
      body.replaceChildren();
      if (t === 'history') {
        if (!duels.length) body.append(h('div', 'muted', 'Zatím žádné souboje. Vyber výzvu a hrajte!'));
        for (const d of duels.slice(0, 60)) {
          const c = h('div', 'card m4-item'); c.style.cursor = 'default';
          c.dataset.test = 'duel-row';
          const ps = d.players.map((x, i) => `<span class="${d.winners.includes(i) && d.players.length > 1 && !d.draw ? 'm4-strong' : 'muted'}">${escapeHtml(x.name)} ${escapeHtml(fmtScore(cfgOf(d), x.score, x.letters))}</span>`).join(' · ');
          const res = d.players.length === 1 ? 'Sám proti rekordu' : d.draw ? 'Remíza' : `Vyhrál ${escapeHtml(d.players[d.winners[0]].name)}`;
          c.innerHTML = `<div class="m4-row" style="justify-content:space-between"><b>${escapeHtml(d.name)}</b><span class="muted">${dt(d.date)}</span></div><div>${ps}</div><div class="m4-tag${d.rematch ? ' hi' : ''}" style="align-self:flex-start">${d.rematch ? 'Odveta · ' : ''}${res}</div>`;
          body.append(c);
        }
      } else {
        const fame = hallOfFame(duels);
        if (!fame.length) body.append(h('div', 'muted', 'Síň slávy se zaplní po prvních soubojích.'));
        const g = h('div', 'm4-grid');
        for (const f of fame) {
          const c = h('div', 'card m4-item'); c.style.cursor = 'default';
          c.dataset.test = 'fame-row';
          const wins = Object.entries(f.wins).sort((a, b2) => b2[1] - a[1]);
          const best = f.best ? `<div class="m4-big-num" style="color:var(--m4-hi)">${escapeHtml(fmtScore(cfgOf(f), f.best.score))}</div><div><b>${escapeHtml(f.best.name)}</b> <span class="muted">${dt(f.best.date)}</span></div>` : '';
          c.innerHTML = `<b class="m4-section-title">${escapeHtml(f.name)}</b>${best}<div class="muted">${f.played}× hráno${wins.length ? ` · nejvíc výher: ${escapeHtml(wins[0][0])} (${wins[0][1]})` : ''}</div>`;
          g.append(c);
        }
        body.append(g);
      }
    };
    el.append(seg([['history', 'Historie'], ['fame', 'Síň slávy']], tab, (v) => paint(v), { test: 'stats-tab' }), body);
    el.lastChild.previousSibling.style.width = 'min(100%, 520px)';
    paint(tab);
    el.append(btn('Nový souboj', 'btn-primary btn-big', () => go('duels', { profileId: p.id }, { replace: true }), { test: 'stats-new' }));
  })();
  return el;
}
