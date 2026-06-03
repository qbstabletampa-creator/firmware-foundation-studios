import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function MannaCatchListingScreen() {
  const game = getGame('manna-catch');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
