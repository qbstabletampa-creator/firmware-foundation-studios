import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { usePreferencesStore } from '../stores/preferencesStore';
import { useArkHopperStore } from '../stores/arkHopperStore';
import styles from './ArkHopperSettingsScreen.module.css';

export function ArkHopperSettingsScreen() {
  const { sound, haptics, notifications, toggleSound, toggleHaptics, toggleNotifications } =
    usePreferencesStore();
  const resetProgress = useArkHopperStore((s) => s.reset);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggles = [
    { label: 'Sound', value: sound, onToggle: toggleSound },
    { label: 'Haptics', value: haptics, onToggle: toggleHaptics },
    { label: 'Notifications', value: notifications, onToggle: toggleNotifications },
  ];

  function handleReset() {
    resetProgress();
    setShowConfirm(false);
  }

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Settings" backTo="/ark-hopper/more" />
      <div className={styles.container}>
        <div className={styles.card}>
          {toggles.map((t) => (
            <div key={t.label} className={styles.toggleRow}>
              <span className={styles.toggleLabel}>{t.label}</span>
              <motion.button
                className={`${styles.toggle} ${t.value ? styles.on : ''}`}
                onClick={t.onToggle}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.toggleKnob} />
              </motion.button>
            </div>
          ))}
        </div>

        <motion.button
          className={styles.dangerButton}
          onClick={() => setShowConfirm(true)}
          whileTap={{ scale: 0.95 }}
        >
          Reset Progress
        </motion.button>

        {showConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog}>
              <p className={styles.confirmTitle}>Reset all progress?</p>
              <p className={styles.confirmText}>
                This will clear your high score, badges, streak, and all game data. This cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <motion.button
                  className={styles.cancelButton}
                  onClick={() => setShowConfirm(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={styles.resetButton}
                  onClick={handleReset}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
