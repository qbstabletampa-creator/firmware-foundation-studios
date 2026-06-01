import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PurchaseState {
  gosple: boolean;
  mannaCatch: boolean;
  gospleFreeCount: number;
  mannaCatchLastFreeDate: string;
  purchaseGame: (game: 'gosple' | 'mannaCatch') => void;
  incrementGospleFree: () => void;
  recordMannaCatchFree: () => void;
  canPlayGospleFree: () => boolean;
  canPlayMannaCatchFree: () => boolean;
}

const FREE_GOSPLE_LIMIT = 3;

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      gosple: false,
      mannaCatch: false,
      gospleFreeCount: 0,
      mannaCatchLastFreeDate: '',
      purchaseGame: (game) => set({ [game]: true }),
      incrementGospleFree: () =>
        set((s) => ({ gospleFreeCount: s.gospleFreeCount + 1 })),
      recordMannaCatchFree: () =>
        set({ mannaCatchLastFreeDate: new Date().toISOString().slice(0, 10) }),
      canPlayGospleFree: () => {
        const s = get();
        return s.gosple || s.gospleFreeCount < FREE_GOSPLE_LIMIT;
      },
      canPlayMannaCatchFree: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.mannaCatch || s.mannaCatchLastFreeDate !== today;
      },
    }),
    { name: 'ffs-purchases' },
  ),
);
