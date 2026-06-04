// ---------------------------------------------------------------------------
// Bible Brick Breaker -- Types
// "Break through the bricks, reveal the Word"
//
// Canonical type definitions for the Bible Brick Breaker game engine.
// Kept in a separate file (learned from Light Snake audit).
// ---------------------------------------------------------------------------

export type BrickType = 'clay' | 'stone' | 'gold';

export interface Brick {
  col: number;
  row: number;
  type: BrickType;
  letter: string;
  hitsRemaining: number;
  broken: boolean;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  active: boolean;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PowerUpKind = 'widePaddle' | 'multiBall' | 'slowBall';

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  kind: PowerUpKind;
  dy: number;
  active: boolean;
}

export interface ActiveEffect {
  kind: PowerUpKind;
  remainingMs: number;
}

export type GamePhase = 'countdown' | 'playing' | 'paused' | 'level_complete' | 'game_over';

export interface GameState {
  phase: GamePhase;
  bricks: Brick[];
  balls: Ball[];
  paddle: Paddle;
  powerUps: PowerUp[];
  activeEffects: ActiveEffect[];
  score: number;
  combo: number;
  lives: number;
  level: number;
  verseWords: string[];
  revealedWords: boolean[];
  elapsedMs: number;
  nextPowerUpId: number;
}

export type GameEvent =
  | { type: 'brick_hit'; brick: Brick; points: number }
  | { type: 'brick_broken'; brick: Brick; points: number }
  | { type: 'word_revealed'; wordIndex: number; word: string }
  | { type: 'combo'; count: number }
  | { type: 'ball_lost' }
  | { type: 'life_lost'; remaining: number }
  | { type: 'powerup_spawned'; kind: PowerUpKind }
  | { type: 'powerup_caught'; kind: PowerUpKind }
  | { type: 'powerup_expired'; kind: PowerUpKind }
  | { type: 'level_complete'; level: number; score: number }
  | { type: 'verse_milestone'; score: number }
  | { type: 'speed_up'; level: number }
  | { type: 'game_over'; finalScore: number; level: number };
