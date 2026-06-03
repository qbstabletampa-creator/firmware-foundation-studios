// ---------------------------------------------------------------------------
// Noah's Animal Match -- Collision / matching engine
// ---------------------------------------------------------------------------

import type { Card } from './types';
import { LEVEL_CONFIGS, ANIMAL_DEFS, type LevelConfig } from './itemConfig';

// ---------------------------------------------------------------------------
// Match detection
// ---------------------------------------------------------------------------

/**
 * Check whether two cards form a valid match.
 * Cards match when they share the same pairId but have different ids.
 */
export function checkMatch(card1: Card, card2: Card): boolean {
  return card1.id !== card2.id && card1.pairId === card2.pairId;
}

// ---------------------------------------------------------------------------
// Level configuration lookup
// ---------------------------------------------------------------------------

/**
 * Return the level configuration for the given level number (1-based).
 * Throws if the level is out of range.
 */
export function getLevelConfig(level: number): LevelConfig {
  const config = LEVEL_CONFIGS.find((c) => c.level === level);
  if (!config) {
    throw new Error(`Invalid level: ${level}. Valid levels are 1-${LEVEL_CONFIGS.length}.`);
  }
  return config;
}

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle
// ---------------------------------------------------------------------------

/**
 * Shuffle an array in place using the Fisher-Yates algorithm.
 * Returns the same array reference (mutated).
 *
 * @param arr - The array to shuffle.
 * @param rng - A function returning a random number in [0, 1).
 */
export function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Shuffle a cards array. Convenience wrapper around shuffleArray.
 */
export function shuffleCards(cards: Card[], rng: () => number): Card[] {
  return shuffleArray(cards, rng);
}

// ---------------------------------------------------------------------------
// Board generation
// ---------------------------------------------------------------------------

/**
 * Get the pool of animals available at a given level.
 * Returns animals whose unlockLevel <= the given level, limited to poolSize.
 */
export function getAnimalPool(level: number): typeof ANIMAL_DEFS {
  const config = getLevelConfig(level);
  const available = ANIMAL_DEFS.filter((a) => a.unlockLevel <= level);
  return available.slice(0, config.poolSize);
}

/**
 * Generate a shuffled board of cards for a given level.
 *
 * 1. Select N random animal types from the available pool (N = pairs).
 * 2. Create two Card objects per animal (the pair).
 * 3. Shuffle all cards using Fisher-Yates.
 * 4. Assign grid positions (row-major order).
 *
 * @param level - The level number (1-based).
 * @param rng - Seeded RNG function returning values in [0, 1).
 */
export function generateBoard(level: number, rng: () => number): Card[] {
  const config = getLevelConfig(level);
  const pool = getAnimalPool(level);

  // Pick `pairs` unique animals from the pool.
  const shuffledPool = shuffleArray([...pool], rng);
  const selected = shuffledPool.slice(0, config.pairs);

  // Create two cards per animal.
  const cards: Card[] = [];
  let cardId = 0;
  for (let pairId = 0; pairId < selected.length; pairId++) {
    const animal = selected[pairId];
    for (let copy = 0; copy < 2; copy++) {
      cards.push({
        id: cardId++,
        pairId,
        emoji: animal.emoji,
        name: animal.name,
        state: 'facedown',
        row: 0, // assigned after shuffle
        col: 0,
      });
    }
  }

  // Shuffle the cards into random positions.
  shuffleArray(cards, rng);

  // Assign grid positions and final ids based on shuffled order.
  for (let i = 0; i < cards.length; i++) {
    cards[i].id = i;
    cards[i].row = Math.floor(i / config.cols);
    cards[i].col = i % config.cols;
  }

  return cards;
}
