// Design tokeny – jediný zdroj pravdy pro barvy, typografii a rozměry.
// Komponenty používají jen CSS proměnné (var(--accent) …), nikdy natvrdo barvy. Téma se přepíná applyTheme(id).
// Finální vizuál dodá designer (docs/DESIGN.md) – stačí upravit hodnoty tady.

/** Barvy kuželů (pojmenované, appka je umí říct). Stejné ve všech tématech, kvůli čitelnosti ze 3 m. */
export const CONE_COLORS = {
  red: { hex: '#FF4D5E', name: 'červená', ink: '#fff' },
  blue: { hex: '#3B9CFF', name: 'modrá', ink: '#fff' },
  yellow: { hex: '#FFD23F', name: 'žlutá', ink: '#14161C' },
  green: { hex: '#2FD27A', name: 'zelená', ink: '#08130D' },
  white: { hex: '#F2F4F8', name: 'bílá', ink: '#14161C' },
};

export const THEMES = {
  // výchozí: tmavá „hala“ + limetkový akcent; forhend/bekhend jasně odlišné (limetka × azurová)
  noc: {
    label: 'Noční hala',
    '--bg': '#0B0E14', '--bg-2': '#121722', '--surface': '#171D2A', '--surface-2': '#202839',
    '--line': 'rgba(255,255,255,.12)', '--text': '#F4F6FA', '--muted': '#97A1B3',
    '--accent': '#C6F432', '--accent-ink': '#10140A', '--accent-rgb': '198,244,50',
    '--accent-2': '#38BDF8', '--accent-2-ink': '#04121B',
    '--danger': '#FF6B6B', '--ok': '#2FD27A',
    '--fh': '#C6F432', '--fh-ink': '#10140A', '--bh': '#38BDF8', '--bh-ink': '#04121B',
    '--floor': '#141A26', '--floor-line': 'rgba(255,255,255,.07)', '--stick': '#E8ECF2', '--ball': '#FFFFFF', '--player': '#5B6475',
  },
  // vysoký kontrast pro světlou místnost / slunce
  kontrast: {
    label: 'Vysoký kontrast',
    '--bg': '#000000', '--bg-2': '#0A0A0A', '--surface': '#141414', '--surface-2': '#1F1F1F',
    '--line': 'rgba(255,255,255,.25)', '--text': '#FFFFFF', '--muted': '#C4C4C4',
    '--accent': '#FFE600', '--accent-ink': '#000000', '--accent-rgb': '255,230,0',
    '--accent-2': '#00E5FF', '--accent-2-ink': '#000000',
    '--danger': '#FF5050', '--ok': '#00FF88',
    '--fh': '#FFE600', '--fh-ink': '#000000', '--bh': '#00E5FF', '--bh-ink': '#000000',
    '--floor': '#0A0A0A', '--floor-line': 'rgba(255,255,255,.14)', '--stick': '#FFFFFF', '--ball': '#FFFFFF', '--player': '#7A7A7A',
  },
};
export const DEFAULT_THEME = 'noc';

/** Rozměry a typografie (nezávislé na tématu). --u = 1/100 kratší strany (viz styles.css). */
export const SCALE = {
  '--r-card': 'calc(var(--u) * 1.6)', '--r-btn': 'calc(var(--u) * 1.2)', '--r-sm': 'calc(var(--u) * .7)',
  '--font': "'Inter', system-ui, -apple-system, sans-serif",
  '--tap': 'max(64px, calc(var(--u) * 7))',   // minimální dotyková plocha
  '--tap-big': 'max(88px, calc(var(--u) * 10))',
};

export function cssVars(themeId = DEFAULT_THEME) {
  const t = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const v = { ...SCALE };
  for (const [k, val] of Object.entries(t)) if (k.startsWith('--')) v[k] = val;
  for (const [k, c] of Object.entries(CONE_COLORS)) { v[`--cone-${k}`] = c.hex; v[`--cone-${k}-ink`] = c.ink; }
  return v;
}

let current = DEFAULT_THEME;
export function applyTheme(themeId = DEFAULT_THEME) {
  current = THEMES[themeId] ? themeId : DEFAULT_THEME;
  const root = document.documentElement;
  Object.entries(cssVars(current)).forEach(([k, val]) => root.style.setProperty(k, val));
  root.dataset.theme = current;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEMES[current]['--bg']);
}
export const currentTheme = () => current;

// Tailwind (tailwind.config.js) čte barvy jako proměnné, aby utility třídy respektovaly téma.
export const colors = {
  bg: 'var(--bg)', surface: 'var(--surface)', text: 'var(--text)', muted: 'var(--muted)',
  accent: 'var(--accent)', accent2: 'var(--accent-2)', fh: 'var(--fh)', bh: 'var(--bh)',
};
