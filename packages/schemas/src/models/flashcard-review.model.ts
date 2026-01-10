import { z } from 'zod';
import { ReviewQuality, FlashcardState } from './flashcard.model';

/**
 * Lịch sử review của mỗi card - cho analytics và SRS tracking
 */
export const flashcardReviewSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    flashcardId: z.string().uuid(),
    sessionId: z.string().uuid().optional(),
    deckId: z.string().uuid(),
    
    // Review result
    quality: z.nativeEnum(ReviewQuality), // 0=Again, 1=Hard, 2=Good, 3-4=Easy
    timeSpent: z.number().default(0), // milliseconds
    
    // SRS calculation (before review)
    previousInterval: z.number().optional(),
    previousEaseFactor: z.number().optional(),
    previousState: z.nativeEnum(FlashcardState).optional(),
    
    // SRS calculation (after review)
    newInterval: z.number().optional(),
    newEaseFactor: z.number().optional(),
    newState: z.nativeEnum(FlashcardState).optional(),
    newNextReviewDate: z.date().optional(),
    
    // Review metadata
    reviewDate: z.date(),
    userAnswer: z.string().optional(),
    
    // Analytics
    deviceType: z.string().optional(),
    reviewDuration: z.number().optional(), // seconds
    
    createdAt: z.date(),
});

export type FlashcardReview = z.infer<typeof flashcardReviewSchema>;

