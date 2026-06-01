import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import AboutScreen from '../src/shell/screens/AboutScreen';

export default function AboutRoute() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return <AboutScreen gameName="Manna Catch" version="1.0.0" onBack={handleBack} />;
}
