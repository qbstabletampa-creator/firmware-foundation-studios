import type {
  ActivePowerUp,
  FallingItem,
  GameMode,
  GameState,
  PowerUpType,
} from './types';
import { GAME_CONSTANTS, POWERUP_DEFS } from './itemConfig';
import { checkItemBasketCollision, isOffScreen } from './collisionEngine';
import { spawnItem, shouldSpawnPowerUp, getSpawnInterval } from './spawnEngine';
import { getLevelDef } from './levelConfig';

// ---------------------------------------------------------------------------
// Events emitted by the tick function
// ---------------------------------------------------------------------------

export type GameEvent =
  | { type: 'item_caught'; item: FallingItem }
  | { type: 'item_missed'; item: FallingItem }
  | { type: 'bad_item_caught'; item: FallingItem }
  | { type: 'life_lost'; livesRemaining: number }
  | { type: 'game_over'; finalScore: number }
  | { type: 'level_complete'; level: number }
  | { type: 'combo'; count: number }
  | { type: 'powerup_activated'; powerUp: ActivePowerUp }
  | { type: 'powerup_expired'; type_: PowerUpType };

// ---------------------------------------------------------------------------
// State factory
// ---------------------------------------------------------------------------

/**
 * Build a fresh GameState ready for the first tick.
 *
 * The basket starts centered. Width is set to 0 here because the actual
 * pixel width depends on the game area which is only known at render time.
 * The game screen should call `state.basket.width = gameWidth * BASKET_WIDTH_RATIO`
 * before the first tick.
 */
export function createInitialState(mode: GameMode): GameState {
  return {
    phase: 'playing',
    mode,
    score: 0,
    lives: GAME_CONSTANTS.INITIAL_LIVES,
    items: [],
    basket: { x: 0, width: 0 },
    activePowerUps: [],
    elapsedMs: 0,
    combo: 0,
    bestCombo: 0,
    nextSpawnMs: 0, // spawn immediately on first tick
    level: 1,
    levelScore: 0,
    levelElapsedMs: 0,
    itemIdCounter: 0,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function hasPowerUp(state: GameState, type: PowerUpType): boolean {
  return state.activePowerUps.some((p) => p.type === type);
}

function basketRect(
  gameWidth: number,
  gameHeight: number,
): { basketY: number; basketHeight: number } {
  const basketHeight = Math.round(gameWidth * GAME_CONSTANTS.BASKET_HEIGHT_RATIO);
  const basketY = gameHeight - GAME_CONSTANTS.BASKET_BOTTOM_OFFSET - basketHeight;
  return { basketY, basketHeight };
}

// ---------------------------------------------------------------------------
// Tick -- the heart of the game engine
// ---------------------------------------------------------------------------

/**
 * Advance the game by `deltaMs` milliseconds.
 *
 * This function is **pure**: it takes the current state and returns a new
 * state plus an array of events. The rendering layer is responsible for
 * side effects (sounds, animations, verse card display, etc.).
 *
 * Expected delta is ~16ms (60 fps). The function clamps delta to 100ms to
 * prevent physics tunnelling if the tab loses focus and fires a large delta.
 */
export function tick(
  state: GameState,
  deltaMs: number,
  gameWidth: number,
  gameHeight: number,
  rng: () => number,
): { state: GameState; events: GameEvent[] } {
  // Guard: only process while playing.
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  // Clamp delta to avoid tunnelling after a tab-switch or long pause.
  const dt = Math.min(deltaMs, 100);
  const dtSec = dt / 1000;

  const events: GameEvent[] = [];

  // -- Shallow-copy mutable parts of state ------------------------------------
  let score = state.score;
  let lives = state.lives;
  let combo = state.combo;
  let bestCombo = state.bestCombo;
  let elapsedMs = state.elapsedMs + dt;
  let nextSpawnMs = state.nextSpawnMs;
  let currentLevel = state.level;
  let levelScore = state.levelScore;
  let itemIdCounter = state.itemIdCounter;
  let levelElapsedMs = state.levelElapsedMs + dt;
  let activePowerUps = [...state.activePowerUps];
  let phase: GameState['phase'] = state.phase;

  const slowMoActive = hasPowerUp(state, 'slow_mo');
  const magnetActive = hasPowerUp(state, 'magnet');
  const speedMultiplier = slowMoActive ? 0.5 : 1;

  // -- 1. Move items ----------------------------------------------------------
  const itemSize = Math.round(gameWidth * GAME_CONSTANTS.ITEM_SIZE_RATIO);
  const { basketY, basketHeight } = basketRect(gameWidth, gameHeight);

  const survivingItems: FallingItem[] = [];

  for (const item of state.items) {
    let newY = item.y + item.speed * dtSec * speedMultiplier;
    let newX = item.x;

    // -- 2. Magnet pull (good items only) -----------------------------------
    if (magnetActive && item.category === 'good') {
      const basketCenter = state.basket.x + state.basket.width / 2;
      const itemCenter = item.x + item.width / 2;
      const diff = basketCenter - itemCenter;
      const pull = GAME_CONSTANTS.MAGNET_PULL_STRENGTH * dtSec;
      if (Math.abs(diff) > pull) {
        newX += Math.sign(diff) * pull;
      } else {
        newX += diff;
      }
      // Clamp so items stay on screen.
      newX = Math.max(0, Math.min(gameWidth - item.width, newX));
    }

    const movedItem: FallingItem = { ...item, x: newX, y: newY };

    // -- 3. Collision with basket -------------------------------------------
    if (
      checkItemBasketCollision(movedItem, state.basket, basketY, basketHeight)
    ) {
      if (movedItem.category === 'good') {
        score += movedItem.points;
        levelScore += movedItem.points;
        combo += 1;
        if (combo > bestCombo) bestCombo = combo;
        events.push({ type: 'item_caught', item: movedItem });
        if (combo >= 3) {
          events.push({ type: 'combo', count: combo });
        }

        // Check for power-up activation on catch.
        const powerUpType = shouldSpawnPowerUp(rng);
        if (powerUpType && !activePowerUps.some((p) => p.type === powerUpType)) {
          const def = POWERUP_DEFS.find((d) => d.type === powerUpType)!;
          const newPowerUp: ActivePowerUp = {
            type: def.type,
            remainingMs: def.durationMs,
            icon: def.icon,
            color: def.color,
          };
          activePowerUps.push(newPowerUp);
          events.push({ type: 'powerup_activated', powerUp: newPowerUp });
        }
      } else {
        // Bad item caught.
        lives -= 1;
        combo = 0;
        events.push({ type: 'bad_item_caught', item: movedItem });
        events.push({ type: 'life_lost', livesRemaining: lives });
      }
      // Item consumed, do not add to surviving list.
      continue;
    }

    // -- 4. Off-screen check ------------------------------------------------
    if (isOffScreen(movedItem, gameHeight)) {
      if (movedItem.category === 'good') {
        // Good item missed, reset combo but no life lost.
        combo = 0;
        events.push({ type: 'item_missed', item: movedItem });
      }
      // Bad items falling off screen are harmless. No event needed.
      continue;
    }

    survivingItems.push(movedItem);
  }

  // -- 5. Spawn new items ---------------------------------------------------
  let items = survivingItems;
  if (elapsedMs >= nextSpawnMs) {
    const newItem = spawnItem(
      {
        ...state,
        score,
        elapsedMs,
        level: currentLevel,
        itemIdCounter,
      },
      gameWidth,
      rng,
    );
    itemIdCounter += 1;
    items = [...items, newItem];
    nextSpawnMs = elapsedMs + getSpawnInterval(levelElapsedMs, currentLevel);
  }

  // -- 6. Update power-up timers --------------------------------------------
  const nextPowerUps: ActivePowerUp[] = [];
  for (const pu of activePowerUps) {
    const remaining = pu.remainingMs - dt;
    if (remaining <= 0) {
      events.push({ type: 'powerup_expired', type_: pu.type });
    } else {
      nextPowerUps.push({ ...pu, remainingMs: remaining });
    }
  }
  activePowerUps = nextPowerUps;

  // -- 7. Game over check (before level completion to prevent race) ----------
  if (lives <= 0) {
    phase = 'gameover';
    events.push({ type: 'game_over', finalScore: score });
  }

  // -- 8. Level completion check ---------------------------------------------
  if (phase === 'playing') {
    const levelDef = getLevelDef(currentLevel);
    if (levelScore >= levelDef.targetScore) {
      events.push({ type: 'level_complete', level: currentLevel });
      currentLevel += 1;
      levelScore = 0;
      levelElapsedMs = 0;
      items = [];
      nextSpawnMs = elapsedMs + 500;
    }
  }

  // -- Build new state -------------------------------------------------------
  const newState: GameState = {
    phase,
    mode: state.mode,
    score,
    lives,
    items,
    basket: state.basket,
    activePowerUps,
    elapsedMs,
    combo,
    bestCombo,
    nextSpawnMs,
    level: currentLevel,
    levelScore,
    levelElapsedMs,
    itemIdCounter,
  };

  return { state: newState, events };
}
