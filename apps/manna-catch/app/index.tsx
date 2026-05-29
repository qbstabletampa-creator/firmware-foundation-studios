import { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useProfileStore } from '../src/shell/stores/profileStore';

const SplashComponent =
  Platform.OS === 'web'
    ? require('../src/shell/screens/SplashScreen').default
    : require('../src/shell/screens/RadiantSplashScreen').default;

export default function IndexScreen() {
  const [hydrated, setHydrated] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const hasCompletedOnboarding = useProfileStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useProfileStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated || !splashDone) {
    return (
      <View style={styles.container}>
        <SplashComponent
          logoSource={require('../assets/ffs-logo.png')}
          studioName="Romans 8:28"
          onComplete={() => setSplashDone(true)}
          duration={2500}
        />
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10100E',
  },
});
