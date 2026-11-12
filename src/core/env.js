// Přepínače z URL: ?demo = ukázkový hráč, ?fast=1 = zrychlený přehrávač (jen pro testy), ?nointro = bez úvodní animace.
const q = new URLSearchParams(location.search);
export const FAST = q.has('fast');
export const DEMO = q.has('demo');
export const NO_INTRO = q.has('nointro') || FAST;
/** Násobek času fází přehrávače (ukázka, odpočet, cvik, odpočinek). */
export const TIME_SCALE = FAST ? 0.08 : 1;
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';
