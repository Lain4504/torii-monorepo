import { z } from 'zod';

export const academyQuizTemplateCreateDTOSchema = z.object({
    courseProfileId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    questionPoolId: z.string().uuid().optional(),
    defaultTimeLimitMinutes: z.number().int().min(0).optional(),
    defaultMaxAttempts: z.number().int().min(1).default(1),
    defaultPassingScorePercent: z.number().min(0).max(100).optional(),
    settings: z.unknown().optional(),
});
export type AcademyQuizTemplateCreateDTO = z.infer<
    typeof academyQuizTemplateCreateDTOSchema
>;

export const academyQuizTemplateUpdateDTOSchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().optional(),
    questionPoolId: z.string().uuid().optional(),
    defaultTimeLimitMinutes: z.number().int().min(0).optional(),
    defaultMaxAttempts: z.number().int().min(1).optional(),
    defaultPassingScorePercent: z.number().min(0).max(100).optional(),
    settings: z.unknown().optional(),
});
export type AcademyQuizTemplateUpdateDTO = z.infer<
    typeof academyQuizTemplateUpdateDTOSchema
>;

export const academyQuizTemplateQueryDTOSchema = z.object({
    courseProfileId: z.string().uuid().optional(),
});
export type AcademyQuizTemplateQueryDTO = z.infer<
    typeof academyQuizTemplateQueryDTOSchema
>;
