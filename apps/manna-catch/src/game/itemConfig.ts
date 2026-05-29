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
  { type: 'wide_basket', durationMs: 5000, icon: '🧺', color: '#00FF88' },
  { type: 'slow_mo',     durationMs: 4000, icon: '🐢', color: '#B388FF' },
  { type: 'magnet',      durationMs: 3000, icon: '🧲', color: '#FF8A65' },
];

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  INITIAL_LIVES: 3,

  /** Basket width as a fraction of game area width. */
  BASKET_WIDTH_RATIO: 0.18,

  /** Falling item size as a fraction of game area width. */
  ITEM_SIZE_RATIO: 0.08,

  /** Starting fall speed in pixels per second. */
  BASE_SPEED: 120,

  /** Hard cap on fall speed in pixels per second. */
  MAX_SPEED: 350,

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

  /** Show a verse card every N points. */
  VERSE_MILESTONE_POINTS: 50,

  /** Magnet power-up pull strength in pixels per second toward basket center. */
  MAGNET_PULL_STRENGTH: 200,
} as const;
