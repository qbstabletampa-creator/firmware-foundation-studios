export type BadgeId = string;

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
};

export type RewardEvent =
  | { type: 'score_reached'; score: number }
  | { type: 'combo_reached'; combo: number }
  | { type: 'streak_reached'; streak: number }
  | { type: 'games_played'; count: number }
  | { type: 'verses_seen'; count: number }
  | { type: 'no_damage_daily' };
