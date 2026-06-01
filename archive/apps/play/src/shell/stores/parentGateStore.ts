import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

const GATE_EXPIRY_MS = 300_000;

interface ParentGateState {
  isUnlocked: boolean;
  lastUnlockedAt: number | null;
  unlock: () => void;
  lock: () => void;
  checkExpiry: () => void;
}

export const useParentGateStore = create<ParentGateState>()(
  persist(
    (set, get) => ({
      isUnlocked: false,
      lastUnlockedAt: null,

      unlock: () => set({ isUnlocked: true, lastUnlockedAt: Date.now() }),

      lock: () => set({ isUnlocked: false, lastUnlockedAt: null }),

      checkExpiry: () => {
        const { isUnlocked, lastUnlockedAt } = get();
        if (
          isUnlocked &&
          lastUnlockedAt !== null &&
          Date.now() - lastUnlockedAt > GATE_EXPIRY_MS
        ) {
          set({ isUnlocked: false });
        }
      },
    }),
    {
      name: '@ffs/parentgate',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
