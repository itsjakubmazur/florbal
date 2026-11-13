// Použije uložené nastavení na běžící appku: vzhled, hlasitosti, režim hlasu.
// Volá se při startu (main.js) a po obnovení ze zálohy (Rodiče), aby obnovená volba platila hned (QA N6).
import { settings } from '../storage/index.js';
import { applyTheme } from '../ui/tokens.js';
import { setVolume, setVoiceMode, getVoiceMode } from './audio.js';

export async function applySettings() {
  const s = await settings.load();
  applyTheme(s.theme);
  setVolume('voice', s.volVoice); setVolume('beep', s.volBeep); setVoiceMode(s.voiceMode);
  return { ...s, voiceMode: getVoiceMode() }; // neznámá hodnota (např. ze zálohy) → normalizovaná „voice“
}
