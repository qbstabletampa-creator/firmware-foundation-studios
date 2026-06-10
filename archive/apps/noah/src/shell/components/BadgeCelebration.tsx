import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HapticsManager } from '../sound/HapticsManager';
import { colors, radii, spacing } from '../theme';
import type { Badge } from '../rewards/types';

type BadgeCelebrationProps = {
  badge: Badge | null;
  onDismiss: () => void;
};

const PARTICLE_COUNT = 12;

function Particle({ delay, color }: { delay: number; color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const angle = useRef(Math.random() * Math.PI * 2).current;
  const distance = useRef(60 + Math.random() * 80).current;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [opacity, translateX, translateY, scale, delay, targetX, targetY]);

  const size = 6 + Math.random() * 6;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

export default function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!badge) return;

    HapticsManager.success();

    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const iconTimer = setTimeout(() => {
      HapticsManager.medium();
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 14,
      }).start();
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 200);

    const textTimer = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 500);

    const buttonTimer = setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 800);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, [badge, overlayOpacity, cardScale, cardOpacity, iconScale, glowOpacity, textOpacity, buttonOpacity]);

  const handleDismiss = () => {
    HapticsManager.light();
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
    ]).start(onDismiss);
  };

  const particleColors = [colors.gold, '#E0D280', '#FFA500', colors.correct, '#FFFFFF'];

  return (
    <Modal visible={badge !== null} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <View style={styles.particleContainer}>
            {badge &&
              Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <Particle
                  key={i}
                  delay={300 + i * 60}
                  color={particleColors[i % particleColors.length]}
                />
              ))}
          </View>

          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Text style={styles.badgeIcon}>{badge?.icon}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: textOpacity }}>
            <Text style={styles.unlocked}>BADGE UNLOCKED</Text>
            <Text style={styles.badgeName}>{badge?.name}</Text>
            <Text style={styles.badgeDesc}>{badge?.description}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: buttonOpacity, width: '100%' }}>
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Awesome!</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    paddingTop: 40,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  particleContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
  },
  glowRing: {
    position: 'absolute',
    top: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gold,
    opacity: 0.15,
  },
  badgeIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  unlocked: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeName: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  badgeDesc: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
