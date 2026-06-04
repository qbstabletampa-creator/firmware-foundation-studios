import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const ArkHopperSFX = {
  hop() {
    SharedSFX.hop();
  },

  starCollect(stars: number = 0) {
    SharedSFX.collectGood(stars);
  },

  deathObstacle() {
    SharedSFX.lifeLost();
    vibrate(200);
  },

  deathWater() {
    SharedSFX.splash();
    vibrate([100, 50, 100]);
  },

  levelComplete() {
    SharedSFX.levelComplete();
  },

  gameOver() {
    SharedSFX.gameOver();
  },

  momentum(chain: number) {
    SharedSFX.combo(chain);
  },
};

export { unlockAudio, vibrate };
