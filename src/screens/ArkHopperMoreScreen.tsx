import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenShell } from '../components/ScreenShell';
import { PageHeader } from '../components/PageHeader';
import { useProfileStore } from '../stores/profileStore';
import styles from './ArkHopperMoreScreen.module.css';

const menuItems = [
  { icon: '⚙️', label: 'Settings', path: '/ark-hopper/settings' },
  { icon: 'ℹ️', label: 'About', path: '/gosple/about' },
  { icon: '\u{1F512}', label: 'Privacy', path: '/gosple/privacy' },
  { icon: '\u{1F49B}', label: 'Giveback', path: '/gosple/giveback' },
];

export function ArkHopperMoreScreen() {
  const navigate = useNavigate();
  const { username, profileType } = useProfileStore();

  return (
    <ScreenShell showTabs={false}>
      <PageHeader title="More" backTo="/ark-hopper/home" />
      <div className={styles.container}>
        <motion.button className={styles.profileCard} onClick={() => navigate('/ark-hopper/onboarding')} whileTap={{ scale: 0.95 }}>
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
      </div>
    </ScreenShell>
  );
}
