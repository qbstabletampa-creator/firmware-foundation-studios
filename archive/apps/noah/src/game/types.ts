// ---------------------------------------------------------------------------
// Noah's Animal Match -- Type definitions
// ---------------------------------------------------------------------------

export type CardState = 'facedown' | 'faceup' | 'matched';

export type Card = {
  /** Unique index in the board array (0..totalCards-1). */
  id: number;
  /** Pair identifier. Two cards share the same pairId when they are a match. */
  pairId: number;
  /** The animal emoji displayed on the card face. */
  emoji: string;
  /** Human-readable animal name. */
  name: string;
  /** Current visual state of this card. */
  state: CardState;
  /** Grid row (0-indexed). */
  row: number;
  /** Grid column (0-indexed). */
  col: number;
};

export type GamePhase =
  | 'preview'
  | 'ready'
  | 'playing'
  | 'level_complete'
  | 'level_failed'
  | 'game_complete';

export type FlipPhase =
  | 'idle'
  | 'one_flipped'
  | 'checking'
  | 'mismatch_delay';

export type StarRating = 1 | 2 | 3;

export type LevelResult = {
  level: number;
  score: number;
  stars: StarRating;
  moves: number;
  matches: number;
  mismatches: number;
  elapsedMs: number;
  perfectClear: boolean;
  quickRecalls: number;
  timeBonus: number;
};

export type GameState = {
  phase: GamePhase;
  level: number;
  cards: Card[];
  firstFlipped: number | null;
  secondFlipped: number | null;
  flipPhase: FlipPhase;
  mismatchTimer: number;
  /** Timestamp (ms since level start) when the first card of the current pair was flipped. */
  firstFlipTimestamp: number;
  score: number;
  combo: number;
  bestCombo: number;
  /** Number of pair attempts (incremented each time a second card is flipped). */
  moves: number;
  /** Total moves allowed this level before the level fails. */
  movesBudget: number;
  /** Moves remaining before the level fails (counts down from movesBudget). */
  movesRemaining: number;
  matches: number;
  mismatches: number;
  totalPairs: number;
  elapsedMs: number;
  stars: StarRating;
  /** How many Quick Recall bonuses earned this level. */
  quickRecalls: number;
  /** Remaining preview time in ms (cards shown face-up at level start). */
  previewTimer: number;
  /** Tracks which animal names have been matched (for collection badges). */
  animalsMatched: string[];
};

// ---------------------------------------------------------------------------
// Events emitted by the engine
// ---------------------------------------------------------------------------

export type GameEvent =
  | { type: 'card_flipped'; cardIndex: number }
  | { type: 'match_found'; card1: number; card2: number; points: number }
  | { type: 'mismatch'; card1: number; card2: number }
  | { type: 'mismatch_resolved'; card1: number; card2: number }
  | { type: 'combo'; count: number; multiplier: number }
  | { type: 'quick_recall'; bonus: number }
  | { type: 'level_complete'; result: LevelResult }
  | { type: 'level_failed'; level: number }
  | { type: 'game_complete'; totalScore: number }
  | { type: 'preview_end' }
  | { type: 'perfect_clear'; bonus: number }
  | { type: 'time_bonus'; bonus: number };
