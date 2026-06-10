import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';
import type { TileScore } from '../../game/wordleEngine';

// ---------------------------------------------------------------------------
// dailyBoardStore — persists the IN-PROGRESS and completed board for the
// current day so the player can't lose progress (app killed mid-game) and
// can't replay today's puzzle for unlimited retries.
//
// This is a NEW, standalone persisted store (key '@ffs/dailyBoard'). It does
// NOT touch streakStore or preferencesStore, so a shipped user mid-streak keeps
// all their stats — we only ADD board persistence.
//
// The board is keyed by day number. On a new day, getOrReset() clears the old
// board so yesterday's solved state never bleeds into today.
// ---------------------------------------------------------------------------

export type SavedRow = { guess: string; scores: TileScore[] };

interface DailyBoardState {
  day: number | null;
  rows: SavedRow[];
  currentGuess: string;
  solved: boolean;
  completed: boolean; // solved OR out of guesses — board is locked for the day
  // Load the board for `day`. If the stored board is for a different (older)
  // day, reset to an empty board for `day` and return that empty state.
  loadForDay: (day: number) => { rows: SavedRow[]; completed: boolean; solved: boolean };
  // Save the latest board state for `day`.
  save: (
    day: number,
    rows: SavedRow[],
    currentGuess: string,
    solved: boolean,
    completed: boolean,
  ) => void;
  reset: () => void;
}

const EMPTY = { rows: [] as SavedRow[], completed: false, solved: false };

export const useDailyBoardStore = create<DailyBoardState>()(
  persist(
    (set, get) => ({
      day: null,
      rows: [],
      currentGuess: '',
      solved: false,
      completed: false,

      loadForDay: (day) => {
        const s = get();
        if (s.day === day) {
          return { rows: s.rows, completed: s.completed, solved: s.solved };
        }
        // Different day (or first run) — start fresh and persist the reset so
        // yesterday's board doesn't linger.
        set({ day, rows: [], currentGuess: '', solved: false, completed: false });
        return EMPTY;
      },

      save: (day, rows, currentGuess, solved, completed) =>
        set({ day, rows, currentGuess, solved, completed }),

      reset: () =>
        set({ day: null, rows: [], currentGuess: '', solved: false, completed: false }),
    }),
    {
      name: '@ffs/dailyBoard',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
