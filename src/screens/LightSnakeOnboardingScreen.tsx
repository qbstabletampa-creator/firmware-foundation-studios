import { GameOnboarding } from '../components/GameOnboarding';

export function LightSnakeOnboardingScreen() {
  return (
    <GameOnboarding
      gameName="Light Snake"
      iconSrc="/light-snake-icon.png"
      tagline="Guide the light through darkness"
      verse="Psalm 119:105"
      guideSrc="/light-snake-icon.png"
      guideText="Eat to grow. Avoid the thorns."
      promises={[
        { icon: '🔦', text: 'Guide the light through darkness' },
        { icon: '🍞', text: 'Eat bread, fish, and lamps to grow' },
        { icon: '🌿', text: 'Dodge thorns along the path' },
      ]}
      gamePath="/light-snake/home"
    />
  );
}
