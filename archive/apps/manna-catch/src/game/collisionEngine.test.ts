import { describe, it, expect } from 'vitest';
import {
  checkOverlap,
  checkItemBasketCollision,
  isOffScreen,
} from './collisionEngine';
import type { Rect } from './collisionEngine';
import type { FallingItem } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

function makeFallingItem(overrides: Partial<FallingItem> = {}): FallingItem {
  return {
    id: 'test_item',
    type: 'manna',
    category: 'good',
    x: 0,
    y: 0,
    speed: 120,
    width: 32,
    height: 32,
    points: 5,
    icon: '🍞',
    rotation: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// checkOverlap (AABB)
// ---------------------------------------------------------------------------

describe('checkOverlap', () => {
  it('two overlapping rects return true', () => {
    const a = makeRect(0, 0, 50, 50);
    const b = makeRect(25, 25, 50, 50);
    expect(checkOverlap(a, b)).toBe(true);
  });

  it('two non-overlapping rects return false', () => {
    const a = makeRect(0, 0, 50, 50);
    const b = makeRect(100, 100, 50, 50);
    expect(checkOverlap(a, b)).toBe(false);
  });

  it('edge-touching rects (sharing a boundary) return false', () => {
    // a ends at x=50, b starts at x=50. They share the edge but do not overlap.
    const a = makeRect(0, 0, 50, 50);
    const b = makeRect(50, 0, 50, 50);
    expect(checkOverlap(a, b)).toBe(false);

    // Vertical edge touch: a ends at y=50, b starts at y=50.
    const c = makeRect(0, 0, 50, 50);
    const d = makeRect(0, 50, 50, 50);
    expect(checkOverlap(c, d)).toBe(false);
  });

  it('one rect inside another returns true', () => {
    const outer = makeRect(0, 0, 100, 100);
    const inner = makeRect(20, 20, 10, 10);
    expect(checkOverlap(outer, inner)).toBe(true);
    // Reverse order should also be true.
    expect(checkOverlap(inner, outer)).toBe(true);
  });

  it('partial horizontal overlap returns true', () => {
    const a = makeRect(0, 0, 50, 50);
    const b = makeRect(49, 0, 50, 50); // overlaps by 1px on x
    expect(checkOverlap(a, b)).toBe(true);
  });

  it('partial vertical overlap returns true', () => {
    const a = makeRect(0, 0, 50, 50);
    const b = makeRect(0, 49, 50, 50); // overlaps by 1px on y
    expect(checkOverlap(a, b)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkItemBasketCollision
// ---------------------------------------------------------------------------

describe('checkItemBasketCollision', () => {
  const basket = { x: 40, width: 72 }; // basket spans x: 40..112
  const basketY = 700;
  const basketHeight = 20;

  it('item hitting basket returns true', () => {
    // Item at x=50, y=705 with width=32, height=32.
    // Item rect: 50..82 on x, 705..737 on y.
    // Basket rect: 40..112 on x, 700..720 on y.
    // Both axes overlap.
    const item = makeFallingItem({ x: 50, y: 705 });
    expect(checkItemBasketCollision(item, basket, basketY, basketHeight)).toBe(true);
  });

  it('item above basket returns false', () => {
    // Item y+height must be <= basketY to be fully above.
    // item.y = 600, height = 32, so bottom edge is 632, well above basketY = 700.
    const item = makeFallingItem({ x: 50, y: 600 });
    expect(checkItemBasketCollision(item, basket, basketY, basketHeight)).toBe(false);
  });

  it('item to the left of basket returns false', () => {
    // Item x=0, width=32 ends at x=32. Basket starts at x=40. No x overlap.
    const item = makeFallingItem({ x: 0, y: 705, width: 32 });
    expect(checkItemBasketCollision(item, basket, basketY, basketHeight)).toBe(false);
  });

  it('item to the right of basket returns false', () => {
    // Basket ends at x=112. Item starts at x=120. No x overlap.
    const item = makeFallingItem({ x: 120, y: 705 });
    expect(checkItemBasketCollision(item, basket, basketY, basketHeight)).toBe(false);
  });

  it('item below basket returns false', () => {
    // basketY + basketHeight = 720. Item starts at y=720, so edge-touching only.
    const item = makeFallingItem({ x: 50, y: 720 });
    expect(checkItemBasketCollision(item, basket, basketY, basketHeight)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isOffScreen
// ---------------------------------------------------------------------------

describe('isOffScreen', () => {
  const screenHeight = 800;

  it('item below screen height returns true', () => {
    const item = makeFallingItem({ y: 810 });
    expect(isOffScreen(item, screenHeight)).toBe(true);
  });

  it('item exactly at screen height boundary returns false', () => {
    // y === screenHeight is not strictly greater, so it is edge-case.
    // The implementation uses item.y > screenHeight, so y=800 is false.
    const item = makeFallingItem({ y: 800 });
    expect(isOffScreen(item, screenHeight)).toBe(false);
  });

  it('item still visible returns false', () => {
    const item = makeFallingItem({ y: 400 });
    expect(isOffScreen(item, screenHeight)).toBe(false);
  });

  it('item at top of screen (negative y) returns false', () => {
    const item = makeFallingItem({ y: -32 });
    expect(isOffScreen(item, screenHeight)).toBe(false);
  });
});
