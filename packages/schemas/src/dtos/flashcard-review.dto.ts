import { z } from 'zod';
import { ReviewQuality, FlashcardState } from '../models/flashcard.model';

/**
 * DTOs for Flashcard Review Operations
 */

// Submit a review
export const submitReviewDTOSchema = z.object({
  flashcardId: z.string().uuid(),
  quality: z.nativeEnum(ReviewQuality),
  timeSpent: z.number().int().min(0).optional().default(0), // milliseconds
  userAnswer: z.string().optional(),
  sessionId: z.string().uuid().optional(),
});

export type SubmitReviewDTO = z.infer<typeof submitReviewDTOSchema>;

// Review response with updated card info
export const flashcardReviewResponseDTOSchema = z.object({
  id: z.string().uuid(),
  flashcardId: z.string().uuid(),
  userId: z.string().uuid(),
  quality: z.nativeEnum(ReviewQuality),
  timeSpent: z.number(),
  
  // Previous values
  previousInterval: z.number().nullable(),
  previousEaseFactor: z.number().nullable(),
  previousState: z.nativeEnum(FlashcardState).nullable(),
  
  // New values
  newInterval: z.number(),
  newEaseFactor: z.number(),
  newState: z.nativeEnum(FlashcardState),
  newNextReviewDate: z.date(),
  
  // Updated user progress
  updatedProgress: z.object({
    timesReviewed: z.number(),
    timesCorrect: z.number(),
    timesIncorrect: z.number(),
    consecutiveCorrect: z.number(),
  }),
  
  createdAt: z.date(),
});

export type FlashcardReviewResponseDTO = z.infer<typeof flashcardReviewResponseDTOSchema>;

// Get cards due for review
export const getCardsDueDTOSchema = z.object({
  deckId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  state: z.nativeEnum(FlashcardState).optional(),
  includeNew: z.boolean().optional().default(true),
});

export type GetCardsDueDTO = z.infer<typeof getCardsDueDTOSchema>;

// Card due for review response
export const cardDueResponseDTOSchema = z.object({
  flashcard: z.any(), // FlashcardResponseDTO
  userProgress: z.object({
    state: z.nativeEnum(FlashcardState),
    currentInterval: z.number(),
    easeFactor: z.number(),
    nextReviewDate: z.date().nullable(),
    timesReviewed: z.number(),
    timesCorrect: z.number(),
  }),
  isDue: z.boolean(),
});

export type CardDueResponseDTO = z.infer<typeof cardDueResponseDTOSchema>;

