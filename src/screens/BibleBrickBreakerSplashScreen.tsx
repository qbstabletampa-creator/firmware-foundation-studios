import { GameSplashScreen } from '../components/GameSplashScreen';

export function BibleBrickBreakerSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/bible-brick-breaker-icon.png"
      logoAlt="Bible Brick Breaker"
      verseText="Philippians 4:13"
      homePath="/bible-brick-breaker/home"
      onboardingPath="/bible-brick-breaker/onboarding"
    />
  );
}
