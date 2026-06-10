export type Profile = {
  id: string;
  name: string;
  type: 'Kid' | 'Teen' | 'Parent' | 'Family';
  createdAt: string;
};

export type ScreenName =
  | 'splash'
  | 'onboarding'
  | 'play'
  | 'stats'
  | 'more'
  | 'settings'
  | 'about'
  | 'privacy'
  | 'giveback';

export type RewardEventType =
  | 'game_complete'
  | 'score_milestone'
  | 'combo_milestone'
  | 'streak_milestone'
  | 'verse_discovered'
  | 'profile_created'
  | 'giveback_viewed';

export type RewardEvent = {
  type: RewardEventType;
  timestamp: string;
  metadata?: Record<string, string>;
};
