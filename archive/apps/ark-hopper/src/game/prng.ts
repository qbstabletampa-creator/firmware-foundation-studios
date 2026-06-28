// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
//
// Standalone copy so the game engine has zero external package dependencies.
// Algorithm is identical to packages/verses/src/selectionEngine.ts.
// ---------------------------------------------------------------------------

/**
 * Create a seeded pseudo-random number generator using the mulberry32
 * algorithm. Returns a function that produces values in [0, 1) on each call.
 */
export function createRng(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a date string (e.g. "2026-05-28") into a 32-bit integer suitable for
 * use as a PRNG seed. Uses a simple FNV-1a variant.
 */
export function hashDateString(dateStr: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0;
}

/**
 * Convenience: create a seeded RNG from a date string. Two calls with the
 * same date always produce the same sequence, giving every player the same
 * "daily" game.
 */
export function seedFromDate(dateStr: string): () => number {
  return createRng(hashDateString(dateStr));
}
