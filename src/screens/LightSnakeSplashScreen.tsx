import { GameSplashScreen } from '../components/GameSplashScreen';

export function LightSnakeSplashScreen() {
  return (
    <GameSplashScreen
      logoSrc="/light-snake-icon.png"
      logoAlt="Light Snake"
      verseText="Psalm 119:105"
      homePath="/light-snake/home"
      onboardingPath="/light-snake/onboarding"
    />
  );
}
