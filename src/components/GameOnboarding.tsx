import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import { SharedSFX } from '../utils/soundEngine';
import styles from './GameOnboarding.module.css';

type ProfileType = 'kid' | 'parent';

interface PromiseBullet {
  icon: string;
  text: string;
}

interface GameOnboardingConfig {
  gameId: string;
  gameName: string;
  iconSrc: string;
  tagline: string;
  verse: string;
  guideSrc: string;
  guideText: string;
  promises: [PromiseBullet, PromiseBullet, PromiseBullet];
  gamePath: string;
}

const ALL_STEPS = ['opener', 'guide', 'promise', 'profile', 'reward', 'streak', 'play'] as const;
type Step = typeof ALL_STEPS[number];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export function GameOnboarding({ gameId, gameName, iconSrc, tagline, verse, guideSrc, guideText, promises, gamePath }: GameOnboardingConfig) {
  const navigate = useNavigate();
  const { setProfile, markGameOnboarded, onboarded, username: existingName, profileType: existingType } = useProfileStore();

  const hasProfile = onboarded && !!existingName;
  const STEPS = hasProfile
    ? ALL_STEPS.filter(s => s !== 'profile' && s !== 'reward')
    : ALL_STEPS;

  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<ProfileType | null>(existingType || null);
  const [username, setUsername] = useState(existingName || '');

  const step: Step = STEPS[stepIdx];
  const isLastContentStep = stepIdx === STEPS.length - 1;

  function next() {
    if (isLastContentStep) {
      markGameOnboarded(gameId);
      navigate(gamePath, { replace: true });
      return;
    }
    setStepIdx((i) => i + 1);
  }

  function handleProfileSelect(type: ProfileType) {
    setSelected(type);
  }

  function handleProfileSubmit() {
    if (!selected || !username.trim()) return;
    setProfile(selected, username.trim());
    markGameOnboarded(gameId);
    SharedSFX.milestone();
    next();
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {step === 'opener' && (
          <motion.div
            key="opener"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { SharedSFX.buttonTap(); next(); }}
          >
            <motion.img
              src={iconSrc}
              alt={gameName}
              className={styles.openerIcon}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
            />
            <motion.h1
              className={styles.openerTagline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {tagline}
            </motion.h1>
            <motion.p
              className={styles.openerVerse}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              {verse}
            </motion.p>
            <motion.p
              className={styles.tapHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}

        {step === 'guide' && (
          <motion.div
            key="guide"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { SharedSFX.buttonTap(); next(); }}
          >
            <motion.img
              src={guideSrc}
              alt={gameName}
              className={styles.guideSprite}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.4 },
                y: { delay: 0.4, duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
            <motion.p
              className={styles.guideText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {guideText}
            </motion.p>
            <motion.p
              className={styles.tapHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}

        {step === 'promise' && (
          <motion.div
            key="promise"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { SharedSFX.buttonTap(); next(); }}
          >
            <motion.h2
              className={styles.promiseTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Here's what you'll do:
            </motion.h2>
            <div className={styles.promiseList}>
              {promises.map((p, i) => (
                <motion.div
                  key={i}
                  className={styles.promiseItem}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.2, duration: 0.4 }}
                >
                  <span className={styles.promiseIcon}>{p.icon}</span>
                  <span className={styles.promiseText}>{p.text}</span>
                </motion.div>
              ))}
            </div>
            <motion.p
              className={styles.tapHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}

        {step === 'profile' && (
          <motion.div
            key="profile"
            className={styles.profileScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={styles.profileTitle}>Who's playing?</h2>
            {!selected ? (
              <div className={styles.profileGrid}>
                <button
                  className={styles.profileCard}
                  onClick={() => { SharedSFX.buttonTap(); handleProfileSelect('kid'); }}
                >
                  <span className={styles.profileEmoji}>{'\u{1F476}'}</span>
                  <span className={styles.profileLabel}>I'm a Kid</span>
                </button>
                <button
                  className={styles.profileCard}
                  onClick={() => { SharedSFX.buttonTap(); handleProfileSelect('parent'); }}
                >
                  <span className={styles.profileEmoji}>{'\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}'}</span>
                  <span className={styles.profileLabel}>I'm a Parent</span>
                </button>
              </div>
            ) : (
              <motion.div
                className={styles.nameStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className={styles.namePrompt}>What should we call you?</p>
                <input
                  className={styles.nameInput}
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProfileSubmit()}
                  maxLength={20}
                  autoFocus
                />
                <div className={styles.nameActions}>
                  <button
                    className={styles.backButton}
                    onClick={() => { setSelected(null); }}
                  >
                    Back
                  </button>
                  <button
                    className={styles.nextButton}
                    onClick={handleProfileSubmit}
                    disabled={!username.trim()}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'reward' && (
          <motion.div
            key="reward"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { SharedSFX.buttonTap(); next(); }}
          >
            <motion.div
              className={styles.rewardStar}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8, times: [0, 0.6, 1] }}
            >
              {'⭐'}
            </motion.div>
            <motion.h1
              className={styles.rewardTitle}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
            >
              Welcome, {username || 'Player'}!
            </motion.h1>
            <motion.p
              className={styles.rewardSub}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              You're all set. Let's go!
            </motion.p>
          </motion.div>
        )}

        {step === 'streak' && (
          <motion.div
            key="streak"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { SharedSFX.buttonTap(); next(); }}
          >
            <motion.h2
              className={styles.streakTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Build your streak!
            </motion.h2>
            <motion.p
              className={styles.streakSub}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Play every day to keep it going
            </motion.p>
            <div className={styles.streakRow}>
              {DAYS.map((day, i) => {
                const isToday = i === getTodayIndex();
                return (
                  <motion.div
                    key={day}
                    className={`${styles.streakDay} ${isToday ? styles.streakToday : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                  >
                    <span className={styles.streakLabel}>{day}</span>
                    <span className={styles.streakDot}>{isToday ? '⭐' : '○'}</span>
                  </motion.div>
                );
              })}
            </div>
            <motion.p
              className={styles.tapHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}

        {step === 'play' && (
          <motion.div
            key="play"
            className={styles.fullScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.img
              src={iconSrc}
              alt={gameName}
              className={styles.playIcon}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            <motion.button
              className={styles.playButton}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [1, 1.03, 1] }}
              transition={{
                opacity: { delay: 0.4, duration: 0.4 },
                scale: { delay: 0.8, duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                SharedSFX.countdownGo();
                markGameOnboarded(gameId);
                navigate(gamePath, { replace: true });
              }}
            >
              LET'S PLAY!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
