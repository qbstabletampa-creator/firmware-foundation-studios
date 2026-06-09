import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));

import { useStreakStore } from '../streakStore';

function resetStore() {
  useStreakStore.setState({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    totalGamesPlayed: 0,
    totalGamesWon: 0,
  });
}

describe('streakStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts a streak on first play', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.totalGamesPlayed).toBe(1);
    expect(s.totalGamesWon).toBe(1);
    expect(s.lastPlayedDate).toBe('2026-05-25');
  });

  it('increments streak on consecutive days', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(true, '2026-05-26');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(2);
    expect(s.totalGamesPlayed).toBe(2);
  });

  it('increments streak across three consecutive days', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(false, '2026-05-26');
    useStreakStore.getState().recordPlay(true, '2026-05-27');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(3);
    expect(s.totalGamesPlayed).toBe(3);
  });

  it('resets streak on a gap in days', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(true, '2026-05-26');
    useStreakStore.getState().recordPlay(true, '2026-05-28');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.totalGamesPlayed).toBe(3);
  });

  it('does not double count same-day plays', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(false, '2026-05-25');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.totalGamesPlayed).toBe(1);
    expect(s.totalGamesWon).toBe(1);
  });

  it('tracks longest streak correctly', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-01');
    useStreakStore.getState().recordPlay(true, '2026-05-02');
    useStreakStore.getState().recordPlay(true, '2026-05-03');
    expect(useStreakStore.getState().longestStreak).toBe(3);

    useStreakStore.getState().recordPlay(true, '2026-05-10');
    expect(useStreakStore.getState().currentStreak).toBe(1);
    expect(useStreakStore.getState().longestStreak).toBe(3);

    useStreakStore.getState().recordPlay(true, '2026-05-11');
    expect(useStreakStore.getState().longestStreak).toBe(3);
  });

  it('updates longest streak when current exceeds it', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-01');
    useStreakStore.getState().recordPlay(true, '2026-05-02');
    useStreakStore.getState().recordPlay(true, '2026-05-10');
    useStreakStore.getState().recordPlay(true, '2026-05-11');
    useStreakStore.getState().recordPlay(true, '2026-05-12');
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(3);
    expect(s.longestStreak).toBe(3);
  });

  it('tracks won vs lost correctly', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(false, '2026-05-26');
    useStreakStore.getState().recordPlay(true, '2026-05-27');
    useStreakStore.getState().recordPlay(false, '2026-05-28');
    const s = useStreakStore.getState();
    expect(s.totalGamesPlayed).toBe(4);
    expect(s.totalGamesWon).toBe(2);
  });

  it('reset clears all state', () => {
    useStreakStore.getState().recordPlay(true, '2026-05-25');
    useStreakStore.getState().recordPlay(true, '2026-05-26');
    useStreakStore.getState().reset();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.lastPlayedDate).toBeNull();
    expect(s.totalGamesPlayed).toBe(0);
    expect(s.totalGamesWon).toBe(0);
  });
});
