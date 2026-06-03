import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function NoahAnimalMatchListingScreen() {
  const game = getGame('noah-animal-match');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
