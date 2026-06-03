import Phaser from 'phaser';
import { MannaCatchScene } from './MannaCatchScene';

export function createMannaCatchConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    parent,
    backgroundColor: '#1A1A2E',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MannaCatchScene],
  };
}
