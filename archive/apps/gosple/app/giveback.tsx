import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import GivebackScreen from '../src/shell/screens/GivebackScreen';
import { gospleConfig } from '../src/shell/configs/gosple.config';

export default function GivebackRoute() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <GivebackScreen
      monthA={gospleConfig.giveback.monthA}
      monthB={gospleConfig.giveback.monthB}
      onBack={handleBack}
    />
  );
}
