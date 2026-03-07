import { z } from 'zod';

export const academyPlacementInfoResponseSchema = z.object({
  examId: z.string().uuid().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  totalQuestions: z.number(),
  timeLimitMinutes: z.number().nullable(),
  retakePolicy: z.enum(['never', 'always', 'after_days']),
  lastCompletedAttempt: z
    .object({
      attemptId: z.string().uuid(),
      completedAt: z.date(),
      assessedLevel: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  canRetake: z.boolean(),
  nextAvailableAt: z.date().nullable(),
});
export type AcademyPlacementInfoResponseDTO = z.infer<
  typeof academyPlacementInfoResponseSchema
>;

export const academyPlacementStartResponseSchema = z.object({
  attemptId: z.string().uuid(),
  status: z.string(),
  startedAt: z.date(),
  deadlineAt: z.date().nullable(),
  timeLimitSeconds: z.number().nullable(),
  questions: z.array(
    z.object({
      id: z.string().uuid(),
      content: z.string(),
      options: z.array(z.string()),
      metadata: z.object({
        jlptLevel: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
      }),
    }),
  ),
});
export type AcademyPlacementStartResponseDTO = z.infer<
  typeof academyPlacementStartResponseSchema
>;

export const academyPlacementSubmitDTOSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(z.unknown()),
});
export type AcademyPlacementSubmitDTO = z.infer<
  typeof academyPlacementSubmitDTOSchema
>;

export const academyPlacementSubmitResponseSchema = z.object({
  attemptId: z.string().uuid(),
  examId: z.string().uuid(),
  assessedLevel: z.string(),
  rawScore: z.number(),
  maxScore: z.number(),
  percentage: z.number(),
  breakdownByCategory: z.record(z.number()),
  levelPercentages: z.record(z.number()),
  overTime: z.boolean(),
});
export type AcademyPlacementSubmitResponseDTO = z.infer<
  typeof academyPlacementSubmitResponseSchema
>;

