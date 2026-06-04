import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import { useRayCanvas } from '../utils/rayShader';
import styles from './GameSplashScreen.module.css';

interface GameSplashConfig {
  logoSrc: string;
  logoAlt: string;
  verseText: string;
  homePath: string;
  onboardingPath: string;
  isOnboarded?: boolean;
}

export function GameSplashScreen({ logoSrc, logoAlt, verseText, homePath, onboardingPath, isOnboarded }: GameSplashConfig) {
  const navigate = useNavigate();
  const globalOnboarded = useProfileStore((s) => s.onboarded);
  const onboarded = isOnboarded ?? globalOnboarded;
  const [visible, setVisible] = useState(true);
  const [raysActive, setRaysActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mounted = useRef(true);
  useEffect(() => { return () => { mounted.current = false; }; }, []);

  useRayCanvas(canvasRef, raysActive);

  useEffect(() => {
    const rayTimer = setTimeout(() => {
      if (mounted.current) setRaysActive(true);
    }, 300);
    const fadeTimer = setTimeout(() => {
      if (mounted.current) setVisible(false);
    }, 2200);
    const navTimer = setTimeout(() => {
      if (mounted.current) navigate(onboarded ? homePath : onboardingPath, { replace: true });
    }, 2500);
    return () => {
      clearTimeout(rayTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, onboarded, homePath, onboardingPath]);

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
              <canvas ref={canvasRef} className={styles.rayCanvas} />
              <motion.img
                src={logoSrc}
                alt={logoAlt}
                className={styles.logo}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: [0.85, 1, 1.15] }}
                transition={{
                  opacity: { delay: 0.2, duration: 0.5 },
                  scale: { delay: 0.2, duration: 2.5, times: [0, 0.2, 1], ease: 'easeInOut' },
                }}
              />
            </div>
            <motion.p
              className={styles.studioName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
            >
              {verseText}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
