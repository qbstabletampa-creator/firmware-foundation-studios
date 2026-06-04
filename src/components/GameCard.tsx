import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { GameEntry } from '../data/gameCatalog';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: GameEntry;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  const released = game.status === 'released';

  return (
    <motion.div
      className={`${styles.card} ${released ? '' : styles.comingSoon}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
      whileTap={{ scale: 0.95 }}
    >
      {game.icon ? (
        <img className={styles.icon} src={game.icon} alt={game.title} />
      ) : (
        <div className={styles.emojiFallback}>{game.accentEmoji}</div>
      )}

      <div className={styles.info}>
        <p className={styles.title}>{game.title}</p>
        <p className={styles.tagline}>{game.tagline}</p>
        <div className={styles.meta}>
          <span
            className={`${styles.badge} ${
              released ? styles.badgeReleased : styles.badgeComingSoon
            }`}
          >
            {released ? 'Released' : 'Coming Soon'}
          </span>
          {released && (
            <Link className={styles.cta} to={game.route}>
              View Game
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
