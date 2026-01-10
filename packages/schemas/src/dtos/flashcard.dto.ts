import { z } from 'zod';
import { 
    FlashcardDifficulty, 
    flashcardSchema,
    FlashcardGenerationMethod,
    JapanesePartOfSpeech,
} from '../models/flashcard.model';

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
    // Japanese-specific fields
    furigana: true,
    kanji: true,
    partOfSpeech: true,
    wordJlptLevel: true,
    meanings: true,
    // AI Integration fields
    aiGenerated: true,
    sourceDocumentId: true,
    generationMethod: true,
    generationMetadata: true,
    // Metadata
    notes: true,
    isArchived: true,
}).partial({
    exampleSentence: true,
    pronunciation: true,
    imageUrl: true,
    audioUrl: true,
    tags: true,
    difficulty: true,
    // Optional fields
    furigana: true,
    kanji: true,
    partOfSpeech: true,
    wordJlptLevel: true,
    meanings: true,
    aiGenerated: true,
    sourceDocumentId: true,
    generationMethod: true,
    generationMetadata: true,
    notes: true,
    isArchived: true,
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
    isArchived: z.coerce.boolean().optional(),
});

export type FlashcardQueryDTO = z.infer<typeof flashcardQueryDTOSchema>;

export const flashcardResponseDTOSchema = flashcardSchema;

export type FlashcardResponseDTO = z.infer<typeof flashcardResponseDTOSchema>;


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
