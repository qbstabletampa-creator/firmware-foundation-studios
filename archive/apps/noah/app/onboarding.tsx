import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import OnboardingScreen from '../src/shell/screens/OnboardingScreen';
import { useProfileStore } from '../src/shell/stores/profileStore';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

export default function OnboardingRoute() {
  const router = useRouter();
  const setProfile = useProfileStore((s) => s.setProfile);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  const handleComplete = useCallback(
    (profile: Profile) => {
      setProfile(profile);
      completeOnboarding();
      router.replace('/(tabs)/home');
    },
    [setProfile, completeOnboarding, router],
  );

  return <OnboardingScreen gameName="Noah Animal Match" onComplete={handleComplete} />;
}
