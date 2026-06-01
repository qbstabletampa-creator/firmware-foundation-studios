import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import styles from './SplashScreen.module.css';

export function SplashScreen() {
  const navigate = useNavigate();
  const onboarded = useProfileStore((s) => s.onboarded);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(onboarded ? '/home' : '/onboarding', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, onboarded]);

  return (
    <div className={styles.screen}>
      <div className={styles.center}>
        <motion.img
          src="/logo.png"
          alt="Firmware Foundation Studios"
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.p
          className={styles.studioName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
        >
          Romans 8:28
        </motion.p>
      </div>
    </div>
  );
}
