import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  sound: boolean;
  volume: number;
  haptics: boolean;
  notifications: boolean;
  toggleSound: () => void;
  setVolume: (v: number) => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sound: true,
      volume: 1.0,
      haptics: true,
      notifications: true,
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
    }),
    { name: 'ffs-preferences' },
  ),
);
