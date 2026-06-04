import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const GospleSFX = {
  keyTap() {
    SharedSFX.buttonTap();
  },

  correctLetter(combo: number = 0) {
    SharedSFX.collectGood(combo);
  },

  wrongLetter() {
    SharedSFX.mismatch();
  },

  puzzleSolve() {
    SharedSFX.milestone();
  },

  rowSubmit() {
    SharedSFX.buttonTap();
  },
};

export { unlockAudio, vibrate };
