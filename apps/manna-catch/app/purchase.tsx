import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import PurchaseScreen from '../src/shell/screens/PurchaseScreen';
import { usePurchaseStore } from '../src/shell/stores/purchaseStore';

export default function PurchaseRoute() {
  const router = useRouter();
  const setPurchased = usePurchaseStore((s) => s.setPurchased);

  const handlePurchase = useCallback(() => {
    setPurchased(new Date().toISOString());
    router.replace('/(tabs)/home');
  }, [setPurchased, router]);

  const handleRestore = useCallback(() => {
    setPurchased(new Date().toISOString());
    router.replace('/(tabs)/home');
  }, [setPurchased, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <PurchaseScreen
      gameName="Manna Catch"
      description="Unlock the full Manna Catch experience."
      onPurchase={handlePurchase}
      onRestore={handleRestore}
      onBack={handleBack}
    />
  );
}
