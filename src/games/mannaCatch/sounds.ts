let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const SFX = {
  catchGood(comboCount: number) {
    // Rising pitch with combo: C5 base + semitone per combo (capped at octave)
    const base = 523;
    const semitones = Math.min(comboCount, 12);
    const freq = base * Math.pow(2, semitones / 12);
    playTone(freq, 0.12, 'sine', 0.12);
  },

  catchBad() {
    // Low buzz
    playTone(150, 0.2, 'square', 0.08);
    setTimeout(() => playTone(120, 0.15, 'square', 0.06), 50);
  },

  combo(count: number) {
    // Quick ascending arpeggio
    const base = 600;
    for (let i = 0; i < Math.min(count, 5); i++) {
      setTimeout(() => playTone(base + i * 80, 0.08, 'sine', 0.1), i * 40);
    }
  },

  powerUp() {
    // Ascending sparkle
    [400, 500, 600, 800].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.1, 'sine', 0.1), i * 60);
    });
  },

  powerUpEnd() {
    // Descending tone
    playTone(400, 0.15, 'triangle', 0.08);
    setTimeout(() => playTone(300, 0.15, 'triangle', 0.06), 80);
  },

  milestone() {
    // Celebratory fanfare
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100);
    });
  },

  gameOver() {
    // Descending sad tones
    [400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.1), i * 150);
    });
  },

  countdown() {
    playTone(440, 0.1, 'square', 0.08);
  },

  countdownGo() {
    playTone(880, 0.2, 'sine', 0.12);
  },

  buttonTap() {
    playTone(600, 0.05, 'sine', 0.06);
  },
};

export function vibrate(pattern: number | number[]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
