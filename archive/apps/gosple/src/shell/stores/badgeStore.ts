import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';
import { defaultBadges } from '../rewards/badgeDefinitions';
import { checkRewards } from '../rewards/RewardsEngine';
import type { Badge, RewardEvent } from '../rewards/types';

interface BadgeState {
  badges: Badge[];
  newlyUnlocked: Badge[];
  processEvent: (event: RewardEvent) => void;
  clearNewlyUnlocked: () => void;
  reset: () => void;
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: defaultBadges.map((b) => ({ ...b })),
      newlyUnlocked: [],
      processEvent: (event) => {
        const prev = get().badges;
        const next = checkRewards(event, prev);
        const fresh = next.filter(
          (b) => b.unlockedAt !== null && prev.find((p) => p.id === b.id)?.unlockedAt === null,
        );
        set({
          badges: next,
          newlyUnlocked: [...get().newlyUnlocked, ...fresh],
        });
      },
      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),
      reset: () =>
        set({ badges: defaultBadges.map((b) => ({ ...b })), newlyUnlocked: [] }),
    }),
    {
      name: '@ffs/v2/badges',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({ badges: state.badges }),
      merge: (persisted, current) => {
        const p = persisted as Partial<BadgeState> | undefined;
        const saved = p?.badges ?? [];
        const merged = defaultBadges.map((def) => {
          const existing = saved.find((b) => b.id === def.id);
          return existing ?? { ...def };
        });
        return { ...current, badges: merged };
      },
    },
  ),
);
