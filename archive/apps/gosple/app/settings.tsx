import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import SettingsScreen from '../src/shell/screens/SettingsScreen';
import { usePreferencesStore } from '../src/shell/stores/preferencesStore';
import { useProfileStore } from '../src/shell/stores/profileStore';

export default function SettingsRoute() {
  const router = useRouter();

  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);
  const toggleHaptics = usePreferencesStore((s) => s.toggleHaptics);

  const name = useProfileStore((s) => s.name);

  const handleChangeProfile = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SettingsScreen
      soundEnabled={soundEnabled}
      hapticsEnabled={hapticsEnabled}
      currentProfile={name ?? 'Player'}
      onToggleSound={toggleSound}
      onToggleHaptics={toggleHaptics}
      onChangeProfile={handleChangeProfile}
      onBack={handleBack}
    />
  );
}
