// ---------------------------------------------------------------------------
// Noah's Animal Match -- RN sprite map
//
// Maps each animal name (as produced by the engine, e.g. "Dove") to a bundled
// PNG via require(). Metro resolves require() at build time, so every sprite
// referenced here is packaged with the app. Lookups are by lowercased name.
// ---------------------------------------------------------------------------

import type { ImageSourcePropType } from 'react-native';

export const CARD_BACK: ImageSourcePropType = require('../../assets/sprites/card-back.png');
export const BG_WORLD: ImageSourcePropType = require('../../assets/sprites/bg-world.png');

const ANIMAL_SPRITES: Record<string, ImageSourcePropType> = {
  dove: require('../../assets/sprites/dove.png'),
  lamb: require('../../assets/sprites/lamb.png'),
  lion: require('../../assets/sprites/lion.png'),
  elephant: require('../../assets/sprites/elephant.png'),
  giraffe: require('../../assets/sprites/giraffe.png'),
  rabbit: require('../../assets/sprites/rabbit.png'),
  turtle: require('../../assets/sprites/turtle.png'),
  butterfly: require('../../assets/sprites/butterfly.png'),
  camel: require('../../assets/sprites/camel.png'),
  horse: require('../../assets/sprites/horse.png'),
  bear: require('../../assets/sprites/bear.png'),
  fox: require('../../assets/sprites/fox.png'),
  owl: require('../../assets/sprites/owl.png'),
  peacock: require('../../assets/sprites/peacock.png'),
  deer: require('../../assets/sprites/deer.png'),
  dolphin: require('../../assets/sprites/dolphin.png'),
  eagle: require('../../assets/sprites/eagle.png'),
  rooster: require('../../assets/sprites/rooster.png'),
};

/**
 * Resolve the sprite for an animal by name. Returns undefined if no sprite is
 * bundled for that name, so the renderer can fall back to the emoji.
 */
export function spriteForAnimal(name: string): ImageSourcePropType | undefined {
  return ANIMAL_SPRITES[name.toLowerCase()];
}
