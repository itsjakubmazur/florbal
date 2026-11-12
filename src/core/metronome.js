// Metronom: look-ahead scheduler (Chris Wilson, „A Tale of Two Clocks“) na AudioContext.currentTime.
// Každých 25 ms naplánuje všechny údery do horizontu 100 ms přesně na čas audia (žádný drift z setInterval).
// UI callback onBeat(i, time) se volá, když čas audia dosáhne času úderu (kontrola v rAF i v 25ms ticku),
// takže animace a povely jsou svázané s hodinami audia, ne s časovači JS.
// Když AudioContext neběží (zvuk ještě není odemčený, testy), použijí se hodiny performance.now() – bez pípání.
import { getCtx, beepOut } from './audio.js';

const TICK_MS = 25;
const HORIZON = 0.1;

/**
 * @param {object} o
 * @param {number} o.bpm         údery za minutu (1 úder = 1 krok patternu)
 * @param {(i:number, time:number, late:number)=>void} o.onBeat
 * @param {'tick'|'beep'|false} o.click  zvuk úderu
 * @param {number} [o.accentEvery] každý N-tý úder vyšší tón
 */
export function createMetronome({ bpm, onBeat, click = 'tick', accentEvery = 0 }) {
  let timer = null; let raf = 0;
  let next = 0; let beat = 0;
  let pending = [];
  let useAudio = false;
  const ctx = getCtx();
  const now = () => (useAudio ? ctx.currentTime : performance.now() / 1000);

  function schedule(i, t) {
    if (!useAudio || !click) return;
    const out = beepOut();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    const accent = accentEvery && i % accentEvery === 0;
    o.type = click === 'beep' ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(click === 'beep' ? (accent ? 1320 : 880) : (accent ? 1500 : 1100), t);
    const peak = click === 'beep' ? 0.5 : 0.18;
    const dur = click === 'beep' ? 0.09 : 0.035;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
  }
  function dispatch() {
    const t = now();
    while (pending.length && pending[0].time <= t + 0.004) {
      const ev = pending.shift();
      try { onBeat(ev.i, ev.time, Math.max(0, t - ev.time)); } catch (e) { console.error(e); }
    }
  }
  function tick() {
    const t = now();
    while (next < t + HORIZON) {
      schedule(beat, next);
      pending.push({ i: beat, time: next });
      beat += 1;
      next += 60 / api.bpm;
    }
    dispatch();
  }
  function frame() { dispatch(); raf = requestAnimationFrame(frame); }

  const api = {
    bpm,
    get running() { return !!timer; },
    /** Start; první úder hned (za 50 ms), číslování od fromBeat. */
    start(fromBeat = 0) {
      if (timer) return;
      useAudio = !!ctx && ctx.state === 'running';
      beat = fromBeat; pending = [];
      next = now() + 0.05;
      tick();
      timer = setInterval(tick, TICK_MS);
      raf = requestAnimationFrame(frame);
    },
    stop() {
      const resumeAt = pending.length ? pending[0].i : beat;
      clearInterval(timer); timer = null; cancelAnimationFrame(raf); pending = [];
      return resumeAt; // další úder, který by přišel (pro pokračování po pauze)
    },
    /** Čas audia (nebo performance) – pro synchronizaci animací. */
    now,
    beatSec: () => 60 / api.bpm,
  };
  return api;
}
