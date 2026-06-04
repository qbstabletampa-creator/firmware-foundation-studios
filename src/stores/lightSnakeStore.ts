import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LightSnakeState {
  highScore: number;
  bestCombo: number;
  totalGamesPlayed: number;
  totalItemsEaten: number;
  longestSnake: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  unlockedBadgeIds: string[];

  recordGame: (score: number, combo: number, length: number, itemsEaten: number) => void;
  unlockBadge: (badgeId: string) => void;
  resetStats: () => void;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const initialState = {
  highScore: 0,
  bestCombo: 0,
  totalGamesPlayed: 0,
  totalItemsEaten: 0,
  longestSnake: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: '',
  unlockedBadgeIds: [] as string[],
};

export const useLightSnakeStore = create<LightSnakeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordGame: (score, combo, length, itemsEaten) => {
        const state = get();
        const today = getTodayString();
        const yesterday = getYesterdayString();

        // Streak logic: if already played today, keep streak unchanged
        let newStreak = state.currentStreak;
        if (state.lastPlayedDate !== today) {
          const streakContinues = state.lastPlayedDate === yesterday;
          newStreak = streakContinues ? state.currentStreak + 1 : 1;
        }

        set({
          highScore: Math.max(state.highScore, score),
          bestCombo: Math.max(state.bestCombo, combo),
          totalGamesPlayed: state.totalGamesPlayed + 1,
          totalItemsEaten: state.totalItemsEaten + itemsEaten,
          longestSnake: Math.max(state.longestSnake, length),
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastPlayedDate: today,
        });
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.unlockedBadgeIds.includes(badgeId)) return;
        set({ unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId] });
      },

      resetStats: () => {
        set(initialState);
      },
    }),
    { name: 'ffs-light-snake' },
  ),
);
