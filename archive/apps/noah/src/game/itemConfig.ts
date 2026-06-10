// ---------------------------------------------------------------------------
// Noah's Animal Match -- Animal and level configuration
// ---------------------------------------------------------------------------

export type AnimalCategory = 'common' | 'forest' | 'desert' | 'plains' | 'exotic' | 'ocean' | 'sky';

export type AnimalDef = {
  name: string;
  emoji: string;
  category: AnimalCategory;
  /** Level at which this animal first appears in the pool. */
  unlockLevel: number;
};

export const ANIMAL_DEFS: AnimalDef[] = [
  // Common (Level 1)
  { name: 'Dove',      emoji: '🕊️', category: 'common',  unlockLevel: 1 },
  { name: 'Lamb',      emoji: '🐑',       category: 'common',  unlockLevel: 1 },
  { name: 'Lion',      emoji: '🦁',       category: 'common',  unlockLevel: 1 },
  { name: 'Elephant',  emoji: '🐘',       category: 'common',  unlockLevel: 1 },
  { name: 'Giraffe',   emoji: '🦒',       category: 'common',  unlockLevel: 1 },
  { name: 'Rabbit',    emoji: '🐇',       category: 'common',  unlockLevel: 1 },

  // Level 2 additions
  { name: 'Turtle',    emoji: '🐢',       category: 'forest',  unlockLevel: 2 },
  { name: 'Butterfly', emoji: '🦋',       category: 'forest',  unlockLevel: 2 },
  { name: 'Camel',     emoji: '🐪',       category: 'desert',  unlockLevel: 2 },
  { name: 'Horse',     emoji: '🐴',       category: 'plains',  unlockLevel: 2 },

  // Level 3 additions
  { name: 'Bear',      emoji: '🐻',       category: 'forest',  unlockLevel: 3 },
  { name: 'Fox',       emoji: '🦊',       category: 'forest',  unlockLevel: 3 },
  { name: 'Owl',       emoji: '🦉',       category: 'forest',  unlockLevel: 3 },
  { name: 'Peacock',   emoji: '🦚',       category: 'exotic',  unlockLevel: 3 },

  // Level 4 additions
  { name: 'Deer',      emoji: '🦌',       category: 'forest',  unlockLevel: 4 },
  { name: 'Dolphin',   emoji: '🐬',       category: 'ocean',   unlockLevel: 4 },

  // Level 5 additions
  { name: 'Eagle',     emoji: '🦅',       category: 'sky',     unlockLevel: 5 },
  { name: 'Rooster',   emoji: '🐓',       category: 'common',  unlockLevel: 5 },
];

// ---------------------------------------------------------------------------
// Level configuration
// ---------------------------------------------------------------------------

export type LevelConfig = {
  level: number;
  name: string;
  rows: number;
  cols: number;
  pairs: number;
  /** Preview time in milliseconds (all cards shown face-up at start). */
  previewMs: number;
  /** Par time in milliseconds for time bonus calculation. */
  parTimeMs: number;
  /** Number of animals available in the pool for this level. */
  poolSize: number;
};

// previewMs scales with grid size: little kids need more time to memorize a
// bigger board. ~2s on the 2x3 starter up to ~3.5s on the 5x6 flood board.
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: 'First Boarding',       rows: 2, cols: 3, pairs: 3,  previewMs: 2000, parTimeMs: 30000,  poolSize: 6  },
  { level: 2, name: 'Gathering the Flock',  rows: 3, cols: 4, pairs: 6,  previewMs: 2500, parTimeMs: 60000,  poolSize: 10 },
  { level: 3, name: 'Into the Ark',         rows: 4, cols: 4, pairs: 8,  previewMs: 3000, parTimeMs: 90000,  poolSize: 14 },
  { level: 4, name: 'Before the Rain',      rows: 4, cols: 5, pairs: 10, previewMs: 3200, parTimeMs: 120000, poolSize: 16 },
  { level: 5, name: 'The Great Flood',      rows: 5, cols: 6, pairs: 15, previewMs: 3500, parTimeMs: 180000, poolSize: 18 },
];

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  /** Time (ms) mismatched cards stay visible before flipping back. */
  MISMATCH_DELAY_MS: 800,

  /** Base points awarded per matched pair. */
  POINTS_PER_MATCH: 100,

  /** Bonus points for flipping the second card within 2 seconds of the first. */
  QUICK_RECALL_BONUS: 50,

  /** Maximum time (ms) between first and second flip to earn Quick Recall. */
  QUICK_RECALL_WINDOW_MS: 2000,

  /** Perfect clear bonus (zero mismatches). */
  PERFECT_CLEAR_BONUS: 1000,

  /** Show a verse card every N matched pairs. */
  VERSE_MILESTONE_MATCHES: 5,

  /** Maximum combo multiplier cap. */
  MAX_COMBO_MULTIPLIER: 3.0,

  /** Total number of levels. */
  TOTAL_LEVELS: 5,
} as const;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/**
 * Get the combo multiplier for a given streak count.
 * Combo 1 = 1.0x, 2 = 1.5x, 3 = 2.0x, 4 = 2.5x, 5+ = 3.0x (capped).
 */
export function getComboMultiplier(comboStreak: number): number {
  if (comboStreak <= 1) return 1.0;
  if (comboStreak === 2) return 1.5;
  if (comboStreak === 3) return 2.0;
  if (comboStreak === 4) return 2.5;
  return GAME_CONSTANTS.MAX_COMBO_MULTIPLIER; // 5+
}

/**
 * Calculate time bonus for completing a level.
 * Under 50% par = 500, under 75% par = 300, under 100% par = 100, over = 0.
 */
export function getTimeBonus(elapsedMs: number, parTimeMs: number): number {
  const ratio = elapsedMs / parTimeMs;
  if (ratio < 0.5) return 500;
  if (ratio < 0.75) return 300;
  if (ratio < 1.0) return 100;
  return 0;
}

/**
 * Calculate star rating (1-3) based on move efficiency and time efficiency.
 * Move efficiency = minMoves / actualMoves (weight 0.6).
 * Time efficiency = min(parTime / actualTime, 1.0) (weight 0.4).
 */
export function getStarRating(
  pairs: number,
  moves: number,
  elapsedMs: number,
  parTimeMs: number,
): 1 | 2 | 3 {
  const moveEfficiency = moves > 0 ? pairs / moves : 1;
  const timeEfficiency = Math.min(elapsedMs > 0 ? parTimeMs / elapsedMs : 1, 1.0);
  const combined = moveEfficiency * 0.6 + timeEfficiency * 0.4;

  if (combined >= 0.85) return 3;
  if (combined >= 0.60) return 2;
  return 1;
}
