import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  sound: boolean;
  haptics: boolean;
  notifications: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sound: true,
      haptics: true,
      notifications: true,
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
    }),
    { name: 'ffs-preferences' },
  ),
);
