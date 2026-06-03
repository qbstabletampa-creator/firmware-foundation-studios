import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useNoahAnimalMatchStore } from '../stores/noahAnimalMatchStore';
import { noahBadges } from '../games/noahAnimalMatch/badges';
import styles from './NoahAnimalMatchStatsScreen.module.css';

function formatTime(ms: number): string {
  if (ms <= 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function NoahAnimalMatchStatsScreen() {
  const {
    highScore,
    bestCombo,
    totalGamesPlayed,
    bestTime,
    levelsCompleted,
    perfectLevels,
    unlockedBadgeIds,
  } = useNoahAnimalMatchStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Stats" backTo="/noah-animal-match/home" />

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
        </div>

        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.teal}`}>{formatTime(bestTime)}</span>
            <span className={styles.statLabel}>Best Time</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{levelsCompleted}</span>
            <span className={styles.statLabel}>Levels Cleared</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{perfectLevels}</span>
            <span className={styles.statLabel}>Perfect Levels</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.badgeGrid}>
          {noahBadges.map((badge) => {
            const unlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${unlocked ? '' : styles.locked}`}
              >
                <span className={styles.badgeIcon}>{badge.emoji}</span>
                <span className={styles.badgeName}>{badge.name}</span>
                <span className={styles.badgeDesc}>
                  {unlocked ? badge.condition : 'Keep playing!'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ScreenShell>
  );
}
