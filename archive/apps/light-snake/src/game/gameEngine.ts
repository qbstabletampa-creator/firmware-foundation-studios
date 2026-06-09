// ---------------------------------------------------------------------------
// Light Snake -- Pure Game Engine
// "Guide the light through darkness"
//
// Snake head is a light/lantern, body is a light trail.
// Food items are Bible-themed: bread, fish, lamp.
// Thorns are obstacles that kill on contact.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface FoodItem {
  pos: Position;
  type: 'bread' | 'fish' | 'lamp';
  points: number;
  emoji: string;
}

export interface Thorn {
  pos: Position;
}

export interface GameState {
  phase: 'countdown' | 'playing' | 'game_over';
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: FoodItem[];
  thorns: Thorn[];
  score: number;
  combo: number;
  lastEatTime: number;
  speed: number;
  moveTimer: number;
  gridCols: number;
  gridRows: number;
  itemsEaten: number;
  totalMoves: number;
  elapsedMs: number;
}

export type GameEvent =
  | { type: 'moved' }
  | { type: 'food_eaten'; item: FoodItem; points: number }
  | { type: 'grew' }
  | { type: 'combo'; count: number }
  | { type: 'speed_up'; speed: number }
  | { type: 'thorn_hit' }
  | { type: 'wall_hit' }
  | { type: 'self_hit' }
  | { type: 'game_over'; cause: string }
  | { type: 'verse_milestone' };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base interval in ms at speed 1. */
const BASE_INTERVAL_MS = 300;

/** Speed increase per 5 items eaten. */
const SPEED_INCREMENT = 0.5;

/** Items eaten per speed increase. */
const ITEMS_PER_SPEED_UP = 5;

/** Combo window in ms: eat within this time to keep combo alive. */
const COMBO_WINDOW_MS = 2000;

/** Max thorns allowed on the grid. */
const MAX_THORNS = 8;

/** Minimum items eaten before thorns start spawning. */
const THORNS_AFTER_ITEMS = 3;

/** Points between verse milestones. */
const VERSE_MILESTONE_INTERVAL = 50;

// ---------------------------------------------------------------------------
// Food type definitions
// ---------------------------------------------------------------------------

interface FoodDef {
  type: 'bread' | 'fish' | 'lamp';
  points: number;
  emoji: string;
  weight: number; // relative spawn probability
}

const FOOD_DEFS: FoodDef[] = [
  { type: 'bread', points: 10, emoji: '🍞', weight: 5 },
  { type: 'fish', points: 15, emoji: '🐟', weight: 3 },
  { type: 'lamp', points: 20, emoji: '🕯️', weight: 1 },
];

const TOTAL_WEIGHT = FOOD_DEFS.reduce((sum, d) => sum + d.weight, 0);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function posEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function posOccupied(pos: Position, state: GameState): boolean {
  if (state.snake.some((s) => posEqual(s, pos))) return true;
  if (state.food.some((f) => posEqual(f.pos, pos))) return true;
  if (state.thorns.some((t) => posEqual(t.pos, pos))) return true;
  return false;
}

function moveInterval(speed: number): number {
  return BASE_INTERVAL_MS / speed;
}

/**
 * Simple seeded-random-compatible helper: pick a random empty cell.
 * Uses the provided rng (0..1) to avoid side effects.
 */
function randomEmptyCell(
  state: GameState,
  rng: () => number,
): Position | null {
  // Build list of empty cells. For small grids this is fine.
  const empty: Position[] = [];
  for (let y = 0; y < state.gridRows; y++) {
    for (let x = 0; x < state.gridCols; x++) {
      const pos: Position = { x, y };
      if (!posOccupied(pos, state)) {
        empty.push(pos);
      }
    }
  }
  if (empty.length === 0) return null;
  const idx = Math.floor(rng() * empty.length);
  return empty[idx];
}

function pickFoodType(rng: () => number): FoodDef {
  let roll = rng() * TOTAL_WEIGHT;
  for (const def of FOOD_DEFS) {
    roll -= def.weight;
    if (roll <= 0) return def;
  }
  // Fallback (should not happen with correct weights).
  return FOOD_DEFS[0];
}

/** Opposite directions for 180-degree turn prevention. */
const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function headDelta(dir: Direction): Position {
  switch (dir) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a fresh GameState.
 *
 * Snake starts at the center of the grid, 3 segments long, moving right.
 * One food item is spawned. No thorns until 3 items have been eaten.
 *
 * Accepts an optional `rng` for deterministic tests (defaults to Math.random).
 */
export function createInitialState(
  gridCols: number,
  gridRows: number,
  rng: () => number = Math.random,
): GameState {
  const centerX = Math.floor(gridCols / 2);
  const centerY = Math.floor(gridRows / 2);

  // 3 segments: head at center, body trailing to the left.
  const snake: Position[] = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  const initial: GameState = {
    phase: 'countdown',
    snake,
    direction: 'right',
    nextDirection: 'right',
    food: [],
    thorns: [],
    score: 0,
    combo: 0,
    lastEatTime: 0,
    speed: 1,
    moveTimer: 0,
    gridCols,
    gridRows,
    itemsEaten: 0,
    totalMoves: 0,
    elapsedMs: 0,
  };

  // Spawn the first food item.
  const firstFood = spawnFood(initial, rng);
  if (firstFood) initial.food = [firstFood];

  return initial;
}

/**
 * Change the snake's queued direction.
 *
 * Prevents 180-degree reversals (e.g. going left while currently going right).
 * Returns a new state with `nextDirection` updated.
 */
export function changeDirection(state: GameState, dir: Direction): GameState {
  // Prevent reversing into yourself.
  if (OPPOSITE[state.direction] === dir) {
    return state;
  }
  // Also prevent double-buffered reversal: if nextDirection is already queued
  // and the new dir would reverse it, ignore.
  if (OPPOSITE[state.nextDirection] === dir) {
    return state;
  }
  return { ...state, nextDirection: dir };
}

/**
 * Advance the game by `deltaMs` milliseconds.
 *
 * Pure function: takes state, returns new state + events.
 * The rendering layer handles side effects (sounds, verse display, etc.).
 *
 * Accepts an optional `rng` for deterministic tests (defaults to Math.random).
 */
export function tick(
  state: GameState,
  deltaMs: number,
  rng: () => number = Math.random,
): { state: GameState; events: GameEvent[] } {
  // Only process during active play.
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  // Clamp delta to prevent tunnelling after tab-switch.
  const dt = Math.min(deltaMs, 100);
  const events: GameEvent[] = [];

  // Accumulate timers.
  let moveTimer = state.moveTimer + dt;
  let elapsedMs = state.elapsedMs + dt;
  const interval = moveInterval(state.speed);

  // If not enough time has passed for a move, just update timers.
  if (moveTimer < interval) {
    return {
      state: { ...state, moveTimer, elapsedMs },
      events: [],
    };
  }

  // --- Execute one move per interval tick ---
  // Consume the interval from the timer (allow remainder to carry over).
  moveTimer -= interval;

  // Apply queued direction.
  const direction = state.nextDirection;
  const delta = headDelta(direction);
  const head = state.snake[0];
  const newHead: Position = { x: head.x + delta.x, y: head.y + delta.y };

  // -- Collision: wall --
  if (
    newHead.x < 0 ||
    newHead.x >= state.gridCols ||
    newHead.y < 0 ||
    newHead.y >= state.gridRows
  ) {
    events.push({ type: 'wall_hit' });
    events.push({ type: 'game_over', cause: 'wall' });
    return {
      state: { ...state, phase: 'game_over', direction, moveTimer: 0, elapsedMs },
      events,
    };
  }

  // -- Collision: self (check against body, excluding the tail that will move) --
  // We check against the full current body. If food is NOT eaten the tail
  // will be removed, but the head occupies the new cell before the tail
  // vacates. We need to know if food is eaten first to decide whether to
  // remove the tail. So we check self-collision against snake[0..length-2]
  // (all but the last segment) since that segment will vacate unless food
  // is eaten. If food IS eaten we need to check against the full body.
  // Strategy: check against body minus tail first. If food eaten, additionally
  // check the tail position (which stays).
  const bodyWithoutTail = state.snake.slice(0, state.snake.length - 1);
  const hitsBodyWithoutTail = bodyWithoutTail.some((s) => posEqual(s, newHead));

  // -- Collision: thorn --
  if (state.thorns.some((t) => posEqual(t.pos, newHead))) {
    events.push({ type: 'thorn_hit' });
    events.push({ type: 'game_over', cause: 'thorn' });
    return {
      state: { ...state, phase: 'game_over', direction, moveTimer: 0, elapsedMs },
      events,
    };
  }

  // -- Check food --
  const eatenIndex = state.food.findIndex((f) => posEqual(f.pos, newHead));
  const ateFood = eatenIndex >= 0;

  // If the body without tail already collides, it is a self-hit regardless.
  // If food is eaten (tail stays), also check the tail position.
  if (hitsBodyWithoutTail) {
    events.push({ type: 'self_hit' });
    events.push({ type: 'game_over', cause: 'self' });
    return {
      state: { ...state, phase: 'game_over', direction, moveTimer: 0, elapsedMs },
      events,
    };
  }

  if (ateFood) {
    // Tail stays, so check if newHead hits the tail too.
    const tail = state.snake[state.snake.length - 1];
    if (posEqual(newHead, tail)) {
      events.push({ type: 'self_hit' });
      events.push({ type: 'game_over', cause: 'self' });
      return {
        state: { ...state, phase: 'game_over', direction, moveTimer: 0, elapsedMs },
        events,
      };
    }
  }

  // -- Build new snake --
  let newSnake: Position[];
  if (ateFood) {
    // Grow: keep all segments, prepend new head.
    newSnake = [newHead, ...state.snake];
  } else {
    // Move: prepend new head, drop tail.
    newSnake = [newHead, ...state.snake.slice(0, state.snake.length - 1)];
  }

  events.push({ type: 'moved' });

  // -- Process food eaten --
  let score = state.score;
  const prevScore = state.score;
  let combo = state.combo;
  let lastEatTime = state.lastEatTime;
  let speed = state.speed;
  let itemsEaten = state.itemsEaten;
  let food = [...state.food];
  let thorns = [...state.thorns];
  const totalMoves = state.totalMoves + 1;

  if (ateFood) {
    const eatenItem = food[eatenIndex];
    food.splice(eatenIndex, 1);

    // Combo logic: eating within the window keeps the combo alive.
    if (lastEatTime > 0 && elapsedMs - lastEatTime < COMBO_WINDOW_MS) {
      combo += 1;
    } else {
      combo = 1;
    }
    lastEatTime = elapsedMs;

    // Calculate points: base + combo bonus (combo * 2 extra per consecutive).
    const comboBonus = combo > 1 ? (combo - 1) * 2 : 0;
    const pointsAwarded = eatenItem.points + comboBonus;
    score += pointsAwarded;
    itemsEaten += 1;

    events.push({ type: 'food_eaten', item: eatenItem, points: pointsAwarded });
    events.push({ type: 'grew' });

    if (combo >= 2) {
      events.push({ type: 'combo', count: combo });
    }

    // Speed increase every ITEMS_PER_SPEED_UP items.
    const prevSpeedLevel = Math.floor((itemsEaten - 1) / ITEMS_PER_SPEED_UP);
    const newSpeedLevel = Math.floor(itemsEaten / ITEMS_PER_SPEED_UP);
    if (newSpeedLevel > prevSpeedLevel) {
      speed = 1 + newSpeedLevel * SPEED_INCREMENT;
      events.push({ type: 'speed_up', speed });
    }

    // Build a temporary state to use for spawning (reflects the updated snake/food/thorns).
    const tempState: GameState = {
      ...state,
      snake: newSnake,
      food,
      thorns,
      itemsEaten,
      score,
    };

    // Spawn replacement food.
    const newFood = spawnFood(tempState, rng);
    if (newFood) food.push(newFood);

    // Maybe spawn a thorn.
    const newThorn = spawnThorn(
      { ...tempState, food },
      rng,
    );
    if (newThorn) {
      thorns.push(newThorn);
    }
  }

  // -- Verse milestone check --
  // Fire event when score crosses a 50-point boundary.
  const prevMilestone = Math.floor(prevScore / VERSE_MILESTONE_INTERVAL);
  const newMilestone = Math.floor(score / VERSE_MILESTONE_INTERVAL);
  if (newMilestone > prevMilestone) {
    events.push({ type: 'verse_milestone' });
  }

  const newState: GameState = {
    phase: 'playing',
    snake: newSnake,
    direction,
    nextDirection: direction,
    food,
    thorns,
    score,
    combo,
    lastEatTime,
    speed,
    moveTimer,
    gridCols: state.gridCols,
    gridRows: state.gridRows,
    itemsEaten,
    totalMoves,
    elapsedMs,
  };

  return { state: newState, events };
}

/**
 * Spawn a food item at a random empty cell.
 *
 * Type is chosen by weighted random: bread (common), fish (medium), lamp (rare).
 * Returns null if the grid is completely full (no empty cell available).
 */
export function spawnFood(
  state: GameState,
  rng: () => number = Math.random,
): FoodItem | null {
  const pos = randomEmptyCell(state, rng);
  if (!pos) return null;
  const def = pickFoodType(rng);

  return {
    pos,
    type: def.type,
    points: def.points,
    emoji: def.emoji,
  };
}

/**
 * Spawn a thorn at a random empty cell.
 *
 * Only spawns if:
 * - At least THORNS_AFTER_ITEMS items have been eaten.
 * - Current thorn count is below max (floor(itemsEaten / 3), capped at MAX_THORNS).
 *
 * Returns null if no thorn should spawn or the grid is full.
 */
export function spawnThorn(
  state: GameState,
  rng: () => number = Math.random,
): Thorn | null {
  if (state.itemsEaten < THORNS_AFTER_ITEMS) return null;

  const maxThorns = Math.min(Math.floor(state.itemsEaten / 3), MAX_THORNS);
  if (state.thorns.length >= maxThorns) return null;

  const pos = randomEmptyCell(state, rng);
  if (!pos) return null;

  return { pos };
}
