import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Fill,
  Image as SkiaImage,
  RadialGradient,
  Shader,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getLightRaysShader } from '../shaders/lightRays';

type RadiantSplashProps = {
  logoSource: number;
  size?: number;
  primaryColor?: string;
  rayCount?: number;
  backgroundColor?: string;
  onReady?: () => void;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function hexToRgbNormalized(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function RadiantSplash({
  logoSource,
  size = 160,
  primaryColor = '#D4C36A',
  rayCount = 14,
  backgroundColor = '#10100E',
  onReady,
}: RadiantSplashProps) {
  const logoImage = useImage(logoSource);
  const [cr, cg, cb] = hexToRgbNormalized(primaryColor);

  const centerX = SCREEN_W / 2;
  const centerY = SCREEN_H * 0.42;

  const time = useSharedValue(0);
  const glowRadius = useSharedValue(0);
  const rayIntensity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const bloomRadius = useSharedValue(0);

  useEffect(() => {
    // Glow fades in: 100-500ms
    glowRadius.value = withDelay(
      100,
      withTiming(0.5, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    // Logo entrance: 200-700ms, then slow grow through the rest
    logoOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    logoScale.value = withDelay(
      200,
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
    );

    // Rays break outward: 400-1200ms
    rayIntensity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
    );

    // Bloom haze: 500-1100ms
    bloomRadius.value = withDelay(
      500,
      withTiming(SCREEN_W * 0.4, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // Continuous time for ray rotation
    time.value = withDelay(
      400,
      withRepeat(
        withTiming(100, { duration: 60000, easing: Easing.linear }),
        -1,
        false,
      ),
    );

    // Subtle glow pulse after initial reveal: 1200ms+
    const pulseDelay = 1200;
    glowRadius.value = withDelay(
      pulseDelay,
      withSequence(
        withTiming(0.5, { duration: 0 }),
        withRepeat(
          withSequence(
            withTiming(0.55, {
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.45, {
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      ),
    );

    if (onReady) {
      const timer = setTimeout(onReady, 300);
      return () => clearTimeout(timer);
    }
  }, [
    time,
    glowRadius,
    rayIntensity,
    logoOpacity,
    logoScale,
    bloomRadius,
    onReady,
  ]);

  const shaderUniforms = useDerivedValue(() => ({
    uResolution: [SCREEN_W, SCREEN_H],
    uCenter: [0.5, 0.42],
    uTime: time.value,
    uRayIntensity: rayIntensity.value,
    uGlowRadius: glowRadius.value,
    uRayCount: rayCount,
    uColor: [cr, cg, cb],
  }));

  const logoTransform = useDerivedValue(() => [
    { scale: logoScale.value },
  ]);

  const logoX = centerX - size / 2;
  const logoY = centerY - size / 2;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor }]}>
      {/* Dark background */}
      <Fill color={backgroundColor} />

      {/* Light rays via shader */}
      <Fill>
        <Shader source={getLightRaysShader()} uniforms={shaderUniforms} />
      </Fill>

      {/* Bloom haze: soft golden circle with blur */}
      <Circle cx={centerX} cy={centerY} r={bloomRadius}>
        <RadialGradient
          c={vec(centerX, centerY)}
          r={SCREEN_W * 0.4}
          colors={[`${primaryColor}40`, `${primaryColor}00`]}
        />
        <BlurMask blur={40} style="normal" />
      </Circle>

      {/* Logo */}
      {logoImage && (
        <SkiaImage
          image={logoImage}
          x={logoX}
          y={logoY}
          width={size}
          height={size}
          opacity={logoOpacity}
          transform={logoTransform}
          origin={vec(centerX, centerY)}
        />
      )}
    </Canvas>
  );
}
