/**
 * Simplified SM-2 spaced repetition algorithm.
 * Pure function, no dependencies.
 */

const MIN_INTERVAL = 1;
const MAX_INTERVAL = 365;
const MIN_EASE_FACTOR = 1.3;

interface ReviewResult {
  readonly nextInterval: number;
  readonly nextEaseFactor: number;
  readonly nextReviewDate: string;
}

export const calculateNextReview = (
  correct: boolean,
  currentInterval: number,
  easeFactor: number,
): ReviewResult => {
  if (correct) {
    const newInterval = currentInterval === 0
      ? 1
      : currentInterval === 1
        ? 6
        : Math.round(currentInterval * easeFactor);

    const newEase = Math.max(MIN_EASE_FACTOR, easeFactor + 0.1);

    return {
      nextInterval: Math.min(newInterval, MAX_INTERVAL),
      nextEaseFactor: newEase,
      nextReviewDate: toReviewDate(Math.min(newInterval, MAX_INTERVAL)),
    };
  }

  const newEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);

  return {
    nextInterval: MIN_INTERVAL,
    nextEaseFactor: newEase,
    nextReviewDate: toReviewDate(MIN_INTERVAL),
  };
};

const toReviewDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
