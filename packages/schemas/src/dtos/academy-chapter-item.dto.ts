import { z } from 'zod';

export const academyChapterItemCreateDTOSchema = z.object({
  chapterId: z.string().uuid(),
  title: z.string().min(1).max(255),
  kind: z.string().min(1).max(50),
  referenceId: z.string().uuid(),
  orderIndex: z.number().int().min(0),
  metadata: z.unknown().optional(),
});
export type AcademyChapterItemCreateDTO = z.infer<
  typeof academyChapterItemCreateDTOSchema
>;

export const academyChapterItemUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  orderIndex: z.number().int().min(0).optional(),
  metadata: z.unknown().optional(),
});
export type AcademyChapterItemUpdateDTO = z.infer<
  typeof academyChapterItemUpdateDTOSchema
>;

export const academyChapterItemQueryDTOSchema = z.object({
  chapterId: z.string().uuid().optional(),
});
export type AcademyChapterItemQueryDTO = z.infer<
  typeof academyChapterItemQueryDTOSchema
>;

