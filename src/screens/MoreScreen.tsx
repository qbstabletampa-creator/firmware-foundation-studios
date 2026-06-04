import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { InstallButton } from '../components/InstallButton';
import { useProfileStore } from '../stores/profileStore';
import styles from './MoreScreen.module.css';

const menuItems = [
  { icon: '⚙️', label: 'Settings', path: '/gosple/settings' },
  { icon: 'ℹ️', label: 'About', path: '/gosple/about' },
  { icon: '🔒', label: 'Privacy', path: '/gosple/privacy' },
  { icon: '💛', label: 'Giveback', path: '/gosple/giveback' },
];

export function MoreScreen() {
  const navigate = useNavigate();
  const { username, profileType, reset } = useProfileStore();

  function handleChangeProfile() {
    reset();
    navigate('/gosple/onboarding');
  }

  return (
    <ScreenShell>
      <div className={styles.container}>
        <h1 className={styles.heading}>More</h1>

        <motion.button className={styles.profileCard} onClick={handleChangeProfile} whileTap={{ scale: 0.95 }}>
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
        </motion.button>

        <div className={styles.menuList}>
          {menuItems.map((item) => (
            <motion.button
              key={item.path}
              className={styles.menuItem}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              <span className={styles.menuArrow}>&#x203A;</span>
            </motion.button>
          ))}
        </div>
        <div className={styles.installRow}>
          <InstallButton />
        </div>
      </div>
    </ScreenShell>
  );
}
