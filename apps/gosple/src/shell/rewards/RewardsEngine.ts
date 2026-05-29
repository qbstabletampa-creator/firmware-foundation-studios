import { defaultBadges } from './badgeDefinitions';
import type { Badge, RewardEvent } from './types';

function shouldUnlock(badge: Badge, event: RewardEvent): boolean {
  switch (badge.id) {
    case 'first_win':
      return event.type === 'game_won';
    case 'ten_wins':
      return event.type === 'games_won' && event.count >= 10;
    case 'fifty_wins':
      return event.type === 'games_won' && event.count >= 50;
    case 'three_streak':
      return event.type === 'streak_reached' && event.streak >= 3;
    case 'week_warrior':
      return event.type === 'streak_reached' && event.streak >= 7;
    case 'two_week':
      return event.type === 'streak_reached' && event.streak >= 14;
    case 'faithful':
      return event.type === 'streak_reached' && event.streak >= 30;
    case 'devoted':
      return event.type === 'streak_reached' && event.streak >= 60;
    case 'unshakable':
      return event.type === 'streak_reached' && event.streak >= 100;
    case 'first_guess':
      return event.type === 'game_won_in' && event.guesses === 1;
    case 'two_guesses':
      return event.type === 'game_won_in' && event.guesses <= 2;
    case 'three_guesses':
      return event.type === 'game_won_in' && event.guesses <= 3;
    case 'dedicated':
      return event.type === 'games_played' && event.count >= 100;
    case 'committed':
      return event.type === 'games_played' && event.count >= 250;
    default:
      return false;
  }
}

export function checkRewards(event: RewardEvent, currentBadges: Badge[]): Badge[] {
  const badges = currentBadges.length > 0 ? currentBadges : defaultBadges.map((b) => ({ ...b }));
  const now = new Date().toISOString();

  return badges.map((badge) => {
    if (badge.unlockedAt !== null) return badge;
    if (shouldUnlock(badge, event)) {
      return { ...badge, unlockedAt: now };
    }
    return badge;
  });
}
