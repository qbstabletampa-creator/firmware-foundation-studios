// ---------------------------------------------------------------------------
// Noah's Animal Match -- Pure functional game engine
//
// NO side effects. NO Phaser imports. Every function takes state in and
// returns new state + events out. The rendering layer handles sounds,
// animations, and UI based on the events array.
// ---------------------------------------------------------------------------

import type {
  Card,
  GameState,
  GameEvent,
  LevelResult,
  StarRating,
} from './types';
import {
  GAME_CONSTANTS,
  getComboMultiplier,
  getTimeBonus,
  getStarRating,
  getMovesBudget,
} from './itemConfig';
import { generateBoard, checkMatch, getLevelConfig } from './collisionEngine';

// ---------------------------------------------------------------------------
// Re-export GameEvent so consumers can import from a single module
// ---------------------------------------------------------------------------

export type { GameEvent };

// ---------------------------------------------------------------------------
// State factory
// ---------------------------------------------------------------------------

/**
 * Build a fresh GameState for the given level, ready for the preview phase.
 *
 * Cards are shuffled using the provided RNG. The preview timer is set based
 * on the level config, and all cards start face-down (the renderer shows them
 * during the preview phase, then flips them when previewTimer hits 0).
 */
export function createInitialState(
  level: number,
  rng: () => number,
): GameState {
  const config = getLevelConfig(level);
  const cards = generateBoard(level, rng);
  const movesBudget = getMovesBudget(config.pairs);

  return {
    phase: 'preview',
    level,
    cards,
    firstFlipped: null,
    secondFlipped: null,
    flipPhase: 'idle',
    mismatchTimer: 0,
    firstFlipTimestamp: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    moves: 0,
    movesBudget,
    movesRemaining: movesBudget,
    matches: 0,
    mismatches: 0,
    totalPairs: config.pairs,
    elapsedMs: 0,
    stars: 1,
    quickRecalls: 0,
    previewTimer: config.previewMs,
    animalsMatched: [],
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function updateCard(cards: Card[], index: number, patch: Partial<Card>): Card[] {
  return cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
}

// ---------------------------------------------------------------------------
// flipCard -- the card flip state machine
// ---------------------------------------------------------------------------

/**
 * Process a card flip attempt.
 *
 * Handles all phases of the flip state machine:
 * - IDLE (ready): flip the card, move to one_flipped.
 * - ONE_FLIPPED: flip a second card, check for match.
 * - MISMATCH_DELAY: if player taps during delay, resolve immediately and
 *   process the new tap as a fresh first flip (responsive feel).
 * - CHECKING: ignore input (match animation in progress).
 *
 * Invalid taps (matched cards, same card, out of range) are silently ignored.
 */
export function flipCard(
  state: GameState,
  cardIndex: number,
): { state: GameState; events: GameEvent[] } {
  // Guard: only process during active play.
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  // Validate card index.
  if (cardIndex < 0 || cardIndex >= state.cards.length) {
    return { state, events: [] };
  }

  const card = state.cards[cardIndex];

  // Ignore taps on already-matched cards.
  if (card.state === 'matched') {
    return { state, events: [] };
  }

  const events: GameEvent[] = [];

  // -- Handle mismatch delay interruption ------------------------------------
  if (state.flipPhase === 'mismatch_delay') {
    // Tapping one of the two currently-revealed cards during delay: ignore.
    if (cardIndex === state.firstFlipped || cardIndex === state.secondFlipped) {
      return { state, events: [] };
    }

    // Resolve the mismatch immediately, then process this tap as a new first flip.
    let cards = state.cards;
    if (state.firstFlipped !== null) {
      cards = updateCard(cards, state.firstFlipped, { state: 'facedown' });
    }
    if (state.secondFlipped !== null) {
      cards = updateCard(cards, state.secondFlipped, { state: 'facedown' });
    }

    events.push({
      type: 'mismatch_resolved',
      card1: state.firstFlipped!,
      card2: state.secondFlipped!,
    });

    // Out of moves: this pending mismatch was the last attempt. Resolve to a
    // failed level instead of letting the player start a fresh flip.
    if (state.movesRemaining <= 0) {
      const failedState: GameState = {
        ...state,
        cards,
        firstFlipped: null,
        secondFlipped: null,
        flipPhase: 'idle',
        phase: 'level_failed',
        mismatchTimer: 0,
        combo: 0,
      };
      events.push({ type: 'level_failed', level: state.level });
      return { state: failedState, events };
    }

    // Flip the new card as a fresh first flip.
    cards = updateCard(cards, cardIndex, { state: 'faceup' });
    events.push({ type: 'card_flipped', cardIndex });

    const newState: GameState = {
      ...state,
      cards,
      firstFlipped: cardIndex,
      secondFlipped: null,
      flipPhase: 'one_flipped',
      mismatchTimer: 0,
      combo: 0, // mismatch resets combo
      firstFlipTimestamp: state.elapsedMs,
    };

    return { state: newState, events };
  }

  // -- Ignore taps during checking phase (match animation) -------------------
  if (state.flipPhase === 'checking') {
    return { state, events: [] };
  }

  // -- IDLE: first card flip -------------------------------------------------
  if (state.flipPhase === 'idle') {
    const cards = updateCard(state.cards, cardIndex, { state: 'faceup' });
    events.push({ type: 'card_flipped', cardIndex });

    const newState: GameState = {
      ...state,
      cards,
      firstFlipped: cardIndex,
      secondFlipped: null,
      flipPhase: 'one_flipped',
      firstFlipTimestamp: state.elapsedMs,
    };

    return { state: newState, events };
  }

  // -- ONE_FLIPPED: second card flip -----------------------------------------
  if (state.flipPhase === 'one_flipped') {
    // Ignore tap on the already-flipped card.
    if (cardIndex === state.firstFlipped) {
      return { state, events: [] };
    }

    // Ignore tap on cards that are already faceup (shouldn't happen, but guard).
    if (card.state === 'faceup') {
      return { state, events: [] };
    }

    let cards = updateCard(state.cards, cardIndex, { state: 'faceup' });
    events.push({ type: 'card_flipped', cardIndex });

    const firstCard = cards[state.firstFlipped!];
    const secondCard = cards[cardIndex];
    const moves = state.moves + 1;
    const movesRemaining = Math.max(0, state.movesRemaining - 1);

    // Check for Quick Recall bonus (second flip within 2s of first).
    const flipDelta = state.elapsedMs - state.firstFlipTimestamp;
    const isQuickRecall = flipDelta <= GAME_CONSTANTS.QUICK_RECALL_WINDOW_MS;

    if (checkMatch(firstCard, secondCard)) {
      // -- MATCH --
      cards = updateCard(cards, state.firstFlipped!, { state: 'matched' });
      cards = updateCard(cards, cardIndex, { state: 'matched' });

      const newCombo = state.combo + 1;
      const bestCombo = Math.max(state.bestCombo, newCombo);
      const multiplier = getComboMultiplier(newCombo);
      const matchPoints = Math.round(GAME_CONSTANTS.POINTS_PER_MATCH * multiplier);
      const quickRecallBonus = isQuickRecall ? GAME_CONSTANTS.QUICK_RECALL_BONUS : 0;
      const totalPoints = matchPoints + quickRecallBonus;

      events.push({
        type: 'match_found',
        card1: state.firstFlipped!,
        card2: cardIndex,
        points: totalPoints,
      });

      if (newCombo >= 2) {
        events.push({ type: 'combo', count: newCombo, multiplier });
      }

      if (isQuickRecall) {
        events.push({ type: 'quick_recall', bonus: quickRecallBonus });
      }

      const newMatches = state.matches + 1;
      const quickRecalls = state.quickRecalls + (isQuickRecall ? 1 : 0);

      // Track animal name for collection badges.
      const animalsMatched = [...state.animalsMatched];
      if (!animalsMatched.includes(firstCard.name)) {
        animalsMatched.push(firstCard.name);
      }

      // Check for level completion.
      if (newMatches === state.totalPairs) {
        const config = getLevelConfig(state.level);
        const timeBonus = getTimeBonus(state.elapsedMs, config.parTimeMs);
        const perfectClear = state.mismatches === 0;
        const perfectBonus = perfectClear ? GAME_CONSTANTS.PERFECT_CLEAR_BONUS : 0;
        const finalScore = state.score + totalPoints + timeBonus + perfectBonus;

        const stars: StarRating = getStarRating(
          state.totalPairs,
          moves,
          state.elapsedMs,
          config.parTimeMs,
        );

        if (timeBonus > 0) {
          events.push({ type: 'time_bonus', bonus: timeBonus });
        }

        if (perfectClear) {
          events.push({ type: 'perfect_clear', bonus: perfectBonus });
        }

        const isLastLevel = state.level >= GAME_CONSTANTS.TOTAL_LEVELS;

        const result: LevelResult = {
          level: state.level,
          score: finalScore,
          stars,
          moves,
          matches: newMatches,
          mismatches: state.mismatches,
          elapsedMs: state.elapsedMs,
          perfectClear,
          quickRecalls,
          timeBonus,
        };

        events.push({ type: 'level_complete', result });

        if (isLastLevel) {
          events.push({ type: 'game_complete', totalScore: finalScore });
        }

        const newState: GameState = {
          ...state,
          cards,
          phase: isLastLevel ? 'game_complete' : 'level_complete',
          firstFlipped: null,
          secondFlipped: null,
          flipPhase: 'idle',
          score: finalScore,
          combo: newCombo,
          bestCombo,
          moves,
          movesRemaining,
          matches: newMatches,
          stars,
          quickRecalls,
          animalsMatched,
        };

        return { state: newState, events };
      }

      // Not level complete yet. Transition back to idle.
      const newState: GameState = {
        ...state,
        cards,
        firstFlipped: null,
        secondFlipped: null,
        flipPhase: 'idle',
        score: state.score + totalPoints,
        combo: newCombo,
        bestCombo,
        moves,
        movesRemaining,
        matches: newMatches,
        quickRecalls,
        animalsMatched,
      };

      return { state: newState, events };
    } else {
      // -- MISMATCH --
      events.push({
        type: 'mismatch',
        card1: state.firstFlipped!,
        card2: cardIndex,
      });

      const newState: GameState = {
        ...state,
        cards,
        secondFlipped: cardIndex,
        flipPhase: 'mismatch_delay',
        mismatchTimer: GAME_CONSTANTS.MISMATCH_DELAY_MS,
        moves,
        movesRemaining: Math.max(0, state.movesRemaining - 1),
        mismatches: state.mismatches + 1,
        combo: 0,
      };

      return { state: newState, events };
    }
  }

  // Fallback: no-op.
  return { state, events: [] };
}

// ---------------------------------------------------------------------------
// tick -- frame update
// ---------------------------------------------------------------------------

/**
 * Advance the game by `deltaMs` milliseconds.
 *
 * Handles:
 * - Preview countdown (cards shown face-up before play begins).
 * - Elapsed time tracking.
 * - Mismatch delay countdown and auto-resolution.
 *
 * Pure function: returns new state + events. The renderer handles side effects.
 * Delta is clamped to 100ms to prevent issues after tab-switch.
 */
export function tick(
  state: GameState,
  deltaMs: number,
): { state: GameState; events: GameEvent[] } {
  // Guard: only process during preview or active play.
  if (state.phase !== 'playing' && state.phase !== 'preview') {
    return { state, events: [] };
  }

  const dt = Math.min(deltaMs, 100);
  const events: GameEvent[] = [];

  // -- Preview phase: countdown before play begins ---------------------------
  if (state.phase === 'preview') {
    const newPreviewTimer = state.previewTimer - dt;

    if (newPreviewTimer <= 0) {
      events.push({ type: 'preview_end' });

      const newState: GameState = {
        ...state,
        phase: 'playing',
        previewTimer: 0,
      };

      return { state: newState, events };
    }

    return {
      state: { ...state, previewTimer: newPreviewTimer },
      events: [],
    };
  }

  // -- Playing phase ---------------------------------------------------------
  const elapsedMs = state.elapsedMs + dt;

  // Handle mismatch delay countdown.
  if (state.flipPhase === 'mismatch_delay') {
    const newTimer = state.mismatchTimer - dt;

    if (newTimer <= 0) {
      // Timer expired: flip both cards back face-down.
      let cards = state.cards;
      if (state.firstFlipped !== null) {
        cards = updateCard(cards, state.firstFlipped, { state: 'facedown' });
      }
      if (state.secondFlipped !== null) {
        cards = updateCard(cards, state.secondFlipped, { state: 'facedown' });
      }

      events.push({
        type: 'mismatch_resolved',
        card1: state.firstFlipped!,
        card2: state.secondFlipped!,
      });

      // Out of moves and the board isn't cleared: the level is lost. Fire the
      // fail AFTER the cards flip back so the player sees the final mismatch.
      const outOfMoves = state.movesRemaining <= 0;

      const newState: GameState = {
        ...state,
        cards,
        firstFlipped: null,
        secondFlipped: null,
        flipPhase: 'idle',
        phase: outOfMoves ? 'level_failed' : state.phase,
        mismatchTimer: 0,
        combo: 0,
        elapsedMs,
      };

      if (outOfMoves) {
        events.push({ type: 'level_failed', level: state.level });
      }

      return { state: newState, events };
    }

    return {
      state: { ...state, mismatchTimer: newTimer, elapsedMs },
      events: [],
    };
  }

  // Normal tick: just update elapsed time.
  return {
    state: { ...state, elapsedMs },
    events: [],
  };
}
