import { getGame } from '../data/gameCatalog';
import { GameListingScreen } from './GameListingScreen';

export function ArkHopperListingScreen() {
  const game = getGame('ark-hopper');
  if (!game) return null;
  return <GameListingScreen game={game} />;
}
