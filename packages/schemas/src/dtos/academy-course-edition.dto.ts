import { z } from 'zod';

export const academyCourseEditionCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  editionTag: z.string().min(1).max(50),
  status: z.string().max(20).optional(),
  syllabusSnapshot: z.unknown().optional(),
  changelog: z.string().optional(),
});
export type AcademyCourseEditionCreateDTO = z.infer<
  typeof academyCourseEditionCreateDTOSchema
>;

export const academyCourseEditionUpdateDTOSchema = z.object({
  editionTag: z.string().max(50).optional(),
  isCurrent: z.boolean().optional(),
  status: z.string().max(20).optional(),
  syllabusSnapshot: z.unknown().optional(),
  changelog: z.string().optional(),
});
export type AcademyCourseEditionUpdateDTO = z.infer<
  typeof academyCourseEditionUpdateDTOSchema
>;

export const academyCourseEditionQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  isCurrent: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
});
export type AcademyCourseEditionQueryDTO = z.infer<
  typeof academyCourseEditionQueryDTOSchema
>;

