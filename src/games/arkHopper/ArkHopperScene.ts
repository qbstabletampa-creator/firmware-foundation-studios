import Phaser from 'phaser';
import { createInitialState, hop, tick, type GameEvent } from './gameEngine';
import { getCellPixelPos, getCellHeight, getCellWidth } from './collisionEngine';
import { GAME_CONSTANTS, getAnimalForLevel } from './itemConfig';
import { arkHopperVerses, type ArkHopperVerse } from './verses';
import { preloadSprites, createGameSprite, type GameSprite } from '../../utils/spriteHelper';
import { SPRITE_MAP } from './spriteMap';
import type { GameState, Direction, Lane, LaneItem, MomentumTier } from './types';
import { ArkHopperSFX, unlockAudio } from './sounds';
import { SharedSFX } from '../../utils/soundEngine';
import { useArkHopperStore } from '../../stores/arkHopperStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const W = 750;
const H = 1334;
const CX = W / 2;
const CY = H / 2;
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const GOLD = 0xd4c36a;
const GOLD_HEX = '#D4C36A';
const BG_DARK = 0x1a1a2e;
const VERSE_CARD_BG = 0xfff8e7;
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.5;
const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];
const COUNTDOWN_STEP_MS = 375; // 1.5s / 4

// Lane colors
const LANE_COLORS: Record<string, number> = {
  start: 0x4caf50,
  grass: 0x4caf50,
  path: 0x8b7355,
  water: 0x2196f3,
  goal: 0xd4c36a,
};

// Depth layers
const DEPTH_BG = 10;
const DEPTH_LANES = 20;
const DEPTH_ITEMS = 30;
const DEPTH_STARS = 35;
const DEPTH_PLAYER = 50;
const DEPTH_HUD = 100;
const DEPTH_OVERLAY = 200;

const MAX_DELTA = 100;
const HOP_DURATION = 200; // ms for hop tween
const HOP_ARC_HEIGHT = 28; // px upward arc during hop
const SWIPE_THRESHOLD = 30; // min px for swipe detection

// Map engine itemType strings to SPRITE_MAP keys
const ITEM_TYPE_TO_SPRITE_KEY: Record<string, string> = {
  sheep: 'sheep',
  goat: 'goat',
  chicken: 'chicken',
  donkeyCart: 'donkey-cart',
  log: 'log',
  lilyPad: 'lily-pad',
  star: 'golden-star',
};

/** Convert an engine itemType to its sprite key */
function spriteKeyForItemType(itemType: string): string {
  return ITEM_TYPE_TO_SPRITE_KEY[itemType] ?? itemType;
}

/** Convert an animal name (from getAnimalForLevel) to its sprite key */
function spriteKeyForAnimal(animalName: string): string {
  return animalName.toLowerCase();
}

// Flood meter dimensions
const FLOOD_METER_X = W - 30;
const FLOOD_METER_W = 16;
const FLOOD_METER_H = 300;
const FLOOD_METER_Y = 100;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class ArkHopperScene extends Phaser.Scene {
  // Engine state
  private engineState!: GameState;
  private currentLevel = 1;

  // Rendering
  private laneRects: Phaser.GameObjects.Rectangle[] = [];
  private laneItemSprites = new Map<number, GameSprite>();
  private starSprites = new Map<number, GameSprite>();
  private starTweens = new Map<number, Phaser.Tweens.Tween>();
  private floodOverlays: Phaser.GameObjects.Rectangle[] = [];

  // Player
  private playerSprite!: GameSprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private isHopping = false;
  private queuedHop: Direction | null = null;

  // HUD
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private floodMeterBg!: Phaser.GameObjects.Rectangle;
  private floodMeterFill!: Phaser.GameObjects.Rectangle;
  private floodMeterBorder!: Phaser.GameObjects.Rectangle;
  private momentumText!: Phaser.GameObjects.Text;

  // Goal visual
  private arkSprite!: GameSprite;

  // Environment visuals
  private clouds: { gfx: Phaser.GameObjects.Graphics; speed: number; baseY: number; widths: number[] }[] = [];
  private waterShimmerLines: { gfx: Phaser.GameObjects.Graphics; laneY: number; laneH: number; offsets: number[] }[] = [];
  private goalGlow!: Phaser.GameObjects.Graphics;

  // Overlays
  private overlayGroup!: Phaser.GameObjects.Group;

  // Flags
  private paused = false;
  private gameStarted = false;
  private gameOverShown = false;
  private levelCompleteShown = false;
  private invincibilityFlashTimer = 0;

  // Input tracking
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartTime = 0;
  private keysHeld = new Set<string>();

  // Verse tracking
  private verseIndex = 0;

  // Grid dimensions (computed from engine state)
  private cellW = 0;
  private cellH = 0;

  constructor() {
    super('ArkHopperScene');
  }

  init(data?: { level?: number }): void {
    this.currentLevel = data?.level ?? 1;
  }

  preload(): void {
    preloadSprites(this, SPRITE_MAP);
  }

  create(): void {
    // Reset flags
    this.paused = false;
    this.gameStarted = false;
    this.gameOverShown = false;
    this.levelCompleteShown = false;
    this.isHopping = false;
    this.queuedHop = null;
    this.invincibilityFlashTimer = 0;
    this.keysHeld.clear();
    this.laneRects = [];
    this.laneItemSprites.clear();
    this.starSprites.clear();
    this.starTweens.clear();
    this.floodOverlays = [];
    this.clouds = [];
    this.waterShimmerLines = [];

    // Create engine state
    this.engineState = createInitialState(this.currentLevel, W, H);
    this.cellW = getCellWidth(W, this.engineState.totalCols);
    this.cellH = getCellHeight(H, this.engineState.totalRows);

    // Build visual layers
    this.buildSkyGradient();
    this.buildLaneBackgrounds();
    this.buildWaterShimmerLines();
    this.buildGrassDetails();
    this.buildArkGoal();
    this.buildGoalGlow();
    this.buildClouds();
    this.buildPlayer();
    this.createHUD();
    this.createFloodMeter();
    this.setupInput();
    unlockAudio();

    // Overlay group
    this.overlayGroup = this.add.group();

    // Start countdown
    this.showCountdown();
  }

  // -----------------------------------------------------------------------
  // Sky gradient
  // -----------------------------------------------------------------------

  private buildSkyGradient(): void {
    const skyGfx = this.add.graphics();
    skyGfx.setDepth(DEPTH_BG - 1);
    // Vertical gradient: sky blue at top, warm peach at bottom
    skyGfx.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xffe4b5, 0xffe4b5, 1);
    skyGfx.fillRect(0, 0, W, H);
  }

  // -----------------------------------------------------------------------
  // Animated clouds
  // -----------------------------------------------------------------------

  private buildClouds(): void {
    const cloudConfigs = [
      { y: H * 0.04, speed: 8, circles: [{ ox: 0, oy: 0, r: 28 }, { ox: 24, oy: -4, r: 22 }, { ox: -20, oy: 2, r: 20 }] },
      { y: H * 0.10, speed: 12, circles: [{ ox: 0, oy: 0, r: 24 }, { ox: 20, oy: -2, r: 18 }] },
      { y: H * 0.16, speed: 6, circles: [{ ox: 0, oy: 0, r: 30 }, { ox: 26, oy: -6, r: 24 }, { ox: -22, oy: 0, r: 18 }] },
      { y: H * 0.22, speed: 10, circles: [{ ox: 0, oy: 0, r: 20 }, { ox: 18, oy: -2, r: 16 }] },
    ];

    for (let i = 0; i < cloudConfigs.length; i++) {
      const cfg = cloudConfigs[i];
      const gfx = this.add.graphics();
      gfx.setDepth(DEPTH_BG);
      const startX = (W / (cloudConfigs.length + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
      gfx.setPosition(startX, cfg.y);

      const alpha = 0.6 + Math.random() * 0.2;
      gfx.fillStyle(0xffffff, alpha);
      const widths: number[] = [];
      for (const c of cfg.circles) {
        gfx.fillCircle(c.ox, c.oy, c.r);
        widths.push(c.ox + c.r);
      }

      this.clouds.push({ gfx, speed: cfg.speed, baseY: cfg.y, widths });
    }
  }

  // -----------------------------------------------------------------------
  // Grass detail triangles
  // -----------------------------------------------------------------------

  private buildGrassDetails(): void {
    const greens = [0x3a8a3e, 0x2e7d32, 0x558b2f, 0x43a047, 0x66bb6a];

    for (let row = 0; row < this.engineState.totalRows; row++) {
      const lane = this.engineState.lanes[row];
      if (lane.type !== 'grass' && lane.type !== 'start') continue;

      const yPixel = H - (row + 1) * this.cellH;
      const numBlades = 3 + Math.floor(Math.random() * 3); // 3-5

      const grassGfx = this.add.graphics();
      grassGfx.setDepth(DEPTH_LANES - 1);

      for (let b = 0; b < numBlades; b++) {
        const bx = 20 + Math.random() * (W - 40);
        const by = yPixel + this.cellH * (0.3 + Math.random() * 0.5);
        const bladeH = 6 + Math.random() * 8;
        const bladeW = 4 + Math.random() * 4;
        const color = greens[Math.floor(Math.random() * greens.length)];
        const alpha = 0.3 + Math.random() * 0.1;

        grassGfx.fillStyle(color, alpha);
        grassGfx.fillTriangle(
          bx, by,
          bx - bladeW / 2, by + bladeH,
          bx + bladeW / 2, by + bladeH,
        );
      }
    }
  }

  // -----------------------------------------------------------------------
  // Goal glow
  // -----------------------------------------------------------------------

  private buildGoalGlow(): void {
    const goalRow = this.engineState.totalRows - 1;
    const yPixel = H - (goalRow + 1) * this.cellH + this.cellH / 2;

    this.goalGlow = this.add.graphics();
    this.goalGlow.setDepth(DEPTH_LANES - 1);
    this.goalGlow.setPosition(CX, yPixel);

    // Draw radial-style glow using concentric circles
    const maxR = this.cellH * 1.2;
    const steps = 8;
    for (let i = steps; i >= 0; i--) {
      const r = maxR * (i / steps);
      const a = 0.02 + (0.16 * (1 - i / steps));
      this.goalGlow.fillStyle(0xd4c36a, a);
      this.goalGlow.fillCircle(0, 0, r);
    }

    // Subtle pulsing scale
    this.tweens.add({
      targets: this.goalGlow,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // -----------------------------------------------------------------------
  // Water shimmer lines
  // -----------------------------------------------------------------------

  private buildWaterShimmerLines(): void {
    for (let row = 0; row < this.engineState.totalRows; row++) {
      const lane = this.engineState.lanes[row];
      if (lane.type !== 'water') continue;

      const yPixel = H - (row + 1) * this.cellH;
      const gfx = this.add.graphics();
      gfx.setDepth(DEPTH_LANES - 1);

      const numLines = 3;
      const offsets: number[] = [];
      for (let i = 0; i < numLines; i++) {
        offsets.push(Math.random() * W);
      }

      this.waterShimmerLines.push({
        gfx,
        laneY: yPixel,
        laneH: this.cellH,
        offsets,
      });
    }
  }

  // -----------------------------------------------------------------------
  // Lane backgrounds
  // -----------------------------------------------------------------------

  private buildLaneBackgrounds(): void {
    for (let row = 0; row < this.engineState.totalRows; row++) {
      const lane = this.engineState.lanes[row];
      const color = LANE_COLORS[lane.type] ?? 0x333333;

      // Lanes render bottom-up: row 0 at bottom, row N at top
      const yPixel = H - (row + 1) * this.cellH;

      const rect = this.add
        .rectangle(CX, yPixel + this.cellH / 2, W, this.cellH, color)
        .setDepth(DEPTH_BG);

      // Add subtle alternating brightness for grass/path
      if (lane.type === 'grass' || lane.type === 'start') {
        rect.setAlpha(row % 2 === 0 ? 0.9 : 1.0);
      } else if (lane.type === 'path') {
        rect.setAlpha(row % 2 === 0 ? 0.85 : 1.0);
      } else if (lane.type === 'water') {
        // Water shimmer effect
        rect.setAlpha(0.85);
        this.tweens.add({
          targets: rect,
          alpha: { from: 0.8, to: 0.95 },
          duration: 1500 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      this.laneRects.push(rect);

      // Add decoration emojis on grass lanes
      if (lane.type === 'grass' || lane.type === 'start') {
        const decorations = ['\u{1F33F}', '\u{1F338}', '\u{1F33E}'];
        const numDecos = 2 + Math.floor(Math.random() * 2);
        for (let d = 0; d < numDecos; d++) {
          const decoX = 30 + Math.random() * (W - 60);
          const decoY = yPixel + this.cellH * (0.2 + Math.random() * 0.6);
          this.add
            .text(decoX, decoY, decorations[Math.floor(Math.random() * decorations.length)], {
              fontSize: '16px',
            })
            .setOrigin(0.5)
            .setAlpha(0.4)
            .setDepth(DEPTH_BG + 1);
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Ark goal
  // -----------------------------------------------------------------------

  private buildArkGoal(): void {
    const goalRow = this.engineState.totalRows - 1;
    const yPixel = H - (goalRow + 1) * this.cellH + this.cellH / 2;
    const arkSize = Math.min(Math.floor(this.cellH * 0.8), 80);

    this.arkSprite = createGameSprite(
      this, CX, yPixel, 'noahs-ark', '\u{1F6A2}', arkSize, arkSize,
    );
    this.arkSprite.setOrigin(0.5).setDepth(DEPTH_ITEMS + 5);

    // Gentle bob
    this.tweens.add({
      targets: this.arkSprite,
      y: yPixel - 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // -----------------------------------------------------------------------
  // Player
  // -----------------------------------------------------------------------

  private buildPlayer(): void {
    const { x, y } = this.getPlayerPixelPos();

    // Shadow
    this.playerShadow = this.add
      .ellipse(x, y + this.cellH * 0.3, this.cellW * 0.5, this.cellH * 0.15, 0x000000, 0.3)
      .setDepth(DEPTH_PLAYER - 1);

    // Player sprite (image with emoji fallback)
    const animal = getAnimalForLevel(this.currentLevel);
    const spriteSize = Math.min(Math.floor(Math.min(this.cellW, this.cellH) * 0.7), 72);
    this.playerSprite = createGameSprite(
      this, x, y, spriteKeyForAnimal(animal.name), this.engineState.player.emoji,
      spriteSize, spriteSize,
    );
    this.playerSprite.setOrigin(0.5).setDepth(DEPTH_PLAYER);
  }

  private getPlayerPixelPos(): { x: number; y: number } {
    const { x: cx, y: cy } = getCellPixelPos(
      this.engineState.player.col,
      this.engineState.player.row,
      W, H,
      this.engineState.totalRows,
      this.engineState.totalCols,
    );
    // Flip Y: engine row 0 = bottom
    const flippedY = H - cy;
    return { x: cx, y: flippedY };
  }

  // -----------------------------------------------------------------------
  // HUD
  // -----------------------------------------------------------------------

  private createHUD(): void {
    // Back button
    const backBtn = this.add
      .text(30, 44, '← Back', {
        fontSize: '24px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_HUD);

    backBtn.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('arkhopper:back');
    });

    // Level indicator with animal name (top left, below back)
    const animal = getAnimalForLevel(this.currentLevel);
    this.levelText = this.add
      .text(30, 80, `Level ${this.currentLevel} ${animal.emoji} ${animal.name}`, {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
      })
      .setOrigin(0, 0.5)
      .setDepth(DEPTH_HUD);

    // Score (top center)
    this.scoreText = this.add
      .text(CX, 44, '0', {
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH_HUD);

    // Lives (hearts, top right)
    this.livesText = this.add
      .text(W - 60, 44, this.heartsString(GAME_CONSTANTS.INITIAL_LIVES), {
        fontSize: '28px',
        fontFamily: FONT,
      })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH_HUD);

    // Momentum text (hidden initially)
    this.momentumText = this.add
      .text(CX, 90, '', {
        fontSize: '28px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(DEPTH_HUD);
  }

  private heartsString(lives: number): string {
    return '❤️'.repeat(Math.max(0, lives));
  }

  // -----------------------------------------------------------------------
  // Flood meter
  // -----------------------------------------------------------------------

  private createFloodMeter(): void {
    // Background
    this.floodMeterBg = this.add
      .rectangle(FLOOD_METER_X, FLOOD_METER_Y + FLOOD_METER_H / 2, FLOOD_METER_W, FLOOD_METER_H, 0x333333, 0.4)
      .setDepth(DEPTH_HUD);

    // Fill (grows from bottom up)
    this.floodMeterFill = this.add
      .rectangle(FLOOD_METER_X, FLOOD_METER_Y + FLOOD_METER_H, FLOOD_METER_W, 0, 0x2196f3, 0.8)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH_HUD + 1);

    // Border
    this.floodMeterBorder = this.add
      .rectangle(FLOOD_METER_X, FLOOD_METER_Y + FLOOD_METER_H / 2, FLOOD_METER_W + 2, FLOOD_METER_H + 2)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setFillStyle(0x000000, 0)
      .setDepth(DEPTH_HUD + 2);

    // Water drop icon
    this.add
      .text(FLOOD_METER_X, FLOOD_METER_Y - 14, '\u{1F4A7}', { fontSize: '16px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_HUD);
  }

  private updateFloodMeter(): void {
    const pct = Math.min(100, this.engineState.floodMeter) / 100;
    const fillH = FLOOD_METER_H * pct;
    this.floodMeterFill.setSize(FLOOD_METER_W, fillH);

    // Color shifts from blue to red as it fills
    if (pct > 0.75) {
      this.floodMeterFill.setFillStyle(0xe53935, 0.9);
    } else if (pct > 0.5) {
      this.floodMeterFill.setFillStyle(0xff9800, 0.85);
    } else {
      this.floodMeterFill.setFillStyle(0x2196f3, 0.8);
    }
  }

  // -----------------------------------------------------------------------
  // Input
  // -----------------------------------------------------------------------

  private setupInput(): void {
    // Swipe detection
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
      this.pointerStartTime = this.time.now;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.paused) return;
      if (this.engineState.phase !== 'playing') return;

      const dx = pointer.x - this.pointerStartX;
      const dy = pointer.y - this.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = this.time.now - this.pointerStartTime;

      if (dist >= SWIPE_THRESHOLD) {
        // Determine dominant axis
        let direction: Direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          // Remember: screen up = negative y, but "up" in game = forward = toward ark
          direction = dy < 0 ? 'up' : 'down';
        }
        this.tryHop(direction);
      } else if (elapsed < 300) {
        // Tap: use quadrant of screen to determine direction
        const relX = pointer.x / W;
        const relY = pointer.y / H;

        // Top 40% = up, bottom 30% = down, left/right otherwise
        if (relY < 0.4) {
          this.tryHop('up');
        } else if (relY > 0.7) {
          this.tryHop('down');
        } else if (relX < 0.35) {
          this.tryHop('left');
        } else if (relX > 0.65) {
          this.tryHop('right');
        } else {
          // Center tap = up (most common desired action)
          this.tryHop('up');
        }
      }
    });

    // Keyboard
    if (this.input.keyboard) {
      const kb = this.input.keyboard;

      kb.on('keydown-UP', () => this.tryHop('up'));
      kb.on('keydown-DOWN', () => this.tryHop('down'));
      kb.on('keydown-LEFT', () => this.tryHop('left'));
      kb.on('keydown-RIGHT', () => this.tryHop('right'));
      kb.on('keydown-W', () => this.tryHop('up'));
      kb.on('keydown-S', () => this.tryHop('down'));
      kb.on('keydown-A', () => this.tryHop('left'));
      kb.on('keydown-D', () => this.tryHop('right'));

      kb.on('keydown-SPACE', () => this.togglePause());
      kb.on('keydown-ESC', () => this.togglePause());
    }
  }

  private tryHop(direction: Direction): void {
    if (!this.gameStarted || this.paused) return;
    if (this.engineState.phase !== 'playing') return;

    if (this.isHopping) {
      // Queue one hop
      this.queuedHop = direction;
      return;
    }

    this.executeHop(direction);
  }

  private executeHop(direction: Direction): void {
    const oldRow = this.engineState.player.row;
    const oldCol = this.engineState.player.col;

    const result = hop(this.engineState, direction, W, H);
    this.engineState = result.state;

    // Process events from hop
    for (const event of result.events) {
      this.handleEvent(event);
    }

    const newRow = this.engineState.player.row;
    const newCol = this.engineState.player.col;

    // If position didn't change, no animation needed
    if (newRow === oldRow && newCol === oldCol) return;

    // Animate hop
    this.isHopping = true;
    const target = this.getPlayerPixelPos();
    const startY = this.playerSprite.y;

    this.tweens.add({
      targets: [this.playerSprite],
      x: target.x,
      y: target.y,
      duration: HOP_DURATION,
      ease: 'Quad.easeOut',
      onUpdate: (_tween, _target, _key, _value, progress: number) => {
        // Arc: parabolic y offset
        const arc = -HOP_ARC_HEIGHT * 4 * progress * (1 - progress);
        this.playerSprite.y = Phaser.Math.Linear(startY, target.y, progress) + arc;
      },
      onComplete: () => {
        this.playerSprite.setPosition(target.x, target.y);
        this.playerShadow.setPosition(target.x, target.y + this.cellH * 0.3);

        // Landing squash
        this.playerSprite.setScale(1.15, 0.8);
        this.tweens.add({
          targets: this.playerSprite,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Back.easeOut',
        });

        // Landing dust puff
        this.spawnLandingDust(target.x, target.y + this.cellH * 0.25);

        this.isHopping = false;

        // Process queued hop
        if (this.queuedHop) {
          const queued = this.queuedHop;
          this.queuedHop = null;
          this.executeHop(queued);
        }
      },
    });

    // Shadow follows on x, shrinks during arc then grows on landing
    this.tweens.add({
      targets: this.playerShadow,
      x: target.x,
      y: target.y + this.cellH * 0.3,
      duration: HOP_DURATION,
      ease: 'Quad.easeOut',
    });
    this.playerShadow.setScale(0.6, 0.6);
    this.tweens.add({
      targets: this.playerShadow,
      scaleX: 1,
      scaleY: 1,
      duration: HOP_DURATION,
      ease: 'Quad.easeIn',
    });

    // Launch stretch: tall and narrow
    this.playerSprite.setScale(0.8, 1.25);
    this.tweens.add({
      targets: this.playerSprite,
      scaleX: 1,
      scaleY: 1,
      duration: HOP_DURATION * 0.5,
      ease: 'Quad.easeOut',
    });
  }

  private togglePause(): void {
    if (this.engineState.phase !== 'playing') return;
    this.paused = !this.paused;

    if (this.paused) {
      this.showPauseOverlay();
    }
  }

  // -----------------------------------------------------------------------
  // Countdown
  // -----------------------------------------------------------------------

  private showCountdown(): void {
    let step = 0;

    const countdownText = this.add
      .text(CX, CY, COUNTDOWN_STEPS[0], {
        fontSize: '96px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY);

    const doStep = () => {
      const label = COUNTDOWN_STEPS[step];
      countdownText.setText(label);
      countdownText.setScale(1.5);
      countdownText.setAlpha(1);

      // Countdown sounds
      if (label === '3' || label === '2' || label === '1') {
        SharedSFX.countdown();
      } else if (label === 'GO!') {
        SharedSFX.countdownGo();
      }

      this.tweens.add({
        targets: countdownText,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: countdownText,
        alpha: 0,
        duration: 100,
        delay: 250,
        ease: 'Quad.easeIn',
      });

      step++;
      if (step < COUNTDOWN_STEPS.length) {
        this.time.delayedCall(COUNTDOWN_STEP_MS, doStep);
      } else {
        this.time.delayedCall(COUNTDOWN_STEP_MS, () => {
          countdownText.destroy();
          this.gameStarted = true;
          this.engineState = { ...this.engineState, phase: 'playing' };
        });
      }
    };

    doStep();
  }

  // -----------------------------------------------------------------------
  // Main update loop
  // -----------------------------------------------------------------------

  update(_time: number, delta: number): void {
    if (!this.gameStarted || this.paused) return;

    if (this.engineState.phase === 'game_over') {
      if (!this.gameOverShown) {
        this.gameOverShown = true;
        this.showGameOver();
      }
      return;
    }

    if (this.engineState.phase === 'level_complete') {
      if (!this.levelCompleteShown) {
        this.levelCompleteShown = true;
        this.showLevelComplete();
      }
      return;
    }

    if (this.engineState.phase !== 'playing') return;

    const dt = Math.min(delta, MAX_DELTA);

    // Tick engine
    const result = tick(this.engineState, dt, W, H);
    this.engineState = result.state;

    // Process events
    for (const event of result.events) {
      this.handleEvent(event);
    }

    // Sync visuals
    this.syncLaneItems();
    this.syncPlayerPosition();
    this.updateHUD();
    this.updateFloodMeter();
    this.updateFloodOverlays();
    this.updateInvincibility(dt);
    this.updateClouds(dt);
    this.updateWaterShimmer(dt);
  }

  // -----------------------------------------------------------------------
  // Cloud animation
  // -----------------------------------------------------------------------

  private updateClouds(dt: number): void {
    const dtSec = dt / 1000;
    for (const cloud of this.clouds) {
      cloud.gfx.x += cloud.speed * dtSec;
      // Wrap when the leftmost edge is past the right side
      const maxWidth = Math.max(...cloud.widths);
      if (cloud.gfx.x - maxWidth > W) {
        cloud.gfx.x = -maxWidth * 2;
      }
    }
  }

  // -----------------------------------------------------------------------
  // Water shimmer animation
  // -----------------------------------------------------------------------

  private updateWaterShimmer(dt: number): void {
    const dtSec = dt / 1000;
    for (const shimmer of this.waterShimmerLines) {
      shimmer.gfx.clear();
      for (let i = 0; i < shimmer.offsets.length; i++) {
        shimmer.offsets[i] += (15 + i * 5) * dtSec;
        if (shimmer.offsets[i] > W) shimmer.offsets[i] -= W + 80;

        const lineY = shimmer.laneY + shimmer.laneH * (0.25 + (i * 0.25));
        const lineW = 40 + i * 20;
        const alpha = 0.1 + (i % 2) * 0.1;

        shimmer.gfx.fillStyle(0xffffff, alpha);
        shimmer.gfx.fillRect(shimmer.offsets[i], lineY, lineW, 2);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  private handleEvent(event: GameEvent): void {
    switch (event.type) {
      case 'hop':
        // Hop animation handled in executeHop
        ArkHopperSFX.hop();
        break;
      case 'new_row_reached':
        this.showScorePopup(event.points, this.playerSprite.x, this.playerSprite.y);
        break;
      case 'star_collected':
        this.onStarCollected(event.itemId, event.points);
        break;
      case 'player_died':
        this.onPlayerDied(event.cause);
        break;
      case 'life_lost':
        this.flashLives();
        break;
      case 'respawn':
        this.onRespawn(event.row, event.col);
        break;
      case 'game_over':
        // Handled in update loop
        ArkHopperSFX.gameOver();
        break;
      case 'level_complete':
        // Handled in update loop
        ArkHopperSFX.levelComplete();
        break;
      case 'flood_row':
        this.onFloodRow(event.rowsFlooded);
        break;
      case 'flood_full':
        // Meter maxed; visual cue
        this.cameras.main.shake(200, 0.003);
        break;
      case 'momentum':
        ArkHopperSFX.momentum(event.chain);
        this.showMomentum(event.tier, event.chain, event.bonus);
        break;
      case 'verse_milestone':
        this.showVerseCard();
        break;
      case 'invincibility_start':
        this.invincibilityFlashTimer = GAME_CONSTANTS.INVINCIBLE_MS;
        break;
      case 'invincibility_end':
        this.invincibilityFlashTimer = 0;
        this.playerSprite.setAlpha(1);
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Lane item sync
  // -----------------------------------------------------------------------

  private syncLaneItems(): void {
    const activeIds = new Set<number>();

    for (let row = 0; row < this.engineState.lanes.length; row++) {
      const lane = this.engineState.lanes[row];
      const laneYCenter = H - (row + 1) * this.cellH + this.cellH / 2;

      for (const item of lane.items) {
        activeIds.add(item.id);

        if (item.itemType === 'star') {
          // Handle star sprites separately
          let starSprite = this.starSprites.get(item.id);
          if (!starSprite) {
            const starSize = Math.min(Math.floor(this.cellH * 0.5), 40);
            starSprite = createGameSprite(
              this, item.x + item.width / 2, laneYCenter,
              spriteKeyForItemType('star'), '⭐', starSize, starSize,
            );
            starSprite.setOrigin(0.5).setDepth(DEPTH_STARS);

            this.starSprites.set(item.id, starSprite);

            // Bobble tween
            const bobble = this.tweens.add({
              targets: starSprite,
              y: laneYCenter - 6,
              scaleX: 1.15,
              scaleY: 1.15,
              duration: 600,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
            this.starTweens.set(item.id, bobble);
          }
          starSprite.x = item.x + item.width / 2;
          continue;
        }

        // Moving items (obstacles, platforms)
        let sprite = this.laneItemSprites.get(item.id);
        if (!sprite) {
          const itemSize = Math.min(Math.floor(this.cellH * 0.65), 64);
          sprite = createGameSprite(
            this, item.x + item.width / 2, laneYCenter,
            spriteKeyForItemType(item.itemType), item.emoji, itemSize, itemSize,
          );
          sprite.setOrigin(0.5).setDepth(DEPTH_ITEMS);

          this.laneItemSprites.set(item.id, sprite);
        }

        sprite.x = item.x + item.width / 2;
        sprite.y = laneYCenter;
      }
    }

    // Clean up sprites for items no longer in engine
    for (const [id, sprite] of this.laneItemSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.laneItemSprites.delete(id);
      }
    }
    for (const [id, sprite] of this.starSprites) {
      if (!activeIds.has(id)) {
        const tween = this.starTweens.get(id);
        if (tween) { tween.destroy(); this.starTweens.delete(id); }
        sprite.destroy();
        this.starSprites.delete(id);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Player position sync (for platform riding)
  // -----------------------------------------------------------------------

  private syncPlayerPosition(): void {
    if (this.isHopping) return;

    const target = this.getPlayerPixelPos();

    if (this.engineState.player.riding !== null) {
      const lane = this.engineState.lanes[this.engineState.player.row];
      if (lane) {
        const platform = lane.items.find((it) => it.id === this.engineState.player.riding);
        if (platform) {
          const platformCenterX = platform.x + platform.width / 2;
          this.playerSprite.x = Phaser.Math.Linear(this.playerSprite.x, platformCenterX, 0.4);
          this.playerSprite.y = target.y;
        } else {
          this.playerSprite.x = Phaser.Math.Linear(this.playerSprite.x, target.x, 0.3);
          this.playerSprite.y = target.y;
        }
      }
    } else {
      this.playerSprite.x = Phaser.Math.Linear(this.playerSprite.x, target.x, 0.3);
      this.playerSprite.y = target.y;
    }
    this.playerShadow.setPosition(this.playerSprite.x, this.playerSprite.y + this.cellH * 0.3);
  }

  // -----------------------------------------------------------------------
  // HUD updates
  // -----------------------------------------------------------------------

  private prevDisplayScore = 0;

  private updateHUD(): void {
    const score = this.engineState.score;
    if (score !== this.prevDisplayScore) {
      this.prevDisplayScore = score;
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2, scaleY: 1.2,
        duration: 100, yoyo: true, ease: 'Back.easeOut',
      });
    }
    this.scoreText.setText(String(score));
    this.livesText.setText(this.heartsString(this.engineState.lives));
  }

  private flashLives(): void {
    this.tweens.add({
      targets: this.livesText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Red flash
    const flash = this.add
      .rectangle(CX, CY, W, H, 0xff0000, 0.25)
      .setDepth(DEPTH_OVERLAY - 10);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Score popup
  // -----------------------------------------------------------------------

  private showScorePopup(points: number, x: number, y: number): void {
    const popText = this.add
      .text(x, y - 20, `+${points}`, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_HUD - 1);

    this.tweens.add({
      targets: popText,
      y: y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popText.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Star collected
  // -----------------------------------------------------------------------

  private onStarCollected(itemId: number, points: number): void {
    ArkHopperSFX.starCollect(points);
    const sprite = this.starSprites.get(itemId);
    if (sprite) {
      // Sparkle burst
      this.spawnParticleBurst(sprite.x, sprite.y, 0xffd700, 8);

      // Scale up and fade
      this.tweens.add({
        targets: sprite,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          sprite.destroy();
          this.starSprites.delete(itemId);
          const tween = this.starTweens.get(itemId);
          if (tween) { tween.destroy(); this.starTweens.delete(itemId); }
        },
      });

      this.showScorePopup(points, sprite.x, sprite.y);
    }
  }

  // -----------------------------------------------------------------------
  // Player death
  // -----------------------------------------------------------------------

  private onPlayerDied(cause: 'obstacle' | 'water' | 'flood' | 'off_screen'): void {
    // Cancel any active hop
    this.isHopping = false;
    this.queuedHop = null;

    // Death sound based on cause
    if (cause === 'water' || cause === 'flood' || cause === 'off_screen') {
      ArkHopperSFX.deathWater();
    } else {
      ArkHopperSFX.deathObstacle();
    }

    // Screen shake
    this.cameras.main.shake(200, 0.008);

    if (cause === 'water' || cause === 'off_screen' || cause === 'flood') {
      this.playSplashAnimation();
    } else {
      this.playBumpAnimation();
    }
  }

  private playSplashAnimation(): void {
    const px = this.playerSprite.x;
    const py = this.playerSprite.y;

    // Blue splash circles
    for (let i = 0; i < 6; i++) {
      const circle = this.add
        .circle(px, py, 5, 0x2196f3, 0.7)
        .setDepth(DEPTH_PLAYER + 1);

      const angle = (Math.PI * 2 * i) / 6;
      const dist = 40 + Math.random() * 30;

      this.tweens.add({
        targets: circle,
        x: px + Math.cos(angle) * dist,
        y: py + Math.sin(angle) * dist,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => circle.destroy(),
      });
    }

    // Splash text
    const splash = this.add
      .text(px, py, '\u{1F4A6}', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_PLAYER + 2);

    this.tweens.add({
      targets: splash,
      y: py - 40,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => splash.destroy(),
    });

    // Player bounces up before respawn
    this.tweens.add({
      targets: this.playerSprite,
      y: py - 30,
      alpha: 0.3,
      duration: 300,
      ease: 'Quad.easeOut',
    });
  }

  private playBumpAnimation(): void {
    // Player knocked back slightly with shake
    const px = this.playerSprite.x;
    const py = this.playerSprite.y;

    this.tweens.add({
      targets: this.playerSprite,
      x: px + (Math.random() > 0.5 ? 10 : -10),
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    });

    // Star burst from impact
    this.spawnParticleBurst(px, py, 0xff6600, 5);
  }

  // -----------------------------------------------------------------------
  // Respawn
  // -----------------------------------------------------------------------

  private onRespawn(row: number, col: number): void {
    const { x, y } = getCellPixelPos(col, row, W, H, this.engineState.totalRows, this.engineState.totalCols);
    const flippedY = H - y;

    this.tweens.killTweensOf(this.playerSprite);
    this.tweens.killTweensOf(this.playerShadow);

    this.time.delayedCall(400, () => {
      this.playerSprite.setPosition(x, flippedY);
      this.playerSprite.setAlpha(1);
      this.playerShadow.setPosition(x, flippedY + this.cellH * 0.3);

      // Pop-in scale
      this.playerSprite.setScale(0.3);
      this.tweens.add({
        targets: this.playerSprite,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        ease: 'Back.easeOut',
      });
    });
  }

  // -----------------------------------------------------------------------
  // Invincibility flash
  // -----------------------------------------------------------------------

  private updateInvincibility(dt: number): void {
    if (this.engineState.invincibleMs > 0) {
      this.invincibilityFlashTimer -= dt;
      // Rapid alpha toggle for flashing effect
      const flash = Math.floor(this.invincibilityFlashTimer / 100) % 2 === 0;
      this.playerSprite.setAlpha(flash ? 1 : 0.3);
    } else if (this.invincibilityFlashTimer > 0) {
      this.invincibilityFlashTimer = 0;
      this.playerSprite.setAlpha(1);
    }
  }

  // -----------------------------------------------------------------------
  // Flood overlay
  // -----------------------------------------------------------------------

  private updateFloodOverlays(): void {
    const flooded = this.engineState.floodedRows;

    // Add overlays for newly flooded rows
    while (this.floodOverlays.length < flooded) {
      const row = this.floodOverlays.length;
      const yPixel = H - (row + 1) * this.cellH + this.cellH / 2;

      const overlay = this.add
        .rectangle(CX, yPixel, W, this.cellH, 0x1565c0, 0)
        .setDepth(DEPTH_LANES + 5);

      // Animate flooding in
      this.tweens.add({
        targets: overlay,
        alpha: 0.7,
        duration: 500,
        ease: 'Quad.easeIn',
      });

      this.floodOverlays.push(overlay);
    }
  }

  private onFloodRow(rowsFlooded: number): void {
    // Slight screen shake when row floods
    this.cameras.main.shake(150, 0.004);
  }

  // -----------------------------------------------------------------------
  // Momentum display
  // -----------------------------------------------------------------------

  private showMomentum(tier: MomentumTier, chain: number, bonus: number): void {
    if (!tier) return;

    const labels: Record<string, string> = {
      nice: 'Nice!',
      great: 'Great!',
      amazing: 'Amazing!',
      unstoppable: 'UNSTOPPABLE!',
    };

    const colors: Record<string, string> = {
      nice: '#4CAF50',
      great: '#2196F3',
      amazing: '#9C27B0',
      unstoppable: GOLD_HEX,
    };

    this.momentumText.setText(`${labels[tier]} ${chain}x`);
    this.momentumText.setColor(colors[tier] ?? GOLD_HEX);
    this.momentumText.setAlpha(1);
    this.momentumText.setScale(1.4);

    this.tweens.add({
      targets: this.momentumText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: this.momentumText,
      alpha: 0,
      duration: 300,
      delay: 1000,
      ease: 'Quad.easeIn',
    });

    // Show bonus points
    if (bonus > 0) {
      this.showScorePopup(bonus, CX, 130);
    }
  }

  // -----------------------------------------------------------------------
  // Particle burst
  // -----------------------------------------------------------------------

  private spawnParticleBurst(x: number, y: number, color: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 50;
      const size = 3 + Math.random() * 4;

      const dot = this.add
        .circle(x, y, size, color)
        .setAlpha(0.9)
        .setDepth(DEPTH_PLAYER + 5);

      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // Landing dust puff
  // -----------------------------------------------------------------------

  private spawnLandingDust(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 1.2;
      const dist = 15 + Math.random() * 20;
      const dot = this.add
        .circle(x + (Math.random() - 0.5) * 10, y, 3 + Math.random() * 3, 0xddccaa, 0.6)
        .setDepth(DEPTH_PLAYER - 2);

      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist * 0.5,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 250 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // Verse card overlay (matches MannaCatch pattern exactly)
  // -----------------------------------------------------------------------

  private showVerseCard(): void {
    this.paused = true;

    const verse: ArkHopperVerse =
      arkHopperVerses[this.verseIndex % arkHopperVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 520;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    // Card background
    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    // Verse reference
    const refText = this.add
      .text(CX, CY - 180, verse.reference, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Verse text
    const verseTxt = this.add
      .text(CX, CY - 50, `"${verse.verse}"`, {
        fontSize: '24px',
        color: '#2D2D2D',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Kid prompt
    const promptTxt = this.add
      .text(CX, CY + 100, verse.kidPrompt, {
        fontSize: '20px',
        fontStyle: 'italic',
        color: '#5A5A5A',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Continue button
    const btnW = 260;
    const btnH = 64;
    const btnY = CY + 200;

    const btnBg = this.add
      .rectangle(CX, btnY, btnW, btnH, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const btnText = this.add
      .text(CX, btnY, 'Continue', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 4);

    // Fade in all elements
    const elements = [overlay, card, refText, verseTxt, promptTxt, btnBg, btnText];
    for (const el of elements) {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: el === overlay ? OVERLAY_ALPHA : 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    }

    btnBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      for (const el of elements) {
        this.tweens.add({
          targets: el,
          alpha: 0,
          duration: 200,
          ease: 'Quad.easeIn',
          onComplete: () => el.destroy(),
        });
      }

      this.time.delayedCall(250, () => {
        this.paused = false;
      });
    });
  }

  // -----------------------------------------------------------------------
  // Pause overlay
  // -----------------------------------------------------------------------

  private showPauseOverlay(): void {
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 0.6)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    const pauseTitle = this.add
      .text(CX, CY - 80, 'Paused', {
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 1);

    const resumeBg = this.add
      .rectangle(CX, CY + 20, 260, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 2);

    const resumeText = this.add
      .text(CX, CY + 20, 'Resume', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 3);

    const quitText = this.add
      .text(CX, CY + 100, 'Back to Home', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const elements = [overlay, pauseTitle, resumeBg, resumeText, quitText];

    resumeBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      for (const el of elements) el.destroy();
      this.paused = false;
    });

    quitText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('arkhopper:back');
    });
  }

  // -----------------------------------------------------------------------
  // Level Complete
  // -----------------------------------------------------------------------

  private showLevelComplete(): void {
    this.paused = true;

    // Show scripture first, then level stats on dismiss
    this.showLevelVerseCard(() => {
      this.showLevelCompleteCard();
    });
  }

  private showLevelVerseCard(onDismiss: () => void): void {
    const verse = arkHopperVerses[this.verseIndex % arkHopperVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 520;

    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    const refText = this.add
      .text(CX, CY - 180, verse.reference, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const verseTxt = this.add
      .text(CX, CY - 50, `"${verse.verse}"`, {
        fontSize: '24px',
        color: '#2D2D2D',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const promptTxt = this.add
      .text(CX, CY + 100, verse.kidPrompt, {
        fontSize: '20px',
        fontStyle: 'italic',
        color: '#5A5A5A',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const btnBg = this.add
      .rectangle(CX, CY + 200, 260, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const btnText = this.add
      .text(CX, CY + 200, 'Continue', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 4);

    const elements = [overlay, card, refText, verseTxt, promptTxt, btnBg, btnText];
    for (const el of elements) {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: el === overlay ? OVERLAY_ALPHA : 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    }

    btnBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      for (const el of elements) {
        this.tweens.add({
          targets: el,
          alpha: 0,
          duration: 200,
          ease: 'Quad.easeIn',
          onComplete: () => el.destroy(),
        });
      }
      this.time.delayedCall(250, onDismiss);
    });
  }

  private showLevelCompleteCard(): void {
    // Freeze all items
    for (const [, sprite] of this.laneItemSprites) {
      this.tweens.add({
        targets: sprite,
        alpha: 0.4,
        duration: 400,
        ease: 'Quad.easeOut',
      });
    }

    // Celebratory particle burst at ark
    const arkY = H - (this.engineState.totalRows - 0.5) * this.cellH;
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnParticleBurst(
          CX + (Math.random() - 0.5) * 200,
          arkY + (Math.random() - 0.5) * 40,
          GOLD,
          10,
        );
      });
    }

    // Rainbow emoji celebration
    const rainbow = this.add
      .text(CX, arkY - 60, '\u{1F308}', { fontSize: '64px' })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(DEPTH_OVERLAY - 1);

    this.tweens.add({
      targets: rainbow,
      alpha: 1,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut',
    });

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 0)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    this.tweens.add({
      targets: overlay,
      alpha: 0.5,
      duration: 500,
      delay: 600,
      ease: 'Quad.easeOut',
    });

    // Stats card slides in
    const cardW = 620;
    const cardH = 520;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    const title = this.add
      .text(CX, H + cardH - 200, 'Safe on the Ark!', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const arkEmoji = this.add
      .text(CX, H + cardH - 150, '\u{1F6A2}', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const elapsedSec = (this.engineState.elapsedMs / 1000).toFixed(1);
    const stats = [
      `Score: ${this.engineState.score}`,
      `Time: ${elapsedSec}s`,
      `Stars: ${this.engineState.starsCollected} / ${this.engineState.totalStarsInLevel}`,
      this.engineState.diedThisLevel ? '' : 'Perfect Crossing! +200',
    ].filter(Boolean);

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const color = stat.includes('Perfect') ? GOLD_HEX : '#2D2D2D';
      const t = this.add
        .text(CX, H + cardH - 80 + i * 40, stat, {
          fontSize: '22px',
          fontStyle: stat.includes('Perfect') ? 'bold' : 'normal',
          color,
          fontFamily: FONT,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_OVERLAY + 2);
      statTexts.push(t);
    });

    // Next Level button
    const nextBtnY = H + cardH + 120;
    const hasNextLevel = this.currentLevel < 20;

    const nextBg = this.add
      .rectangle(CX, nextBtnY, 300, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const nextText = this.add
      .text(CX, nextBtnY, hasNextLevel ? 'Next Level' : 'Victory!', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 4);

    const backText = this.add
      .text(CX, H + cardH + 190, 'Back to Home', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 4);

    // Slide all card elements up
    const slideTargets = [
      { obj: card, targetY: cardY },
      { obj: title, targetY: cardY - 200 },
      { obj: arkEmoji, targetY: cardY - 150 },
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY - 80 + i * 40 })),
      { obj: nextBg, targetY: cardY + 120 },
      { obj: nextText, targetY: cardY + 120 },
      { obj: backText, targetY: cardY + 190 },
    ];

    for (const { obj, targetY } of slideTargets) {
      this.tweens.add({
        targets: obj,
        y: targetY,
        duration: 500,
        delay: 800,
        ease: 'Back.easeOut',
      });
    }

    // Button handlers
    nextBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      if (hasNextLevel) {
        this.currentLevel += 1;
        this.scene.restart({ level: this.currentLevel });
      } else {
        // Completed all levels
        this.game.events.emit('arkhopper:complete', {
          score: this.engineState.score,
          level: this.currentLevel,
          totalStars: this.engineState.totalStars,
        });
        this.game.events.emit('arkhopper:back');
      }
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('arkhopper:complete', {
        score: this.engineState.score,
        level: this.currentLevel,
        totalStars: this.engineState.totalStars,
      });
      this.game.events.emit('arkhopper:back');
    });
  }

  // -----------------------------------------------------------------------
  // Game Over
  // -----------------------------------------------------------------------

  private showGameOver(): void {
    this.paused = true;

    // Freeze and darken all items
    for (const [, sprite] of this.laneItemSprites) {
      this.tweens.add({
        targets: sprite,
        alpha: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
      });
    }

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 0)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 500,
      ease: 'Quad.easeOut',
    });

    // Stats card slides in
    const cardW = 620;
    const cardH = 480;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    const title = this.add
      .text(CX, H + cardH - 180, 'The Flood Came!', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const floodEmoji = this.add
      .text(CX, H + cardH - 130, '\u{1F30A}', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Check for new high score
    const prevHighScore = useArkHopperStore.getState().highScore;
    const isNewBest = this.engineState.score > prevHighScore && this.engineState.score > 0;

    // "NEW BEST!" text (created off-screen, slides up with card)
    let newBestText: Phaser.GameObjects.Text | null = null;
    if (isNewBest) {
      newBestText = this.add
        .text(CX, H + cardH - 80, 'NEW BEST!', {
          fontSize: '28px',
          fontStyle: 'bold',
          color: GOLD_HEX,
          fontFamily: FONT,
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_OVERLAY + 2);
    }

    const statsStartY = isNewBest ? -30 : -60;
    const stats = [
      `Final Score: ${this.engineState.score}`,
      `Level Reached: ${this.currentLevel}`,
      `Stars Collected: ${this.engineState.totalStars}`,
      `Total Hops: ${this.engineState.totalHops}`,
    ];

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const t = this.add
        .text(CX, H + cardH + statsStartY + i * 44, stat, {
          fontSize: '22px',
          color: '#2D2D2D',
          fontFamily: FONT,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_OVERLAY + 2);
      statTexts.push(t);
    });

    // Buttons
    const playBtnY = H + cardH + 130;
    const backBtnY = H + cardH + 200;

    const playBg = this.add
      .rectangle(CX, playBtnY, 300, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const playText = this.add
      .text(CX, playBtnY, 'Try Again', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 4);

    const backText = this.add
      .text(CX, backBtnY, 'Back to Home', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 4);

    // Slide all card elements up
    const slideTargets: { obj: Phaser.GameObjects.GameObject & { y: number }; targetY: number }[] = [
      { obj: card, targetY: cardY },
      { obj: title, targetY: cardY - 180 },
      { obj: floodEmoji, targetY: cardY - 130 },
      ...(newBestText ? [{ obj: newBestText, targetY: cardY - 80 }] : []),
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY + statsStartY + i * 44 })),
      { obj: playBg, targetY: cardY + 130 },
      { obj: playText, targetY: cardY + 130 },
      { obj: backText, targetY: cardY + 200 },
    ];

    for (const { obj, targetY } of slideTargets) {
      this.tweens.add({
        targets: obj,
        y: targetY,
        duration: 500,
        delay: 300,
        ease: 'Back.easeOut',
      });
    }

    // New high score celebration effects
    if (isNewBest) {
      this.time.delayedCall(800, () => {
        SharedSFX.milestone();
        // Particle burst around the "NEW BEST!" text
        this.spawnParticleBurst(CX, cardY - 80, 0xffd700, 12);
        this.spawnParticleBurst(CX - 80, cardY - 80, GOLD, 8);
        this.spawnParticleBurst(CX + 80, cardY - 80, GOLD, 8);
      });
    }

    // Button handlers
    playBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.scene.restart({ level: 1 });
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('arkhopper:back');
    });

    // Emit complete event
    this.game.events.emit('arkhopper:complete', {
      score: this.engineState.score,
      level: this.currentLevel,
      totalStars: this.engineState.totalStars,
    });
  }
}
