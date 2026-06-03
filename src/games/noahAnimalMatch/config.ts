// ---------------------------------------------------------------------------
// Noah's Animal Match -- Phaser game configuration factory
// ---------------------------------------------------------------------------

import Phaser from 'phaser';
import { NoahAnimalMatchScene } from './NoahAnimalMatchScene';

/**
 * Create the Phaser GameConfig for Noah's Animal Match.
 *
 * @param parent - DOM element ID or reference to mount the canvas into.
 */
export function createNoahAnimalMatchConfig(
  parent: string,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    parent,
    backgroundColor: '#1B3A4B',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [NoahAnimalMatchScene],
  };
}
