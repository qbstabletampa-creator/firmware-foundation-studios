import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import { useRayCanvas } from '../utils/rayShader';
import styles from './GameSplashScreen.module.css';

interface GameSplashConfig {
  gameId: string;
  logoSrc: string;
  logoAlt: string;
  verseText: string;
  homePath: string;
  onboardingPath: string;
}

export function GameSplashScreen({ gameId, logoSrc, logoAlt, verseText, homePath, onboardingPath }: GameSplashConfig) {
  const navigate = useNavigate();
  const isGameOnboarded = useProfileStore((s) => s.isGameOnboarded);
  const onboarded = isGameOnboarded(gameId);
  const [visible, setVisible] = useState(true);
  const [raysActive, setRaysActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useRayCanvas(canvasRef, raysActive);

  useEffect(() => {
    const rayTimer = setTimeout(() => {
      setRaysActive(true);
    }, 300);
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 2200);
    const navTimer = setTimeout(() => {
      navigate(onboarded ? homePath : onboardingPath, { replace: true });
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
