// ---------------------------------------------------------------------------
// Noah's Animal Match -- Badge system
// ---------------------------------------------------------------------------

export interface NoahBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'score' | 'streak' | 'skill' | 'collection' | 'milestone';
  /** Human-readable condition string for display and evaluation. */
  condition: string;
}

export const noahBadges: NoahBadge[] = [
  // -------------------------------------------------------------------------
  // MILESTONE (7 badges)
  // -------------------------------------------------------------------------
  {
    id: 'first-pair',
    name: 'First Pair Found',
    description: 'Match your very first pair of animals',
    emoji: '🎉',
    category: 'milestone',
    condition: 'Match your very first pair of animals.',
  },
  {
    id: 'ark-apprentice',
    name: 'Ark Apprentice',
    description: 'Complete Level 1 with any star rating',
    emoji: '🔰',
    category: 'milestone',
    condition: 'Complete Level 1 with any star rating.',
  },
  {
    id: 'ark-builder',
    name: 'Ark Builder',
    description: 'Complete all 5 levels with at least 1 star each',
    emoji: '🛠️',
    category: 'milestone',
    condition: 'Complete all 5 levels with at least 1 star each.',
  },
  {
    id: 'ark-captain',
    name: 'Ark Captain',
    description: 'Complete Level 5 (The Great Flood) with 3 stars',
    emoji: '⚓',
    category: 'milestone',
    condition: 'Complete Level 5 (The Great Flood) with 3 stars.',
  },
  {
    id: 'star-collector',
    name: 'Star Collector',
    description: 'Earn a total of 10 stars across all levels',
    emoji: '⭐',
    category: 'milestone',
    condition: 'Earn a total of 10 stars across all levels.',
  },
  {
    id: 'three-star-sweep',
    name: 'Three Star Sweep',
    description: 'Earn 3 stars on every level (15 stars total)',
    emoji: '🌟',
    category: 'milestone',
    condition: 'Earn 3 stars on every level (15 stars total).',
  },
  {
    id: 'persistence',
    name: 'Faithful Player',
    description: 'Complete 25 total level attempts across all levels',
    emoji: '🙏',
    category: 'milestone',
    condition: 'Complete 25 total level attempts (wins or losses across all levels).',
  },

  // -------------------------------------------------------------------------
  // SKILL (4 badges)
  // -------------------------------------------------------------------------
  {
    id: 'perfect-ark',
    name: 'Perfect Ark',
    description: 'Complete any level with zero mismatches',
    emoji: '✨',
    category: 'skill',
    condition: 'Complete any level with zero mismatches.',
  },
  {
    id: 'flawless-flood',
    name: 'Flawless Flood',
    description: 'Complete Level 5 with zero mismatches',
    emoji: '💎',
    category: 'skill',
    condition: 'Complete Level 5 with zero mismatches (perfect clear on the master grid).',
  },
  {
    id: 'quick-hands',
    name: 'Quick Hands',
    description: 'Earn the Quick Recall speed bonus 5 times in a single level',
    emoji: '⚡',
    category: 'skill',
    condition: 'Earn the Quick Recall speed bonus 5 times in a single level.',
  },
  {
    id: 'lightning-memory',
    name: 'Lightning Memory',
    description: 'Complete any level in under 50% of the par time',
    emoji: '🧠',
    category: 'skill',
    condition: 'Complete any level in under 50% of the par time.',
  },

  // -------------------------------------------------------------------------
  // STREAK (3 badges)
  // -------------------------------------------------------------------------
  {
    id: 'combo-keeper',
    name: 'Combo Keeper',
    description: 'Reach a 3x combo multiplier in any level',
    emoji: '🔥',
    category: 'streak',
    condition: 'Reach a 3x combo multiplier in any level.',
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Reach the maximum 3.0x combo multiplier (5+ consecutive matches)',
    emoji: '💥',
    category: 'streak',
    condition: 'Reach the maximum 3.0x combo multiplier (5+ consecutive matches).',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Match 8 or more pairs in a row without a single mismatch',
    emoji: '🌊',
    category: 'streak',
    condition: 'Match 8 or more pairs in a row without a single mismatch.',
  },

  // -------------------------------------------------------------------------
  // SCORE (3 badges)
  // -------------------------------------------------------------------------
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Earn a cumulative score of 10,000 points',
    emoji: '💯',
    category: 'score',
    condition: 'Earn a total cumulative score of 10,000 points across all games.',
  },
  {
    id: 'high-scorer',
    name: 'High Scorer',
    description: 'Score 2,000 or more points in a single level',
    emoji: '🏅',
    category: 'score',
    condition: 'Score 2,000 or more points in a single level.',
  },
  {
    id: 'score-legend',
    name: 'Score Legend',
    description: 'Earn a cumulative score of 50,000 points',
    emoji: '🏆',
    category: 'score',
    condition: 'Earn a total cumulative score of 50,000 points across all games.',
  },

  // -------------------------------------------------------------------------
  // COLLECTION (3 badges)
  // -------------------------------------------------------------------------
  {
    id: 'animal-spotter',
    name: 'Animal Spotter',
    description: 'Match at least 10 different animal types across all games',
    emoji: '🔍',
    category: 'collection',
    condition: 'Match at least 10 different animal types across all games played.',
  },
  {
    id: 'noahs-menagerie',
    name: "Noah's Menagerie",
    description: 'Match all 18 animal types at least once',
    emoji: '📜',
    category: 'collection',
    condition: 'Match all 18 animal types at least once across all games played.',
  },
  {
    id: 'dove-whisperer',
    name: 'Dove Whisperer',
    description: 'Match the Dove pair 20 times across all games',
    emoji: '🕊️',
    category: 'collection',
    condition: 'Match the Dove pair 20 times across all games.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a badge by its id. */
export function getBadgeById(id: string): NoahBadge | undefined {
  return noahBadges.find((b) => b.id === id);
}

/** Return badges filtered by category. */
export function getBadgesByCategory(
  category: NoahBadge['category'],
): NoahBadge[] {
  return noahBadges.filter((b) => b.category === category);
}
