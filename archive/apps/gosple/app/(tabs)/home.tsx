import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import HomeScreen from '../../src/shell/screens/HomeScreen';
import { useStreakStore } from '../../src/shell/stores/streakStore';
import { getTodayDateString } from '../../src/game/dailyPuzzle';

export default function HomeTab() {
  const router = useRouter();
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const lastPlayedDate = useStreakStore((s) => s.lastPlayedDate);
  const hasPlayedToday = lastPlayedDate === getTodayDateString();

  const handlePlay = useCallback(() => {
    router.push('/game');
  }, [router]);

  // Settings opens directly — no parent gate. This is a kids-first app and the
  // settings screen is only sound/haptics toggles + profile change (no external
  // links, no purchases), so no parental gate is required.
  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <HomeScreen
      gameName="Gosple"
      tagline="A daily Bible word puzzle for the family."
      logoSource={require('../../assets/icon.png')}
      currentStreak={currentStreak}
      hasPlayedToday={hasPlayedToday}
      onPlay={handlePlay}
      onSettings={handleSettings}
    />
  );
}
