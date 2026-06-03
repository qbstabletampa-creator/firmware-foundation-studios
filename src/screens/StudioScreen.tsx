import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { games } from '../data/gameCatalog';
import { GameCard } from '../components/GameCard';
import styles from './StudioScreen.module.css';

export function StudioScreen() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <motion.img
          src="/logo.png"
          alt="Firmware Foundation Studios"
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.p
          className={styles.studioName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Firmware Foundation Studios
        </motion.p>
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          Faith-filled games for the whole family
        </motion.p>
      </section>

      <section className={styles.gamesSection}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Our Games</h2>
          <div className={styles.grid}>
            {games.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.inner}>
          <p className={styles.aboutText}>
            Safe, joyful games rooted in Scripture. Every game we build is designed to spark curiosity about God's Word and bring families closer together.
          </p>
          <p className={styles.aboutText}>
            10% of every purchase supports missions and Christian education.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <p className={styles.footerText}>The QB Stable LLC, Tampa, FL</p>
          <Link to="/gosple/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <p className={styles.copyright}>&copy; 2026 Firmware Foundation Studios</p>
        </div>
      </footer>
    </div>
  );
}
