import { SharedSFX, unlockAudio, vibrate } from '../../utils/soundEngine';

export const BibleBrickBreakerSFX = {
  paddleHit() {
    SharedSFX.buttonTap();
  },

  brickHit(combo: number) {
    SharedSFX.collectGood(combo);
  },

  brickBreak() {
    SharedSFX.collectGood(3);
  },

  wordReveal() {
    SharedSFX.milestone();
  },

  ballLost() {
    SharedSFX.lifeLost();
    vibrate(200);
  },

  powerUpCatch() {
    SharedSFX.powerUpActivate();
  },

  powerUpExpire() {
    SharedSFX.powerUpEnd();
  },

  levelComplete() {
    SharedSFX.levelComplete();
  },

  gameOver() {
    SharedSFX.gameOver();
  },

  launch() {
    SharedSFX.hop();
  },

  countdown() {
    SharedSFX.countdown();
  },

  countdownGo() {
    SharedSFX.countdownGo();
  },
};

export { unlockAudio, vibrate };
