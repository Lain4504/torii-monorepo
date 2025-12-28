import { z } from 'zod';

export enum FlashcardDifficulty {
    DIFFICULTY_UNSPECIFIED = 0,
    EASY = 1,
    MEDIUM = 2,
    HARD = 3,
}

export const flashcardSchema = z.object({
    id: z.string().uuid(),
    deckId: z.string().uuid(),
    frontText: z.string().min(1),
    backText: z.string().min(1),
    exampleSentence: z.string().optional(),
    pronunciation: z.string().optional(),
    imageUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.nativeEnum(FlashcardDifficulty).default(FlashcardDifficulty.DIFFICULTY_UNSPECIFIED),
    nextReviewDate: z.date().optional(),
    intervalDays: z.number().default(0),
    easeFactor: z.number().default(2.5),
    reviewCount: z.number().default(0),
    correctCount: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Flashcard = z.infer<typeof flashcardSchema>;
