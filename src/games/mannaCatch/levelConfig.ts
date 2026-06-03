import type { ItemType } from './types';

export interface LevelDef {
  level: number;
  targetScore: number;
  baseSpeed: number;
  spawnIntervalMs: number;
  unlockedItems: ItemType[];
}

const LEVELS: LevelDef[] = [
  {
    level: 1,
    targetScore: 100,
    baseSpeed: 120,
    spawnIntervalMs: 1200,
    unlockedItems: ['manna', 'honey', 'grapes', 'thorn'],
  },
  {
    level: 2,
    targetScore: 250,
    baseSpeed: 160,
    spawnIntervalMs: 1000,
    unlockedItems: ['manna', 'honey', 'grapes', 'pomegranate', 'figs', 'thorn', 'stone'],
  },
  {
    level: 3,
    targetScore: 500,
    baseSpeed: 200,
    spawnIntervalMs: 800,
    unlockedItems: ['manna', 'honey', 'grapes', 'pomegranate', 'figs', 'star', 'scroll', 'thorn', 'stone', 'snake'],
  },
  {
    level: 4,
    targetScore: 1000,
    baseSpeed: 240,
    spawnIntervalMs: 650,
    unlockedItems: ['manna', 'honey', 'grapes', 'pomegranate', 'figs', 'star', 'scroll', 'thorn', 'stone', 'snake'],
  },
];

export function getLevelDef(level: number): LevelDef {
  if (level <= LEVELS.length) return LEVELS[level - 1];
  // Level 5+: escalating difficulty
  const prev = LEVELS[LEVELS.length - 1];
  const extra = level - LEVELS.length;
  return {
    level,
    targetScore: prev.targetScore + extra * 500,
    baseSpeed: Math.min(prev.baseSpeed + extra * 30, 350),
    spawnIntervalMs: Math.max(prev.spawnIntervalMs - extra * 100, 400),
    unlockedItems: prev.unlockedItems,
  };
}
