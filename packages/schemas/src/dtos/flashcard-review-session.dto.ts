import { z } from 'zod';

/**
 * DTOs for Flashcard Review Session Operations
 */

// Start a review session
export const startReviewSessionDTOSchema = z.object({
  deckId: z.string().uuid(),
  studyMode: z.enum(['normal', 'cram']).optional().default('normal'),
  deviceType: z.string().optional(),
});

export type StartReviewSessionDTO = z.infer<typeof startReviewSessionDTOSchema>;

// Complete a review session
export const completeReviewSessionDTOSchema = z.object({
  sessionId: z.string().uuid(),
  completedAt: z.date().optional(),
});

export type CompleteReviewSessionDTO = z.infer<typeof completeReviewSessionDTOSchema>;

// Review session response
export const reviewSessionResponseDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deckId: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  durationSeconds: z.number(),
  
  // Statistics
  totalCards: z.number(),
  newCards: z.number(),
  learningCards: z.number(),
  reviewCards: z.number(),
  
  correctCount: z.number(),
  incorrectCount: z.number(),
  hardCount: z.number(),
  easyCount: z.number(),
  
  // Performance
  averageResponseTime: z.number(),
  masteryScore: z.number().nullable(),
  
  // Metadata
  deviceType: z.string().nullable(),
  studyMode: z.string().nullable(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ReviewSessionResponseDTO = z.infer<typeof reviewSessionResponseDTOSchema>;

// Get user progress for a flashcard
export const getUserProgressDTOSchema = z.object({
  flashcardId: z.string().uuid(),
});

export type GetUserProgressDTO = z.infer<typeof getUserProgressDTOSchema>;

// User progress response
export const userProgressResponseDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  flashcardId: z.string().uuid(),
  state: z.string(),
  currentInterval: z.number(),
  easeFactor: z.number(),
  lastReviewedAt: z.date().nullable(),
  nextReviewDate: z.date().nullable(),
  timesReviewed: z.number(),
  timesCorrect: z.number(),
  timesIncorrect: z.number(),
  consecutiveCorrect: z.number(),
  reviewedToday: z.number(),
  averageResponseTime: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProgressResponseDTO = z.infer<typeof userProgressResponseDTOSchema>;

