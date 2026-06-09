import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useProfileStore } from '../src/shell/stores/profileStore';
import { FORCE_ONBOARDING } from '../src/shell/devConfig';

// Skia (RadiantSplash) is not bundled in Expo Go. Use the plain splash on web
// and in Expo Go; keep the Skia splash for real dev/EAS builds.
const usesPlainSplash =
  Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient';

const SplashComponent = usesPlainSplash
  ? require('../src/shell/screens/SplashScreen').default
  : require('../src/shell/screens/RadiantSplashScreen').default;

export default function SplashRoute() {
  const router = useRouter();
  const hasCompletedOnboarding = useProfileStore((s) => s.hasCompletedOnboarding);

  const handleComplete = useCallback(() => {
    if (hasCompletedOnboarding && !FORCE_ONBOARDING) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  return (
    <SplashComponent
      logoSource={require('../assets/ffs-logo.png')}
      studioName="Romans 8:28"
      onComplete={handleComplete}
    />
  );
}
