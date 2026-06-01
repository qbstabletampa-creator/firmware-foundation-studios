import Phaser from 'phaser';
import { GameScene } from './GameScene';

export const GAME_WIDTH = 500;
export const GAME_HEIGHT = 620;

export function createGospleConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#FFFBF0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
  };
}
