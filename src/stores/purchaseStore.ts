import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PurchaseState {
  gosple: boolean;
  mannaCatch: boolean;
  noahAnimalMatch: boolean;
  arkHopper: boolean;
  lightSnake: boolean;
  bibleBrickBreaker: boolean;
  gospleFreeCount: number;
  mannaCatchLastFreeDate: string;
  noahAnimalMatchFreeCount: number;
  arkHopperLastFreeDate: string;
  lightSnakeLastFreeDate: string;
  bibleBrickBreakerLastFreeDate: string;
  purchaseGame: (game: 'gosple' | 'mannaCatch' | 'noahAnimalMatch' | 'arkHopper' | 'lightSnake' | 'bibleBrickBreaker') => void;
  incrementGospleFree: () => void;
  recordMannaCatchFree: () => void;
  incrementNoahAnimalMatchFree: () => void;
  recordArkHopperFree: () => void;
  recordLightSnakeFree: () => void;
  recordBibleBrickBreakerFree: () => void;
  canPlayGospleFree: () => boolean;
  canPlayMannaCatchFree: () => boolean;
  canPlayNoahAnimalMatchFree: () => boolean;
  canPlayArkHopperFree: () => boolean;
  canPlayLightSnakeFree: () => boolean;
  canPlayBibleBrickBreakerFree: () => boolean;
}

const FREE_GOSPLE_LIMIT = 3;
const FREE_NOAH_LIMIT = 3;

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get): PurchaseState => ({
      gosple: false,
      mannaCatch: false,
      noahAnimalMatch: false,
      arkHopper: false,
      lightSnake: false,
      bibleBrickBreaker: false,
      gospleFreeCount: 0,
      mannaCatchLastFreeDate: '',
      noahAnimalMatchFreeCount: 0,
      arkHopperLastFreeDate: '',
      lightSnakeLastFreeDate: '',
      bibleBrickBreakerLastFreeDate: '',
      purchaseGame: (game) => set({ [game]: true }),
      incrementGospleFree: () =>
        set((s) => ({ gospleFreeCount: s.gospleFreeCount + 1 })),
      recordMannaCatchFree: () =>
        set({ mannaCatchLastFreeDate: new Date().toISOString().slice(0, 10) }),
      incrementNoahAnimalMatchFree: () =>
        set((s) => ({ noahAnimalMatchFreeCount: s.noahAnimalMatchFreeCount + 1 })),
      recordArkHopperFree: () =>
        set({ arkHopperLastFreeDate: new Date().toISOString().slice(0, 10) }),
      recordLightSnakeFree: () =>
        set({ lightSnakeLastFreeDate: new Date().toISOString().slice(0, 10) }),
      recordBibleBrickBreakerFree: () =>
        set({ bibleBrickBreakerLastFreeDate: new Date().toISOString().slice(0, 10) }),
      canPlayGospleFree: () => {
        const s = get();
        return s.gosple || s.gospleFreeCount < FREE_GOSPLE_LIMIT;
      },
      canPlayMannaCatchFree: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.mannaCatch || s.mannaCatchLastFreeDate !== today;
      },
      canPlayNoahAnimalMatchFree: () => {
        const s = get();
        return s.noahAnimalMatch || s.noahAnimalMatchFreeCount < FREE_NOAH_LIMIT;
      },
      canPlayArkHopperFree: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.arkHopper || s.arkHopperLastFreeDate !== today;
      },
      canPlayLightSnakeFree: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.lightSnake || s.lightSnakeLastFreeDate !== today;
      },
      canPlayBibleBrickBreakerFree: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.bibleBrickBreaker || s.bibleBrickBreakerLastFreeDate !== today;
      },
    }),
    { name: 'ffs-purchases' },
  ),
);
