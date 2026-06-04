import { GameSplashScreen } from '../components/GameSplashScreen';

export function ArkHopperSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/ark-hopper-icon.png"
      logoAlt="Ark Hopper"
      verseText="Genesis 6:14"
      homePath="/ark-hopper/home"
      onboardingPath="/ark-hopper/onboarding"
    />
  );
}
