import { GameSplashScreen } from '../components/GameSplashScreen';

export function MannaCatchSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/logo.png"
      logoAlt="Firmware Foundation Studios"
      verseText="Romans 8:28"
      homePath="/manna-catch/home"
      onboardingPath="/manna-catch/onboarding"
    />
  );
}
