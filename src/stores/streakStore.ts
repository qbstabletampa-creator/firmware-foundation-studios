import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  totalGamesPlayed: number;
  totalGamesWon: number;
  recordPlay: (won: boolean) => void;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      recordPlay: (won) => {
        const state = get();
        const today = getTodayString();
        if (state.lastPlayedDate === today) return;

        const yesterday = getYesterdayString();
        const streakContinues = state.lastPlayedDate === yesterday;

        const newStreak = won
          ? streakContinues ? state.currentStreak + 1 : 1
          : 0;

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastPlayedDate: today,
          totalGamesPlayed: state.totalGamesPlayed + 1,
          totalGamesWon: state.totalGamesWon + (won ? 1 : 0),
        });
      },
    }),
    { name: 'ffs-streak' },
  ),
);
