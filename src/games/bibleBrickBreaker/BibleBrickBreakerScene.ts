import Phaser from 'phaser';
import {
  createGame,
  tick,
  movePaddle,
  launchBall,
} from './gameEngine';
import type { GameState, GameEvent } from './types';
import { GAME_CONSTANTS } from './config';
import { SPRITE_MAP } from './spriteMap';
import {
  bibleBrickBreakerVerses,
  type BibleBrickBreakerVerse,
} from './verses';
import { BibleBrickBreakerSFX, unlockAudio } from './sounds';
import { SharedSFX } from '../../utils/soundEngine';
import { createGameSprite, type GameSprite } from '../../utils/spriteHelper';
import { useBibleBrickBreakerStore } from '../../stores/bibleBrickBreakerStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const {
  CANVAS_W: W,
  CANVAS_H: H,
  BRICK_COLS,
  BRICK_W,
  BRICK_H,
  BRICK_PADDING,
  BRICK_OFFSET_X,
  BRICK_OFFSET_Y,
  PADDLE_W,
  PADDLE_Y,
  BALL_RADIUS,
  POWERUP_SIZE,
  COUNTDOWN_STEPS,
  COUNTDOWN_STEP_MS,
} = GAME_CONSTANTS;

const CX = W / 2;
const CY = H / 2;
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const GOLD = 0xd4c36a;
const GOLD_HEX = '#D4C36A';
const VERSE_CARD_BG = 0xfff8e7;
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.5;

// Background gradient
const BG_TOP = 0x0a0a2e;
const BG_BOTTOM = 0x1a1040;

// Brick colors
const CLAY_COLOR = 0xc4956a;
const STONE_COLOR = 0x8b8b8b;
const GOLD_BRICK_COLOR = 0xd4c36a;

// Powerup colors
const POWERUP_COLORS: Record<string, number> = {
  widePaddle: 0x4ecdc4,
  multiBall: 0x9b59b6,
  slowBall: 0xe67e22,
};

// Depth layers
const DEPTH_BG = 10;
const DEPTH_BRICKS = 30;
const DEPTH_BALL = 50;
const DEPTH_PADDLE = 55;
const DEPTH_POWERUPS = 45;
const DEPTH_PARTICLES = 60;
const DEPTH_HUD = 100;
const DEPTH_VERSE_BAR = 90;
const DEPTH_OVERLAY = 200;

const MAX_DELTA = 100;

// Verse bar layout
const VERSE_BAR_Y = 120;
const VERSE_BAR_H = 30;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class BibleBrickBreakerScene extends Phaser.Scene {
  // Engine state
  private engineState!: GameState;

  // Game objects
  private brickGraphics = new Map<
    string,
    { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }
  >();
  private ballSprites: Phaser.GameObjects.Graphics[] = [];
  private paddleGfx!: Phaser.GameObjects.Graphics;
  private powerUpSprites = new Map<
    number,
    { gfx: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text; bobTween: Phaser.Tweens.Tween }
  >();

  // HUD elements
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private heartSprites: Phaser.GameObjects.Text[] = [];

  // Verse progress bar
  private verseWordTexts: Phaser.GameObjects.Text[] = [];
  private verseBarBg!: Phaser.GameObjects.Graphics;

  // Flags
  private paused = false;
  private gameStarted = false;
  private gameOverShown = false;
  private levelCompleteShown = false;

  // Previous state for diff rendering
  private prevScore = 0;
  private prevLives = 0;

  // Input tracking
  private isDragging = false;

  // Level / verse tracking
  private currentLevel = 1;
  private verseIndex = 0;
  private totalBricksBroken = 0;
  private totalWordsRevealed = 0;

  // Powerup index counter for unique keys
  private powerUpIdCounter = 0;
  private powerUpIndexMap = new Map<number, number>(); // engineIndex -> id

  constructor() {
    super('BibleBrickBreakerScene');
  }

  // -----------------------------------------------------------------------
  // Preload
  // -----------------------------------------------------------------------

  preload(): void {
    // Silently skip missing sprite files so emoji fallback works
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      if (this.textures.exists(file.key)) {
        this.textures.remove(file.key);
      }
    });

    for (const [key, entry] of Object.entries(SPRITE_MAP)) {
      this.load.image(key, entry.path);
    }
  }

  // -----------------------------------------------------------------------
  // Create
  // -----------------------------------------------------------------------

  create(): void {
    // Reset all flags
    this.paused = false;
    this.gameStarted = false;
    this.gameOverShown = false;
    this.levelCompleteShown = false;
    this.prevScore = 0;
    this.totalBricksBroken = 0;
    this.totalWordsRevealed = 0;
    this.currentLevel = 1;
    this.powerUpIdCounter = 0;
    this.brickGraphics.clear();
    this.ballSprites = [];
    this.powerUpSprites.clear();
    this.powerUpIndexMap.clear();
    this.heartSprites = [];
    this.verseWordTexts = [];

    // Pick verse for this level
    const verse = this.currentVerse();
    const verseWords = verse.verse.split(/\s+/);

    // Create engine state
    this.engineState = createGame(this.currentLevel, verseWords);
    this.prevLives = this.engineState.lives;

    // Build visual layers
    this.buildBackground();
    this.buildBricks();
    this.buildPaddle();
    this.buildBalls();
    this.createHUD();
    this.buildVerseBar();
    this.setupInput();
    unlockAudio();

    // Start countdown
    this.showCountdown();
  }

  // -----------------------------------------------------------------------
  // Background
  // -----------------------------------------------------------------------

  private buildBackground(): void {
    const gfx = this.add.graphics();
    gfx.setDepth(DEPTH_BG);

    // Dark gradient: deep blue at top to dark purple at bottom
    gfx.fillGradientStyle(BG_TOP, BG_TOP, BG_BOTTOM, BG_BOTTOM, 1);
    gfx.fillRect(0, 0, W, H);

    // Scatter faint "stars" for ambiance
    const starGfx = this.add.graphics();
    starGfx.setDepth(DEPTH_BG + 1);
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sr = 0.5 + Math.random() * 1.5;
      const sa = 0.08 + Math.random() * 0.15;
      starGfx.fillStyle(0xffffff, sa);
      starGfx.fillCircle(sx, sy, sr);
    }
  }

  // -----------------------------------------------------------------------
  // Brick rendering
  // -----------------------------------------------------------------------

  private brickKey(col: number, row: number): string {
    return `${col},${row}`;
  }

  private brickColor(type: string): number {
    switch (type) {
      case 'clay': return CLAY_COLOR;
      case 'stone': return STONE_COLOR;
      case 'gold': return GOLD_BRICK_COLOR;
      default: return CLAY_COLOR;
    }
  }

  private buildBricks(): void {
    for (const brick of this.engineState.bricks) {
      if (brick.broken) continue;

      const key = this.brickKey(brick.col, brick.row);
      const bx = BRICK_OFFSET_X + brick.col * (BRICK_W + BRICK_PADDING);
      const by = BRICK_OFFSET_Y + brick.row * (BRICK_H + BRICK_PADDING);
      const color = this.brickColor(brick.type);

      // Rounded rect background
      const bg = this.add.graphics();
      bg.setDepth(DEPTH_BRICKS);
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(bx, by, BRICK_W, BRICK_H, 4);

      // Darker bottom edge for 3D feel
      bg.fillStyle(0x000000, 0.15);
      bg.fillRoundedRect(bx, by + BRICK_H - 4, BRICK_W, 4, { tl: 0, tr: 0, bl: 4, br: 4 });

      // Letter text centered on brick
      const letterColor = brick.type === 'gold' ? '#1A1A1A' : '#FFFFFF';
      const text = this.add
        .text(bx + BRICK_W / 2, by + BRICK_H / 2, brick.letter, {
          fontSize: '16px',
          fontStyle: 'bold',
          color: letterColor,
          fontFamily: FONT,
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_BRICKS + 1);

      this.brickGraphics.set(key, { bg, text });
    }
  }

  private syncBricks(): void {
    for (const brick of this.engineState.bricks) {
      const key = this.brickKey(brick.col, brick.row);
      const entry = this.brickGraphics.get(key);
      if (!entry) continue;

      if (brick.broken) {
        // Remove destroyed bricks
        entry.bg.destroy();
        entry.text.destroy();
        this.brickGraphics.delete(key);
        continue;
      }

      // Show crack on stone bricks with 1 hit remaining (was 2, now 1)
      if (brick.type === 'stone' && brick.hitsRemaining === 1) {
        const bx = BRICK_OFFSET_X + brick.col * (BRICK_W + BRICK_PADDING);
        const by = BRICK_OFFSET_Y + brick.row * (BRICK_H + BRICK_PADDING);

        // Draw crack lines over the brick
        entry.bg.lineStyle(2, 0x333333, 0.6);
        entry.bg.moveTo(bx + BRICK_W * 0.3, by);
        entry.bg.lineTo(bx + BRICK_W * 0.5, by + BRICK_H * 0.5);
        entry.bg.lineTo(bx + BRICK_W * 0.7, by + BRICK_H);
        entry.bg.strokePath();
      }
    }
  }

  // -----------------------------------------------------------------------
  // Paddle rendering
  // -----------------------------------------------------------------------

  private buildPaddle(): void {
    this.paddleGfx = this.add.graphics();
    this.paddleGfx.setDepth(DEPTH_PADDLE);
    this.drawPaddle();
  }

  private drawPaddle(): void {
    const paddle = this.engineState.paddle;
    const px = paddle.x - paddle.width / 2;
    const py = paddle.y;

    this.paddleGfx.clear();

    // Main paddle body (Vegas Gold)
    this.paddleGfx.fillStyle(GOLD, 1);
    this.paddleGfx.fillRoundedRect(px, py, paddle.width, paddle.height, 6);

    // Subtle highlight on top
    this.paddleGfx.fillStyle(0xffffff, 0.2);
    this.paddleGfx.fillRoundedRect(px + 4, py, paddle.width - 8, 4, { tl: 6, tr: 6, bl: 0, br: 0 });
  }

  private syncPaddle(): void {
    this.drawPaddle();
  }

  // -----------------------------------------------------------------------
  // Ball rendering
  // -----------------------------------------------------------------------

  private buildBalls(): void {
    this.destroyBalls();
    for (const ball of this.engineState.balls) {
      if (!ball.active) continue;
      const gfx = this.createBallGraphic(ball.x, ball.y);
      this.ballSprites.push(gfx);
    }
  }

  private createBallGraphic(x: number, y: number): Phaser.GameObjects.Graphics {
    const gfx = this.add.graphics();
    gfx.setDepth(DEPTH_BALL);

    // Golden glow behind ball
    const glowR = BALL_RADIUS * 2.5;
    const steps = 6;
    for (let i = steps; i >= 0; i--) {
      const r = glowR * (i / steps);
      const a = 0.03 + 0.08 * (1 - i / steps);
      gfx.fillStyle(GOLD, a);
      gfx.fillCircle(x, y, r);
    }

    // White ball
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(x, y, BALL_RADIUS);

    // Small highlight for 3D effect
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(x - BALL_RADIUS * 0.3, y - BALL_RADIUS * 0.3, BALL_RADIUS * 0.35);

    return gfx;
  }

  private destroyBalls(): void {
    for (const gfx of this.ballSprites) {
      gfx.destroy();
    }
    this.ballSprites = [];
  }

  private syncBalls(): void {
    const activeBalls = this.engineState.balls.filter((b) => b.active);

    // If count changed, rebuild
    if (this.ballSprites.length !== activeBalls.length) {
      this.destroyBalls();
      for (const ball of activeBalls) {
        const gfx = this.createBallGraphic(ball.x, ball.y);
        this.ballSprites.push(gfx);
      }
      return;
    }

    // Reposition existing ball graphics
    for (let i = 0; i < activeBalls.length; i++) {
      const ball = activeBalls[i];
      const gfx = this.ballSprites[i];
      // Redraw at new position
      gfx.clear();

      // Golden glow
      const glowR = BALL_RADIUS * 2.5;
      const steps = 6;
      for (let s = steps; s >= 0; s--) {
        const r = glowR * (s / steps);
        const a = 0.03 + 0.08 * (1 - s / steps);
        gfx.fillStyle(GOLD, a);
        gfx.fillCircle(ball.x, ball.y, r);
      }

      // White ball
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(ball.x, ball.y, BALL_RADIUS);

      // Highlight
      gfx.fillStyle(0xffffff, 0.4);
      gfx.fillCircle(
        ball.x - BALL_RADIUS * 0.3,
        ball.y - BALL_RADIUS * 0.3,
        BALL_RADIUS * 0.35,
      );
    }
  }

  // -----------------------------------------------------------------------
  // PowerUp rendering
  // -----------------------------------------------------------------------

  private syncPowerUps(): void {
    const activePowerUps = this.engineState.powerUps.filter((p) => p.active);
    const activeIds = new Set<number>();

    // Update or create powerup sprites
    for (let i = 0; i < activePowerUps.length; i++) {
      const pu = activePowerUps[i];

      // Assign stable IDs to powerups by engine index
      let id = this.powerUpIndexMap.get(i);
      if (id === undefined) {
        id = this.powerUpIdCounter++;
        this.powerUpIndexMap.set(i, id);
      }
      activeIds.add(id);

      if (this.powerUpSprites.has(id)) {
        // Update position
        const entry = this.powerUpSprites.get(id)!;
        entry.gfx.setPosition(pu.x, pu.y);
        entry.text.setPosition(pu.x, pu.y);
        continue;
      }

      // Create new powerup visual
      const color = POWERUP_COLORS[pu.kind] ?? 0xffffff;
      const gfx = this.add.graphics();
      gfx.setDepth(DEPTH_POWERUPS);
      gfx.fillStyle(color, 0.9);
      gfx.fillRoundedRect(-POWERUP_SIZE / 2, -POWERUP_SIZE / 2, POWERUP_SIZE, POWERUP_SIZE, 4);
      gfx.setPosition(pu.x, pu.y);

      const emojiMap: Record<string, string> = {
        widePaddle: '↔️',
        multiBall: '🔮',
        slowBall: '⏳',
      };

      const text = this.add
        .text(pu.x, pu.y, emojiMap[pu.kind] ?? '?', {
          fontSize: '16px',
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_POWERUPS + 1);

      // Gentle bob animation
      const bobTween = this.tweens.add({
        targets: [gfx, text],
        y: pu.y - 6,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.powerUpSprites.set(id, { gfx, text, bobTween });
    }

    // Remove stale powerup sprites
    for (const [id, entry] of this.powerUpSprites) {
      if (!activeIds.has(id)) {
        entry.bobTween.destroy();
        entry.gfx.destroy();
        entry.text.destroy();
        this.powerUpSprites.delete(id);
      }
    }

    // Clean up index map for removed engine indices
    for (const [engineIdx, id] of this.powerUpIndexMap) {
      if (!activeIds.has(id)) {
        this.powerUpIndexMap.delete(engineIdx);
      }
    }
  }

  // -----------------------------------------------------------------------
  // HUD
  // -----------------------------------------------------------------------

  private createHUD(): void {
    // Back button (top left)
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
      this.game.events.emit('brickbreaker:back');
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

    // Level (top right area)
    this.levelText = this.add
      .text(W - 30, 30, `Lv ${this.currentLevel}`, {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH_HUD);

    // Lives as hearts (top right, below level)
    this.buildHearts();

    // Combo text (hidden initially, below score)
    this.comboText = this.add
      .text(CX, 80, '', {
        fontSize: '28px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(DEPTH_HUD);
  }

  private buildHearts(): void {
    // Destroy old hearts
    for (const h of this.heartSprites) h.destroy();
    this.heartSprites = [];

    const lives = this.engineState.lives;
    const startX = W - 30;
    const y = 56;

    for (let i = 0; i < lives; i++) {
      const heart = this.add
        .text(startX - i * 28, y, '❤️', {
          fontSize: '20px',
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_HUD);
      this.heartSprites.push(heart);
    }
  }

  private syncHUD(): void {
    const score = this.engineState.score;

    // Score pop animation on change
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
    this.levelText.setText(`Lv ${this.engineState.level}`);

    // Rebuild hearts if lives changed
    if (this.engineState.lives !== this.prevLives) {
      this.prevLives = this.engineState.lives;
      this.buildHearts();
    }
  }

  // -----------------------------------------------------------------------
  // Verse Progress Bar
  // -----------------------------------------------------------------------

  private buildVerseBar(): void {
    // Background bar
    this.verseBarBg = this.add.graphics();
    this.verseBarBg.setDepth(DEPTH_VERSE_BAR);
    this.verseBarBg.fillStyle(0x000000, 0.3);
    this.verseBarBg.fillRoundedRect(20, VERSE_BAR_Y, W - 40, VERSE_BAR_H, 6);

    this.rebuildVerseWords();
  }

  private rebuildVerseWords(): void {
    // Destroy old word texts
    for (const t of this.verseWordTexts) t.destroy();
    this.verseWordTexts = [];

    const words = this.engineState.verseWords;
    const revealed = this.engineState.revealedWords;

    // Calculate layout: words flow left to right, wrapping if needed
    // For simplicity, show first N words that fit
    const maxWidth = W - 60;
    let currentX = 30;
    const textY = VERSE_BAR_Y + VERSE_BAR_H / 2;
    const fontSize = 12;
    const spacing = 6;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isRevealed = revealed[i];

      // Display as actual word or underscores
      const display = isRevealed
        ? word
        : word.replace(/[A-Za-z]/g, '_');

      const color = isRevealed ? GOLD_HEX : '#666666';

      const txt = this.add
        .text(currentX, textY, display, {
          fontSize: `${fontSize}px`,
          color,
          fontFamily: FONT,
          fontStyle: isRevealed ? 'bold' : 'normal',
        })
        .setOrigin(0, 0.5)
        .setDepth(DEPTH_VERSE_BAR + 1);

      this.verseWordTexts.push(txt);

      currentX += txt.width + spacing;

      // Stop if we've exceeded the bar width
      if (currentX > maxWidth) break;
    }
  }

  private syncVerseBar(): void {
    const words = this.engineState.verseWords;
    const revealed = this.engineState.revealedWords;

    // Update each word text in place
    for (let i = 0; i < this.verseWordTexts.length && i < words.length; i++) {
      const txt = this.verseWordTexts[i];
      const isRevealed = revealed[i];

      const display = isRevealed
        ? words[i]
        : words[i].replace(/[A-Za-z]/g, '_');

      txt.setText(display);
      txt.setColor(isRevealed ? GOLD_HEX : '#666666');
      txt.setFontStyle(isRevealed ? 'bold' : 'normal');
    }
  }

  // -----------------------------------------------------------------------
  // Input
  // -----------------------------------------------------------------------

  private setupInput(): void {
    // Pointer drag for paddle movement
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;

      if (!this.gameStarted || this.paused) return;
      if (this.engineState.phase !== 'playing') return;

      // Move paddle to pointer x
      this.engineState = movePaddle(this.engineState, pointer.x);

      // If ball is in pre-launch state, launch on tap
      const preLaunchBall = this.engineState.balls.find(
        (b) => b.active && b.dx === 0 && b.dy === 0,
      );
      if (preLaunchBall) {
        BibleBrickBreakerSFX.launch();
        this.engineState = launchBall(this.engineState);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      if (!this.gameStarted || this.paused) return;
      if (this.engineState.phase !== 'playing') return;

      this.engineState = movePaddle(this.engineState, pointer.x);
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Keyboard controls
    if (this.input.keyboard) {
      const kb = this.input.keyboard;

      kb.on('keydown-LEFT', () => this.nudgePaddle(-30));
      kb.on('keydown-RIGHT', () => this.nudgePaddle(30));
      kb.on('keydown-A', () => this.nudgePaddle(-30));
      kb.on('keydown-D', () => this.nudgePaddle(30));

      kb.on('keydown-SPACE', () => {
        if (!this.gameStarted || this.paused) return;
        if (this.engineState.phase !== 'playing') return;

        // Launch ball if in pre-launch state
        const preLaunchBall = this.engineState.balls.find(
          (b) => b.active && b.dx === 0 && b.dy === 0,
        );
        if (preLaunchBall) {
          BibleBrickBreakerSFX.launch();
          this.engineState = launchBall(this.engineState);
        }
      });

      kb.on('keydown-ESC', () => this.togglePause());
      kb.on('keydown-P', () => this.togglePause());
    }
  }

  private nudgePaddle(dx: number): void {
    if (!this.gameStarted || this.paused) return;
    if (this.engineState.phase !== 'playing') return;
    this.engineState = movePaddle(this.engineState, this.engineState.paddle.x + dx);
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
        BibleBrickBreakerSFX.countdownGo();
      } else {
        BibleBrickBreakerSFX.countdown();
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
        this.onLevelComplete();
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

    // Sync all visuals
    this.syncBricks();
    this.syncBalls();
    this.syncPaddle();
    this.syncPowerUps();
    this.syncHUD();
    this.syncVerseBar();
  }

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  private handleEvent(event: GameEvent): void {
    switch (event.type) {
      case 'brick_hit':
        this.onBrickHit(event.brick);
        break;

      case 'brick_broken':
        this.onBrickBroken(event.brick, event.points);
        break;

      case 'word_revealed':
        this.onWordRevealed(event.wordIndex, event.word);
        break;

      case 'combo':
        this.showCombo(event.count);
        break;

      case 'ball_lost':
        this.onBallLost();
        break;

      case 'life_lost':
        // Hearts update handled by syncHUD
        break;

      case 'powerup_spawned':
        // Visual creation handled by syncPowerUps
        break;

      case 'powerup_caught':
        this.onPowerUpCaught(event.kind);
        break;

      case 'powerup_expired':
        BibleBrickBreakerSFX.powerUpExpire();
        break;

      case 'level_complete':
        BibleBrickBreakerSFX.levelComplete();
        break;

      case 'verse_milestone':
        this.showVerseCard();
        break;

      case 'game_over':
        BibleBrickBreakerSFX.gameOver();
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Brick hit effects
  // -----------------------------------------------------------------------

  private onBrickHit(brick: { col: number; row: number; type: string }): void {
    BibleBrickBreakerSFX.brickHit(this.engineState.combo);

    const bx = BRICK_OFFSET_X + brick.col * (BRICK_W + BRICK_PADDING) + BRICK_W / 2;
    const by = BRICK_OFFSET_Y + brick.row * (BRICK_H + BRICK_PADDING) + BRICK_H / 2;

    // Quick crack flash
    const flash = this.add
      .rectangle(bx, by, BRICK_W, BRICK_H, 0xffffff, 0.4)
      .setDepth(DEPTH_BRICKS + 2);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private onBrickBroken(
    brick: { col: number; row: number; type: string },
    points: number,
  ): void {
    BibleBrickBreakerSFX.brickBreak();
    this.totalBricksBroken++;

    const bx = BRICK_OFFSET_X + brick.col * (BRICK_W + BRICK_PADDING) + BRICK_W / 2;
    const by = BRICK_OFFSET_Y + brick.row * (BRICK_H + BRICK_PADDING) + BRICK_H / 2;
    const color = this.brickColor(brick.type);

    // Shatter particle burst: 6-8 small colored rects flying outward
    this.spawnBrickShatter(bx, by, color);

    // Score popup
    this.showScorePopup(points, bx, by);
  }

  private spawnBrickShatter(x: number, y: number, color: number): void {
    const count = 6 + Math.floor(Math.random() * 3); // 6-8 particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 50;
      const size = 3 + Math.random() * 4;

      const particle = this.add.graphics();
      particle.setDepth(DEPTH_PARTICLES);
      particle.fillStyle(color, 0.9);
      particle.fillRect(x - size / 2, y - size / 2, size, size);

      this.tweens.add({
        targets: particle,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // Word revealed
  // -----------------------------------------------------------------------

  private onWordRevealed(wordIndex: number, word: string): void {
    BibleBrickBreakerSFX.wordReveal();
    this.totalWordsRevealed++;

    // Animate the revealed word in the verse bar with a gold scale pop
    if (wordIndex < this.verseWordTexts.length) {
      const txt = this.verseWordTexts[wordIndex];
      txt.setText(word);
      txt.setColor(GOLD_HEX);
      txt.setFontStyle('bold');

      this.tweens.add({
        targets: txt,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }

    // Check if all words revealed: full verse shine
    if (this.engineState.revealedWords.every((r) => r)) {
      this.verseShineEffect();
    }
  }

  private verseShineEffect(): void {
    // Flash the verse bar gold
    const shine = this.add.graphics();
    shine.setDepth(DEPTH_VERSE_BAR + 5);
    shine.fillStyle(GOLD, 0.3);
    shine.fillRoundedRect(20, VERSE_BAR_Y, W - 40, VERSE_BAR_H, 6);

    this.tweens.add({
      targets: shine,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => shine.destroy(),
    });

    // Gold particle bursts along the bar
    for (let i = 0; i < 5; i++) {
      const px = 50 + (i / 4) * (W - 100);
      this.spawnParticleBurst(px, VERSE_BAR_Y + VERSE_BAR_H / 2, GOLD, 4);
    }
  }

  // -----------------------------------------------------------------------
  // Ball lost
  // -----------------------------------------------------------------------

  private onBallLost(): void {
    BibleBrickBreakerSFX.ballLost();

    // Red screen flash
    const flash = this.add
      .rectangle(CX, CY, W, H, 0xff0000, 0.25)
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
  // PowerUp caught
  // -----------------------------------------------------------------------

  private onPowerUpCaught(kind: string): void {
    BibleBrickBreakerSFX.powerUpCatch();

    // Flash paddle area
    const px = this.engineState.paddle.x;
    const py = this.engineState.paddle.y;
    const color = POWERUP_COLORS[kind] ?? 0xffffff;

    this.spawnParticleBurst(px, py, color, 8);
  }

  // -----------------------------------------------------------------------
  // Combo display
  // -----------------------------------------------------------------------

  private showCombo(count: number): void {
    const label =
      count >= 5
        ? `COMBO x${count}!`
        : `Combo x${count}!`;

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
  // Score popup
  // -----------------------------------------------------------------------

  private showScorePopup(points: number, x: number, y: number): void {
    const popText = this.add
      .text(x, y - 10, `+${points}`, {
        fontSize: '22px',
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
      y: y - 60,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popText.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Particle burst (generic)
  // -----------------------------------------------------------------------

  private spawnParticleBurst(x: number, y: number, color: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 30;
      const size = 2 + Math.random() * 3;

      const dot = this.add
        .circle(x, y, size, color)
        .setAlpha(0.9)
        .setDepth(DEPTH_PARTICLES);

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
  // Verse card overlay (milestone display)
  // -----------------------------------------------------------------------

  private showVerseCard(): void {
    this.paused = true;

    const verse: BibleBrickBreakerVerse =
      bibleBrickBreakerVerses[this.verseIndex % bibleBrickBreakerVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 520;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    // Card background (cream)
    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    // Gold border on card
    const cardBorder = this.add.graphics();
    cardBorder.setDepth(DEPTH_OVERLAY + 1);
    cardBorder.lineStyle(3, GOLD, 1);
    cardBorder.strokeRoundedRect(CX - cardW / 2, CY - cardH / 2, cardW, cardH, 8);

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
    const elements = [overlay, card, cardBorder, refText, verseTxt, promptTxt, btnBg, btnText];
    for (const el of elements) {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: el === overlay ? OVERLAY_ALPHA : 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    }

    // Double-click guard (learned from LightSnake audit)
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

      // Reset engine timing after dismiss (learned from audit)
      this.time.delayedCall(250, () => {
        this.paused = false;
      });
    });
  }

  // -----------------------------------------------------------------------
  // Level complete
  // -----------------------------------------------------------------------

  private onLevelComplete(): void {
    this.paused = true;

    const verse: BibleBrickBreakerVerse =
      bibleBrickBreakerVerses[this.verseIndex % bibleBrickBreakerVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 560;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive()
      .setDepth(DEPTH_OVERLAY);

    // Card background
    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    // Gold border
    const cardBorder = this.add.graphics();
    cardBorder.setDepth(DEPTH_OVERLAY + 1);
    cardBorder.lineStyle(3, GOLD, 1);
    cardBorder.strokeRoundedRect(CX - cardW / 2, CY - cardH / 2, cardW, cardH, 8);

    // Title
    const title = this.add
      .text(CX, CY - 220, 'Level Complete!', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Star emoji
    const starEmoji = this.add
      .text(CX, CY - 170, '⭐', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Verse reference
    const refText = this.add
      .text(CX, CY - 110, verse.reference, {
        fontSize: '20px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Verse text
    const verseTxt = this.add
      .text(CX, CY - 20, `"${verse.verse}"`, {
        fontSize: '20px',
        color: '#2D2D2D',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Kid prompt
    const promptTxt = this.add
      .text(CX, CY + 80, verse.kidPrompt, {
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#5A5A5A',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Score display
    const scoreTxt = this.add
      .text(CX, CY + 130, `Score: ${this.engineState.score}`, {
        fontSize: '22px',
        color: '#2D2D2D',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // Next Level button
    const btnW = 280;
    const btnH = 64;
    const btnY = CY + 210;

    const btnBg = this.add
      .rectangle(CX, btnY, btnW, btnH, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH_OVERLAY + 3);

    const btnText = this.add
      .text(CX, btnY, 'Next Level', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 4);

    // Fade in
    const elements = [
      overlay, card, cardBorder, title, starEmoji, refText,
      verseTxt, promptTxt, scoreTxt, btnBg, btnText,
    ];
    for (const el of elements) {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: el === overlay ? OVERLAY_ALPHA : 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    }

    // Celebration particles
    this.time.delayedCall(300, () => {
      this.spawnParticleBurst(CX - 100, CY - 220, GOLD, 8);
      this.spawnParticleBurst(CX + 100, CY - 220, GOLD, 8);
    });

    // Double-click guard
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
        this.startNextLevel();
      });
    });
  }

  private startNextLevel(): void {
    this.currentLevel++;
    this.levelCompleteShown = false;
    this.paused = false;
    this.gameStarted = false;

    // Pick new verse
    const verse = this.currentVerse();
    const verseWords = verse.verse.split(/\s+/);

    // Carry over score and lives
    const prevScore = this.engineState.score;
    const prevLives = this.engineState.lives;

    // Clean up old brick visuals
    for (const [, entry] of this.brickGraphics) {
      entry.bg.destroy();
      entry.text.destroy();
    }
    this.brickGraphics.clear();

    // Clean up old balls
    this.destroyBalls();

    // Clean up powerups
    for (const [, entry] of this.powerUpSprites) {
      entry.bobTween.destroy();
      entry.gfx.destroy();
      entry.text.destroy();
    }
    this.powerUpSprites.clear();
    this.powerUpIndexMap.clear();
    this.powerUpIdCounter = 0;

    // Create new engine state
    this.engineState = createGame(this.currentLevel, verseWords);
    this.engineState = { ...this.engineState, score: prevScore, lives: prevLives };
    this.prevLives = prevLives;

    // Rebuild visuals
    this.buildBricks();
    this.buildBalls();
    this.rebuildVerseWords();
    this.buildHearts();
    this.levelText.setText(`Lv ${this.currentLevel}`);

    // Run countdown
    this.showCountdown();
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
      this.game.events.emit('brickbreaker:back');
    });
  }

  // -----------------------------------------------------------------------
  // Game Over
  // -----------------------------------------------------------------------

  private showGameOver(): void {
    this.paused = true;

    // Record game FIRST (learned from LightSnake audit)
    const wordsRevealed = this.engineState.revealedWords.filter((r) => r).length;
    useBibleBrickBreakerStore.getState().recordGame(
      this.engineState.score,
      this.engineState.combo,
      this.totalBricksBroken,
      this.engineState.level,
      wordsRevealed,
    );

    // Check for new high score (read AFTER recordGame so highScore is updated)
    const storeState = useBibleBrickBreakerStore.getState();
    const isNewBest = this.engineState.score === storeState.highScore && this.engineState.score > 0;

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
    const cardH = 520;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(DEPTH_OVERLAY + 1);

    const title = this.add
      .text(CX, H + cardH - 200, 'Game Over', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    const themeEmoji = this.add
      .text(CX, H + cardH - 150, '🧱', { fontSize: '48px' })
      .setOrigin(0.5)
      .setDepth(DEPTH_OVERLAY + 2);

    // "NEW BEST!" text
    let newBestText: Phaser.GameObjects.Text | null = null;
    if (isNewBest) {
      newBestText = this.add
        .text(CX, H + cardH - 100, 'NEW BEST!', {
          fontSize: '28px',
          fontStyle: 'bold',
          color: GOLD_HEX,
          fontFamily: FONT,
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_OVERLAY + 2);
    }

    const statsStartY = isNewBest ? -50 : -80;
    const stats = [
      `Final Score: ${this.engineState.score}`,
      `Level Reached: ${this.engineState.level}`,
      `Bricks Broken: ${this.totalBricksBroken}`,
      `Best Combo: ${this.engineState.combo}x`,
      `Words Revealed: ${wordsRevealed}`,
    ];

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const t = this.add
        .text(CX, H + cardH + statsStartY + i * 40, stat, {
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
    const playBtnY = H + cardH + 150;
    const backBtnY = H + cardH + 220;

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
      { obj: title, targetY: cardY - 200 },
      { obj: themeEmoji, targetY: cardY - 150 },
      ...(newBestText ? [{ obj: newBestText, targetY: cardY - 100 }] : []),
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY + statsStartY + i * 40 })),
      { obj: playBg, targetY: cardY + 150 },
      { obj: playText, targetY: cardY + 150 },
      { obj: backText, targetY: cardY + 220 },
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

    // New high score celebration
    if (isNewBest) {
      this.time.delayedCall(800, () => {
        SharedSFX.milestone();
        this.spawnParticleBurst(CX, cardY - 100, 0xffd700, 12);
        this.spawnParticleBurst(CX - 80, cardY - 100, GOLD, 8);
        this.spawnParticleBurst(CX + 80, cardY - 100, GOLD, 8);
      });
    }

    // Button handlers
    playBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.scene.restart();
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('brickbreaker:back');
    });

    // Emit complete event for React
    this.game.events.emit('brickbreaker:complete', {
      score: this.engineState.score,
      combo: this.engineState.combo,
      bricksBroken: this.totalBricksBroken,
      level: this.engineState.level,
      wordsRevealed,
    });
  }

  // -----------------------------------------------------------------------
  // Verse helpers
  // -----------------------------------------------------------------------

  private currentVerse(): BibleBrickBreakerVerse {
    return bibleBrickBreakerVerses[
      (this.currentLevel - 1 + this.verseIndex) % bibleBrickBreakerVerses.length
    ];
  }

  // -----------------------------------------------------------------------
  // Shutdown (cleanup on scene destroy) -- REQUIRED
  // -----------------------------------------------------------------------

  shutdown(): void {
    // Remove all input listeners
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    // Destroy brick visuals
    for (const [, entry] of this.brickGraphics) {
      entry.bg.destroy();
      entry.text.destroy();
    }
    this.brickGraphics.clear();

    // Destroy ball sprites
    this.destroyBalls();

    // Destroy powerup sprites
    for (const [, entry] of this.powerUpSprites) {
      entry.bobTween.destroy();
      entry.gfx.destroy();
      entry.text.destroy();
    }
    this.powerUpSprites.clear();
    this.powerUpIndexMap.clear();

    // Destroy HUD elements
    for (const h of this.heartSprites) h.destroy();
    this.heartSprites = [];

    // Destroy verse bar
    for (const t of this.verseWordTexts) t.destroy();
    this.verseWordTexts = [];
    if (this.verseBarBg) this.verseBarBg.destroy();

    // Destroy paddle
    if (this.paddleGfx) this.paddleGfx.destroy();

    // Kill all tweens and timers
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
