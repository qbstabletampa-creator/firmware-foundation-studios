import { describe, it, expect } from 'vitest';
import { createInitialState, flipCard, tick } from '../gameEngine';
import { getMovesBudget, GAME_CONSTANTS } from '../itemConfig';
import { getLevelConfig } from '../collisionEngine';
import type { GameState } from '../types';

// Deterministic RNG so boards are reproducible across runs.
function fixedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** Skip the preview phase so the board is in 'playing'. */
function startPlaying(level: number): GameState {
  let state = createInitialState(level, fixedRng(42));
  // Tick past the preview timer in one big step (tick clamps dt to 100ms).
  const previewMs = getLevelConfig(level).previewMs;
  for (let t = 0; t <= previewMs + 200; t += 100) {
    state = tick(state, 100).state;
    if (state.phase === 'playing') break;
  }
  return state;
}

/** Find two card indices that do NOT match (different pairId). */
function findMismatchPair(state: GameState): [number, number] {
  const available = state.cards.filter((c) => c.state !== 'matched');
  const a = available[0];
  const b = available.find((c) => c.pairId !== a.pairId);
  if (!b) throw new Error('no mismatch pair available');
  return [a.id, b.id];
}

/** Resolve a pending mismatch_delay by ticking past the delay. */
function resolveMismatch(state: GameState): GameState {
  let next = state;
  for (let t = 0; t <= GAME_CONSTANTS.MISMATCH_DELAY_MS + 200; t += 100) {
    next = tick(next, 100).state;
    if (next.flipPhase === 'idle' || next.phase === 'level_failed') break;
  }
  return next;
}

/** Play one full mismatch move (two non-matching flips) and resolve it. */
function doMismatchMove(state: GameState): { state: GameState; failedHere: boolean } {
  const [a, b] = findMismatchPair(state);
  let next = flipCard(state, a).state;
  next = flipCard(next, b).state;
  const resolved = resolveMismatch(next);
  return { state: resolved, failedHere: resolved.phase === 'level_failed' };
}

describe('moves budget', () => {
  it('is unbounded -- strikes, not moves, limit play', () => {
    expect(getMovesBudget(3)).toBe(Number.POSITIVE_INFINITY);
    expect(getMovesBudget(15)).toBe(Number.POSITIVE_INFINITY);
  });

  it('counts moves up on each pair attempt (still tracked for scoring)', () => {
    const state = startPlaying(1);
    const before = state.moves;
    const { state: after } = doMismatchMove(state);
    expect(after.moves).toBe(before + 1);
  });
});

describe('strikes', () => {
  it('starts every level at 0 strikes', () => {
    expect(createInitialState(1, fixedRng(1)).strikes).toBe(0);
    expect(createInitialState(3, fixedRng(7)).strikes).toBe(0);
  });

  it('increments strikes by 1 on each mismatch', () => {
    let state = startPlaying(2);
    expect(state.strikes).toBe(0);

    state = doMismatchMove(state).state;
    expect(state.strikes).toBe(1);

    state = doMismatchMove(state).state;
    expect(state.strikes).toBe(2);
  });

  it('does not increment strikes on a match', () => {
    const state = startPlaying(1);
    const remaining = state.cards.filter((c) => c.state !== 'matched');
    const first = remaining[0];
    const partner = remaining.find((c) => c.id !== first.id && c.pairId === first.pairId)!;
    let next = flipCard(state, first.id).state;
    next = flipCard(next, partner.id).state;
    expect(next.strikes).toBe(0);
  });
});

describe('three-strikes fail path', () => {
  it('fails the level on the STRIKES_PER_LEVEL-th wrong match', () => {
    let state = startPlaying(2);

    let failed = false;
    for (let i = 0; i < GAME_CONSTANTS.STRIKES_PER_LEVEL + 1; i++) {
      const res = doMismatchMove(state);
      state = res.state;
      if (res.failedHere || state.phase === 'level_failed') {
        failed = true;
        break;
      }
    }

    expect(failed).toBe(true);
    expect(state.phase).toBe('level_failed');
    expect(state.strikes).toBe(GAME_CONSTANTS.STRIKES_PER_LEVEL);
    // The board was NOT cleared on a fail.
    expect(state.matches).toBeLessThan(state.totalPairs);
  });

  it('does not fail before reaching STRIKES_PER_LEVEL strikes', () => {
    let state = startPlaying(2);
    for (let i = 0; i < GAME_CONSTANTS.STRIKES_PER_LEVEL - 1; i++) {
      state = doMismatchMove(state).state;
    }
    expect(state.strikes).toBe(GAME_CONSTANTS.STRIKES_PER_LEVEL - 1);
    expect(state.phase).toBe('playing');
  });

  it('emits a single level_failed event when the final strike resolves', () => {
    let state = startPlaying(2);
    let failEvents = 0;

    for (let i = 0; i < GAME_CONSTANTS.STRIKES_PER_LEVEL + 1; i++) {
      const [a, b] = findMismatchPair(state);
      state = flipCard(state, a).state;
      state = flipCard(state, b).state;
      for (let t = 0; t <= GAME_CONSTANTS.MISMATCH_DELAY_MS + 200; t += 100) {
        const r = tick(state, 100);
        state = r.state;
        failEvents += r.events.filter((e) => e.type === 'level_failed').length;
        if (state.flipPhase === 'idle' || state.phase === 'level_failed') break;
      }
      if (state.phase === 'level_failed') break;
    }

    expect(failEvents).toBe(1);
    expect(state.phase).toBe('level_failed');
  });

  it('resets strikes back to 0 when a fresh level starts', () => {
    let state = startPlaying(2);
    state = doMismatchMove(state).state;
    expect(state.strikes).toBe(1);
    // Starting any level (retry or next) rebuilds state with strikes = 0.
    const fresh = createInitialState(state.level, fixedRng(99));
    expect(fresh.strikes).toBe(0);
  });

  it('does not fail when the board is cleared (win beats strikes)', () => {
    // Drive a full clean clear: always flip matching pairs. No mismatches, so
    // no strikes; the level completes.
    let state = startPlaying(1);
    const pairs = state.totalPairs;

    for (let m = 0; m < pairs; m++) {
      const remaining = state.cards.filter((c) => c.state !== 'matched');
      const first = remaining[0];
      const partner = remaining.find((c) => c.id !== first.id && c.pairId === first.pairId)!;
      state = flipCard(state, first.id).state;
      state = flipCard(state, partner.id).state;
    }

    expect(['level_complete', 'game_complete']).toContain(state.phase);
    expect(state.matches).toBe(pairs);
    expect(state.strikes).toBe(0);
  });
});
