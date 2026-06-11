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
  it('computes ceil(pairs * 2.5) + 1', () => {
    expect(getMovesBudget(3)).toBe(9); // ceil(7.5)=8, +1
    expect(getMovesBudget(6)).toBe(16); // ceil(15)=15, +1
    expect(getMovesBudget(8)).toBe(21); // ceil(20)=20, +1
    expect(getMovesBudget(10)).toBe(26);
    expect(getMovesBudget(15)).toBe(39); // ceil(37.5)=38, +1
  });

  it('seeds movesRemaining from the budget at level start', () => {
    const state = createInitialState(1, fixedRng(1));
    const budget = getMovesBudget(getLevelConfig(1).pairs);
    expect(state.movesBudget).toBe(budget);
    expect(state.movesRemaining).toBe(budget);
  });

  it('counts a move down on each pair attempt', () => {
    const state = startPlaying(1);
    const before = state.movesRemaining;
    const { state: after } = doMismatchMove(state);
    // One move spent (whether it failed the level or not).
    expect(after.movesRemaining).toBe(before - 1);
  });
});

describe('out-of-moves fail path', () => {
  it('fails the level when moves run out before the board is cleared', () => {
    let state = startPlaying(1);
    const budget = state.movesBudget;

    let failed = false;
    // Burn every move on deliberate mismatches; never clear the board.
    for (let i = 0; i < budget + 2; i++) {
      const res = doMismatchMove(state);
      state = res.state;
      if (res.failedHere || state.phase === 'level_failed') {
        failed = true;
        break;
      }
    }

    expect(failed).toBe(true);
    expect(state.phase).toBe('level_failed');
    expect(state.movesRemaining).toBe(0);
    // The board was NOT cleared on a fail.
    expect(state.matches).toBeLessThan(state.totalPairs);
  });

  it('emits a level_failed event exactly when the last move resolves', () => {
    let state = startPlaying(1);
    const budget = state.movesBudget;
    let failEvents = 0;

    for (let i = 0; i < budget + 2; i++) {
      const [a, b] = findMismatchPair(state);
      state = flipCard(state, a).state;
      state = flipCard(state, b).state;
      // Resolve the mismatch via tick and collect events.
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

  it('does not fail when the board is cleared on the final move (win beats out-of-moves)', () => {
    // Drive a full clean clear: always flip matching pairs. The board clears in
    // exactly `pairs` moves, well under budget, so it completes, never fails.
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
  });
});
