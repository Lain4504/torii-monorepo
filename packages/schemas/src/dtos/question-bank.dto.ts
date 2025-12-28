import { z } from 'zod';
import { questionBankSchema, QuestionType, QuestionJlptLevel, QuestionDifficultyLevel, QuestionStatus } from '../models/question-bank.model';

export const questionBankCreateDTOSchema = questionBankSchema
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
        tags: true,
        createdBy: true,
    })
    .extend({
        tags: z.array(z.string()).optional(),
        questionType: z.nativeEnum(QuestionType),
        jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
        difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
    });

export type QuestionBankCreateDTO = z.infer<typeof questionBankCreateDTOSchema>;

export const questionBankUpdateDTOSchema = questionBankSchema
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
        tags: true,
        status: true,
    })
    .partial();

export type QuestionBankUpdateDTO = z.infer<typeof questionBankUpdateDTOSchema>;

export const questionBankQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    questionType: z.nativeEnum(QuestionType).optional(),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(QuestionStatus).optional(),
    tags: z.array(z.string()).optional(),
});

export type QuestionBankQueryDTO = z.infer<typeof questionBankQueryDTOSchema>;

export const questionBankResponseDTOSchema = questionBankSchema;

export type QuestionBankResponseDTO = z.infer<typeof questionBankResponseDTOSchema>;
