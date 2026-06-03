import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useMannaCatchStore } from '../stores/mannaCatchStore';
import { mannaBadges } from '../games/mannaCatch/badges';
import styles from './MannaCatchStatsScreen.module.css';

export function MannaCatchStatsScreen() {
  const {
    highScore,
    bestCombo,
    totalGamesPlayed,
    totalItemsCaught,
    currentStreak,
    longestStreak,
    unlockedBadgeIds,
  } = useMannaCatchStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Stats" backTo="/manna-catch/more" />

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
            <span className={styles.statValue}>{totalItemsCaught}</span>
            <span className={styles.statLabel}>Items Caught</span>
          </div>
        </div>

        <div className={styles.statRow}>
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
          {mannaBadges.map((badge) => {
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
