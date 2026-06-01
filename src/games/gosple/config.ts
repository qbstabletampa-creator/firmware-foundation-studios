import Phaser from 'phaser';
import { GameScene } from './GameScene';

export function createGospleConfig(parent: string): Phaser.Types.Core.GameConfig {
  const el = document.getElementById(parent);
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cssW = el?.clientWidth ?? 500;
  const cssH = el?.clientHeight ?? 800;

  return {
    type: Phaser.AUTO,
    width: cssW * dpr,
    height: cssH * dpr,
    parent,
    backgroundColor: '#FFFBF0',
    scale: {
      mode: Phaser.Scale.NONE,
      zoom: 1 / dpr,
    },
    scene: [GameScene],
  };
}
