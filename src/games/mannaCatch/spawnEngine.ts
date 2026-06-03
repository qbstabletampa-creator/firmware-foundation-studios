import type { FallingItem, GameState, PowerUpType } from './types';
import {
  ITEM_DEFS,
  GAME_CONSTANTS,
  POWERUP_CHANCE,
  POWERUP_DEFS,
  type ItemDef,
} from './itemConfig';
import { getLevelDef } from './levelConfig';

// ---------------------------------------------------------------------------
// Spawn helpers
// ---------------------------------------------------------------------------

/**
 * Return item definitions whose `unlockScore` threshold has been met.
 * At score 0 only manna, honey, and thorns are available. As the player
 * scores higher the pool expands, keeping early gameplay simple.
 */
export function getAvailableItems(score: number, level: number): ItemDef[] {
  const levelDef = getLevelDef(level);
  return ITEM_DEFS.filter(
    (def) => score >= def.unlockScore && levelDef.unlockedItems.includes(def.type),
  );
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
  const available = getAvailableItems(state.score, state.level);
  const def = pickItem(available, rng);

  const itemSize = Math.round(gameWidth * GAME_CONSTANTS.ITEM_SIZE_RATIO);
  const maxX = gameWidth - itemSize;
  const minSep = itemSize * 1.5;

  let x = rng() * maxX;
  for (let attempt = 0; attempt < 3; attempt++) {
    const tooClose = state.items.some(
      (it) => it.y < itemSize * 2 && Math.abs(it.x - x) < minSep,
    );
    if (!tooClose) break;
    x = rng() * maxX;
  }

  const levelDef = getLevelDef(state.level);
  const levelSec = state.levelElapsedMs / 1000;
  const speed = Math.min(
    levelDef.baseSpeed + levelSec * GAME_CONSTANTS.SPEED_RAMP_PER_SECOND,
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
export function getSpawnInterval(levelElapsedMs: number, level: number): number {
  const levelDef = getLevelDef(level);
  const levelSec = levelElapsedMs / 1000;

  const steps = levelSec / (levelDef.spawnIntervalMs / 1000);
  const interval =
    levelDef.spawnIntervalMs *
    Math.pow(GAME_CONSTANTS.SPAWN_INTERVAL_RAMP, steps);

  return Math.max(interval, GAME_CONSTANTS.MIN_SPAWN_INTERVAL_MS);
}
