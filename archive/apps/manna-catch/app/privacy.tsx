import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import PrivacyScreen from '../src/shell/screens/PrivacyScreen';

export default function PrivacyRoute() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return <PrivacyScreen onBack={handleBack} />;
}
