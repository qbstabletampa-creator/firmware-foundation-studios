import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Phaser from 'phaser';
import { createNoahAnimalMatchConfig } from '../games/noahAnimalMatch/config';
import { usePurchaseStore } from '../stores/purchaseStore';
import styles from './NoahAnimalMatchGameScreen.module.css';

const STRIPE_BUY_URL = '#';

export function NoahAnimalMatchGameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    canPlayNoahAnimalMatchFree,
    incrementNoahAnimalMatchFree,
    noahAnimalMatch: purchased,
    purchaseGame,
  } = usePurchaseStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const fromStripe = searchParams.get('purchased') === 'true';

  useEffect(() => {
    if (fromStripe && !purchased) {
      purchaseGame('noahAnimalMatch');
    }
  }, [fromStripe, purchased, purchaseGame]);

  const canPlay = true;

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createNoahAnimalMatchConfig('noah-animal-match-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('noahanimalmatch:complete', () => {
      incrementNoahAnimalMatchFree();
      navigate('/noah-animal-match/home');
    });

    game.events.on('noahanimalmatch:back', () => {
      navigate('/noah-animal-match/home');
    });

    return () => {
      game.events.off('noahanimalmatch:complete');
      game.events.off('noahanimalmatch:back');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, incrementNoahAnimalMatchFree]);

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <div className={styles.paywallIconPlaceholder}>🦁</div>
          <h1 className={styles.paywallTitle}>Unlock Noah's Animal Match</h1>
          <p className={styles.paywallDesc}>
            Your free play for today is up! Unlock unlimited games.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <a href={STRIPE_BUY_URL} className={styles.paywallBtn}>
            Buy Now
          </a>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/noah-animal-match/home')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="noah-animal-match-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
