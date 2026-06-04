import { GameSplashScreen } from '../components/GameSplashScreen';

export function MannaCatchSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/manna-catch-icon.png"
      logoAlt="Manna Catch"
      verseText="Exodus 16:15"
      homePath="/manna-catch/home"
      onboardingPath="/manna-catch/onboarding"
    />
  );
}
