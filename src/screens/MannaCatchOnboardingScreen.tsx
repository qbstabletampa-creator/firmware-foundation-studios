import { GameOnboarding } from '../components/GameOnboarding';

export function MannaCatchOnboardingScreen() {
  return (
    <GameOnboarding
      gameName="Manna Catch"
      iconSrc="/manna-catch-icon.png"
      tagline="Catch the blessings from heaven"
      verse="Exodus 16:15"
      guideSrc="/sprites/manna-catch/basket.png"
      guideText="Catch manna from heaven!"
      promises={[
        { icon: '🧺', text: 'Catch holy food from the sky' },
        { icon: '🌿', text: 'Dodge thorns and dangers' },
        { icon: '📜', text: 'Unlock Bible verses' },
      ]}
      gamePath="/manna-catch/home"
    />
  );
}
