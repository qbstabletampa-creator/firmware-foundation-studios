import { defaultBadges } from './badgeDefinitions';
import type { Badge, RewardEvent } from './types';

function shouldUnlock(badge: Badge, event: RewardEvent): boolean {
  switch (badge.id) {
    case 'first_catch':
      return event.type === 'score_reached' && event.score >= 100;
    case 'half_century':
      return event.type === 'score_reached' && event.score >= 500;
    case 'century':
      return event.type === 'score_reached' && event.score >= 1500;
    case 'high_roller':
      return event.type === 'score_reached' && event.score >= 4000;
    case 'manna_master':
      return event.type === 'score_reached' && event.score >= 8000;
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
    case 'combo_king':
      return event.type === 'combo_reached' && event.combo >= 5;
    case 'unstoppable':
      return event.type === 'combo_reached' && event.combo >= 10;
    case 'untouchable':
      return event.type === 'no_damage_daily';
    case 'verse_collector':
      return event.type === 'verses_seen' && event.count >= 5;
    case 'bible_scholar':
      return event.type === 'verses_seen' && event.count >= 200;
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
