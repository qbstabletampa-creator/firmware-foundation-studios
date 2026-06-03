import Phaser from 'phaser';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface BackgroundLayer {
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

/** Linearly interpolate between two 0-255 channel values. */
function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Interpolate two hex colors (0xRRGGBB) by factor t (0-1). */
function lerpColor(c1: number, c2: number, t: number): number {
  const r = lerpChannel((c1 >> 16) & 0xff, (c2 >> 16) & 0xff, t);
  const g = lerpChannel((c1 >> 8) & 0xff, (c2 >> 8) & 0xff, t);
  const b = lerpChannel(c1 & 0xff, c2 & 0xff, t);
  return (r << 16) | (g << 8) | b;
}

// ---------------------------------------------------------------------------
// Background factory
// ---------------------------------------------------------------------------

export function createBackground(
  scene: Phaser.Scene,
  w: number,
  h: number,
): BackgroundLayer {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const tweens: Phaser.Tweens.Tween[] = [];

  // ------------------------------------------------------------------
  // 1. Gradient sky (depth 0)
  // ------------------------------------------------------------------
  const skyGfx = scene.add.graphics();
  skyGfx.setDepth(0);

  const topColor = 0x080820;
  const bottomColor = 0x1a1a4e;
  const bands = 24;
  const bandHeight = Math.ceil(h / bands);

  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    skyGfx.fillStyle(lerpColor(topColor, bottomColor, t), 1);
    skyGfx.fillRect(0, i * bandHeight, w, bandHeight + 1); // +1 eliminates seams
  }

  objects.push(skyGfx);

  // ------------------------------------------------------------------
  // 2. Stars (depth 1)
  // ------------------------------------------------------------------
  const starsGfx = scene.add.graphics();
  starsGfx.setDepth(1);

  const starCount = 55;
  const starRegionH = h * 0.7;

  // Pre-draw all stars at full brightness; per-star alpha handled by tweens
  // on individual circle game objects for true independent twinkle.
  const starCircles: Phaser.GameObjects.Arc[] = [];

  for (let i = 0; i < starCount; i++) {
    const isBright = i < 8; // first 8 are "hero" stars
    const radius = isBright
      ? 2.5 + Math.random() * 1.5 // 2.5-4
      : 1 + Math.random() * 2; // 1-3
    const x = Math.random() * w;
    const y = Math.random() * starRegionH;

    const color = isBright ? 0xfff5cc : 0xffffff; // pale gold vs white
    const circle = scene.add.circle(x, y, radius, color);
    circle.setDepth(1);
    circle.setAlpha(0.3 + Math.random() * 0.5);

    const tw = scene.tweens.add({
      targets: circle,
      alpha: { from: 0.15 + Math.random() * 0.15, to: 0.65 + Math.random() * 0.2 },
      duration: 1500 + Math.random() * 2500,
      delay: Math.random() * 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    starCircles.push(circle);
    objects.push(circle);
    tweens.push(tw);
  }

  // Clean up the unused starsGfx (we used circles instead)
  starsGfx.destroy();

  // ------------------------------------------------------------------
  // 3. Heavenly light beam (depth 2)
  // ------------------------------------------------------------------
  const lightGfx = scene.add.graphics();
  lightGfx.setDepth(2);

  // Layered trapezoids for a soft volumetric feel
  const beamLayers = [
    { topHalf: 30, bottomHalf: 120, alpha: 0.06 },
    { topHalf: 50, bottomHalf: 180, alpha: 0.04 },
    { topHalf: 70, bottomHalf: 250, alpha: 0.03 },
  ];

  const cx = w / 2;
  const beamBottom = h * 0.75;

  for (const layer of beamLayers) {
    lightGfx.fillStyle(0xffffff, layer.alpha);
    lightGfx.beginPath();
    lightGfx.moveTo(cx - layer.topHalf, 0);
    lightGfx.lineTo(cx + layer.topHalf, 0);
    lightGfx.lineTo(cx + layer.bottomHalf, beamBottom);
    lightGfx.lineTo(cx - layer.bottomHalf, beamBottom);
    lightGfx.closePath();
    lightGfx.fillPath();
  }

  // Bright spot at the very top center
  lightGfx.fillStyle(0xffffff, 0.08);
  lightGfx.fillCircle(cx, 0, 60);
  lightGfx.fillStyle(0xffffff, 0.05);
  lightGfx.fillCircle(cx, 0, 110);

  objects.push(lightGfx);

  // Subtle pulsing on the beam
  const beamPulse = scene.tweens.add({
    targets: lightGfx,
    alpha: { from: 1, to: 0.6 },
    duration: 6000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  tweens.push(beamPulse);

  // ------------------------------------------------------------------
  // 4. Soft clouds (depth 3)
  // ------------------------------------------------------------------
  const cloudConfigs = [
    { x: w * 0.15, y: h * 0.08, cw: 340, ch: 55 },
    { x: w * 0.7, y: h * 0.18, cw: 280, ch: 45 },
    { x: w * 0.4, y: h * 0.28, cw: 380, ch: 65 },
    { x: w * 0.85, y: h * 0.35, cw: 220, ch: 40 },
  ];

  for (const cfg of cloudConfigs) {
    const cloudGfx = scene.add.graphics();
    cloudGfx.setDepth(3);

    // Multi-ellipse cluster for a more natural cloud shape
    const alpha = 0.03 + Math.random() * 0.025;
    cloudGfx.fillStyle(0xffffff, alpha);
    cloudGfx.fillEllipse(cfg.x, cfg.y, cfg.cw, cfg.ch);

    // Secondary smaller ellipse offset to break symmetry
    cloudGfx.fillStyle(0xffffff, alpha * 0.7);
    cloudGfx.fillEllipse(
      cfg.x + cfg.cw * 0.2,
      cfg.y - cfg.ch * 0.15,
      cfg.cw * 0.6,
      cfg.ch * 0.8,
    );

    const driftDistance = 50 + Math.random() * 50;
    const tw = scene.tweens.add({
      targets: cloudGfx,
      x: { from: -driftDistance / 2, to: driftDistance / 2 },
      duration: 15000 + Math.random() * 10000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    objects.push(cloudGfx);
    tweens.push(tw);
  }

  // ------------------------------------------------------------------
  // 5. Distant hills silhouette (depth 1)
  // ------------------------------------------------------------------
  const hillsGfx = scene.add.graphics();
  hillsGfx.setDepth(1);

  const hillColor = 0x1f1f55;
  const hillAlpha = 0.3;
  const hillBase = h; // bottom of screen
  const hillTop = h * 0.85; // top of hills at 85% down

  hillsGfx.fillStyle(hillColor, hillAlpha);
  hillsGfx.beginPath();
  hillsGfx.moveTo(0, hillBase);

  // Left hill
  hillsGfx.lineTo(0, hillTop + 30);
  // Smooth curve rising to a gentle peak on the left third
  const cp1x = w * 0.15;
  const cp1y = hillTop - 20;
  const p1x = w * 0.3;
  const p1y = hillTop + 10;
  // Use quadratic curves for organic shapes
  // Phaser Graphics doesn't have quadraticCurveTo, so we approximate
  // with multiple lineTo segments along a quadratic Bezier.
  drawQuadratic(hillsGfx, 0, hillTop + 30, cp1x, cp1y, p1x, p1y, 12);

  // Valley
  const valleyX = w * 0.45;
  const valleyY = hillTop + 35;
  drawQuadratic(hillsGfx, p1x, p1y, w * 0.37, valleyY, valleyX, valleyY, 8);

  // Center hill (tallest)
  const cp2x = w * 0.55;
  const cp2y = hillTop - 40;
  const p2x = w * 0.68;
  const p2y = hillTop + 5;
  drawQuadratic(hillsGfx, valleyX, valleyY, cp2x, cp2y, p2x, p2y, 12);

  // Right slope down
  const cp3x = w * 0.82;
  const cp3y = hillTop + 15;
  drawQuadratic(hillsGfx, p2x, p2y, cp3x, cp3y, w, hillTop + 25, 10);

  hillsGfx.lineTo(w, hillBase);
  hillsGfx.closePath();
  hillsGfx.fillPath();

  objects.push(hillsGfx);

  // ------------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------------
  return {
    destroy() {
      for (const tw of tweens) {
        tw.stop();
        tw.destroy();
      }
      tweens.length = 0;

      for (const obj of objects) {
        if (obj && obj.active) {
          obj.destroy();
        }
      }
      objects.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Geometry helper
// ---------------------------------------------------------------------------

/**
 * Approximate a quadratic Bezier curve using `lineTo` segments on a
 * Phaser.GameObjects.Graphics instance.
 *
 * Phaser's Graphics API does not expose `quadraticCurveTo`, so we
 * evaluate the curve parametrically and emit line segments.
 */
function drawQuadratic(
  gfx: Phaser.GameObjects.Graphics,
  x0: number,
  y0: number,
  cpx: number,
  cpy: number,
  x1: number,
  y1: number,
  segments: number,
): void {
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const invT = 1 - t;
    const px = invT * invT * x0 + 2 * invT * t * cpx + t * t * x1;
    const py = invT * invT * y0 + 2 * invT * t * cpy + t * t * y1;
    gfx.lineTo(px, py);
  }
}
