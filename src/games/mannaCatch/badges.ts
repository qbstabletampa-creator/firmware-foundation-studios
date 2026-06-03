import type { PowerUpType } from './types';

// ---------------------------------------------------------------------------
// Badge system for Manna Catch
// ---------------------------------------------------------------------------

export interface MannaBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'score' | 'streak' | 'skill' | 'collection' | 'milestone';
  /** Human-readable condition string for display and evaluation. */
  condition: string;
}

export const mannaBadges: MannaBadge[] = [
  // -------------------------------------------------------------------------
  // SCORE MILESTONES (5 badges) — Armor of God, Ephesians 6:10-18
  // Each piece of armor unlocks as you grow stronger in the game.
  // -------------------------------------------------------------------------
  {
    id: 'belt-of-truth',
    name: 'Belt of Truth',
    description: 'Gather 50 points of goodness',
    emoji: '⚔️',
    category: 'score',
    condition: 'score >= 50',
  },
  {
    id: 'breastplate',
    name: 'Breastplate of Righteousness',
    description: 'Gather 100 points of goodness',
    emoji: '🛡️',
    category: 'score',
    condition: 'score >= 100',
  },
  {
    id: 'gospel-shoes',
    name: 'Shoes of Peace',
    description: 'Gather 250 points of goodness',
    emoji: '👟',
    category: 'score',
    condition: 'score >= 250',
  },
  {
    id: 'shield-faith',
    name: 'Shield of Faith',
    description: 'Gather 500 points of goodness',
    emoji: '🔰',
    category: 'score',
    condition: 'score >= 500',
  },
  {
    id: 'helmet-salvation',
    name: 'Helmet of Salvation',
    description: 'Gather 1,000 points of goodness',
    emoji: '⛑️',
    category: 'score',
    condition: 'score >= 1000',
  },

  // -------------------------------------------------------------------------
  // STREAK (4 badges) — Fruits of the Spirit, Galatians 5:22-23
  // Faithful daily play, growing from seed to mountain.
  // -------------------------------------------------------------------------
  {
    id: 'patience',
    name: 'Patience',
    description: 'Show up 3 days in a row',
    emoji: '🌱',
    category: 'streak',
    condition: 'streak >= 3',
  },
  {
    id: 'faithfulness',
    name: 'Faithfulness',
    description: 'Show up 7 days in a row',
    emoji: '🌿',
    category: 'streak',
    condition: 'streak >= 7',
  },
  {
    id: 'perseverance',
    name: 'Perseverance',
    description: 'Show up 14 days in a row',
    emoji: '🌳',
    category: 'streak',
    condition: 'streak >= 14',
  },
  {
    id: 'steadfast',
    name: 'Steadfast',
    description: 'Show up 30 days in a row. You are rooted!',
    emoji: '⛰️',
    category: 'streak',
    condition: 'streak >= 30',
  },

  // -------------------------------------------------------------------------
  // SKILL (5 badges) — Catching blessings with grace and focus.
  // -------------------------------------------------------------------------
  {
    id: 'basket-weaver',
    name: 'Basket Weaver',
    description: 'Catch 5 in a row without missing',
    emoji: '🧺',
    category: 'skill',
    condition: 'combo >= 5',
  },
  {
    id: 'golden-hands',
    name: 'Golden Hands',
    description: 'Catch 10 in a row without missing',
    emoji: '🙌',
    category: 'skill',
    condition: 'combo >= 10',
  },
  {
    id: 'manna-master',
    name: 'Manna Master',
    description: 'Catch 20 in a row. Your hands overflow!',
    emoji: '👑',
    category: 'skill',
    condition: 'combo >= 20',
  },
  {
    id: 'untouched',
    name: 'Untouched',
    description: 'Score 100+ without losing a single life',
    emoji: '✨',
    category: 'skill',
    condition: 'score >= 100 && lives == 3',
  },
  {
    id: 'power-collector',
    name: 'Blessed Three',
    description: 'Use the basket, the slow, and the magnet in one game',
    emoji: '⚡',
    category: 'skill',
    condition: 'allPowerUps',
  },

  // -------------------------------------------------------------------------
  // COLLECTION (3 badges) — The Word is a lamp, Psalm 119:105
  // -------------------------------------------------------------------------
  {
    id: 'verse-seeker',
    name: 'Verse Seeker',
    description: 'Discover 5 Bible verses',
    emoji: '📖',
    category: 'collection',
    condition: 'verses >= 5',
  },
  {
    id: 'word-keeper',
    name: 'Word Keeper',
    description: 'Discover 15 Bible verses',
    emoji: '📚',
    category: 'collection',
    condition: 'verses >= 15',
  },
  {
    id: 'scripture-scholar',
    name: 'Scripture Scholar',
    description: 'Discover all 50 Bible verses. The Word is in your heart!',
    emoji: '🎓',
    category: 'collection',
    condition: 'verses == 50',
  },

  // -------------------------------------------------------------------------
  // PLAY MILESTONES (3 badges) — Showing up is a blessing of its own.
  // -------------------------------------------------------------------------
  {
    id: 'first-catch',
    name: 'First Catch',
    description: 'Play your very first game',
    emoji: '🎉',
    category: 'milestone',
    condition: 'gamesPlayed >= 1',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 25 games. You keep coming back!',
    emoji: '💪',
    category: 'milestone',
    condition: 'gamesPlayed >= 25',
  },
  {
    id: 'devoted',
    name: 'Devoted',
    description: 'Play 100 games. Your faithfulness inspires others!',
    emoji: '🏆',
    category: 'milestone',
    condition: 'gamesPlayed >= 100',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All three power-up types the player must collect for the 'Blessed Three' badge. */
export const ALL_POWERUP_TYPES: PowerUpType[] = [
  'wide_basket',
  'slow_mo',
  'magnet',
];

/** Look up a badge by its id. */
export function getBadgeById(id: string): MannaBadge | undefined {
  return mannaBadges.find((b) => b.id === id);
}

/** Return badges filtered by category. */
export function getBadgesByCategory(
  category: MannaBadge['category'],
): MannaBadge[] {
  return mannaBadges.filter((b) => b.category === category);
}
