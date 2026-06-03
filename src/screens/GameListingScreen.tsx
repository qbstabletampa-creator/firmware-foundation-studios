import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { GameEntry } from '../data/gameCatalog';
import styles from './GameListingScreen.module.css';

interface GameListingProps {
  game: GameEntry;
}

export function GameListingScreen({ game }: GameListingProps) {
  const navigate = useNavigate();
  const released = game.status === 'released';
  const hasScreenshots = game.screenshots.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          &larr;
        </button>
        <div className={styles.headerCenter}>
          {game.icon ? (
            <img src={game.icon} alt={game.title} className={styles.headerIcon} />
          ) : (
            <span className={styles.headerEmoji}>{game.accentEmoji}</span>
          )}
          <div>
            <p className={styles.headerTitle}>{game.title}</p>
            <p className={styles.headerStudio}>Firmware Foundation Studios</p>
          </div>
        </div>
        {released && <span className={styles.headerPrice}>{game.price}</span>}
      </header>

      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.heroContent}
        >
          {game.icon ? (
            <img src={game.icon} alt={game.title} className={styles.heroIcon} />
          ) : (
            <div className={styles.heroEmoji}>{game.accentEmoji}</div>
          )}
          <h1 className={styles.heroTitle}>{game.title}</h1>
          <p className={styles.heroTagline}>{game.tagline}</p>
          <span className={released ? styles.statusReleased : styles.statusComingSoon}>
            {released ? 'Released' : 'Coming Soon'}
          </span>
          {released ? (
            <Link to={game.appRoute} className={styles.ctaPrimary}>
              Play Now
            </Link>
          ) : (
            <span className={styles.ctaDisabled}>Coming Soon</span>
          )}
          {released && game.stripeUrl && (
            <a
              href={game.stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              Buy Full Game &ndash; {game.price}
            </a>
          )}
        </motion.div>
      </section>

      {hasScreenshots && (
        <section className={styles.screenshots}>
          <div className={styles.screenshotScroll}>
            {game.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${game.title} screenshot ${i + 1}`}
                className={styles.screenshotImg}
              />
            ))}
          </div>
        </section>
      )}

      <section className={styles.description}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>About This Game</h2>
          <p className={styles.descText}>{game.description}</p>
          {game.features.length > 0 && (
            <ul className={styles.features}>
              {game.features.map((f, i) => (
                <li key={i} className={styles.featureItem}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={styles.info}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Category</span>
              <span className={styles.infoValue}>{game.category}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Age Rating</span>
              <span className={styles.infoValue}>{game.ageRating}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Price</span>
              <span className={styles.infoValue}>{game.price || 'Free'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Platform</span>
              <span className={styles.infoValue}>Web Browser</span>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerText}>Firmware Foundation Studios</p>
        <Link to="/gosple/privacy" className={styles.footerLink}>Privacy Policy</Link>
      </footer>
    </div>
  );
}
