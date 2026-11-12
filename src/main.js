import './ui/styles.css';
import { applyTheme } from './ui/tokens.js';
import { register, go } from './core/router.js';
import { installAudioUnlock, setVolume, setVoiceMode, preloadCommon } from './core/audio.js';
import { initPwa, _simulateUpdate, isBusy } from './core/pwa.js';
import { DEMO, NO_INTRO, FAST } from './core/env.js';
import { settings, requestPersist } from './storage/index.js';
import profiles, { newPlayer } from './screens/profiles.js';
import home from './screens/home.js';
import player from './screens/player.js';
import result from './screens/result.js';
import setup from './screens/setup.js';
import parent, { pinScreen, pinResetScreen, setPinScreen } from './screens/parent.js';
import { drillsScreen, stationsScreen } from './screens/library.js';
import rewards, { levels } from './screens/rewards.js';
import intro from './screens/intro.js';
// M4: Souboje a frajeřinky, testy, karty, zápas
import arena from './screens/arena.js';
import { duelsScreen, duelSetupScreen, customChallengeScreen } from './screens/duels.js';
import duelPlay from './screens/duelPlay.js';
import duelStats from './screens/duelStats.js';
import { tricksScreen, trickScreen } from './screens/tricks.js';
import { skillTestsScreen, skillTestScreen } from './screens/skilltests.js';
import cardsScreen from './screens/cards.js';
import { matchScreen } from './screens/quick.js';

// D-pad vrstva (src/core/focus.js) zůstává pro budoucí TV režim; ve v1 se initFocus() nevolá.
applyTheme();

register('intro', intro);
register('profiles', profiles);
register('newPlayer', newPlayer);
register('home', home);
register('setup', setup);
register('player', player);
register('result', result);
register('pin', pinScreen);
register('pinReset', pinResetScreen);
register('setPin', setPinScreen);
register('parent', parent);
register('drills', drillsScreen);
register('stations', stationsScreen);
register('rewards', rewards);
register('levels', levels);
register('arena', arena);
register('duels', duelsScreen);
register('duelSetup', duelSetupScreen);
register('customChallenge', customChallengeScreen);
register('duelPlay', duelPlay);
register('duelStats', duelStats);
register('tricks', tricksScreen);
register('trick', trickScreen);
register('skilltests', skillTestsScreen);
register('skilltest', skillTestScreen);
register('cards', cardsScreen);
register('match', matchScreen);

installAudioUnlock();
if (FAST) window.__florbalTest = { simulateUpdate: _simulateUpdate, isBusy }; // jen pro Playwright testy (?fast=1)
window.addEventListener('pointerdown', () => preloadCommon(), { once: true, capture: true });

async function boot() {
  try {
    const s = await settings.load();
    applyTheme(s.theme);
    setVolume('voice', s.volVoice); setVolume('beep', s.volBeep); setVoiceMode(s.voiceMode);
  } catch (e) { /* bez databáze appka pořád běží */ }
  requestPersist(); // iOS umí data webu smazat; trvalé úložiště to omezí (stav v Rodičích)
  if (DEMO) { try { await (await import('./dev/demo.js')).ensureDemoPlayer(); } catch (e) { /* bez dema */ } }
  go(NO_INTRO ? 'profiles' : 'intro');
  initPwa();
}
boot();
