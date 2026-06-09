import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import OnboardingScreen from '../src/shell/screens/OnboardingScreen';
import { useProfileStore } from '../src/shell/stores/profileStore';

export default function OnboardingRoute() {
  const router = useRouter();
  const setName = useProfileStore((s) => s.setName);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  const handleComplete = useCallback(
    (name: string) => {
      setName(name);
      completeOnboarding();
      router.replace('/(tabs)/home');
    },
    [setName, completeOnboarding, router],
  );

  return <OnboardingScreen gameName="Noah Animal Match" onComplete={handleComplete} />;
}
