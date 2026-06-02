import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { InstallButton } from '../components/InstallButton';
import { useProfileStore } from '../stores/profileStore';
import { useStreakStore } from '../stores/streakStore';
import styles from './HomeScreen.module.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const navigate = useNavigate();
  const username = useProfileStore((s) => s.username);
  const { currentStreak, lastPlayedDate } = useStreakStore();

  const today = new Date().toISOString().slice(0, 10);
  const playedToday = lastPlayedDate === today;

  return (
    <ScreenShell>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className={styles.header}>
            <img src="/gosple-icon.png" alt="Gosple" className={styles.logoSmall} />
            <button
              className={styles.settingsBtn}
              onClick={() => navigate('/gosple/settings')}
            >
              &#x2699;
            </button>
          </header>

          <p className={styles.greeting}>
            {getGreeting()}, {username}!
          </p>

          <h1 className={styles.gameTitle}>Gosple</h1>
          <p className={styles.tagline}>
            A daily Bible word puzzle for the whole family
          </p>
        </motion.div>

        <motion.div
          className={styles.progressCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.streakRow}>
            {currentStreak > 0 ? (
              <span className={styles.streakText}>
                &#x1F525; {currentStreak} day streak
              </span>
            ) : (
              <span className={styles.streakText}>
                &#x2B50; Start your streak
              </span>
            )}
          </div>
          <div className={styles.statusRow}>
            {playedToday ? (
              <span className={styles.completed}>&#x2713; Completed today</span>
            ) : (
              <span className={styles.ready}>&#x2726; Puzzle ready</span>
            )}
          </div>
        </motion.div>

        <motion.button
          className={styles.playButton}
          onClick={() => navigate('/gosple/play')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
          whileTap={{ scale: 0.97 }}
        >
          PLAY NOW
        </motion.button>

        <motion.div
          className={styles.installWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <InstallButton />
        </motion.div>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className={styles.studioName}>Firmware Foundation</p>
          <p className={styles.giveback}>
            &#x1F49B; 10% Giveback
          </p>
        </motion.div>
      </div>
    </ScreenShell>
  );
}
