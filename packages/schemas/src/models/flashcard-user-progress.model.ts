import { z } from 'zod';
import { FlashcardState } from './flashcard.model';

/**
 * Per-user progress tracking cho mỗi flashcard
 * Quan trọng: SRS algorithm cần track per-user, không phải global
 */
export const flashcardUserProgressSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    flashcardId: z.string().uuid(),
    
    // Card State (Anki-like)
    state: z.nativeEnum(FlashcardState).default(FlashcardState.NEW),
    
    // SRS Algorithm fields (per-user)
    currentInterval: z.number().default(0), // Days until next review
    easeFactor: z.number().default(2.50), // Personal ease factor
    lastReviewedAt: z.date().optional(),
    nextReviewDate: z.date().optional(),
    
    // Review statistics (per-user)
    timesReviewed: z.number().default(0),
    timesCorrect: z.number().default(0),
    timesIncorrect: z.number().default(0),
    consecutiveCorrect: z.number().default(0), // Streak
    
    // Daily limits
    reviewedToday: z.number().default(0),
    lastReviewDate: z.date().optional(),
    
    // Performance metrics
    averageResponseTime: z.number().default(0), // milliseconds
    lastResponseTime: z.number().optional(),
    
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type FlashcardUserProgress = z.infer<typeof flashcardUserProgressSchema>;

