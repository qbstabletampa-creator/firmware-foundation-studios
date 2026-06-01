import { useNavigate } from 'react-router-dom';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import styles from './GameScreen.module.css';

export function GospleScreen() {
  const navigate = useNavigate();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Gosple" backTo="/home" />
      <div className={styles.container}>
        <div className={styles.comingSoon}>
          <span className={styles.icon}>&#x1F4D6;</span>
          <h2 className={styles.title}>Gosple</h2>
          <p className={styles.subtitle}>Daily Bible word puzzle</p>
          <p className={styles.status}>Coming soon</p>
          <button className={styles.backBtn} onClick={() => navigate('/home')}>
            Back to Home
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
