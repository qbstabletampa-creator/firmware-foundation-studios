import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProfileType = 'kid' | 'parent';

interface ProfileState {
  profileType: ProfileType | null;
  username: string;
  onboarded: boolean;
  gamesOnboarded: string[];
  setProfile: (type: ProfileType, username: string) => void;
  markGameOnboarded: (gameId: string) => void;
  isGameOnboarded: (gameId: string) => boolean;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profileType: null,
      username: '',
      onboarded: false,
      gamesOnboarded: [],
      setProfile: (type, username) =>
        set({ profileType: type, username, onboarded: true }),
      markGameOnboarded: (gameId) => {
        const current = get().gamesOnboarded;
        if (!current.includes(gameId)) {
          set({ gamesOnboarded: [...current, gameId] });
        }
      },
      isGameOnboarded: (gameId) => get().gamesOnboarded.includes(gameId),
      reset: () =>
        set({ profileType: null, username: '', onboarded: false, gamesOnboarded: [] }),
    }),
    { name: 'ffs-profile' },
  ),
);
