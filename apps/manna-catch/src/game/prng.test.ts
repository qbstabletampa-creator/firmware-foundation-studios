import { describe, it, expect } from 'vitest';
import { createRng, hashDateString, seedFromDate } from './prng';

// ---------------------------------------------------------------------------
// createRng
// ---------------------------------------------------------------------------

describe('createRng', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());

    expect(seq1).toEqual(seq2);
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(99);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    // It is theoretically possible for two seeds to produce identical
    // sequences, but practically it should never happen with mulberry32.
    expect(seq1).not.toEqual(seq2);
  });

  it('values are always in [0, 1)', () => {
    const rng = createRng(12345);

    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('produces non-trivial distribution', () => {
    // Make sure we get a spread of values, not all the same.
    const rng = createRng(777);
    const values = Array.from({ length: 100 }, () => rng());
    const unique = new Set(values);
    // 100 calls should produce at least 90 distinct values.
    expect(unique.size).toBeGreaterThan(90);
  });
});

// ---------------------------------------------------------------------------
// hashDateString
// ---------------------------------------------------------------------------

describe('hashDateString', () => {
  it('is deterministic', () => {
    const hash1 = hashDateString('2026-05-28');
    const hash2 = hashDateString('2026-05-28');
    expect(hash1).toBe(hash2);
  });

  it('different dates produce different hashes', () => {
    const hash1 = hashDateString('2026-05-28');
    const hash2 = hashDateString('2026-05-29');
    expect(hash1).not.toBe(hash2);
  });

  it('returns a non-negative integer', () => {
    const hash = hashDateString('2026-01-01');
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hash)).toBe(true);
  });

  it('returns a 32-bit unsigned integer', () => {
    const hash = hashDateString('2025-12-25');
    expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
    expect(hash).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// seedFromDate
// ---------------------------------------------------------------------------

describe('seedFromDate', () => {
  it('creates deterministic RNG from date string', () => {
    const rng1 = seedFromDate('2026-05-28');
    const rng2 = seedFromDate('2026-05-28');

    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());

    expect(seq1).toEqual(seq2);
  });

  it('different dates produce different RNG sequences', () => {
    const rng1 = seedFromDate('2026-05-28');
    const rng2 = seedFromDate('2026-06-01');

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).not.toEqual(seq2);
  });

  it('produces values in [0, 1)', () => {
    const rng = seedFromDate('2000-01-01');
    for (let i = 0; i < 500; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('is equivalent to createRng(hashDateString(date))', () => {
    const date = '2026-05-28';
    const rngFromSeedFromDate = seedFromDate(date);
    const rngFromManual = createRng(hashDateString(date));

    const seq1 = Array.from({ length: 20 }, () => rngFromSeedFromDate());
    const seq2 = Array.from({ length: 20 }, () => rngFromManual());

    expect(seq1).toEqual(seq2);
  });
});
