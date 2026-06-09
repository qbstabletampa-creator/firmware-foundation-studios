import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

/**
 * Pure-RN gold sunburst + bloom, a no-Skia stand-in for RadiantSplash so the
 * plain splash (Expo Go / web, where Skia is unavailable) shows the same radiant
 * light as the shipped Skia build. Matches RadiantSplash: 14 gold rays, soft
 * bloom, center at 42% height, slow rotation + gentle pulse.
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CX = SCREEN_W / 2;
const CY = SCREEN_H * 0.4;

type Props = {
  color?: string;
  rayCount?: number;
};

export default function RadiantBurst({ color = '#D4C36A', rayCount = 14 }: Props) {
  const rayIn = useRef(new Animated.Value(0)).current; // ray fade-in
  const spin = useRef(new Animated.Value(0)).current; // slow rotation
  const pulse = useRef(new Animated.Value(0)).current; // bloom pulse

  useEffect(() => {
    Animated.timing(rayIn, {
      toValue: 1,
      duration: 800,
      delay: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [rayIn, spin, pulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rayOpacity = rayIn.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] });
  const bloomScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const bloomOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.6] });

  const RAY_LEN = SCREEN_H * 0.6;
  const RAY_W = 4;
  const step = 360 / rayCount;

  // Bloom discs: large soft -> small bright.
  // Strong warm-gold bloom with a warm-white core, mirroring the web shader
  // (glow + bloom dominate; gold mixes to warm white at center).
  const blooms = [
    { r: SCREEN_W * 0.55, o: 0.14, c: color },
    { r: SCREEN_W * 0.34, o: 0.22, c: color },
    { r: SCREEN_W * 0.2, o: 0.34, c: color },
    { r: SCREEN_W * 0.1, o: 0.5, c: 'rgba(255, 247, 230, 0.95)' },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Bloom haze */}
      <Animated.View
        style={[
          styles.hub,
          { opacity: bloomOpacity, transform: [{ scale: bloomScale }] },
        ]}
      >
        {blooms.map((b, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: -b.r,
              top: -b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: b.r,
              backgroundColor: b.c,
              opacity: b.o,
            }}
          />
        ))}
      </Animated.View>

      {/* Rotating rays */}
      <Animated.View style={[styles.hub, { transform: [{ rotate }] }]}>
        {Array.from({ length: rayCount }, (_, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: RAY_W,
              height: RAY_LEN,
              left: -RAY_W / 2,
              top: -RAY_LEN,
              borderRadius: RAY_W / 2,
              backgroundColor: color,
              opacity: rayOpacity,
              transform: [
                { translateY: RAY_LEN / 2 },
                { rotate: `${i * step}deg` },
                { translateY: -RAY_LEN / 2 },
              ],
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hub: { position: 'absolute', left: CX, top: CY, width: 0, height: 0 },
});
