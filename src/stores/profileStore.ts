import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProfileType = 'kid' | 'parent';

interface ProfileState {
  profileType: ProfileType | null;
  username: string;
  onboarded: boolean;
  setProfile: (type: ProfileType, username: string) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileType: null,
      username: '',
      onboarded: false,
      setProfile: (type, username) =>
        set({ profileType: type, username, onboarded: true }),
      reset: () =>
        set({ profileType: null, username: '', onboarded: false }),
    }),
    { name: 'ffs-profile' },
  ),
);
