import { usePreferencesStore } from '../stores/preferencesStore';

const AC = typeof window !== 'undefined'
  ? window.AudioContext || (window as any).webkitAudioContext
  : null;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

export function disposeAudio() {
  if (ctx) {
    ctx.close();
    ctx = null;
  }
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const prefs = usePreferencesStore.getState();
  if (!prefs.sound) return;
  if (prefs.volume === 0) return;

  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const adjustedVolume = Math.max(0.001, volume * prefs.volume);
  gain.gain.value = adjustedVolume;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}

export const SharedSFX = {
  collectGood(combo: number = 0) {
    const base = 523;
    const semitones = Math.min(combo, 12);
    const freq = base * Math.pow(2, semitones / 12);
    playTone(freq, 0.12, 'sine', 0.12);
  },

  collectBad() {
    playTone(150, 0.2, 'square', 0.08);
    setTimeout(() => playTone(120, 0.15, 'square', 0.06), 50);
  },

  matchFound(combo: number = 0) {
    const base = 523;
    const semitones = Math.min(combo, 12);
    playTone(base * Math.pow(2, semitones / 12), 0.15, 'sine', 0.12);
  },

  mismatch() {
    playTone(150, 0.2, 'square', 0.08);
    setTimeout(() => playTone(120, 0.15, 'square', 0.06), 50);
  },

  milestone() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100);
    });
  },

  levelComplete() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100);
    });
  },

  lifeLost() {
    playTone(250, 0.3, 'square', 0.1);
    setTimeout(() => playTone(180, 0.3, 'square', 0.08), 100);
  },

  gameOver() {
    [400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.1), i * 150);
    });
  },

  hop() {
    playTone(440, 0.06, 'sine', 0.1);
    setTimeout(() => playTone(550, 0.04, 'sine', 0.08), 30);
  },

  splash() {
    playTone(200, 0.3, 'triangle', 0.1);
    setTimeout(() => playTone(150, 0.2, 'triangle', 0.06), 80);
  },

  land() {
    playTone(300, 0.05, 'sine', 0.06);
  },

  buttonTap() {
    playTone(600, 0.05, 'sine', 0.06);
  },

  cardFlip() {
    playTone(800, 0.04, 'sine', 0.08);
    setTimeout(() => playTone(1000, 0.03, 'sine', 0.06), 20);
  },

  countdown() {
    playTone(440, 0.1, 'square', 0.08);
  },

  countdownGo() {
    playTone(880, 0.2, 'sine', 0.12);
  },

  powerUpActivate() {
    [400, 500, 600, 800].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.1, 'sine', 0.1), i * 60);
    });
  },

  powerUpEnd() {
    playTone(400, 0.15, 'triangle', 0.08);
    setTimeout(() => playTone(300, 0.15, 'triangle', 0.06), 80);
  },

  combo(count: number) {
    const base = 600;
    for (let i = 0; i < Math.min(count, 5); i++) {
      setTimeout(() => playTone(base + i * 80, 0.08, 'sine', 0.1), i * 40);
    }
  },
};

export function vibrate(pattern: number | number[]) {
  const prefs = usePreferencesStore.getState();
  if (!prefs.haptics) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}
