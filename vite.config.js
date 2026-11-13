import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import pkg from './package.json' with { type: 'json' };

// THIRD-PARTY.txt do dist/: licence všeho, co jde do buildu (OFL, MIT, ISC chtějí text licence u každé kopie).
// Appka ho ukáže v Rodiče → O appce (precache = i offline). Seznam a důvody: LICENSES.md.
function thirdParty() {
  const read = (f) => fs.readFileSync(f, 'utf8').trim();
  const mit = read('LICENSE').replace(/^(Copyright.*\n?)+/m, '__COPY__\n');
  const parts = [
    ['Florbal Trenér – zdrojový kód (vychází z projektu Tréninková podložka, Jakub Uhlíř)', 'MIT', read('LICENSE')],
    ['Písmo Archivo (Omnibus-Type), balíček @fontsource-variable/archivo', 'SIL Open Font License 1.1', read('node_modules/@fontsource-variable/archivo/LICENSE')],
    ['Ikony Lucide (lucide.dev), balíček lucide-static', 'ISC', read('node_modules/lucide-static/LICENSE')],
    ['NoSleep.js 0.12.0 – tichá videa pro „nezhasínat“', 'MIT', mit.replace('__COPY__', 'Copyright (c) Rich Tibbett')],
    ['Workbox (service worker, offline režim)', 'MIT', read('node_modules/workbox-core/LICENSE')],
  ];
  const text = ['Florbal Trenér – licence součástí třetích stran', '='.repeat(48), '',
    'Hlas Trenéra: nahrávky Microsoft Edge TTS (cs-CZ-AntoninNeural), jen pro soukromé rodinné použití – viz LICENSES.md.',
    'Grafika, metronom a zvukové efekty jsou vlastní (kreslené a syntetizované kódem).', '',
    ...parts.flatMap(([name, lic, body]) => ['-'.repeat(72), `${name}`, `Licence: ${lic}`, '', body, '']),
  ].join('\n');
  return { name: 'third-party-licenses', generateBundle() { this.emitFile({ type: 'asset', fileName: 'THIRD-PARTY.txt', source: text }); } };
}

// Statický build (dist/) + service worker (Workbox, generateSW). Žádné serverové funkce: jde nasadit kamkoli (Vercel, Netlify, GitHub Pages…).
// public/ = soubory servírované jak jsou (ikony, favicon). assets/ = zdroje importované z kódu (hlasy, logo) – Vite jim dá hash.
export default defineConfig({
  base: './',
  publicDir: 'public',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: { target: 'es2020', outDir: 'dist', assetsInlineLimit: 0 },
  server: { host: true, port: 5173 },
  preview: { port: 4173 },
  plugins: [
    thirdParty(),
    VitePWA({
      registerType: 'prompt',          // nová verze se nikdy nenainstaluje sama, appka ukáže pruh „aktualizovat“
      injectRegister: false,           // registraci řídí src/core/pwa.js
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Florbal Trenér',
        short_name: 'Florbal',
        description: 'Domácí florbalový trénink s hlasovým trenérem',
        lang: 'cs',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#071330',
        theme_color: '#071330',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2,mp3,wav,m4a,json,webmanifest,txt}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        clientsClaim: false,
        skipWaiting: false,
      },
      devOptions: { enabled: false },
    }),
  ],
});
