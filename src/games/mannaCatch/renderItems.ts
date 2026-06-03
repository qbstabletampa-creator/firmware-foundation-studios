import Phaser from 'phaser';
import { createGameSprite, type GameSprite } from '../../utils/spriteHelper';

// ---------------------------------------------------------------------------
// Color map for glow / particle effects per item type
// ---------------------------------------------------------------------------

const GLOW_COLORS: Record<string, number> = {
  manna: 0xf5deb3,
  honey: 0xffc107,
  grapes: 0x9c27b0,
  pomegranate: 0xe53935,
  figs: 0x689f38,
  star: 0xffd700,
  scroll: 0xd2b48c,
};

const BAD_AURA_COLOR = 0x4a0020;
const DANGER_WISP_COLOR = 0xff2222;

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ItemVisual {
  update(x: number, y: number): void;
  playCollectAnimation(onComplete: () => void): void;
  destroy(): void;
}

type ItemDescriptor = {
  id: string;
  type: string;
  category: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createItemVisual(
  scene: Phaser.Scene,
  item: ItemDescriptor,
): ItemVisual {
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;

  const container = scene.add.container(cx, cy).setDepth(25);

  // Track all tweens and timers so we can tear them down cleanly
  const tweens: Phaser.Tweens.Tween[] = [];
  const timers: Phaser.Time.TimerEvent[] = [];
  let destroyed = false;

  // Helper: safely add a tween and track it
  const addTween = (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
    const t = scene.tweens.add(config);
    tweens.push(t);
    return t;
  };

  // -----------------------------------------------------------------------
  // Shared: image sprite with emoji fallback
  // (depth handled by container child order + setDepth)
  // -----------------------------------------------------------------------

  const itemSprite: GameSprite = createGameSprite(
    scene,
    0,
    0,
    item.type,         // sprite key matches SPRITE_MAP keys
    item.icon,         // emoji fallback
    52,                // display width
    52,                // display height
    52,                // emoji font size fallback
  );
  itemSprite.setOrigin(0.5);
  itemSprite.setDepth(30);
  container.add(itemSprite);

  // -----------------------------------------------------------------------
  // Shared: subtle rotation wobble
  // -----------------------------------------------------------------------

  const rotDuration = 1200 + Math.random() * 600;
  addTween({
    targets: container,
    angle: { from: -12, to: 12 },
    duration: rotDuration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // -----------------------------------------------------------------------
  // Category-specific visuals
  // -----------------------------------------------------------------------

  const glowColor = GLOW_COLORS[item.type] ?? 0xffffff;

  if (item.category === 'good') {
    buildGoodVisuals(scene, container, glowColor, addTween, timers);
  } else {
    buildBadVisuals(scene, container, addTween, timers);
  }

  // -----------------------------------------------------------------------
  // Return the ItemVisual implementation
  // -----------------------------------------------------------------------

  return {
    update(x: number, y: number) {
      if (destroyed) return;
      container.x = x;
      container.y = y;
    },

    playCollectAnimation(onComplete: () => void) {
      if (destroyed) return;

      // Kill looping tweens so they don't fight the animation
      for (const t of tweens) {
        if (t && t.isPlaying()) t.stop();
      }

      // Burst 8 particles outward in the item's color
      const burstColor =
        item.category === 'good' ? glowColor : DANGER_WISP_COLOR;
      spawnBurstParticles(scene, container.x, container.y, burstColor, 8);

      // Scale up + fade out
      scene.tweens.add({
        targets: container,
        scaleX: 1.6,
        scaleY: 1.6,
        alpha: 0,
        duration: 250,
        ease: 'Quad.easeOut',
        onComplete: () => {
          onComplete();
        },
      });
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;

      for (const t of tweens) {
        if (t && !t.isDestroyed?.()) {
          t.destroy();
        }
      }
      tweens.length = 0;

      for (const timer of timers) {
        timer.destroy();
      }
      timers.length = 0;

      container.destroy(true);
    },
  };
}

// ---------------------------------------------------------------------------
// Good item visuals
// ---------------------------------------------------------------------------

function buildGoodVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  glowColor: number,
  addTween: (
    config: Phaser.Types.Tweens.TweenBuilderConfig,
  ) => Phaser.Tweens.Tween,
  timers: Phaser.Time.TimerEvent[],
): void {
  // Drop shadow (depth 24, added first so it renders behind)
  const shadow = scene.add
    .ellipse(0, 20, 30, 10, 0x000000, 0.12)
    .setDepth(24);
  container.addAt(shadow, 0);

  // Glow circle (depth 25)
  const glow = scene.add.circle(0, 0, 32, glowColor, 0.15).setDepth(25);
  container.addAt(glow, 1);

  // Glow pulse
  addTween({
    targets: glow,
    scaleX: { from: 0.9, to: 1.1 },
    scaleY: { from: 0.9, to: 1.1 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Sparkle trail: every 400ms spawn a tiny dot that fades upward
  const sparkleTimer = scene.time.addEvent({
    delay: 400,
    loop: true,
    callback: () => {
      if (!container.active) return;
      const worldX = container.x + (Math.random() - 0.5) * 20;
      const worldY = container.y + (Math.random() - 0.5) * 10;

      const sparkle = scene.add
        .circle(worldX, worldY, 2, glowColor, 0.4)
        .setDepth(23);

      scene.tweens.add({
        targets: sparkle,
        y: worldY - 30,
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    },
  });
  timers.push(sparkleTimer);
}

// ---------------------------------------------------------------------------
// Bad item visuals
// ---------------------------------------------------------------------------

function buildBadVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  addTween: (
    config: Phaser.Types.Tweens.TweenBuilderConfig,
  ) => Phaser.Tweens.Tween,
  timers: Phaser.Time.TimerEvent[],
): void {
  // Dark aura (depth 25)
  const aura = scene.add
    .circle(0, 0, 34, BAD_AURA_COLOR, 0.25)
    .setDepth(25);
  container.addAt(aura, 0);

  // Menacing pulse: faster than good items
  addTween({
    targets: aura,
    alpha: { from: 0.15, to: 0.35 },
    scaleX: { from: 0.95, to: 1.15 },
    scaleY: { from: 0.95, to: 1.15 },
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Danger wisps: every 300ms spawn 1-2 red particles that drift outward
  const wispTimer = scene.time.addEvent({
    delay: 300,
    loop: true,
    callback: () => {
      if (!container.active) return;

      const count = 1 + Math.floor(Math.random() * 2); // 1 or 2
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 20;
        const startX = container.x + (Math.random() - 0.5) * 10;
        const startY = container.y + (Math.random() - 0.5) * 10;

        const wisp = scene.add
          .circle(startX, startY, 1.5, DANGER_WISP_COLOR, 0.5)
          .setDepth(23);

        scene.tweens.add({
          targets: wisp,
          x: startX + Math.cos(angle) * dist,
          y: startY + Math.sin(angle) * dist,
          alpha: 0,
          duration: 400,
          ease: 'Quad.easeOut',
          onComplete: () => wisp.destroy(),
        });
      }
    },
  });
  timers.push(wispTimer);
}

// ---------------------------------------------------------------------------
// Burst particles for collect animation
// ---------------------------------------------------------------------------

function spawnBurstParticles(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
): void {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = 60 + Math.random() * 50;
    const size = 3 + Math.random() * 3;

    const dot = scene.add
      .circle(x, y, size, color, 0.85)
      .setDepth(70);

    scene.tweens.add({
      targets: dot,
      x: x + Math.cos(angle) * speed,
      y: y + Math.sin(angle) * speed,
      alpha: 0,
      scaleX: 0.15,
      scaleY: 0.15,
      duration: 300 + Math.random() * 150,
      ease: 'Quad.easeOut',
      onComplete: () => dot.destroy(),
    });
  }
}
