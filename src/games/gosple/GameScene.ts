import Phaser from 'phaser';
import { scoreGuess, type TileScore } from '../../engines/wordle/wordleEngine';
import { starterPuzzles, type StarterPuzzle } from '../../engines/wordle/starterPuzzles';

const MAX_ATTEMPTS = 6;
const TILE_GAP = 6;
const TILE_SIZE = 48;
const FLIP_MS = 250;
const FLIP_STAGGER = 120;

const COLORS = {
  correct: 0x4CAF79,
  present: 0xF5A623,
  absent: 0x787C7E,
  empty: 0xFFFFFF,
  emptyBorder: 0xE8E4DC,
  activeBorder: 0xD4C36A,
  gold: 0xD4C36A,
  dark: 0x1A1A1A,
  verseCard: 0xFFF8E7,
  keyDefault: 0xE8E4DC,
};

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DEL'],
];

function getTodayPuzzle(): StarterPuzzle {
  const epoch = new Date('2026-01-01').getTime();
  const day = Math.floor((Date.now() - epoch) / 86400000);
  const index = ((day % starterPuzzles.length) + starterPuzzles.length) % starterPuzzles.length;
  return starterPuzzles[index];
}

type TileObj = { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text };

export class GameScene extends Phaser.Scene {
  private puzzle!: StarterPuzzle;
  private wordLength!: number;
  private currentRow = 0;
  private currentCol = 0;
  private guesses: string[][] = [];
  private tiles: TileObj[][] = [];
  private keyButtons = new Map<string, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>();
  private letterStates = new Map<string, TileScore>();
  private gameOver = false;
  private won = false;
  private animating = false;

  constructor() {
    super('GameScene');
  }

  create() {
    this.puzzle = getTodayPuzzle();
    this.wordLength = this.puzzle.answer.length;
    this.currentRow = 0;
    this.currentCol = 0;
    this.guesses = Array.from({ length: MAX_ATTEMPTS }, () => Array(this.wordLength).fill(''));
    this.gameOver = false;
    this.won = false;
    this.animating = false;
    this.letterStates.clear();
    this.keyButtons.clear();

    const epoch = new Date('2026-01-01').getTime();
    const day = Math.floor((Date.now() - epoch) / 86400000) + 1;

    this.add.text(250, 24, 'Gosple', {
      fontSize: '26px', fontStyle: 'bold', color: '#1A1A1A',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }).setOrigin(0.5);

    this.add.text(250, 48, `Day ${day}`, {
      fontSize: '13px', fontStyle: 'bold', color: '#D4C36A',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }).setOrigin(0.5);

    this.drawGrid();
    this.drawKeyboard();

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.gameOver || this.animating) return;
      const k = e.key.toUpperCase();
      if (k === 'ENTER') this.onKey('ENTER');
      else if (k === 'BACKSPACE') this.onKey('DEL');
      else if (/^[A-Z]$/.test(k)) this.onKey(k);
    });
  }

  private drawGrid() {
    this.tiles = [];
    const gridW = this.wordLength * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const startX = (500 - gridW) / 2 + TILE_SIZE / 2;
    const startY = 75;

    for (let r = 0; r < MAX_ATTEMPTS; r++) {
      const row: TileObj[] = [];
      for (let c = 0; c < this.wordLength; c++) {
        const x = startX + c * (TILE_SIZE + TILE_GAP);
        const y = startY + r * (TILE_SIZE + TILE_GAP);
        const bg = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLORS.empty).setStrokeStyle(2, COLORS.emptyBorder);
        const text = this.add.text(x, y, '', {
          fontSize: '20px', fontStyle: 'bold', color: '#1A1A1A',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }).setOrigin(0.5);
        row.push({ bg, text });
      }
      this.tiles.push(row);
    }
  }

  private drawKeyboard() {
    const kbY = 420;
    const keyH = 40;
    const keyGap = 5;

    for (let r = 0; r < KB_ROWS.length; r++) {
      const row = KB_ROWS[r];
      const wide = (k: string) => k === 'ENTER' || k === 'DEL';
      const totalW = row.reduce((s, k) => s + (wide(k) ? 52 : 32) + keyGap, -keyGap);
      let x = (500 - totalW) / 2;

      for (const key of row) {
        const w = wide(key) ? 52 : 32;
        const cx = x + w / 2;
        const cy = kbY + r * (keyH + keyGap);

        const bg = this.add.rectangle(cx, cy, w, keyH, COLORS.keyDefault)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => { if (!this.animating) this.onKey(key); });

        const label = key === 'DEL' ? '⌫' : key === 'ENTER' ? '↵' : key;
        const text = this.add.text(cx, cy, label, {
          fontSize: wide(key) ? '15px' : '13px', fontStyle: 'bold', color: '#1A1A1A',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }).setOrigin(0.5);

        this.keyButtons.set(key, { bg, text });
        x += w + keyGap;
      }
    }
  }

  private onKey(key: string) {
    if (this.gameOver || this.animating) return;

    if (key === 'DEL') {
      if (this.currentCol > 0) {
        this.currentCol--;
        const t = this.tiles[this.currentRow][this.currentCol];
        t.text.setText('');
        t.bg.setStrokeStyle(2, COLORS.emptyBorder);
        this.guesses[this.currentRow][this.currentCol] = '';
      }
      return;
    }

    if (key === 'ENTER') {
      if (this.currentCol === this.wordLength) {
        this.submitGuess();
      } else {
        this.shakeRow(this.currentRow);
      }
      return;
    }

    if (this.currentCol < this.wordLength) {
      this.guesses[this.currentRow][this.currentCol] = key;
      const t = this.tiles[this.currentRow][this.currentCol];
      t.text.setText(key);
      t.bg.setStrokeStyle(2, COLORS.activeBorder);
      this.tweens.add({
        targets: [t.bg, t.text], scaleX: 1.1, scaleY: 1.1,
        duration: 60, yoyo: true, ease: 'Quad.easeOut',
      });
      this.currentCol++;
    }
  }

  private submitGuess() {
    const guess = this.guesses[this.currentRow].join('');
    const scores = scoreGuess(this.puzzle.answer, guess);
    this.animating = true;
    this.revealRow(this.currentRow, scores, guess);
  }

  private revealRow(row: number, scores: TileScore[], guess: string) {
    const isWin = scores.every((s) => s === 'correct');

    for (let c = 0; c < this.wordLength; c++) {
      const tile = this.tiles[row][c];
      const score = scores[c];
      const letter = guess[c];
      const delay = c * FLIP_STAGGER;

      this.time.delayedCall(delay, () => {
        this.tweens.add({
          targets: [tile.bg, tile.text], scaleY: 0,
          duration: FLIP_MS / 2, ease: 'Quad.easeIn',
          onComplete: () => {
            const color = score === 'correct' ? COLORS.correct
              : score === 'present' ? COLORS.present : COLORS.absent;
            tile.bg.setFillStyle(color).setStrokeStyle(0);
            tile.text.setColor('#FFFFFF');
            this.tweens.add({
              targets: [tile.bg, tile.text], scaleY: 1,
              duration: FLIP_MS / 2, ease: 'Quad.easeOut',
            });
          },
        });
      });

      const prev = this.letterStates.get(letter);
      if (!prev || score === 'correct' || (score === 'present' && prev === 'absent')) {
        this.letterStates.set(letter, score);
      }
    }

    const totalDelay = this.wordLength * FLIP_STAGGER + FLIP_MS;
    this.time.delayedCall(totalDelay, () => {
      this.updateKeyboard();
      this.animating = false;

      if (isWin) {
        this.gameOver = true;
        this.won = true;
        this.bounceRow(row);
        this.time.delayedCall(600, () => this.showResult());
      } else if (row === MAX_ATTEMPTS - 1) {
        this.gameOver = true;
        this.won = false;
        this.time.delayedCall(300, () => this.showResult());
      } else {
        this.currentRow++;
        this.currentCol = 0;
      }
    });
  }

  private updateKeyboard() {
    for (const [letter, state] of this.letterStates) {
      const btn = this.keyButtons.get(letter);
      if (!btn) continue;
      const color = state === 'correct' ? COLORS.correct
        : state === 'present' ? COLORS.present : COLORS.absent;
      btn.bg.setFillStyle(color);
      btn.text.setColor('#FFFFFF');
    }
  }

  private shakeRow(row: number) {
    for (const t of this.tiles[row]) {
      this.tweens.add({
        targets: [t.bg, t.text], x: '+=6', duration: 50,
        yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
      });
    }
  }

  private bounceRow(row: number) {
    this.tiles[row].forEach((t, i) => {
      this.tweens.add({
        targets: [t.bg, t.text], y: '-=14', duration: 180,
        delay: i * 70, yoyo: true, ease: 'Quad.easeOut',
      });
    });
  }

  private showResult() {
    const overlay = this.add.rectangle(250, 310, 500, 620, 0x000000, 0.4).setInteractive();
    const cardW = 400;
    const cardY = 300;

    const card = this.add.rectangle(250, cardY, cardW, 300, COLORS.verseCard);

    const label = this.won
      ? `You got it in ${this.currentRow + 1}!`
      : `The answer was ${this.puzzle.answer}`;

    const resultTxt = this.add.text(250, cardY - 110, label, {
      fontSize: '18px', fontStyle: 'bold', color: '#1A1A1A', align: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }).setOrigin(0.5);

    const refTxt = this.add.text(250, cardY - 80, this.puzzle.reference, {
      fontSize: '13px', fontStyle: 'bold', color: '#D4C36A', align: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }).setOrigin(0.5);

    const verseTxt = this.add.text(250, cardY - 20, `"${this.puzzle.verse}"`, {
      fontSize: '15px', color: '#2D2D2D', align: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      wordWrap: { width: cardW - 50 }, lineSpacing: 5,
    }).setOrigin(0.5);

    const promptTxt = this.add.text(250, cardY + 50, this.puzzle.kidPrompt, {
      fontSize: '13px', fontStyle: 'italic', color: '#5A5A5A', align: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      wordWrap: { width: cardW - 50 },
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(250, cardY + 110, 180, 44, COLORS.gold)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(250, cardY + 110, 'BACK TO HOME', {
      fontSize: '13px', fontStyle: 'bold', color: '#1A1A1A',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.game.events.emit('gosple:complete', { won: this.won, attempts: this.currentRow + 1 });
    });

    for (const el of [overlay, card, resultTxt, refTxt, verseTxt, promptTxt, btnBg, btnTxt]) {
      el.setAlpha(0);
      this.tweens.add({ targets: el, alpha: 1, duration: 350, ease: 'Quad.easeOut' });
    }
  }
}
