import type { FallingItem } from './types';

// ---------------------------------------------------------------------------
// Axis-Aligned Bounding Box (AABB) collision detection
// ---------------------------------------------------------------------------

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Standard AABB overlap test. Returns true when rectangles `a` and `b`
 * intersect on both axes.
 */
export function checkOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check whether a falling item overlaps the basket.
 *
 * The basket is positioned at the bottom of the screen. `basketY` is the top
 * edge of the basket rectangle and `basketHeight` is its depth (typically a
 * small value so the "catch zone" feels tight).
 */
export function checkItemBasketCollision(
  item: FallingItem,
  basket: { x: number; width: number },
  basketY: number,
  basketHeight: number,
): boolean {
  const itemRect: Rect = {
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
  };

  const basketRect: Rect = {
    x: basket.x,
    y: basketY,
    width: basket.width,
    height: basketHeight,
  };

  return checkOverlap(itemRect, basketRect);
}

/**
 * Returns true when the item's top edge has fallen past the bottom of the
 * visible screen, meaning the player can no longer catch it.
 */
export function isOffScreen(item: FallingItem, screenHeight: number): boolean {
  return item.y > screenHeight;
}
