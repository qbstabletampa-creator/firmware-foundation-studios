import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Phaser from 'phaser';
import { createArkHopperConfig } from '../games/arkHopper/config';
import { usePurchaseStore } from '../stores/purchaseStore';
import styles from './ArkHopperGameScreen.module.css';

const STRIPE_BUY_URL = '#';

export function ArkHopperGameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canPlayMannaCatchFree, recordMannaCatchFree, mannaCatch: purchased, purchaseGame } = usePurchaseStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const fromStripe = searchParams.get('purchased') === 'true';

  useEffect(() => {
    if (fromStripe && !purchased) {
      purchaseGame('mannaCatch');
    }
  }, [fromStripe, purchased, purchaseGame]);

  // Reuse mannaCatch free play gate for now (one free play per day)
  const canPlay = true;

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createArkHopperConfig('ark-hopper-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('arkhopper:complete', () => {
      recordMannaCatchFree();
    });

    game.events.on('arkhopper:back', () => {
      navigate('/ark-hopper/home');
    });

    return () => {
      game.events.off('arkhopper:complete');
      game.events.off('arkhopper:back');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, recordMannaCatchFree]);

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <div className={styles.paywallIconPlaceholder}>{'\u{1F6A2}'}</div>
          <h1 className={styles.paywallTitle}>Unlock Ark Hopper</h1>
          <p className={styles.paywallDesc}>
            Your free play for today is up! Unlock unlimited games.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <a href={STRIPE_BUY_URL} className={styles.paywallBtn}>
            Buy Now
          </a>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/ark-hopper/home')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="ark-hopper-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
