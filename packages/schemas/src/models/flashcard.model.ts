import { z } from 'zod';

// Enums matching Prisma schema
export enum FlashcardDifficulty {
    DIFFICULTY_UNSPECIFIED = 0,
    EASY = 1,
    MEDIUM = 2,
    HARD = 3,
}

export enum FlashcardState {
    NEW = 'new',
    LEARNING = 'learning',
    REVIEW = 'review',
    RELEARNING = 'relearning',
}

export enum FlashcardGenerationMethod {
    MANUAL = 'manual',
    AI_AUTO = 'ai_auto',
    AI_ASSISTED = 'ai_assisted',
    IMPORT = 'import',
}

export enum JapanesePartOfSpeech {
    NOUN = 'noun',
    VERB_ICHIDAN = 'verb_ichidan',
    VERB_GODAN = 'verb_godan',
    VERB_SURU = 'verb_suru',
    VERB_KURU = 'verb_kuru',
    ADJECTIVE_I = 'adjective_i',
    ADJECTIVE_NA = 'adjective_na',
    ADVERB = 'adverb',
    PARTICLE = 'particle',
    CONJUNCTION = 'conjunction',
    INTERJECTION = 'interjection',
    PRONOUN = 'pronoun',
    NUMBER = 'number',
    OTHER = 'other',
}

export enum ReviewQuality {
    ZERO = '0',   // Again (incorrect)
    ONE = '1',    // Hard
    TWO = '2',    // Good
    THREE = '3',  // Easy
    FOUR = '4',   // Easy+
}

// Main flashcard schema with all new fields
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
    
    // Japanese-specific fields
    furigana: z.string().optional(),
    kanji: z.string().optional(),
    partOfSpeech: z.nativeEnum(JapanesePartOfSpeech).optional(),
    wordJlptLevel: z.string().optional(),
    meanings: z.array(z.object({
        meaning: z.string(),
        examples: z.array(z.string()).default([]),
    })).default([]),
    
    // AI Integration fields
    aiGenerated: z.boolean().default(false),
    sourceDocumentId: z.string().uuid().optional(),
    generationMethod: z.nativeEnum(FlashcardGenerationMethod).default(FlashcardGenerationMethod.MANUAL),
    generationMetadata: z.record(z.any()).default({}),
    
    // SRS fields (global - for compatibility)
    nextReviewDate: z.date().optional(),
    intervalDays: z.number().default(0),
    easeFactor: z.number().default(2.5),
    reviewCount: z.number().default(0),
    correctCount: z.number().default(0),
    lastReviewDate: z.date().optional(),
    timesStudied: z.number().default(0),
    
    // Metadata
    notes: z.string().optional(),
    isArchived: z.boolean().default(false),
    
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Flashcard = z.infer<typeof flashcardSchema>;
