import { z } from 'zod';

export const academyLessonSchema = z.object({
  id: z.string().uuid(),
  courseProfileId: z.string().uuid(),
  title: z.string().max(255),
  contentType: z.string().max(50),
  contentUrl: z.string().optional().nullable(),
  contentBody: z.string().optional().nullable(),
  attachments: z.any().optional().nullable(),
  metadata: z.any().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AcademyLesson = z.infer<typeof academyLessonSchema>;

export const academyLessonCreateSchema = z.object({
  courseProfileId: z.string().uuid(),
  title: z.string().max(255),
  contentType: z.string().max(50),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
  metadata: z.any().optional(),
});

export type AcademyLessonCreateDto = z.infer<typeof academyLessonCreateSchema>;

export const academyLessonUpdateSchema = z.object({
  title: z.string().max(255).optional(),
  contentType: z.string().max(50).optional(),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
  metadata: z.any().optional(),
});

export type AcademyLessonUpdateDto = z.infer<typeof academyLessonUpdateSchema>;

export const academyLessonQuerySchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  q: z.string().optional(),
});

export type AcademyLessonQueryDto = z.infer<typeof academyLessonQuerySchema>;
