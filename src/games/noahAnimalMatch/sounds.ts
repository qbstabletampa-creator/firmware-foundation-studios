import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const NoahSFX = {
  flip() {
    SharedSFX.cardFlip();
  },

  match(combo: number = 0) {
    SharedSFX.matchFound(combo);
  },

  mismatch() {
    SharedSFX.mismatch();
  },

  combo(count: number) {
    SharedSFX.combo(count);
  },

  levelComplete() {
    SharedSFX.levelComplete();
  },

  gameComplete() {
    SharedSFX.milestone();
  },
};

export { unlockAudio, vibrate };
