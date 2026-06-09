import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

/**
 * Elite, pure-RN animated game background. No native deps (Expo Go safe, hot
 * reloads). Renders a smooth banded sky gradient, a soft horizon sun glow,
 * slow-drifting light motes, and layered dune silhouettes.
 *
 * Themeable via `palette` so each FFS game can reuse it with its own vibe.
 * Keep it BEHIND gameplay: render as the first child of the game area.
 */

export type GamePalette = {
  /** Top -> horizon color stops, interpolated into a smooth gradient. */
  sky: string[];
  /** Horizon sun/glow tint (use an rgba with alpha). */
  glow: string;
  /** Dune silhouette color. */
  dune: string;
  /** Drifting mote color (rgba with alpha). */
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
 * Noah's Ark: lush after the rain. Deep night sky up top fading to a
 * rainbow-tinged horizon over green hills. Dark up top keeps card faces and
 * HUD text readable; the "dune" silhouette doubles as rolling green hills.
 */
export const NOAH_PALETTE: GamePalette = {
  sky: ['#06122B', '#0E2A4A', '#1E5A6E', '#3E8C8C', '#9ED27A', '#F4C26B'],
  glow: 'rgba(120, 220, 255, 0.40)',
  dune: '#163B1E',
  mote: 'rgba(210, 255, 230, 0.9)',
};

/**
 * Light Snake: a luminous night. A deep midnight-blue sky melts down into a
 * warm lantern-gold glow at the horizon, so the snake's light trail and the
 * food sprites read clearly. Warm and wholesome, never cold or harsh. The
 * "dune" silhouette is a dark hillside the light travels across.
 */
export const LIGHT_SNAKE_PALETTE: GamePalette = {
  sky: ['#05060F', '#0A0A1A', '#15173A', '#352A5A', '#8A5A3C', '#E8B86A'],
  glow: 'rgba(255, 212, 102, 0.45)',
  dune: '#12101E',
  mote: 'rgba(255, 238, 190, 0.95)',
};

const BANDS = 16;
const MOTE_COUNT = 6;

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

function Mote({ color, index }: { color: string; index: number }) {
  const rise = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Deterministic-ish per-index variation (no Math.random in render).
  const left = `${8 + ((index * 37) % 84)}%` as DimensionValue;
  const size = 3 + (index % 3) * 2;
  const duration = 7000 + (index % 4) * 1800;
  const delay = index * 900;
  const drift = index % 2 === 0 ? 14 : -14;

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
        Animated.timing(fade, { toValue: 1, duration: duration * 0.3, delay, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.2, duration: duration * 0.7, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    riseLoop.start();
    fadeLoop.start();
    return () => {
      riseLoop.stop();
      fadeLoop.stop();
    };
  }, [rise, fade, duration, delay]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [40, -560] });
  const translateX = rise.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 80,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: fade,
        transform: [{ translateY }, { translateX }],
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

export default function GameBackground({ palette = MANNA_PALETTE }: { palette?: GamePalette }) {
  const bands = useMemo(
    () => Array.from({ length: BANDS }, (_, i) => mixStops(palette.sky, i / (BANDS - 1))),
    [palette.sky],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Smooth banded sky */}
      {bands.map((c, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}

      {/* Horizon sun glow (stacked translucent discs near the catch zone) */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={[styles.glow, { width: 460, height: 460, backgroundColor: palette.glow, opacity: 0.35 }]} />
        <View style={[styles.glow, { width: 300, height: 300, backgroundColor: palette.glow, opacity: 0.5 }]} />
        <View style={[styles.glow, { width: 150, height: 150, backgroundColor: palette.glow, opacity: 0.7 }]} />
      </View>

      {/* Drifting light motes */}
      {Array.from({ length: MOTE_COUNT }, (_, i) => (
        <Mote key={i} color={palette.mote} index={i} />
      ))}

      {/* Layered dune silhouettes */}
      <View style={[styles.duneBack, { backgroundColor: palette.dune, opacity: 0.55 }]} />
      <View style={[styles.duneFront, { backgroundColor: palette.dune }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
    bottom: -180,
    borderRadius: 999,
  },
  duneBack: {
    position: 'absolute',
    bottom: 0,
    left: -60,
    right: -60,
    height: 150,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 200,
    transform: [{ scaleX: 1.4 }],
  },
  duneFront: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    right: -40,
    height: 96,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 240,
    transform: [{ scaleX: 1.3 }],
  },
});
