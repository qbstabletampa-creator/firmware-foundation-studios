export type ItemType =
  | 'manna' | 'honey' | 'grapes' | 'pomegranate' | 'figs'
  | 'star' | 'scroll'
  | 'thorn' | 'stone' | 'snake';

export type ItemCategory = 'good' | 'bad';

export type PowerUpType = 'wide_basket' | 'slow_mo' | 'magnet';

export type FallingItem = {
  id: string;
  type: ItemType;
  category: ItemCategory;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  points: number;
  icon: string;
  rotation: number;
};

export type GameMode = 'daily' | 'freeplay';
export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

export type ActivePowerUp = {
  type: PowerUpType;
  remainingMs: number;
  icon: string;
  color: string;
};

export type GameState = {
  phase: GamePhase;
  mode: GameMode;
  score: number;
  lives: number;
  items: FallingItem[];
  basket: { x: number; width: number };
  activePowerUps: ActivePowerUp[];
  elapsedMs: number;
  combo: number;
  bestCombo: number;
  nextSpawnMs: number;
  level: number;
  levelScore: number;
  levelElapsedMs: number;
  itemIdCounter: number;
};
