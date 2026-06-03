// ---------------------------------------------------------------------------
// Noah's Animal Match -- Sprite map
// Maps texture keys to PNG paths for preloading.
// Animals shared with Ark Hopper use sprites/shared/.
// ---------------------------------------------------------------------------

export const SPRITE_MAP: Record<string, string> = {
  // Card back
  'card-back':      '/sprites/noah-animal-match/card-back.png',

  // Common animals (shared)
  'dove':           '/sprites/shared/dove.png',
  'lamb':           '/sprites/shared/lamb.png',
  'lion':           '/sprites/shared/lion.png',
  'elephant':       '/sprites/shared/elephant.png',
  'giraffe':        '/sprites/shared/giraffe.png',
  'rabbit':         '/sprites/shared/rabbit.png',

  // Forest animals
  'turtle':         '/sprites/shared/turtle.png',
  'butterfly':      '/sprites/noah-animal-match/butterfly.png',
  'bear':           '/sprites/noah-animal-match/bear.png',
  'fox':            '/sprites/shared/fox.png',
  'owl':            '/sprites/noah-animal-match/owl.png',
  'deer':           '/sprites/noah-animal-match/deer.png',

  // Desert
  'camel':          '/sprites/noah-animal-match/camel.png',

  // Plains
  'horse':          '/sprites/shared/horse.png',

  // Exotic
  'peacock':        '/sprites/noah-animal-match/peacock.png',

  // Ocean
  'dolphin':        '/sprites/noah-animal-match/dolphin.png',

  // Sky
  'eagle':          '/sprites/shared/eagle.png',

  // Common (later unlock)
  'rooster':        '/sprites/noah-animal-match/rooster.png',
};
