import { ScreenShell } from '../components/ScreenShell';
import { useStreakStore } from '../stores/streakStore';
import styles from './StatsScreen.module.css';

const badges = [
  { id: 'first-win', icon: '&#x2B50;', name: 'First Win', desc: 'Complete your first puzzle', threshold: 1 },
  { id: 'streak-3', icon: '&#x1F525;', name: 'On Fire', desc: '3 day streak', threshold: 3 },
  { id: 'streak-7', icon: '&#x1F31F;', name: 'Weekly Warrior', desc: '7 day streak', threshold: 7 },
  { id: 'played-10', icon: '&#x1F4DA;', name: 'Dedicated', desc: 'Play 10 puzzles', threshold: 10 },
  { id: 'streak-14', icon: '&#x1F3C6;', name: 'Fortnight', desc: '14 day streak', threshold: 14 },
  { id: 'played-30', icon: '&#x1F48E;', name: 'Scholar', desc: 'Play 30 puzzles', threshold: 30 },
];

export function StatsScreen() {
  const { currentStreak, longestStreak, totalGamesPlayed, totalGamesWon } = useStreakStore();
  const winPct = totalGamesPlayed > 0 ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0;

  return (
    <ScreenShell>
      <div className={styles.container}>
        <h1 className={styles.heading}>Stats</h1>

        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{totalGamesPlayed}</span>
            <span className={styles.statLabel}>Played</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{winPct}%</span>
            <span className={styles.statLabel}>Win %</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.teal}`}>{currentStreak}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${styles.gold}`}>{longestStreak}</span>
            <span className={styles.statLabel}>Best</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.badgeGrid}>
          {badges.map((badge) => {
            const unlocked =
              badge.id.startsWith('streak')
                ? longestStreak >= badge.threshold
                : totalGamesPlayed >= badge.threshold;
            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${unlocked ? '' : styles.locked}`}
              >
                <span
                  className={styles.badgeIcon}
                  dangerouslySetInnerHTML={{ __html: badge.icon }}
                />
                <span className={styles.badgeName}>{badge.name}</span>
                <span className={styles.badgeDesc}>
                  {unlocked ? badge.desc : 'Keep playing!'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ScreenShell>
  );
}
