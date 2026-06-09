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
 * One scene per level. The game cycles through these as the player advances
 * (level = verses passed). Tops stay deep so falling items keep contrast.
 * A journey through the day: dawn -> day -> sunset -> night -> promised land -> glory.
 */
export const LEVEL_PALETTES: GamePalette[] = [
  MANNA_PALETTE, // L1 dawn desert
  { // L2 wilderness day
    sky: ['#0B2A4A', '#15446E', '#2E6FA1', '#7FB5D6', '#D9C9A3', '#EDE0BE'],
    glow: 'rgba(255, 240, 200, 0.4)',
    dune: '#3A2E1C',
    mote: 'rgba(255, 255, 245, 0.9)',
  },
  { // L3 golden sunset
    sky: ['#1A0E22', '#43183A', '#8A2D4E', '#D2553F', '#F0913E', '#FAC56A'],
    glow: 'rgba(255, 150, 90, 0.45)',
    dune: '#2A140F',
    mote: 'rgba(255, 225, 190, 0.9)',
  },
  { // L4 starry night
    sky: ['#05060F', '#0B1026', '#141C3A', '#243056', '#3A4A78', '#5A6CA0'],
    glow: 'rgba(180, 200, 255, 0.35)',
    dune: '#0A0F1C',
    mote: 'rgba(235, 240, 255, 0.95)',
  },
  { // L5 promised land (lush)
    sky: ['#0A1A14', '#163528', '#2E5A3E', '#6E8F4E', '#D8C56A', '#F2E0A0'],
    glow: 'rgba(255, 235, 150, 0.42)',
    dune: '#16301F',
    mote: 'rgba(255, 250, 220, 0.9)',
  },
  { // L6 glory gold
    sky: ['#1A1206', '#3A2A0E', '#6E4F18', '#B8862E', '#E9C25A', '#FBE6A8'],
    glow: 'rgba(255, 210, 110, 0.5)',
    dune: '#2A1E0A',
    mote: 'rgba(255, 248, 220, 0.95)',
  },
];

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
