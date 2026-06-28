import type {
  Direction,
  GameEvent,
  GamePhase,
  GameState,
  Lane,
  LaneItem,
  MomentumTier,
} from './types';
import {
  GAME_CONSTANTS,
  LANE_TEMPLATES,
  getAnimalForLevel,
  type LaneTemplate,
  type LevelTemplate,
} from './itemConfig';
import {
  checkPlayerOnPlatform,
  checkPlayerHitObstacle,
  checkPlayerHitStar,
  getCellPixelPos,
  getCellWidth,
  isInWater,
  isFlooded,
} from './collisionEngine';

// Re-export for convenience
export type { GameEvent } from './types';

// ---------------------------------------------------------------------------
// Lane initialization
// ---------------------------------------------------------------------------

/**
 * Build runtime Lane[] from a LevelTemplate. Distributes lane items across
 * the screen width with even spacing and assigns unique ids.
 */
function buildLanes(
  template: LevelTemplate,
  gameWidth: number,
  gameHeight: number,
  startId: number,
): { lanes: Lane[]; nextId: number } {
  const cellW = gameWidth / template.cols;
  const cellH = gameHeight / template.rows;
  let idCounter = startId;

  const lanes: Lane[] = template.lanes.map((lt: LaneTemplate, rowIdx: number) => {
    const y = rowIdx * cellH;
    const items: LaneItem[] = [];

    // Place moving items (obstacles or platforms) with even spacing
    const movingItems = lt.items.filter(
      (it) => it.itemType !== 'star' && !it.isCollectible,
    );
    if (movingItems.length > 0) {
      const totalItemWidth = movingItems.reduce((sum, it) => sum + it.cellWidth * cellW, 0);
      const totalGap = gameWidth - totalItemWidth;
      // Add extra gameWidth buffer so items are spread across a wider virtual lane
      // This prevents all items from being on screen at once
      const spacing = (gameWidth + totalGap) / movingItems.length;

      movingItems.forEach((it, i) => {
        items.push({
          id: idCounter++,
          x: i * spacing,
          width: it.cellWidth * cellW,
          emoji: it.emoji,
          itemType: it.itemType,
        });
      });
    }

    // Place star collectible if this lane has one
    if (lt.starCell !== undefined) {
      const starX = lt.starCell * cellW + cellW * 0.2; // center-ish in the cell
      items.push({
        id: idCounter++,
        x: starX,
        width: cellW * 0.6,
        emoji: '⭐',
        itemType: 'star',
      });
    }

    return {
      type: lt.type,
      y,
      speed: lt.speed,
      direction: lt.direction,
      items,
    };
  });

  return { lanes, nextId: idCounter };
}

/**
 * Count total star collectibles in a level template.
 */
function countStarsInTemplate(template: LevelTemplate): number {
  return template.lanes.filter((lt) => lt.starCell !== undefined).length;
}

// ---------------------------------------------------------------------------
// State factory
// ---------------------------------------------------------------------------

/**
 * Build a fresh GameState for the given level number (1-based).
 *
 * The state is ready for the first tick. Lane items are placed with
 * pixel positions based on the default canvas size. The rendering layer
 * should rescale as needed.
 */
export function createInitialState(
  level: number,
  gameWidth: number = GAME_CONSTANTS.CANVAS_WIDTH,
  gameHeight: number = GAME_CONSTANTS.CANVAS_HEIGHT,
): GameState {
  const templateIdx = Math.max(0, Math.min(level - 1, LANE_TEMPLATES.length - 1));
  const template = LANE_TEMPLATES[templateIdx];
  const { lanes, nextId } = buildLanes(template, gameWidth, gameHeight, 0);
  const totalStarsInLevel = countStarsInTemplate(template);

  const startCol = Math.floor(template.cols / 2);
  const animal = getAnimalForLevel(level);

  return {
    phase: 'ready',
    level,
    player: {
      col: startCol,
      row: 0,
      emoji: animal.emoji,
      riding: null,
    },
    lanes,
    score: 0,
    lives: GAME_CONSTANTS.INITIAL_LIVES,
    elapsedMs: 0,
    furthestRow: 0,
    starsCollected: 0,
    totalHops: 0,
    totalStars: 0,
    floodMeter: 0,
    floodedRows: 0,
    floodRowTimer: 0,
    momentum: 0,
    momentumTimer: 0,
    diedThisLevel: false,
    totalStarsInLevel,
    invincibleMs: 0,
    totalRows: template.rows,
    totalCols: template.cols,
    parTimeSec: template.parTimeSec,
    floodRate: template.floodRate,
    itemIdCounter: nextId,
    verseMilestone: 0,
    lastMomentumTier: null,
  };
}

// ---------------------------------------------------------------------------
// Hop -- player input handler
// ---------------------------------------------------------------------------

/**
 * Process a player hop in the given direction.
 *
 * Pure function: returns new state + events. Does NOT mutate input state.
 * Input is ignored if phase is not 'playing'.
 */
export function hop(
  state: GameState,
  direction: Direction,
  gameWidth: number,
  gameHeight: number,
): { state: GameState; events: GameEvent[] } {
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  const events: GameEvent[] = [];
  let { col, row } = state.player;
  const fromRow = row;
  const fromCol = col;

  // Compute target cell
  switch (direction) {
    case 'up':    row += 1; break;
    case 'down':  row -= 1; break;
    case 'left':  col -= 1; break;
    case 'right': col += 1; break;
  }

  // Validate bounds
  if (col < 0 || col >= state.totalCols) return { state, events: [] };
  if (row < 0 || row >= state.totalRows) return { state, events: [] };

  events.push({
    type: 'hop',
    direction,
    fromRow,
    fromCol,
    toRow: row,
    toCol: col,
  });

  let score = state.score;
  let furthestRow = state.furthestRow;
  let momentum = state.momentum;
  let momentumTimer = state.momentumTimer;
  let totalHops = state.totalHops;
  let phase: GamePhase = state.phase;

  // Forward hop scoring
  if (direction === 'up' && row > furthestRow) {
    score += GAME_CONSTANTS.HOP_POINTS;
    furthestRow = row;
    totalHops += 1;
    events.push({ type: 'new_row_reached', row, points: GAME_CONSTANTS.HOP_POINTS });
  }

  // Momentum chain
  if (direction === 'up') {
    if (momentumTimer <= GAME_CONSTANTS.MOMENTUM_TIMEOUT_MS) {
      momentum += 1;
    } else {
      momentum = 1;
    }
    momentumTimer = 0; // reset timer on forward hop

    // Check momentum tiers (only award on tier crossing)
    const { tier, bonus } = getMomentumReward(momentum);
    if (tier && tier !== state.lastMomentumTier) {
      score += bonus;
      events.push({ type: 'momentum', tier, chain: momentum, bonus });
    }
  } else {
    // Non-forward movement resets momentum
    momentum = 0;
    momentumTimer = 0;
  }

  // Check if reached goal
  const targetLane = state.lanes[row];
  if (targetLane && targetLane.type === 'goal') {
    phase = 'level_complete';

    // Calculate bonuses
    const elapsedSec = state.elapsedMs / 1000;
    const timeRemaining = Math.max(0, state.parTimeSec - elapsedSec);
    const timeBonus = Math.floor(timeRemaining) * GAME_CONSTANTS.TIME_BONUS_PER_SEC;
    const perfectBonus = state.diedThisLevel ? 0 : GAME_CONSTANTS.PERFECT_BONUS;
    const allStarsBonus =
      state.starsCollected >= state.totalStarsInLevel && state.totalStarsInLevel > 0
        ? GAME_CONSTANTS.ALL_STARS_BONUS
        : 0;

    score += GAME_CONSTANTS.ARK_BONUS + timeBonus + perfectBonus + allStarsBonus;

    events.push({
      type: 'level_complete',
      level: state.level,
      score,
      timeBonus,
      perfectBonus,
      allStarsBonus,
    });
  }

  // Verse milestone check
  let verseMilestone = state.verseMilestone;
  const newMilestone = Math.floor(totalHops / GAME_CONSTANTS.VERSE_MILESTONE_HOPS);
  if (newMilestone > verseMilestone) {
    verseMilestone = newMilestone;
    events.push({ type: 'verse_milestone', milestone: verseMilestone });
  }

  // Determine if player is riding a platform (will be validated in next tick)
  let riding: number | null = null;
  if (targetLane && targetLane.type === 'water') {
    const cellW = getCellWidth(gameWidth, state.totalCols);
    const { x: playerCenterX } = getCellPixelPos(
      col, row, gameWidth, gameHeight, state.totalRows, state.totalCols,
    );
    const platform = checkPlayerOnPlatform(playerCenterX, cellW, targetLane);
    riding = platform ? platform.id : null;
  }

  const { tier: currentTier } = getMomentumReward(momentum);

  const newState: GameState = {
    ...state,
    phase,
    player: { ...state.player, col, row, riding },
    score,
    furthestRow,
    momentum,
    momentumTimer,
    totalHops,
    verseMilestone,
    lastMomentumTier: direction === 'up' ? currentTier : null,
  };

  return { state: newState, events };
}

// ---------------------------------------------------------------------------
// Tick -- frame update
// ---------------------------------------------------------------------------

/**
 * Advance the game by `deltaMs` milliseconds.
 *
 * Pure function: takes current state, returns new state + events.
 * The rendering layer handles side effects (sounds, animations, etc.).
 *
 * Delta is clamped to 100ms to prevent physics tunnelling on tab switch.
 */
export function tick(
  state: GameState,
  deltaMs: number,
  gameWidth: number,
  gameHeight: number,
): { state: GameState; events: GameEvent[] } {
  // Only process during playing phase
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  const dt = Math.min(deltaMs, 100);
  const dtSec = dt / 1000;
  const events: GameEvent[] = [];

  const cellW = getCellWidth(gameWidth, state.totalCols);

  // -- Shallow copy mutable parts --
  let score = state.score;
  let lives = state.lives;
  let elapsedMs = state.elapsedMs + dt;
  let floodMeter = state.floodMeter;
  let floodedRows = state.floodedRows;
  let floodRowTimer = state.floodRowTimer;
  let starsCollected = state.starsCollected;
  let totalStars = state.totalStars;
  let invincibleMs = Math.max(0, state.invincibleMs - dt);
  let momentumTimer = state.momentumTimer + dt;
  let momentum = state.momentum;
  let diedThisLevel = state.diedThisLevel;
  let phase: GamePhase = state.phase;
  let playerCol = state.player.col;
  let playerRow = state.player.row;
  let riding = state.player.riding;

  // Track invincibility expiry
  if (state.invincibleMs > 0 && invincibleMs <= 0) {
    events.push({ type: 'invincibility_end' });
  }

  // -- Momentum timeout check --
  if (momentum > 0 && momentumTimer > GAME_CONSTANTS.MOMENTUM_TIMEOUT_MS) {
    momentum = 0;
  }

  // -- 1. Move lane items --
  const newLanes: Lane[] = state.lanes.map((lane, laneIdx) => {
    if (lane.speed === 0) return lane;

    const dir = lane.direction === 'right' ? 1 : -1;
    const velocity = lane.speed * dir * dtSec;

    const newItems: LaneItem[] = lane.items.map((item) => {
      // Stars don't move
      if (item.itemType === 'star') return item;

      let newX = item.x + velocity;

      // Wrap items around screen edges
      if (dir > 0 && newX > gameWidth) {
        newX = -item.width;
      } else if (dir < 0 && newX + item.width < 0) {
        newX = gameWidth;
      }

      return { ...item, x: newX };
    });

    return { ...lane, items: newItems };
  });

  // -- 2. Platform riding --
  const currentLane = newLanes[playerRow];
  if (currentLane && currentLane.type === 'water') {
    // Find the platform the player is riding
    const { x: playerCenterX } = getCellPixelPos(
      playerCol, playerRow, gameWidth, gameHeight, state.totalRows, state.totalCols,
    );

    let ridingPlatform: LaneItem | null = null;
    if (riding !== null) {
      // Try to find the platform we were riding last frame
      ridingPlatform = currentLane.items.find((it) => it.id === riding) ?? null;
    }

    if (!ridingPlatform) {
      // Check if player is on any platform
      ridingPlatform = checkPlayerOnPlatform(playerCenterX, cellW, currentLane);
    }

    if (ridingPlatform) {
      riding = ridingPlatform.id;

      // Move player with the platform
      const dir = currentLane.direction === 'right' ? 1 : -1;
      const platformVelocity = currentLane.speed * dir * dtSec;
      const newPlayerPixelX = playerCenterX + platformVelocity;

      // Convert back to column position
      const newCol = Math.floor(newPlayerPixelX / cellW);

      // Check if player has been carried off screen
      if (newPlayerPixelX < 0 || newPlayerPixelX > gameWidth) {
        // Player carried off screen by platform -> death
        if (invincibleMs <= 0) {
          const deathResult = handleDeath(
            'off_screen', lives, diedThisLevel, state, newLanes, events,
          );
          lives = deathResult.lives;
          diedThisLevel = deathResult.diedThisLevel;
          phase = deathResult.phase;
          playerRow = deathResult.playerRow;
          playerCol = deathResult.playerCol;
          riding = null;
          invincibleMs = deathResult.invincibleMs;
          momentum = 0;
          momentumTimer = 0;
        }
      } else {
        // Clamp to grid bounds
        playerCol = Math.max(0, Math.min(state.totalCols - 1, newCol));
      }
    } else {
      // Not on any platform while in water -> drowning
      if (invincibleMs <= 0) {
        riding = null;
        const deathResult = handleDeath(
          'water', lives, diedThisLevel, state, newLanes, events,
        );
        lives = deathResult.lives;
        diedThisLevel = deathResult.diedThisLevel;
        phase = deathResult.phase;
        playerRow = deathResult.playerRow;
        playerCol = deathResult.playerCol;
        invincibleMs = deathResult.invincibleMs;
        momentum = 0;
        momentumTimer = 0;
      }
    }
  } else {
    riding = null;
  }

  // -- 3. Obstacle collision (path lanes) --
  if (phase === 'playing' && currentLane && currentLane.type === 'path' && invincibleMs <= 0) {
    const { x: playerCenterX } = getCellPixelPos(
      playerCol, playerRow, gameWidth, gameHeight, state.totalRows, state.totalCols,
    );

    // Use the updated lane from newLanes
    const updatedLane = newLanes[playerRow];
    if (checkPlayerHitObstacle(playerCenterX, cellW, updatedLane)) {
      const deathResult = handleDeath(
        'obstacle', lives, diedThisLevel, state, newLanes, events,
      );
      lives = deathResult.lives;
      diedThisLevel = deathResult.diedThisLevel;
      phase = deathResult.phase;
      playerRow = deathResult.playerRow;
      playerCol = deathResult.playerCol;
      riding = null;
      invincibleMs = deathResult.invincibleMs;
      momentum = 0;
      momentumTimer = 0;
    }
  }

  // -- 4. Star collection --
  if (phase === 'playing') {
    const playerLane = newLanes[playerRow];
    if (playerLane) {
      const { x: playerCenterX } = getCellPixelPos(
        playerCol, playerRow, gameWidth, gameHeight, state.totalRows, state.totalCols,
      );
      const star = checkPlayerHitStar(playerCenterX, cellW, playerLane);
      if (star) {
        score += GAME_CONSTANTS.STAR_POINTS;
        starsCollected += 1;
        totalStars += 1;
        events.push({ type: 'star_collected', itemId: star.id, points: GAME_CONSTANTS.STAR_POINTS });

        // Remove star from lane
        const laneIdx = playerRow;
        newLanes[laneIdx] = {
          ...newLanes[laneIdx],
          items: newLanes[laneIdx].items.filter((it) => it.id !== star.id),
        };
      }
    }
  }

  // -- 5. Flood meter --
  if (phase === 'playing') {
    floodMeter += state.floodRate * dtSec;

    if (floodMeter >= 100) {
      floodMeter = 100;
      events.push({ type: 'flood_full' });

      // Convert bottom rows to flooded water
      floodRowTimer += dt;
      if (floodRowTimer >= GAME_CONSTANTS.FLOOD_ROW_INTERVAL_MS) {
        floodRowTimer -= GAME_CONSTANTS.FLOOD_ROW_INTERVAL_MS;
        floodedRows += 1;
        events.push({ type: 'flood_row', rowsFlooded: floodedRows });

        // Check if flood has reached the player
        if (playerRow < floodedRows && invincibleMs <= 0) {
          const deathResult = handleDeath(
            'flood', lives, diedThisLevel, state, newLanes, events,
          );
          lives = deathResult.lives;
          diedThisLevel = deathResult.diedThisLevel;
          phase = deathResult.phase;
          playerRow = deathResult.playerRow;
          playerCol = deathResult.playerCol;
          riding = null;
          invincibleMs = deathResult.invincibleMs;
          momentum = 0;
          momentumTimer = 0;
        }
      }
    }
  }

  // Build new state
  const newState: GameState = {
    ...state,
    phase,
    player: {
      ...state.player,
      col: playerCol,
      row: playerRow,
      riding,
    },
    lanes: newLanes,
    score,
    lives,
    elapsedMs,
    starsCollected,
    totalStars,
    floodMeter,
    floodedRows,
    floodRowTimer,
    invincibleMs,
    momentum,
    momentumTimer,
    diedThisLevel,
  };

  return { state: newState, events };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type DeathResult = {
  lives: number;
  diedThisLevel: boolean;
  phase: GamePhase;
  playerRow: number;
  playerCol: number;
  invincibleMs: number;
};

/**
 * Handle player death. Decrements lives, triggers respawn or game over.
 */
function handleDeath(
  cause: 'obstacle' | 'water' | 'flood' | 'off_screen',
  lives: number,
  diedThisLevel: boolean,
  state: GameState,
  lanes: Lane[],
  events: GameEvent[],
): DeathResult {
  lives -= 1;
  diedThisLevel = true;

  events.push({ type: 'player_died', cause });
  events.push({ type: 'life_lost', livesRemaining: lives });

  if (lives <= 0) {
    events.push({ type: 'game_over', finalScore: state.score });
    return {
      lives: 0,
      diedThisLevel,
      phase: 'game_over',
      playerRow: state.player.row,
      playerCol: state.player.col,
      invincibleMs: 0,
    };
  }

  // Respawn at bottom-most safe row (grass or start), centered
  const respawnRow = findRespawnRow(lanes, state.floodedRows);
  const respawnCol = Math.floor(state.totalCols / 2);

  events.push({ type: 'respawn', row: respawnRow, col: respawnCol });
  events.push({ type: 'invincibility_start' });

  return {
    lives,
    diedThisLevel,
    phase: 'playing',
    playerRow: respawnRow,
    playerCol: respawnCol,
    invincibleMs: GAME_CONSTANTS.INVINCIBLE_MS,
  };
}

/**
 * Find the bottom-most safe row above the flooded area for respawn.
 */
function findRespawnRow(lanes: Lane[], floodedRows: number): number {
  const safeStart = Math.min(floodedRows + 2, lanes.length - 1);
  for (let i = safeStart; i < lanes.length; i++) {
    if (lanes[i].type === 'start' || lanes[i].type === 'grass') {
      return i;
    }
  }
  for (let i = floodedRows; i < safeStart; i++) {
    if (lanes[i].type === 'start' || lanes[i].type === 'grass') {
      return i;
    }
  }
  return 0;
}

/**
 * Get momentum tier and bonus points for the current chain count.
 */
function getMomentumReward(chain: number): { tier: MomentumTier; bonus: number } {
  if (chain >= GAME_CONSTANTS.MOMENTUM_UNSTOPPABLE) {
    return { tier: 'unstoppable', bonus: GAME_CONSTANTS.MOMENTUM_BONUS_UNSTOPPABLE };
  }
  if (chain >= GAME_CONSTANTS.MOMENTUM_AMAZING) {
    return { tier: 'amazing', bonus: GAME_CONSTANTS.MOMENTUM_BONUS_AMAZING };
  }
  if (chain >= GAME_CONSTANTS.MOMENTUM_GREAT) {
    return { tier: 'great', bonus: GAME_CONSTANTS.MOMENTUM_BONUS_GREAT };
  }
  if (chain >= GAME_CONSTANTS.MOMENTUM_NICE) {
    return { tier: 'nice', bonus: GAME_CONSTANTS.MOMENTUM_BONUS_NICE };
  }
  return { tier: null, bonus: 0 };
}
