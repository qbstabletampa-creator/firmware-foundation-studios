import { useNavigate } from 'react-router-dom';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import styles from './GameScreen.module.css';

export function MannaCatchScreen() {
  const navigate = useNavigate();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Manna Catch" backTo="/home" />
      <div className={styles.container}>
        <div className={styles.comingSoon}>
          <span className={styles.icon}>&#x1F35E;</span>
          <h2 className={styles.title}>Manna Catch</h2>
          <p className={styles.subtitle}>Catch the blessings</p>
          <p className={styles.status}>Coming soon</p>
          <button className={styles.backBtn} onClick={() => navigate('/home')}>
            Back to Home
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
