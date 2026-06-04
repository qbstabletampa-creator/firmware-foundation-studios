import { GameSplashScreen } from '../components/GameSplashScreen';

export function ArkHopperSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/logo.png"
      logoAlt="Firmware Foundation Studios"
      verseText="Romans 8:28"
      homePath="/ark-hopper/home"
      onboardingPath="/ark-hopper/onboarding"
    />
  );
}
