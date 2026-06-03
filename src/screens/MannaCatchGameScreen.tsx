import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Phaser from 'phaser';
import { createMannaCatchConfig } from '../games/mannaCatch/config';
import { usePurchaseStore } from '../stores/purchaseStore';
import { useMannaCatchStore } from '../stores/mannaCatchStore';
import { MannaCatchHowToPlayScreen } from './MannaCatchHowToPlayScreen';
import styles from './MannaCatchGameScreen.module.css';

const STRIPE_BUY_URL = 'https://buy.stripe.com/28EeV7gjO4One7x8mTeEo0p';

export function MannaCatchGameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canPlayMannaCatchFree, recordMannaCatchFree, mannaCatch: purchased, purchaseGame } = usePurchaseStore();
  const { hasSeenTutorial, setTutorialSeen } = useMannaCatchStore();
  const forceTutorial = searchParams.get('tutorial') === 'true';
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial || forceTutorial);
  const [showPaywall, setShowPaywall] = useState(false);

  const fromStripe = searchParams.get('purchased') === 'true';

  useEffect(() => {
    if (fromStripe && !purchased) {
      purchaseGame('mannaCatch');
    }
  }, [fromStripe, purchased, purchaseGame]);

  const canPlay = true;

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createMannaCatchConfig('manna-catch-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('mannaCatch:complete', () => {
      recordMannaCatchFree();
      navigate('/manna-catch/home');
    });

    game.events.on('mannaCatch:back', () => {
      navigate('/manna-catch/home');
    });

    return () => {
      game.events.off('mannaCatch:complete');
      game.events.off('mannaCatch:back');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, recordMannaCatchFree]);

  if (showTutorial) {
    return (
      <MannaCatchHowToPlayScreen
        onDismiss={() => {
          setTutorialSeen();
          setShowTutorial(false);
        }}
      />
    );
  }

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <img src="/manna-catch-icon.png" alt="Manna Catch" className={styles.paywallIcon} />
          <h1 className={styles.paywallTitle}>Unlock Manna Catch</h1>
          <p className={styles.paywallDesc}>
            Your free play for today is up! Unlock unlimited games.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <a href={STRIPE_BUY_URL} className={styles.paywallBtn}>
            Buy Now
          </a>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/manna-catch/home')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="manna-catch-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
