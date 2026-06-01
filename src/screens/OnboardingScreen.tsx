import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import styles from './OnboardingScreen.module.css';

type ProfileType = 'kid' | 'parent';

export function OnboardingScreen() {
  const navigate = useNavigate();
  const setProfile = useProfileStore((s) => s.setProfile);
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'pick' | 'name'>('pick');

  function handleSelect(type: ProfileType) {
    setSelected(type);
    setStep('name');
  }

  function handleSubmit() {
    if (!selected || !username.trim()) return;
    setProfile(selected, username.trim());
    navigate('/home', { replace: true });
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Welcome to Gosple</h1>

        {step === 'pick' && (
          <motion.div
            className={styles.pickStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className={styles.subtitle}>Who's playing?</p>
            <div className={styles.profileGrid}>
              <button
                className={`${styles.profileCard} ${selected === 'kid' ? styles.selected : ''}`}
                onClick={() => handleSelect('kid')}
              >
                <span className={styles.profileEmoji}>&#x1F476;</span>
                <span className={styles.profileLabel}>I'm a Kid</span>
              </button>
              <button
                className={`${styles.profileCard} ${selected === 'parent' ? styles.selected : ''}`}
                onClick={() => handleSelect('parent')}
              >
                <span className={styles.profileEmoji}>&#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;</span>
                <span className={styles.profileLabel}>I'm a Parent</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div
            className={styles.nameStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className={styles.subtitle}>What should we call you?</p>
            <input
              className={styles.nameInput}
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={20}
              autoFocus
            />
            <div className={styles.actions}>
              <button
                className={styles.backButton}
                onClick={() => { setStep('pick'); setSelected(null); }}
              >
                Back
              </button>
              <button
                className={styles.startButton}
                onClick={handleSubmit}
                disabled={!username.trim()}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
