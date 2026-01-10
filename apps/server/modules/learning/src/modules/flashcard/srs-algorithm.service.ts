import { Injectable, Logger } from '@nestjs/common';
import { FlashcardState, ReviewQuality } from '@workspace/schemas';

/**
 * SM-2 Spaced Repetition Algorithm Implementation (Anki-like)
 * Based on SuperMemo 2 algorithm
 */
export interface SrsCalculationResult {
  newInterval: number;
  newEaseFactor: number;
  newState: FlashcardState;
  newNextReviewDate: Date;
}

export interface SrsConfig {
  easyBonus?: number; // Default: 1.3
  intervalModifier?: number; // Default: 1.0
  maximumInterval?: number; // Default: 36500 (~100 years)
}

@Injectable()
export class SrsAlgorithmService {
  private readonly logger = new Logger(SrsAlgorithmService.name);

  // Default SRS configuration
  private readonly DEFAULT_CONFIG: Required<SrsConfig> = {
    easyBonus: 1.3,
    intervalModifier: 1.0,
    maximumInterval: 36500,
  };

  /**
   * Calculate next review based on SM-2 algorithm
   * @param currentInterval Current interval in days
   * @param easeFactor Current ease factor
   * @param quality Review quality (0=Again, 1=Hard, 2=Good, 3-4=Easy)
   * @param currentState Current card state
   * @param config SRS configuration
   */
  calculateNextReview(
    currentInterval: number,
    easeFactor: number,
    quality: ReviewQuality,
    currentState: FlashcardState,
    config: SrsConfig = {},
  ): SrsCalculationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    let newInterval: number;
    let newEaseFactor: number;
    let newState: FlashcardState;

    // Update ease factor based on quality
    newEaseFactor = this.updateEaseFactor(easeFactor, quality);

    // Quality 0: Again (incorrect) - reset card
    if (quality === ReviewQuality.ZERO) {
      newInterval = 0; // Review immediately next time (after learning steps)
      newState = FlashcardState.RELEARNING;

      // Reset ease factor if it goes too low (but don't go below 1.3)
      if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
      }
    }
    // Quality 1: Hard
    else if (quality === ReviewQuality.ONE) {
      // Decrease interval by 15%
      newInterval = Math.max(1, Math.floor(currentInterval * 0.85 * finalConfig.intervalModifier));
      newState = this.determineState(newInterval, currentState, false);
    }
    // Quality 2: Good (most common)
    else if (quality === ReviewQuality.TWO) {
      if (currentInterval === 0) {
        // First review: 1 day interval
        newInterval = 1 * finalConfig.intervalModifier;
      } else if (currentInterval === 1) {
        // Second review: 6 days interval
        newInterval = 6 * finalConfig.intervalModifier;
      } else {
        // Subsequent reviews: multiply by ease factor
        newInterval = Math.floor(currentInterval * newEaseFactor * finalConfig.intervalModifier);
      }
      newState = this.determineState(newInterval, currentState, true);
    }
    // Quality 3-4: Easy
    else {
      // Increase interval significantly
      if (currentInterval === 0) {
        newInterval = 4 * finalConfig.intervalModifier;
      } else {
        newInterval = Math.floor(
          currentInterval * newEaseFactor * finalConfig.easyBonus * finalConfig.intervalModifier,
        );
      }
      newState = FlashcardState.REVIEW;
    }

    // Cap maximum interval
    newInterval = Math.min(newInterval, finalConfig.maximumInterval);

    // Calculate next review date
    const newNextReviewDate = new Date();
    newNextReviewDate.setDate(newNextReviewDate.getDate() + newInterval);

    return {
      newInterval,
      newEaseFactor: Number(newEaseFactor.toFixed(2)),
      newState,
      newNextReviewDate,
    };
  }

  /**
   * Update ease factor based on quality
   * Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   * Where q is quality (0-4)
   */
  private updateEaseFactor(currentEase: number, quality: ReviewQuality): number {
    // Map enum to number: ZERO=0, ONE=1, TWO=2, THREE=3, FOUR=4
    const qualityMap: Record<ReviewQuality, number> = {
      [ReviewQuality.ZERO]: 0,
      [ReviewQuality.ONE]: 1,
      [ReviewQuality.TWO]: 2,
      [ReviewQuality.THREE]: 3,
      [ReviewQuality.FOUR]: 4,
    };
    const q = qualityMap[quality];
    
    // Formula from SM-2 algorithm
    const newEase = currentEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    
    // Minimum ease factor is 1.3
    return Math.max(1.3, newEase);
  }

  /**
   * Determine card state based on interval and previous state
   */
  private determineState(
    newInterval: number,
    currentState: FlashcardState,
    wasSuccessful: boolean,
  ): FlashcardState {
    // If moving from new to first review
    if (currentState === FlashcardState.NEW) {
      if (newInterval < 7) {
        return FlashcardState.LEARNING;
      }
      return FlashcardState.REVIEW;
    }

    // If in learning phase (short intervals)
    if (currentState === FlashcardState.LEARNING) {
      if (newInterval < 7) {
        return FlashcardState.LEARNING;
      }
      // Graduated to review
      return FlashcardState.REVIEW;
    }

    // If relearning (after failed review)
    if (currentState === FlashcardState.RELEARNING) {
      if (wasSuccessful) {
        if (newInterval < 7) {
          return FlashcardState.LEARNING;
        }
        return FlashcardState.REVIEW;
      }
      return FlashcardState.RELEARNING;
    }

    // Already in review state
    return FlashcardState.REVIEW;
  }

  /**
   * Get initial values for a new card
   */
  getInitialValues(): {
    state: FlashcardState;
    currentInterval: number;
    easeFactor: number;
    nextReviewDate: Date | null;
  } {
    return {
      state: FlashcardState.NEW,
      currentInterval: 0,
      easeFactor: 2.5,
      nextReviewDate: null, // Will be set on first review
    };
  }

  /**
   * Calculate mastery percentage based on review history
   */
  calculateMasteryPercentage(timesCorrect: number, timesIncorrect: number): number {
    const total = timesCorrect + timesIncorrect;
    if (total === 0) return 0;

    return Math.round((timesCorrect / total) * 100);
  }

  /**
   * Check if card is due for review
   */
  isDue(nextReviewDate: Date | null, includeToday: boolean = true): boolean {
    if (!nextReviewDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewDate = new Date(nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);

    if (includeToday) {
      return reviewDate <= today;
    }
    return reviewDate < today;
  }
}

