import { z } from 'zod';
import { AcademyQuestionType, AcademyQuestionReviewStatus } from '../enums/academy.enum';

export const academyQuestionOptionSchema = z.object({
  id: z.string().uuid().optional(),
  optionKey: z.string().min(1).max(10), // A, B, C, D...
  content: z.string().min(1),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().min(0),
});

export type AcademyQuestionOptionDTO = z.infer<typeof academyQuestionOptionSchema>;

export const academyQuestionCreateDTOSchema = z.object({
  questionType: z.nativeEnum(AcademyQuestionType),
  stem: z.string().min(1),
  explanation: z.string().optional(),
  difficulty: z.string().max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
  options: z.array(academyQuestionOptionSchema).optional(),
  categoryIds: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional(),
  mediaUrl: z.string().url().optional().or(z.string().length(0)).or(z.string().nullish()),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
});
export type AcademyQuestionCreateDTO = z.infer<
  typeof academyQuestionCreateDTOSchema
>;

export const academyQuestionUpdateDTOSchema = z.object({
  questionType: z.nativeEnum(AcademyQuestionType).optional(),
  stem: z.string().min(1).optional(),
  explanation: z.string().optional(),
  difficulty: z.string().max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
  options: z.array(academyQuestionOptionSchema).optional(),
  categoryIds: z.array(z.string()).optional(),
  reviewStatus: z.nativeEnum(AcademyQuestionReviewStatus).optional(),
  reviewNote: z.string().optional(),
  parentId: z.string().uuid().optional(),
  mediaUrl: z.string().url().optional().or(z.string().length(0)).or(z.string().nullish()),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
});
export type AcademyQuestionUpdateDTO = z.infer<
  typeof academyQuestionUpdateDTOSchema
>;

export const academyQuestionQueryDTOSchema = z.object({
  questionType: z.nativeEnum(AcademyQuestionType).optional(),
  difficulty: z.string().optional(),
  categoryId: z.string().optional(),
  reviewStatus: z.nativeEnum(AcademyQuestionReviewStatus).optional(),
  q: z.string().optional(),
  parentId: z.string().uuid().optional(),
});
export type AcademyQuestionQueryDTO = z.infer<
  typeof academyQuestionQueryDTOSchema
>;

export const academyQuestionCategorySchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
});
export type AcademyQuestionCategoryDTO = z.infer<typeof academyQuestionCategorySchema>;
