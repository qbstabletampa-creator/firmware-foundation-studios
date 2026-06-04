import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const LightSnakeSFX = {
  eat(combo: number = 0) {
    SharedSFX.collectGood(combo);
  },

  turn() {
    SharedSFX.buttonTap();
  },

  grow(count: number) {
    SharedSFX.combo(count);
  },

  death() {
    SharedSFX.lifeLost();
    vibrate(200);
  },

  milestone() {
    SharedSFX.milestone();
  },

  gameOver() {
    SharedSFX.gameOver();
  },
};

export { unlockAudio, vibrate };
