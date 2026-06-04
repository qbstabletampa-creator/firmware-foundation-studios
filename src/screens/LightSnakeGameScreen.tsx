import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Phaser from 'phaser';
import { createLightSnakeConfig } from '../games/lightSnake/config';
import { usePurchaseStore } from '../stores/purchaseStore';
import { useLightSnakeStore } from '../stores/lightSnakeStore';
import styles from './LightSnakeGameScreen.module.css';

const STRIPE_BUY_URL = '#';

export function LightSnakeGameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    canPlayLightSnakeFree,
    recordLightSnakeFree,
    lightSnake: purchased,
    purchaseGame,
  } = usePurchaseStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const fromStripe = searchParams.get('purchased') === 'true';

  useEffect(() => {
    if (fromStripe && !purchased) {
      purchaseGame('lightSnake');
    }
  }, [fromStripe, purchased, purchaseGame]);

  const canPlay = canPlayLightSnakeFree();

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createLightSnakeConfig('light-snake-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on(
      'lightsnake:complete',
      (data: { score: number; combo: number; length: number; itemsEaten: number }) => {
        useLightSnakeStore
          .getState()
          .recordGame(data.score, data.combo, data.length, data.itemsEaten);
        recordLightSnakeFree();
      },
    );

    game.events.on('lightsnake:back', () => {
      navigate('/light-snake/home');
    });

    return () => {
      game.events.off('lightsnake:complete');
      game.events.off('lightsnake:back');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, recordLightSnakeFree]);

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <div className={styles.paywallIconPlaceholder}>{'\u{1F40D}'}</div>
          <h1 className={styles.paywallTitle}>Unlock Light Snake</h1>
          <p className={styles.paywallDesc}>
            Your free play for today is up! Unlock unlimited games.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <a href={STRIPE_BUY_URL} className={styles.paywallBtn}>
            Buy Now
          </a>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/light-snake/home')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="light-snake-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
