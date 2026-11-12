import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

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
        background_color: '#0B0E14',
        theme_color: '#0B0E14',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2,mp3,wav,json,webmanifest}'],
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
