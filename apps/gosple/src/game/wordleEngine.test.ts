import { describe, expect, it } from 'vitest';
import { scoreGuess, isValidPuzzleWord, normalizeGuess } from './wordleEngine';

describe('wordleEngine', () => {
  it('scores exact, present, and absent letters with duplicate handling', () => {
    expect(scoreGuess('MERCY', 'MERRY')).toEqual([
      'correct',
      'correct',
      'correct',
      'absent',
      'correct',
    ]);

    expect(scoreGuess('GRACE', 'EAGER')).toEqual([
      'present',
      'present',
      'present',
      'absent',
      'present',
    ]);
  });

  it('normalizes guesses to uppercase letters only', () => {
    expect(normalizeGuess(' grace! ')).toBe('GRACE');
  });

  it('allows only 5 to 8 letter Bible puzzle words', () => {
    expect(isValidPuzzleWord('LOVE')).toBe(false);
    expect(isValidPuzzleWord('LIGHT')).toBe(true);
    expect(isValidPuzzleWord('COVENANT')).toBe(true);
    expect(isValidPuzzleWord('JOY')).toBe(false);
    expect(isValidPuzzleWord('SANCTIFYING')).toBe(false);
    expect(isValidPuzzleWord('GOOD-NEWS')).toBe(false);
  });
});
