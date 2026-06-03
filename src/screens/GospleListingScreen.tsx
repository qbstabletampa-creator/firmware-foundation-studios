import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function GospleListingScreen() {
  const game = getGame('gosple');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
