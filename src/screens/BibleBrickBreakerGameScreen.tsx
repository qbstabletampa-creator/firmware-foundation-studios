import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Phaser from 'phaser';
import { createBibleBrickBreakerConfig } from '../games/bibleBrickBreaker/config';
import { BibleBrickBreakerScene } from '../games/bibleBrickBreaker/BibleBrickBreakerScene';
import { usePurchaseStore } from '../stores/purchaseStore';
import { useBibleBrickBreakerStore } from '../stores/bibleBrickBreakerStore';
import styles from './BibleBrickBreakerGameScreen.module.css';

const STRIPE_BUY_URL = '#';

export function BibleBrickBreakerGameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    canPlayBibleBrickBreakerFree,
    recordBibleBrickBreakerFree,
    bibleBrickBreaker: purchased,
    purchaseGame,
  } = usePurchaseStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const fromStripe = searchParams.get('purchased') === 'true';

  useEffect(() => {
    if (fromStripe && !purchased) {
      purchaseGame('bibleBrickBreaker');
    }
  }, [fromStripe, purchased, purchaseGame]);

  const canPlay = canPlayBibleBrickBreakerFree();

  useEffect(() => {
    if (!canPlay) {
      setShowPaywall(true);
      return;
    }

    if (!containerRef.current || gameRef.current) return;

    const config = createBibleBrickBreakerConfig('bible-brick-breaker-game');
    config.scene = [BibleBrickBreakerScene];
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on(
      'brickbreaker:complete',
      (data: { score: number; combo: number; bricksBroken: number; level: number; wordsRevealed: number }) => {
        useBibleBrickBreakerStore
          .getState()
          .recordGame(data.score, data.combo, data.bricksBroken, data.level, data.wordsRevealed);
        recordBibleBrickBreakerFree();
      },
    );

    game.events.on('brickbreaker:back', () => {
      navigate('/bible-brick-breaker/home');
    });

    return () => {
      game.events.off('brickbreaker:complete');
      game.events.off('brickbreaker:back');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [canPlay, navigate, recordBibleBrickBreakerFree]);

  if (showPaywall) {
    return (
      <div className={styles.screen}>
        <div className={styles.paywall}>
          <div className={styles.paywallIconPlaceholder}>{'\u{1F9F1}'}</div>
          <h1 className={styles.paywallTitle}>Unlock Bible Brick Breaker</h1>
          <p className={styles.paywallDesc}>
            Your free play for today is up! Unlock unlimited games.
          </p>
          <p className={styles.paywallPrice}>$2.99</p>
          <a href={STRIPE_BUY_URL} className={styles.paywallBtn}>
            Buy Now
          </a>
          <button
            className={styles.paywallBack}
            onClick={() => navigate('/bible-brick-breaker/home')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div id="bible-brick-breaker-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
