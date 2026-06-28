import type { Badge } from './types';

export const defaultBadges: Badge[] = [
  // Score milestones
  {
    id: 'first_catch',
    name: 'First Match',
    description: 'Made your first match',
    icon: '🐾',
    unlockedAt: null,
  },
  {
    id: 'half_century',
    name: 'Gatherer',
    description: 'Scored 500 points',
    icon: '🐑',
    unlockedAt: null,
  },
  {
    id: 'century',
    name: 'Ark Keeper',
    description: 'Scored 1,500 points',
    icon: '🛶',
    unlockedAt: null,
  },
  {
    id: 'high_roller',
    name: 'Pair Master',
    description: 'Scored 4,000 points',
    icon: '⭐',
    unlockedAt: null,
  },
  {
    id: 'manna_master',
    name: 'Faithful Noah',
    description: 'Scored 8,000 points',
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
    name: 'Perfect Clear',
    description: 'Cleared a level with no mistakes',
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
