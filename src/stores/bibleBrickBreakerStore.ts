import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BibleBrickBreakerState {
  highScore: number;
  bestCombo: number;
  totalGamesPlayed: number;
  totalBricksBroken: number;
  highestLevel: number;
  totalWordsRevealed: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  unlockedBadgeIds: string[];

  recordGame: (score: number, combo: number, bricksBroken: number, level: number, wordsRevealed: number) => void;
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
  totalBricksBroken: 0,
  highestLevel: 0,
  totalWordsRevealed: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: '',
  unlockedBadgeIds: [] as string[],
};

export const useBibleBrickBreakerStore = create<BibleBrickBreakerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordGame: (score, combo, bricksBroken, level, wordsRevealed) => {
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
          totalBricksBroken: state.totalBricksBroken + bricksBroken,
          highestLevel: Math.max(state.highestLevel, level),
          totalWordsRevealed: state.totalWordsRevealed + wordsRevealed,
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
    { name: 'ffs-bible-brick-breaker' },
  ),
);
