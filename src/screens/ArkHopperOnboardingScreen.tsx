import { GameOnboarding } from '../components/GameOnboarding';

export function ArkHopperOnboardingScreen() {
  return (
    <GameOnboarding
      gameId="ark-hopper"
      gameName="Ark Hopper"
      iconSrc="/ark-hopper-icon.png"
      tagline="Help them reach the Ark!"
      verse="Genesis 6:14"
      guideSrc="/sprites/shared/lamb.png"
      guideText="Guide the animals to safety!"
      promises={[
        { icon: '🐑', text: 'Hop across rivers and paths' },
        { icon: '⭐', text: 'Collect stars along the way' },
        { icon: '🚢', text: "Reach Noah's Ark" },
      ]}
      gamePath="/ark-hopper/home"
    />
  );
}
