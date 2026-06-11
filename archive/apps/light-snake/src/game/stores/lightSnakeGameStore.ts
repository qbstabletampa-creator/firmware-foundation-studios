import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from '../../shell/stores/asyncStorageAdapter';

interface LightSnakeGameState {
  highScore: number;
  bestCombo: number;
  bestLength: number;
  highestSpeedLevel: number;
  totalItemsEaten: number;
  totalGamesPlayed: number;
  breadEaten: number;
  fishEaten: number;
  lampsEaten: number;
  thornsPassed: number;
  dailyScores: Record<string, number>;
  seenVerseIds: string[];
  /** First-run flag: whether the How to Play modal has been shown + dismissed. */
  hasSeenHowToPlay: boolean;

  recordScore: (score: number) => void;
  recordCombo: (combo: number) => void;
  recordLength: (length: number) => void;
  recordSpeedLevel: (level: number) => void;
  addItems: (counts: { bread: number; fish: number; lamp: number }) => void;
  addThornsPassed: (count: number) => void;
  recordGamePlayed: () => void;
  recordDailyScore: (dateStr: string, score: number) => void;
  addSeenVerseIds: (ids: string[]) => void;
  hasDailyScore: (dateStr: string) => boolean;
  markHowToPlaySeen: () => void;
  reset: () => void;
}

export const useLightSnakeGameStore = create<LightSnakeGameState>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCombo: 0,
      bestLength: 0,
      highestSpeedLevel: 1,
      totalItemsEaten: 0,
      totalGamesPlayed: 0,
      breadEaten: 0,
      fishEaten: 0,
      lampsEaten: 0,
      thornsPassed: 0,
      dailyScores: {},
      seenVerseIds: [],
      hasSeenHowToPlay: false,

      recordScore: (score) =>
        set((s) => ({ highScore: Math.max(s.highScore, score) })),

      recordCombo: (combo) =>
        set((s) => ({ bestCombo: Math.max(s.bestCombo, combo) })),

      recordLength: (length) =>
        set((s) => ({ bestLength: Math.max(s.bestLength, length) })),

      recordSpeedLevel: (level) =>
        set((s) => ({ highestSpeedLevel: Math.max(s.highestSpeedLevel, level) })),

      addItems: (counts) =>
        set((s) => ({
          breadEaten: s.breadEaten + counts.bread,
          fishEaten: s.fishEaten + counts.fish,
          lampsEaten: s.lampsEaten + counts.lamp,
          totalItemsEaten:
            s.totalItemsEaten + counts.bread + counts.fish + counts.lamp,
        })),

      addThornsPassed: (count) =>
        set((s) => ({ thornsPassed: s.thornsPassed + count })),

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

      markHowToPlaySeen: () => set({ hasSeenHowToPlay: true }),

      reset: () =>
        set({
          highScore: 0,
          bestCombo: 0,
          bestLength: 0,
          highestSpeedLevel: 1,
          totalItemsEaten: 0,
          totalGamesPlayed: 0,
          breadEaten: 0,
          fishEaten: 0,
          lampsEaten: 0,
          thornsPassed: 0,
          dailyScores: {},
          seenVerseIds: [],
          hasSeenHowToPlay: false,
        }),
    }),
    {
      name: '@ffs/light-snake-game',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({
        highScore: s.highScore,
        bestCombo: s.bestCombo,
        bestLength: s.bestLength,
        highestSpeedLevel: s.highestSpeedLevel,
        totalItemsEaten: s.totalItemsEaten,
        totalGamesPlayed: s.totalGamesPlayed,
        breadEaten: s.breadEaten,
        fishEaten: s.fishEaten,
        lampsEaten: s.lampsEaten,
        thornsPassed: s.thornsPassed,
        dailyScores: s.dailyScores,
        seenVerseIds: s.seenVerseIds,
        hasSeenHowToPlay: s.hasSeenHowToPlay,
      }),
    },
  ),
);
