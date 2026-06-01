import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

interface ProfileState {
  currentProfile: Profile | null;
  hasCompletedOnboarding: boolean;
  setProfile: (profile: Profile) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      currentProfile: null,
      hasCompletedOnboarding: false,
      setProfile: (profile) => set({ currentProfile: profile }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ currentProfile: null, hasCompletedOnboarding: false }),
    }),
    {
      name: '@ffs/profile',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
