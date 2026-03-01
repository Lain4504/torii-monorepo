import { z } from 'zod';
import { QuestionJlptLevel } from './question.model';

export const questionPoolSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    courseMasterId: z.string().uuid().optional(),
    lessonId: z.string().uuid().optional(),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type QuestionPool = z.infer<typeof questionPoolSchema>;

