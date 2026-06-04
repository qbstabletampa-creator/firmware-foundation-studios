import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { usePreferencesStore } from '../stores/preferencesStore';
import styles from './LightSnakeSettingsScreen.module.css';

export function LightSnakeSettingsScreen() {
  const { sound, haptics, notifications, toggleSound, toggleHaptics, toggleNotifications } =
    usePreferencesStore();

  const toggles = [
    { label: 'Sound', value: sound, onToggle: toggleSound },
    { label: 'Haptics', value: haptics, onToggle: toggleHaptics },
    { label: 'Notifications', value: notifications, onToggle: toggleNotifications },
  ];

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Settings" backTo="/light-snake/more" />
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
      </div>
    </ScreenShell>
  );
}
