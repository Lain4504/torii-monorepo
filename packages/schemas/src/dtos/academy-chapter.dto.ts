import { z } from 'zod';

export const academyChapterCreateDTOSchema = z.object({
  courseEditionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0),
  estimatedMinutes: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
});
export type AcademyChapterCreateDTO = z.infer<typeof academyChapterCreateDTOSchema>;

export const academyChapterUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
});
export type AcademyChapterUpdateDTO = z.infer<typeof academyChapterUpdateDTOSchema>;

export const academyChapterQueryDTOSchema = z.object({
  courseEditionId: z.string().uuid().optional(),
});
export type AcademyChapterQueryDTO = z.infer<typeof academyChapterQueryDTOSchema>;

