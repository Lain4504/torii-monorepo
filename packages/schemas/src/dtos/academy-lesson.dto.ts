import { z } from 'zod';

export const academyLessonSchema = z.object({
  id: z.string().uuid(),
  syllabusId: z.string().uuid(),
  title: z.string().max(255),
  orderIndex: z.number(),
  type: z.string().max(50),
  quizId: z.string().uuid().optional().nullable(),
  examId: z.string().uuid().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
  contentUrl: z.string().optional().nullable(),
  contentBody: z.string().optional().nullable(),
  attachments: z.any().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AcademyLesson = z.infer<typeof academyLessonSchema>;
export type AcademyLessonModel = AcademyLesson;

export const academyLessonCreateDTOSchema = z.object({
  syllabusId: z.string().uuid(),
  title: z.string().max(255),
  orderIndex: z.number().optional(),
  type: z.string().max(50),
  quizId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
});

export type AcademyLessonCreateDTO = z.infer<typeof academyLessonCreateDTOSchema>;

export const academyLessonUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  orderIndex: z.number().optional(),
  type: z.string().max(50).optional(),
  quizId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  contentUrl: z.string().optional(),
  contentBody: z.string().optional(),
  attachments: z.any().optional(),
});

export type AcademyLessonUpdateDTO = z.infer<typeof academyLessonUpdateDTOSchema>;

export const academyLessonQueryDTOSchema = z.object({
  syllabusId: z.string().uuid().optional(),
  q: z.string().optional(),
});

export type AcademyLessonQueryDTO = z.infer<typeof academyLessonQueryDTOSchema>;
