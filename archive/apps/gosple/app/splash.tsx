import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useProfileStore } from '../src/shell/stores/profileStore';
import { FORCE_ONBOARDING } from '../src/shell/devConfig';

// The GL splash is the ONLY splash (see app/index.tsx). The Skia branch
// black-screened the 2026-06-10 install builds; expo-router evaluates every
// route module at launch in production, so this file must not require it.
const SplashComponent = require('../src/shell/screens/SplashScreen').default;

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
      logoSource={require('../assets/logo.png')}
      studioName="Romans 8:28"
      onComplete={handleComplete}
    />
  );
}
