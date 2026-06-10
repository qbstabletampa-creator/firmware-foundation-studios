import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

// Totals returned by recordPlay so callers (badge events) read consistent
// values without a fragile getState()-after-set() read.
export interface PlayResult {
  currentStreak: number;
  longestStreak: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  totalGamesPlayed: number;
  totalGamesWon: number;
  recordPlay: (won: boolean, date: string) => PlayResult;
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
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: null,
      totalGamesPlayed: 0,
      totalGamesWon: 0,

      recordPlay: (won, date) => {
        const s = get();

        // Already recorded today — no double counting. Return current totals so
        // the caller still gets a valid, consistent result.
        if (s.lastPlayedDate === date) {
          return {
            currentStreak: s.currentStreak,
            longestStreak: s.longestStreak,
            totalGamesPlayed: s.totalGamesPlayed,
            totalGamesWon: s.totalGamesWon,
          };
        }

        const newStreak =
          s.lastPlayedDate === getYesterday(date) ? s.currentStreak + 1 : 1;
        const newLongest = Math.max(s.longestStreak, newStreak);
        const totalGamesPlayed = s.totalGamesPlayed + 1;
        const totalGamesWon = won ? s.totalGamesWon + 1 : s.totalGamesWon;

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastPlayedDate: date,
          totalGamesPlayed,
          totalGamesWon,
        });

        return {
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalGamesPlayed,
          totalGamesWon,
        };
      },

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
