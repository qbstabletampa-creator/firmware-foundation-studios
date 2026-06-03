// ---------------------------------------------------------------------------
// Ark Hopper -- Sprite map
// Maps texture keys to PNG paths for preloading.
// Shared sprites (animals that appear in multiple games) use sprites/shared/.
// ---------------------------------------------------------------------------

export const SPRITE_MAP: Record<string, string> = {
  // Characters (player skins)
  'lamb':           '/sprites/shared/lamb.png',
  'dove':           '/sprites/shared/dove.png',
  'rabbit':         '/sprites/shared/rabbit.png',
  'turtle':         '/sprites/shared/turtle.png',
  'fox':            '/sprites/shared/fox.png',

  // Obstacles
  'sheep':          '/sprites/ark-hopper/sheep.png',
  'goat':           '/sprites/ark-hopper/goat.png',
  'chicken':        '/sprites/ark-hopper/chicken.png',
  'donkey-cart':    '/sprites/ark-hopper/donkey-cart.png',

  // Platforms
  'log':            '/sprites/ark-hopper/log.png',
  'lily-pad':       '/sprites/ark-hopper/lily-pad.png',

  // Collectibles
  'golden-star':    '/sprites/shared/star.png',
  'olive-branch':   '/sprites/ark-hopper/olive-branch.png',

  // Goal
  'noahs-ark':      '/sprites/ark-hopper/noahs-ark.png',

  // Effects
  'rainbow':        '/sprites/ark-hopper/rainbow.png',
  'water-splash':   '/sprites/ark-hopper/water-splash.png',
  'rain-cloud':     '/sprites/ark-hopper/rain-cloud.png',

  // Decorations
  'grass-tuft':     '/sprites/ark-hopper/grass-tuft.png',
  'flower':         '/sprites/ark-hopper/flower.png',
  'wheat':          '/sprites/ark-hopper/wheat.png',

  // Level animals (shared across games)
  'elephant':       '/sprites/shared/elephant.png',
  'giraffe':        '/sprites/shared/giraffe.png',
  'horse':          '/sprites/shared/horse.png',
  'lion':           '/sprites/shared/lion.png',
  'eagle':          '/sprites/shared/eagle.png',
};
