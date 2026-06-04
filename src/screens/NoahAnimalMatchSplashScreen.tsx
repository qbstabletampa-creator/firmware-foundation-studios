import { GameSplashScreen } from '../components/GameSplashScreen';

export function NoahAnimalMatchSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/logo.png"
      logoAlt="Firmware Foundation Studios"
      verseText="Romans 8:28"
      homePath="/noah-animal-match/home"
      onboardingPath="/noah-animal-match/onboarding"
    />
  );
}
