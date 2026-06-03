import Phaser from 'phaser';
import { ArkHopperScene } from './ArkHopperScene';

// ---------------------------------------------------------------------------
// Phaser game configuration factory for Ark Hopper
// ---------------------------------------------------------------------------

/**
 * Create a Phaser GameConfig for Ark Hopper.
 *
 * Canvas: 750x1334 (portrait mobile). Scales with FIT + CENTER_BOTH
 * so it fills any screen while maintaining aspect ratio.
 *
 * @param parent - DOM element id to mount the canvas into.
 */
export function createArkHopperConfig(
  parent: string,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    parent,
    backgroundColor: '#87CEEB',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      touch: {
        capture: true,
      },
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
    scene: [ArkHopperScene],
  };
}
