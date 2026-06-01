import Phaser from 'phaser';
import { scoreGuess, type TileScore } from '../../engines/wordle/wordleEngine';
import { starterPuzzles, type StarterPuzzle } from '../../engines/wordle/starterPuzzles';

const MAX_ATTEMPTS = 6;
const TILE_GAP = 6;
const FLIP_MS = 250;
const FLIP_STAGGER = 120;
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const C = {
  correct: 0x4CAF79,
  present: 0xF5A623,
  absent: 0x787C7E,
  empty: 0xFFFFFF,
  border: 0xE8E4DC,
  active: 0xD4C36A,
  gold: 0xD4C36A,
  dark: 0x1A1A1A,
  verse: 0xFFF8E7,
  key: 0xE8E4DC,
};

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DEL'],
];

function getTodayPuzzle(): StarterPuzzle {
  const epoch = new Date('2026-01-01').getTime();
  const day = Math.floor((Date.now() - epoch) / 86400000);
  return starterPuzzles[((day % starterPuzzles.length) + starterPuzzles.length) % starterPuzzles.length];
}

type Tile = { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text };

export class GameScene extends Phaser.Scene {
  private puzzle!: StarterPuzzle;
  private wLen!: number;
  private row = 0;
  private col = 0;
  private guesses: string[][] = [];
  private tiles: Tile[][] = [];
  private keys = new Map<string, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>();
  private letterStates = new Map<string, TileScore>();
  private over = false;
  private won = false;
  private busy = false;
  private W!: number;
  private H!: number;

  constructor() { super('GameScene'); }

  preload() {
    this.load.image('logo', '/gosple-icon.png');
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.puzzle = getTodayPuzzle();
    this.wLen = this.puzzle.answer.length;
    this.row = 0;
    this.col = 0;
    this.guesses = Array.from({ length: MAX_ATTEMPTS }, () => Array(this.wLen).fill(''));
    this.over = false;
    this.won = false;
    this.busy = false;
    this.letterStates.clear();
    this.keys.clear();

    this.drawHeader();
    this.drawGrid();
    this.drawKeyboard();

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.over || this.busy) return;
      const k = e.key.toUpperCase();
      if (k === 'ENTER') this.onKey('ENTER');
      else if (k === 'BACKSPACE') this.onKey('DEL');
      else if (/^[A-Z]$/.test(k)) this.onKey(k);
    });
  }

  private drawHeader() {
    const cx = this.W / 2;
    const epoch = new Date('2026-01-01').getTime();
    const day = Math.floor((Date.now() - epoch) / 86400000) + 1;

    const logo = this.add.image(20, 22, 'logo').setOrigin(0, 0.5);
    logo.setDisplaySize(32, 32);

    this.add.text(cx, 20, 'Gosple', {
      fontSize: '24px', fontStyle: 'bold', color: '#1A1A1A', fontFamily: FONT,
    }).setOrigin(0.5);

    this.add.text(cx, 44, `Day ${day}`, {
      fontSize: '12px', fontStyle: 'bold', color: '#D4C36A', fontFamily: FONT,
    }).setOrigin(0.5);
  }

  private drawGrid() {
    this.tiles = [];
    const tileSize = Math.min(48, Math.floor((this.W - 40 - (this.wLen - 1) * TILE_GAP) / this.wLen));
    const gridW = this.wLen * (tileSize + TILE_GAP) - TILE_GAP;
    const gridH = MAX_ATTEMPTS * (tileSize + TILE_GAP) - TILE_GAP;
    const startX = (this.W - gridW) / 2 + tileSize / 2;
    const kbHeight = 3 * 44 + 2 * 5 + 20;
    const available = this.H - 60 - kbHeight;
    const startY = 60 + (available - gridH) / 2;

    for (let r = 0; r < MAX_ATTEMPTS; r++) {
      const rowTiles: Tile[] = [];
      for (let c = 0; c < this.wLen; c++) {
        const x = startX + c * (tileSize + TILE_GAP);
        const y = startY + r * (tileSize + TILE_GAP);
        const bg = this.add.rectangle(x, y, tileSize, tileSize, C.empty).setStrokeStyle(2, C.border);
        const text = this.add.text(x, y, '', {
          fontSize: `${Math.floor(tileSize * 0.42)}px`, fontStyle: 'bold', color: '#1A1A1A', fontFamily: FONT,
        }).setOrigin(0.5);
        rowTiles.push({ bg, text });
      }
      this.tiles.push(rowTiles);
    }
  }

  private drawKeyboard() {
    const keyH = 42;
    const keyGap = 4;
    const kbTotalH = 3 * keyH + 2 * keyGap;
    const kbTop = this.H - kbTotalH - 10;

    for (let r = 0; r < KB_ROWS.length; r++) {
      const row = KB_ROWS[r];
      const wide = (k: string) => k === 'ENTER' || k === 'DEL';
      const keyW = Math.floor((this.W - 20 - (row.length - 1) * keyGap) / (row.length + (row.filter(k => wide(k)).length * 0.6)));
      const wideW = Math.floor(keyW * 1.6);
      const totalW = row.reduce((s, k) => s + (wide(k) ? wideW : keyW) + keyGap, -keyGap);
      let x = (this.W - totalW) / 2;

      for (const key of row) {
        const w = wide(key) ? wideW : keyW;
        const cx = x + w / 2;
        const cy = kbTop + r * (keyH + keyGap);

        const bg = this.add.rectangle(cx, cy, w, keyH, C.key)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => { if (!this.busy) this.onKey(key); });

        const label = key === 'DEL' ? '⌫' : key === 'ENTER' ? '↵' : key;
        const text = this.add.text(cx, cy, label, {
          fontSize: wide(key) ? '14px' : '13px', fontStyle: 'bold', color: '#1A1A1A', fontFamily: FONT,
        }).setOrigin(0.5);

        this.keys.set(key, { bg, text });
        x += w + keyGap;
      }
    }
  }

  private onKey(key: string) {
    if (this.over || this.busy) return;

    if (key === 'DEL') {
      if (this.col > 0) {
        this.col--;
        const t = this.tiles[this.row][this.col];
        t.text.setText('');
        t.bg.setStrokeStyle(2, C.border);
        this.guesses[this.row][this.col] = '';
      }
      return;
    }

    if (key === 'ENTER') {
      if (this.col === this.wLen) this.submit();
      else this.shakeRow(this.row);
      return;
    }

    if (this.col < this.wLen) {
      this.guesses[this.row][this.col] = key;
      const t = this.tiles[this.row][this.col];
      t.text.setText(key);
      t.bg.setStrokeStyle(2, C.active);
      this.tweens.add({
        targets: [t.bg, t.text], scaleX: 1.08, scaleY: 1.08,
        duration: 50, yoyo: true, ease: 'Quad.easeOut',
      });
      this.col++;
    }
  }

  private submit() {
    const guess = this.guesses[this.row].join('');
    const scores = scoreGuess(this.puzzle.answer, guess);
    this.busy = true;
    const isWin = scores.every(s => s === 'correct');

    for (let c = 0; c < this.wLen; c++) {
      const tile = this.tiles[this.row][c];
      const score = scores[c];
      this.time.delayedCall(c * FLIP_STAGGER, () => {
        this.tweens.add({
          targets: [tile.bg, tile.text], scaleY: 0,
          duration: FLIP_MS / 2, ease: 'Quad.easeIn',
          onComplete: () => {
            const color = score === 'correct' ? C.correct : score === 'present' ? C.present : C.absent;
            tile.bg.setFillStyle(color).setStrokeStyle(0);
            tile.text.setColor('#FFFFFF');
            this.tweens.add({ targets: [tile.bg, tile.text], scaleY: 1, duration: FLIP_MS / 2, ease: 'Quad.easeOut' });
          },
        });
      });

      const letter = guess[c];
      const prev = this.letterStates.get(letter);
      if (!prev || score === 'correct' || (score === 'present' && prev === 'absent')) {
        this.letterStates.set(letter, score);
      }
    }

    const totalDelay = this.wLen * FLIP_STAGGER + FLIP_MS;
    this.time.delayedCall(totalDelay, () => {
      this.updateKB();
      this.busy = false;

      if (isWin) {
        this.over = true;
        this.won = true;
        this.bounceRow(this.row);
        this.time.delayedCall(500, () => this.showResult());
      } else if (this.row === MAX_ATTEMPTS - 1) {
        this.over = true;
        this.time.delayedCall(300, () => this.showResult());
      } else {
        this.row++;
        this.col = 0;
      }
    });
  }

  private updateKB() {
    for (const [letter, state] of this.letterStates) {
      const btn = this.keys.get(letter);
      if (!btn) continue;
      btn.bg.setFillStyle(state === 'correct' ? C.correct : state === 'present' ? C.present : C.absent);
      btn.text.setColor('#FFFFFF');
    }
  }

  private shakeRow(row: number) {
    for (const t of this.tiles[row]) {
      this.tweens.add({ targets: [t.bg, t.text], x: '+=5', duration: 40, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
    }
  }

  private bounceRow(row: number) {
    this.tiles[row].forEach((t, i) => {
      this.tweens.add({ targets: [t.bg, t.text], y: '-=12', duration: 160, delay: i * 60, yoyo: true, ease: 'Quad.easeOut' });
    });
  }

  private showResult() {
    const cx = this.W / 2;
    const cy = this.H / 2;
    const cardW = Math.min(this.W - 40, 400);

    const overlay = this.add.rectangle(cx, cy, this.W, this.H, 0x000000, 0.4).setInteractive();
    const card = this.add.rectangle(cx, cy, cardW, 280, C.verse);

    const label = this.won ? `You got it in ${this.row + 1}!` : `The answer was ${this.puzzle.answer}`;

    const resultTxt = this.add.text(cx, cy - 100, label, {
      fontSize: '18px', fontStyle: 'bold', color: '#1A1A1A', align: 'center', fontFamily: FONT,
    }).setOrigin(0.5);

    const refTxt = this.add.text(cx, cy - 72, this.puzzle.reference, {
      fontSize: '13px', fontStyle: 'bold', color: '#D4C36A', align: 'center', fontFamily: FONT,
    }).setOrigin(0.5);

    const verseTxt = this.add.text(cx, cy - 16, `"${this.puzzle.verse}"`, {
      fontSize: '14px', color: '#2D2D2D', align: 'center', fontFamily: FONT,
      wordWrap: { width: cardW - 50 }, lineSpacing: 4,
    }).setOrigin(0.5);

    const promptTxt = this.add.text(cx, cy + 48, this.puzzle.kidPrompt, {
      fontSize: '12px', fontStyle: 'italic', color: '#5A5A5A', align: 'center', fontFamily: FONT,
      wordWrap: { width: cardW - 50 },
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(cx, cy + 100, 170, 42, C.gold)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(cx, cy + 100, 'BACK TO HOME', {
      fontSize: '13px', fontStyle: 'bold', color: '#1A1A1A', fontFamily: FONT,
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.game.events.emit('gosple:complete', { won: this.won, attempts: this.row + 1 });
    });

    for (const el of [overlay, card, resultTxt, refTxt, verseTxt, promptTxt, btnBg, btnTxt]) {
      el.setAlpha(0);
      this.tweens.add({ targets: el, alpha: 1, duration: 300, ease: 'Quad.easeOut' });
    }
  }
}
