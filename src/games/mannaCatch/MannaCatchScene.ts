import Phaser from 'phaser';
import { createInitialState, tick, type GameEvent } from './gameEngine';
import { createRng } from './prng';
import { GAME_CONSTANTS } from './itemConfig';
import { mannaVerses, type MannaCatchVerse } from './verses';
import type { GameState, FallingItem, ActivePowerUp } from './types';
import { createBackground, type BackgroundLayer } from './renderBackground';
import { createBasket, type BasketVisual } from './renderBasket';
import { createItemVisual, type ItemVisual } from './renderItems';
import { preloadSprites, createGameSprite, type GameSprite } from '../../utils/spriteHelper';
import { SPRITE_MAP } from './spriteMap';

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
const LERP_SPEED = 0.15;
const KEYBOARD_SPEED = 600; // pixels per second for arrow keys
const MAX_DELTA = 100;
const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];
const COUNTDOWN_STEP_MS = 700;

const POWERUP_NAMES: Record<string, string> = {
  wide_basket: 'WIDE BASKET!',
  slow_mo: 'SLOW MOTION!',
  magnet: 'MAGNET!',
};

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class MannaCatchScene extends Phaser.Scene {
  // Engine state
  private engineState!: GameState;
  private rng!: () => number;

  // Visual renderers
  private bg!: BackgroundLayer;
  private basketVisual!: BasketVisual;
  private itemVisuals = new Map<string, ItemVisual>();

  // Basket tracking
  private basketTargetX = CX;
  private basketVisualX = CX;
  private lastBasketWidth = 0;

  // HUD
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  // Overlays
  private overlayGroup!: Phaser.GameObjects.Group;
  private slowMoTint: Phaser.GameObjects.Rectangle | null = null;

  // Flags
  private paused = false;
  private gameStarted = false;
  private gameOverShown = false;
  private keyLeft = false;
  private keyRight = false;

  // Stats
  private totalItemsCaught = 0;

  // Verse tracking
  private verseIndex = 0;

  constructor() {
    super('MannaCatchScene');
  }

  preload(): void {
    preloadSprites(this, SPRITE_MAP);
  }

  create(): void {
    // Reset state
    this.paused = false;
    this.gameStarted = false;
    this.gameOverShown = false;
    this.totalItemsCaught = 0;
    this.verseIndex = 0;
    this.keyLeft = false;
    this.keyRight = false;
    this.slowMoTint = null;
    this.itemVisuals.clear();

    // Seed RNG (freeplay uses random seed)
    const seed = Date.now();
    this.rng = createRng(seed);

    // Create engine state
    this.engineState = createInitialState('freeplay');
    this.engineState.basket.x = CX - (W * GAME_CONSTANTS.BASKET_WIDTH_RATIO) / 2;
    this.engineState.basket.width = Math.round(W * GAME_CONSTANTS.BASKET_WIDTH_RATIO);

    // Background (before HUD so it renders behind everything)
    this.bg = createBackground(this, W, H);

    // Build visual layers (order matters for depth)
    this.createHUD();

    const basketW = Math.round(W * GAME_CONSTANTS.BASKET_WIDTH_RATIO);
    const basketH = Math.round(W * GAME_CONSTANTS.BASKET_HEIGHT_RATIO);
    const basketY = H - GAME_CONSTANTS.BASKET_BOTTOM_OFFSET - basketH / 2;
    this.basketVisualX = CX;
    this.basketTargetX = CX;
    this.basketVisual = createBasket(this, CX, basketY, basketW, basketH);

    this.setupInput();

    // Overlay group for verse cards and game over
    this.overlayGroup = this.add.group();

    // Start countdown
    this.showCountdown();
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
      this.game.events.emit('mannaCatch:back');
    });

    // Level indicator
    this.levelText = this.add
      .text(CX, 20, 'Level 1', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0)
      .setDepth(100);

    // Score
    this.scoreText = this.add
      .text(CX, 56, '0', {
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    // Lives (hearts)
    this.livesText = this.add
      .text(W - 30, 44, this.heartsString(GAME_CONSTANTS.INITIAL_LIVES), {
        fontSize: '28px',
        fontFamily: FONT,
      })
      .setOrigin(1, 0.5)
      .setDepth(100);

    // Combo indicator (hidden initially)
    this.comboText = this.add
      .text(CX, 90, '', {
        fontSize: '28px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(100);
  }

  private heartsString(lives: number): string {
    return '❤️'.repeat(Math.max(0, lives));
  }

  // -----------------------------------------------------------------------
  // Basket width helper
  // -----------------------------------------------------------------------

  private getBasketWidth(): number {
    const hasWideBasket = this.engineState.activePowerUps.some(
      (p) => p.type === 'wide_basket',
    );
    const ratio = hasWideBasket
      ? GAME_CONSTANTS.BASKET_WIDTH_RATIO * 1.5
      : GAME_CONSTANTS.BASKET_WIDTH_RATIO;
    return Math.round(W * ratio);
  }

  // -----------------------------------------------------------------------
  // Input
  // -----------------------------------------------------------------------

  private setupInput(): void {
    // Pointer / touch movement
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.paused) return;
      this.basketTargetX = Phaser.Math.Clamp(
        pointer.x,
        this.getBasketWidth() / 2,
        W - this.getBasketWidth() / 2,
      );
    });

    // Also track on pointerdown (for touch devices that don't fire move initially)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.paused) return;
      this.basketTargetX = Phaser.Math.Clamp(
        pointer.x,
        this.getBasketWidth() / 2,
        W - this.getBasketWidth() / 2,
      );
    });

    // Keyboard fallback
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-LEFT', () => {
        this.keyLeft = true;
      });
      this.input.keyboard.on('keyup-LEFT', () => {
        this.keyLeft = false;
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        this.keyRight = true;
      });
      this.input.keyboard.on('keyup-RIGHT', () => {
        this.keyRight = false;
      });
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
    if (this.engineState.phase === 'gameover') {
      if (!this.gameOverShown) {
        this.gameOverShown = true;
        this.showGameOver();
      }
      return;
    }

    const dt = Math.min(delta, MAX_DELTA);

    // -- Keyboard movement ------------------------------------------------
    if (this.keyLeft || this.keyRight) {
      const dir = (this.keyRight ? 1 : 0) - (this.keyLeft ? 1 : 0);
      const halfW = this.getBasketWidth() / 2;
      this.basketTargetX = Phaser.Math.Clamp(
        this.basketTargetX + dir * KEYBOARD_SPEED * (dt / 1000),
        halfW,
        W - halfW,
      );
    }

    // -- Smooth basket follow (time-based LERP) ----------------------------
    const lerpFactor = 1 - Math.pow(1 - LERP_SPEED, dt / 16.67);
    this.basketVisualX = Phaser.Math.Linear(
      this.basketVisualX,
      this.basketTargetX,
      lerpFactor,
    );
    this.basketVisual.setPosition(this.basketVisualX);

    // Update basket width for power-ups (only redraw when changed)
    const currentBasketW = this.getBasketWidth();
    if (currentBasketW !== this.lastBasketWidth) {
      this.basketVisual.setWidth(currentBasketW, Math.round(W * GAME_CONSTANTS.BASKET_HEIGHT_RATIO));
      this.lastBasketWidth = currentBasketW;
    }

    // Sync engine basket position (engine uses top-left x)
    this.engineState = {
      ...this.engineState,
      basket: {
        x: this.basketVisualX - currentBasketW / 2,
        width: currentBasketW,
      },
    };

    // -- Tick engine -------------------------------------------------------
    const result = tick(this.engineState, dt, W, H, this.rng);
    this.engineState = result.state;

    // -- Process events ----------------------------------------------------
    for (const event of result.events) {
      this.handleEvent(event);
    }

    // -- Sync visuals ------------------------------------------------------
    this.syncItems();
    this.updateHUD();
  }

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  private handleEvent(event: GameEvent): void {
    switch (event.type) {
      case 'item_caught':
        this.totalItemsCaught++;
        this.onItemCaught(event.item);
        break;
      case 'bad_item_caught':
        this.onBadItemCaught(event.item);
        break;
      case 'item_missed':
        this.onItemMissed(event.item);
        break;
      case 'life_lost':
        this.flashLives();
        break;
      case 'combo':
        this.showCombo(event.count);
        break;
      case 'level_complete':
        this.showLevelComplete(event.level);
        break;
      case 'powerup_activated':
        this.onPowerUpActivated(event.powerUp);
        break;
      case 'powerup_expired':
        this.onPowerUpExpired(event.type_);
        break;
      case 'game_over':
        // Handled in update loop via phase check
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Item sync (engine state -> visual renderers)
  // -----------------------------------------------------------------------

  private syncItems(): void {
    const engineItemIds = new Set<string>();

    for (const item of this.engineState.items) {
      engineItemIds.add(item.id);

      let visual = this.itemVisuals.get(item.id);
      if (!visual) {
        // Create new item visual via renderer module
        visual = createItemVisual(this, item);
        this.itemVisuals.set(item.id, visual);
      }

      // Update position
      visual.update(item.x + item.width / 2, item.y + item.height / 2);
    }

    // Remove visuals for items no longer in engine state
    for (const [id, visual] of this.itemVisuals) {
      if (!engineItemIds.has(id)) {
        visual.destroy();
        this.itemVisuals.delete(id);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Catch / miss animations
  // -----------------------------------------------------------------------

  private onItemCaught(item: FallingItem): void {
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;

    // Play collect animation on the visual (if it still exists)
    const visual = this.itemVisuals.get(item.id);
    if (visual) {
      // Detach from sync so we can animate it independently
      this.itemVisuals.delete(item.id);
      visual.playCollectAnimation(() => visual.destroy());
    }

    // Score pop-up
    const popText = this.add
      .text(cx, cy, `+${item.points}`, {
        fontSize: '28px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: popText,
      y: cy - 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popText.destroy(),
    });

    // Particle burst
    this.spawnCatchParticles(cx, cy, this.getItemColor(item));
  }

  private onBadItemCaught(item: FallingItem): void {
    // Remove visual immediately
    const visual = this.itemVisuals.get(item.id);
    if (visual) {
      visual.destroy();
      this.itemVisuals.delete(item.id);
    }

    // Red flash overlay
    const flash = this.add
      .rectangle(CX, CY, W, H, 0xff0000, 0.3)
      .setDepth(150);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });

    // Screen shake
    this.cameras.main.shake(100, 0.005);
  }

  private onItemMissed(item: FallingItem): void {
    // Clean up visual if still tracked (engine already removed it)
    const visual = this.itemVisuals.get(item.id);
    if (visual) {
      visual.destroy();
      this.itemVisuals.delete(item.id);
    }
  }

  private getItemColor(item: FallingItem): number {
    switch (item.type) {
      case 'manna':
        return 0xf5deb3;
      case 'honey':
        return 0xffc107;
      case 'grapes':
        return 0x9c27b0;
      case 'pomegranate':
        return 0xe53935;
      case 'figs':
        return 0x689f38;
      case 'star':
        return 0xffd700;
      case 'scroll':
        return 0xd2b48c;
      case 'snake':
        return 0x2E7D32;
      default:
        return 0xffffff;
    }
  }

  private spawnCatchParticles(x: number, y: number, color: number): void {
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 80 + Math.random() * 60;
      const size = 4 + Math.random() * 4;

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
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // -----------------------------------------------------------------------
  // HUD updates
  // -----------------------------------------------------------------------

  private updateHUD(): void {
    this.levelText.setText('Level ' + this.engineState.level);
    this.scoreText.setText(String(this.engineState.score));
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
  }

  private showCombo(count: number): void {
    this.comboText.setText(`${count}x Combo!`);
    this.comboText.setAlpha(1);
    this.comboText.setScale(1.4);

    // Scale settle
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Fade out after a bit
    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      duration: 300,
      delay: 1200,
      ease: 'Quad.easeIn',
    });
  }

  // -----------------------------------------------------------------------
  // Power-up activation / expiration visuals
  // -----------------------------------------------------------------------

  /** Map power-up engine type to sprite key (underscores -> hyphens). */
  private powerUpSpriteKey(type: string): string {
    return type.replace(/_/g, '-');
  }

  private onPowerUpActivated(powerUp: ActivePowerUp): void {
    const name = POWERUP_NAMES[powerUp.type] || powerUp.type.toUpperCase();

    // Large centered icon (image sprite with emoji fallback)
    const icon: GameSprite = createGameSprite(
      this,
      CX,
      CY - 60,
      this.powerUpSpriteKey(powerUp.type),
      powerUp.icon,
      80,
      80,
      80,
    );
    icon.setOrigin(0.5);
    icon.setAlpha(0);
    icon.setDepth(160);

    // Name label below the icon
    const label = this.add
      .text(CX, CY + 20, name, {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        fontFamily: FONT,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(160);

    // Fade up and out for both
    for (const obj of [icon, label]) {
      const startY = obj.y;
      this.tweens.add({
        targets: obj,
        alpha: 1,
        duration: 200,
        ease: 'Quad.easeOut',
      });
      this.tweens.add({
        targets: obj,
        y: startY - 60,
        alpha: 0,
        duration: 1200,
        delay: 200,
        ease: 'Quad.easeOut',
        onComplete: () => obj.destroy(),
      });
    }

    // Slow-Mo: add a semi-transparent blue tint overlay for the duration
    if (powerUp.type === 'slow_mo') {
      if (this.slowMoTint) {
        this.slowMoTint.destroy();
      }
      this.slowMoTint = this.add
        .rectangle(CX, CY, W, H, 0x0044ff, 0.08)
        .setDepth(5);
    }
  }

  private onPowerUpExpired(expiredType: string): void {
    const flash = this.add
      .rectangle(CX, CY, W, H, 0xffffff, 0.25)
      .setDepth(150);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });

    if (expiredType === 'slow_mo' && this.slowMoTint) {
      this.slowMoTint.destroy();
      this.slowMoTint = null;
    }
  }

  // -----------------------------------------------------------------------
  // Level complete overlay
  // -----------------------------------------------------------------------

  private showLevelComplete(level: number): void {
    this.paused = true;

    const verse: MannaCatchVerse =
      mannaVerses[this.verseIndex % mannaVerses.length];
    this.verseIndex++;

    const cardW = 620;
    const cardH = 580;

    // Dark overlay (fill alpha 1, use game object alpha for fade)
    const overlay = this.add
      .rectangle(CX, CY, W, H, OVERLAY_COLOR, 1)
      .setInteractive()
      .setDepth(200);

    // Card background
    const card = this.add
      .rectangle(CX, CY, cardW, cardH, VERSE_CARD_BG)
      .setDepth(201);

    // Level complete title
    const titleText = this.add
      .text(CX, CY - 220, `Level ${level} Complete!`, {
        fontSize: '32px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(202);

    // Verse reference
    const refText = this.add
      .text(CX, CY - 140, verse.reference, {
        fontSize: '22px',
        fontStyle: 'bold',
        color: GOLD_HEX,
        fontFamily: FONT,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(202);

    // Verse text
    const verseTxt = this.add
      .text(CX, CY - 30, `"${verse.verse}"`, {
        fontSize: '22px',
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
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#5A5A5A',
        fontFamily: FONT,
        align: 'center',
        wordWrap: { width: cardW - 80 },
      })
      .setOrigin(0.5)
      .setDepth(202);

    // Next Level button
    const btnW = 260;
    const btnH = 64;
    const btnY = CY + 220;

    const btnBg = this.add
      .rectangle(CX, btnY, btnW, btnH, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);

    const btnText = this.add
      .text(CX, btnY, 'Next Level', {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(204);

    // Fade in all elements
    const elements = [overlay, card, titleText, refText, verseTxt, promptTxt, btnBg, btnText];
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
      // Fade out and destroy
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
  // Game Over
  // -----------------------------------------------------------------------

  private showGameOver(): void {
    this.paused = true;

    // Freeze items in place (fade them out)
    for (const [, visual] of this.itemVisuals) {
      // ItemVisual doesn't expose alpha control, so just destroy them
      visual.destroy();
    }
    this.itemVisuals.clear();

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

    // Stats card slides in from below
    const cardW = 620;
    const cardH = 480;
    const cardY = CY;

    const card = this.add
      .rectangle(CX, H + cardH, cardW, cardH, VERSE_CARD_BG)
      .setDepth(201);

    const title = this.add
      .text(CX, H + cardH - 180, 'Game Over', {
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#1A1A1A',
        fontFamily: FONT,
      })
      .setOrigin(0.5)
      .setDepth(202);

    const stats = [
      'Level Reached: ' + this.engineState.level,
      'Final Score: ' + this.engineState.score,
      'Best Combo: ' + this.engineState.bestCombo + 'x',
      'Items Caught: ' + this.totalItemsCaught,
    ];

    const statTexts: Phaser.GameObjects.Text[] = [];
    stats.forEach((stat, i) => {
      const t = this.add
        .text(CX, H + cardH - 100 + i * 44, stat, {
          fontSize: '24px',
          color: '#2D2D2D',
          fontFamily: FONT,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(202);
      statTexts.push(t);
    });

    // Buttons
    const playBtnY = H + cardH + 130;
    const backBtnY = H + cardH + 200;

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

    // Slide all card elements up
    const slideTargets = [
      { obj: card, targetY: cardY },
      { obj: title, targetY: cardY - 180 },
      ...statTexts.map((t, i) => ({ obj: t, targetY: cardY - 100 + i * 44 })),
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

    // Button handlers
    playBg.on('pointerdown', () => {
      this.scene.restart();
    });

    backText.on('pointerdown', () => {
      this.game.events.emit('mannaCatch:back');
    });

    // Emit complete event
    this.game.events.emit('mannaCatch:complete', {
      score: this.engineState.score,
      bestCombo: this.engineState.bestCombo,
      itemsCaught: this.totalItemsCaught,
    });
  }
}
