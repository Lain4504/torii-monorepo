import { Test, TestingModule } from '@nestjs/testing';
import { SrsAlgorithmService } from '@server/learning/modules/flashcard/srs-algorithm.service';
import { FlashcardState, ReviewQuality } from '@workspace/schemas';

describe('SrsAlgorithmService', () => {
  let service: SrsAlgorithmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SrsAlgorithmService],
    }).compile();

    service = module.get<SrsAlgorithmService>(SrsAlgorithmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateNextReview', () => {
    it('should return initial learning values for Quality 2 (Good) on a new card', () => {
      const result = service.calculateNextReview(
        0,
        2.5,
        ReviewQuality.TWO,
        FlashcardState.NEW,
      );
      expect(result.newInterval).toBe(1);
      expect(result.newState).toBe(FlashcardState.LEARNING);
    });

    it('should increase interval for Quality 2 (Good) on second review', () => {
      const result = service.calculateNextReview(
        1,
        2.5,
        ReviewQuality.TWO,
        FlashcardState.LEARNING,
      );
      expect(result.newInterval).toBe(6);
      expect(result.newState).toBe(FlashcardState.LEARNING); // Still learning if < 7 days
    });

    it('should graduate to REVIEW state when interval >= 7', () => {
      const result = service.calculateNextReview(
        6,
        2.5,
        ReviewQuality.TWO,
        FlashcardState.LEARNING,
      );
      // newEaseFactor = 2.5 - 0.32 = 2.18
      // newInterval = floor(6 * 2.18) = 13
      expect(result.newInterval).toBe(13);
      expect(result.newState).toBe(FlashcardState.REVIEW);
    });

    it('should reset interval to 0 and state to RELEARNING on Quality 0 (Again)', () => {
      const result = service.calculateNextReview(
        10,
        2.5,
        ReviewQuality.ZERO,
        FlashcardState.REVIEW,
      );
      expect(result.newInterval).toBe(0);
      expect(result.newState).toBe(FlashcardState.RELEARNING);
    });

    it('should use easyBonus for Quality 3 or 4 (Easy)', () => {
      const result = service.calculateNextReview(
        10,
        2.5,
        ReviewQuality.THREE,
        FlashcardState.REVIEW,
      );
      // newEaseFactor = 2.5 - 0.14 = 2.36
      // newInterval = floor(10 * 2.36 * 1.3) = 30
      expect(result.newInterval).toBe(30);
    });
  });

  describe('calculateMasteryPercentage', () => {
    it('should return 100 for all correct', () => {
      expect(service.calculateMasteryPercentage(5, 0)).toBe(100);
    });

    it('should return 50 for half correct', () => {
      expect(service.calculateMasteryPercentage(5, 5)).toBe(50);
    });

    it('should return 0 for none correct or no reviews', () => {
      expect(service.calculateMasteryPercentage(0, 5)).toBe(0);
      expect(service.calculateMasteryPercentage(0, 0)).toBe(0);
    });
  });

  describe('isDue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(service.isDue(yesterday)).toBe(true);
    });

    it('should return true for today', () => {
      expect(service.isDue(new Date())).toBe(true);
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(service.isDue(tomorrow)).toBe(false);
    });
  });
});
