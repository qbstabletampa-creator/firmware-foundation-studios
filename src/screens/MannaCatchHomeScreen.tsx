import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { useProfileStore } from '../stores/profileStore';
import { useMannaCatchStore } from '../stores/mannaCatchStore';
import styles from './MannaCatchHomeScreen.module.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function MannaCatchHomeScreen() {
  const navigate = useNavigate();
  const username = useProfileStore((s) => s.username);
  const { highScore, lastPlayedDate, currentStreak } = useMannaCatchStore();

  const today = new Date().toISOString().slice(0, 10);
  const playedToday = lastPlayedDate === today;

  return (
    <ScreenShell showTabs={false}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className={styles.header}>
            <button
              className={styles.backBtn}
              onClick={() => navigate('/manna-catch')}
              aria-label="Back"
            >
              &#x2190;
            </button>
            <div className={styles.logoCircle}>
              <img src="/manna-catch-icon.png" alt="Manna Catch" className={styles.logoImg} />
            </div>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate('/manna-catch/settings')}
            >
              &#x2699;
            </button>
          </header>

          <p className={styles.greeting}>
            {getGreeting()}, {username}!
          </p>

          <h1 className={styles.gameTitle}>Manna Catch</h1>
          <p className={styles.tagline}>Catch the blessings</p>
        </motion.div>

        <motion.div
          className={styles.statsCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>High Score</span>
              <span className={styles.statValue}>
                {highScore > 0 ? highScore.toLocaleString() : '—'}
              </span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Streak</span>
              <span className={styles.statValue}>
                {currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` : '—'}
              </span>
            </div>
          </div>
          <div className={styles.statusRow}>
            {playedToday ? (
              <span className={styles.completed}>&#x2713; Played today</span>
            ) : (
              <span className={styles.ready}>&#x2726; Today's challenge ready!</span>
            )}
          </div>
        </motion.div>

        <motion.button
          className={styles.playButton}
          onClick={() => navigate('/manna-catch/play')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
          whileTap={{ scale: 0.97 }}
        >
          PLAY NOW
        </motion.button>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className={styles.studioName}>Firmware Foundation Studios</p>
        </motion.div>
      </div>
    </ScreenShell>
  );
}
