import { useNavigate } from 'react-router-dom';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useProfileStore } from '../stores/profileStore';
import styles from './NoahAnimalMatchMoreScreen.module.css';

const menuItems = [
  { icon: '⚙️', label: 'Settings', path: '/noah-animal-match/settings' },
  { icon: 'ℹ️', label: 'About', path: '/gosple/about' },
  { icon: '🔒', label: 'Privacy', path: '/gosple/privacy' },
  { icon: '💛', label: 'Giveback', path: '/gosple/giveback' },
];

export function NoahAnimalMatchMoreScreen() {
  const navigate = useNavigate();
  const { username, profileType } = useProfileStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="More" backTo="/noah-animal-match/home" />
      <div className={styles.container}>
        <button className={styles.profileCard} onClick={() => navigate('/noah-animal-match/onboarding')}>
          <div className={styles.avatar}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{username}</span>
            <span className={styles.profileHint}>
              {profileType === 'kid' ? 'Kid' : 'Parent'} profile · Tap to change
            </span>
          </div>
          <span className={styles.arrow}>&#x203A;</span>
        </button>

        <div className={styles.menuList}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={styles.menuItem}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              <span className={styles.menuArrow}>&#x203A;</span>
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
