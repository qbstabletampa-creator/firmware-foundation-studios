import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorageAdapter';

interface PreferencesState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: true,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
    }),
    {
      name: '@ffs/v2/preferences',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
