import { GameSplashScreen } from '../components/GameSplashScreen';

export function SplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/logo.png"
      logoAlt="Gosple"
      verseText="Romans 8:28"
      homePath="/gosple/home"
      onboardingPath="/gosple/onboarding"
    />
  );
}
