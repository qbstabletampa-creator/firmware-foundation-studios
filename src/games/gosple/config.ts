import Phaser from 'phaser';
import { GameScene } from './GameScene';

export function createGospleConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    parent,
    backgroundColor: '#FFFBF0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
  };
}
