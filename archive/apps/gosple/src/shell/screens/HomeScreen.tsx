import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HapticsManager } from '../sound/HapticsManager';
import { colors, radii, shadows, spacing, typography } from '../theme';

type HomeScreenProps = {
  gameName: string;
  tagline: string;
  logoSource: ImageSourcePropType;
  currentStreak: number;
  hasPlayedToday: boolean;
  onPlay: () => void;
  onSettings: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 17) return 'Good afternoon!';
  return 'Good evening!';
}

export default function HomeScreen({
  gameName,
  tagline,
  logoSource,
  currentStreak,
  hasPlayedToday,
  onPlay,
  onSettings,
}: HomeScreenProps) {
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(16)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.85)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const givebackOpacity = useRef(new Animated.Value(0)).current;

  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const stagger = [
      { delay: 0, anims: [greetingOpacity] as Animated.Value[], targets: [1] },
      { delay: 150, anims: [titleOpacity, titleTranslateY], targets: [1, 0] },
      { delay: 300, anims: [cardOpacity, cardTranslateY], targets: [1, 0] },
      { delay: 500, anims: [buttonOpacity, buttonScale], targets: [1, 1] },
      { delay: 650, anims: [givebackOpacity], targets: [1] },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const step of stagger) {
      const t = setTimeout(() => {
        Animated.parallel(
          step.anims.map((anim, i) =>
            Animated.timing(anim, {
              toValue: step.targets[i],
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ).start();
      }, step.delay);
      timers.push(t);
    }

    const pulseTimer = setTimeout(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.04,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseRef.current = pulse;
      pulse.start();
    }, 900);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(pulseTimer);
      pulseRef.current?.stop();
      pulseScale.stopAnimation();
    };
  }, [greetingOpacity, titleOpacity, titleTranslateY, cardOpacity, cardTranslateY, buttonOpacity, buttonScale, pulseScale, givebackOpacity]);

  const handlePressIn = () => {
    pulseRef.current?.stop();
    Animated.spring(buttonScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 12,
    }).start();
  };

  const handlePlay = () => {
    HapticsManager.medium();
    onPlay();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Image source={logoSource} style={styles.smallLogo} resizeMode="contain" />
        <Pressable
          onPress={onSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={({ pressed }) => [styles.gearButton, pressed && styles.pressed]}
        >
          <Text style={styles.gearIcon}>{'⚙'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <Animated.Text style={[styles.greeting, { opacity: greetingOpacity }]}>
          {getGreeting()}
        </Animated.Text>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }}>
          <Text style={styles.gameName}>{gameName}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.progressCard,
            { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
          ]}
        >
          <View style={styles.progressRow}>
            <Text style={styles.streakIcon}>
              {currentStreak > 0 ? '🔥' : '⭐'}
            </Text>
            <Text style={styles.streakText}>
              {currentStreak > 0
                ? `${currentStreak} day streak`
                : 'Start your streak!'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {hasPlayedToday ? '✓' : '✦'}
            </Text>
            <Text style={styles.statusText}>
              {hasPlayedToday ? 'Completed today' : "Today's puzzle is ready!"}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.buttonArea}>
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [
                { scale: Animated.multiply(buttonScale, pulseScale) },
              ],
            }}
          >
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handlePlay}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>PLAY NOW</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, { opacity: givebackOpacity }]}>
          <Text style={styles.footerStudio}>Firmware Foundation Studios</Text>
          <Text style={styles.footerGiveback}>{'💛 10% Giveback'}</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  smallLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  gearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    // Pull the 44pt target back to the edge so the larger hit area doesn't
    // visually shift the gear inward.
    marginRight: -spacing.sm,
  },
  gearIcon: {
    fontSize: 24,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.6,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  gameName: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakIcon: {
    fontSize: 22,
  },
  streakText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: 18,
    color: colors.correct,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 140,
    marginTop: spacing.xl,
  },
  playButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 60,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4C36A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  playButtonText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  footerStudio: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footerGiveback: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
});
