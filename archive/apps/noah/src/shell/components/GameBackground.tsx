import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

/**
 * Elite, pure-RN animated game background. No native deps (Expo Go safe, hot
 * reloads). Each FFS game gets its own distinct scene via `palette`.
 *
 * NOAH = DEEP-BLUE OCEAN NIGHT: a midnight-blue sky melting into deep sea teal
 * at the horizon, layered wave-band silhouettes rolling along the bottom, soft
 * star motes drifting up, and (on later levels) a faint rainbow arc as a nod to
 * the covenant. Dark up top keeps card faces and HUD text readable.
 *
 * Keep it BEHIND gameplay: render as the first child of the game area.
 */

export type GamePalette = {
  /** Top -> horizon color stops, interpolated into a smooth gradient. */
  sky: string[];
  /** Horizon sun/glow tint (use an rgba with alpha). */
  glow: string;
  /** Wave / silhouette color. */
  dune: string;
  /** Drifting mote (star) color (rgba with alpha). */
  mote: string;
};

/** Manna in the wilderness: dawn desert. Dark up top for emoji contrast. */
export const MANNA_PALETTE: GamePalette = {
  sky: ['#0A0E24', '#1E1740', '#43274F', '#8A4F54', '#E9A45A', '#F6C977'],
  glow: 'rgba(255, 213, 128, 0.45)',
  dune: '#241A12',
  mote: 'rgba(255, 244, 214, 0.9)',
};

/**
 * Noah's Ark: deep-blue ocean night. Midnight blue overhead easing into deep
 * sea teal at the waterline. The "dune" color is the dark wave silhouette.
 */
export const NOAH_PALETTE: GamePalette = {
  sky: ['#040A1C', '#071633', '#0B2547', '#103A5C', '#16566E', '#1E7A82'],
  glow: 'rgba(80, 200, 230, 0.32)',
  dune: '#06223A',
  mote: 'rgba(220, 244, 255, 0.95)',
};

const BANDS = 16;
const STAR_COUNT = 7;
/** Levels at or above this show the faint rainbow covenant arc. */
const RAINBOW_FROM_LEVEL = 3;

// A soft, low-opacity rainbow read from the inside out (top band first).
const RAINBOW_BANDS = [
  'rgba(255, 90, 90, 0.16)',
  'rgba(255, 170, 70, 0.15)',
  'rgba(255, 230, 90, 0.15)',
  'rgba(110, 220, 130, 0.15)',
  'rgba(90, 170, 255, 0.15)',
  'rgba(170, 120, 235, 0.14)',
];

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mixStops(stops: string[], t: number): string {
  const n = stops.length - 1;
  const scaled = Math.min(n, Math.max(0, t * n));
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[Math.min(n, i + 1)]);
  const r = Math.round(a.r + (b.r - a.r) * f);
  const g = Math.round(a.g + (b.g - a.g) * f);
  const bl = Math.round(a.b + (b.b - a.b) * f);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** A drifting star mote: rises slowly and twinkles. */
function Star({ color, index }: { color: string; index: number }) {
  const rise = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Deterministic-ish per-index variation (no Math.random in render).
  const left = `${6 + ((index * 41) % 88)}%` as DimensionValue;
  const size = 2 + (index % 3) * 2;
  const duration = 8000 + (index % 4) * 1600;
  const delay = index * 760;
  const drift = index % 2 === 0 ? 10 : -10;

  useEffect(() => {
    const riseLoop = Animated.loop(
      Animated.timing(rise, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: duration * 0.35, delay, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.25, duration: duration * 0.65, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    riseLoop.start();
    fadeLoop.start();
    return () => {
      riseLoop.stop();
      fadeLoop.stop();
    };
  }, [rise, fade, duration, delay]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [30, -540] });
  const translateX = rise.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 120,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: fade,
        transform: [{ translateY }, { translateX }],
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

export default function GameBackground({
  palette = MANNA_PALETTE,
  level = 1,
}: {
  palette?: GamePalette;
  level?: number;
}) {
  const bands = useMemo(
    () => Array.from({ length: BANDS }, (_, i) => mixStops(palette.sky, i / (BANDS - 1))),
    [palette.sky],
  );

  const showRainbow = level >= RAINBOW_FROM_LEVEL;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Smooth banded night sky */}
      {bands.map((c, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}

      {/* Faint rainbow covenant arc (later levels only). Concentric soft rings
          clipped by the wave band so only the arc above the water shows. */}
      {showRainbow && (
        <View style={styles.rainbowWrap} pointerEvents="none">
          {RAINBOW_BANDS.map((c, i) => {
            const ring = 760 - i * 36;
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: ring,
                  height: ring,
                  borderRadius: ring / 2,
                  borderWidth: 18,
                  borderColor: c,
                  bottom: -ring / 2,
                }}
              />
            );
          })}
        </View>
      )}

      {/* Moonlit horizon glow on the water */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={[styles.glow, { width: 440, height: 440, backgroundColor: palette.glow, opacity: 0.3 }]} />
        <View style={[styles.glow, { width: 280, height: 280, backgroundColor: palette.glow, opacity: 0.45 }]} />
        <View style={[styles.glow, { width: 140, height: 140, backgroundColor: palette.glow, opacity: 0.65 }]} />
      </View>

      {/* Drifting star motes */}
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <Star key={i} color={palette.mote} index={i} />
      ))}

      {/* Layered wave-band silhouettes rolling along the bottom */}
      <View style={[styles.waveBack, { backgroundColor: palette.dune, opacity: 0.45 }]} />
      <View style={[styles.waveMid, { backgroundColor: palette.dune, opacity: 0.7 }]} />
      <View style={[styles.waveFront, { backgroundColor: palette.dune }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  rainbowWrap: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    height: 420,
  },
  glowWrap: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    bottom: -160,
    borderRadius: 999,
  },
  // Three overlapping rounded crests give a layered ocean-surface silhouette.
  waveBack: {
    position: 'absolute',
    bottom: 0,
    left: -80,
    right: -80,
    height: 150,
    borderTopLeftRadius: 320,
    borderTopRightRadius: 240,
    transform: [{ scaleX: 1.5 }],
  },
  waveMid: {
    position: 'absolute',
    bottom: 0,
    left: -50,
    right: -50,
    height: 110,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 300,
    transform: [{ scaleX: 1.35 }],
  },
  waveFront: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    right: -40,
    height: 74,
    borderTopLeftRadius: 260,
    borderTopRightRadius: 180,
    transform: [{ scaleX: 1.3 }],
  },
});
