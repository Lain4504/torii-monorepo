import { z } from 'zod';

/**
 * Track mỗi session học flashcard - cho analytics
 */
export const flashcardReviewSessionSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    deckId: z.string().uuid(),
    
    // Session tracking
    startedAt: z.date(),
    completedAt: z.date().optional(),
    durationSeconds: z.number().default(0),
    
    // Statistics
    totalCards: z.number().default(0),
    newCards: z.number().default(0),
    learningCards: z.number().default(0),
    reviewCards: z.number().default(0),
    
    correctCount: z.number().default(0),
    incorrectCount: z.number().default(0),
    hardCount: z.number().default(0),
    easyCount: z.number().default(0),
    
    // Performance
    averageResponseTime: z.number().default(0), // milliseconds
    masteryScore: z.number().min(0).max(100).optional(), // Percentage correct
    
    // Metadata
    deviceType: z.string().optional(),
    studyMode: z.string().optional(), // normal, cram, etc.
    
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type FlashcardReviewSession = z.infer<typeof flashcardReviewSessionSchema>;

