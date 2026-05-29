import { Verse, VerseTheme } from './types';

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getVersesForSession(
  allVerses: Verse[],
  themes: VerseTheme[],
  count: number,
  seenIds: string[],
  seed?: number,
): Verse[] {
  const themeSet = new Set(themes);
  const matching = allVerses.filter((v) =>
    v.themes.some((t) => themeSet.has(t)),
  );

  if (matching.length === 0) return [];

  const seenSet = new Set(seenIds);
  const unseen = matching.filter((v) => !seenSet.has(v.id));
  const seen = matching.filter((v) => seenSet.has(v.id));

  const rng = seed != null ? mulberry32(seed) : () => Math.random();

  const pool = [...shuffle(unseen, rng), ...shuffle(seen, rng)];

  return pool.slice(0, count);
}

export function getVersesForDaily(
  allVerses: Verse[],
  themes: VerseTheme[],
  count: number,
  dateStr: string,
): Verse[] {
  const seed = hashDateString(dateStr);
  return getVersesForSession(allVerses, themes, count, [], seed);
}

export { mulberry32, hashDateString };
