import { z } from 'zod';
import { FlashcardDifficulty, flashcardSchema } from '../models/flashcard.model';
import { paginatedResponseSchema } from './common.dto';

export const flashcardCreateDTOSchema = flashcardSchema.pick({
    deckId: true,
    frontText: true,
    backText: true,
    exampleSentence: true,
    pronunciation: true,
    imageUrl: true,
    audioUrl: true,
    tags: true,
    difficulty: true,
}).partial({
    exampleSentence: true,
    pronunciation: true,
    imageUrl: true,
    audioUrl: true,
    tags: true,
    difficulty: true,
});

export type FlashcardCreateDTO = z.infer<typeof flashcardCreateDTOSchema>;

export const flashcardUpdateDTOSchema = flashcardCreateDTOSchema.partial().extend({
    id: z.string().uuid(),
});

export type FlashcardUpdateDTO = z.infer<typeof flashcardUpdateDTOSchema>;

export const flashcardQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    deckId: z.string().uuid().optional(),
    search: z.string().optional(),
    difficulty: z.nativeEnum(FlashcardDifficulty).optional(),
    tags: z.array(z.string()).optional(),
    jlptLevel: z.string().optional(),
    dueForReview: z.coerce.boolean().optional(),
    userId: z.string().uuid().optional(),
});

export type FlashcardQueryDTO = z.infer<typeof flashcardQueryDTOSchema>;

export const flashcardResponseDTOSchema = flashcardSchema;

export type FlashcardResponseDTO = z.infer<typeof flashcardResponseDTOSchema>;

export const flashcardPaginatedResponseSchema = paginatedResponseSchema(flashcardResponseDTOSchema);

export type FlashcardPaginatedResponse = z.infer<typeof flashcardPaginatedResponseSchema>;

export const bulkFlashcardOperationsDTOSchema = z.object({
    create: z.array(flashcardCreateDTOSchema).optional(),
    update: z.array(flashcardUpdateDTOSchema).optional(),
    delete: z.array(z.string().uuid()).optional(),
});

export type BulkFlashcardOperationsDTO = z.infer<typeof bulkFlashcardOperationsDTOSchema>;

export const bulkFlashcardOperationsResponseDTOSchema = z.object({
    successCount: z.number(),
    failedCount: z.number(),
    errorMessages: z.array(z.string()),
});

export type BulkFlashcardOperationsResponseDTO = z.infer<typeof bulkFlashcardOperationsResponseDTOSchema>;
