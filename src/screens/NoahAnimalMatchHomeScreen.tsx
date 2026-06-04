import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { useProfileStore } from '../stores/profileStore';
import { useNoahAnimalMatchStore } from '../stores/noahAnimalMatchStore';
import { usePurchaseStore } from '../stores/purchaseStore';
import styles from './NoahAnimalMatchHomeScreen.module.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function NoahAnimalMatchHomeScreen() {
  const navigate = useNavigate();
  const username = useProfileStore((s) => s.username);
  const { highScore, currentStreak, bestLevel, perfectLevels } = useNoahAnimalMatchStore();
  const { noahAnimalMatch: purchased, canPlayNoahAnimalMatchFree } = usePurchaseStore();

  const playStatus = purchased ? 'Unlimited' : canPlayNoahAnimalMatchFree() ? 'Free play available' : 'No free plays left';

  return (
    <ScreenShell showTabs={false}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className={styles.header}>
            <motion.button
              className={styles.backBtn}
              onClick={() => navigate('/noah-animal-match')}
              aria-label="Back"
              whileTap={{ scale: 0.95 }}
            >
              &#x2190;
            </motion.button>
            <motion.div
              className={styles.logoCircle}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className={styles.logoEmoji}>🕊️</span>
            </motion.div>
            <motion.button
              className={styles.settingsBtn}
              onClick={() => navigate('/noah-animal-match/settings')}
              whileTap={{ scale: 0.95 }}
            >
              &#x2699;
            </motion.button>
          </header>

          <p className={styles.greeting}>
            {getGreeting()}, {username}!
          </p>

          <h1 className={styles.gameTitle}>Noah's Animal Match</h1>
          <p className={styles.tagline}>Pair the animals, two by two</p>
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
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Best Level</span>
              <span className={styles.statValue}>
                {bestLevel > 0 ? bestLevel : '—'}
              </span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Perfect</span>
              <span className={styles.statValue}>
                {perfectLevels > 0 ? perfectLevels : '—'}
              </span>
            </div>
          </div>
          <div className={styles.statusRow}>
            <span className={purchased ? styles.completed : styles.ready}>
              {playStatus}
            </span>
          </div>
        </motion.div>

        <motion.button
          className={styles.playButton}
          onClick={() => navigate('/noah-animal-match/play')}
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
