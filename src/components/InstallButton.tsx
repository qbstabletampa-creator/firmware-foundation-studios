import { useEffect, useState } from 'react';
import styles from './InstallButton.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function InstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (standalone) return;

    if (ios) {
      setIsIOS(true);
      setCanInstall(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
    deferredPrompt = null;
  }

  if (!canInstall) return null;

  return (
    <>
      <button className={styles.installBtn} onClick={handleInstall}>
        Add to Home Screen
      </button>
      {showIOSGuide && (
        <div className={styles.iosOverlay} onClick={() => setShowIOSGuide(false)}>
          <div className={styles.iosCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.iosTitle}>Add to Home Screen</p>
            <p className={styles.iosStep}>1. Tap the Share button (box with arrow)</p>
            <p className={styles.iosStep}>2. Scroll down and tap "Add to Home Screen"</p>
            <p className={styles.iosStep}>3. Tap "Add"</p>
            <button className={styles.iosClose} onClick={() => setShowIOSGuide(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
