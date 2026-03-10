import { z } from 'zod';

export const academyLessonSchema = z.object({
  id: z.string().uuid(),
  courseProfileId: z.string().uuid(),
  title: z.string().max(255),
  contentType: z.string().max(50),
  contentUrl: z.string().optional().nullable(),
  contentBody: z.string().optional().nullable(),
  attachments: z.any().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AcademyLesson = z.infer<typeof academyLessonSchema>;
export type AcademyLessonModel = AcademyLesson;


export const academyLessonCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  title: z.string().max(255),
  contentType: z.string().max(50),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
  description: z.string().optional(),
});

export type AcademyLessonCreateDTO = z.infer<typeof academyLessonCreateDTOSchema>;

export const academyLessonUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  contentType: z.string().max(50).optional(),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
  description: z.string().optional(),
});

export type AcademyLessonUpdateDTO = z.infer<typeof academyLessonUpdateDTOSchema>;

export const academyLessonQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  q: z.string().optional(),
});

export type AcademyLessonQueryDTO = z.infer<typeof academyLessonQueryDTOSchema>;
