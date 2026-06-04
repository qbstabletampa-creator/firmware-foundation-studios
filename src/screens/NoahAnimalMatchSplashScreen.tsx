import { GameSplashScreen } from '../components/GameSplashScreen';

export function NoahAnimalMatchSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/noah-animal-match-icon.png"
      logoAlt="Noah's Animal Match"
      verseText="Genesis 7:9"
      homePath="/noah-animal-match/home"
      onboardingPath="/noah-animal-match/onboarding"
    />
  );
}
