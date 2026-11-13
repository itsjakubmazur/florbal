// Souboje: knihovna výzev + vlastní výzvy, nastavení souboje (hráči, formát, hendikep), bezpečnostní připomínka,
// formulář vlastní výzvy s fotkou cíle a „mantinelu“ z kamery iPadu.
import { h, btn, icon, header, seg, field, escapeHtml } from '../ui/dom.js';
import { stepper, sayText, confirmBox } from '../ui/m4kit.js';
import { say, stopVoice, registerTexts } from '../core/audio.js';
import { getProfile, listProfiles } from '../domain/profiles.js';
import {
  libraryChallenges, listCustom, saveCustom, deleteCustom, getChallenge, defaultConfig, homeOnlyLine, modeOf,
  FORMATS, FORMAT_HELP, SCORINGS, KOHOUT_WORDS, DAD_NAME, listDuels, personalBest, fmtScore,
} from '../domain/duels.js';
import { savePhoto, mediaUrl, pickPhoto, removeMedia } from '../domain/media.js';
import { bump } from '../domain/activity.js';

const TYPE_LABEL = { 'tyčka': 'Tyčka', 'odraz': 'Odraz', 'volej': 'Volej', 'cíl': 'Cíl', 'žonglování': 'Žonglování', 'slalom': 'Slalom', 'kohout': 'KOHOUT', 'vlastní': 'Vlastní' };

function challengeCard(c, onClick, test) {
  const b = btn('', 'card m4-item', onClick, { test });
  const tags = [`<span class="m4-tag">${escapeHtml(c.type === 'kohout' ? 'Písmena' : FORMATS[c.format] || '')}</span>`];
  if (c.custom) tags.push('<span class="m4-tag hi">Moje</span>');
  if (homeOnlyLine(c)) tags.push('<span class="m4-tag home">Jen doma</span>');
  b.innerHTML = `<div class="m4-row" style="gap:6px">${tags.join('')}</div><b class="m4-section-title">${escapeHtml(c.name)}</b><div class="muted">${escapeHtml((c.rules || '').slice(0, 110))}${(c.rules || '').length > 110 ? '…' : ''}</div>`;
  return b;
}

/** Seznam výzev: knihovna + vlastní. */
export function duelsScreen({ profileId, solo = false }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'duels';
  (async () => {
    const p = await getProfile(profileId);
    if (!p) return go('profiles', {}, { replace: true });
    const custom = await listCustom();
    el.append(header(solo ? 'Zápas: sám proti rekordu' : 'Táta vs. syn a trick shoty', solo ? 'Vyber výzvu' : 'Souboje', () => back()));
    const top = h('div', 'm4-row w-full');
    top.append(btn(`${icon('plus')}Vlastní výzva`, 'btn-primary', () => go('customChallenge', { profileId: p.id }), { test: 'custom-new' }));
    if (!solo) top.append(btn(`${icon('list')}Historie a síň slávy`, 'btn', () => go('duelStats', { profileId: p.id }), { test: 'duel-stats' }));
    el.append(top);
    if (custom.length) {
      el.append(h('div', 'eyebrow w-full', 'Moje výzvy'));
      const g = h('div', 'm4-grid');
      custom.forEach((c) => g.append(challengeCard(c, () => go('duelSetup', { profileId: p.id, challengeId: c.id, solo }), `ch-${c.id}`)));
      el.append(g);
    }
    const groups = [['Trick shoty a střelba', (c) => ['tyčka', 'odraz', 'volej', 'cíl'].includes(c.type)], ['Dovednosti a hry', (c) => !['tyčka', 'odraz', 'volej', 'cíl'].includes(c.type)]];
    for (const [title, f] of groups) {
      const list = libraryChallenges().filter(f).filter((c) => !solo || (c.type !== 'kohout' && c.format !== 'série' && !String(c.players).startsWith('2')));
      if (!list.length) continue;
      el.append(h('div', 'eyebrow w-full', title));
      const g = h('div', 'm4-grid');
      list.forEach((c) => g.append(challengeCard(c, () => go('duelSetup', { profileId: p.id, challengeId: c.id, solo }), `ch-${c.id}`)));
      el.append(g);
    }
  })();
  return el;
}

/** Nastavení souboje. */
export function duelSetupScreen({ profileId, challengeId, solo = false, players: keep = null }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'duel-setup';
  (async () => {
    const [p, ch, profiles, duels] = await Promise.all([getProfile(profileId), getChallenge(challengeId), listProfiles(), listDuels()]);
    if (!p || !ch) return go('profiles', {}, { replace: true });
    const me = { name: p.name, role: 'player', profileId: p.id };
    const players = keep ? keep.map((x) => ({ ...x })) : solo ? [me] : [{ name: DAD_NAME, role: 'dad' }, me];
    const cfg = defaultConfig(ch, players);
    const mode0 = modeOf(cfg);

    el.append(header(TYPE_LABEL[ch.type] || 'Výzva', escapeHtml(ch.name), () => { stopVoice(); back(); }));
    const split = h('div', 'm4-split');
    const left = h('div', 'm4-col'); const right = h('div', 'm4-col');
    split.append(left, right);
    el.append(split);

    // pravidla, výbava, fotky, jen doma
    left.append(h('div', 'm4-strong', escapeHtml(ch.rules || 'Pravidla si domluvte.')));
    if (ch.equipment && ch.equipment.length) left.append(h('div', 'muted', `Potřebujete: ${escapeHtml(ch.equipment.join(', '))}`));
    const hol = homeOnlyLine(ch);
    if (hol) { const n = h('div', 'm4-note warn', `${icon('warn')} ${escapeHtml(hol)}`); n.dataset.test = 'home-only'; left.append(n); }
    if (ch.matchNote) left.append(h('div', 'muted', escapeHtml(ch.matchNote)));
    if (ch.custom && (ch.targetPhoto || ch.wallPhoto || ch.targetName || ch.wallName)) {
      const ph = h('div', 'm4-grid small');
      for (const [label, name, id] of [['Cíl', ch.targetName, ch.targetPhoto], ['Mantinel', ch.wallName, ch.wallPhoto]]) {
        if (!name && !id) continue;
        const c = h('div', 'm4-col');
        const box = h('div', 'm4-photo', icon('camera'));
        mediaUrl(id).then((u) => { if (u) box.innerHTML = `<img src="${u}" alt="${escapeHtml(label)}">`; });
        c.append(box, h('div', 'muted', `${label}: <b>${escapeHtml(name || '')}</b>`));
        ph.append(c);
      }
      left.append(ph);
    }
    if (ch.type === 'odraz' && !ch.custom) {
      left.append(btn(`${icon('camera')}Vyfotit cíl a mantinel`, 'btn', () => go('customChallenge', { profileId: p.id, baseId: ch.id }), { test: 'odraz-photo' }));
    }
    if (ch.custom) {
      const r = h('div', 'm4-row');
      r.append(btn(`${icon('edit')}Upravit`, 'btn', () => go('customChallenge', { profileId: p.id, editId: ch.id }), { test: 'custom-edit' }),
        btn(`${icon('trash')}Smazat`, 'btn danger', () => confirmBox('Smazat tuhle výzvu?', 'Smazat', async () => { await deleteCustom(ch.id); back(); }), { test: 'custom-delete' }));
      left.append(r);
    }

    // hráči
    const plBox = h('div', 'panel');
    const paintPlayers = () => {
      plBox.replaceChildren(h('div', 'eyebrow', solo ? 'Hraješ sám proti rekordu' : 'Hráči'));
      const list = h('div', 'm4-row');
      players.forEach((pl, i) => {
        const b = btn(`${escapeHtml(pl.name)}${players.length > 1 && !solo ? ` ${icon('x')}` : ''}`, 'btn on', () => { if (players.length > 1 && !solo) { players.splice(i, 1); paintPlayers(); paintOpts(); } }, { test: `pl-${i}` });
        list.append(b);
      });
      plBox.append(list);
      if (!solo && players.length < 4) {
        const add = h('div', 'm4-row');
        if (!players.some((x) => x.role === 'dad')) add.append(btn(`${icon('plus')}${DAD_NAME}`, 'btn', () => { players.push({ name: DAD_NAME, role: 'dad' }); paintPlayers(); paintOpts(); }, { test: 'add-dad' }));
        profiles.filter((x) => !players.some((y) => y.profileId === x.id)).forEach((x) => add.append(btn(`${icon('plus')}${escapeHtml(x.name)}`, 'btn', () => { players.push({ name: x.name, role: 'player', profileId: x.id }); paintPlayers(); paintOpts(); })));
        const inp = h('input', 'text-input left', '', { placeholder: 'Další hráč (jméno)', maxlength: '14', 'data-test': 'guest-name' });
        const addG = btn(`${icon('plus')}Přidat`, 'btn', () => { const n = inp.value.trim(); if (!n) return; players.push({ name: n, role: 'guest' }); paintPlayers(); paintOpts(); }, { test: 'add-guest' });
        plBox.append(add, h('div', 'm4-row', '', {}));
        plBox.lastChild.append(inp, addG);
        inp.style.flex = '1 1 160px';
      }
    };

    // formát a parametry
    const optBox = h('div', 'panel');
    const paintOpts = () => {
      cfg.players = players;
      optBox.replaceChildren();
      if (mode0 === 'kohout') {
        optBox.append(field('Slovo', seg(KOHOUT_WORDS.map((w) => [w, w]), cfg.word, (v) => { cfg.word = v; }, { test: 'word' })));
      } else {
        const allowed = Object.keys(FORMATS).filter((f) => !(solo || players.length < 2) || (f !== 'série'));
        optBox.append(field('Formát', seg(allowed.map((f) => [f, FORMATS[f]]), cfg.format, (v) => { cfg.format = v; if (v === 'čas' && cfg.scoring !== 'čas' && !cfg.durationSec) cfg.durationSec = 30; if (v === 'série' && !cfg.rounds) cfg.rounds = 3; paintOpts(); }, { test: 'format' })));
        optBox.append(h('div', 'muted', FORMAT_HELP[cfg.format]));
        if (cfg.format === 'pokusy') optBox.append(field('Pokusů na hráče', stepper(cfg.attempts, { min: 1, max: 20, onChange: (v) => { cfg.attempts = v; }, test: 'attempts' })));
        if (cfg.format === 'čas' && cfg.scoring !== 'čas') optBox.append(field('Čas na hráče', stepper(cfg.durationSec || 30, { min: 10, max: 300, step: 10, fmt: (v) => `${v} s`, onChange: (v) => { cfg.durationSec = v; }, test: 'duration' })));
        if (cfg.format === 'do-x') optBox.append(field('Kdo první dá', stepper(cfg.target, { min: 1, max: 20, onChange: (v) => { cfg.target = v; }, test: 'target' })));
        if (cfg.format === 'série') optBox.append(field('Kol', seg([[3, 'Na 2 vítězná (3)'], [5, 'Na 3 vítězná (5)']], cfg.rounds || 3, (v) => { cfg.rounds = v; }, { test: 'rounds' })));
        optBox.append(h('div', 'muted', `Počítání: ${SCORINGS[cfg.scoring]}${cfg.scoring === 'čas' ? (cfg.better === 'lower' ? ', vyhrává kratší čas' : ', vyhrává delší čas') : ''}`));
      }
      const hc = (ch.handicap || []);
      if (hc.length && players.some((x) => x.role === 'dad') && players.length > 1) {
        optBox.append(field('Hendikep pro tátu', seg([['', 'Bez'], ...hc.map((t) => [t, t])], cfg.handicap || '', (v) => { cfg.handicap = v || null; }, { test: 'handicap' })));
        optBox.lastChild.querySelector('.seg').style.gridAutoFlow = 'row';
      }
      if (solo) {
        const pb = personalBest(duels, ch.id, p.id);
        optBox.append(h('div', 'm4-note', pb == null ? 'Zatím žádný rekord. První výsledek bude tvůj rekord.' : `Tvůj rekord: <b>${escapeHtml(fmtScore(cfg, pb))}</b>. Porazíš ho?`));
      }
    };
    paintPlayers(); paintOpts();
    right.append(plBox, optBox);

    const start = btn(`${icon('play')}Začít souboj`, 'btn-primary btn-big', () => safety(), { auto: true, test: 'duel-start' });
    if (solo) start.innerHTML = `${icon('play')}Začít`;
    right.append(start);

    const safety = () => {
      if (!players.length) return;
      stopVoice();
      el.replaceChildren(header('Bezpečnost', 'Než začneme', () => { stopVoice(); go('duelSetup', { profileId, challengeId, solo, players }, { replace: true }); }));
      const box = h('div', 'm4-col'); box.dataset.test = 'duel-safety';
      for (const [ic, t] of [['users', 'Nikdo v dosahu hole, diváci stojí za střelcem.'], ['warn', 'Hůl pod pasem, žádný velký nápřah.'], ['shield', 'Křehké věci pryč, cíl u zdi.'], ['lock', 'Tablet stranou, mimo dráhu míčku.']]) {
        box.append(h('div', 'm4-note', `${icon(ic)} <b>${t}</b>`));
      }
      if (ch.safety) box.append(h('div', 'muted', escapeHtml(ch.safety)));
      if (hol) box.append(h('div', 'm4-note warn', escapeHtml(hol)));
      el.append(box, btn(`${icon('check')}Je to bezpečné, jdeme na to`, 'btn-primary btn-big', () => {
        stopVoice();
        go('duelPlay', { profileId: p.id, cfg: { ...cfg, players: players.map((x) => ({ ...x })) } }, { replace: true });
      }, { auto: true, test: 'safety-ok' }));
      say('duel_safety', { kind: 'phrase' });
      if (hol) say('duel_home_only', { kind: 'phrase' });
    };

    // hlas: úvod výzvy (+ „jen domácí frajeřinka“)
    registerTexts({ [`challenge_${ch.id}`]: ch.voiceIntro || `${ch.name}. ${ch.rules || ''}` });
    if (ch.voiceIntro) say(`challenge_${ch.id}`, { kind: 'phrase', text: ch.voiceIntro });
    else sayText(`Výzva ${ch.name}!`);
    if (hol) say('duel_home_only', { kind: 'phrase' });
  })();
  return el;
}

/** Formulář vlastní výzvy (nová, úprava, nebo z knihovní výzvy „odraz“ s fotkou). */
export function customChallengeScreen({ profileId, editId = null, baseId = null }, { go, back }) {
  const el = h('section', 'screen top m4');
  el.dataset.test = 'custom-form';
  (async () => {
    const base = editId ? await getChallenge(editId) : baseId ? await getChallenge(baseId) : null;
    const c = base ? { ...base, ...(editId ? {} : { id: null, name: `${base.name} doma`, custom: true }) } : { name: '', rules: '', format: 'pokusy', scoring: 'trefy', attempts: 5, target: 3, durationSec: 30, better: 'higher' };
    const newPhotos = [];
    el.append(header(editId ? 'Úprava výzvy' : 'Nová výzva', editId ? 'Upravit výzvu' : 'Vlastní výzva', () => { newPhotos.forEach((id) => removeMedia(id)); back(); }));
    const split = h('div', 'm4-split');
    const left = h('div', 'm4-col'); const right = h('div', 'm4-col');
    split.append(left, right); el.append(split);

    const name = h('input', 'text-input left', '', { maxlength: '40', placeholder: 'Např. Trefa do koše', 'data-test': 'cc-name' });
    name.value = c.name || '';
    const rules = h('textarea', 'm4-textarea', '', { maxlength: '400', placeholder: 'Pravidla: odkud se střílí, co je trefa…', 'data-test': 'cc-rules' });
    rules.value = c.rules || '';
    left.append(field('Název', name), field('Pravidla', rules));

    const opts = h('div', 'panel');
    const paint = () => {
      opts.replaceChildren(
        field('Formát', seg(Object.entries(FORMATS), c.format, (v) => { c.format = v; paint(); }, { test: 'cc-format' })),
        field('Počítání', seg(Object.entries(SCORINGS), c.scoring, (v) => { c.scoring = v; paint(); }, { test: 'cc-scoring' })),
      );
      if (c.format === 'pokusy' || c.format === 'série') opts.append(field(c.format === 'série' ? 'Kol' : 'Pokusů na hráče', stepper(c.attempts || 5, { min: 1, max: 20, onChange: (v) => { c.attempts = v; }, test: 'cc-attempts' })));
      if (c.format === 'čas' && c.scoring !== 'čas') opts.append(field('Čas na hráče', stepper(c.durationSec || 30, { min: 10, max: 300, step: 10, fmt: (v) => `${v} s`, onChange: (v) => { c.durationSec = v; } })));
      if (c.format === 'do-x') opts.append(field('Kdo první dá', stepper(c.target || 3, { min: 1, max: 20, onChange: (v) => { c.target = v; } })));
      if (c.scoring === 'čas') opts.append(field('Kdo vyhrává', seg([['lower', 'Kratší čas'], ['higher', 'Delší čas']], c.better || 'lower', (v) => { c.better = v; })));
      opts.append(field('Je to podle pravidel florbalu?', seg([[false, 'Ano, i v zápase'], [true, 'Jen doma']], !!c.homeOnly, (v) => { c.homeOnly = v; }, { test: 'cc-home' })));
    };
    paint();
    left.append(opts);

    // fotky cíle a mantinelu
    const photoField = (label, nameKey, photoKey, ph) => {
      const box = h('div', 'panel');
      const inp = h('input', 'text-input left', '', { maxlength: '40', placeholder: ph });
      inp.value = c[nameKey] || '';
      inp.addEventListener('input', () => { c[nameKey] = inp.value; });
      const pic = h('div', 'm4-photo', `${icon('camera')}&nbsp;Bez fotky`);
      const show = async () => { const u = await mediaUrl(c[photoKey]); pic.innerHTML = u ? `<img src="${u}" alt="${escapeHtml(label)}">` : `${icon('camera')}&nbsp;Bez fotky`; };
      show();
      const row = h('div', 'm4-row');
      row.append(btn(`${icon('camera')}Vyfotit`, 'btn', async () => {
        const f = await pickPhoto(); if (!f) return;
        try { const id = await savePhoto(f); newPhotos.push(id); c[photoKey] = id; show(); } catch (e) { pic.textContent = 'Fotku se nepodařilo uložit.'; }
      }, { test: `photo-${photoKey}` }));
      row.append(btn(`${icon('trash')}Bez fotky`, 'btn', () => { c[photoKey] = null; show(); }));
      box.append(h('div', 'eyebrow', label), inp, pic, row);
      return box;
    };
    right.append(photoField('Cíl', 'targetName', 'targetPhoto', 'Např. branka, kelímek, krabice'), photoField('Mantinel (od čeho se odráží)', 'wallName', 'wallPhoto', 'Např. noha gauče, zeď'));

    const save = btn(`${icon('check')}Uložit výzvu`, 'btn-primary btn-big', async () => {
      c.name = name.value; c.rules = rules.value;
      if (!c.name.trim()) { name.focus(); name.style.borderColor = 'var(--danger)'; return; }
      if (c.format === 'série') c.rounds = c.attempts;
      const row = await saveCustom(c);
      if (!editId) await bump(profileId, { custom: 1 });
      go('duelSetup', { profileId, challengeId: row.id }, { replace: true });
    }, { test: 'cc-save' });
    el.append(save);
  })();
  return el;
}
