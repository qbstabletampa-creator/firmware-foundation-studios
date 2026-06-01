import { useWindowDimensions } from 'react-native';

const MAX_GAME_WIDTH = 500;
const HUD_HEIGHT = 60;
const BASKET_AREA_HEIGHT = 80;

export function useResponsiveLayout() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const gameWidth = Math.min(screenWidth, MAX_GAME_WIDTH);
  const gameHeight = screenHeight - HUD_HEIGHT;
  const gameOffsetX = (screenWidth - gameWidth) / 2;

  const basketWidth = gameWidth * 0.18;
  const basketHeight = basketWidth * 0.5;
  const basketY = gameHeight - BASKET_AREA_HEIGHT;

  const itemSize = gameWidth * 0.08;

  return {
    screenWidth,
    screenHeight,
    gameWidth,
    gameHeight,
    gameOffsetX,
    basketWidth,
    basketHeight,
    basketY,
    itemSize,
    hudHeight: HUD_HEIGHT,
    isTablet: screenWidth >= 768,
  };
}
