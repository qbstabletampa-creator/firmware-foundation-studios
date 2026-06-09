import type { FallingItem, GameState, PowerUpType } from './types';
import {
  ITEM_DEFS,
  GAME_CONSTANTS,
  POWERUP_CHANCE,
  POWERUP_DEFS,
  type ItemDef,
} from './itemConfig';

// ---------------------------------------------------------------------------
// Spawn helpers
// ---------------------------------------------------------------------------

/**
 * Return item definitions whose `unlockScore` threshold has been met.
 * At score 0 only manna, honey, and thorns are available. As the player
 * scores higher the pool expands, keeping early gameplay simple.
 */
export function getAvailableItems(score: number): ItemDef[] {
  return ITEM_DEFS.filter((def) => score >= def.unlockScore);
}

/**
 * Weighted random selection from an array of item definitions.
 *
 * Weights do not need to sum to any particular value. The function
 * normalises internally so a weight of 30 vs 10 means 3x more likely.
 */
export function pickItem(available: ItemDef[], rng: () => number): ItemDef {
  const totalWeight = available.reduce((sum, def) => sum + def.weight, 0);
  let roll = rng() * totalWeight;

  for (const def of available) {
    roll -= def.weight;
    if (roll <= 0) return def;
  }

  // Fallback (should never reach here due to floating-point, but safe).
  return available[available.length - 1];
}

/**
 * Create a new `FallingItem` ready to enter the game world.
 *
 * - Random horizontal position within bounds (clamped so the item stays
 *   fully on screen).
 * - Speed is based on elapsed time with a smooth ramp up to MAX_SPEED.
 * - Each item gets a unique id from the state counter.
 */
export function spawnItem(
  state: GameState,
  gameWidth: number,
  rng: () => number,
): FallingItem {
  const available = getAvailableItems(state.score);
  const def = pickItem(available, rng);

  const itemSize = Math.round(gameWidth * GAME_CONSTANTS.ITEM_SIZE_RATIO);
  const maxX = gameWidth - itemSize;
  const x = rng() * maxX;

  const elapsedSec = state.elapsedMs / 1000;
  // Each verse advances a level (state.versesMilestone) and speeds things up a
  // little. Items clear between levels, so new items spawn at the new level pace.
  const levelMult = 1 + state.versesMilestone * GAME_CONSTANTS.LEVEL_SPEED_STEP;
  const speed = Math.min(
    (GAME_CONSTANTS.BASE_SPEED + elapsedSec * GAME_CONSTANTS.SPEED_RAMP_PER_SECOND) * levelMult,
    GAME_CONSTANTS.MAX_SPEED,
  );

  const rotation = rng() * 360;

  return {
    id: `item_${state.itemIdCounter}`,
    type: def.type,
    category: def.category,
    x,
    y: -itemSize, // start just above the visible area
    speed,
    width: itemSize,
    height: itemSize,
    points: def.points,
    icon: def.icon,
    rotation,
  };
}

/**
 * Roll for a power-up. Returns the chosen PowerUpType on success, or null
 * if the roll fails. Probability is controlled by POWERUP_CHANCE (8%).
 */
export function shouldSpawnPowerUp(rng: () => number): PowerUpType | null {
  if (rng() > POWERUP_CHANCE) return null;

  const idx = Math.floor(rng() * POWERUP_DEFS.length);
  return POWERUP_DEFS[idx].type;
}

/**
 * Calculate the spawn interval for the current point in the game.
 *
 * The interval starts at BASE_SPAWN_INTERVAL_MS and decays exponentially
 * toward MIN_SPAWN_INTERVAL_MS. The decay factor is applied per second of
 * elapsed time so the ramp feels consistent regardless of frame rate.
 */
export function getSpawnInterval(elapsedMs: number): number {
  const elapsedSec = elapsedMs / 1000;

  // Number of "ramp steps" based on elapsed seconds. Using the base spawn
  // interval as the step size keeps the curve tied to spawn cadence.
  const steps = elapsedSec / (GAME_CONSTANTS.BASE_SPAWN_INTERVAL_MS / 1000);
  const interval =
    GAME_CONSTANTS.BASE_SPAWN_INTERVAL_MS *
    Math.pow(GAME_CONSTANTS.SPAWN_INTERVAL_RAMP, steps);

  return Math.max(interval, GAME_CONSTANTS.MIN_SPAWN_INTERVAL_MS);
}
