import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function LightSnakeListingScreen() {
  const game = getGame('light-snake');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
