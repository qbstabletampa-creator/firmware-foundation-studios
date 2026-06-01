export type BadgeId = string;

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
};

export type RewardEvent =
  | { type: 'game_won' }
  | { type: 'game_won_in'; guesses: number }
  | { type: 'streak_reached'; streak: number }
  | { type: 'games_played'; count: number }
  | { type: 'games_won'; count: number };
