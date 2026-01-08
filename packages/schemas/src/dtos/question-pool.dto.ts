import { z } from 'zod';
import { questionPoolSchema } from '../models/question-pool.model';
import { QuestionJlptLevel } from '../models/question.model';

export const questionPoolCreateDTOSchema = questionPoolSchema
    .pick({
        name: true,
        description: true,
        courseId: true,
        lessonId: true,
        jlptLevel: true,
        createdBy: true,
    })
    .extend({
        jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    });

export type QuestionPoolCreateDTO = z.infer<typeof questionPoolCreateDTOSchema>;

export const questionPoolUpdateDTOSchema = questionPoolSchema
    .pick({
        name: true,
        description: true,
        courseId: true,
        lessonId: true,
        jlptLevel: true,
    })
    .partial();

export type QuestionPoolUpdateDTO = z.infer<typeof questionPoolUpdateDTOSchema>;

export const questionPoolQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    courseId: z.string().uuid().optional(),
    lessonId: z.string().uuid().optional(),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    search: z.string().optional(),
});

export type QuestionPoolQueryDTO = z.infer<typeof questionPoolQueryDTOSchema>;

export const questionPoolResponseDTOSchema = questionPoolSchema;

export type QuestionPoolResponseDTO = z.infer<typeof questionPoolResponseDTOSchema>;

