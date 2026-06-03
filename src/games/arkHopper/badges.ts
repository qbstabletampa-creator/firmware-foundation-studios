// ---------------------------------------------------------------------------
// Badge system for Ark Hopper
// ---------------------------------------------------------------------------

export interface ArkHopperBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'milestone' | 'collection' | 'skill' | 'score' | 'streak';
  /** Human-readable condition string for display and evaluation. */
  condition: string;
}

export const arkHopperBadges: ArkHopperBadge[] = [
  // -------------------------------------------------------------------------
  // MILESTONE (4 badges) -- Journey progress from first step to final call
  // -------------------------------------------------------------------------
  {
    id: 'first-hop',
    name: 'First Hop',
    description: 'Complete your first level',
    emoji: '\u{1F423}',
    category: 'milestone',
    condition: 'levelsCompleted >= 1',
  },
  {
    id: 'ark-finder',
    name: 'Ark Finder',
    description: 'Complete 5 levels',
    emoji: '\u{1F6A2}',
    category: 'milestone',
    condition: 'levelsCompleted >= 5',
  },
  {
    id: 'faithful-traveler',
    name: 'Faithful Traveler',
    description: 'Complete 10 levels',
    emoji: '\u{1F64F}',
    category: 'milestone',
    condition: 'levelsCompleted >= 10',
  },
  {
    id: 'noahs-champion',
    name: "Noah's Champion",
    description: 'Complete all 20 levels',
    emoji: '\u{1F451}',
    category: 'milestone',
    condition: 'levelsCompleted >= 20',
  },

  // -------------------------------------------------------------------------
  // COLLECTION (4 badges) -- Gathering stars and unlocking characters
  // -------------------------------------------------------------------------
  {
    id: 'star-collector',
    name: 'Star Collector',
    description: 'Collect 10 total stars',
    emoji: '⭐',
    category: 'collection',
    condition: 'totalStars >= 10',
  },
  {
    id: 'star-gatherer',
    name: 'Star Gatherer',
    description: 'Collect 50 total stars',
    emoji: '\u{1F31F}',
    category: 'collection',
    condition: 'totalStars >= 50',
  },
  {
    id: 'starry-sky',
    name: 'Starry Sky',
    description: 'Collect 100 total stars',
    emoji: '✨',
    category: 'collection',
    condition: 'totalStars >= 100',
  },
  {
    id: 'full-menagerie',
    name: 'Full Menagerie',
    description: 'Unlock all 5 playable characters',
    emoji: '\u{1F981}',
    category: 'collection',
    condition: 'unlockedCharacters >= 5',
  },

  // -------------------------------------------------------------------------
  // SKILL (7 badges) -- Demonstrating mastery of the crossing
  // -------------------------------------------------------------------------
  {
    id: 'perfect-crossing',
    name: 'Perfect Crossing',
    description: 'Complete any level without losing a life',
    emoji: '\u{1F4AF}',
    category: 'skill',
    condition: 'perfectLevel == true',
  },
  {
    id: 'flawless-five',
    name: 'Flawless Five',
    description: 'Complete 5 levels in a row without losing a life',
    emoji: '\u{1F3C5}',
    category: 'skill',
    condition: 'perfectStreak >= 5',
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Complete 10 levels in a row without losing a life',
    emoji: '\u{1F6E1}️',
    category: 'skill',
    condition: 'perfectStreak >= 10',
  },
  {
    id: 'momentum-master',
    name: 'Momentum Master',
    description: 'Reach a momentum chain of 10 in a single level',
    emoji: '⚡',
    category: 'skill',
    condition: 'maxMomentum >= 10',
  },
  {
    id: 'speed-hopper',
    name: 'Speed Hopper',
    description: 'Complete any level in under 10 seconds',
    emoji: '\u{1F4A8}',
    category: 'skill',
    condition: 'fastestLevelSec < 10',
  },
  {
    id: 'log-rider',
    name: 'Log Rider',
    description: 'Ride a single log across the entire screen without hopping off',
    emoji: '\u{1FAB5}',
    category: 'skill',
    condition: 'fullLogRide == true',
  },
  {
    id: 'close-call',
    name: 'Close Call',
    description: 'Reach the ark with the flood meter above 90%',
    emoji: '\u{1F605}',
    category: 'skill',
    condition: 'floodMeterAtFinish > 90',
  },

  // -------------------------------------------------------------------------
  // SCORE (3 badges) -- Point milestones
  // -------------------------------------------------------------------------
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Score 1,000 points in a single level',
    emoji: '\u{1F48E}',
    category: 'score',
    condition: 'levelScore >= 1000',
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Score 5,000 total points across all levels',
    emoji: '\u{1F3C6}',
    category: 'score',
    condition: 'totalScore >= 5000',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Score 20,000 total points across all levels',
    emoji: '\u{1F31F}',
    category: 'score',
    condition: 'totalScore >= 20000',
  },

  // -------------------------------------------------------------------------
  // STREAK (2 badges) -- Daily play commitment
  // -------------------------------------------------------------------------
  {
    id: 'daily-faithful',
    name: 'Daily Faithful',
    description: 'Play 7 days in a row',
    emoji: '\u{1F4C5}',
    category: 'streak',
    condition: 'streak >= 7',
  },
  {
    id: 'devoted',
    name: 'Devoted',
    description: 'Play 30 days in a row',
    emoji: '\u{1F525}',
    category: 'streak',
    condition: 'streak >= 30',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a badge by its id. */
export function getBadgeById(id: string): ArkHopperBadge | undefined {
  return arkHopperBadges.find((b) => b.id === id);
}

/** Return badges filtered by category. */
export function getBadgesByCategory(
  category: ArkHopperBadge['category'],
): ArkHopperBadge[] {
  return arkHopperBadges.filter((b) => b.category === category);
}
