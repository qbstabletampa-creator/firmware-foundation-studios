import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function BibleBrickBreakerListingScreen() {
  const game = getGame('bible-brick-breaker');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
