import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useBibleBrickBreakerStore } from '../stores/bibleBrickBreakerStore';
import { bibleBrickBreakerBadges } from '../games/bibleBrickBreaker/badges';
import styles from './BibleBrickBreakerStatsScreen.module.css';

export function BibleBrickBreakerStatsScreen() {
  const highScore = useBibleBrickBreakerStore((s) => s.highScore);
  const bestCombo = useBibleBrickBreakerStore((s) => s.bestCombo);
  const totalGamesPlayed = useBibleBrickBreakerStore((s) => s.totalGamesPlayed);
  const totalBricksBroken = useBibleBrickBreakerStore((s) => s.totalBricksBroken);
  const highestLevel = useBibleBrickBreakerStore((s) => s.highestLevel);
  const totalWordsRevealed = useBibleBrickBreakerStore((s) => s.totalWordsRevealed);
  const currentStreak = useBibleBrickBreakerStore((s) => s.currentStreak);
  const longestStreak = useBibleBrickBreakerStore((s) => s.longestStreak);
  const unlockedBadgeIds = useBibleBrickBreakerStore((s) => s.unlockedBadgeIds);

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Stats" backTo="/bible-brick-breaker/more" />

      <div className={styles.container}>
        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{highScore}</span>
            <span className={styles.statLabel}>High Score</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{bestCombo}</span>
            <span className={styles.statLabel}>Best Combo</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{totalGamesPlayed}</span>
            <span className={styles.statLabel}>Games Played</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{totalBricksBroken}</span>
            <span className={styles.statLabel}>Bricks Broken</span>
          </div>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{highestLevel}</span>
            <span className={styles.statLabel}>Highest Level</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{totalWordsRevealed}</span>
            <span className={styles.statLabel}>Words Revealed</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.teal}`}>{currentStreak}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{longestStreak}</span>
            <span className={styles.statLabel}>Best Streak</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.badgeGrid}>
          {bibleBrickBreakerBadges.map((badge) => {
            const unlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${unlocked ? '' : styles.locked}`}
              >
                <span className={styles.badgeIcon}>{badge.emoji}</span>
                <span className={styles.badgeName}>{badge.name}</span>
                <span className={styles.badgeDesc}>
                  {unlocked ? badge.description : 'Keep playing!'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ScreenShell>
  );
}
