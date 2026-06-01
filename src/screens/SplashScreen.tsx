import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import styles from './SplashScreen.module.css';

export function SplashScreen() {
  const navigate = useNavigate();
  const onboarded = useProfileStore((s) => s.onboarded);
  const [visible, setVisible] = useState(true);
  const [glowActive, setGlowActive] = useState(false);

  useEffect(() => {
    const glowTimer = setTimeout(() => setGlowActive(true), 400);
    const fadeTimer = setTimeout(() => setVisible(false), 2200);
    const navTimer = setTimeout(() => {
      navigate(onboarded ? '/gosple/home' : '/gosple/onboarding', { replace: true });
    }, 2500);
    return () => {
      clearTimeout(glowTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, onboarded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.screen}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.center}>
            <div className={styles.logoWrap}>
              <div className={`${styles.outerGlow} ${glowActive ? styles.glowActive : ''}`} />
              <div className={`${styles.innerGlow} ${glowActive ? styles.glowActive : ''}`} />
              <motion.img
                src="/logo.png"
                alt="Firmware Foundation Studios"
                className={styles.logo}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <motion.p
              className={styles.studioName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
            >
              Romans 8:28
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
