// Ikony aplikace (PWA manifest, apple-touch-icon, favicon) z jednoho SVG kresleného kódem.
// Spuštění: node scripts/build-icons.mjs
// Rasterizace: rsvg-convert, pokud je v systému; jinak Playwright (Chromium) vyrenderuje SVG do PNG.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const OUT = 'public';
fs.mkdirSync(OUT, { recursive: true });

// barvy z tématu Hattrick (src/ui/tokens.js): navy pozadí, modrá palubovka, bílý mantinel, jantarová čepel (forhend)
const BG = '#0C3178';
const FLOOR = '#0961AF';
const LINE = '#E8EEF8';
const BLADE = '#FFB81C';
const HOLE = '#B8C4D8';

// florbalový míček: bílý kruh s otvory
const holes = (cx, cy, r) => {
  const out = [];
  const ring = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 0.55, Math.sin((i * Math.PI) / 3) * 0.55])];
  for (const [x, y] of ring) out.push(`<circle cx="${cx + x * r}" cy="${cy + y * r}" r="${r * 0.14}" fill="${HOLE}"/>`);
  return out.join('');
};

/** Ikona 512×512. pad = vnitřní okraj (maskable potřebuje bezpečnou zónu ~ 80 %). */
function iconSvg({ pad = 0, rounded = true } = {}) {
  const s = 512;
  const k = (s - pad * 2) / s;
  const g = `translate(${pad} ${pad}) scale(${k})`;
  // palubovka s mantinelem: roh hřiště (signature) vpravo dole, středová čára; přes ni hůl, čepel a míček
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" ${rounded ? 'rx="112"' : ''} fill="${BG}"/>
  <g transform="${g}">
    <path d="M-40 150 H340 A120 120 0 0 1 460 270 V600 H-40 Z" fill="${FLOOR}"/>
    <path d="M-40 150 H340 A120 120 0 0 1 460 270 V600" fill="none" stroke="${LINE}" stroke-width="14" stroke-opacity=".85"/>
    <path d="M96 40 L262 330" stroke="${LINE}" stroke-width="30" stroke-linecap="round"/>
    <path d="M262 330 C 284 382, 340 404, 418 392" stroke="${BLADE}" stroke-width="46" fill="none" stroke-linecap="round"/>
    <circle cx="214" cy="402" r="58" fill="#FFFFFF"/>
    ${holes(214, 402, 58)}
  </g>
</svg>`;
}

const files = {
  'icon.svg': iconSvg(),
  'icon-maskable.svg': iconSvg({ pad: 64, rounded: false }),
};
fs.writeFileSync(`${OUT}/favicon.svg`, files['icon.svg']);
const tmp = 'node_modules/.cache/icons';
fs.mkdirSync(tmp, { recursive: true });
for (const [n, svg] of Object.entries(files)) fs.writeFileSync(`${tmp}/${n}`, svg);

const targets = [
  ['icon.svg', 'pwa-192.png', 192],
  ['icon.svg', 'pwa-512.png', 512],
  ['icon-maskable.svg', 'pwa-maskable-512.png', 512],
  ['icon-maskable.svg', 'apple-touch-icon.png', 180], // iOS si rohy zaobluje sám
];

const hasRsvg = spawnSync('rsvg-convert', ['--version']).status === 0;
if (hasRsvg) {
  for (const [src, out, size] of targets) {
    const r = spawnSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', `${OUT}/${out}`, `${tmp}/${src}`]);
    if (r.status !== 0) throw new Error(`rsvg-convert selhal: ${r.stderr}`);
    console.log('OK', out);
  }
} else {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [src, out, size] of targets) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${files[src].replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
    await page.screenshot({ path: `${OUT}/${out}`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    console.log('OK', out);
  }
  await browser.close();
}
