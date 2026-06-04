// ---------------------------------------------------------------------------
// Bible Brick Breaker -- Pure Game Engine
// "Break through the bricks, reveal the Word"
//
// Pure functional engine: no Phaser, no DOM, no side effects.
// All state changes return new objects. Rendering layer handles visuals.
// ---------------------------------------------------------------------------

import type {
  Brick,
  BrickType,
  Ball,
  Paddle,
  PowerUp,
  PowerUpKind,
  ActiveEffect,
  GameState,
  GameEvent,
} from './types';
import { GAME_CONSTANTS } from './config';

const {
  CANVAS_W,
  CANVAS_H,
  PADDLE_W,
  PADDLE_H,
  PADDLE_Y,
  BALL_RADIUS,
  BASE_BALL_SPEED,
  BALL_SPEED_INCREMENT,
  MAX_BALL_SPEED,
  BRICK_ROWS_BASE,
  BRICK_COLS,
  BRICK_W,
  BRICK_H,
  BRICK_PADDING,
  BRICK_OFFSET_X,
  BRICK_OFFSET_Y,
  MAX_BRICK_ROWS,
  CLAY_HITS,
  STONE_HITS,
  GOLD_HITS,
  CLAY_POINTS,
  STONE_POINTS,
  GOLD_POINTS,
  STARTING_LIVES,
  WIDE_PADDLE_MULT,
  WIDE_PADDLE_MS,
  SLOW_BALL_MULT,
  SLOW_BALL_MS,
  POWERUP_FALL_SPEED,
  POWERUP_SIZE,
  STONE_CHANCE_BASE,
  STONE_CHANCE_PER_LEVEL,
  GOLD_CHANCE,
  VERSE_MILESTONE_INTERVAL,
} = GAME_CONSTANTS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Shuffle an array using Fisher-Yates with provided rng. Returns new array. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Points awarded for breaking a brick of a given type. */
function pointsForType(type: BrickType): number {
  switch (type) {
    case 'clay': return CLAY_POINTS;
    case 'stone': return STONE_POINTS;
    case 'gold': return GOLD_POINTS;
  }
}

/** Hits required for a brick type. */
function hitsForType(type: BrickType): number {
  switch (type) {
    case 'clay': return CLAY_HITS;
    case 'stone': return STONE_HITS;
    case 'gold': return GOLD_HITS;
  }
}

/** Get brick rect in pixel coordinates. */
function brickRect(brick: Brick): { x: number; y: number; w: number; h: number } {
  return {
    x: BRICK_OFFSET_X + brick.col * (BRICK_W + BRICK_PADDING),
    y: BRICK_OFFSET_Y + brick.row * (BRICK_H + BRICK_PADDING),
    w: BRICK_W,
    h: BRICK_H,
  };
}

/** Compute the effective ball speed for a given level. */
function ballSpeedForLevel(level: number): number {
  return Math.min(
    BASE_BALL_SPEED + BALL_SPEED_INCREMENT * (level - 1),
    MAX_BALL_SPEED,
  );
}

/** Pick a random power-up kind. */
function randomPowerUpKind(rng: () => number): PowerUpKind {
  const kinds: PowerUpKind[] = ['widePaddle', 'multiBall', 'slowBall'];
  return kinds[Math.floor(rng() * kinds.length)];
}

/** Check circle-rect overlap. Returns collision side or null. */
function circleRectCollision(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): 'top' | 'bottom' | 'left' | 'right' | null {
  // Find closest point on rect to circle center
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const distX = cx - closestX;
  const distY = cy - closestY;

  if (distX * distX + distY * distY > r * r) return null;

  // Determine which side was hit based on overlap depth
  const overlapLeft = (cx + r) - rx;
  const overlapRight = (rx + rw) - (cx - r);
  const overlapTop = (cy + r) - ry;
  const overlapBottom = (ry + rh) - (cy - r);

  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (minOverlap === overlapLeft) return 'left';
  if (minOverlap === overlapRight) return 'right';
  if (minOverlap === overlapTop) return 'top';
  return 'bottom';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a fresh game state for the given level.
 *
 * Builds the brick grid, assigns verse letters to random positions,
 * fills remaining bricks with random A-Z filler, and places the ball
 * on the paddle in pre-launch state.
 */
export function createGame(
  level: number,
  verseWords: string[],
  rng: () => number = Math.random,
): GameState {
  const rows = Math.min(BRICK_ROWS_BASE + level - 1, MAX_BRICK_ROWS);
  const totalBricks = BRICK_COLS * rows;

  // Determine brick types by probability
  const stoneChance = STONE_CHANCE_BASE + (level - 1) * STONE_CHANCE_PER_LEVEL;

  // Build flat list of brick indices and shuffle for letter placement
  const indices = Array.from({ length: totalBricks }, (_, i) => i);
  const shuffledIndices = shuffle(indices, rng);

  // Flatten verse words into individual characters (uppercase, letters only)
  const verseChars = verseWords
    .join('')
    .toUpperCase()
    .split('')
    .filter((ch) => ch >= 'A' && ch <= 'Z');

  // Map: brick index -> assigned letter (from verse or filler)
  const letterMap = new Map<number, string>();
  for (let i = 0; i < verseChars.length && i < shuffledIndices.length; i++) {
    letterMap.set(shuffledIndices[i], verseChars[i]);
  }

  // Build bricks
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const idx = r * BRICK_COLS + c;
      const roll = rng();
      let type: BrickType;
      if (roll < GOLD_CHANCE) {
        type = 'gold';
      } else if (roll < GOLD_CHANCE + stoneChance) {
        type = 'stone';
      } else {
        type = 'clay';
      }

      const letter = letterMap.get(idx) ?? LETTERS[Math.floor(rng() * 26)];

      bricks.push({
        col: c,
        row: r,
        type,
        letter,
        hitsRemaining: hitsForType(type),
        broken: false,
      });
    }
  }

  // Paddle centered
  const paddle: Paddle = {
    x: CANVAS_W / 2,
    y: PADDLE_Y,
    width: PADDLE_W,
    height: PADDLE_H,
  };

  // Ball on paddle, pre-launch (dx=0, dy=0)
  const ball: Ball = {
    x: CANVAS_W / 2,
    y: PADDLE_Y - BALL_RADIUS,
    dx: 0,
    dy: 0,
    radius: BALL_RADIUS,
    active: true,
  };

  // Revealed words tracking
  const revealedWords = verseWords.map(() => false);

  return {
    phase: 'playing',
    bricks,
    balls: [ball],
    paddle,
    powerUps: [],
    activeEffects: [],
    score: 0,
    combo: 0,
    lives: STARTING_LIVES,
    level,
    verseWords,
    revealedWords,
    elapsedMs: 0,
  };
}

/**
 * Advance the game by deltaMs milliseconds.
 *
 * Pure function: returns new state and events array.
 * Handles ball movement, collisions, powerups, and win/loss conditions.
 */
export function tick(
  state: GameState,
  deltaMs: number,
): { state: GameState; events: GameEvent[] } {
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  // Clamp to prevent tunneling on tab-switch
  const dt = Math.min(deltaMs, 100) / 1000;
  const events: GameEvent[] = [];
  const prevScore = state.score;

  let balls = state.balls.map((b) => ({ ...b }));
  let bricks = state.bricks.map((b) => ({ ...b }));
  let paddle = { ...state.paddle };
  let powerUps = state.powerUps.map((p) => ({ ...p }));
  let activeEffects = state.activeEffects.map((e) => ({ ...e }));
  let score = state.score;
  let combo = state.combo;
  let lives = state.lives;
  let revealedWords = [...state.revealedWords];
  const elapsedMs = state.elapsedMs + deltaMs;

  // ---- Move balls and handle collisions ----
  for (const ball of balls) {
    if (!ball.active) continue;
    // Pre-launch balls don't move
    if (ball.dx === 0 && ball.dy === 0) continue;

    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    // Wall collisions (left/right)
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.dx = Math.abs(ball.dx);
    } else if (ball.x + ball.radius > CANVAS_W) {
      ball.x = CANVAS_W - ball.radius;
      ball.dx = -Math.abs(ball.dx);
    }

    // Ceiling collision
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.dy = Math.abs(ball.dy);
    }

    // Paddle collision
    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;
    if (
      ball.dy > 0 &&
      ball.y + ball.radius >= paddle.y &&
      ball.y + ball.radius <= paddle.y + paddle.height + ball.dy * dt &&
      ball.x >= paddleLeft &&
      ball.x <= paddleRight
    ) {
      ball.y = paddle.y - ball.radius;
      ball.dy = -Math.abs(ball.dy);
      // Adjust dx based on where ball hit the paddle
      const offset = (ball.x - paddle.x) / (paddle.width / 2);
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = offset * speed * 0.8;
      // Maintain total speed by adjusting dy
      const newDxSq = ball.dx * ball.dx;
      ball.dy = -Math.sqrt(Math.max(speed * speed - newDxSq, 1));
    }

    // Brick collisions
    for (const brick of bricks) {
      if (brick.broken) continue;
      const rect = brickRect(brick);
      const side = circleRectCollision(
        ball.x, ball.y, ball.radius,
        rect.x, rect.y, rect.w, rect.h,
      );
      if (!side) continue;

      // Reflect ball based on hit side
      if (side === 'top' || side === 'bottom') {
        ball.dy = -ball.dy;
      } else {
        ball.dx = -ball.dx;
      }

      // Push ball out of brick
      if (side === 'top') ball.y = rect.y - ball.radius;
      else if (side === 'bottom') ball.y = rect.y + rect.h + ball.radius;
      else if (side === 'left') ball.x = rect.x - ball.radius;
      else if (side === 'right') ball.x = rect.x + rect.w + ball.radius;

      brick.hitsRemaining -= 1;

      if (brick.hitsRemaining <= 0) {
        brick.broken = true;
        const pts = pointsForType(brick.type);
        score += pts;
        combo += 1;
        events.push({ type: 'brick_broken', brick: { ...brick }, points: pts });
        if (combo >= 2) {
          events.push({ type: 'combo', count: combo });
        }

        // Gold bricks spawn a powerup
        if (brick.type === 'gold') {
          const kind = randomPowerUpKind(Math.random);
          const pu: PowerUp = {
            x: rect.x + rect.w / 2,
            y: rect.y + rect.h / 2,
            kind,
            dy: POWERUP_FALL_SPEED,
            active: true,
          };
          powerUps.push(pu);
          events.push({ type: 'powerup_spawned', kind });
        }
      } else {
        events.push({ type: 'brick_hit', brick: { ...brick }, points: 0 });
      }

      // Only one brick collision per ball per tick
      break;
    }

    // Floor collision (ball lost)
    if (ball.y - ball.radius > CANVAS_H) {
      ball.active = false;
      events.push({ type: 'ball_lost' });
      combo = 0;
    }
  }

  // Check if all active balls are gone
  const activeBalls = balls.filter((b) => b.active);
  if (activeBalls.length === 0 && balls.some((b) => b.dx !== 0 || b.dy !== 0)) {
    lives -= 1;
    events.push({ type: 'life_lost', remaining: lives });

    if (lives <= 0) {
      events.push({ type: 'game_over', finalScore: score, level: state.level });
      return {
        state: {
          ...state,
          phase: 'game_over',
          balls,
          bricks,
          paddle,
          powerUps,
          activeEffects,
          score,
          combo,
          lives,
          revealedWords,
          elapsedMs,
        },
        events,
      };
    }

    // Respawn ball on paddle in pre-launch state
    const newBall: Ball = {
      x: paddle.x,
      y: PADDLE_Y - BALL_RADIUS,
      dx: 0,
      dy: 0,
      radius: BALL_RADIUS,
      active: true,
    };
    balls = [newBall];
  }

  // ---- Move powerups and check paddle catch ----
  for (const pu of powerUps) {
    if (!pu.active) continue;
    pu.y += pu.dy * dt;

    // Check if powerup overlaps paddle
    const puLeft = pu.x - POWERUP_SIZE / 2;
    const puRight = pu.x + POWERUP_SIZE / 2;
    const puBottom = pu.y + POWERUP_SIZE / 2;
    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;

    if (
      puBottom >= paddle.y &&
      pu.y - POWERUP_SIZE / 2 <= paddle.y + paddle.height &&
      puRight >= paddleLeft &&
      puLeft <= paddleRight
    ) {
      pu.active = false;
      events.push({ type: 'powerup_caught', kind: pu.kind });
      // Apply the powerup effect inline
      const result = applyPowerUpInternal(
        { balls, paddle, activeEffects },
        pu.kind,
        state.level,
      );
      balls = result.balls;
      paddle = result.paddle;
      activeEffects = result.activeEffects;
    }

    // Remove powerups that fall off screen
    if (pu.y - POWERUP_SIZE / 2 > CANVAS_H) {
      pu.active = false;
    }
  }

  // Remove inactive powerups
  powerUps = powerUps.filter((p) => p.active);

  // ---- Decrement active effect timers ----
  const expiredEffects: ActiveEffect[] = [];
  activeEffects = activeEffects
    .map((e) => ({ ...e, remainingMs: e.remainingMs - deltaMs }))
    .filter((e) => {
      if (e.remainingMs <= 0) {
        expiredEffects.push(e);
        return false;
      }
      return true;
    });

  // Expire effects
  for (const expired of expiredEffects) {
    events.push({ type: 'powerup_expired', kind: expired.kind });
    if (expired.kind === 'widePaddle') {
      // Only reset if no other widePaddle effect is active
      if (!activeEffects.some((e) => e.kind === 'widePaddle')) {
        paddle.width = PADDLE_W;
      }
    }
    if (expired.kind === 'slowBall') {
      // Only restore speed if no other slowBall effect is active
      if (!activeEffects.some((e) => e.kind === 'slowBall')) {
        const speedMult = 1 / SLOW_BALL_MULT;
        for (const ball of balls) {
          if (ball.active) {
            ball.dx *= speedMult;
            ball.dy *= speedMult;
          }
        }
      }
    }
  }

  // ---- Check word reveals ----
  // Build a set of letters that are still unbroken (by verse char index)
  // We need to track which verse characters have been revealed
  const verseChars = state.verseWords
    .join('')
    .toUpperCase()
    .split('')
    .filter((ch) => ch >= 'A' && ch <= 'Z');

  // For each word, check if all its letter bricks are broken.
  // We map word boundaries to the verse character indices.
  let charIdx = 0;
  for (let wi = 0; wi < state.verseWords.length; wi++) {
    if (revealedWords[wi]) {
      // Skip already revealed words, but still advance charIdx
      const wordLetters = state.verseWords[wi]
        .toUpperCase()
        .split('')
        .filter((ch) => ch >= 'A' && ch <= 'Z');
      charIdx += wordLetters.length;
      continue;
    }

    const wordLetters = state.verseWords[wi]
      .toUpperCase()
      .split('')
      .filter((ch) => ch >= 'A' && ch <= 'Z');

    if (wordLetters.length === 0) {
      revealedWords[wi] = true;
      charIdx += 0;
      continue;
    }

    // Check if all bricks for this word's letters are broken.
    // Letters were assigned to bricks in order of shuffled indices during createGame.
    // Since we can't perfectly track which brick got which verse char without extra state,
    // we use a simpler heuristic: count broken bricks with matching letters.
    // For a more robust approach, we check if enough bricks with each needed letter are broken.
    let allBroken = true;
    for (let li = 0; li < wordLetters.length; li++) {
      const globalCharIdx = charIdx + li;
      if (globalCharIdx >= verseChars.length) break;
      // Find any unbroken brick with this letter
      // Since we can't track exact assignment, we consider the word revealed
      // if the total broken count for each letter meets the requirement
    }

    // Simplified: a word is revealed when all non-filler bricks are broken
    // Better approach: count letter occurrences needed vs broken
    const neededCounts = new Map<string, number>();
    for (const ch of wordLetters) {
      neededCounts.set(ch, (neededCounts.get(ch) ?? 0) + 1);
    }

    const brokenCounts = new Map<string, number>();
    for (const brick of bricks) {
      if (brick.broken && brick.letter >= 'A' && brick.letter <= 'Z') {
        brokenCounts.set(brick.letter, (brokenCounts.get(brick.letter) ?? 0) + 1);
      }
    }

    allBroken = true;
    neededCounts.forEach((needed, ch) => {
      if ((brokenCounts.get(ch) ?? 0) < needed) {
        allBroken = false;
      }
    });

    if (allBroken) {
      revealedWords[wi] = true;
      events.push({ type: 'word_revealed', wordIndex: wi, word: state.verseWords[wi] });
    }

    charIdx += wordLetters.length;
  }

  // ---- Check level complete ----
  const allBricksBroken = bricks.every((b) => b.broken);
  if (allBricksBroken) {
    events.push({ type: 'level_complete', level: state.level, score });
    return {
      state: {
        ...state,
        phase: 'level_complete',
        balls,
        bricks,
        paddle,
        powerUps,
        activeEffects,
        score,
        combo,
        lives,
        revealedWords,
        elapsedMs,
      },
      events,
    };
  }

  // ---- Verse milestone check ----
  const prevMilestone = Math.floor(prevScore / VERSE_MILESTONE_INTERVAL);
  const newMilestone = Math.floor(score / VERSE_MILESTONE_INTERVAL);
  if (newMilestone > prevMilestone) {
    events.push({ type: 'verse_milestone', score });
  }

  return {
    state: {
      ...state,
      phase: 'playing',
      balls,
      bricks,
      paddle,
      powerUps,
      activeEffects,
      score,
      combo,
      lives,
      revealedWords,
      elapsedMs,
    },
    events,
  };
}

/**
 * Move the paddle to a given x position.
 * Clamps so the paddle stays fully within the canvas.
 */
export function movePaddle(state: GameState, x: number): GameState {
  const halfW = state.paddle.width / 2;
  const clampedX = Math.max(halfW, Math.min(CANVAS_W - halfW, x));
  const paddle = { ...state.paddle, x: clampedX };

  // If ball is in pre-launch state, move it with the paddle
  const balls = state.balls.map((b) => {
    if (b.active && b.dx === 0 && b.dy === 0) {
      return { ...b, x: clampedX };
    }
    return b;
  });

  return { ...state, paddle, balls };
}

/**
 * Launch the ball from the paddle.
 * Only works when the ball is in pre-launch state (dx=0, dy=0).
 * Sets upward velocity with slight random horizontal spread.
 */
export function launchBall(
  state: GameState,
  rng: () => number = Math.random,
): GameState {
  const balls = state.balls.map((b) => {
    if (b.active && b.dx === 0 && b.dy === 0) {
      const speed = ballSpeedForLevel(state.level);
      const spread = (rng() - 0.5) * 200; // -100 to 100
      return { ...b, dx: spread, dy: -speed };
    }
    return b;
  });

  return { ...state, balls };
}

/**
 * Apply a powerup effect to the game state.
 *
 * - widePaddle: widens paddle by WIDE_PADDLE_MULT
 * - multiBall: splits first active ball into 3 at spread angles
 * - slowBall: slows all active balls by SLOW_BALL_MULT
 */
export function applyPowerUp(state: GameState, kind: PowerUpKind): GameState {
  const result = applyPowerUpInternal(
    { balls: state.balls, paddle: state.paddle, activeEffects: state.activeEffects },
    kind,
    state.level,
  );
  return {
    ...state,
    balls: result.balls,
    paddle: result.paddle,
    activeEffects: result.activeEffects,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Shared logic for applying powerup effects. Avoids coupling to full GameState. */
function applyPowerUpInternal(
  parts: { balls: Ball[]; paddle: Paddle; activeEffects: ActiveEffect[] },
  kind: PowerUpKind,
  _level: number,
): { balls: Ball[]; paddle: Paddle; activeEffects: ActiveEffect[] } {
  let balls = parts.balls.map((b) => ({ ...b }));
  let paddle = { ...parts.paddle };
  let activeEffects = [...parts.activeEffects];

  switch (kind) {
    case 'widePaddle': {
      paddle.width = PADDLE_W * WIDE_PADDLE_MULT;
      activeEffects.push({ kind: 'widePaddle', remainingMs: WIDE_PADDLE_MS });
      break;
    }

    case 'multiBall': {
      const source = balls.find((b) => b.active);
      if (source) {
        const speed = Math.sqrt(source.dx * source.dx + source.dy * source.dy);
        const angle = Math.atan2(source.dy, source.dx);
        const spreadRad = (30 * Math.PI) / 180;

        const ball2: Ball = {
          ...source,
          dx: Math.cos(angle + spreadRad) * speed,
          dy: Math.sin(angle + spreadRad) * speed,
        };
        const ball3: Ball = {
          ...source,
          dx: Math.cos(angle - spreadRad) * speed,
          dy: Math.sin(angle - spreadRad) * speed,
        };
        balls.push(ball2, ball3);
      }
      break;
    }

    case 'slowBall': {
      balls = balls.map((b) => {
        if (b.active) {
          return { ...b, dx: b.dx * SLOW_BALL_MULT, dy: b.dy * SLOW_BALL_MULT };
        }
        return b;
      });
      activeEffects.push({ kind: 'slowBall', remainingMs: SLOW_BALL_MS });
      break;
    }
  }

  return { balls, paddle, activeEffects };
}
