import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/shell/theme';
import { SoundManager } from '../src/shell/sound/SoundManager';
import { HapticsManager } from '../src/shell/sound/HapticsManager';
import { usePreferencesStore } from '../src/shell/stores/preferencesStore';

// expo-router picks up this named export and shows it (instead of a white
// screen) if any route throws during render. retry() re-mounts the route.
export { default as ErrorBoundary } from '../src/shell/components/AppErrorBoundary';

export default function RootLayout() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);

  // Init the SFX bank once, tear it down on unmount.
  useEffect(() => {
    SoundManager.init();
    return () => {
      SoundManager.cleanup();
    };
  }, []);

  // Drive enabled-state from the persisted store so a saved "off" is respected
  // on cold start and the Settings toggle just flips the store.
  useEffect(() => {
    SoundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    HapticsManager.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  return (
    <>
      <StatusBar style="dark" />
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
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="giveback" />
        <Stack.Screen name="purchase" />
      </Stack>
    </>
  );
}
