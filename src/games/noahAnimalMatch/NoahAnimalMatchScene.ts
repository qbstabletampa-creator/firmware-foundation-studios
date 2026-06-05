import Phaser from 'phaser';
import { createInitialState, flipCard, tick, type GameEvent } from './gameEngine';
import { createRng } from './prng';
import { GAME_CONSTANTS, LEVEL_CONFIGS } from './itemConfig';
import { noahVerses, type NoahVerse } from './verses';
import type { GameState, Card, LevelResult } from './types';
import { preloadSprites, createGameSprite, type GameSprite } from '../../utils/spriteHelper';
import { SPRITE_MAP } from './spriteMap';
import { NoahSFX, unlockAudio } from './sounds';
import { SharedSFX } from '../../utils/soundEngine';
import { useNoahAnimalMatchStore } from '../../stores/noahAnimalMatchStore';

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
const BG_DARK = 0x1b3a4b;
const CARD_DOWN_COLOR = 0x6b4a2f;
const CARD_UP_COLOR = 0xfff8e7;
const VERSE_CARD_BG = 0xfff8e7;
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.5;
const MAX_DELTA = 100;
const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];
const COUNTDOWN_STEP_MS = 700;
const CARD_GAP = 8;
const CARD_PADDING = 40;
const HUD_HEIGHT = 130;
const FLIP_HALF_MS = 120;
const MATCH_GLOW_MS = 400;
const SHAKE_DURATION = 250;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class NoahAnimalMatchScene extends Phaser.Scene {
  // Engine state
  private engineState!: GameState;
  private rng!: () => number;
  private currentLevel = 1;
  private cumulativeScore = 0;

  // Card visuals
  private cardBgs: Phaser.GameObjects.Rectangle[] = [];
  private cardTexts: GameSprite[] = [];
  private cardSize = 0;
  private gridOffsetX = 0;
  private gridOffsetY = 0;
  private gridCols = 0;
  private gridRows = 0;

  // Flip animation locks
  private flipLocks = new Set<number>();

  // HUD
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  // Overlays
  private overlayGroup!: Phaser.GameObjects.Group;

  // Flags
  private paused = false;
  private gameStarted = false;
  private levelCompleteShown = false;
  private gameCompleteShown = false;
  private previewActive = false;

  // Cursor (keyboard nav)
  private cursorIndex = 0;
  private cursorRect!: Phaser.GameObjects.Rectangle;
  private cursorVisible = false;

  // Verse tracking
  private verseIndex = 0;

  // Environment visuals
  private goldenParticles: { dot: Phaser.GameObjects.Arc; vy: number; baseAlpha: number }[] = [];

  constructor() {
    super('NoahAnimalMatchScene');
  }

  preload(): void {
    preloadSprites(this, SPRITE_MAP);

    // Illustrated game-world background (falls back to gradient if missing)
    this.load.image('bg-world', '/sprites/noah-animal-match/bg-world.png');
  }

  create(): void {
    // Kill stale tweens from prior scene run (prevents tween conflicts on restart)
    this.tweens.killAll();

    // Reset flags
    this.paused = false;
    this.gameStarted = false;
    this.levelCompleteShown = false;
    this.gameCompleteShown = false;
    this.previewActive = false;
    this.cursorIndex = 0;
    this.cursorVisible = false;
    this.verseIndex = 0;
    this.flipLocks.clear();
    this.cardBgs = [];
    this.cardTexts = [];

    // Seed RNG
    const seed = Date.now();
    this.rng = createRng(seed);

    // Create engine state
    this.engineState = createInitialState(this.currentLevel, this.rng);

    // Build visual layers
    this.createBackground();
    this.createHUD();
    this.createGrid();
    this.createCursor();
    this.setupInput();
    unlockAudio();

    // Overlay group
    this.overlayGroup = this.add.group();

    // Start countdown
    this.showCountdown();
  }

  // -----------------------------------------------------------------------
  // Background
  // -----------------------------------------------------------------------

  private createBackground(): void {
    // 1. Illustrated ark-interior world if available, else warm gradient fallback
    if (this.textures.exists('bg-world')) {
      const bg = this.add.image(W / 2, H / 2, 'bg-world').setDepth(0);
      const scale = Math.max(W / bg.width, H / bg.height);
      bg.setScale(scale);
    } else {
      const bgGfx = this.add.graphics().setDepth(0);
      bgGfx.fillGradientStyle(0xfff8e7, 0xfff8e7, 0xe8f5e9, 0xe8f5e9, 1);
      bgGfx.fillRect(0, 0, W, H);
    }

    // 2. Golden dust-mote particles (6-8 tiny circles drifting down)
    this.goldenParticles = [];
    const particleCount = 6 + Math.floor(Math.random() * 3); // 6-8
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H; // spread across canvas initially
      const radius = 2 + Math.random(); // 2-3px
      const baseAlpha = 0.3 + Math.random() * 0.2; // 0.3-0.5
      const dot = this.add
        .circle(x, y, radius, GOLD, baseAlpha)
        .setDepth(12);
      const vy = 8 + Math.random() * 7; // 8-15 px/sec drift speed
      this.goldenParticles.push({ dot, vy, baseAlpha });
    }

    // 3. Wooden frame border (rounded rect, board game feel)
    const frameGfx = this.add.graphics().setDepth(29); // below cards (depth 30)
    frameGfx.lineStyle(8, 0x8b7355, 0.3);
    frameGfx.strokeRoundedRect(12, 12, W - 24, H - 24, 16);
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
      .setDepth(100);

    backBtn.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('noahanimalmatch:back');
    });

    // Level indicator (top left, below back)
    this.levelText = this.add
      .text(30, 80, `Level ${this.currentLevel}`, {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#5A5A5A',
        fontFamily: FONT,
      })
      .setOrigin(0, 0.5)
      .setDepth(100);

    // Score (top center)
    this.scoreText = this.add
      .text(CX, 44, '0', {
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#2D2D2D',
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    // Moves counter (top right)
    this.movesText = this.add
      .text(W - 30, 44, 'Moves: 0', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#5A5A5A',
        fontFamily: FONT,
      })
      .setOrigin(1, 0.5)
      .setDepth(100);

    // Timer (below score)
    this.timerText = this.add
      .text(CX, 86, '0:00', {
        fontSize: '22px',
        color: '#7A7A7A',
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    // Combo indicator (hidden initially)
    this.comboText = this.add
      .text(CX, 115, '', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(100);
  }

  // -----------------------------------------------------------------------
  // Grid
  // -----------------------------------------------------------------------

  private createGrid(): void {
    const config = LEVEL_CONFIGS.find((c) => c.level === this.currentLevel)!;
    this.gridCols = config.cols;
    this.gridRows = config.rows;

    const totalCards = config.rows * config.cols;
    const availableW = W - CARD_PADDING * 2;
    const availableH = H - HUD_HEIGHT - CARD_PADDING * 2 - 60; // 60px bottom margin

    const maxCardW = (availableW - CARD_GAP * (config.cols - 1)) / config.cols;
    const maxCardH = (availableH - CARD_GAP * (config.rows - 1)) / config.rows;
    this.cardSize = Math.floor(Math.min(maxCardW, maxCardH));

    const gridW = this.cardSize * config.cols + CARD_GAP * (config.cols - 1);
    const gridH = this.cardSize * config.rows + CARD_GAP * (config.rows - 1);
    this.gridOffsetX = (W - gridW) / 2;
    this.gridOffsetY = HUD_HEIGHT + (H - HUD_HEIGHT - gridH) / 2;

    for (let i = 0; i < totalCards; i++) {
      const row = Math.floor(i / config.cols);
      const col = i % config.cols;

      const x = this.gridOffsetX + col * (this.cardSize + CARD_GAP) + this.cardSize / 2;
      const y = this.gridOffsetY + row * (this.cardSize + CARD_GAP) + this.cardSize / 2;

      // Card background
      const cardBg = this.add
        .rectangle(x, y, this.cardSize, this.cardSize, CARD_DOWN_COLOR)
        .setStrokeStyle(2, 0x9a763d)
        .setDepth(30);

      // Rounded look with slight corner rounding via stroke
      cardBg.setData('cardIndex', i);

      // Card content (face-down shows "?" text; face-up shows sprite or emoji)
      const spriteSize = Math.floor(this.cardSize * 0.7);
      const cardContent = createGameSprite(
        this,
        x,
        y,
        'card-back',          // try card-back sprite first
        '?',                  // emoji fallback
        spriteSize,
        spriteSize,
        Math.floor(this.cardSize * 0.5),
      );
      cardContent.setDepth(31);

      this.cardBgs.push(cardBg);
      this.cardTexts.push(cardContent);
    }
  }

  private getCardCenter(index: number): { x: number; y: number } {
    const col = index % this.gridCols;
    const row = Math.floor(index / this.gridCols);
    const x = this.gridOffsetX + col * (this.cardSize + CARD_GAP) + this.cardSize / 2;
    const y = this.gridOffsetY + row * (this.cardSize + CARD_GAP) + this.cardSize / 2;
    return { x, y };
  }

  // -----------------------------------------------------------------------
  // Cursor (keyboard navigation)
  // -----------------------------------------------------------------------

  private createCursor(): void {
    const { x, y } = this.getCardCenter(0);
    this.cursorRect = this.add
      .rectangle(x, y, this.cardSize + 6, this.cardSize + 6)
      .setStrokeStyle(3, GOLD)
      .setFillStyle(0x000000, 0)
      .setDepth(35)
      .setAlpha(0);
  }

  private updateCursorPosition(): void {
    const { x, y } = this.getCardCenter(this.cursorIndex);
    this.cursorRect.x = x;
    this.cursorRect.y = y;
  }

  private showCursor(): void {
    if (!this.cursorVisible) {
      this.cursorVisible = true;
      this.cursorRect.setAlpha(1);
    }
  }

  private hideCursor(): void {
    if (this.cursorVisible) {
      this.cursorVisible = false;
      this.cursorRect.setAlpha(0);
    }
  }

  private moveCursor(dr: number, dc: number): void {
    this.showCursor();
    const totalCards = this.engineState.cards.length;
    let nextIndex = this.cursorIndex;
    let attempts = 0;

    do {
      let row = Math.floor(nextIndex / this.gridCols) + dr;
      let col = (nextIndex % this.gridCols) + dc;

      // Wrap
      if (col >= this.gridCols) { col = 0; row++; }
      if (col < 0) { col = this.gridCols - 1; row--; }
      if (row >= this.gridRows) row = 0;
      if (row < 0) row = this.gridRows - 1;

      nextIndex = row * this.gridCols + col;
      attempts++;

      // Skip matched cards
      if (nextIndex < totalCards && this.engineState.cards[nextIndex].state !== 'matched') {
        break;
      }
    } while (attempts < totalCards);

    this.cursorIndex = nextIndex;
    this.updateCursorPosition();
  }

  // -----------------------------------------------------------------------
  // Input
  // -----------------------------------------------------------------------

  private setupInput(): void {
    // Clear previous listeners to prevent accumulation on restart
    this.input.removeAllListeners();
    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }

    // Touch/click: find which card was tapped
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.paused || this.previewActive) return;
      this.hideCursor();

      // Find card index by checking bounds
      for (let i = 0; i < this.cardBgs.length; i++) {
        const bg = this.cardBgs[i];
        const halfSize = this.cardSize / 2;
        if (
          pointer.x >= bg.x - halfSize &&
          pointer.x <= bg.x + halfSize &&
          pointer.y >= bg.y - halfSize &&
          pointer.y <= bg.y + halfSize
        ) {
          this.handleCardTap(i);
          break;
        }
      }
    });

    // Keyboard
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.moveCursor(-1, 0);
      });
      this.input.keyboard.on('keydown-DOWN', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.moveCursor(1, 0);
      });
      this.input.keyboard.on('keydown-LEFT', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.moveCursor(0, -1);
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.moveCursor(0, 1);
      });
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.showCursor();
        this.handleCardTap(this.cursorIndex);
      });
      this.input.keyboard.on('keydown-ENTER', () => {
        if (!this.gameStarted || this.paused || this.previewActive) return;
        this.showCursor();
        this.handleCardTap(this.cursorIndex);
      });
    }
  }

  private handleCardTap(cardIndex: number): void {
    // Guard: only block if THIS specific card is animating
    if (this.flipLocks.has(cardIndex)) return;

    const result = flipCard(this.engineState, cardIndex);
    this.engineState = result.state;

    for (const event of result.events) {
      this.handleEvent(event);
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
      .setDepth(200);

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
        duration: 400,
        ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: countdownText,
        alpha: 0,
        duration: 200,
        delay: 450,
        ease: 'Quad.easeIn',
      });

      step++;
      if (step < COUNTDOWN_STEPS.length) {
        this.time.delayedCall(COUNTDOWN_STEP_MS, doStep);
      } else {
        this.time.delayedCall(COUNTDOWN_STEP_MS, () => {
          countdownText.destroy();
          this.gameStarted = true;
          this.startPreview();
        });
      }
    };

    doStep();
  }

  // -----------------------------------------------------------------------
  // Preview phase (show all cards briefly)
  // -----------------------------------------------------------------------

  private startPreview(): void {
    this.previewActive = true;

    // Show all cards face-up
    for (let i = 0; i < this.engineState.cards.length; i++) {
      const card = this.engineState.cards[i];
      this.setCardVisual(i, true, card.emoji);
    }

    // The engine is in 'preview' phase and will count down via tick()
  }

  private endPreview(): void {
    this.previewActive = false;

    // Flip all cards face-down simultaneously
    for (let i = 0; i < this.engineState.cards.length; i++) {
      this.animateFlipDown(i);
    }
  }

  // -----------------------------------------------------------------------
  // Main update loop
  // -----------------------------------------------------------------------

  update(_time: number, delta: number): void {
    if (!this.gameStarted || this.paused) return;

    if (this.engineState.phase === 'game_complete') {
      if (!this.gameCompleteShown) {
        this.gameCompleteShown = true;
        this.showGameComplete();
      }
      return;
    }

    if (this.engineState.phase === 'level_complete') {
      if (!this.levelCompleteShown) {
        this.levelCompleteShown = true;
        // Level complete is handled by the event
      }
      return;
    }

    const dt = Math.min(delta, MAX_DELTA);
    const dtSec = dt / 1000;

    // Drift golden particles downward, respawn at top when they exit
    for (const p of this.goldenParticles) {
      p.dot.y += p.vy * dtSec;
      // Gentle fade: reduce alpha as particle nears bottom third
      const progress = p.dot.y / H;
      p.dot.setAlpha(p.baseAlpha * Math.max(0, 1 - progress * 0.7));

      // Respawn when fully faded or past bottom
      if (p.dot.y > H + 10 || p.dot.alpha <= 0.01) {
        p.dot.y = -5;
        p.dot.x = Math.random() * W;
        p.dot.setAlpha(p.baseAlpha);
      }
    }

    // Tick engine
    const result = tick(this.engineState, dt);
    this.engineState = result.state;

    // Process events
    for (const event of result.events) {
      this.handleEvent(event);
    }

    // Update HUD
    this.updateHUD();
  }

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  private handleEvent(event: GameEvent): void {
    switch (event.type) {
      case 'card_flipped':
        NoahSFX.flip();
        this.onCardFlipped(event.cardIndex);
        break;
      case 'match_found':
        NoahSFX.match(0);
        this.onMatchFound(event.card1, event.card2, event.points);
        break;
      case 'mismatch':
        NoahSFX.mismatch();
        this.onMismatch(event.card1, event.card2);
        break;
      case 'mismatch_resolved':
        this.onMismatchResolved(event.card1, event.card2);
        break;
      case 'combo':
        NoahSFX.combo(event.count);
        this.showCombo(event.count);
        break;
      case 'quick_recall':
        this.showQuickRecall(event.bonus);
        break;
      case 'preview_end':
        this.endPreview();
        break;
      case 'verse_milestone':
        this.showVerseCard();
        break;
      case 'level_complete':
        NoahSFX.levelComplete();
        this.showLevelComplete(event.result);
        break;
      case 'game_complete':
        NoahSFX.gameComplete();
        // Handled in update loop
        break;
      case 'perfect_clear':
        NoahSFX.gameComplete();
        this.showPerfectClear(event.bonus);
        break;
      case 'time_bonus':
        this.showTimeBonus(event.bonus);
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Card flip animations
  // -----------------------------------------------------------------------

  private onCardFlipped(cardIndex: number): void {
    const card = this.engineState.cards[cardIndex];
    if (card.state === 'faceup') {
      this.animateFlipUp(cardIndex, card.emoji);
    }
  }

  private animateFlipUp(index: number, emoji: string): void {
    const bg = this.cardBgs[index];
    const txt = this.cardTexts[index];
    if (!bg || !txt) return;

    this.flipLocks.add(index);

    // Phase 1: scale X to 0
    this.tweens.add({
      targets: [bg, txt],
      scaleX: 0,
      duration: FLIP_HALF_MS,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Swap visuals (may replace the sprite object)
        this.setCardVisual(index, true, emoji);

        // Phase 2: scale X back to 1 (use fresh reference after swap)
        const newTxt = this.cardTexts[index];
        this.tweens.add({
          targets: [bg, newTxt].filter(Boolean),
          scaleX: 1,
          duration: FLIP_HALF_MS,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.flipLocks.delete(index);
          },
        });
      },
    });
  }

  private animateFlipDown(index: number): void {
    const bg = this.cardBgs[index];
    const txt = this.cardTexts[index];
    if (!bg || !txt) return;

    this.flipLocks.add(index);

    // Phase 1: scale X to 0
    this.tweens.add({
      targets: [bg, txt],
      scaleX: 0,
      duration: FLIP_HALF_MS,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Swap visuals to face-down (may replace the sprite object)
        this.setCardVisual(index, false, '?');

        // Phase 2: scale X back to 1 (use fresh reference after swap)
        const newTxt = this.cardTexts[index];
        this.tweens.add({
          targets: [bg, newTxt].filter(Boolean),
          scaleX: 1,
          duration: FLIP_HALF_MS,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.flipLocks.delete(index);
          },
        });
      },
    });
  }

  private setCardVisual(index: number, faceUp: boolean, text: string): void {
    const bg = this.cardBgs[index];
    const oldSprite = this.cardTexts[index];
    if (!bg || !oldSprite) return;

    // Preserve position, depth, and current scaleX (important during flip animation)
    const sx = oldSprite.x;
    const sy = oldSprite.y;
    const depth = oldSprite.depth;
    const currentScaleX = oldSprite.scaleX;
    const currentScaleY = oldSprite.scaleY;

    if (faceUp) {
      bg.setFillStyle(CARD_UP_COLOR);
      bg.setStrokeStyle(2, 0xd4c36a);

      // Determine sprite key from the animal name in the card's engine state
      const card = this.engineState.cards[index];
      const spriteKey = card ? card.name.toLowerCase() : '';
      const spriteSize = Math.floor(this.cardSize * 0.7);

      // Destroy old sprite and create the face-up version
      oldSprite.destroy();
      const newSprite = createGameSprite(
        this,
        sx,
        sy,
        spriteKey,
        text,
        spriteSize,
        spriteSize,
        Math.floor(this.cardSize * 0.5),
      );
      newSprite.setDepth(depth);
      newSprite.setScale(currentScaleX, currentScaleY);
      this.cardTexts[index] = newSprite;
    } else {
      bg.setFillStyle(CARD_DOWN_COLOR);
      bg.setStrokeStyle(2, 0x9a763d);

      // Face-down: show card-back sprite or "?" text
      const spriteSize = Math.floor(this.cardSize * 0.7);

      oldSprite.destroy();
      const newSprite = createGameSprite(
        this,
        sx,
        sy,
        'card-back',
        '?',
        spriteSize,
        spriteSize,
        Math.floor(this.cardSize * 0.4),
      );
      newSprite.setDepth(depth);
      newSprite.setScale(currentScaleX, currentScaleY);
      this.cardTexts[index] = newSprite;
    }
  }

  // -----------------------------------------------------------------------
  // Match animations
  // -----------------------------------------------------------------------

  private onMatchFound(card1: number, card2: number, points: number): void {
    // Gold glow pulse on both cards
    for (const idx of [card1, card2]) {
      const bg = this.cardBgs[idx];
      if (!bg) continue;

      // Glow border
      bg.setStrokeStyle(4, GOLD);

      // Scale pulse
      this.tweens.add({
        targets: bg,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: MATCH_GLOW_MS / 2,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          bg.setStrokeStyle(2, 0xd4c36a);
        },
      });

      const txt = this.cardTexts[idx];
      if (txt) {
        this.tweens.add({
          targets: txt,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: MATCH_GLOW_MS / 2,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
      }

      // Particle burst at card center
      const { x, y } = this.getCardCenter(idx);
      this.spawnMatchParticles(x, y, GOLD);
    }

    // Score popup between the two cards
    const c1 = this.getCardCenter(card1);
    const c2 = this.getCardCenter(card2);
    const popX = (c1.x + c2.x) / 2;
    const popY = (c1.y + c2.y) / 2;

    this.showScorePopup(popX, popY, points);

    // Screen shake (very subtle for positive feedback)
    this.cameras.main.shake(80, 0.003);
  }

  private onMismatch(card1: number, card2: number): void {
    // Shake both cards
    for (const idx of [card1, card2]) {
      const bg = this.cardBgs[idx];
      const txt = this.cardTexts[idx];
      if (!bg) continue;

      const originalX = bg.x;

      this.tweens.add({
        targets: [bg, txt].filter(Boolean),
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          bg.x = originalX;
          if (txt) txt.x = originalX;
        },
      });

      // Red flash on cards
      bg.setStrokeStyle(3, 0xff4444);
      this.time.delayedCall(SHAKE_DURATION, () => {
        if (bg.active) {
          bg.setStrokeStyle(2, 0xd4c36a);
        }
      });
    }
  }

  private onMismatchResolved(card1: number, card2: number): void {
    // Flip both cards back face-down
    this.animateFlipDown(card1);
    this.animateFlipDown(card2);
  }

  // -----------------------------------------------------------------------
  // Score popup
  // -----------------------------------------------------------------------

  private showScorePopup(x: number, y: number, points: number): void {
    const popText = this.add
      .text(x, y, `+${points}`, {
        fontSize: '32px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: popText,
      y: y - 90,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => popText.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Particle burst
  // -----------------------------------------------------------------------

  private spawnMatchParticles(x: number, y: number, color: number): void {
    const count = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 50;
      const size = 3 + Math.random() * 4;

      const dot = this.add
        .circle(x, y, size, color)
        .setAlpha(0.9)
        .setDepth(70);

      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // HUD updates
  // -----------------------------------------------------------------------

  private prevDisplayScore = 0;

  private updateHUD(): void {
    const score = this.cumulativeScore + this.engineState.score;
    if (score !== this.prevDisplayScore) {
      this.prevDisplayScore = score;
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2, scaleY: 1.2,
        duration: 100, yoyo: true, ease: 'Back.easeOut',
      });
    }
    this.scoreText.setText(String(score));
    this.movesText.setText(`Moves: ${this.engineState.moves}`);

    // Timer
    const totalSecs = Math.floor(this.engineState.elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);
  }

  // -----------------------------------------------------------------------
  // Combo display
  // -----------------------------------------------------------------------

  private showCombo(count: number): void {
    this.comboText.setText(`${count}x Combo!`);
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
      delay: 1200,
      ease: 'Quad.easeIn',
    });
  }

  private showQuickRecall(bonus: number): void {
    const quickText = this.add
      .text(CX, HUD_HEIGHT + 20, `Quick Recall +${bonus}!`, {
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#44FF88',
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(90);

    this.tweens.add({
      targets: quickText,
      y: HUD_HEIGHT - 10,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => quickText.destroy(),
    });
  }

  private showPerfectClear(bonus: number): void {
    const perfText = this.add
      .text(CX, CY - 40, `Perfect Clear! +${bonus}`, {
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#FFD700',
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(150);

    this.tweens.add({
      targets: perfText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 400,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.tweens.add({
          targets: perfText,
          alpha: 0,
          y: CY - 100,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => perfText.destroy(),
        });
      },
    });
  }

  private showTimeBonus(bonus: number): void {
    const bonusText = this.add
      .text(CX, CY + 20, `Time Bonus +${bonus}`, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#88DDFF',
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(150);

    this.tweens.add({
      targets: bonusText,
      alpha: 0,
      y: CY - 30,
      duration: 1000,
      delay: 400,
      ease: 'Quad.easeOut',
      onComplete: () => bonusText.destroy(),
    });
  }

  // -----------------------------------------------------------------------
  // Stars display helper
  // -----------------------------------------------------------------------

  private starsString(count: number): string {
    const filled = '⭐'.repeat(count);
    const empty = '☆'.repeat(3 - count);
    return filled + empty;
  }

  // -----------------------------------------------------------------------
  // Verse card overlay
  // -----------------------------------------------------------------------

  private showVerseCard(): void {
    this.paused = true;

    const verse: NoahVerse =
      noahVerses[this.verseIndex % noahVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 520;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive()
      .setDepth(200);

    // Card background
    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(201);

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
      .setDepth(202);

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
      .setDepth(202);

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
      .setDepth(202);

    // Continue button
    const btnW = 260;
    const btnH = 64;
    const btnY = CY + 200;

    const btnBg = this.add
      .rectangle(CX, btnY, btnW, btnH, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);

    const btnText = this.add
      .text(CX, btnY, 'Continue', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(204);

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
  // Level Complete
  // -----------------------------------------------------------------------

  private showLevelComplete(result: LevelResult): void {
    this.paused = true;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 0)
      .setInteractive()
      .setDepth(200);

    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 500,
      ease: 'Quad.easeOut',
    });

    const cardW = 620;
    const cardH = 560;
    const cardY = CY;

    // Card slides in from below
    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(201);

    const title = this.add
      .text(CX, H + cardH - 220, 'Level Complete!', {
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(202);

    // Stars
    const starsText = this.add
      .text(CX, H + cardH - 170, this.starsString(result.stars), {
        fontSize: '48px',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(202);

    const stats = [
      `Score: ${result.score}`,
      `Moves: ${result.moves}`,
      `Time: ${Math.floor(result.elapsedMs / 1000)}s`,
      result.perfectClear ? 'Perfect Clear!' : `Mismatches: ${result.mismatches}`,
      result.timeBonus > 0 ? `Time Bonus: +${result.timeBonus}` : '',
    ].filter(Boolean);

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const color = stat.includes('Perfect') ? '#FFD700' : '#2D2D2D';
      const t = this.add
        .text(CX, H + cardH - 110 + i * 38, stat, {
          fontSize: '22px',
          color,
          fontFamily: FONT,
          fontStyle: stat.includes('Perfect') ? 'bold' : 'normal',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(202);
      statTexts.push(t);
    });

    // Next Level button
    const isLastLevel = this.currentLevel >= GAME_CONSTANTS.TOTAL_LEVELS;
    const nextBtnLabel = isLastLevel ? 'View Results' : 'Next Level';
    const nextBtnY = H + cardH + 160;

    const nextBg = this.add
      .rectangle(CX, nextBtnY, 300, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);

    const nextText = this.add
      .text(CX, nextBtnY, nextBtnLabel, {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(204);

    // Back button
    const backBtnY = H + cardH + 230;
    const backText = this.add
      .text(CX, backBtnY, 'Back to Home', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(204);

    // Slide all elements up
    const slideTargets = [
      { obj: card, targetY: cardY },
      { obj: title, targetY: cardY - 220 },
      { obj: starsText, targetY: cardY - 170 },
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY - 110 + i * 38 })),
      { obj: nextBg, targetY: cardY + 160 },
      { obj: nextText, targetY: cardY + 160 },
      { obj: backText, targetY: cardY + 230 },
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

    // Collect all overlay elements for cleanup
    const allOverlayElements = [overlay, card, title, starsText, ...statTexts, nextBg, nextText, backText];

    // Button handlers
    nextBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      if (isLastLevel) {
        for (const el of allOverlayElements) el.destroy();
        this.paused = false;
        this.showGameComplete();
        return;
      }
      // Advance to next level
      this.cumulativeScore += result.score;
      this.currentLevel++;
      this.levelCompleteShown = false;
      this.scene.restart();
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('noahanimalmatch:back');
    });
  }

  // -----------------------------------------------------------------------
  // Game Complete
  // -----------------------------------------------------------------------

  private showGameComplete(): void {
    this.paused = true;

    // Dark overlay
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 0)
      .setInteractive()
      .setDepth(200);

    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 500,
      ease: 'Quad.easeOut',
    });

    const cardW = 620;
    const cardH = 520;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(201);

    // Ark emoji
    const arkEmoji = this.add
      .text(CX, H + cardH - 200, '⛵', {
        fontSize: '64px',
      })
      .setOrigin(0.5)
      .setDepth(202);

    const title = this.add
      .text(CX, H + cardH - 140, 'All Levels Complete!', {
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(202);

    const totalScore = this.cumulativeScore + this.engineState.score;

    // Check for new high score
    const prevHighScore = useNoahAnimalMatchStore.getState().highScore;
    const isNewBest = totalScore > prevHighScore && totalScore > 0;

    // "NEW BEST!" text (created off-screen, slides up with card)
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
        .setDepth(202);
    }

    const statsStartY = isNewBest ? -40 : -70;
    const stats = [
      `Total Score: ${totalScore}`,
      `Best Combo: ${this.engineState.bestCombo}x`,
      `Animals Matched: ${this.engineState.animalsMatched.length}`,
    ];

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const t = this.add
        .text(CX, H + cardH + statsStartY + i * 44, stat, {
          fontSize: '24px',
          color: '#2D2D2D',
          fontFamily: FONT,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(202);
      statTexts.push(t);
    });

    // Play Again button
    const playBtnY = H + cardH + 100;
    const playBg = this.add
      .rectangle(CX, playBtnY, 300, 64, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);

    const playText = this.add
      .text(CX, playBtnY, 'Play Again', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(204);

    // Back to Home
    const backBtnY = H + cardH + 175;
    const backText = this.add
      .text(CX, backBtnY, 'Back to Home', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(204);

    // Slide all elements up
    const slideTargets: { obj: Phaser.GameObjects.GameObject & { y: number }; targetY: number }[] = [
      { obj: card, targetY: cardY },
      { obj: arkEmoji, targetY: cardY - 200 },
      { obj: title, targetY: cardY - 140 },
      ...(newBestText ? [{ obj: newBestText, targetY: cardY - 100 }] : []),
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY + statsStartY + i * 44 })),
      { obj: playBg, targetY: cardY + 100 },
      { obj: playText, targetY: cardY + 100 },
      { obj: backText, targetY: cardY + 175 },
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

    // Spawn celebration particles
    this.time.delayedCall(600, () => {
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 200, () => {
          const px = 100 + Math.random() * (W - 200);
          const py = CY - 100 + Math.random() * 200;
          this.spawnMatchParticles(px, py, [GOLD, 0x44ff88, 0x88ddff, 0xffd700][i % 4]);
        });
      }
    });

    // New high score celebration effects
    if (isNewBest) {
      this.time.delayedCall(800, () => {
        SharedSFX.milestone();
        this.spawnMatchParticles(CX, cardY - 100, 0xffd700);
        this.spawnMatchParticles(CX - 80, cardY - 100, GOLD);
        this.spawnMatchParticles(CX + 80, cardY - 100, GOLD);
      });
    }

    // Button handlers
    playBg.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.currentLevel = 1;
      this.cumulativeScore = 0;
      this.gameCompleteShown = false;
      this.scene.restart();
    });

    backText.on('pointerdown', () => {
      SharedSFX.buttonTap();
      this.game.events.emit('noahanimalmatch:back');
    });

    // Emit complete event
    this.game.events.emit('noahanimalmatch:complete', {
      score: totalScore,
      bestCombo: this.engineState.bestCombo,
      animalsMatched: this.engineState.animalsMatched.length,
    });
  }
}
