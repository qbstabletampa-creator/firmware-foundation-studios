import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import GivebackScreen from '../src/shell/screens/GivebackScreen';

export default function GivebackRoute() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return <GivebackScreen onBack={handleBack} />;
}
