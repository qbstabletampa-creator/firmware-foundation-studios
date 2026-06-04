import Phaser from 'phaser';
import { LightSnakeScene } from './LightSnakeScene';

// ---------------------------------------------------------------------------
// Light Snake -- Game Constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  /** Number of columns in the grid. */
  GRID_COLS: 15,
  /** Number of rows in the grid. */
  GRID_ROWS: 20,
  /** Starting speed level. */
  INITIAL_SPEED: 1,
  /** Speed increase per threshold. */
  SPEED_INCREMENT: 0.5,
  /** Items collected before speed increases. */
  ITEMS_PER_SPEED_UP: 5,
  /** Base time between moves in milliseconds. */
  BASE_MOVE_INTERVAL: 300,
  /** Window in ms to chain combo collections. */
  COMBO_WINDOW: 2000,
  /** Score interval that triggers a verse display. */
  VERSE_INTERVAL: 50,
  /** Maximum number of thorns on the grid at once. */
  MAX_THORNS: 8,
} as const;

// ---------------------------------------------------------------------------
// Phaser game configuration factory for Light Snake
// ---------------------------------------------------------------------------

/**
 * Create a Phaser GameConfig for Light Snake.
 *
 * Canvas: 750x1334 (portrait mobile). Scales with FIT + CENTER_BOTH
 * so it fills any screen while maintaining aspect ratio.
 *
 * @param parent - DOM element id to mount the canvas into.
 */
export function createLightSnakeConfig(
  parent: string,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    parent,
    backgroundColor: '#0A0A1A',
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
    scene: [LightSnakeScene],
  };
}
