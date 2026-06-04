import { GameOnboarding } from '../components/GameOnboarding';

export function NoahAnimalMatchOnboardingScreen() {
  return (
    <GameOnboarding
      gameId="noah-animal-match"
      gameName="Noah's Animal Match"
      iconSrc="/noah-animal-match-icon.png"
      tagline="Match animals two by two"
      verse="Genesis 7:9"
      guideSrc="/sprites/noah-animal-match/card-back.png"
      guideText="Match the animals before time runs out!"
      promises={[
        { icon: '🃏', text: 'Flip cards to find pairs' },
        { icon: '⏱️', text: 'Race the clock' },
        { icon: '🦁', text: 'Meet all the animals' },
      ]}
      gamePath="/noah-animal-match/home"
    />
  );
}
