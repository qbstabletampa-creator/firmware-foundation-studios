import Phaser from 'phaser';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface BasketVisual {
  setPosition(x: number): void;
  setWidth(width: number, height: number): void;
  destroy(): void;
}

/** Sprite key used for the basket image. */
const BASKET_SPRITE_KEY = 'basket';

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const BODY_FILL = 0x8b6914;
const WEAVE_COLOR = 0xc5a832;
const RIM_FILL = 0x6b4c10;
const GLOW_COLOR = 0xd4c36a;
const WEAVE_ALPHA = 0.5;
const WEAVE_LINE_WIDTH = 2;
const GLOW_ALPHA = 0.08;
const RIM_HEIGHT = 10;
const RIM_OVERHANG = 6;
const RIM_RADIUS = 4;
const GLOW_PAD = 30;
const BOTTOM_RATIO = 0.85;
const CURVE_RADIUS = 10;
const WEAVE_LINE_COUNT = 4;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

/**
 * Draw the trapezoid basket body onto a Graphics object.
 * Origin: center of the basket (0, 0) in local space.
 */
function drawBody(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
  const halfTop = w / 2;
  const halfBot = (w * BOTTOM_RATIO) / 2;
  const halfH = h / 2;

  g.fillStyle(BODY_FILL, 1);
  g.beginPath();

  // Start top-left
  g.moveTo(-halfTop, -halfH);

  // Left side down to bottom-left, slightly inward
  g.lineTo(-halfBot, halfH - CURVE_RADIUS);

  // Curve across the bottom-left corner
  g.arc(
    -halfBot + CURVE_RADIUS,
    halfH - CURVE_RADIUS,
    CURVE_RADIUS,
    Math.PI,
    Math.PI / 2,
    true,
  );

  // Bottom edge
  g.lineTo(halfBot - CURVE_RADIUS, halfH);

  // Curve across the bottom-right corner
  g.arc(
    halfBot - CURVE_RADIUS,
    halfH - CURVE_RADIUS,
    CURVE_RADIUS,
    Math.PI / 2,
    0,
    true,
  );

  // Right side up to top-right
  g.lineTo(halfBot, halfH - CURVE_RADIUS);
  g.lineTo(halfTop, -halfH);

  g.closePath();
  g.fillPath();
}

/**
 * Draw horizontal woven texture lines that follow the trapezoid taper.
 */
function drawWeave(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
  const halfTop = w / 2;
  const halfBot = (w * BOTTOM_RATIO) / 2;
  const halfH = h / 2;

  g.lineStyle(WEAVE_LINE_WIDTH, WEAVE_COLOR, WEAVE_ALPHA);

  for (let i = 1; i <= WEAVE_LINE_COUNT; i++) {
    const t = i / (WEAVE_LINE_COUNT + 1);
    const y = -halfH + t * h;

    // Interpolate width at this vertical position
    const halfW = Phaser.Math.Linear(halfTop, halfBot, t);

    // Slight downward bow for woven look
    const sag = 2 + t * 2;

    g.beginPath();
    g.moveTo(-halfW + 4, y);

    // Quadratic curve: control point below the line center
    const cp1x = -halfW * 0.33;
    const cp1y = y + sag;
    const cp2x = halfW * 0.33;
    const cp2y = y + sag;

    // Approximate a smooth sag with two bezier segments
    g.lineTo(cp1x, cp1y);
    g.lineTo(0, y + sag * 0.6);
    g.lineTo(cp2x, cp2y);
    g.lineTo(halfW - 4, y);

    g.strokePath();
  }

  // Vertical cross-weave lines (3 of them) for woven texture
  const vertCount = 3;
  for (let i = 1; i <= vertCount; i++) {
    const t = i / (vertCount + 1);
    const xTop = Phaser.Math.Linear(-halfTop, halfTop, t);
    const xBot = Phaser.Math.Linear(-halfBot, halfBot, t);

    g.beginPath();
    g.moveTo(xTop, -halfH + 4);
    g.lineTo(xBot, halfH - CURVE_RADIUS);
    g.strokePath();
  }
}

/**
 * Draw the rim bar across the top of the basket.
 */
function drawRim(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
  const rimW = w + RIM_OVERHANG * 2;
  const halfRimW = rimW / 2;
  const halfH = h / 2;
  const rimTop = -halfH - RIM_HEIGHT;

  g.fillStyle(RIM_FILL, 1);
  g.beginPath();

  // Top-left with rounded corner
  g.moveTo(-halfRimW + RIM_RADIUS, rimTop);
  g.lineTo(halfRimW - RIM_RADIUS, rimTop);

  // Top-right rounded corner
  g.arc(
    halfRimW - RIM_RADIUS,
    rimTop + RIM_RADIUS,
    RIM_RADIUS,
    -Math.PI / 2,
    0,
    false,
  );

  // Right side down
  g.lineTo(halfRimW, -halfH);

  // Bottom edge (flat, sits on top of basket body)
  g.lineTo(-halfRimW, -halfH);

  // Top-left rounded corner
  g.arc(
    -halfRimW + RIM_RADIUS,
    rimTop + RIM_RADIUS,
    RIM_RADIUS,
    Math.PI,
    -Math.PI / 2,
    false,
  );

  g.closePath();
  g.fillPath();

  // Subtle highlight along the top of the rim
  g.lineStyle(1, 0x9a7528, 0.6);
  g.beginPath();
  g.moveTo(-halfRimW + RIM_RADIUS + 2, rimTop + 2);
  g.lineTo(halfRimW - RIM_RADIUS - 2, rimTop + 2);
  g.strokePath();
}

/**
 * Draw the soft golden glow ellipse behind the basket.
 */
function drawGlow(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
  const glowW = w + GLOW_PAD * 2;
  const glowH = h + GLOW_PAD * 2;

  g.fillStyle(GLOW_COLOR, GLOW_ALPHA);
  g.fillEllipse(0, 0, glowW, glowH);
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

export function createBasket(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): BasketVisual {
  // Check if a basket sprite texture was successfully loaded.
  // Cast to string to avoid TS2367 with the string literal type.
  const key: string = BASKET_SPRITE_KEY;
  const hasSprite =
    scene.textures.exists(key) &&
    key !== '__DEFAULT' &&
    key !== '__MISSING';

  if (hasSprite) {
    return createSpriteBasket(scene, x, y, width, height);
  }

  return createGraphicsBasket(scene, x, y, width, height);
}

// ---------------------------------------------------------------------------
// Sprite-based basket (used when basket.png exists)
// ---------------------------------------------------------------------------

function createSpriteBasket(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): BasketVisual {
  // Glow behind the sprite
  const glowGraphics = scene.add.graphics();
  glowGraphics.setDepth(48);
  drawGlow(glowGraphics, width, height);
  glowGraphics.setPosition(x, y);

  // Sprite image
  const sprite = scene.add.image(x, y, BASKET_SPRITE_KEY);
  sprite.setDisplaySize(width, height);
  sprite.setOrigin(0.5);
  sprite.setDepth(50);

  return {
    setPosition(newX: number): void {
      sprite.x = newX;
      glowGraphics.x = newX;
    },

    setWidth(newWidth: number, newHeight: number): void {
      sprite.setDisplaySize(newWidth, newHeight);

      glowGraphics.clear();
      drawGlow(glowGraphics, newWidth, newHeight);
    },

    destroy(): void {
      sprite.destroy();
      glowGraphics.destroy();
    },
  };
}

// ---------------------------------------------------------------------------
// Graphics-based basket (original fallback when no sprite exists)
// ---------------------------------------------------------------------------

function createGraphicsBasket(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): BasketVisual {
  // -- Glow layer (behind everything) ------------------------------------
  const glowGraphics = scene.add.graphics();
  glowGraphics.setDepth(48);
  drawGlow(glowGraphics, width, height);
  glowGraphics.setPosition(x, y);

  // -- Container for the basket body + weave + rim -----------------------
  const bodyGraphics = scene.add.graphics();
  drawBody(bodyGraphics, width, height);
  drawWeave(bodyGraphics, width, height);
  drawRim(bodyGraphics, width, height);

  const container = scene.add.container(x, y, [bodyGraphics]);
  container.setDepth(50);

  // -- Public API --------------------------------------------------------
  return {
    setPosition(newX: number): void {
      container.x = newX;
      glowGraphics.x = newX;
    },

    setWidth(newWidth: number, newHeight: number): void {
      // Clear and redraw at the new dimensions
      bodyGraphics.clear();
      drawBody(bodyGraphics, newWidth, newHeight);
      drawWeave(bodyGraphics, newWidth, newHeight);
      drawRim(bodyGraphics, newWidth, newHeight);

      glowGraphics.clear();
      drawGlow(glowGraphics, newWidth, newHeight);
    },

    destroy(): void {
      container.destroy();
      glowGraphics.destroy();
    },
  };
}
