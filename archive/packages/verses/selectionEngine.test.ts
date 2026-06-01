import { describe, it, expect } from 'vitest';
import { getVersesForSession, getVersesForDaily, mulberry32, hashDateString } from './selectionEngine';
import type { Verse, VerseTheme } from './types';

function makeVerse(id: string, themes: VerseTheme[]): Verse {
  return {
    id,
    reference: `Test ${id}`,
    text: `Verse text for ${id}`,
    themes,
    kidPrompt: `Prompt for ${id}`,
  };
}

const sampleVerses: Verse[] = [
  makeVerse('a1', ['provision', 'bread']),
  makeVerse('a2', ['provision', 'manna']),
  makeVerse('a3', ['honey', 'blessing']),
  makeVerse('a4', ['courage', 'strength']),
  makeVerse('a5', ['faith', 'trust']),
  makeVerse('a6', ['creation', 'nature']),
  makeVerse('a7', ['love', 'joy']),
  makeVerse('a8', ['peace', 'patience']),
  makeVerse('a9', ['obedience', 'wisdom']),
  makeVerse('a10', ['prayer', 'light']),
];

describe('mulberry32', () => {
  it('produces deterministic output for same seed', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('produces different output for different seeds', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(99);
    const v1 = rng1();
    const v2 = rng2();
    expect(v1).not.toEqual(v2);
  });

  it('produces values between 0 and 1', () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hashDateString', () => {
  it('returns a number for any string', () => {
    expect(typeof hashDateString('2026-05-28')).toBe('number');
  });

  it('returns same hash for same input', () => {
    expect(hashDateString('2026-05-28')).toBe(hashDateString('2026-05-28'));
  });

  it('returns different hash for different dates', () => {
    expect(hashDateString('2026-05-28')).not.toBe(hashDateString('2026-05-29'));
  });
});

describe('getVersesForSession', () => {
  it('returns verses matching requested themes', () => {
    const result = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna'], 3, []);
    expect(result.length).toBe(3);
    result.forEach((v) => {
      expect(v.themes.some((t) => ['provision', 'bread', 'manna'].includes(t))).toBe(true);
    });
  });

  it('returns at most count verses', () => {
    const result = getVersesForSession(sampleVerses, ['provision'], 1, []);
    expect(result.length).toBe(1);
  });

  it('returns empty array if no themes match', () => {
    const result = getVersesForSession(sampleVerses, ['worship' as VerseTheme], 5, []);
    expect(result.length).toBe(0);
  });

  it('prioritizes unseen verses', () => {
    const result = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 2, ['a1', 'a2'], 42);
    const ids = result.map((v) => v.id);
    expect(ids).toContain('a3');
  });

  it('falls back to seen verses when unseen are exhausted', () => {
    const allIds = sampleVerses.filter((v) => v.themes.some((t) => ['provision', 'bread', 'manna'].includes(t))).map((v) => v.id);
    const result = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna'], 3, allIds);
    expect(result.length).toBeGreaterThan(0);
  });

  it('produces deterministic results with seed', () => {
    const r1 = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, [], 42);
    const r2 = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, [], 42);
    expect(r1.map((v) => v.id)).toEqual(r2.map((v) => v.id));
  });

  it('produces different results with different seeds', () => {
    const r1 = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, [], 42);
    const r2 = getVersesForSession(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, [], 99);
    const ids1 = r1.map((v) => v.id).join(',');
    const ids2 = r2.map((v) => v.id).join(',');
    expect(ids1).not.toEqual(ids2);
  });
});

describe('getVersesForDaily', () => {
  it('returns deterministic results for same date', () => {
    const r1 = getVersesForDaily(sampleVerses, ['provision', 'bread'], 2, '2026-05-28');
    const r2 = getVersesForDaily(sampleVerses, ['provision', 'bread'], 2, '2026-05-28');
    expect(r1.map((v) => v.id)).toEqual(r2.map((v) => v.id));
  });

  it('returns different results for different dates', () => {
    const r1 = getVersesForDaily(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, '2026-05-28');
    const r2 = getVersesForDaily(sampleVerses, ['provision', 'bread', 'manna', 'honey', 'blessing'], 3, '2026-05-29');
    const ids1 = r1.map((v) => v.id).join(',');
    const ids2 = r2.map((v) => v.id).join(',');
    expect(ids1).not.toEqual(ids2);
  });
});
