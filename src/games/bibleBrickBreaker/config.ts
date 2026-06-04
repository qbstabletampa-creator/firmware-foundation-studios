import Phaser from 'phaser';

// ---------------------------------------------------------------------------
// Bible Brick Breaker -- Game Constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  /** Canvas width (portrait mobile). */
  CANVAS_W: 750,
  /** Canvas height (portrait mobile). */
  CANVAS_H: 1334,

  // -- Paddle --
  /** Paddle width in pixels. */
  PADDLE_W: 120,
  /** Paddle height in pixels. */
  PADDLE_H: 20,
  /** Paddle Y position (near bottom). */
  PADDLE_Y: 1260,
  /** Paddle color (Vegas Gold). */
  PADDLE_COLOR: 0xd4c36a,

  // -- Ball --
  /** Ball radius in pixels. */
  BALL_RADIUS: 10,
  /** Starting ball speed (px/s). */
  BASE_BALL_SPEED: 400,
  /** Speed added per level. */
  BALL_SPEED_INCREMENT: 30,
  /** Maximum ball speed cap. */
  MAX_BALL_SPEED: 700,

  // -- Brick grid --
  /** Starting number of brick rows. */
  BRICK_ROWS_BASE: 5,
  /** Number of brick columns. */
  BRICK_COLS: 8,
  /** Brick width in pixels. */
  BRICK_W: 80,
  /** Brick height in pixels. */
  BRICK_H: 30,
  /** Padding between bricks. */
  BRICK_PADDING: 6,
  /** Horizontal offset for the first column. */
  BRICK_OFFSET_X: 47,
  /** Vertical offset for the first row. */
  BRICK_OFFSET_Y: 160,

  // -- Brick types (hits to break) --
  /** Hits to break a clay brick. */
  CLAY_HITS: 1,
  /** Hits to break a stone brick. */
  STONE_HITS: 2,
  /** Hits to break a gold brick. */
  GOLD_HITS: 1,

  // -- Scoring --
  /** Points for breaking a clay brick. */
  CLAY_POINTS: 10,
  /** Points for breaking a stone brick. */
  STONE_POINTS: 15,
  /** Points for breaking a gold brick. */
  GOLD_POINTS: 25,

  // -- Lives --
  /** Lives at game start. */
  STARTING_LIVES: 3,
  /** Maximum lives the player can hold. */
  MAX_LIVES: 5,

  // -- Power-ups --
  /** Wide paddle multiplier. */
  WIDE_PADDLE_MULT: 1.5,
  /** Wide paddle duration (ms). */
  WIDE_PADDLE_MS: 10_000,
  /** Slow ball speed multiplier. */
  SLOW_BALL_MULT: 0.7,
  /** Slow ball duration (ms). */
  SLOW_BALL_MS: 8_000,

  // -- Combo --
  /** Whether combo resets to floor on miss. */
  COMBO_FLOOR_RESET: true,

  // -- Power-up drops --
  /** Fall speed of power-up items (px/s). */
  POWERUP_FALL_SPEED: 180,
  /** Power-up icon size in pixels. */
  POWERUP_SIZE: 24,

  // -- Verse milestones --
  /** Score interval that triggers a verse display. */
  VERSE_MILESTONE_INTERVAL: 100,

  // -- Level progression --
  /** Extra rows added per level. */
  ROWS_PER_LEVEL_INCREMENT: 1,
  /** Maximum brick rows on screen. */
  MAX_BRICK_ROWS: 8,
  /** Base chance a brick is stone. */
  STONE_CHANCE_BASE: 0.1,
  /** Additional stone chance per level. */
  STONE_CHANCE_PER_LEVEL: 0.05,
  /** Chance a brick is gold. */
  GOLD_CHANCE: 0.08,

  // -- Countdown --
  /** Countdown display steps. */
  COUNTDOWN_STEPS: ['3', '2', '1', 'GO!'] as const,
  /** Duration of each countdown step (ms). */
  COUNTDOWN_STEP_MS: 375,
} as const;

// ---------------------------------------------------------------------------
// Phaser game configuration factory for Bible Brick Breaker
// ---------------------------------------------------------------------------

/**
 * Create a Phaser GameConfig for Bible Brick Breaker.
 *
 * Canvas: 750x1334 (portrait mobile). Scales with FIT + CENTER_BOTH
 * so it fills any screen while maintaining aspect ratio.
 *
 * Scene array left empty. The GameScreen component adds the scene class.
 *
 * @param parentId - DOM element id to mount the canvas into.
 */
export function createBibleBrickBreakerConfig(
  parentId: string,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parentId,
    width: GAME_CONSTANTS.CANVAS_W,
    height: GAME_CONSTANTS.CANVAS_H,
    backgroundColor: '#0A0A2E',
    scene: [],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      activePointers: 1,
    },
  };
}
