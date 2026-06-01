import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import styles from './InfoScreen.module.css';

const charities = [
  {
    month: 'Featured Partner',
    name: 'Awana',
    desc: 'Helping kids learn the gospel and grow in lifelong discipleship.',
  },
  {
    month: 'Featured Partner',
    name: 'Hope Children\'s Home',
    desc: 'A Florida Christian home serving children who need stability, care, and family structure.',
  },
];

export function GivebackScreen() {
  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="Giveback" backTo="/more" />
      <div className={styles.container}>
        <p className={styles.intro}>
          10% of every purchase supports ministries that serve children.
        </p>
        {charities.map((c) => (
          <div key={c.name} className={styles.charityCard}>
            <p className={styles.charityMonth}>{c.month}</p>
            <h3 className={styles.charityName}>{c.name}</h3>
            <p className={styles.charityDesc}>{c.desc}</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
