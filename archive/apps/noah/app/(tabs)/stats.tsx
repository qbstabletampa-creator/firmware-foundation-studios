import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBadgeStore } from '../../src/shell/stores/badgeStore';
import { useStreakStore } from '../../src/shell/stores/streakStore';
import { useNoahGameStore } from '../../src/game/stores/noahGameStore';
import { colors, radii, shadows, spacing, typography } from '../../src/shell/theme';

export default function StatsTab() {
  // Single source of truth for "games played": noahGameStore counts each
  // completed game (full run), which is the same value the games_played badge
  // events fire on. streakStore.totalGamesPlayed is a per-day play counter and
  // disagreed with the badge counts, so we don't surface it here.
  const totalGamesPlayed = useNoahGameStore((s) => s.totalGamesPlayed);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const highScore = useNoahGameStore((s) => s.highScore);
  const bestCombo = useNoahGameStore((s) => s.bestCombo);
  const totalMatches = useNoahGameStore((s) => s.totalMatches);
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
          <StatBox label="Played" value={totalGamesPlayed} />
          <StatBox label="Matches" value={totalMatches} />
          <StatBox label="Streak" value={currentStreak} valueColor={colors.gold} />
          <StatBox label="Best" value={longestStreak} />
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>

        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <Text style={[styles.badgeIcon, !badge.unlockedAt && styles.badgeLocked]}>
                {badge.icon}
              </Text>
              <Text style={[styles.badgeName, !badge.unlockedAt && styles.badgeLockedText]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDesc}>
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
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
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '800',
  },
  badgeLockedText: {
    color: colors.textMuted,
  },
  badgeDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
