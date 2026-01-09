import { z } from 'zod';

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    FILL_BLANK = 'fill_blank',
    MATCHING = 'matching',
    ESSAY = 'essay',
}

export enum QuestionDifficultyLevel {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum QuestionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REVIEW = 'review',
    ARCHIVED = 'archived',
}

export enum QuestionJlptLevel {
    N5 = 'N5',
    N4 = 'N4',
    N3 = 'N3',
    N2 = 'N2',
    N1 = 'N1',
}

export enum QuestionCategory {
    VOCAB = 'vocab',
    GRAMMAR = 'grammar',
    READING = 'reading',
    LISTENING = 'listening',
}

export const questionSchema = z.object({
    id: z.string().uuid(),
    poolId: z.string().uuid().optional(),
    questionText: z.string().min(1),
    questionType: z.nativeEnum(QuestionType),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    category: z.nativeEnum(QuestionCategory).optional(),
    subcategory: z.string().optional(),
    difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
    options: z.record(z.string(), z.string()).optional(), // JSONB
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    metadata: z.record(z.any()).optional(), // JSONB - Rich content
    tags: z.array(z.string()).default([]),
    createdBy: z.string().uuid().optional(),
    status: z.nativeEnum(QuestionStatus).default(QuestionStatus.ACTIVE),
    usageCount: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Question = z.infer<typeof questionSchema>;

