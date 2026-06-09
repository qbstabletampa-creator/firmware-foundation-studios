import type { Badge } from './types';

// Badge IDs are kept STABLE across every FFS game so saved progress and the
// generic RewardsEngine stay compatible. Only the name / description / icon and
// the unlock thresholds are themed per game. Light Snake's score economy is
// small (10-20 pts per item), so score thresholds are rescaled accordingly.
export const defaultBadges: Badge[] = [
  // Score milestones
  {
    id: 'first_catch',
    name: 'First Light',
    description: 'Scored your first points',
    icon: '🕯️',
    unlockedAt: null,
  },
  {
    id: 'half_century',
    name: 'Shining Path',
    description: 'Scored 150 points',
    icon: '✨',
    unlockedAt: null,
  },
  {
    id: 'century',
    name: 'Radiant',
    description: 'Scored 300 points',
    icon: '☀️',
    unlockedAt: null,
  },
  {
    id: 'high_roller',
    name: 'Beacon',
    description: 'Scored 600 points',
    icon: '🏔️',
    unlockedAt: null,
  },
  {
    id: 'manna_master',
    name: 'City on a Hill',
    description: 'Scored 1,000 points',
    icon: '👑',
    unlockedAt: null,
  },

  // Streak badges
  {
    id: 'three_streak',
    name: 'On Fire',
    description: '3 day streak',
    icon: '🔥',
    unlockedAt: null,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '⚔️',
    unlockedAt: null,
  },
  {
    id: 'two_week',
    name: 'Steadfast',
    description: '14 day streak',
    icon: '🛡️',
    unlockedAt: null,
  },
  {
    id: 'faithful',
    name: 'Faithful',
    description: '30 day streak',
    icon: '✞',
    unlockedAt: null,
  },
  {
    id: 'devoted',
    name: 'Devoted',
    description: '60 day streak',
    icon: '🕊️',
    unlockedAt: null,
  },
  {
    id: 'unshakable',
    name: 'Unshakable',
    description: '100 day streak',
    icon: '💎',
    unlockedAt: null,
  },

  // Skill badges
  {
    id: 'combo_king',
    name: 'Light Speed',
    description: '5x combo',
    icon: '⚡',
    unlockedAt: null,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '10x combo',
    icon: '🌟',
    unlockedAt: null,
  },
  {
    id: 'untouchable',
    name: 'Thorn Dodger',
    description: 'Finished a daily run unscathed',
    icon: '🌵',
    unlockedAt: null,
  },

  // Collection badges
  {
    id: 'verse_collector',
    name: 'Verse Collector',
    description: 'Discovered 5 verses',
    icon: '📜',
    unlockedAt: null,
  },
  {
    id: 'bible_scholar',
    name: 'Lamp Bearer',
    description: 'Discovered all verses',
    icon: '🪔',
    unlockedAt: null,
  },

  // Play milestones
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Played 100 games',
    icon: '💪',
    unlockedAt: null,
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Played 250 games',
    icon: '🏆',
    unlockedAt: null,
  },
];
