import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import RadiantSplash from '../components/RadiantSplash';

type RadiantSplashScreenProps = {
  logoSource: number;
  studioName: string;
  onComplete: () => void;
  duration?: number;
  primaryColor?: string;
  rayCount?: number;
  backgroundColor?: string;
};

export default function RadiantSplashScreen({
  logoSource,
  studioName,
  onComplete,
  duration = 2500,
  primaryColor = '#D4C36A',
  rayCount = 14,
  backgroundColor = '#10100E',
}: RadiantSplashScreenProps) {
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Studio name fades in: 800-1200ms
    const textTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Fade out everything: duration - 300ms
    const fadeTimer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, duration - 300);

    // Complete
    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [textOpacity, textTranslateY, fadeOut, onComplete, duration]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut, backgroundColor }]}>
      {Platform.OS !== 'web' ? (
        <RadiantSplash
          logoSource={logoSource}
          primaryColor={primaryColor}
          rayCount={rayCount}
          backgroundColor={backgroundColor}
        />
      ) : (
        <View style={styles.webFallback} />
      )}

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Animated.Text style={[styles.studioName, { color: '#FFFFFF' }]}>
          {studioName}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
  },
  textContainer: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  studioName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
