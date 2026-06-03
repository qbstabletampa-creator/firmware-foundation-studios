import { useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { usePreferencesStore } from '../stores/preferencesStore';
import { useNoahAnimalMatchStore } from '../stores/noahAnimalMatchStore';
import styles from './NoahAnimalMatchSettingsScreen.module.css';

export function NoahAnimalMatchSettingsScreen() {
  const { sound, haptics, notifications, toggleSound, toggleHaptics, toggleNotifications } =
    usePreferencesStore();
  const resetStore = useNoahAnimalMatchStore((s) => s.reset);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggles = [
    { label: 'Sound', value: sound, onToggle: toggleSound },
    { label: 'Haptics', value: haptics, onToggle: toggleHaptics },
    { label: 'Notifications', value: notifications, onToggle: toggleNotifications },
  ];

  function handleReset() {
    resetStore();
    setShowConfirm(false);
  }

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Settings" backTo="/noah-animal-match/more" />
      <div className={styles.container}>
        <div className={styles.card}>
          {toggles.map((t) => (
            <div key={t.label} className={styles.toggleRow}>
              <span className={styles.toggleLabel}>{t.label}</span>
              <button
                className={`${styles.toggle} ${t.value ? styles.on : ''}`}
                onClick={t.onToggle}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.dangerSection}>
          {!showConfirm ? (
            <button
              className={styles.dangerButton}
              onClick={() => setShowConfirm(true)}
            >
              Reset Progress
            </button>
          ) : (
            <div className={styles.confirmCard}>
              <p className={styles.confirmText}>
                This will erase all your stats, badges, and progress. This cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleReset}
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}
