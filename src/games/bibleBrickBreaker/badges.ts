// ---------------------------------------------------------------------------
// Badge system for Bible Brick Breaker
// ---------------------------------------------------------------------------

export interface BibleBrickBreakerBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'gameplay' | 'mastery' | 'special';
  /** Human-readable condition string for display and evaluation. */
  condition: string;
}

export const bibleBrickBreakerBadges: BibleBrickBreakerBadge[] = [
  // -------------------------------------------------------------------------
  // GAMEPLAY — Getting started, breaking bricks, collecting power-ups.
  // -------------------------------------------------------------------------
  {
    id: 'first-break',
    name: 'First Break',
    description: 'Break your first brick',
    emoji: '\u{1F9F1}',
    category: 'gameplay',
    condition: 'totalBricksBroken >= 1',
  },
  {
    id: 'word-builder',
    name: 'Word Builder',
    description: 'Reveal your first word',
    emoji: '\u{1F4D6}',
    category: 'gameplay',
    condition: 'totalWordsRevealed >= 1',
  },
  {
    id: 'brick-by-brick',
    name: 'Brick by Brick',
    description: 'Break 50 bricks total',
    emoji: '\u{1F528}',
    category: 'gameplay',
    condition: 'totalBricksBroken >= 50',
  },
  {
    id: 'power-collector',
    name: 'Power Collector',
    description: 'Catch 10 power-ups',
    emoji: '⚡',
    category: 'gameplay',
    condition: 'totalPowerUpsCaught >= 10',
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Score 100 points',
    emoji: '\u{1F4AF}',
    category: 'gameplay',
    condition: 'highScore >= 100',
  },

  // -------------------------------------------------------------------------
  // MASTERY — Skill and persistence rewarded.
  // -------------------------------------------------------------------------
  {
    id: 'combo-crusher',
    name: 'Combo Crusher',
    description: 'Hit a 10x combo',
    emoji: '\u{1F525}',
    category: 'mastery',
    condition: 'bestCombo >= 10',
  },
  {
    id: 'stone-breaker',
    name: 'Stone Breaker',
    description: 'Break 25 stone bricks',
    emoji: '\u{1FAA8}',
    category: 'mastery',
    condition: 'totalStoneBricksBroken >= 25',
  },
  {
    id: 'level-5',
    name: 'Level 5',
    description: 'Reach level 5',
    emoji: '⭐',
    category: 'mastery',
    condition: 'highestLevel >= 5',
  },

  // -------------------------------------------------------------------------
  // SPECIAL — Rare achievements that show true dedication.
  // -------------------------------------------------------------------------
  {
    id: 'verse-master',
    name: 'Verse Master',
    description: 'Reveal 50 words total',
    emoji: '✝️',
    category: 'special',
    condition: 'totalWordsRevealed >= 50',
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Complete a level without losing a life',
    emoji: '\u{1F6E1}️',
    category: 'special',
    condition: 'completedLevelWithoutLosingLife >= 1',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a badge by its id. */
export function getBadgeById(id: string): BibleBrickBreakerBadge | undefined {
  return bibleBrickBreakerBadges.find((b) => b.id === id);
}

/** Return badges filtered by category. */
export function getBadgesByCategory(
  category: BibleBrickBreakerBadge['category'],
): BibleBrickBreakerBadge[] {
  return bibleBrickBreakerBadges.filter((b) => b.category === category);
}
