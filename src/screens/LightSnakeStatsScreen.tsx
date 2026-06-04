import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useLightSnakeStore } from '../stores/lightSnakeStore';
import { lightSnakeBadges } from '../games/lightSnake/badges';
import styles from './LightSnakeStatsScreen.module.css';

export function LightSnakeStatsScreen() {
  const highScore = useLightSnakeStore((s) => s.highScore);
  const bestCombo = useLightSnakeStore((s) => s.bestCombo);
  const totalGamesPlayed = useLightSnakeStore((s) => s.totalGamesPlayed);
  const totalItemsEaten = useLightSnakeStore((s) => s.totalItemsEaten);
  const longestSnake = useLightSnakeStore((s) => s.longestSnake);
  const currentStreak = useLightSnakeStore((s) => s.currentStreak);
  const longestStreak = useLightSnakeStore((s) => s.longestStreak);
  const unlockedBadgeIds = useLightSnakeStore((s) => s.unlockedBadgeIds);

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Stats" backTo="/light-snake/more" />

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
            <span className={styles.statValue}>{totalItemsEaten}</span>
            <span className={styles.statLabel}>Items Eaten</span>
          </div>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{longestSnake}</span>
            <span className={styles.statLabel}>Longest Snake</span>
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
          {lightSnakeBadges.map((badge) => {
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
