import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ParentGate } from '../../src/shell/components/ParentGate';
import HomeScreen from '../../src/shell/screens/HomeScreen';
import { useStreakStore } from '../../src/shell/stores/streakStore';
import { getTodayDateString } from '../../src/game/dailyPuzzle';

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
        gameName="Gosple"
        tagline="A daily Bible word puzzle for the family."
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
