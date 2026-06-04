// ---------------------------------------------------------------------------
// Light Snake -- Sprite map
// Maps texture keys to PNG paths and emoji fallbacks for preloading.
// ---------------------------------------------------------------------------

export type SpriteEntry = {
  path: string;
  emoji: string;
};

export const SPRITE_MAP: Record<string, SpriteEntry> = {
  'lantern':      { path: '/sprites/light-snake/lantern.png',      emoji: '🔦' },
  'light-trail':  { path: '/sprites/light-snake/light-trail.png',  emoji: '✨' },
  'bread':        { path: '/sprites/light-snake/bread.png',        emoji: '🍞' },
  'fish':         { path: '/sprites/light-snake/fish.png',         emoji: '🐟' },
  'lamp':         { path: '/sprites/light-snake/lamp.png',         emoji: '🪔' },
  'thorn':        { path: '/sprites/light-snake/thorn.png',        emoji: '🌿' },
};
