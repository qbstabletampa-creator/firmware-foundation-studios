import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HapticsManager } from '../sound/HapticsManager';
import { colors, radii, spacing } from '../theme';

type Profile = 'Kid' | 'Teen' | 'Parent' | 'Family';

type OnboardingScreenProps = {
  gameName: string;
  onComplete: (profile: Profile) => void;
};

const PROFILES: { label: Profile; icon: string }[] = [
  { label: 'Kid', icon: '🧒' },
  { label: 'Teen', icon: '🧑' },
  { label: 'Parent', icon: '👨‍👩‍👧' },
  { label: 'Family', icon: '🏡' },
];

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DECOR = ['🔦', '🕯️', '✨', '🍞', '🐟', '🪔'];
const { height: SCREEN_H } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Background "alive" layer: blessings drift down behind everything.
// ---------------------------------------------------------------------------
function FallingDecor() {
  const items = useMemo(
    () =>
      DECOR.map((icon, i) => ({
        icon,
        left: `${8 + i * 15}%`,
        delay: i * 900,
        duration: 7000 + i * 600,
        size: 22 + (i % 3) * 6,
      })),
    [],
  );
  const values = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(items[i].delay),
          Animated.timing(v, {
            toValue: 1,
            duration: items[i].duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [items, values]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((it, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.decor,
            {
              left: it.left as `${number}%`,
              fontSize: it.size,
              transform: [
                {
                  translateY: values[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, SCREEN_H + 50],
                  }),
                },
              ],
            },
          ]}
        >
          {it.icon}
        </Animated.Text>
      ))}
    </View>
  );
}

export default function OnboardingScreen({ gameName, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Profile | null>(null);

  // Per-step fade-in.
  const stepOpacity = useRef(new Animated.Value(0)).current;
  // Step 0 basket idle bounce.
  const bounce = useRef(new Animated.Value(0)).current;
  // Step 2 reward star pop.
  const starScale = useRef(new Animated.Value(0)).current;

  const todayIdx = useMemo(() => new Date().getDay(), []);

  // Fade each step in on change.
  useEffect(() => {
    stepOpacity.setValue(0);
    Animated.timing(stepOpacity, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, stepOpacity]);

  // Basket idle bounce loop.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  // Pop the reward star when we land on step 2.
  useEffect(() => {
    if (step === 2) {
      starScale.setValue(0);
      HapticsManager.success();
      Animated.spring(starScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [step, starScale]);

  const pickProfile = (p: Profile) => {
    if (selected) return;
    setSelected(p);
    HapticsManager.light();
    setTimeout(() => setStep(2), 480);
  };

  const basketTranslate = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  return (
    <SafeAreaView style={styles.screen}>
      <FallingDecor />

      {/* progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map((d) => (
          <View key={d} style={[styles.dot, d === step && styles.dotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: stepOpacity }]}>
        {step === 0 && (
          <View style={styles.center}>
            <Animated.Text
              style={[styles.basket, { transform: [{ translateY: basketTranslate }] }]}
            >
              🔦
            </Animated.Text>
            <Text style={styles.welcome}>Welcome to</Text>
            <Text style={styles.title}>{gameName}</Text>
            <Text style={styles.promise}>
              Guide the light.{'\n'}Learn God's word.{'\n'}Build your streak.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.center}>
            <Text style={styles.stepHeading}>Who's playing?</Text>
            <Text style={styles.stepSub}>Pick one to get started.</Text>
            <View style={styles.grid}>
              {PROFILES.map(({ label, icon }) => (
                <Pressable
                  key={label}
                  onPress={() => pickProfile(label)}
                  style={({ pressed }) => [
                    styles.card,
                    selected === label && styles.cardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cardIcon}>{icon}</Text>
                  <Text style={styles.cardLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.center}>
            <Animated.Text style={[styles.rewardStar, { transform: [{ scale: starScale }] }]}>
              ⭐
            </Animated.Text>
            <Text style={styles.rewardTitle}>Your first blessing!</Text>
            <Text style={styles.rewardSub}>
              Play every day to grow your streak.
            </Text>

            <View style={styles.weekRow}>
              {WEEK.map((d, i) => {
                const isToday = i === todayIdx;
                return (
                  <View key={i} style={styles.dayCol}>
                    <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                      <Text style={[styles.dayMark, isToday && styles.dayMarkToday]}>
                        {isToday ? '🔥' : d}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={styles.streakHint}>Day 1 of your streak starts now.</Text>
          </View>
        )}
      </Animated.View>

      {/* primary action */}
      <View style={styles.footer}>
        {step === 0 && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.buttonText}>Let's Go</Text>
          </Pressable>
        )}
        {step === 2 && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => selected && onComplete(selected)}
          >
            <Text style={styles.buttonText}>Start Playing</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  decor: { position: 'absolute', top: 0, opacity: 0.16 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceBorder,
  },
  dotActive: { backgroundColor: colors.gold, width: 22 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  center: { alignItems: 'center' },

  // Step 0
  basket: { fontSize: 96, marginBottom: spacing.lg },
  welcome: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.gold,
    fontSize: 46,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  promise: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },

  // Step 1
  stepHeading: { color: colors.textPrimary, fontSize: 30, fontWeight: '900' },
  stepSub: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: '44%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  cardIcon: { fontSize: 44 },
  cardLabel: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },

  // Step 2
  rewardStar: { fontSize: 90, marginBottom: spacing.md },
  rewardTitle: { color: colors.gold, fontSize: 30, fontWeight: '900' },
  rewardSub: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  weekRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  dayCol: { alignItems: 'center' },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: colors.gold,
  },
  dayMark: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
  dayMarkToday: { fontSize: 16 },
  streakHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.lg,
  },

  // Footer / button
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: { color: colors.background, fontSize: 18, fontWeight: '900' },
  pressed: { opacity: 0.75 },
});
