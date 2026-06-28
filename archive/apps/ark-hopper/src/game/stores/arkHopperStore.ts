import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from '../../shell/stores/asyncStorageAdapter';

// ---------------------------------------------------------------------------
// Ark Hopper game store (native).
//
// Ported from src/stores/arkHopperStore.ts. The web version persisted to
// localStorage; native persists through AsyncStorage. The persist `name`
// ('ffs-ark-hopper') and the full state shape + actions are kept identical so
// the data model matches the web build.
//
// CRITICAL: Ark Hopper owns this store. It must never reuse Manna's or Noah's
// game store -- it tracks its own high score, streak, badges, and progress.
// ---------------------------------------------------------------------------

interface ArkHopperState {
  highScore: number;
  bestCombo: number;
  totalGamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  unlockedBadgeIds: string[];
  furthestLevel: number;
  totalHops: number;
  totalStarsCollected: number;
  animalsUnlocked: string[];

  recordGame: (stats: {
    score: number;
    combo: number;
    level: number;
    hops: number;
    starsCollected: number;
  }) => void;
  unlockBadge: (badgeId: string) => void;
  reset: () => void;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useArkHopperStore = create<ArkHopperState>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCombo: 0,
      totalGamesPlayed: 0,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      unlockedBadgeIds: [],
      furthestLevel: 0,
      totalHops: 0,
      totalStarsCollected: 0,
      animalsUnlocked: [],

      recordGame: ({ score, combo, level, hops, starsCollected }) => {
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
          totalScore: state.totalScore + score,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastPlayedDate: today,
          furthestLevel: Math.max(state.furthestLevel, level),
          totalHops: state.totalHops + hops,
          totalStarsCollected: state.totalStarsCollected + starsCollected,
        });
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.unlockedBadgeIds.includes(badgeId)) return;
        set({ unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId] });
      },

      reset: () =>
        set({
          highScore: 0,
          bestCombo: 0,
          totalGamesPlayed: 0,
          totalScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastPlayedDate: '',
          unlockedBadgeIds: [],
          furthestLevel: 0,
          totalHops: 0,
          totalStarsCollected: 0,
          animalsUnlocked: [],
        }),
    }),
    {
      name: 'ffs-ark-hopper',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
