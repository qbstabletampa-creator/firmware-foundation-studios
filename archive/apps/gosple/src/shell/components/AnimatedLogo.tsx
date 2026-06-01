import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

type AnimatedLogoProps = {
  logoSource: ImageSourcePropType;
  size?: number;
  onAnimationComplete?: () => void;
};

export default function AnimatedLogo({
  logoSource,
  size = 160,
  onAnimationComplete,
}: AnimatedLogoProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const outerGlowOpacity = useRef(new Animated.Value(0)).current;
  const innerGlowOpacity = useRef(new Animated.Value(0)).current;
  const outerGlowScale = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const glowTimer = setTimeout(() => {
      const outerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(outerGlowOpacity, {
            toValue: 0.22,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(outerGlowOpacity, {
            toValue: 0.1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      const innerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(innerGlowOpacity, {
            toValue: 0.32,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerGlowOpacity, {
            toValue: 0.14,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      const scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(outerGlowScale, {
            toValue: 1.06,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(outerGlowScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      const combined = Animated.parallel([outerLoop, innerLoop, scaleLoop]);
      loopRef.current = combined;
      combined.start();
    }, 400);

    const completeTimer = onAnimationComplete
      ? setTimeout(onAnimationComplete, 2000)
      : undefined;

    return () => {
      clearTimeout(glowTimer);
      if (completeTimer) clearTimeout(completeTimer);
      loopRef.current?.stop();
      outerGlowOpacity.stopAnimation();
      innerGlowOpacity.stopAnimation();
      outerGlowScale.stopAnimation();
    };
  }, [logoOpacity, logoScale, outerGlowOpacity, innerGlowOpacity, outerGlowScale, onAnimationComplete]);

  const outerSize = size * 1.6;
  const innerSize = size * 1.2;

  return (
    <View style={[styles.container, { width: outerSize, height: outerSize }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            opacity: outerGlowOpacity,
            transform: [{ scale: outerGlowScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glow,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            opacity: innerGlowOpacity,
          },
        ]}
      />
      <Animated.Image
        source={logoSource}
        style={[
          {
            width: size,
            height: size,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#D4C36A',
  },
});
