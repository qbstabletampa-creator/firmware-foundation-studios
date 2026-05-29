import { useEffect, useRef } from 'react';
import { Animated, ImageSourcePropType, SafeAreaView, StyleSheet, View } from 'react-native';
import AnimatedLogo from '../components/AnimatedLogo';

type SplashScreenProps = {
  logoSource: ImageSourcePropType;
  studioName: string;
  onComplete: () => void;
  duration?: number;
};

export default function SplashScreen({
  logoSource,
  studioName,
  onComplete,
  duration = 2500,
}: SplashScreenProps) {
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const textTimer = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 800);

    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [textOpacity, onComplete, duration]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <AnimatedLogo logoSource={logoSource} size={160} />
        <Animated.Text style={[styles.studioName, { opacity: textOpacity }]}>
          {studioName}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#10100E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  studioName: {
    color: '#D4C36A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 20,
  },
});
