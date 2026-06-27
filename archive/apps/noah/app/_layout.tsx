import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/shell/theme';
import { SoundManager } from '../src/shell/sound/SoundManager';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import { usePreferencesStore } from '../src/shell/stores/preferencesStore';

export default function RootLayout() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);

  // Preload SFX once for the whole app, tear down on unmount.
  useEffect(() => {
    SoundManager.init();
    return () => {
      SoundManager.cleanup();
    };
  }, []);

  // Keep the managers in sync with the persisted toggles. Runs on cold start
  // (so a saved "off" preference is respected) and whenever a toggle flips.
  useEffect(() => {
    SoundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    HapticsManager.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="game"
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="giveback" />
      </Stack>
    </SafeAreaProvider>
  );
}
