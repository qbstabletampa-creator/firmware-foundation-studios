import { GameSplashScreen } from '../components/GameSplashScreen';

export function BibleBrickBreakerSplashScreen() {
  return (
    <GameSplashScreen
      gameId="bible-brick-breaker"
      logoSrc="/logo.png"
      logoAlt="Firmware Foundation Studios"
      verseText="Romans 8:28"
      homePath="/bible-brick-breaker/home"
      onboardingPath="/bible-brick-breaker/onboarding"
    />
  );
}
