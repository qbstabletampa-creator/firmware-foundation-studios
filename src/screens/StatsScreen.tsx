import { ScreenShell } from '../components/ScreenShell';
import { useStreakStore } from '../stores/streakStore';
import styles from './StatsScreen.module.css';

const badges = [
  { id: 'first_win', icon: '⭐', name: 'First Win', desc: 'Won your first game', check: (s: Stats) => s.won >= 1 },
  { id: 'ten_wins', icon: '🏅', name: 'Double Digits', desc: 'Won 10 games', check: (s: Stats) => s.won >= 10 },
  { id: 'fifty_wins', icon: '📖', name: 'Scholar', desc: 'Won 50 games', check: (s: Stats) => s.won >= 50 },
  { id: 'three_streak', icon: '🔥', name: 'On Fire', desc: '3 day streak', check: (s: Stats) => s.best >= 3 },
  { id: 'week_warrior', icon: '⚔️', name: 'Week Warrior', desc: '7 day streak', check: (s: Stats) => s.best >= 7 },
  { id: 'two_week', icon: '🛡️', name: 'Fortified', desc: '14 day streak', check: (s: Stats) => s.best >= 14 },
  { id: 'faithful', icon: '✞', name: 'Faithful', desc: '30 day streak', check: (s: Stats) => s.best >= 30 },
  { id: 'devoted', icon: '🕊️', name: 'Devoted', desc: '60 day streak', check: (s: Stats) => s.best >= 60 },
  { id: 'unshakable', icon: '👑', name: 'Unshakable', desc: '100 day streak', check: (s: Stats) => s.best >= 100 },
  { id: 'first_guess', icon: '💡', name: 'Revelation', desc: 'Solved in 1 guess', check: () => false },
  { id: 'two_guesses', icon: '🧠', name: 'Sharp Mind', desc: 'Solved in 2 guesses', check: () => false },
  { id: 'three_guesses', icon: '⚡', name: 'Quick Study', desc: 'Solved in 3 guesses', check: () => false },
  { id: 'dedicated', icon: '💎', name: 'Dedicated', desc: 'Played 100 games', check: (s: Stats) => s.played >= 100 },
  { id: 'committed', icon: '🏆', name: 'Committed', desc: 'Played 250 games', check: (s: Stats) => s.played >= 250 },
];

type Stats = { played: number; won: number; best: number };

export function StatsScreen() {
  const { currentStreak, longestStreak, totalGamesPlayed, totalGamesWon } = useStreakStore();
  const winPct = totalGamesPlayed > 0 ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0;
  const stats: Stats = { played: totalGamesPlayed, won: totalGamesWon, best: longestStreak };

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
            const unlocked = badge.check(stats);
            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${unlocked ? '' : styles.locked}`}
              >
                <span className={styles.badgeIcon}>{badge.icon}</span>
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
