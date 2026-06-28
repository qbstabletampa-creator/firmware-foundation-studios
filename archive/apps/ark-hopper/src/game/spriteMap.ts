// ---------------------------------------------------------------------------
// Ark Hopper -- RN sprite map
//
// Maps each texture key to a bundled PNG via require(). Metro resolves
// require() at build time, so every sprite referenced here is packaged with
// the app. All sprites were flattened into assets/sprites/, so the web paths
// '/sprites/ark-hopper/X.png' and '/sprites/shared/X.png' both resolve to
// '../../assets/sprites/X.png'.
//
// Keys mirror the web spriteMap exactly. The engine emits itemType strings
// (e.g. 'donkeyCart', 'lilyPad', 'star') and per-level animal names
// (e.g. 'Lamb'); use spriteForItemType() and spriteForAnimal() to resolve them
// to the right texture without the caller knowing the key spelling.
// ---------------------------------------------------------------------------

import type { ImageSourcePropType } from 'react-native';

export const SPRITE_MAP: Record<string, ImageSourcePropType> = {
  // Characters (player skins)
  'lamb':           require('../../assets/sprites/lamb.png'),
  'dove':           require('../../assets/sprites/dove.png'),
  'rabbit':         require('../../assets/sprites/rabbit.png'),
  'turtle':         require('../../assets/sprites/turtle.png'),
  'fox':            require('../../assets/sprites/fox.png'),

  // Obstacles
  'sheep':          require('../../assets/sprites/sheep.png'),
  'goat':           require('../../assets/sprites/goat.png'),
  'chicken':        require('../../assets/sprites/chicken.png'),
  'donkey-cart':    require('../../assets/sprites/donkey-cart.png'),

  // Platforms
  'log':            require('../../assets/sprites/log.png'),
  'lily-pad':       require('../../assets/sprites/lily-pad.png'),

  // Collectibles
  'golden-star':    require('../../assets/sprites/star.png'),
  'olive-branch':   require('../../assets/sprites/olive-branch.png'),

  // Goal
  'noahs-ark':      require('../../assets/sprites/noahs-ark.png'),

  // Effects
  'rainbow':        require('../../assets/sprites/rainbow.png'),
  'water-splash':   require('../../assets/sprites/water-splash.png'),
  'rain-cloud':     require('../../assets/sprites/rain-cloud.png'),

  // Decorations
  'grass-tuft':     require('../../assets/sprites/grass-tuft.png'),
  'flower':         require('../../assets/sprites/flower.png'),
  'wheat':          require('../../assets/sprites/wheat.png'),

  // Level animals (shared across games)
  'elephant':       require('../../assets/sprites/elephant.png'),
  'giraffe':        require('../../assets/sprites/giraffe.png'),
  'horse':          require('../../assets/sprites/horse.png'),
  'lion':           require('../../assets/sprites/lion.png'),
  'eagle':          require('../../assets/sprites/eagle.png'),

  // Lane / terrain textures
  'tex-grass':      require('../../assets/sprites/tex-grass.png'),
  'tex-path':       require('../../assets/sprites/tex-path.png'),
  'tex-water':      require('../../assets/sprites/tex-water.png'),
  'lily-pad-deco':  require('../../assets/sprites/lily-pad.png'),
};

// Map engine itemType strings (gameEngine emits these) to SPRITE_MAP keys.
// Mirrors ITEM_TYPE_TO_SPRITE_KEY in the web ArkHopperScene.
const ITEM_TYPE_TO_SPRITE_KEY: Record<string, string> = {
  sheep: 'sheep',
  goat: 'goat',
  chicken: 'chicken',
  donkeyCart: 'donkey-cart',
  log: 'log',
  lilyPad: 'lily-pad',
  star: 'golden-star',
};

/** Resolve a sprite by its raw texture key. */
export function getSprite(key: string): ImageSourcePropType | undefined {
  return SPRITE_MAP[key];
}

/** Resolve the sprite for an engine lane item (by its itemType). */
export function spriteForItemType(itemType: string): ImageSourcePropType | undefined {
  const key = ITEM_TYPE_TO_SPRITE_KEY[itemType] ?? itemType;
  return SPRITE_MAP[key];
}

/** Resolve the sprite for a per-level animal name (e.g. 'Lamb', 'Dove'). */
export function spriteForAnimal(name: string): ImageSourcePropType | undefined {
  return SPRITE_MAP[name.toLowerCase()];
}
