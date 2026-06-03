import styles from './MannaCatchHowToPlayScreen.module.css';

const goodItems = [
  { icon: '🍞', name: 'Manna', points: 5 },
  { icon: '🍯', name: 'Honey', points: 10 },
  { icon: '🍇', name: 'Grapes', points: 8 },
  { icon: '🍎', name: 'Pomegranate', points: 12 },
  { icon: '🫒', name: 'Figs', points: 8 },
  { icon: '⭐', name: 'Star', points: 20 },
  { icon: '📜', name: 'Scroll', points: 15 },
];

const badItems = [
  { icon: '🌵', name: 'Thorn' },
  { icon: '🪨', name: 'Stone' },
  { icon: '🐍', name: 'Snake' },
];

const powerUps = [
  { icon: '🧺', name: 'Wide Basket', desc: 'Makes your basket wider' },
  { icon: '🐢', name: 'Slow Motion', desc: 'Slows everything down' },
  { icon: '🧲', name: 'Magnet', desc: 'Pulls good items toward you' },
];

interface Props {
  onDismiss: () => void;
}

export function MannaCatchHowToPlayScreen({ onDismiss }: Props) {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className={styles.title}>How to Play</h1>
        <p className={styles.subtitle}>Catch the blessings, dodge the danger</p>

        <h2 className={styles.sectionHeaderGreen}>CATCH THESE</h2>
        <div className={styles.grid}>
          {goodItems.map((item) => (
            <div key={item.name} className={styles.card}>
              <span className={styles.cardIcon}>{item.icon}</span>
              <span className={styles.cardName}>{item.name}</span>
              <span className={styles.cardPoints}>+{item.points}</span>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionHeaderRed}>DODGE THESE</h2>
        <div className={styles.grid}>
          {badItems.map((item) => (
            <div key={item.name} className={styles.card}>
              <span className={styles.cardIcon}>{item.icon}</span>
              <span className={styles.cardName}>{item.name}</span>
              <span className={styles.cardDanger}>Lose a life!</span>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionHeaderGold}>POWER-UPS</h2>
        <div className={styles.powerUpList}>
          {powerUps.map((pu) => (
            <div key={pu.name} className={styles.powerUpRow}>
              <span className={styles.powerUpIcon}>{pu.icon}</span>
              <div className={styles.powerUpInfo}>
                <span className={styles.powerUpName}>{pu.name}</span>
                <span className={styles.powerUpDesc}>{pu.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.playBtn} onClick={onDismiss}>
          Got it, let's play!
        </button>
        <p className={styles.hint}>You can revisit this from the More menu</p>
      </div>
    </div>
  );
}
