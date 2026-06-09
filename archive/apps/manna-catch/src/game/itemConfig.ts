import type { ItemType, ItemCategory, PowerUpType } from './types';

// ---------------------------------------------------------------------------
// Item definitions
// ---------------------------------------------------------------------------

export type ItemDef = {
  type: ItemType;
  category: ItemCategory;
  icon: string;
  points: number;
  /** Spawn probability weight (higher = more frequent). */
  weight: number;
  /** Score threshold before this item starts appearing. */
  unlockScore: number;
};

export const ITEM_DEFS: ItemDef[] = [
  { type: 'manna',       category: 'good', icon: '🍞', points: 5,  weight: 30, unlockScore: 0   },
  { type: 'honey',       category: 'good', icon: '🍯', points: 10, weight: 20, unlockScore: 0   },
  { type: 'grapes',      category: 'good', icon: '🍇', points: 8,  weight: 15, unlockScore: 25  },
  { type: 'pomegranate', category: 'good', icon: '🍎', points: 12, weight: 10, unlockScore: 50  },
  { type: 'figs',        category: 'good', icon: '🫒', points: 8,  weight: 12, unlockScore: 75  },
  { type: 'star',        category: 'good', icon: '⭐', points: 20, weight: 5,  unlockScore: 100 },
  { type: 'scroll',      category: 'good', icon: '📜', points: 15, weight: 8,  unlockScore: 50  },
  { type: 'thorn',       category: 'bad',  icon: '🌿', points: 0,  weight: 18, unlockScore: 0   },
  { type: 'stone',       category: 'bad',  icon: '🪨', points: 0,  weight: 12, unlockScore: 30  },
  { type: 'snake',       category: 'bad',  icon: '🐍', points: 0,  weight: 11, unlockScore: 40  },
];

// ---------------------------------------------------------------------------
// Power-up definitions
// ---------------------------------------------------------------------------

/** Probability that any given spawn event produces a power-up instead. */
export const POWERUP_CHANCE = 0.08;

export const POWERUP_DEFS: {
  type: PowerUpType;
  durationMs: number;
  icon: string;
  color: string;
}[] = [
  // wide_basket removed: a wider basket also scoops the bad items you need to
  // dodge (thorns, stones, snake), so it made the game harder, not easier.
  { type: 'slow_mo',     durationMs: 4000, icon: '🐢', color: '#B388FF' },
  { type: 'magnet',      durationMs: 3000, icon: '🧲', color: '#FF8A65' },
];

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  INITIAL_LIVES: 3,

  /** Basket width as a fraction of game area width. */
  BASKET_WIDTH_RATIO: 0.25,

  /**
   * Basket height as a fraction of game area width. Must stay above the basket
   * emoji's effective glyph height (≈ BASKET_WIDTH_RATIO * 0.5 * ~1.2) or the
   * 🧺 renders clipped. 0.16 leaves headroom. Used by BOTH the visual basket
   * box and the collision catch zone (gameEngine.basketRect), so they stay in
   * sync automatically.
   */
  BASKET_HEIGHT_RATIO: 0.16,

  /**
   * Pixels from bottom of game area to bottom edge of basket. Kept high so the
   * basket floats above a thumb-swipe gutter at the bottom of the screen,
   * otherwise the player's thumb covers the basket while steering it. The
   * collision catch line uses this same constant (see gameEngine.basketRect),
   * so the visual basket and the catch zone stay in sync.
   */
  BASKET_BOTTOM_OFFSET: 130,

  /**
   * Wide-basket power-up width multiplier. Applied to BOTH the catch zone and
   * the rendered basket via effectiveBasket(), and clamped to the screen so the
   * widened basket never runs off-screen. Base 0.25 * 2 = 0.5 of width, fits.
   */
  WIDE_BASKET_MULTIPLIER: 2,

  /** Falling item size as a fraction of game area width. */
  ITEM_SIZE_RATIO: 0.12,

  /** Starting fall speed in pixels per second. */
  BASE_SPEED: 120,

  /** Hard cap on fall speed in pixels per second. */
  MAX_SPEED: 350,

  /**
   * Per-level fall-speed bump. Each verse advances a level and multiplies fall
   * speed by (1 + level * this). 0.15 = ~15% faster per level, "a little."
   */
  LEVEL_SPEED_STEP: 0.15,

  /**
   * Speed increase per elapsed second. At 120 base and 0.8 ramp the speed
   * reaches ~350 after roughly 4.5 minutes, which gives casual players a
   * comfortable curve while rewarding endurance.
   */
  SPEED_RAMP_PER_SECOND: 0.8,

  /** Starting milliseconds between item spawns. */
  BASE_SPAWN_INTERVAL_MS: 1200,

  /** Floor for spawn interval so items never overlap too densely. */
  MIN_SPAWN_INTERVAL_MS: 400,

  /**
   * Each spawn multiplies the interval by this factor. At 0.97 the interval
   * halves after about 23 spawns (~25-30 seconds depending on current
   * interval), settling at MIN_SPAWN_INTERVAL_MS.
   */
  SPAWN_INTERVAL_RAMP: 0.97,

  /**
   * Verse / level thresholds ESCALATE: each level needs more points than the
   * last. Gap to reach level m = VERSE_BASE_POINTS + (m-1) * VERSE_POINTS_STEP.
   * Gaps: 250, 350, 450, 550... (cumulative: 250, 600, 1050, 1600...).
   */
  VERSE_BASE_POINTS: 250,
  VERSE_POINTS_STEP: 100,

  /** Magnet power-up pull strength in pixels per second toward basket center. */
  MAGNET_PULL_STRENGTH: 200,
} as const;
