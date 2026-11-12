// Design tokeny – jediný zdroj pravdy pro barvy, typografii, rozměry a pohyb (docs/DESIGN.md).
// Komponenty používají jen CSS proměnné (var(--signal) …), nikdy natvrdo barvy. Téma se přepíná applyTheme(id).
// Kontrasty (WCAG) jsou spočítané v docs/DESIGN.md; při změně hodnoty je přepočítej.

/** Barvy kuželů (pojmenované, appka je umí říct). Stejné ve všech tématech: odpovídají skutečným kuželům.
 *  Číslo na kuželu je vždy tmavé (kontrast 5,6–16,5 : 1); bílé na červené/modré by AA nesplnilo. */
const CONE_INK = '#0A1430';
export const CONE_COLORS = {
  red: { hex: '#FF4D5E', name: 'červená', ink: CONE_INK },
  blue: { hex: '#4DA6FF', name: 'modrá', ink: CONE_INK },
  yellow: { hex: '#FFD23F', name: 'žlutá', ink: CONE_INK },
  green: { hex: '#2FD27A', name: 'zelená', ink: CONE_INK },
  white: { hex: '#F2F4F8', name: 'bílá', ink: CONE_INK },
};

/** Kovy odměn (bronz, stříbro, zlato, diamant) – ve všech tématech stejné, text na nich tmavý. */
export const TIER_COLORS = { bronze: '#E39A62', silver: '#D9E1EA', gold: '#FFD23F', diamond: '#7FE3FF' };

// Role barev (stejné názvy ve všech tématech):
//  --bg, --bg-2 (hlubší plocha), --surface (karta), --surface-2 (zvýšená: tlačítko, vstup), --line (vlasová čára)
//  --text, --text-2, --muted   tři role textu
//  --brand, --brand-ink, --brand-hi   klubová barva: dres, výběr, průběh; --brand-hi = čitelná varianta pro čáry/text na tmavé
//  --signal, --signal-ink      signální barva pro akci a povel: hlavní tlačítko, odpočet, forhend
//  --fh / --bh (+ -ink)        forhend × bekhend (barva i tvar: kruh × čtverec)
//  --floor, --floor-line, --mantinel   palubovka, čáry, mantinel (signature)
//  --jersey, --jersey-trim, --jersey-num   dres hráče
export const THEMES = {
  // Výchozí: večerní hala Hattricku. Pozadí tónované do klubové navy (#0C3178), modrá palubovka, bílé mantinely,
  // jantarová signální barva jako protiváha modré (oranžovo-modrá dvojice je čitelná i při poruchách barvocitu).
  hattrick: {
    label: 'Hattrick',
    club: true,
    '--bg': '#071330', '--bg-2': '#0A1838', '--surface': '#0F2148', '--surface-2': '#172D5C',
    '--line': 'rgba(214,228,255,.13)', '--line-strong': 'rgba(214,228,255,.24)',
    '--text': '#F3F7FD', '--text-2': '#B9C7DE', '--muted': '#9FB0CE',
    '--brand': '#0961AF', '--brand-ink': '#FFFFFF', '--brand-hi': '#5AA2EC', '--brand-deep': '#0C3178',
    '--signal': '#FFB81C', '--signal-ink': '#071330',
    '--danger': '#FF8A8A', '--ok': '#4CC38A',
    '--fh': '#FFB81C', '--fh-ink': '#071330', '--bh': '#5CCBFF', '--bh-ink': '#071330',
    '--floor': '#0B2552', '--floor-line': 'rgba(255,255,255,.09)', '--mantinel': '#E8EEF8',
    '--stick': '#E6ECF5', '--ball': '#FFFFFF', '--ball-edge': '#0A1430', '--ball-hole': '#B8C4D8', '--player': '#5C7099', '--cone-edge': 'rgba(4,10,28,.55)',
    '--jersey': '#0961AF', '--jersey-trim': '#0C3178', '--jersey-num': '#FFFFFF', '--jersey-num-edge': '#0C3178',
    '--scrim': 'rgba(4,10,28,.9)', '--patch': '#FFFFFF',
  },
  // Neutrální: pro děti z jiných klubů. Grafitová, bez loga, akcent tyrkysová; povel a forhend/bekhend stejné.
  neutral: {
    label: 'Neutrální',
    club: false,
    '--bg': '#121315', '--bg-2': '#0E0F11', '--surface': '#1A1B1E', '--surface-2': '#25272B',
    '--line': 'rgba(237,237,237,.11)', '--line-strong': 'rgba(237,237,237,.22)',
    '--text': '#EDEDED', '--text-2': '#B4B4BA', '--muted': '#9A9AA2',
    '--brand': '#127F6D', '--brand-ink': '#FFFFFF', '--brand-hi': '#3CC4AC', '--brand-deep': '#0B4F44',
    '--signal': '#FFB81C', '--signal-ink': '#121315',
    '--danger': '#FF8A8A', '--ok': '#4CC38A',
    '--fh': '#FFB81C', '--fh-ink': '#121315', '--bh': '#5CCBFF', '--bh-ink': '#121315',
    '--floor': '#1C1E22', '--floor-line': 'rgba(255,255,255,.08)', '--mantinel': '#E6E6E6',
    '--stick': '#E6E6E6', '--ball': '#FFFFFF', '--ball-edge': '#121315', '--ball-hole': '#BDBDC4', '--player': '#6B6E76', '--cone-edge': 'rgba(0,0,0,.5)',
    '--jersey': '#E9ECEF', '--jersey-trim': '#127F6D', '--jersey-num': '#121315', '--jersey-num-edge': '#E9ECEF',
    '--scrim': 'rgba(10,10,12,.9)', '--patch': '#FFFFFF',
  },
  // Vysoký kontrast: světlá místnost nebo slunce na displeji.
  kontrast: {
    label: 'Vysoký kontrast',
    club: false,
    '--bg': '#000000', '--bg-2': '#000000', '--surface': '#111111', '--surface-2': '#1E1E1E',
    '--line': 'rgba(255,255,255,.3)', '--line-strong': 'rgba(255,255,255,.5)',
    '--text': '#FFFFFF', '--text-2': '#E0E0E0', '--muted': '#C8C8C8',
    '--brand': '#FFFFFF', '--brand-ink': '#000000', '--brand-hi': '#FFFFFF', '--brand-deep': '#444444',
    '--signal': '#FFE600', '--signal-ink': '#000000',
    '--danger': '#FF7070', '--ok': '#00FF88',
    '--fh': '#FFE600', '--fh-ink': '#000000', '--bh': '#00E5FF', '--bh-ink': '#000000',
    '--floor': '#0A0A0A', '--floor-line': 'rgba(255,255,255,.16)', '--mantinel': '#FFFFFF',
    '--stick': '#FFFFFF', '--ball': '#FFFFFF', '--ball-edge': '#000000', '--ball-hole': '#9A9A9A', '--player': '#8A8A8A', '--cone-edge': 'rgba(0,0,0,.7)',
    '--jersey': '#FFFFFF', '--jersey-trim': '#FFE600', '--jersey-num': '#000000', '--jersey-num-edge': '#FFFFFF',
    '--scrim': 'rgba(0,0,0,.92)', '--patch': '#FFFFFF',
  },
};
export const DEFAULT_THEME = 'hattrick';

/**
 * Rozměry, písmo a pohyb (nezávislé na tématu).
 * --u = 1/100 kratší strany „virtuální obrazovky“ (styles.css); mimo trénink se z něj škáluje písmo a mezery.
 * V tréninku se velikosti počítají z vh (čitelnost ze 3 m, SPEC kap. 6).
 */
export const SCALE = {
  // písmo: Archivo (variabilní šířka 62–125 %, váha 100–900) – jedna rodina, dvě šířky
  '--font': "'Archivo Variable', 'Archivo', system-ui, -apple-system, sans-serif",
  '--wide-normal': '100%', '--wide-cond': '78%',
  // typová škála mimo trénink (iPad 1180 × 820 → px v komentáři)
  '--fs-small': 'max(15px, calc(var(--u) * 1.45))',   // 17 px
  '--fs-body': 'max(17px, calc(var(--u) * 1.7))',     // 20 px
  '--fs-lead': 'max(19px, calc(var(--u) * 2.1))',     // 25 px
  '--fs-title': 'max(28px, calc(var(--u) * 3.6))',    // 42 px
  '--fs-display': 'max(40px, calc(var(--u) * 6))',    // 71 px
  // typová škála v tréninku (min. 28 px na iPadu)
  '--fs-train-meta': 'max(28px, 3.6vh)',              // 30 px
  '--fs-train-name': 'max(28px, 5.6vh)',              // 46 px
  '--fs-train-task': 'max(28px, 4vh)',                // 33 px
  '--fs-train-word': 'max(32px, 8vh)',                // 66 px
  '--fs-train-timer': 'max(56px, 13vh)',              // 107 px
  // mezery: mřížka 4 px
  '--sp-1': '4px', '--sp-2': '8px', '--sp-3': '12px', '--sp-4': '16px', '--sp-5': '24px', '--sp-6': '32px', '--sp-7': '48px', '--sp-8': '64px',
  // poloměry: ovládací prvek < karta < panel; mantinel = roh hřiště (signature) na kartách a stanovišti
  '--r-sm': '8px', '--r-btn': '14px', '--r-card': '24px', '--r-mantinel': '32px',
  // dotykové plochy
  '--tap': '56px',                                    // mimo trénink
  '--tap-big': 'max(88px, calc(var(--u) * 8))',       // v tréninku a hlavní akce
  // pohyb: jedna křivka, tři délky
  '--ease': 'cubic-bezier(0.22, 1, 0.36, 1)', '--t-fast': '140ms', '--t-mid': '200ms', '--t-slow': '360ms',
};

export function cssVars(themeId = DEFAULT_THEME) {
  const t = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const v = { ...SCALE };
  for (const [k, val] of Object.entries(t)) if (k.startsWith('--')) v[k] = val;
  for (const [k, c] of Object.entries(CONE_COLORS)) { v[`--cone-${k}`] = c.hex; v[`--cone-${k}-ink`] = c.ink; }
  for (const [k, c] of Object.entries(TIER_COLORS)) v[`--tier-${k}`] = c;
  v['--tier-ink'] = CONE_INK;
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
/** Má aktuální téma klubovou identitu (logo Hattricku na dresu a úvodu)? */
export const themeHasClub = () => !!(THEMES[current] && THEMES[current].club);

// Tailwind (tailwind.config.js) čte barvy jako proměnné, aby utility třídy respektovaly téma.
export const colors = {
  bg: 'var(--bg)', surface: 'var(--surface)', text: 'var(--text)', muted: 'var(--muted)',
  brand: 'var(--brand)', signal: 'var(--signal)', fh: 'var(--fh)', bh: 'var(--bh)',
};
