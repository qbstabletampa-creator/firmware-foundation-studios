import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import styles from './InfoScreen.module.css';

export function AboutScreen() {
  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="About" backTo="/gosple/more" />
      <div className={styles.container}>
        <p className={styles.studioLabel}>Firmware Foundation Studios</p>
        <h2 className={styles.appName}>Gosple</h2>
        <p className={styles.version}>Version 1.0.0</p>
        <p className={styles.description}>
          Safe, joyful games rooted in Scripture for Christian families.
        </p>
        <p className={styles.footer}>
          Built with love for families everywhere.
        </p>
        <p className={styles.company}>The QB Stable LLC, Tampa, FL</p>
      </div>
    </ScreenShell>
  );
}
