import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const SFX = {
  catchGood(comboCount: number = 0) {
    SharedSFX.collectGood(comboCount);
  },

  catchBad() {
    SharedSFX.collectBad();
  },

  combo(count: number) {
    SharedSFX.combo(count);
  },

  powerUp() {
    SharedSFX.powerUpActivate();
  },

  powerUpEnd() {
    SharedSFX.powerUpEnd();
  },

  milestone() {
    SharedSFX.milestone();
  },

  gameOver() {
    SharedSFX.gameOver();
  },

  countdown() {
    SharedSFX.countdown();
  },

  countdownGo() {
    SharedSFX.countdownGo();
  },

  buttonTap() {
    SharedSFX.buttonTap();
  },
};

export { unlockAudio, vibrate };
