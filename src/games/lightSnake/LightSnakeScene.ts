import Phaser from 'phaser';
import {
  createInitialState,
  changeDirection,
  tick,
  type GameState,
  type GameEvent,
  type Direction,
  type FoodItem,
} from './gameEngine';
import { GAME_CONSTANTS } from './config';
import { SPRITE_MAP } from './spriteMap';
import { lightSnakeVerses, type LightSnakeVerse } from './verses';
import { LightSnakeSFX, unlockAudio } from './sounds';
import { SharedSFX } from '../../utils/soundEngine';
import { createGameSprite, type GameSprite } from '../../utils/spriteHelper';
import { useLightSnakeStore } from '../../stores/lightSnakeStore';

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
const VERSE_CARD_BG = 0xfff8e7;
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.5;
const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];
const COUNTDOWN_STEP_MS = 375;

// Theme colors (darkness/light)
const BG_DARK_TOP = 0x0a0a1a;
const BG_DARK_BOTTOM = 0x1a1035;
const GRID_LINE_COLOR = 0x222244;
const GRID_LINE_ALPHA = 0.25;
const HEAD_GLOW_COLOR = 0xd4c36a;
const TRAIL_COLOR = 0xd4c36a;
const DEATH_FLASH_COLOR = 0xff0000;

// Depth layers
const DEPTH_BG = 10;
const DEPTH_GRID = 15;
const DEPTH_ITEMS = 30;
const DEPTH_SNAKE = 50;
const DEPTH_GLOW = 45;
const DEPTH_HUD = 100;
const DEPTH_OVERLAY = 200;

const MAX_DELTA = 100;
const SWIPE_THRESHOLD = 30;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class LightSnakeScene extends Phaser.Scene {
  // Engine state
  private engineState!: GameState;

  // Grid dimensions (pixels)
  private cellW = 0;
  private cellH = 0;
  private gridOffsetX = 0;
  private gridOffsetY = 0;

  // Snake rendering
  private headSprite!: GameSprite;
  private headGlow!: Phaser.GameObjects.Graphics;
  private trailSprites: GameSprite[] = [];

  // Food and thorn sprites
  private foodSprites = new Map<string, { sprite: GameSprite; bobTween: Phaser.Tweens.Tween }>();
  private thornSprites = new Map<string, GameSprite>();

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private lengthText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  // Flags
  private paused = false;
  private gameStarted = false;
  private gameOverShown = false;

  // Input tracking
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartTime = 0;

  // Verse tracking
  private verseIndex = 0;

  // Previous state for diff rendering
  private prevScore = 0;

  constructor() {
    super('LightSnakeScene');
  }

  preload(): void {
    // Transform SPRITE_MAP (Record<string, SpriteEntry>) to Record<string, string> for preload
    // Silently skip missing files so emoji fallback works
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      if (this.textures.exists(file.key)) {
        this.textures.remove(file.key);
      }
    });

    for (const [key, entry] of Object.entries(SPRITE_MAP)) {
      this.load.image(key, entry.path);
    }
  }

  create(): void {
    // Reset flags
    this.paused = false;
    this.gameStarted = false;
    this.gameOverShown = false;
    this.prevScore = 0;
    this.trailSprites = [];
    this.foodSprites.clear();
    this.thornSprites.clear();

    // Create engine state
    this.engineState = createInitialState(
      GAME_CONSTANTS.GRID_COLS,
      GAME_CONSTANTS.GRID_ROWS,
    );

    // Compute grid layout (centered in canvas with padding)
    this.computeGridLayout();

    // Build visual layers
    this.buildBackground();
    this.buildGridLines();
    this.buildSnake();
    this.syncFood();
    this.syncThorns();
    this.createHUD();
    this.setupInput();
    unlockAudio();

    // Start countdown
    this.showCountdown();
  }

  // -----------------------------------------------------------------------
  // Grid layout
  // -----------------------------------------------------------------------

  private computeGridLayout(): void {
    const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;

    // Reserve space for HUD at top (110px) and small padding at bottom (20px)
    const hudHeight = 110;
    const bottomPad = 20;
    const availableH = H - hudHeight - bottomPad;
    const availableW = W - 40; // 20px padding each side

    this.cellW = Math.floor(availableW / GRID_COLS);
    this.cellH = Math.floor(availableH / GRID_ROWS);

    // Use the smaller to keep cells square
    const cellSize = Math.min(this.cellW, this.cellH);
    this.cellW = cellSize;
    this.cellH = cellSize;

    // Center the grid
    const gridW = this.cellW * GRID_COLS;
    const gridH = this.cellH * GRID_ROWS;
    this.gridOffsetX = Math.floor((W - gridW) / 2);
    this.gridOffsetY = hudHeight + Math.floor((availableH - gridH) / 2);
  }

  /** Convert grid position to pixel center. */
  private gridToPixel(gx: number, gy: number): { x: number; y: number } {
    return {
      x: this.gridOffsetX + gx * this.cellW + this.cellW / 2,
      y: this.gridOffsetY + gy * this.cellH + this.cellH / 2,
    };
  }

  /** Unique key for a food item based on position and type. */
  private foodKey(f: FoodItem): string {
    return `${f.pos.x},${f.pos.y},${f.type}`;
  }

  /** Unique key for a thorn based on position. */
  private thornKey(pos: { x: number; y: number }): string {
    return `${pos.x},${pos.y}`;
  }

  // -----------------------------------------------------------------------
  // Background
  // -----------------------------------------------------------------------

  private buildBackground(): void {
    const gfx = this.add.graphics();
    gfx.setDepth(DEPTH_BG);

    // Dark gradient: deep blue-black at top to dark purple at bottom
    gfx.fillGradientStyle(BG_DARK_TOP, BG_DARK_TOP, BG_DARK_BOTTOM, BG_DARK_BOTTOM, 1);
    gfx.fillRect(0, 0, W, H);

    // Scatter faint "stars" for ambiance
    const starGfx = this.add.graphics();
    starGfx.setDepth(DEPTH_BG + 1);
    for (let i = 0; i < 30; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * this.gridOffsetY; // Stars only in HUD area / above grid
      const sr = 0.5 + Math.random() * 1.5;
      const sa = 0.15 + Math.random() * 0.25;
      starGfx.fillStyle(0xffffff, sa);
      starGfx.fillCircle(sx, sy, sr);
    }
  }

  // -----------------------------------------------------------------------
  // Grid lines
  // -----------------------------------------------------------------------

  private buildGridLines(): void {
    const gfx = this.add.graphics();
    gfx.setDepth(DEPTH_GRID);

    const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
    const gridW = this.cellW * GRID_COLS;
    const gridH = this.cellH * GRID_ROWS;

    gfx.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);

    // Vertical lines
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = this.gridOffsetX + c * this.cellW;
      gfx.moveTo(x, this.gridOffsetY);
      gfx.lineTo(x, this.gridOffsetY + gridH);
    }

    // Horizontal lines
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = this.gridOffsetY + r * this.cellH;
      gfx.moveTo(this.gridOffsetX, y);
      gfx.lineTo(this.gridOffsetX + gridW, y);
    }

    gfx.strokePath();

    // Faint border around the grid
    gfx.lineStyle(2, GRID_LINE_COLOR, GRID_LINE_ALPHA * 1.5);
    gfx.strokeRect(this.gridOffsetX, this.gridOffsetY, gridW, gridH);
  }

  // -----------------------------------------------------------------------
  // Snake rendering
  // -----------------------------------------------------------------------

  private buildSnake(): void {
    const head = this.engineState.snake[0];
    const { x, y } = this.gridToPixel(head.x, head.y);
    const spriteSize = Math.floor(this.cellW * 0.8);

    // Head glow (drawn behind the head)
    this.headGlow = this.add.graphics();
    this.headGlow.setDepth(DEPTH_GLOW);
    this.drawHeadGlow(x, y);

    // Pulsing glow
    this.tweens.add({
      targets: this.headGlow,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Head sprite (lantern)
    this.headSprite = createGameSprite(
      this, x, y, 'lantern', SPRITE_MAP['lantern'].emoji,
      spriteSize, spriteSize,
    );
    this.headSprite.setOrigin(0.5).setDepth(DEPTH_SNAKE + 1);

    // Initial trail segments
    this.rebuildTrail();
  }

  private drawHeadGlow(x: number, y: number): void {
    this.headGlow.clear();
    this.headGlow.setPosition(x, y);

    // Radial glow using concentric circles
    const maxR = this.cellW * 1.5;
    const steps = 10;
    for (let i = steps; i >= 0; i--) {
      const r = maxR * (i / steps);
      const a = 0.02 + 0.12 * (1 - i / steps);
      this.headGlow.fillStyle(HEAD_GLOW_COLOR, a);
      this.headGlow.fillCircle(0, 0, r);
    }
  }

  private rebuildTrail(): void {
    // Destroy existing trail sprites
    for (const s of this.trailSprites) {
      s.destroy();
    }
    this.trailSprites = [];

    const spriteSize = Math.floor(this.cellW * 0.55);
    const snake = this.engineState.snake;

    // Build trail segments (skip head at index 0)
    for (let i = 1; i < snake.length; i++) {
      const seg = snake[i];
      const { x, y } = this.gridToPixel(seg.x, seg.y);

      const trailSprite = createGameSprite(
        this, x, y, 'light-trail', SPRITE_MAP['light-trail'].emoji,
        spriteSize, spriteSize,
      );
      trailSprite.setOrigin(0.5).setDepth(DEPTH_SNAKE);

      // Fade opacity from head to tail
      const alpha = 0.9 - (i / snake.length) * 0.65;
      trailSprite.setAlpha(Math.max(0.15, alpha));

      this.trailSprites.push(trailSprite);
    }
  }

  private syncSnakeVisuals(): void {
    const snake = this.engineState.snake;
    const head = snake[0];
    const { x: hx, y: hy } = this.gridToPixel(head.x, head.y);

    // Move head
    this.headSprite.setPosition(hx, hy);
    this.drawHeadGlow(hx, hy);

    // Sync trail: if length changed, rebuild. Otherwise just reposition.
    if (this.trailSprites.length !== snake.length - 1) {
      this.rebuildTrail();
    } else {
      for (let i = 1; i < snake.length; i++) {
        const seg = snake[i];
        const { x, y } = this.gridToPixel(seg.x, seg.y);
        this.trailSprites[i - 1].setPosition(x, y);

        // Update alpha gradient
        const alpha = 0.9 - (i / snake.length) * 0.65;
        this.trailSprites[i - 1].setAlpha(Math.max(0.15, alpha));
      }
    }
  }

  // -----------------------------------------------------------------------
  // Food sync
  // -----------------------------------------------------------------------

  private syncFood(): void {
    const activeFoodKeys = new Set<string>();

    for (const food of this.engineState.food) {
      const key = this.foodKey(food);
      activeFoodKeys.add(key);

      if (this.foodSprites.has(key)) continue;

      // Spawn new food sprite
      const { x, y } = this.gridToPixel(food.pos.x, food.pos.y);
      const spriteSize = Math.floor(this.cellW * 0.7);

      const sprite = createGameSprite(
        this, x, y, food.type, SPRITE_MAP[food.type]?.emoji ?? food.emoji,
        spriteSize, spriteSize,
      );
      sprite.setOrigin(0.5).setDepth(DEPTH_ITEMS);

      // Gentle bob animation
      const bobTween = this.tweens.add({
        targets: sprite,
        y: y - 4,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.foodSprites.set(key, { sprite, bobTween });
    }

    // Remove stale food sprites
    for (const [key, { sprite, bobTween }] of this.foodSprites) {
      if (!activeFoodKeys.has(key)) {
        bobTween.destroy();
        sprite.destroy();
        this.foodSprites.delete(key);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Thorn sync
  // -----------------------------------------------------------------------

  private syncThorns(): void {
    const activeThornKeys = new Set<string>();

    for (const thorn of this.engineState.thorns) {
      const key = this.thornKey(thorn.pos);
      activeThornKeys.add(key);

      if (this.thornSprites.has(key)) continue;

      // Spawn new thorn sprite
      const { x, y } = this.gridToPixel(thorn.pos.x, thorn.pos.y);
      const spriteSize = Math.floor(this.cellW * 0.65);

      const sprite = createGameSprite(
        this, x, y, 'thorn', SPRITE_MAP['thorn'].emoji,
        spriteSize, spriteSize,
      );
      sprite.setOrigin(0.5).setDepth(DEPTH_ITEMS);

      // Slight random rotation for variety
      sprite.setRotation((Math.random() - 0.5) * 0.4);

      this.thornSprites.set(key, sprite);
    }

    // Remove stale thorn sprites
    for (const [key, sprite] of this.thornSprites) {
      if (!activeThornKeys.has(key)) {
        sprite.destroy();
        this.thornSprites.delete(key);
      }
    }
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
      this.game.events.emit('lightsnake:back');
    });

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

    // Snake length (top right)
    this.lengthText = this.add
      .text(W - 30, 44, '🔆 3', {
        fontSize: '24px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH_HUD);

    // Combo text (hidden initially, below score)
    this.comboText = this.add
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

  private updateHUD(): void {
    const score = this.engineState.score;
    if (score !== this.prevScore) {
      this.prevScore = score;
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }
    this.scoreText.setText(String(score));
    this.lengthText.setText(`🔆 ${this.engineState.snake.length}`);
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

      if (dist >= SWIPE_THRESHOLD) {
        let direction: Direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy < 0 ? 'up' : 'down';
        }
        this.applyDirection(direction);
      }
    });

    // Keyboard
    if (this.input.keyboard) {
      const kb = this.input.keyboard;

      kb.on('keydown-UP', () => this.applyDirection('up'));
      kb.on('keydown-DOWN', () => this.applyDirection('down'));
      kb.on('keydown-LEFT', () => this.applyDirection('left'));
      kb.on('keydown-RIGHT', () => this.applyDirection('right'));
      kb.on('keydown-W', () => this.applyDirection('up'));
      kb.on('keydown-S', () => this.applyDirection('down'));
      kb.on('keydown-A', () => this.applyDirection('left'));
      kb.on('keydown-D', () => this.applyDirection('right'));

      kb.on('keydown-SPACE', () => this.togglePause());
      kb.on('keydown-ESC', () => this.togglePause());
    }
  }

  private applyDirection(dir: Direction): void {
    if (!this.gameStarted || this.paused) return;
    if (this.engineState.phase !== 'playing') return;

    const newState = changeDirection(this.engineState, dir);
    if (newState !== this.engineState) {
      this.engineState = newState;
      LightSnakeSFX.turn();
    }
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

      if (label === 'GO!') {
        SharedSFX.countdownGo();
      } else {
        SharedSFX.countdown();
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

    if (this.engineState.phase !== 'playing') return;

    const dt = Math.min(delta, MAX_DELTA);

    // Tick engine
    const result = tick(this.engineState, dt);
    this.engineState = result.state;

    // Process events
    for (const event of result.events) {
      this.handleEvent(event);
    }

    // Sync visuals
    this.syncSnakeVisuals();
    this.syncFood();
    this.syncThorns();
    this.updateHUD();
  }

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  private handleEvent(event: GameEvent): void {
    switch (event.type) {
      case 'moved':
        // Normal movement, no special effect
        break;

      case 'food_eaten':
        this.onFoodEaten(event.item, event.points);
        break;

      case 'grew':
        LightSnakeSFX.grow(this.engineState.snake.length);
        break;

      case 'combo':
        this.showCombo(event.count);
        break;

      case 'speed_up':
        this.showSpeedUp();
        break;

      case 'thorn_hit':
      case 'wall_hit':
      case 'self_hit':
        this.onDeath();
        break;

      case 'game_over':
        LightSnakeSFX.gameOver();
        break;

      case 'verse_milestone':
        LightSnakeSFX.milestone();
        this.showVerseCard();
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Food eaten
  // -----------------------------------------------------------------------

  private onFoodEaten(item: FoodItem, points: number): void {
    LightSnakeSFX.eat(this.engineState.combo);

    const { x, y } = this.gridToPixel(item.pos.x, item.pos.y);

    // Gold particle burst
    this.spawnParticleBurst(x, y, 0xffd700, 8);

    // Score popup
    this.showScorePopup(points, x, y);
  }

  // -----------------------------------------------------------------------
  // Death effects
  // -----------------------------------------------------------------------

  private onDeath(): void {
    LightSnakeSFX.death();

    // Red flash
    const flash = this.add
      .rectangle(CX, CY, W, H, DEATH_FLASH_COLOR, 0.3)
      .setDepth(DEPTH_OVERLAY - 10);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });

    // Screen shake
    this.cameras.main.shake(250, 0.01);
  }

  // -----------------------------------------------------------------------
  // Combo display
  // -----------------------------------------------------------------------

  private showCombo(count: number): void {
    const labels: Record<number, string> = {
      2: 'Combo x2!',
      3: 'Combo x3!',
      4: 'Combo x4!',
      5: 'COMBO x5!',
    };

    const label = count >= 5
      ? `COMBO x${count}!`
      : labels[count] ?? `Combo x${count}!`;

    this.comboText.setText(label);
    this.comboText.setAlpha(1);
    this.comboText.setScale(1.4);

    this.tweens.add({
      targets: this.comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      duration: 300,
      delay: 800,
      ease: 'Quad.easeIn',
    });
  }

  // -----------------------------------------------------------------------
  // Speed Up flash
  // -----------------------------------------------------------------------

  private showSpeedUp(): void {
    const txt = this.add
      .text(CX, CY - 100, 'Speed Up!', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#FF6600',
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(DEPTH_HUD + 5);

    this.tweens.add({
      targets: txt,
      alpha: 1,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: txt,
      alpha: 0,
      y: CY - 160,
      duration: 400,
      delay: 600,
      ease: 'Quad.easeIn',
      onComplete: () => txt.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Score popup
  // -----------------------------------------------------------------------

  private showScorePopup(points: number, x: number, y: number): void {
    const popText = this.add
      .text(x, y - 10, `+${points}`, {
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
      y: y - 70,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popText.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Particle burst
  // -----------------------------------------------------------------------

  private spawnParticleBurst(x: number, y: number, color: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 50 + Math.random() * 40;
      const size = 2 + Math.random() * 3;

      const dot = this.add
        .circle(x, y, size, color)
        .setAlpha(0.9)
        .setDepth(DEPTH_SNAKE + 5);

      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 300 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // Verse card overlay
  // -----------------------------------------------------------------------

  private showVerseCard(): void {
    this.paused = true;

    const verse: LightSnakeVerse =
      lightSnakeVerses[this.verseIndex % lightSnakeVerses.length];
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

    let dismissing = false;
    btnBg.on('pointerdown', () => {
      if (dismissing) return;
      dismissing = true;
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
        this.engineState = { ...this.engineState, moveTimer: 0 };
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
      this.game.events.emit('lightsnake:back');
    });
  }

  // -----------------------------------------------------------------------
  // Game Over
  // -----------------------------------------------------------------------

  private showGameOver(): void {
    this.paused = true;

    // Persist stats to store
    useLightSnakeStore.getState().recordGame(this.engineState.score, this.engineState.combo, this.engineState.snake.length, this.engineState.itemsEaten);

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

    // Stats card slides in from bottom
    const cardW = 620;
    const cardH = 480;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    const title = this.add
      .text(CX, H + cardH - 180, 'The Light Faded', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const themeEmoji = this.add
      .text(CX, H + cardH - 130, '🕯️', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Check for new high score
    const prevHighScore = useLightSnakeStore.getState().highScore;
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

    const elapsedSec = (this.engineState.elapsedMs / 1000).toFixed(1);
    const statsStartY = isNewBest ? -30 : -60;
    const stats = [
      `Final Score: ${this.engineState.score}`,
      `Length: ${this.engineState.snake.length}`,
      `Items Collected: ${this.engineState.itemsEaten}`,
      `Time: ${elapsedSec}s`,
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
      { obj: themeEmoji, targetY: cardY - 130 },
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
      this.scene.restart();
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('lightsnake:back');
    });

    // Emit complete event
    this.game.events.emit('lightsnake:complete', {
      score: this.engineState.score,
      combo: this.engineState.combo,
      length: this.engineState.snake.length,
      itemsEaten: this.engineState.itemsEaten,
    });
  }

  // -----------------------------------------------------------------------
  // Shutdown (cleanup on scene destroy)
  // -----------------------------------------------------------------------

  shutdown(): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    for (const s of this.trailSprites) {
      s.destroy();
    }
    this.trailSprites = [];

    for (const [, { sprite, bobTween }] of this.foodSprites) {
      bobTween.destroy();
      sprite.destroy();
    }
    this.foodSprites.clear();

    for (const [, sprite] of this.thornSprites) {
      sprite.destroy();
    }
    this.thornSprites.clear();

    if (this.headSprite) this.headSprite.destroy();
    if (this.headGlow) this.headGlow.destroy();

    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
