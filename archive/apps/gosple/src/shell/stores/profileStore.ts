import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

interface ProfileState {
  currentProfile: Profile | null;
  /** Player's chosen display name (optional, set during onboarding). */
  name: string | null;
  hasCompletedOnboarding: boolean;
  setProfile: (profile: Profile) => void;
  setName: (name: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      currentProfile: null,
      name: null,
      hasCompletedOnboarding: false,
      setProfile: (profile) => set({ currentProfile: profile }),
      setName: (name) => set({ name }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ currentProfile: null, name: null, hasCompletedOnboarding: false }),
    }),
    {
      name: '@ffs/v2/profile',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
