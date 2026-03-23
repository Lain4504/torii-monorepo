import { z } from 'zod';

export const academyCourseEditionCreateDTOSchema = z.object({
  key: z.string().min(1).max(50),
  title: z.string().max(255).optional(),
  level: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export type AcademyCourseEditionCreateDTO = z.infer<
  typeof academyCourseEditionCreateDTOSchema
>;

export const academyCourseEditionUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  level: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export type AcademyCourseEditionUpdateDTO = z.infer<
  typeof academyCourseEditionUpdateDTOSchema
>;

export const academyCourseEditionQueryDTOSchema = z.object({
  q: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AcademyCourseEditionQueryDTO = z.infer<
  typeof academyCourseEditionQueryDTOSchema
>;

export const academyCourseEditionModelSchema = z.object({
  id: z.string().uuid(),
  key: z.string().max(50),
  title: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AcademyCourseEditionModel = z.infer<
  typeof academyCourseEditionModelSchema
>;

