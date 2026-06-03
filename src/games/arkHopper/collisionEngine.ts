import type { Lane, LaneItem } from './types';
import { GAME_CONSTANTS } from './itemConfig';

// ---------------------------------------------------------------------------
// Coordinate helpers
// ---------------------------------------------------------------------------

/**
 * Convert a grid cell (col, row) to pixel coordinates.
 * Returns the center point of that cell.
 */
export function getCellPixelPos(
  col: number,
  row: number,
  gameWidth: number,
  gameHeight: number,
  totalRows: number,
  totalCols: number,
): { x: number; y: number } {
  const cellW = gameWidth / totalCols;
  const cellH = gameHeight / totalRows;
  return {
    x: col * cellW + cellW / 2,
    y: row * cellH + cellH / 2,
  };
}

/**
 * Get the width of a single cell in pixels.
 */
export function getCellWidth(gameWidth: number, totalCols: number): number {
  return gameWidth / totalCols;
}

/**
 * Get the height of a single cell in pixels.
 */
export function getCellHeight(gameHeight: number, totalRows: number): number {
  return gameHeight / totalRows;
}

// ---------------------------------------------------------------------------
// Platform collision (water lanes)
// ---------------------------------------------------------------------------

/**
 * Check if the player's center x overlaps any platform item on a lane.
 * Returns the first overlapping platform, or null if none found.
 *
 * Uses the player's cell center point against each platform's bounding box.
 * The threshold is forgiving (COLLISION_THRESHOLD of cell width).
 */
export function checkPlayerOnPlatform(
  playerCenterX: number,
  cellWidth: number,
  lane: Lane,
): LaneItem | null {
  const pad = cellWidth * 0.15;
  for (const item of lane.items) {
    if (item.itemType !== 'log' && item.itemType !== 'lilyPad') continue;

    const itemLeft = item.x - pad;
    const itemRight = item.x + item.width + pad;

    if (playerCenterX >= itemLeft && playerCenterX <= itemRight) {
      return item;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Obstacle collision (path lanes)
// ---------------------------------------------------------------------------

/**
 * Check if the player's bounding box overlaps any obstacle on a path lane.
 *
 * Uses overlap threshold: 60% of cell width means the obstacle must intrude
 * into 60% of the player's cell center area to trigger a hit. This is
 * forgiving for young players.
 */
export function checkPlayerHitObstacle(
  playerCenterX: number,
  cellWidth: number,
  lane: Lane,
): boolean {
  const threshold = cellWidth * GAME_CONSTANTS.COLLISION_THRESHOLD;
  const playerLeft = playerCenterX - threshold / 2;
  const playerRight = playerCenterX + threshold / 2;

  for (const item of lane.items) {
    // Skip non-obstacle items (stars sitting on path lanes)
    if (item.itemType === 'star' || item.itemType === 'oliveBranch') continue;

    const itemLeft = item.x;
    const itemRight = item.x + item.width;

    // AABB overlap on x-axis (y is implicitly matched since player is on this lane)
    if (playerRight > itemLeft && playerLeft < itemRight) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Star collection check
// ---------------------------------------------------------------------------

/**
 * Check if the player's center x overlaps a collectible star on any lane.
 * Returns the star item if found, null otherwise.
 */
export function checkPlayerHitStar(
  playerCenterX: number,
  cellWidth: number,
  lane: Lane,
): LaneItem | null {
  const threshold = cellWidth * GAME_CONSTANTS.COLLISION_THRESHOLD;
  const playerLeft = playerCenterX - threshold;
  const playerRight = playerCenterX + threshold;

  for (const item of lane.items) {
    if (item.itemType !== 'star') continue;

    const itemCenterX = item.x + item.width / 2;
    if (itemCenterX >= playerLeft && itemCenterX <= playerRight) {
      return item;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Water check
// ---------------------------------------------------------------------------

/**
 * Returns true if the given row index corresponds to a water lane.
 */
export function isInWater(playerRow: number, lanes: Lane[]): boolean {
  if (playerRow < 0 || playerRow >= lanes.length) return false;
  return lanes[playerRow].type === 'water';
}

/**
 * Returns true if the given row has been flooded (converted to deadly water).
 */
export function isFlooded(playerRow: number, floodedRows: number): boolean {
  return playerRow < floodedRows;
}
