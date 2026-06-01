export type TileScore = 'correct' | 'present' | 'absent';

export function normalizeGuess(value: string): string {
  return value.replace(/[^a-z]/gi, '').toUpperCase();
}

export function isValidPuzzleWord(word: string): boolean {
  const normalized = normalizeGuess(word);
  return normalized === word.toUpperCase() && normalized.length >= 5 && normalized.length <= 8;
}

export function scoreGuess(answer: string, guess: string): TileScore[] {
  const normalizedAnswer = normalizeGuess(answer);
  const normalizedGuess = normalizeGuess(guess);

  if (normalizedAnswer.length !== normalizedGuess.length) {
    throw new Error('Guess must be the same length as the answer');
  }

  const scores: TileScore[] = Array(normalizedGuess.length).fill('absent');
  const remainingAnswerLetters: Record<string, number> = {};

  for (let index = 0; index < normalizedAnswer.length; index += 1) {
    const answerLetter = normalizedAnswer[index];
    const guessLetter = normalizedGuess[index];

    if (answerLetter === guessLetter) {
      scores[index] = 'correct';
    } else {
      remainingAnswerLetters[answerLetter] = (remainingAnswerLetters[answerLetter] ?? 0) + 1;
    }
  }

  for (let index = 0; index < normalizedGuess.length; index += 1) {
    if (scores[index] === 'correct') {
      continue;
    }

    const guessLetter = normalizedGuess[index];
    if ((remainingAnswerLetters[guessLetter] ?? 0) > 0) {
      scores[index] = 'present';
      remainingAnswerLetters[guessLetter] -= 1;
    }
  }

  return scores;
}
