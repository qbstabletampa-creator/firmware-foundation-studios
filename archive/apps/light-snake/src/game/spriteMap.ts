// ---------------------------------------------------------------------------
// Light Snake -- RN sprite map
//
// Maps each game element to a bundled PNG via require(). Metro resolves
// require() at build time, so every sprite referenced here is packaged with
// the app. The engine carries an emoji on each food item, so the renderer can
// always fall back to emoji if a sprite ever fails to load.
// ---------------------------------------------------------------------------

import type { ImageSourcePropType } from 'react-native';
import type { FoodItem } from './gameEngine';

export const LANTERN: ImageSourcePropType = require('../../assets/sprites/lantern.png');
export const LIGHT_TRAIL: ImageSourcePropType = require('../../assets/sprites/light-trail.png');
// Shepherd's Trail: the head is the shepherd, each trailing segment is a glowing sheep.
export const SHEPHERD: ImageSourcePropType = require('../../assets/sprites/shepherd.png');
export const SHEEP: ImageSourcePropType = require('../../assets/sprites/sheep.png');
export const THORN: ImageSourcePropType = require('../../assets/sprites/thorn.png');
export const BG_NIGHT: ImageSourcePropType = require('../../assets/sprites/bg-night.png');

const FOOD_SPRITES: Record<FoodItem['type'], ImageSourcePropType> = {
  bread: require('../../assets/sprites/bread.png'),
  fish: require('../../assets/sprites/fish.png'),
  lamp: require('../../assets/sprites/lamp.png'),
};

/** Resolve the sprite for a food type. Always defined for the 3 known types. */
export function spriteForFood(type: FoodItem['type']): ImageSourcePropType {
  return FOOD_SPRITES[type];
}
