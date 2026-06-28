import type { ItemCategory, LaneType } from './types';

// ---------------------------------------------------------------------------
// Item definitions
// ---------------------------------------------------------------------------

export type ItemDef = {
  name: string;
  emoji: string;
  category: ItemCategory;
  /** Star threshold to unlock this item (for characters) or level it appears. */
  unlockLevel: number;
  /** Points awarded when collected (collectibles only). */
  points: number;
  /** Hitbox width measured in cells (obstacles/platforms). */
  cellWidth: number;
};

export const ITEM_DEFS: ItemDef[] = [
  // Characters (player skins)
  { name: 'Lamb',        emoji: '\u{1F411}', category: 'character',   unlockLevel: 0,   points: 0,  cellWidth: 1   },
  { name: 'Dove',        emoji: '\u{1F54A}️', category: 'character',   unlockLevel: 10,  points: 0,  cellWidth: 1   },
  { name: 'Rabbit',      emoji: '\u{1F407}', category: 'character',   unlockLevel: 25,  points: 0,  cellWidth: 1   },
  { name: 'Turtle',      emoji: '\u{1F422}', category: 'character',   unlockLevel: 50,  points: 0,  cellWidth: 1   },
  { name: 'Fox',         emoji: '\u{1F98A}', category: 'character',   unlockLevel: 100, points: 0,  cellWidth: 1   },

  // Obstacles (path lanes)
  { name: 'Sheep',       emoji: '\u{1F40F}', category: 'obstacle',    unlockLevel: 1,   points: 0,  cellWidth: 0.8 },
  { name: 'Goat',        emoji: '\u{1F410}', category: 'obstacle',    unlockLevel: 1,   points: 0,  cellWidth: 0.9 },
  { name: 'Chicken',     emoji: '\u{1F414}', category: 'obstacle',    unlockLevel: 10,  points: 0,  cellWidth: 0.5 },
  { name: 'Donkey Cart', emoji: '\u{1FACF}', category: 'obstacle',    unlockLevel: 5,   points: 0,  cellWidth: 1.8 },

  // Platforms (water lanes)
  { name: 'Log',         emoji: '\u{1FAB5}', category: 'platform',    unlockLevel: 2,   points: 0,  cellWidth: 3.0 },
  { name: 'Lily Pad',    emoji: '\u{1FAB7}', category: 'platform',    unlockLevel: 3,   points: 0,  cellWidth: 1.0 },

  // Collectibles
  { name: 'Golden Star', emoji: '⭐',    category: 'collectible', unlockLevel: 1,   points: 50, cellWidth: 0.6 },
  { name: 'Olive Branch',emoji: '\u{1FAD2}', category: 'collectible', unlockLevel: 8,   points: 30, cellWidth: 0.6 },

  // Goal
  { name: "Noah's Ark",  emoji: '\u{1F6A2}', category: 'goal',        unlockLevel: 1,   points: 100,cellWidth: 10  },

  // Effects (visual only, no gameplay)
  { name: 'Rainbow',     emoji: '\u{1F308}', category: 'effect',      unlockLevel: 1,   points: 0,  cellWidth: 0   },
  { name: 'Water Splash',emoji: '\u{1F4A6}', category: 'effect',      unlockLevel: 1,   points: 0,  cellWidth: 0   },
  { name: 'Rain Cloud',  emoji: '\u{1F327}️', category: 'effect',      unlockLevel: 16,  points: 0,  cellWidth: 0   },

  // Decorations (visual only)
  { name: 'Grass Tuft',  emoji: '\u{1F33F}', category: 'decoration',  unlockLevel: 1,   points: 0,  cellWidth: 0   },
  { name: 'Flower',      emoji: '\u{1F338}', category: 'decoration',  unlockLevel: 1,   points: 0,  cellWidth: 0   },
  { name: 'Wheat',       emoji: '\u{1F33E}', category: 'decoration',  unlockLevel: 1,   points: 0,  cellWidth: 0   },
];

// ---------------------------------------------------------------------------
// Obstacle hitbox lookup (cellWidth by type name)
// ---------------------------------------------------------------------------

export const OBSTACLE_HITBOX: Record<string, number> = {
  sheep: 0.8,
  goat: 0.9,
  chicken: 0.5,
  donkeyCart: 1.8,
};

export const PLATFORM_HITBOX: Record<string, number> = {
  log: 3.0,
  lilyPad: 1.0,
};

// ---------------------------------------------------------------------------
// Lane template types
// ---------------------------------------------------------------------------

export type LaneItemTemplate = {
  itemType: string;
  emoji: string;
  cellWidth: number;
  /** For collectible stars sitting on a lane cell. */
  isCollectible?: boolean;
};

export type LaneTemplate = {
  type: LaneType;
  speed: number;
  direction: 'left' | 'right';
  items: LaneItemTemplate[];
  /** Collectible star on this lane? If set, a star sits on this cell index. */
  starCell?: number;
};

export type LevelTemplate = {
  level: number;
  name: string;
  rows: number;
  cols: number;
  lanes: LaneTemplate[];
  floodRate: number;
  parTimeSec: number;
};

// ---------------------------------------------------------------------------
// Per-level animal assignment
// ---------------------------------------------------------------------------

export const LEVEL_ANIMALS: { emoji: string; name: string }[] = [
  { emoji: '\u{1F411}', name: 'Lamb' },
  { emoji: '\u{1F54A}️', name: 'Dove' },
  { emoji: '\u{1F407}', name: 'Rabbit' },
  { emoji: '\u{1F422}', name: 'Turtle' },
  { emoji: '\u{1F98A}', name: 'Fox' },
  { emoji: '\u{1F418}', name: 'Elephant' },
  { emoji: '\u{1F992}', name: 'Giraffe' },
  { emoji: '\u{1F434}', name: 'Horse' },
  { emoji: '\u{1F981}', name: 'Lion' },
  { emoji: '\u{1F985}', name: 'Eagle' },
];

export function getAnimalForLevel(level: number): { emoji: string; name: string } {
  const idx = Math.min(level - 1, LEVEL_ANIMALS.length - 1);
  return LEVEL_ANIMALS[idx];
}

// ---------------------------------------------------------------------------
// Helper to build obstacle arrays
// ---------------------------------------------------------------------------

function obs(type: string, emoji: string, count: number, cellWidth: number): LaneItemTemplate[] {
  return Array.from({ length: count }, () => ({ itemType: type, emoji, cellWidth }));
}

function plat(type: string, emoji: string, count: number, cellWidth: number): LaneItemTemplate[] {
  return Array.from({ length: count }, () => ({ itemType: type, emoji, cellWidth }));
}

// ---------------------------------------------------------------------------
// Level templates (levels 1-20)
// ---------------------------------------------------------------------------

export const LANE_TEMPLATES: LevelTemplate[] = [
  {
    level: 1, name: 'First Steps', rows: 5, cols: 8, floodRate: 2, parTimeSec: 20,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 35, direction: 'left',  items: obs('sheep', '\u{1F40F}', 2, 0.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 3 },
      { type: 'path',  speed: 45, direction: 'right', items: obs('goat', '\u{1F410}', 2, 0.9) },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 2, name: 'River Crossing', rows: 7, cols: 8, floodRate: 2.5, parTimeSec: 28,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 40, direction: 'left',  items: obs('sheep', '\u{1F40F}', 2, 0.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'water', speed: 30, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 35, direction: 'left',  items: [...plat('log', '\u{1FAB5}', 2, 3.0), ...plat('lilyPad', '\u{1FAB7}', 1, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 4 },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 3, name: 'Barnyard Dash', rows: 9, cols: 9, floodRate: 3, parTimeSec: 36,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 50, direction: 'left',  items: obs('sheep', '\u{1F40F}', 2, 0.8) },
      { type: 'path',  speed: 55, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 5 },
      { type: 'water', speed: 40, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 45, direction: 'left',  items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 50, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8), starCell: 2 },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 4, name: 'Muddy Meadow', rows: 10, cols: 9, floodRate: 3.5, parTimeSec: 40,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 55, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'path',  speed: 60, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8) },
      { type: 'water', speed: 45, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 6 },
      { type: 'path',  speed: 65, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'water', speed: 50, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 55, direction: 'left',  items: obs('sheep', '\u{1F40F}', 2, 0.8), starCell: 4 },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 5, name: 'Cart Chaos', rows: 11, cols: 10, floodRate: 4, parTimeSec: 44,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 60, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8) },
      { type: 'path',  speed: 45, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 2, 1.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'water', speed: 50, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 55, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 7 },
      { type: 'path',  speed: 70, direction: 'left',  items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'path',  speed: 50, direction: 'right', items: [...obs('donkeyCart', '\u{1FACF}', 1, 1.8), ...obs('sheep', '\u{1F40F}', 2, 0.8)], starCell: 3 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 6, name: 'Rushing Waters', rows: 12, cols: 10, floodRate: 4.5, parTimeSec: 48,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 65, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8) },
      { type: 'water', speed: 55, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 60, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 75, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'path',  speed: 50, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 2, 1.8), starCell: 5 },
      { type: 'water', speed: 55, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 2 },
      { type: 'path',  speed: 90, direction: 'right', items: obs('chicken', '\u{1F414}', 3, 0.5) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 7, name: 'Opposite Lanes', rows: 12, cols: 10, floodRate: 5, parTimeSec: 48,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 70, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8) },
      { type: 'path',  speed: 75, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'water', speed: 50, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 55, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 6 },
      { type: 'path',  speed: 55, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 2, 1.8) },
      { type: 'path',  speed: 95, direction: 'left',  items: obs('chicken', '\u{1F414}', 4, 0.5), starCell: 7 },
      { type: 'water', speed: 60, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 80, direction: 'left',  items: [...obs('sheep', '\u{1F40F}', 2, 0.8), ...obs('goat', '\u{1F410}', 2, 0.9)] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 8, name: 'Storm Warning', rows: 12, cols: 10, floodRate: 5.5, parTimeSec: 48,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 80, direction: 'right', items: obs('goat', '\u{1F410}', 3, 0.9) },
      { type: 'path',  speed: 100, direction: 'left', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'water', speed: 65, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 4 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 60, direction: 'left',  items: [...obs('donkeyCart', '\u{1FACF}', 1, 1.8), ...obs('sheep', '\u{1F40F}', 2, 0.8)] },
      { type: 'water', speed: 60, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 70, direction: 'right', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 8 },
      { type: 'path',  speed: 85, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'path',  speed: 75, direction: 'left',  items: obs('sheep', '\u{1F40F}', 3, 0.8) },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 9, name: 'Narrow Passage', rows: 13, cols: 10, floodRate: 6, parTimeSec: 52,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 80, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 110, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'water', speed: 70, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 3, 1.0)] },
      { type: 'water', speed: 75, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 2, 1.0), starCell: 5 },
      { type: 'path',  speed: 60, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 90, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'water', speed: 65, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'path',  speed: 95, direction: 'left',  items: [...obs('sheep', '\u{1F40F}', 2, 0.8), ...obs('chicken', '\u{1F414}', 2, 0.5)], starCell: 3 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 10, name: 'The Great Crossing', rows: 13, cols: 10, floodRate: 6.5, parTimeSec: 52,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 120, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'path',  speed: 70, direction: 'left',  items: [...obs('donkeyCart', '\u{1FACF}', 1, 1.8), ...obs('goat', '\u{1F410}', 2, 0.9)] },
      { type: 'water', speed: 80, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 2 },
      { type: 'path',  speed: 90, direction: 'right', items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 105, direction: 'left', items: [...obs('goat', '\u{1F410}', 2, 0.9), ...obs('chicken', '\u{1F414}', 2, 0.5)] },
      { type: 'water', speed: 75, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)], starCell: 6 },
      { type: 'water', speed: 85, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 2, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 65, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 100, direction: 'left', items: [...obs('sheep', '\u{1F40F}', 2, 0.8), ...obs('goat', '\u{1F410}', 1, 0.9), ...obs('chicken', '\u{1F414}', 2, 0.5)], starCell: 8 },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  // Levels 11-20: procedurally described with increasing difficulty
  {
    level: 11, name: 'Rising Tide', rows: 14, cols: 10, floodRate: 7, parTimeSec: 56,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 90, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 105, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'water', speed: 70, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'water', speed: 80, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 4 },
      { type: 'water', speed: 75, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 1, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 110, direction: 'left',  items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'path',  speed: 60, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8), starCell: 7 },
      { type: 'water', speed: 85, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'path',  speed: 140, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 12, name: 'Animal Stampede', rows: 14, cols: 10, floodRate: 7.5, parTimeSec: 56,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 95, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 100, direction: 'right', items: obs('goat', '\u{1F410}', 5, 0.9) },
      { type: 'path',  speed: 55, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [], starCell: 3 },
      { type: 'path',  speed: 130, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'path',  speed: 110, direction: 'left',  items: [...obs('sheep', '\u{1F40F}', 2, 0.8), ...obs('goat', '\u{1F410}', 2, 0.9)] },
      { type: 'water', speed: 90, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 85, direction: 'left',  items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 65, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 2, 1.8), starCell: 5 },
      { type: 'path',  speed: 145, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 13, name: 'Lily Pad Gauntlet', rows: 14, cols: 10, floodRate: 8, parTimeSec: 56,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 100, direction: 'left',  items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'path',  speed: 120, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5), starCell: 6 },
      { type: 'water', speed: 75, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 85, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 3 },
      { type: 'water', speed: 80, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'water', speed: 90, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 140, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 150, direction: 'right', items: [...obs('goat', '\u{1F410}', 2, 0.9), ...obs('chicken', '\u{1F414}', 2, 0.5)], starCell: 8 },
      { type: 'path',  speed: 60, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 115, direction: 'right', items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 14, name: 'Chicken Run', rows: 14, cols: 10, floodRate: 8.5, parTimeSec: 56,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 130, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'path',  speed: 145, direction: 'left',  items: obs('chicken', '\u{1F414}', 4, 0.5), starCell: 7 },
      { type: 'path',  speed: 55, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 155, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'path',  speed: 60, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 2, 1.8) },
      { type: 'water', speed: 80, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 90, direction: 'right', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)], starCell: 4 },
      { type: 'water', speed: 85, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 140, direction: 'right', items: obs('chicken', '\u{1F414}', 4, 0.5), starCell: 2 },
      { type: 'path',  speed: 100, direction: 'left',  items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 15, name: 'Floodgate', rows: 15, cols: 10, floodRate: 9, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 100, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 120, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'water', speed: 80, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 90, direction: 'left',  items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 5 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 140, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'path',  speed: 65, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8), starCell: 3 },
      { type: 'water', speed: 95, direction: 'right', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'water', speed: 100, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 150, direction: 'right', items: [...obs('goat', '\u{1F410}', 2, 0.9), ...obs('chicken', '\u{1F414}', 3, 0.5)], starCell: 7 },
      { type: 'path',  speed: 110, direction: 'left',  items: obs('sheep', '\u{1F40F}', 5, 0.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 16, name: 'Dark Clouds', rows: 15, cols: 10, floodRate: 9.5, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 110, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 130, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'water', speed: 85, direction: 'right', items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'water', speed: 100, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 6 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 155, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'path',  speed: 70, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'water', speed: 95, direction: 'right', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'water', speed: 105, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 2 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 140, direction: 'right', items: [...obs('sheep', '\u{1F40F}', 3, 0.8), ...obs('goat', '\u{1F410}', 2, 0.9)], starCell: 8 },
      { type: 'path',  speed: 125, direction: 'left',  items: obs('goat', '\u{1F410}', 5, 0.9) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 17, name: 'Two by Two', rows: 15, cols: 10, floodRate: 10, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 110, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 120, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'path',  speed: 145, direction: 'left',  items: obs('chicken', '\u{1F414}', 4, 0.5) },
      { type: 'water', speed: 85, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 4, 1.0), starCell: 5 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 60, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 160, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5), starCell: 3 },
      { type: 'water', speed: 90, direction: 'left',  items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'water', speed: 95, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 130, direction: 'left',  items: obs('sheep', '\u{1F40F}', 5, 0.8), starCell: 7 },
      { type: 'path',  speed: 115, direction: 'right', items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 18, name: 'Thunder Road', rows: 15, cols: 10, floodRate: 10.5, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 120, direction: 'left',  items: obs('sheep', '\u{1F40F}', 4, 0.8) },
      { type: 'path',  speed: 65, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 160, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5), starCell: 4 },
      { type: 'water', speed: 90, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 70, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 140, direction: 'right', items: obs('goat', '\u{1F410}', 5, 0.9) },
      { type: 'water', speed: 100, direction: 'left', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)], starCell: 6 },
      { type: 'water', speed: 105, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'water', speed: 95, direction: 'left',  items: plat('log', '\u{1FAB5}', 2, 3.0) },
      { type: 'path',  speed: 75, direction: 'right', items: obs('donkeyCart', '\u{1FACF}', 2, 1.8), starCell: 8 },
      { type: 'path',  speed: 135, direction: 'left',  items: obs('sheep', '\u{1F40F}', 5, 0.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 19, name: 'Final Flood', rows: 15, cols: 10, floodRate: 11, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 130, direction: 'left',  items: obs('goat', '\u{1F410}', 4, 0.9) },
      { type: 'path',  speed: 165, direction: 'right', items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'water', speed: 90, direction: 'right', items: [...plat('log', '\u{1FAB5}', 1, 3.0), ...plat('lilyPad', '\u{1FAB7}', 2, 1.0)] },
      { type: 'water', speed: 100, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 5 },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 70, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 145, direction: 'right', items: [...obs('sheep', '\u{1F40F}', 2, 0.8), ...obs('goat', '\u{1F410}', 3, 0.9)], starCell: 3 },
      { type: 'water', speed: 95, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'water', speed: 110, direction: 'left', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'water', speed: 100, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 7 },
      { type: 'path',  speed: 150, direction: 'left',  items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'path',  speed: 115, direction: 'right', items: obs('sheep', '\u{1F40F}', 5, 0.8) },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
  {
    level: 20, name: "Noah's Call", rows: 15, cols: 10, floodRate: 11.5, parTimeSec: 60,
    lanes: [
      { type: 'start', speed: 0, direction: 'right', items: [] },
      { type: 'path',  speed: 140, direction: 'left',  items: obs('sheep', '\u{1F40F}', 5, 0.8) },
      { type: 'path',  speed: 170, direction: 'right', items: obs('chicken', '\u{1F414}', 5, 0.5), starCell: 2 },
      { type: 'water', speed: 95, direction: 'right', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'water', speed: 110, direction: 'left', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'path',  speed: 75, direction: 'left',  items: obs('donkeyCart', '\u{1FACF}', 3, 1.8) },
      { type: 'path',  speed: 160, direction: 'right', items: [...obs('goat', '\u{1F410}', 3, 0.9), ...obs('chicken', '\u{1F414}', 2, 0.5)] },
      { type: 'grass', speed: 0, direction: 'right', items: [] },
      { type: 'water', speed: 100, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0), starCell: 6 },
      { type: 'water', speed: 115, direction: 'right', items: [...plat('lilyPad', '\u{1FAB7}', 2, 1.0), ...plat('log', '\u{1FAB5}', 1, 3.0)] },
      { type: 'water', speed: 105, direction: 'left', items: plat('lilyPad', '\u{1FAB7}', 3, 1.0) },
      { type: 'path',  speed: 150, direction: 'right', items: obs('goat', '\u{1F410}', 5, 0.9), starCell: 8 },
      { type: 'path',  speed: 120, direction: 'left',  items: [...obs('donkeyCart', '\u{1FACF}', 2, 1.8), ...obs('sheep', '\u{1F40F}', 2, 0.8)] },
      { type: 'path',  speed: 165, direction: 'right', items: obs('chicken', '\u{1F414}', 5, 0.5) },
      { type: 'goal',  speed: 0, direction: 'right', items: [] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------

export const GAME_CONSTANTS = {
  /** Default canvas width used for cell size reference. */
  CANVAS_WIDTH: 750,
  /** Default canvas height. */
  CANVAS_HEIGHT: 1334,
  /** Starting lives. */
  INITIAL_LIVES: 3,
  /** Forward hop (new row) point value. */
  HOP_POINTS: 10,
  /** Collectible star point value. */
  STAR_POINTS: 50,
  /** Flat bonus for completing a level. */
  ARK_BONUS: 100,
  /** Bonus for perfect crossing (no deaths on level). */
  PERFECT_BONUS: 200,
  /** Bonus for collecting all stars in a level. */
  ALL_STARS_BONUS: 150,
  /** Time bonus: points per second under par. */
  TIME_BONUS_PER_SEC: 10,
  /** Momentum chain threshold for "Nice!" */
  MOMENTUM_NICE: 3,
  /** Momentum chain threshold for "Great!" */
  MOMENTUM_GREAT: 5,
  /** Momentum chain threshold for "Amazing!" */
  MOMENTUM_AMAZING: 8,
  /** Momentum chain threshold for "Unstoppable!" */
  MOMENTUM_UNSTOPPABLE: 10,
  /** Bonus points at each momentum tier. */
  MOMENTUM_BONUS_NICE: 5,
  MOMENTUM_BONUS_GREAT: 15,
  MOMENTUM_BONUS_AMAZING: 30,
  MOMENTUM_BONUS_UNSTOPPABLE: 50,
  /** Time window in ms to maintain momentum chain. */
  MOMENTUM_TIMEOUT_MS: 1000,
  /** Invincibility period after respawn in ms. */
  INVINCIBLE_MS: 1500,
  /** Interval between flood row conversions once meter is full, in ms. */
  FLOOD_ROW_INTERVAL_MS: 1500,
  /** Player collision overlap threshold (fraction of cell width). */
  COLLISION_THRESHOLD: 0.6,
  /** Hop animation duration in ms. */
  HOP_ANIM_MS: 150,
  /** Dying animation duration in ms. */
  DYING_ANIM_MS: 600,
  /** Level complete animation duration in ms. */
  LEVEL_COMPLETE_ANIM_MS: 1200,
  /** Verse milestone: show a verse every N forward hops. */
  VERSE_MILESTONE_HOPS: 30,
  /** Base lane speed reference (used for scaling descriptions). */
  BASE_LANE_SPEED: 80,
} as const;
