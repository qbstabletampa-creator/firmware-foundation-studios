import { useNavigate } from 'react-router-dom';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useProfileStore } from '../stores/profileStore';
import styles from './MannaCatchMoreScreen.module.css';

const menuItems = [
  { icon: '📖', label: 'How to Play', path: '/manna-catch/play?tutorial=true' },
  { icon: '⚙️', label: 'Settings', path: '/manna-catch/settings' },
  { icon: 'ℹ️', label: 'About', path: '/gosple/about' },
  { icon: '🔒', label: 'Privacy', path: '/gosple/privacy' },
  { icon: '💛', label: 'Giveback', path: '/gosple/giveback' },
];

export function MannaCatchMoreScreen() {
  const navigate = useNavigate();
  const { username, profileType } = useProfileStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="More" backTo="/manna-catch/home" />
      <div className={styles.container}>
        <button className={styles.profileCard} onClick={() => navigate('/manna-catch/onboarding')}>
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
