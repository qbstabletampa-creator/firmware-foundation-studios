import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { useProfileStore } from '../stores/profileStore';
import { useArkHopperStore } from '../stores/arkHopperStore';
import { usePurchaseStore } from '../stores/purchaseStore';
import styles from './ArkHopperHomeScreen.module.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function ArkHopperHomeScreen() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const username = useProfileStore((s) => s.username);
  const { highScore, currentStreak, furthestLevel, totalStarsCollected, lastPlayedDate } =
    useArkHopperStore();
  const purchased = usePurchaseStore((s) => s.arkHopper);

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
            <motion.button
              className={styles.backBtn}
              onClick={() => navigate('/ark-hopper')}
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
              <span className={styles.logoEmoji}>{'\u{1F411}'}</span>
            </motion.div>
            <motion.button
              className={styles.settingsBtn}
              onClick={() => navigate('/ark-hopper/settings')}
              whileTap={{ scale: 0.95 }}
            >
              &#x2699;
            </motion.button>
          </header>

          <p className={styles.greeting}>
            {getGreeting()}, {username}!
          </p>

          <h1 className={styles.gameTitle}>Ark Hopper</h1>
          <p className={styles.tagline}>Hop your way to Noah's Ark before the flood!</p>
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
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Furthest Level</span>
              <span className={styles.statValue}>
                {furthestLevel > 0 ? furthestLevel : '—'}
              </span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Stars</span>
              <span className={styles.statValue}>
                {totalStarsCollected > 0 ? totalStarsCollected.toLocaleString() : '—'}
              </span>
            </div>
          </div>
          <div className={styles.statusRow}>
            {purchased ? (
              <span className={styles.completed}>&#x2726; Unlimited Access</span>
            ) : playedToday ? (
              <span className={styles.completed}>&#x2713; Free play used today</span>
            ) : (
              <span className={styles.ready}>&#x2726; 1 free play available!</span>
            )}
          </div>
        </motion.div>

        <motion.button
          className={styles.playButton}
          onClick={() => navigate('/ark-hopper/play')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
          whileTap={{ scale: 0.97 }}
        >
          PLAY NOW
        </motion.button>

        <motion.button
          className={styles.helpButton}
          onClick={() => setShowHelp(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          How to Play
        </motion.button>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              className={styles.helpOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                className={styles.helpCard}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles.helpTitle}>How to Play</h2>
                <div className={styles.helpSteps}>
                  <p>Swipe or tap to hop in any direction.</p>
                  <p>Dodge animals on the paths. They will knock you down.</p>
                  <p>Hop onto logs and lily pads to cross water.</p>
                  <p>Collect stars for bonus points.</p>
                  <p>Reach Noah's Ark at the top to clear the level.</p>
                  <p>Watch the flood meter. If it fills up, the water rises.</p>
                </div>
                <button className={styles.helpClose} onClick={() => setShowHelp(false)}>
                  Got it!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
