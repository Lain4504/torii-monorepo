import { z } from 'zod';

export const academyQuestionCreateDTOSchema = z.object({
  parentId: z.string().uuid().optional(),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  questionType: z.string().min(1).max(30),
  options: z.unknown().optional(),
  correctAnswer: z.unknown().optional(),
  explanation: z.string().optional(),
  level: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  metadata: z.unknown().optional(),
});
export type AcademyQuestionCreateDTO = z.infer<
  typeof academyQuestionCreateDTOSchema
>;

export const academyQuestionUpdateDTOSchema = z.object({
  content: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  questionType: z.string().max(30).optional(),
  options: z.unknown().optional(),
  correctAnswer: z.unknown().optional(),
  explanation: z.string().optional(),
  level: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  metadata: z.unknown().optional(),
});
export type AcademyQuestionUpdateDTO = z.infer<
  typeof academyQuestionUpdateDTOSchema
>;

export const academyQuestionQueryDTOSchema = z.object({
  parentId: z.string().uuid().optional(),
  questionType: z.string().optional(),
  q: z.string().optional(),
  level: z.string().optional(),
  category: z.string().optional(),
});
export type AcademyQuestionQueryDTO = z.infer<
  typeof academyQuestionQueryDTOSchema
>;
