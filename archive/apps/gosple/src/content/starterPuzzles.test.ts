import { describe, expect, it } from 'vitest';
import { starterPuzzles } from './starterPuzzles';
import { isValidPuzzleWord } from '../game/wordleEngine';

describe('starterPuzzles', () => {
  it('has at least 1000 puzzles in the bank', () => {
    expect(starterPuzzles.length).toBeGreaterThanOrEqual(1000);
  });

  it('uses 5 to 8 letter uppercase Bible words with verse references and kid prompts', () => {
    for (const puzzle of starterPuzzles) {
      expect(isValidPuzzleWord(puzzle.answer)).toBe(true);
      expect(puzzle.answer).toBe(puzzle.answer.toUpperCase());
      expect(puzzle.reference.length).toBeGreaterThan(0);
      expect(puzzle.verse.length).toBeGreaterThan(0);
      expect(puzzle.kidPrompt.length).toBeGreaterThan(0);
      expect(['BSB', 'WEB']).toContain(puzzle.translation);
    }
  });

  it('has no duplicate answers', () => {
    const answers = starterPuzzles.map((p) => p.answer);
    expect(new Set(answers).size).toBe(answers.length);
  });

  it('has no duplicate IDs', () => {
    const ids = starterPuzzles.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has reasonable word-length distribution', () => {
    const byLength: Record<number, number> = { 5: 0, 6: 0, 7: 0, 8: 0 };
    for (const p of starterPuzzles) {
      byLength[p.answer.length] += 1;
    }
    for (const count of Object.values(byLength)) {
      expect(count).toBeGreaterThanOrEqual(150);
    }
  });
});
