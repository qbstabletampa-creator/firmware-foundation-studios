import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MannaCatchState {
  highScore: number;
  bestCombo: number;
  totalGamesPlayed: number;
  totalItemsCaught: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  seenVerseIds: number[];
  unlockedBadgeIds: string[];
  powerUpsUsed: { wide: boolean; slow: boolean; magnet: boolean };
  hasSeenTutorial: boolean;
  bestLevel: number;

  recordGame: (score: number, combo: number, itemsCaught: number, versesSeen: number[], level: number) => void;
  setTutorialSeen: () => void;
  unlockBadge: (badgeId: string) => void;
  recordPowerUp: (type: 'wide' | 'slow' | 'magnet') => void;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useMannaCatchStore = create<MannaCatchState>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCombo: 0,
      totalGamesPlayed: 0,
      totalItemsCaught: 0,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      seenVerseIds: [],
      unlockedBadgeIds: [],
      powerUpsUsed: { wide: false, slow: false, magnet: false },
      hasSeenTutorial: false,
      bestLevel: 0,

      setTutorialSeen: () => set({ hasSeenTutorial: true }),

      recordGame: (score, combo, itemsCaught, versesSeen, level) => {
        const state = get();
        const today = getTodayString();
        const yesterday = getYesterdayString();

        // Streak logic: if already played today, keep streak unchanged
        let newStreak = state.currentStreak;
        if (state.lastPlayedDate !== today) {
          const streakContinues = state.lastPlayedDate === yesterday;
          newStreak = streakContinues ? state.currentStreak + 1 : 1;
        }

        // Deduplicate verse IDs
        const mergedVerses = Array.from(
          new Set([...state.seenVerseIds, ...versesSeen]),
        );

        set({
          highScore: Math.max(state.highScore, score),
          bestCombo: Math.max(state.bestCombo, combo),
          bestLevel: Math.max(state.bestLevel, level),
          totalGamesPlayed: state.totalGamesPlayed + 1,
          totalItemsCaught: state.totalItemsCaught + itemsCaught,
          totalScore: state.totalScore + score,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastPlayedDate: today,
          seenVerseIds: mergedVerses,
        });
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.unlockedBadgeIds.includes(badgeId)) return;
        set({ unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId] });
      },

      recordPowerUp: (type) => {
        const state = get();
        set({
          powerUpsUsed: { ...state.powerUpsUsed, [type]: true },
        });
      },
    }),
    { name: 'ffs-manna-catch' },
  ),
);
