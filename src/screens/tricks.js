// Frajeřinky: strom triků (requires → odemykání) a detail triku po krocích.
// Krok: návod, kritérium, hlasový návod, animace (StationView na stanovišti spot; air = míček ve vzduchu),
// tlačítko pro rodiče „Splněno“. Dokončení triku → karta + oslava + XP.
import { h, btn, icon, header, escapeHtml } from '../ui/dom.js';
import { overlay } from '../ui/m4kit.js';
import { createStationView } from '../ui/StationView.js';
import { say, stopVoice, sfx, registerTexts } from '../core/audio.js';
import { getProfile } from '../domain/profiles.js';
import { getStation, stationFor } from '../domain/stations.js';
import { allTricks, getTrick, trickProgress, trickState, stepsDone, nextStep, completeStep, uncompleteStep, treeLevels } from '../domain/tricks.js';
import { HOME_ONLY_LINE } from '../domain/duels.js';
import { bump } from '../domain/activity.js';
import { XP_TRICK_STEP, XP_TRICK_DONE } from '../domain/xp.js';
import { awardOne } from '../domain/cards.js';
import { revealCard } from './cards.js';

export function tricksScreen({ profileId }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'tricks';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const prog = await trickProgress(p.id);
    el.append(header(`${prog.doneTricks.size} z ${allTricks().length} triků`, 'Frajeřinky', () => { stopVoice(); back(); }));
    const levels = treeLevels();
    levels.forEach((list, d) => {
      const lv = h('div', 'm4-tree-level');
      lv.append(h('div', 'eyebrow', d === 0 ? 'Začni tady' : `Patro ${d + 1}: odemkne se po předchozích tricích`));
      const g = h('div', 'm4-grid');
      for (const t of list) {
        const s = trickState(t, prog);
        const b = btn('', `card m4-trick${s === 'locked' ? ' locked' : ''}${s === 'done' ? ' on' : ''}`, () => go('trick', { profileId: p.id, trickId: t.id }), { test: `trick-${t.id}` });
        b.dataset.state = s;
        const n = stepsDone(t, prog);
        b.innerHTML = `<div class="m4-trick-badge ${s}">${s === 'done' ? icon('check') : s === 'locked' ? icon('lock') : `${n}/${t.steps.length}`}</div>
          <div class="m4-col" style="gap:6px;flex:1"><b class="m4-section-title">${escapeHtml(t.name)}</b>
          <div class="m4-steps">${t.steps.map((st) => `<i class="${prog.steps.has(st.id) ? 'on' : ''}"></i>`).join('')}</div>
          <div class="muted">${s === 'locked' ? `Nejdřív: ${escapeHtml((t.requires || []).map((r) => getTrick(r)?.name).filter(Boolean).join(', '))}` : `Karta: ${escapeHtml(t.card)}${t.matchLegal === false ? ' · jen doma' : ''}`}</div></div>`;
        g.append(b);
      }
      lv.append(g);
      el.append(lv);
    });
    say('trick_intro', { kind: 'phrase' });
  })();
  return el;
}

export function trickScreen({ profileId, trickId, stepIdx = null }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'trick';
  let sv = null; let loop = null;
  const stopAnim = () => { if (loop) { clearInterval(loop); loop = null; } if (sv) sv.destroy(); };
  const watch = setInterval(() => { if (!el.isConnected) { clearInterval(watch); stopAnim(); } }, 500);
  (async () => {
    const [p, prog] = await Promise.all([getProfile(profileId), trickProgress(profileId)]);
    const t = getTrick(trickId);
    if (!p || !t) return go('profiles', {}, { replace: true });
    const state = trickState(t, prog);
    let i = stepIdx != null ? stepIdx : Math.max(0, t.steps.indexOf(nextStep(t, prog) || t.steps[t.steps.length - 1]));
    el.append(header(state === 'done' ? 'Trik zvládnutý' : `Frajeřinka · ${stepsDone(t, prog)} z ${t.steps.length} kroků`, escapeHtml(t.name), () => { stopVoice(); back(); }));
    if (state === 'locked') {
      el.append(h('div', 'm4-note', `${icon('lock')} Odemkne se po tricích: <b>${escapeHtml((t.requires || []).map((r) => getTrick(r)?.name).join(', '))}</b>`));
      say('trick_locked', { kind: 'phrase' });
    }
    const notes = h('div', 'm4-col w-full');
    if (t.matchLegal === false) { const n = h('div', 'm4-note warn', `${icon('warn')} ${HOME_ONLY_LINE}`); n.dataset.test = 'home-only'; notes.append(n); }
    if (t.safety) notes.append(h('div', 'muted', escapeHtml(t.safety)));
    el.append(notes);

    const split = h('div', 'm4-split');
    const stage = h('div', 'm4-step-stage');
    const side = h('div', 'm4-col');
    split.append(stage, side);
    el.append(split);
    const station = stationFor(getStation(t.setupId || 'spot') || getStation('spot'), p.grip);
    registerTexts(Object.fromEntries(t.steps.map((s) => [`trick_${s.id}`, s.voice])));

    const paint = (speak = true) => {
      const s = t.steps[i];
      const done = prog.steps.has(s.id);
      stopAnim();
      sv = createStationView({ station, grip: p.grip, ball: true, pattern: (s.animation || []).filter((x) => !x.air) });
      stage.replaceChildren(sv.el);
      const pat = s.animation || [];
      if (pat.length) {
        let k = 0;
        const tick = () => { sv.moveTo(pat[k % pat.length], 650); k++; };
        tick(); loop = setInterval(tick, 900);
      }
      side.replaceChildren();
      const dots = h('div', 'm4-steps');
      t.steps.forEach((x, k) => { const d = h('i', prog.steps.has(x.id) ? 'on' : ''); if (k === i) d.style.outline = '3px solid var(--text)'; dots.append(d); });
      side.append(dots, h('div', 'eyebrow', `Krok ${i + 1} z ${t.steps.length}${done ? ' · splněno' : ''}`), h('div', 'm4-section-title', escapeHtml(s.name)));
      const how = h('div', 'm4-strong', escapeHtml(s.howTo)); how.style.fontSize = 'max(19px, calc(var(--u) * 2.4))';
      side.append(how);
      const crit = h('div', 'm4-note', `<div class="eyebrow">Kritérium pro rodiče</div><b>${escapeHtml(s.criterion)}</b>`); crit.dataset.test = 'criterion';
      side.append(crit);
      const row = h('div', 'm4-row');
      row.append(btn(`${icon('volume')}Řekni mi to`, 'btn', () => { stopVoice(); say(`trick_${s.id}`, { kind: 'phrase', text: s.voice }); }, { test: 'step-voice' }));
      if (i > 0) row.append(btn(`${icon('back')}Předchozí`, 'btn', () => { i--; paint(); }));
      if (i < t.steps.length - 1 && (done || state === 'done')) row.append(btn(`Další krok${icon('right')}`, 'btn', () => { i++; paint(); }, { test: 'step-next' }));
      side.append(row);
      if (state !== 'locked') {
        if (!done) {
          side.append(btn(`${icon('check')}Splněno (rodič)`, 'btn-primary btn-big', () => markDone(s), { auto: true, test: 'step-done' }));
        } else {
          side.append(btn('Odznačit krok (omyl)', 'btn', async () => { await uncompleteStep(p.id, s.id); prog.steps.delete(s.id); prog.doneTricks.delete(t.id); paint(false); }, { test: 'step-undo' }));
        }
      }
      if (speak) { stopVoice(); say(`trick_${s.id}`, { kind: 'phrase', text: s.voice }); }
    };

    const markDone = async (s) => {
      const r = await completeStep(p.id, t, s.id);
      if (r.already) return;
      prog.steps.add(s.id);
      await bump(p.id, { steps: 1 }, XP_TRICK_STEP);
      sfx('success');
      if (r.trickDone) {
        prog.doneTricks.add(t.id);
        await bump(p.id, { tricks: 1 }, XP_TRICK_DONE);
        stopVoice(); say('trick_done', { kind: 'phrase' });
        const o = overlay([h('div', 'eyebrow', 'Trik zvládnutý'), h('div', 'title', `${escapeHtml(t.name)}!`), h('div', 'm4-big-num', `+${XP_TRICK_STEP + XP_TRICK_DONE} XP`)], { test: 'trick-celebrate' });
        o.el.append(btn(`${icon('check')}Hurá!`, 'btn-primary btn-big', async () => {
          o.close();
          const card = await awardOne(p.id, (c) => c.unlock && c.unlock.type === 'trick' && c.unlock.id === t.id);
          if (card) await revealCard(card);
          go('tricks', { profileId: p.id }, { replace: true });
        }, { auto: true, test: 'trick-celebrate-ok' }));
        sfx('levelup');
        return;
      }
      say('trick_step_done', { kind: 'phrase' });
      if (i < t.steps.length - 1) i++;
      paint(false);
    };
    paint();
  })();
  return el;
}
