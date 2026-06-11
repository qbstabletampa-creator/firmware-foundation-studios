import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from '../../shell/stores/asyncStorageAdapter';

interface CatchGameState {
  highScore: number;
  bestCombo: number;
  totalItemsCaught: number;
  totalGamesPlayed: number;
  dailyScores: Record<string, number>;
  seenVerseIds: string[];
  /** True once the player has dismissed the first-run How to Play modal. */
  hasSeenHowTo: boolean;

  recordScore: (score: number) => void;
  recordCombo: (combo: number) => void;
  recordItemsCaught: (count: number) => void;
  recordGamePlayed: () => void;
  recordDailyScore: (dateStr: string, score: number) => void;
  addSeenVerseIds: (ids: string[]) => void;
  hasDailyScore: (dateStr: string) => boolean;
  markHowToSeen: () => void;
  reset: () => void;
}

export const useCatchGameStore = create<CatchGameState>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCombo: 0,
      totalItemsCaught: 0,
      totalGamesPlayed: 0,
      dailyScores: {},
      seenVerseIds: [],
      hasSeenHowTo: false,

      recordScore: (score) =>
        set((s) => ({ highScore: Math.max(s.highScore, score) })),

      recordCombo: (combo) =>
        set((s) => ({ bestCombo: Math.max(s.bestCombo, combo) })),

      recordItemsCaught: (count) =>
        set((s) => ({ totalItemsCaught: s.totalItemsCaught + count })),

      recordGamePlayed: () =>
        set((s) => ({ totalGamesPlayed: s.totalGamesPlayed + 1 })),

      recordDailyScore: (dateStr, score) =>
        set((s) => ({ dailyScores: { ...s.dailyScores, [dateStr]: score } })),

      addSeenVerseIds: (ids) =>
        set((s) => {
          const existing = new Set(s.seenVerseIds);
          const newIds = ids.filter((id) => !existing.has(id));
          if (newIds.length === 0) return s;
          return { seenVerseIds: [...s.seenVerseIds, ...newIds] };
        }),

      hasDailyScore: (dateStr) => dateStr in get().dailyScores,

      markHowToSeen: () => set({ hasSeenHowTo: true }),

      reset: () =>
        set({
          highScore: 0,
          bestCombo: 0,
          totalItemsCaught: 0,
          totalGamesPlayed: 0,
          dailyScores: {},
          seenVerseIds: [],
          hasSeenHowTo: false,
        }),
    }),
    {
      name: '@ffs/catch-game',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({
        highScore: s.highScore,
        bestCombo: s.bestCombo,
        totalItemsCaught: s.totalItemsCaught,
        totalGamesPlayed: s.totalGamesPlayed,
        dailyScores: s.dailyScores,
        seenVerseIds: s.seenVerseIds,
        hasSeenHowTo: s.hasSeenHowTo,
      }),
    },
  ),
);
