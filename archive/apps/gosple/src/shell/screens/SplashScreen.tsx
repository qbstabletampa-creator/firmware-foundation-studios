// FFS LOCKED SPLASH, canonical, do not redesign. Install/repair via the /ffs-splash
// skill; locked by ~/.claude/rules/ffs-splash-lock.md. GL ray-shader splash, company
// logo + "Romans 8:28". NEVER the Skia RadiantSplashScreen (it black-screens Release
// builds). Chief enforces this in the weekly audit.
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, ImageSourcePropType, StyleSheet } from 'react-native';
import RayCanvas from '../components/RayCanvas';

/**
 * Exact native port of the DEPLOYED iOS Gosple splash
 * (archive/apps/gosple RadiantSplash + RadiantSplashScreen + shaders/lightRays.ts).
 * Full-screen ray shader centered at 0.42, 160px logo at 0.42 with a 0.85->1->1.15
 * scale, white italic "Romans 8:28" at bottom 30%. Shared by every FFS game.
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LOGO = 160;

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
  const [raysActive, setRaysActive] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(10)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rayTimer = setTimeout(() => setRaysActive(true), 300);

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(logoScale, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1.15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    const fadeTimer = setTimeout(() => {
      Animated.timing(screenOpacity, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
    }, duration - 300);
    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(rayTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [logoOpacity, logoScale, textOpacity, textY, screenOpacity, onComplete, duration]);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      {/* Full-screen ray shader, center 0.42 (deployed) */}
      {raysActive && <RayCanvas style={StyleSheet.absoluteFill} />}

      {/* Logo centered at 0.42 of the screen */}
      <Animated.Image
        source={logoSource}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            top: SCREEN_H * 0.42 - LOGO / 2,
            left: (SCREEN_W - LOGO) / 2,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />

      {/* Verse at bottom 30%, white italic, mixed case */}
      <Animated.Text
        style={[styles.studioName, { opacity: textOpacity, transform: [{ translateY: textY }] }]}
      >
        {studioName}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#10100E' },
  logo: {
    position: 'absolute',
    width: LOGO,
    height: LOGO,
  },
  studioName: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
});
