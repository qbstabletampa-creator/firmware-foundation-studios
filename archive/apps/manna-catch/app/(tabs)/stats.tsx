import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBadgeStore } from '../../src/shell/stores/badgeStore';
import { useStreakStore } from '../../src/shell/stores/streakStore';
import { useCatchGameStore } from '../../src/game/stores/catchGameStore';
import { colors, radii, shadows, spacing, typography } from '../../src/shell/theme';

export default function StatsTab() {
  const totalGamesPlayed = useStreakStore((s) => s.totalGamesPlayed);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const highScore = useCatchGameStore((s) => s.highScore);
  const bestCombo = useCatchGameStore((s) => s.bestCombo);
  const totalItemsCaught = useCatchGameStore((s) => s.totalItemsCaught);
  const badges = useBadgeStore((s) => s.badges);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Stats</Text>

        <View style={styles.statRow}>
          <StatBox label="High Score" value={highScore} valueColor={colors.gold} />
          <StatBox label="Best Combo" value={bestCombo} valueColor={colors.teal} />
        </View>
        <View style={styles.statRow}>
          <StatBox label="Games Played" value={totalGamesPlayed} />
          <StatBox label="Items Caught" value={totalItemsCaught} />
        </View>
        <View style={styles.statRow}>
          <StatBox label="Current Streak" value={currentStreak} valueColor={colors.gold} />
          <StatBox label="Longest Streak" value={longestStreak} />
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>

        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <Text style={[styles.badgeIcon, !badge.unlockedAt && styles.badgeLocked]}>
                {badge.icon}
              </Text>
              <Text
                style={[styles.badgeName, !badge.unlockedAt && styles.badgeLockedText]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {badge.name}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {badge.unlockedAt ? badge.description : 'Keep playing!'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type StatBoxProps = {
  label: string;
  value: number;
  valueColor?: string;
};

function StatBox({ label, value, valueColor }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    color: colors.textPrimary,
    ...typography.heading,
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.sectionTitle,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    // Three across with the row's 8px gaps accounted for, so the grid never
    // collapses to two-per-row on a 390px screen. minHeight keeps every card
    // the same height so rows line up cleanly (badge descriptions vary in
    // length, which otherwise left the grid ragged).
    width: '31.5%',
    minHeight: 104,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 4,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...shadows.card,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  badgeLocked: {
    opacity: 0.3,
  },
  badgeName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
    textAlign: 'center',
  },
  badgeLockedText: {
    color: colors.textMuted,
  },
  badgeDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
