import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { createGospleConfig } from '../games/gosple/config';
import { useStreakStore } from '../stores/streakStore';
import { usePurchaseStore } from '../stores/purchaseStore';
import styles from './GospleScreen.module.css';

export function GospleScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const recordPlay = useStreakStore((s) => s.recordPlay);
  const { canPlayGospleFree, incrementGospleFree, gosple: purchased } = usePurchaseStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const canPlay = purchased || canPlayGospleFree();

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createGospleConfig('gosple-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('gosple:complete', (data: { won: boolean; attempts: number }) => {
      incrementGospleFree();
      recordPlay(data.won);
      navigate('/gosple/home');
    });

    return () => {
      game.events.off('gosple:complete');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, recordPlay, incrementGospleFree]);

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <img src="/gosple-icon.png" alt="Gosple" className={styles.paywallIcon} />
          <h1 className={styles.paywallTitle}>Unlock Gosple</h1>
          <p className={styles.paywallDesc}>
            Your free plays are up! Unlock the full game for unlimited daily puzzles, streaks, and badges.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <button className={styles.paywallBtn} disabled>
            Coming Soon
          </button>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/gosple/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="gosple-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
