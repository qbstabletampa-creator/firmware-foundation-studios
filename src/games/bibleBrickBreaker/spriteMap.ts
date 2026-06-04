// ---------------------------------------------------------------------------
// Bible Brick Breaker -- Sprite map
// Maps texture keys to PNG paths and emoji fallbacks for preloading.
// ---------------------------------------------------------------------------

export interface SpriteEntry {
  path: string;
  emoji: string;
}

export const SPRITE_MAP: Record<string, SpriteEntry> = {
  'paddle':        { path: '/sprites/bible-brick-breaker/paddle.png',       emoji: '\u{1F7E8}' },
  'ball':          { path: '/sprites/bible-brick-breaker/ball.png',         emoji: '⚪' },
  'brick-clay':    { path: '/sprites/bible-brick-breaker/brick-clay.png',   emoji: '\u{1F9F1}' },
  'brick-stone':   { path: '/sprites/bible-brick-breaker/brick-stone.png',  emoji: '\u{1FAA8}' },
  'brick-gold':    { path: '/sprites/bible-brick-breaker/brick-gold.png',   emoji: '✨' },
  'powerup-wide':  { path: '/sprites/bible-brick-breaker/powerup-wide.png', emoji: '↔️' },
  'powerup-multi': { path: '/sprites/bible-brick-breaker/powerup-multi.png', emoji: '\u{1F52E}' },
  'powerup-slow':  { path: '/sprites/bible-brick-breaker/powerup-slow.png', emoji: '⏳' },
  'heart':         { path: '/sprites/bible-brick-breaker/heart.png',        emoji: '❤️' },
  'star':          { path: '/sprites/bible-brick-breaker/star.png',         emoji: '⭐' },
};
