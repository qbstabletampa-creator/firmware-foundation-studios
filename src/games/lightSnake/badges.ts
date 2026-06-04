// ---------------------------------------------------------------------------
// Badge system for Light Snake
// ---------------------------------------------------------------------------

export interface LightSnakeBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'score' | 'streak' | 'skill' | 'collection' | 'milestone';
  /** Human-readable condition string for display and evaluation. */
  condition: string;
}

export const lightSnakeBadges: LightSnakeBadge[] = [
  // -------------------------------------------------------------------------
  // MILESTONE — First steps on the path of light.
  // -------------------------------------------------------------------------
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Eat your first item',
    emoji: '🕯️',
    category: 'milestone',
    condition: 'totalItemsEaten >= 1',
  },

  // -------------------------------------------------------------------------
  // SKILL — Growing longer, shining brighter.
  // -------------------------------------------------------------------------
  {
    id: 'growing-brighter',
    name: 'Growing Brighter',
    description: 'Reach length 10',
    emoji: '🌟',
    category: 'skill',
    condition: 'length >= 10',
  },

  // -------------------------------------------------------------------------
  // SCORE — Points of light gathered along the way.
  // -------------------------------------------------------------------------
  {
    id: 'shining-path',
    name: 'Shining Path',
    description: 'Score 50 points',
    emoji: '✨',
    category: 'score',
    condition: 'score >= 50',
  },

  // -------------------------------------------------------------------------
  // COLLECTION — Gathering the good things God provides.
  // -------------------------------------------------------------------------
  {
    id: 'bread-of-life',
    name: 'Bread of Life',
    description: 'Eat 5 bread items',
    emoji: '🍞',
    category: 'collection',
    condition: 'breadEaten >= 5',
  },
  {
    id: 'fisher-of-men',
    name: 'Fisher of Men',
    description: 'Eat 5 fish items',
    emoji: '🐟',
    category: 'collection',
    condition: 'fishEaten >= 5',
  },
  {
    id: 'lamp-bearer',
    name: 'Lamp Bearer',
    description: 'Eat 3 lamp items',
    emoji: '🪔',
    category: 'collection',
    condition: 'lampsEaten >= 3',
  },

  // -------------------------------------------------------------------------
  // SKILL — Navigating thorns and picking up speed.
  // -------------------------------------------------------------------------
  {
    id: 'thorn-dodger',
    name: 'Thorn Dodger',
    description: 'Pass 5 thorns without dying',
    emoji: '🌵',
    category: 'skill',
    condition: 'thornsPassed >= 5',
  },
  {
    id: 'light-speed',
    name: 'Light Speed',
    description: 'Reach speed level 5',
    emoji: '⚡',
    category: 'skill',
    condition: 'speedLevel >= 5',
  },

  // -------------------------------------------------------------------------
  // SCORE — Higher peaks of radiance.
  // -------------------------------------------------------------------------
  {
    id: 'radiant',
    name: 'Radiant',
    description: 'Score 200 points',
    emoji: '☀️',
    category: 'score',
    condition: 'score >= 200',
  },

  // -------------------------------------------------------------------------
  // MILESTONE — A light set on a hill for all to see.
  // -------------------------------------------------------------------------
  {
    id: 'beacon',
    name: 'Beacon',
    description: 'Reach length 25',
    emoji: '🏔️',
    category: 'milestone',
    condition: 'length >= 25',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a badge by its id. */
export function getBadgeById(id: string): LightSnakeBadge | undefined {
  return lightSnakeBadges.find((b) => b.id === id);
}

/** Return badges filtered by category. */
export function getBadgesByCategory(
  category: LightSnakeBadge['category'],
): LightSnakeBadge[] {
  return lightSnakeBadges.filter((b) => b.category === category);
}
