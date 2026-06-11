import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from '../../shell/stores/asyncStorageAdapter';

interface NoahGameState {
  highScore: number;
  bestCombo: number;
  totalMatches: number;
  totalGamesPlayed: number;
  highestLevel: number;
  animalsCollected: string[];
  dailyScores: Record<string, number>;
  seenVerseIds: string[];
  hasSeenHowToPlay: boolean;

  recordScore: (score: number) => void;
  recordCombo: (combo: number) => void;
  recordMatches: (count: number) => void;
  recordGamePlayed: () => void;
  recordLevel: (level: number) => void;
  addAnimals: (names: string[]) => void;
  recordDailyScore: (dateStr: string, score: number) => void;
  addSeenVerseIds: (ids: string[]) => void;
  hasDailyScore: (dateStr: string) => boolean;
  markHowToPlaySeen: () => void;
  reset: () => void;
}

export const useNoahGameStore = create<NoahGameState>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCombo: 0,
      totalMatches: 0,
      totalGamesPlayed: 0,
      highestLevel: 1,
      animalsCollected: [],
      dailyScores: {},
      seenVerseIds: [],
      hasSeenHowToPlay: false,

      recordScore: (score) =>
        set((s) => ({ highScore: Math.max(s.highScore, score) })),

      recordCombo: (combo) =>
        set((s) => ({ bestCombo: Math.max(s.bestCombo, combo) })),

      recordMatches: (count) =>
        set((s) => ({ totalMatches: s.totalMatches + count })),

      recordGamePlayed: () =>
        set((s) => ({ totalGamesPlayed: s.totalGamesPlayed + 1 })),

      recordLevel: (level) =>
        set((s) => ({ highestLevel: Math.max(s.highestLevel, level) })),

      addAnimals: (names) =>
        set((s) => {
          const existing = new Set(s.animalsCollected);
          const next = names.filter((n) => !existing.has(n));
          if (next.length === 0) return s;
          return { animalsCollected: [...s.animalsCollected, ...next] };
        }),

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

      markHowToPlaySeen: () => set({ hasSeenHowToPlay: true }),

      reset: () =>
        set({
          highScore: 0,
          bestCombo: 0,
          totalMatches: 0,
          totalGamesPlayed: 0,
          highestLevel: 1,
          animalsCollected: [],
          dailyScores: {},
          seenVerseIds: [],
          hasSeenHowToPlay: false,
        }),
    }),
    {
      name: '@ffs/noah-game',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({
        highScore: s.highScore,
        bestCombo: s.bestCombo,
        totalMatches: s.totalMatches,
        totalGamesPlayed: s.totalGamesPlayed,
        highestLevel: s.highestLevel,
        animalsCollected: s.animalsCollected,
        dailyScores: s.dailyScores,
        seenVerseIds: s.seenVerseIds,
        hasSeenHowToPlay: s.hasSeenHowToPlay,
      }),
    },
  ),
);
