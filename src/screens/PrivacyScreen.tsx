import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import styles from './InfoScreen.module.css';

const statements = [
  'We believe kids deserve privacy.',
  'This app collects no personal data.',
  'No analytics. No ads. No social features.',
  'All game data is stored locally in your browser.',
  'Nothing leaves your device. Ever.',
];

export function PrivacyScreen() {
  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Privacy" backTo="/more" />
      <div className={styles.container}>
        {statements.map((s, i) => (
          <div key={i} className={styles.card}>
            <p className={styles.cardText}>{s}</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
