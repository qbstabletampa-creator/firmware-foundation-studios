import Phaser from 'phaser';
import { GameScene } from './GameScene';

export function createGospleConfig(parent: string): Phaser.Types.Core.GameConfig {
  const el = document.getElementById(parent);
  const w = el?.clientWidth ?? 500;
  const h = el?.clientHeight ?? 800;

  return {
    type: Phaser.AUTO,
    width: w,
    height: h,
    parent,
    backgroundColor: '#FFFBF0',
    scale: {
      mode: Phaser.Scale.NONE,
    },
    scene: [GameScene],
  };
}
