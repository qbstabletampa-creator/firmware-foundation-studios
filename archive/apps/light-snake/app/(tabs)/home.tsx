import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ParentGate } from '../../src/shell/components/ParentGate';
import HomeScreen from '../../src/shell/screens/HomeScreen';
import { useStreakStore } from '../../src/shell/stores/streakStore';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function HomeTab() {
  const router = useRouter();
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const lastPlayedDate = useStreakStore((s) => s.lastPlayedDate);
  const hasPlayedToday = lastPlayedDate === getTodayDateString();

  const [gateVisible, setGateVisible] = useState(false);

  const handlePlay = useCallback(() => {
    router.push('/game');
  }, [router]);

  const handleSettings = useCallback(() => {
    setGateVisible(true);
  }, []);

  const handleGateSuccess = useCallback(() => {
    setGateVisible(false);
    router.push('/settings');
  }, [router]);

  const handleGateCancel = useCallback(() => {
    setGateVisible(false);
  }, []);

  return (
    <>
      <HomeScreen
        gameName="Shepherd's Trail"
        tagline="Gather the flock. Avoid the thorns."
        logoSource={require('../../assets/logo.png')}
        currentStreak={currentStreak}
        hasPlayedToday={hasPlayedToday}
        onPlay={handlePlay}
        onSettings={handleSettings}
      />
      <ParentGate
        visible={gateVisible}
        onSuccess={handleGateSuccess}
        onCancel={handleGateCancel}
      />
    </>
  );
}
