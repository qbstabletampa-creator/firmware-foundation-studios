import { GameOnboarding } from '../components/GameOnboarding';

export function OnboardingScreen() {
  return (
    <GameOnboarding
      gameName="Gosple"
      iconSrc="/gosple-icon.png"
      tagline="A daily Bible word puzzle"
      verse="Romans 8:28"
      guideSrc="/gosple-icon.png"
      guideText="Solve puzzles. Discover verses."
      promises={[
        { icon: '✏️', text: 'Solve a daily word puzzle' },
        { icon: '📖', text: 'Discover Bible verses' },
        { icon: '🔥', text: 'Build your streak' },
      ]}
      gamePath="/gosple/home"
    />
  );
}
