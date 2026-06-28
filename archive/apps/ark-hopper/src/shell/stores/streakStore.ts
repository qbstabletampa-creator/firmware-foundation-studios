import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  totalGamesPlayed: number;
  totalGamesWon: number;
  recordPlay: (won: boolean, date: string) => void;
  reset: () => void;
}

function getYesterday(date: string): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: null,
      totalGamesPlayed: 0,
      totalGamesWon: 0,

      recordPlay: (won, date) =>
        set((s) => {
          if (s.lastPlayedDate === date) {
            return {};
          }

          let newStreak: number;
          if (s.lastPlayedDate === getYesterday(date)) {
            newStreak = s.currentStreak + 1;
          } else {
            newStreak = 1;
          }

          const newLongest = Math.max(s.longestStreak, newStreak);

          return {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastPlayedDate: date,
            totalGamesPlayed: s.totalGamesPlayed + 1,
            totalGamesWon: won ? s.totalGamesWon + 1 : s.totalGamesWon,
          };
        }),

      reset: () =>
        set({
          currentStreak: 0,
          longestStreak: 0,
          lastPlayedDate: null,
          totalGamesPlayed: 0,
          totalGamesWon: 0,
        }),
    }),
    {
      name: '@ffs/streak',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
