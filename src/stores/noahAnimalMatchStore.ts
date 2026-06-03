import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NoahAnimalMatchState {
  highScore: number;
  bestCombo: number;
  totalGamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  unlockedBadgeIds: string[];
  bestTime: number;
  totalMatches: number;
  levelsCompleted: number;
  perfectLevels: number;
  bestLevel: number;

  recordGame: (stats: {
    score: number;
    combo: number;
    matches: number;
    time: number;
    level: number;
    perfect: boolean;
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

const initialState = {
  highScore: 0,
  bestCombo: 0,
  totalGamesPlayed: 0,
  totalScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: '',
  unlockedBadgeIds: [] as string[],
  bestTime: 0,
  totalMatches: 0,
  levelsCompleted: 0,
  perfectLevels: 0,
  bestLevel: 0,
};

export const useNoahAnimalMatchStore = create<NoahAnimalMatchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordGame: ({ score, combo, matches, time, level, perfect }) => {
        const state = get();
        const today = getTodayString();
        const yesterday = getYesterdayString();

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
          totalMatches: state.totalMatches + matches,
          bestTime:
            time > 0 && (state.bestTime === 0 || time < state.bestTime)
              ? time
              : state.bestTime,
          levelsCompleted: level > 0 ? state.levelsCompleted + 1 : state.levelsCompleted,
          perfectLevels: perfect ? state.perfectLevels + 1 : state.perfectLevels,
          bestLevel: Math.max(state.bestLevel, level),
        });
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.unlockedBadgeIds.includes(badgeId)) return;
        set({ unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId] });
      },

      reset: () => set(initialState),
    }),
    { name: 'ffs-noah-animal-match' },
  ),
);
