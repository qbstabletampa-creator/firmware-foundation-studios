import { starterPuzzles } from '../content/starterPuzzles';

// ---------------------------------------------------------------------------
// Daily puzzle — ONE source of truth for "what day is it" and "which puzzle".
//
// The bug this fixes: the old code parsed the epoch as `new Date('2026-06-08')`
// (UTC midnight) and derived the day index from `Date.now()`. That meant the
// puzzle rolled over at 8pm ET (UTC midnight), while the streak / hasPlayedToday
// logic used the LOCAL calendar date. So between 8pm and midnight ET the word
// changed but the streak still thought it was "today" — players could see a new
// word that didn't count, or replay.
//
// Fix: derive the day number from the LOCAL calendar date on both ends, exactly
// like streakStore builds its date string. Now the word, hasPlayedToday, and
// streak all flip together at LOCAL midnight.
// ---------------------------------------------------------------------------

// Day 1 of the daily puzzle. RESET 2026-06-24 = the relaunch/advertise date (CJ),
// so players opening the updated build start at Day 1. (was 2026-06-13, 2026-06-08, 2026-06-02.)
// Format: YYYY-MM-DD, interpreted as a LOCAL calendar date.
export const GOSPLE_EPOCH = '2026-06-24';

const MS_PER_DAY = 86_400_000;

// Deterministic shuffle of the puzzle order (fixed seed = same sequence for every
// player, Wordle-style) so the word LENGTH varies day to day instead of marching
// through all 5-letter words first, then all 6-letter, etc. Same seed + PRNG as
// the web build (src/games/gosple/GameScene.ts) so web and native stay in sync.
function gospleDailyOrder(n: number, seed: number): number[] {
  let a = seed >>> 0;
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const DAILY_ORDER = gospleDailyOrder(starterPuzzles.length, 0x60591e28);

// Local midnight (00:00:00 local) of the given Date — strips the time-of-day so
// two timestamps on the same local calendar day collapse to the same value.
function localMidnight(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Parse 'YYYY-MM-DD' as a LOCAL date (not UTC). new Date('2026-06-08') would be
// UTC midnight; we want local midnight so it lines up with localMidnight(today).
function parseLocalDateString(s: string): Date {
  const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

const EPOCH_LOCAL_MIDNIGHT = localMidnight(parseLocalDateString(GOSPLE_EPOCH));

// How many whole local days since the epoch. Day 0 = epoch day. Uses local
// midnight on both ends so DST shifts (a 23h or 25h calendar day) still produce
// exactly +1 per calendar day. `now` defaults to the current moment but is
// injectable for tests.
export function getDayNumber(now: Date = new Date()): number {
  const todayMidnight = localMidnight(now);
  return Math.round((todayMidnight - EPOCH_LOCAL_MIDNIGHT) / MS_PER_DAY);
}

// Human-facing day count: Day 1 on the epoch day.
export function getDisplayDay(now: Date = new Date()): number {
  return getDayNumber(now) + 1;
}

// Today's local calendar date string 'YYYY-MM-DD' — the SAME format streakStore
// and hasPlayedToday use, so everything keys off one value.
export function getTodayDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Which puzzle index plays today (wrapped + shuffled).
export function getTodayPuzzleIndex(now: Date = new Date()): number {
  const day = getDayNumber(now);
  const len = starterPuzzles.length;
  const idx = ((day % len) + len) % len;
  return DAILY_ORDER[idx];
}

export function getTodayPuzzle(now: Date = new Date()) {
  return starterPuzzles[getTodayPuzzleIndex(now)];
}
