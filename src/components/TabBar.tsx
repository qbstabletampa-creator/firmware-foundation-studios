import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './TabBar.module.css';

const tabs = [
  { path: '/gosple/home', icon: '⌂', label: 'Home' },
  { path: '/gosple/stats', icon: '≡', label: 'Stats' },
  { path: '/gosple/more', icon: '…', label: 'More' },
] as const;

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <motion.button
            key={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
