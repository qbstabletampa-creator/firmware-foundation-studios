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
  | 'giveback'
  | 'purchase';

export type RewardEventType =
  | 'puzzle_complete'
  | 'streak_milestone'
  | 'verse_shared'
  | 'profile_created'
  | 'giveback_viewed';

export type RewardEvent = {
  type: RewardEventType;
  timestamp: string;
  metadata?: Record<string, string>;
};
