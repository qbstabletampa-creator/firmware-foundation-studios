// ---------------------------------------------------------------------------
// Ark Hopper -- Type Definitions
// ---------------------------------------------------------------------------

export type Direction = 'up' | 'down' | 'left' | 'right';

export type LaneType = 'start' | 'grass' | 'path' | 'water' | 'goal';

export type ObstacleType = 'sheep' | 'goat' | 'chicken' | 'donkeyCart';

export type PlatformType = 'log' | 'lilyPad';

export type ItemCategory = 'character' | 'obstacle' | 'platform' | 'collectible' | 'goal' | 'effect' | 'decoration';

export type LaneItem = {
  id: number;
  /** Current x position in pixels. */
  x: number;
  /** Width in pixels. */
  width: number;
  /** Display emoji. */
  emoji: string;
  /** Semantic type identifier (e.g. 'sheep', 'log', 'star'). */
  itemType: string;
};

export type Lane = {
  type: LaneType;
  /** Y position of this lane's top edge in pixels (computed at runtime). */
  y: number;
  /** Movement speed in pixels per second. 0 for static lanes. */
  speed: number;
  /** Scroll direction for moving items. */
  direction: 'left' | 'right';
  /** Moving or static items on this lane. */
  items: LaneItem[];
};

export type Player = {
  col: number;
  row: number;
  emoji: string;
  /** id of the LaneItem the player is currently riding, or null. */
  riding: number | null;
};

export type GamePhase = 'ready' | 'playing' | 'dying' | 'level_complete' | 'game_over' | 'paused';

export type MomentumTier = 'nice' | 'great' | 'amazing' | 'unstoppable' | null;

export type GameState = {
  phase: GamePhase;
  level: number;
  player: Player;
  lanes: Lane[];
  score: number;
  lives: number;
  elapsedMs: number;
  /** Highest row index the player has reached this life (for hop scoring). */
  furthestRow: number;
  /** Number of star collectibles picked up this level. */
  starsCollected: number;
  /** Total forward hops this game (for verse milestones). */
  totalHops: number;
  /** Total stars earned across the whole game session (currency). */
  totalStars: number;
  /** Flood meter percentage 0-100. */
  floodMeter: number;
  /** Number of bottom rows currently flooded. */
  floodedRows: number;
  /** Accumulated time since last flood row conversion (ms). */
  floodRowTimer: number;
  /** Momentum chain counter for consecutive forward hops. */
  momentum: number;
  /** Time since last forward hop in ms (for momentum reset). */
  momentumTimer: number;
  /** Whether the player has died on this level (for perfect crossing). */
  diedThisLevel: boolean;
  /** Total stars available in this level. */
  totalStarsInLevel: number;
  /** Invincibility remaining in ms after respawn. */
  invincibleMs: number;
  /** Grid dimensions. */
  totalRows: number;
  totalCols: number;
  /** Per-level par time in seconds. */
  parTimeSec: number;
  /** Flood fill rate in percent per second. */
  floodRate: number;
  /** Unique id counter for lane items. */
  itemIdCounter: number;
  /** Verse milestone counter (triggers every N hops). */
  verseMilestone: number;
  /** Last momentum tier awarded (prevents duplicate bonuses at same tier). */
  lastMomentumTier: MomentumTier;
};

// ---------------------------------------------------------------------------
// Game events emitted by engine functions
// ---------------------------------------------------------------------------

export type GameEvent =
  | { type: 'hop'; direction: Direction; fromRow: number; fromCol: number; toRow: number; toCol: number }
  | { type: 'new_row_reached'; row: number; points: number }
  | { type: 'star_collected'; itemId: number; points: number }
  | { type: 'player_died'; cause: 'obstacle' | 'water' | 'flood' | 'off_screen' }
  | { type: 'life_lost'; livesRemaining: number }
  | { type: 'respawn'; row: number; col: number }
  | { type: 'game_over'; finalScore: number }
  | { type: 'level_complete'; level: number; score: number; timeBonus: number; perfectBonus: number; allStarsBonus: number }
  | { type: 'flood_row'; rowsFlooded: number }
  | { type: 'flood_full' }
  | { type: 'momentum'; tier: MomentumTier; chain: number; bonus: number }
  | { type: 'verse_milestone'; milestone: number }
  | { type: 'invincibility_start' }
  | { type: 'invincibility_end' };
