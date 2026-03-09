import { z } from 'zod';

export const academyCourseProfileCreateDTOSchema = z.object({
  code: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  level: z.string().max(50).optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.any().optional(),
});
export type AcademyCourseProfileCreateDTO = z.infer<
  typeof academyCourseProfileCreateDTOSchema
>;

export const academyCourseProfileUpdateDTOSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  level: z.string().max(50).optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.any().optional(),
});
export type AcademyCourseProfileUpdateDTO = z.infer<
  typeof academyCourseProfileUpdateDTOSchema
>;

export const academyCourseProfileQueryDTOSchema = z.object({
  q: z.string().optional(),
  level: z.string().optional(),
});
export type AcademyCourseProfileQueryDTO = z.infer<
  typeof academyCourseProfileQueryDTOSchema
>;

export type AcademyCourseProfileModel = any;
