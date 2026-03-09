import { z } from 'zod';

export const academyClassAssessmentCreateDTOSchema = z.object({
  classId: z.string().uuid(),
  kind: z.string().min(1).max(20),
  quizTemplateId: z.string().uuid().optional(),
  assignmentTemplateId: z.string().uuid().optional(),
  titleOverride: z.string().max(255).optional(),
  deadline: z.coerce.date().optional(),
  weight: z.number().min(0).optional(),
  maxAttemptsOverride: z.number().int().min(0).optional(),
  timeLimitOverrideMinutes: z.number().int().min(0).optional(),
  maxScoreOverride: z.number().min(0).optional(),
  settings: z.unknown().optional(),
  status: z.string().max(20).optional(),
});
export type AcademyClassAssessmentCreateDTO = z.infer<
  typeof academyClassAssessmentCreateDTOSchema
>;

export const academyClassAssessmentUpdateDTOSchema = z.object({
  titleOverride: z.string().max(255).optional(),
  deadline: z.coerce.date().optional(),
  weight: z.number().min(0).optional(),
  maxAttemptsOverride: z.number().int().min(0).optional(),
  timeLimitOverrideMinutes: z.number().int().min(0).optional(),
  maxScoreOverride: z.number().min(0).optional(),
  settings: z.unknown().optional(),
  status: z.string().max(20).optional(),
});
export type AcademyClassAssessmentUpdateDTO = z.infer<
  typeof academyClassAssessmentUpdateDTOSchema
>;

export const academyClassAssessmentQueryDTOSchema = z.object({
  classId: z.string().uuid().optional(),
});
export type AcademyClassAssessmentQueryDTO = z.infer<
  typeof academyClassAssessmentQueryDTOSchema
>;

export const academyClassAssessmentAttemptQueryDTOSchema = z.object({
  status: z.string().max(20).optional(),
  userId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  latestOnly: z.coerce.boolean().optional(),
});
export type AcademyClassAssessmentAttemptQueryDTO = z.infer<
  typeof academyClassAssessmentAttemptQueryDTOSchema
>;

