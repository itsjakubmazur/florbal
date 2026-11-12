// Výběr hráče a průvodce „Nový hráč“ / úprava profilu (jedna otázka na obrazovku, velká tlačítka).
import { h, btn, u, jerseyEl, icon, escapeHtml, seg } from '../ui/dom.js';
import { listProfiles, createProfile, getProfile, saveProfile, profileRank, SKILL_LEVELS, SESSION_LENGTHS, PROFILE_DEFAULTS } from '../domain/profiles.js';
import { SPACE_LABELS } from '../domain/stations.js';
import { sfx } from '../core/audio.js';
import { themeHasClub } from '../ui/tokens.js';
import { clubLogo } from '../ui/dom.js';

export default function profiles(_p, { go }) {
  const el = h('section', 'screen');
  el.dataset.test = 'profiles';
  const brand = h('div', 'brand-row');
  if (themeHasClub()) brand.append(h('img', 'brand-logo', '', { src: clubLogo, alt: 'FBŠ Hattrick Brno', width: '270', height: '200' }));
  brand.append(h('div', 'brand-name', 'Florbal Trenér'));
  el.append(brand, h('div', 'title', 'Kdo dnes trénuje?'));
  const row = h('div', 'player-cards');
  el.append(row);
  (async () => {
    const list = await listProfiles();
    list.forEach((p) => {
      const c = btn('', 'card player-card', () => { sfx('tap'); go('home', { profileId: p.id }); }, { test: 'profile-card' });
      c.append(jerseyEl(p, 15), h('div', 'player-card-name', escapeHtml(p.name)), h('div', 'label', profileRank(p).name));
      row.append(c);
    });
    const add = btn(`${icon('plus')}<span>Nový hráč</span>`, 'card tile player-card add', () => go('newPlayer', {}), { test: 'new-player' });
    row.append(add);
    el.append(btn(`${icon('lock')}Rodiče`, 'btn btn-quiet', () => go('pin', { next: 'parent' }), { test: 'parent' }));
  })();
  return el;
}

/** Obrázek držení hole: postavička zepředu (jak ji vidí tablet), hůl na straně držení. */
export function gripPicture(grip, size = 16) {
  const m = grip === 'left' ? -1 : 1; // kreslíme z pohledu hráče: pravák má hůl vpravo
  const d = h('div', '');
  d.style.cssText = `width:${u(size)};height:${u(size)};min-width:90px;min-height:90px`;
  d.innerHTML = `<svg viewBox="-60 -10 120 120" width="100%" height="100%" aria-hidden="true">
    <circle cx="0" cy="12" r="11" fill="var(--text)"/>
    <rect x="-14" y="26" width="28" height="40" rx="10" fill="var(--player)"/>
    <path d="M${m * -8} 40 L${m * 30} 100" stroke="var(--stick)" stroke-width="6" stroke-linecap="round"/>
    <path d="M${m * 30} 100 q${m * 6} 6 ${m * 22} 4" stroke="var(--fh)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="${m * 8}" cy="44" r="5" fill="var(--text)"/><circle cx="${m * 16}" cy="60" r="5" fill="var(--text)"/>
    <rect x="-12" y="64" width="9" height="34" rx="4" fill="var(--player)"/><rect x="3" y="64" width="9" height="34" rx="4" fill="var(--player)"/>
  </svg>`;
  return d;
}

const STEPS = ['name', 'age', 'grip', 'level', 'length', 'space', 'cones', 'jersey'];
const TITLES = {
  name: 'Jak se jmenuješ?', age: 'Kolik ti je let?', grip: 'Na které straně držíš hůl?', level: 'Jak už ti to jde?',
  length: 'Jak dlouho chceš trénovat?', space: 'Kolik máš doma místa?', cones: 'Kolik máš kuželů nebo značek?', jersey: 'Jaké máš číslo dresu?',
};

export function newPlayer({ editId = null }, { go, back }) {
  const el = h('section', 'screen');
  el.dataset.test = 'new-player';
  const state = { ...PROFILE_DEFAULTS, name: '' };
  let i = 0;
  let original = null;
  const eyebrow = h('div', 'label');
  const title = h('div', 'title');
  const body = h('div', 'flex flex-col items-center w-full'); body.style.cssText += `;gap:${u(2)};min-height:${u(26)};justify-content:center`;
  const nav = h('div', 'flex flex-wrap justify-center'); nav.style.gap = u(2);
  el.append(title, eyebrow, body, nav);

  const choice = (opts, key, cols) => {
    const box = seg(opts, state[key], (v) => { state[key] = v; }, { test: `opt-${key}` });
    box.style.width = `min(100%, ${u(cols * 15)})`;
    box.querySelectorAll('.btn').forEach((b) => { b.style.minHeight = 'var(--tap-big)'; b.style.fontSize = `max(18px, ${u(2.6)})`; });
    return box;
  };

  const render = () => {
    const id = STEPS[i];
    eyebrow.textContent = `${editId ? 'Úprava hráče' : 'Nový hráč'}, krok ${i + 1} z ${STEPS.length}`;
    title.textContent = TITLES[id];
    body.replaceChildren(); nav.replaceChildren();
    if (id === 'name') {
      const inp = h('input', 'text-input', '', { type: 'text', maxlength: '20', placeholder: 'Jméno', autocomplete: 'off', autocapitalize: 'words', 'data-test': 'name-input' });
      inp.value = state.name;
      inp.addEventListener('input', () => { state.name = inp.value; });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') next(); });
      body.append(inp);
      setTimeout(() => inp.focus(), 50);
    } else if (id === 'age') body.append(choice([5, 6, 7, 8, 9, 10, 11, 12].map((a) => [a, String(a)]), 'age', 8));
    else if (id === 'grip') {
      const row = h('div', 'flex flex-wrap justify-center'); row.style.gap = u(2);
      const cards = [['left', 'Vlevo', 'levák'], ['right', 'Vpravo', 'pravák']].map(([v, label, sub]) => {
        const c = btn('', `card flex flex-col items-center${state.grip === v ? ' on' : ''}`, () => { state.grip = v; cards.forEach(([vv, cc]) => cc.classList.toggle('on', vv === v)); }, { test: `grip-${v}` });
        c.style.cssText += `;gap:${u(0.8)};width:max(150px, ${u(24)})`;
        c.append(gripPicture(v, 18), h('div', '', `<b style="font-size:max(20px, ${u(2.8)})">${label}</b>`), h('div', 'muted', sub));
        row.append(c); return [v, c];
      });
      body.append(row, h('div', 'muted', 'Čepel je u nohy na té straně, kde držíš hůl níž. Podle toho Trenér ukazuje forhend a bekhend.'));
    } else if (id === 'level') body.append(choice(Object.entries(SKILL_LEVELS).map(([k, v]) => [Number(k), v]), 'level', 5));
    else if (id === 'length') body.append(choice(SESSION_LENGTHS.map((m) => [m, `${m} min`]), 'sessionLength', 4));
    else if (id === 'space') body.append(choice(Object.entries(SPACE_LABELS), 'space', 3), h('div', 'muted', 'Malý prostor = cviky na místě, třeba v pokoji. Velký = chodba nebo garáž.'));
    else if (id === 'cones') body.append(choice([[2, '2'], [3, '3'], [4, '4'], [5, '5 a víc']], 'cones', 4), h('div', 'muted', 'Místo kuželů můžeš použít boty, ponožky nebo lepicí pásku.'));
    else if (id === 'jersey') {
      const inp = h('input', 'text-input', '', { type: 'text', inputmode: 'numeric', maxlength: '2', placeholder: '—', 'data-test': 'jersey-input' });
      inp.value = state.jersey;
      const prev = h('div', '');
      const paint = () => prev.replaceChildren(jerseyEl(state, 14));
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 2); state.jersey = inp.value; paint(); });
      paint();
      body.append(prev, inp);
    }
    nav.append(btn(`${icon('back')}Zpět`, 'btn', () => { if (i === 0) back(); else { i--; render(); } }, { test: 'wizard-back' }));
    const last = i === STEPS.length - 1;
    nav.append(btn(last ? `${icon('check')}Hotovo` : `Další${icon('right')}`, 'btn-primary btn-big', () => next(), { auto: true, test: last ? 'wizard-done' : 'wizard-next' }));
  };
  async function next() {
    if (STEPS[i] === 'name' && !state.name.trim()) { body.querySelector('input')?.focus(); return; }
    if (i < STEPS.length - 1) { i++; render(); return; }
    const data = { name: state.name.trim(), age: state.age, grip: state.grip, level: state.level, sessionLength: state.sessionLength, space: state.space, cones: state.cones, jersey: state.jersey };
    if (original) { await saveProfile({ ...original, ...data }); sfx('success'); go('home', { profileId: original.id }, { replace: true }); return; }
    const p = await createProfile(data);
    sfx('success');
    go('home', { profileId: p.id }, { replace: true });
  }
  if (editId) getProfile(editId).then((p) => { if (p) { original = p; Object.assign(state, p); } render(); });
  else render();
  return el;
}
