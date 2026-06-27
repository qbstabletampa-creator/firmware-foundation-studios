import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

interface PurchaseState {
  isPurchased: boolean;
  purchaseDate: string | null;
  setPurchased: (date: string) => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      isPurchased: false,
      purchaseDate: null,
      setPurchased: (date) => set({ isPurchased: true, purchaseDate: date }),
    }),
    {
      name: '@ffs/v2/purchase',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
