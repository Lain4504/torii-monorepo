import { z } from 'zod';
import {
    questionSchema,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    QuestionCategory,
} from '../models/question.model';

export const questionCreateDTOSchema = questionSchema
    .pick({
        questionText: true,
        questionType: true,
        jlptLevel: true,
        category: true,
        subcategory: true,
        difficulty: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        metadata: true,
        tags: true,
        poolId: true,
        createdBy: true,
    })
    .extend({
        tags: z.array(z.string()).optional(),
        questionType: z.nativeEnum(QuestionType),
        jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
        category: z.nativeEnum(QuestionCategory).optional(),
        difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
        metadata: z.record(z.any()).optional(),
        poolId: z.string().uuid().optional(),
    });

export type QuestionCreateDTO = z.infer<typeof questionCreateDTOSchema>;

export const questionUpdateDTOSchema = questionSchema
    .pick({
        questionText: true,
        questionType: true,
        jlptLevel: true,
        category: true,
        subcategory: true,
        difficulty: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        metadata: true,
        tags: true,
        status: true,
        poolId: true,
    })
    .partial();

export type QuestionUpdateDTO = z.infer<typeof questionUpdateDTOSchema>;

export const questionQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    questionType: z.nativeEnum(QuestionType).optional(),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
    category: z.nativeEnum(QuestionCategory).optional(),
    poolId: z.string().uuid().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(QuestionStatus).optional(),
    tags: z.array(z.string()).optional(),
});

export type QuestionQueryDTO = z.infer<typeof questionQueryDTOSchema>;

export const questionResponseDTOSchema = questionSchema;

export type QuestionResponseDTO = z.infer<typeof questionResponseDTOSchema>;

