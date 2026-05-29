import type { Badge } from './types';

export const defaultBadges: Badge[] = [
  // Win milestones
  {
    id: 'first_win',
    name: 'First Win',
    description: 'Won your first game',
    icon: '⭐',
    unlockedAt: null,
  },
  {
    id: 'ten_wins',
    name: 'Double Digits',
    description: 'Won 10 games',
    icon: '🏅',
    unlockedAt: null,
  },
  {
    id: 'fifty_wins',
    name: 'Scholar',
    description: 'Won 50 games',
    icon: '📖',
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
    icon: '👑',
    unlockedAt: null,
  },

  // Skill badges
  {
    id: 'first_guess',
    name: 'Revelation',
    description: 'Solved in 1 guess',
    icon: '💡',
    unlockedAt: null,
  },
  {
    id: 'two_guesses',
    name: 'Sharp Mind',
    description: 'Solved in 2 guesses',
    icon: '🧠',
    unlockedAt: null,
  },
  {
    id: 'three_guesses',
    name: 'Quick Study',
    description: 'Solved in 3 guesses',
    icon: '⚡',
    unlockedAt: null,
  },

  // Play milestones
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Played 100 games',
    icon: '💎',
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
