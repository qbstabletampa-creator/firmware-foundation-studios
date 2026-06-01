import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { createGospleConfig } from '../games/gosple/config';
import { useStreakStore } from '../stores/streakStore';
import styles from './GospleScreen.module.css';

export function GospleScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();
  const recordPlay = useStreakStore((s) => s.recordPlay);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGospleConfig('gosple-game');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('gosple:complete', (data: { won: boolean; attempts: number }) => {
      recordPlay(data.won);
      navigate('/gosple/home');
    });

    return () => {
      game.events.off('gosple:complete');
      game.destroy(true);
      gameRef.current = null;
    };
  }, [navigate, recordPlay]);

  return (
    <div className={styles.screen}>
      <div id="gosple-game" ref={containerRef} className={styles.gameContainer} />
    </div>
  );
}
