import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useProfileStore } from '../src/shell/stores/profileStore';

const SplashComponent =
  Platform.OS === 'web'
    ? require('../src/shell/screens/SplashScreen').default
    : require('../src/shell/screens/RadiantSplashScreen').default;

export default function SplashRoute() {
  const router = useRouter();
  const hasCompletedOnboarding = useProfileStore((s) => s.hasCompletedOnboarding);

  const handleComplete = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  return (
    <SplashComponent
      logoSource={require('../assets/logo.png')}
      studioName="Romans 8:28"
      onComplete={handleComplete}
    />
  );
}
