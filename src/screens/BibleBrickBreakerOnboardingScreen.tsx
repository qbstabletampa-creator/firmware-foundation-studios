import { GameOnboarding } from '../components/GameOnboarding';

export function BibleBrickBreakerOnboardingScreen() {
  return (
    <GameOnboarding
      gameId="bible-brick-breaker"
      gameName="Bible Brick Breaker"
      iconSrc="/bible-brick-breaker-icon.png"
      tagline="Break through to God's Word"
      verse="Philippians 4:13"
      guideSrc="/bible-brick-breaker-icon.png"
      guideText="Break bricks to reveal hidden verses."
      promises={[
        { icon: '🧱', text: 'Break bricks to reveal hidden Bible verses' },
        { icon: '⚡', text: 'Collect power-ups: Wide Paddle, Multi-Ball, Slow Ball' },
        { icon: '🔥', text: 'Build combos and progress through levels' },
      ]}
      gamePath="/bible-brick-breaker/home"
    />
  );
}
