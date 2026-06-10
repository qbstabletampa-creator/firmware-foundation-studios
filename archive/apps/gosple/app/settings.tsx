import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import SettingsScreen from '../src/shell/screens/SettingsScreen';
import { ParentGate } from '../src/shell/components/ParentGate';
import { usePreferencesStore } from '../src/shell/stores/preferencesStore';
import { useProfileStore } from '../src/shell/stores/profileStore';
import { useParentGateStore } from '../src/shell/stores/parentGateStore';

export default function SettingsRoute() {
  const router = useRouter();

  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);
  const toggleHaptics = usePreferencesStore((s) => s.toggleHaptics);

  const name = useProfileStore((s) => s.name);

  const isUnlocked = useParentGateStore((s) => s.isUnlocked);
  const checkExpiry = useParentGateStore((s) => s.checkExpiry);
  const unlock = useParentGateStore((s) => s.unlock);

  const [gateVisible, setGateVisible] = useState(false);

  useEffect(() => {
    checkExpiry();
    if (!isUnlocked) {
      setGateVisible(true);
    }
  }, [checkExpiry, isUnlocked]);

  const handleGateSuccess = useCallback(() => {
    setGateVisible(false);
    unlock();
  }, [unlock]);

  const handleGateCancel = useCallback(() => {
    setGateVisible(false);
    router.back();
  }, [router]);

  const handleChangeProfile = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <SettingsScreen
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        currentProfile={name ?? 'Player'}
        onToggleSound={toggleSound}
        onToggleHaptics={toggleHaptics}
        onChangeProfile={handleChangeProfile}
        onBack={handleBack}
      />
      <ParentGate
        visible={gateVisible}
        onSuccess={handleGateSuccess}
        onCancel={handleGateCancel}
      />
    </>
  );
}
