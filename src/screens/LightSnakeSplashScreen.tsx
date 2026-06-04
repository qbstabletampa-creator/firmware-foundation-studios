import { GameSplashScreen } from '../components/GameSplashScreen';

export function LightSnakeSplashScreen() {
  return (
    <GameSplashScreen
      gameId="light-snake"
      logoSrc="/logo.png"
      logoAlt="Firmware Foundation Studios"
      verseText="Romans 8:28"
      homePath="/light-snake/home"
      onboardingPath="/light-snake/onboarding"
    />
  );
}
