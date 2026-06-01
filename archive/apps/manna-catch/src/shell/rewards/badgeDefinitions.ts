import type { Badge } from './types';

export const defaultBadges: Badge[] = [
  // Score milestones
  {
    id: 'first_catch',
    name: 'First Catch',
    description: 'Scored your first points',
    icon: '🍞',
    unlockedAt: null,
  },
  {
    id: 'half_century',
    name: 'Half Century',
    description: 'Scored 50 points',
    icon: '🍯',
    unlockedAt: null,
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Scored 100 points',
    icon: '🍇',
    unlockedAt: null,
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Scored 250 points',
    icon: '⭐',
    unlockedAt: null,
  },
  {
    id: 'manna_master',
    name: 'Manna Master',
    description: 'Scored 500 points',
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
    name: 'Fortified',
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
    name: 'Combo King',
    description: '5x combo',
    icon: '⚡',
    unlockedAt: null,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '10x combo',
    icon: '🔥',
    unlockedAt: null,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Daily with no damage',
    icon: '🛡️',
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
    name: 'Bible Scholar',
    description: 'Discovered all verses',
    icon: '📖',
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
