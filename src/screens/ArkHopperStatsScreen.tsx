import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useArkHopperStore } from '../stores/arkHopperStore';
import { arkHopperBadges } from '../games/arkHopper/badges';
import styles from './ArkHopperStatsScreen.module.css';

export function ArkHopperStatsScreen() {
  const {
    highScore,
    bestCombo,
    totalGamesPlayed,
    furthestLevel,
    totalHops,
    totalStarsCollected,
    unlockedBadgeIds,
  } = useArkHopperStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Stats" backTo="/ark-hopper/home" />

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
            <span className={`${styles.statValue} ${styles.teal}`}>{furthestLevel}</span>
            <span className={styles.statLabel}>Furthest Level</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{totalHops}</span>
            <span className={styles.statLabel}>Total Hops</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{totalStarsCollected}</span>
            <span className={styles.statLabel}>Stars Collected</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.badgeGrid}>
          {arkHopperBadges.map((badge) => {
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
